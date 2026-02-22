from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    UserLoginSerializer, UserProfileUpdateSerializer
)
from datetime import datetime

User = get_user_model()

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
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

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

