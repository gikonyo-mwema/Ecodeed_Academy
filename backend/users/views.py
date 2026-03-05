import uuid

import cloudinary.uploader
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime

from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    UserLoginSerializer, UserProfileUpdateSerializer
)

User = get_user_model()

# Profile picture constraints
MAX_PROFILE_PIC_SIZE = getattr(settings, "MAX_PROFILE_PICTURE_SIZE", 5 * 1024 * 1024)
ALLOWED_PROFILE_PIC_TYPES = {"jpeg", "png", "gif", "webp"}

class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class UserLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

class UserProfileUpdateView(generics.UpdateAPIView):
    """
    Update the authenticated user's profile.

    Accepts multipart/form-data. If a ``profile_picture`` file is included,
    it is validated (size, MIME content) and uploaded to Cloudinary.  The
    resulting secure URL is saved on the user model.
    """

    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    # ------------------------------------------------------------------
    def _upload_profile_picture(self, file_obj):
        """Validate and upload a profile picture to Cloudinary.

        Returns the Cloudinary secure URL on success.
        Raises ``ValueError`` with a user-facing message on failure.
        """
        # Size
        if file_obj.size > MAX_PROFILE_PIC_SIZE:
            raise ValueError(
                f"Profile picture too large. Maximum is "
                f"{MAX_PROFILE_PIC_SIZE // (1024 * 1024)} MB."
            )

        # MIME content check via Pillow
        try:
            from PIL import Image as PILImage
            file_obj.seek(0)
            img = PILImage.open(file_obj)
            img.verify()
            detected = (img.format or "").lower()
            file_obj.seek(0)
        except Exception:
            raise ValueError(
                "File content is not a valid image. "
                "Allowed: JPEG, PNG, GIF, WebP."
            )
        if detected not in ALLOWED_PROFILE_PIC_TYPES:
            raise ValueError(
                f"Unsupported image type (detected: {detected or 'unknown'}). "
                "Allowed: JPEG, PNG, GIF, WebP."
            )

        result = cloudinary.uploader.upload(
            file_obj,
            folder="ecodeed/profiles",
            resource_type="image",
            transformation=[
                {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
                {"quality": "auto:good", "fetch_format": "auto"},
            ],
            public_id=f"user_{self.request.user.pk}_{uuid.uuid4().hex[:8]}",
            overwrite=True,
        )
        return result["secure_url"]

    # ------------------------------------------------------------------
    def update(self, request, *args, **kwargs):
        # If the frontend sent a file in the 'profile_picture' field,
        # upload it to Cloudinary first, then swap the value in request.data.
        mutable_data = request.data.copy()  # QueryDict is immutable by default

        if "profile_picture" in request.FILES:
            file_obj = request.FILES["profile_picture"]
            try:
                url = self._upload_profile_picture(file_obj)
            except ValueError as exc:
                return Response(
                    {"profile_picture": [str(exc)]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Exception as exc:
                return Response(
                    {"profile_picture": [f"Upload failed: {exc}"]},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            mutable_data["profile_picture"] = url

        # Remove file entries so the serializer sees a plain string
        if "profile_picture" in request.FILES:
            del request.FILES["profile_picture"]

        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return full user profile so the frontend can update Redux state
        return Response(UserSerializer(instance).data)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            # Even if blacklist fails, we want the frontend to consider it a success for local state cleanup
            return Response({"message": "Logged out with warnings"}, status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def getUsers(self, request):
        if not request.user.is_superuser and not request.user.is_staff:
             return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
             
        start_index = int(request.query_params.get('startIndex', 0))
        limit = int(request.query_params.get('limit', 9))
        page = request.query_params.get('page')
        
        # Support page param for DashboardComponent
        if page:
             try:
                 limit_val = int(limit) if limit else 5
                 start_index = (int(page) - 1) * limit_val
             except ValueError:
                 pass

        # Sort logic
        sort = request.query_params.get('sort', 'desc')
        # Django User model usually has date_joined, not created_at
        order_field = '-date_joined' if sort == 'desc' else 'date_joined'
        
        queryset = self.queryset.order_by(order_field)
        
        total_users = queryset.count()
        
        # Pagination
        users = queryset[start_index : start_index + limit]
        
        serializer = self.get_serializer(users, many=True)
        
        # Stats
        now = datetime.now()
        last_month_users = queryset.filter(
            date_joined__year=now.year, 
            date_joined__month=now.month
        ).count()

        return Response({
            'users': serializer.data,
            'totalUsers': total_users,
            'lastMonthUsers': last_month_users
        })

    # Legacy URL: /api/users/delete/:id
    @action(detail=True, methods=['delete'])
    def deleteUser(self, request, pk=None):
        user = self.get_object()
        user.delete()
        return Response({'message': 'User deleted successfully'})

    @action(detail=True, methods=['patch'])
    def updateRole(self, request, pk=None):
        """
        Update user role/type.
        Only admins can promote users to different roles.
        
        Valid roles: READER, STUDENT, MENTOR, ADMIN
        """
        if not request.user.is_superuser and not request.user.is_staff:
            return Response({'message': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        new_role = request.data.get('user_type') or request.data.get('role')
        
        valid_roles = ['READER', 'STUDENT', 'MENTOR', 'ADMIN']
        if not new_role or new_role.upper() not in valid_roles:
            return Response(
                {'message': f'Invalid role. Must be one of: {valid_roles}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.user_type = new_role.upper()
        
        # If promoting to admin, also set is_staff
        if new_role.upper() == 'ADMIN':
            user.is_staff = True
        
        user.save()
        
        return Response({
            'message': f'User role updated to {new_role.upper()}',
            'user': UserSerializer(user).data
        })

