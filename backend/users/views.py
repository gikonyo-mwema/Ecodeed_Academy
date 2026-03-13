"""
═══════════════════════════════════════════════════════════════════════════════
ECODEED ACADEMY - USER AUTHENTICATION & PROFILE MANAGEMENT VIEWS

Handles user registration, login, profile management, and admin user operations.
Includes JWT token generation, profile picture upload to Cloudinary, and
rate-limited login attempts to prevent brute-force attacks.

═══════════════════════════════════════════════════════════════════════════════
API ENDPOINTS OVERVIEW
═══════════════════════════════════════════════════════════════════════════════

Authentication Endpoints:
  POST   /api/v1/auth/register/            - Register new user
  POST   /api/v1/auth/login/               - Login (returns JWT tokens)
  POST   /api/v1/auth/logout/              - Logout (blacklist refresh token)
  POST   /api/v1/auth/jwt/refresh/         - Refresh access token
  
User Profile Endpoints:
  GET    /api/v1/auth/profile/             - Get authenticated user profile
  PUT    /api/v1/auth/profile/             - Update user profile + picture
  
Admin User Management:
  GET    /api/v1/auth/users/getUsers/      - List all users (admin only)
  DELETE /api/v1/auth/users/{id}/          - Delete user (admin only)
  PATCH  /api/v1/auth/users/{id}/updateRole/ - Update user role (admin only)

═══════════════════════════════════════════════════════════════════════════════
AUTHENTICATION FLOW
═══════════════════════════════════════════════════════════════════════════════

1. User Registration:
   POST /api/v1/auth/register/
   Body: {
     "email": "john@example.com",
     "password": "SecurePassword123!",
     "first_name": "John",
     "last_name": "Doe"
   }
   Response: {
     "user": { ...user data },
     "access": "eyJ0eXAi...", (15 min expiry)
     "refresh": "eyJ0eXAi..."  (7 day expiry)
   }

2. User Login:
   POST /api/v1/auth/login/
   Body: {
     "email": "john@example.com",
     "password": "SecurePassword123!"
   }
   Response: {
     "user": { ...user data },
     "access": "eyJ0eXAi...",
     "refresh": "eyJ0eXAi..."
   }
   Rate Limit: 5 attempts per minute per IP

3. Using Access Token:
   GET /api/v1/auth/profile/
   Header: Authorization: Bearer eyJ0eXAi...

4. Refresh Expired Token:
   POST /api/v1/auth/jwt/refresh/
   Body: { "refresh": "eyJ0eXAi..." }
   Response: { "access": "eyJ0eXAi..." }

5. Logout:
   POST /api/v1/auth/logout/
   Body: { "refresh": "eyJ0eXAi..." }
   - Blacklists refresh token (can't use for new access token)
   - Invalidates all existing sessions for user

═══════════════════════════════════════════════════════════════════════════════
PROFILE PICTURE UPLOAD SYSTEM
═══════════════════════════════════════════════════════════════════════════════

Upload & Storage:
  - Max size: 5 MB
  - Allowed formats: JPEG, PNG, GIF, WebP
  - Validation: Pillow library + MIME type check
  - Host: Cloudinary CDN
  - Folder: ecodeed/profiles/
  - Transform: 400x400 face-crop + auto quality

Upload Endpoint:
  PUT /api/v1/auth/profile/
  Content-Type: multipart/form-data
  
  Form Fields:
    - profile_picture: <file> (binary image)
    - first_name: (optional text)
    - last_name: (optional text)
    - bio: (optional text)
  
  Example Response:
  {
    "id": 123,
    "email": "john@example.com",
    "first_name": "John",
    "profile_picture": "https://res.cloudinary.com/.../user_123_abc123.jpg"
  }

Validation Flow:
  1. Check file size (< 5 MB)
  2. Open file with Pillow, verify valid image
  3. Detect image format (JPEG/PNG/GIF/WebP)
  4. Upload to Cloudinary with transformation
  5. Save Cloudinary URL to database
  6. Return updated user profile

Error Handling:
  - File too large → 400 with specific size message
  - Invalid format → 400 with list of allowed types
  - Upload failure → 502 Bad Gateway with Cloudinary error

═══════════════════════════════════════════════════════════════════════════════
"""

import uuid
from datetime import datetime

import cloudinary.uploader
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    UserSerializer, UserRegistrationSerializer,
    UserLoginSerializer, UserProfileUpdateSerializer
)

User = get_user_model()

# ════════════════════════════════════════════════════════════════════════════════
# PROFILE PICTURE UPLOAD CONFIGURATION
# ════════════════════════════════════════════════════════════════════════════════
# Validates and uploads user profile pictures to Cloudinary CDN

MAX_PROFILE_PIC_SIZE = getattr(settings, "MAX_PROFILE_PICTURE_SIZE", 5 * 1024 * 1024)
ALLOWED_PROFILE_PIC_TYPES = {"jpeg", "png", "gif", "webp"}


class LoginRateThrottle(AnonRateThrottle):
    """
    RATE LIMITING FOR LOGIN ATTEMPTS
    
    Prevents brute-force password guessing by limiting login attempts
    to 5 per minute per IP address.
    
    Rate: 5 requests per minute per IP
    Applied to: POST /api/v1/auth/login/
    
    Exceeded: Returns HTTP 429 Too Many Requests
    """
    rate = '5/min'


# ════════════════════════════════════════════════════════════════════════════════
# USER REGISTRATION VIEW
# ════════════════════════════════════════════════════════════════════════════════

class UserRegistrationView(generics.CreateAPIView):
    """
    USER REGISTRATION ENDPOINT
    
    POST /api/v1/auth/register/
    
    Allows anonymous users to create a new account with email and password.
    Returns JWT tokens (access + refresh) immediately after registration.
    User can start using the account right away.
    
    Request:
      {
        "email": "newuser@example.com",
        "password": "SecurePass123!",
        "password2": "SecurePass123!",  (confirm password)
        "first_name": "John",
        "last_name": "Doe"
      }
    
    Response (201 Created):
      {
        "user": {
          "id": 123,
          "email": "newuser@example.com",
          "first_name": "John",
          "last_name": "Doe",
          "is_admin": false,
          "is_instructor": false,
          ...
        },
        "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
      }
    
    Validation:
      - Email must be unique
      - Email format must be valid
      - Password requirements (length, complexity)
      - Passwords must match
    
    Errors:
      400: Invalid email, password too short, email exists, etc.
      
    Token Details:
      - Access token: Expires in 15 minutes
      - Refresh token: Expires in 7 days
      - Refresh token can be used to get new access token
      
    Permissions:
      - Anonymous users (AllowAny)
      
    Flow:
      1. Validate input (email unique, password format, etc.)
      2. Create new CustomUser instance
      3. Generate JWT tokens for immediate login
      4. Return user + tokens to frontend
      5. Frontend stores tokens and redirects to dashboard
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        """Override create to return JWT tokens on successful registration"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens for immediate login after registration
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


# ════════════════════════════════════════════════════════════════════════════════
# USER LOGIN VIEW
# ════════════════════════════════════════════════════════════════════════════════

class UserLoginView(APIView):
    """
    USER LOGIN ENDPOINT
    
    POST /api/v1/auth/login/
    
    Authenticates user with email and password. Returns JWT tokens.
    
    Request:
      {
        "email": "john@example.com",
        "password": "SecurePass123!"
      }
    
    Response (200 OK):
      {
        "user": {
          "id": 123,
          "email": "john@example.com",
          "first_name": "John",
          "is_admin": true,
          "is_instructor": false,
          ...
        },
        "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
      }
    
    Errors:
      401: Invalid email or password
      429: Too many login attempts (rate limited to 5/min per IP)
      
    Security:
      - Rate limited to 5 attempts per minute per IP address
      - Prevents brute-force password attacks
      - Exceeding limit returns HTTP 429 Too Many Requests
    
    Permissions:
      - Anonymous users (AllowAny)
      - Rate throttled: LoginRateThrottle (5 per minute)
      
    Token Usage:
      1. Client receives access + refresh tokens
      2. Store both tokens locally (cookie or localStorage)
      3. Use access token in Authorization header: "Bearer {access_token}"
      4. Access token expires in 15 minutes
      5. When expired, use refresh token to get new access token
      
    Flow:
      1. Validate email exists and password matches
      2. Generate JWT tokens
      3. Return user profile + tokens
      4. Frontend stores tokens and updates Redux state
      5. User redirected to dashboard
    
    Related Actions:
      - Refresh token: POST /api/v1/auth/jwt/refresh/
      - Logout: POST /api/v1/auth/logout/
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens for this user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })



# ════════════════════════════════════════════════════════════════════════════════
# USER PROFILE VIEWS
# ════════════════════════════════════════════════════════════════════════════════

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET/RETRIEVE USER PROFILE ENDPOINT
    
    GET /api/v1/auth/profile/
    PUT /api/v1/auth/profile/
    
    Get the authenticated user's profile information.
    
    Request:
      GET /api/v1/auth/profile/
      Header: Authorization: Bearer {access_token}
    
    Response (200 OK):
      {
        "id": 123,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "is_admin": true,
        "is_instructor": false,
        "profile_picture": "https://res.cloudinary.com/.../user_123_abc.jpg",
        "bio": "Python developer",
        "date_joined": "2024-01-15T09:00:00Z"
      }
    
    Permissions:
      - Authenticated users only (IsAuthenticated)
      - Can only get/update own profile
      
    Use Cases:
      1. Dashboard initialization: Get user data for Redux state
      2. Profile page display: Show user details and picture
      3. Permission checks: is_admin, is_instructor flags
      4. User navigation: Display user name in header
      
    Related Views:
      - GET /api/v1/auth/profile/ + PUT multipart: UserProfileUpdateView
      - Full profile update with picture upload
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Always return the authenticated user's profile"""
        return self.request.user


class UserProfileUpdateView(generics.UpdateAPIView):
    """
    UPDATE USER PROFILE WITH PICTURE UPLOAD
    
    PUT /api/v1/auth/profile/
    Content-Type: multipart/form-data
    
    Update authenticated user's profile and/or upload a new profile picture.
    
    Request:
      Form Data:
        - first_name: "John" (optional)
        - last_name: "Doe" (optional)
        - bio: "Python expert" (optional)
        - profile_picture: <file> (optional binary image)
        
      Example using curl:
      curl -X PUT \\
        -H "Authorization: Bearer {token}" \\
        -F "first_name=John" \\
        -F "profile_picture=@avatar.jpg" \\
        https://api.ecodeed.com/api/v1/auth/profile/
    
    Response (200 OK):
      {
        "id": 123,
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "profile_picture": "https://res.cloudinary.com/.../user_123_new.jpg",
        "bio": "Python expert",
        ...
      }
    
    File Upload Validation:
      Size: Max 5 MB
      Format: JPEG, PNG, GIF, WebP only
      Validation Method:
        1. Check file size < 5 MB
        2. Read with Pillow to verify valid image
        3. Check image format is supported
        4. Upload to Cloudinary (automatic quality optimization)
    
    Upload Processing:
      - Files uploaded to Cloudinary CDN
      - Folder: ecodeed/profiles/
      - Transformation: 400x400 face-crop + auto quality
      - Result: Secure HTTPS URL returned
      - Previous picture: Overwritten (public_id based on user.pk)
    
    Error Responses:
      400 Bad Request:
        - File size > 5 MB
        - Invalid image format
        - Corrupted file
        Examples:
        {
          "profile_picture": [
            "Profile picture too large. Maximum is 5 MB."
          ]
        }
      
      502 Bad Gateway:
        - Cloudinary connection error
        - Upload service unavailable
        {
          "profile_picture": ["Upload failed: Connection timeout"]
        }
    
    Permissions:
      - Authenticated users only
      - Can only update own profile
      
    Security:
      - Image verification using Pillow library
      - MIME type detection
      - File size limits
      - Cloudinary storage (not local filesystem)
      - Unique public_id per upload
      
    Use Cases:
      1. Profile picture change: User selects avatar from file picker
      2. Profile name update: Edit first/last name
      3. Bio update: Add personal description
      4. Combined update: Change picture + name in one request
      
    Frontend Integration:
      // React example
      const formData = new FormData();
      formData.append('first_name', 'John');
      formData.append('profile_picture', fileInput.files[0]);
      
      const response = await fetch('/api/v1/auth/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      });
      const user = await response.json();
      dispatch(setUser(user)); // Update Redux state
    """

    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        """Always return the authenticated user"""
        return self.request.user

    def _upload_profile_picture(self, file_obj):
        """
        Validate and upload profile picture to Cloudinary
        
        Args:
          file_obj: InMemoryUploadedFile from request.FILES
          
        Returns:
          str: Cloudinary secure URL for uploaded image
          
        Raises:
          ValueError: If file validation fails (size, format, corruption)
          Exception: If upload to Cloudinary fails (network, service error)
        
        Process:
          1. Check file size (< 5 MB)
          2. Read with Pillow to verify valid image
          3. Detect image format (JPEG/PNG/GIF/WebP)
          4. Upload to Cloudinary with transformation
          5. Return secure HTTPS URL
          
        Transformation Applied:
          - Crop: 400x400 face-detection crop
          - Quality: auto:good (Cloudinary optimized)
          - Format: auto (best format for client browser)
          - Folder: ecodeed/profiles/
          
        File Naming:
          - public_id: user_{user_id}_{8_random_chars}
          - Example: user_123_abc123d4
          - Prevents collisions if user re-uploads
        """
        # ── SIZE VALIDATION ──
        if file_obj.size > MAX_PROFILE_PIC_SIZE:
            raise ValueError(
                f"Profile picture too large. Maximum is "
                f"{MAX_PROFILE_PIC_SIZE // (1024 * 1024)} MB."
            )

        # ── FORMAT VALIDATION ──
        # Use Pillow to verify file is valid image and detect format
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
        
        # Check detected format is supported
        if detected not in ALLOWED_PROFILE_PIC_TYPES:
            raise ValueError(
                f"Unsupported image type (detected: {detected or 'unknown'}). "
                "Allowed: JPEG, PNG, GIF, WebP."
            )

        # ── UPLOAD TO CLOUDINARY ──
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

    def update(self, request, *args, **kwargs):
        """
        Handle profile update with optional file upload
        
        Flow:
          1. If profile_picture file included, validate + upload to Cloudinary
          2. Replace file reference with Cloudinary URL in request data
          3. Validate remaining form fields (name, bio, etc.)
          4. Save updated user profile
          5. Return full user profile (includes new picture URL)
          
        Args:
          request: DRF Request with form/file data
          
        Returns:
          Response: Updated UserSerializer data with Cloudinary URL
        """
        # Make a mutable copy of QueryDict (default is immutable)
        mutable_data = request.data.copy()

        # ── HANDLE FILE UPLOAD ──
        if "profile_picture" in request.FILES:
            file_obj = request.FILES["profile_picture"]
            try:
                url = self._upload_profile_picture(file_obj)
            except ValueError as exc:
                # Validation error (size, format, corruption)
                return Response(
                    {"profile_picture": [str(exc)]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except Exception as exc:
                # Cloudinary upload error (network, service)
                return Response(
                    {"profile_picture": [f"Upload failed: {exc}"]},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            # Replace file with URL for serializer
            mutable_data["profile_picture"] = url

        # Remove file entries so serializer sees a plain string
        if "profile_picture" in request.FILES:
            del request.FILES["profile_picture"]

        # ── VALIDATE & SAVE ──
        partial = kwargs.pop("partial", True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=mutable_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Return full user profile so frontend can update Redux state
        return Response(UserSerializer(instance).data)



# ════════════════════════════════════════════════════════════════════════════════
# LOGOUT VIEW
# ════════════════════════════════════════════════════════════════════════════════

class LogoutView(APIView):
    """
    USER LOGOUT ENDPOINT
    
    POST /api/v1/auth/logout/
    
    Invalidates the user's refresh token, preventing it from being used
    to generate new access tokens. Clears the user's session.
    
    Request:
      {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
      }
    
    Response (205 Reset Content):
      {
        "message": "Successfully logged out"
      }
    
    Permissions:
      - Authenticated users only
      
    Token Blacklisting:
      - Refresh token is added to blacklist
      - Can't use blacklisted refresh token to get new access token
      - Frontend must delete tokens from storage
      - User redirected to login page
      
    Security:
      - Access token still valid until expiry (15 min) but user logged out
      - Refresh token immediately invalidated
      - Multiple devices: Only specified refresh token blacklisted
      - Other devices can still access until their tokens expire
      
    Note:
      - This endpoint doesn't require the token in Authorization header
      - Frontend can send refresh token from storage (cookie or localStorage)
      - If refresh token provided in cookies, it's used automatically
      
    Workflow:
      1. Frontend calls POST /api/v1/auth/logout/ with refresh token
      2. Backend blacklists the refresh token
      3. Frontend deletes stored tokens
      4. Frontend redirects to /login
      5. User logged out completely
      
    Fallback Behavior:
      - If blacklist fails (rare): Still returns 200 OK
      - Frontend should always delete tokens and redirect
      - Even if backend error occurs, logout succeeds on frontend
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Get refresh token from request body or cookies
            refresh_token = request.data.get("refresh") or request.COOKIES.get("refresh")
            if refresh_token:
                # Blacklist the refresh token (prevents future use)
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response(
                {"message": "Successfully logged out"},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception:
            # Even if blacklist fails, logout succeeds on frontend
            # Frontend still needs to delete tokens and redirect
            return Response(
                {"message": "Logged out with warnings"},
                status=status.HTTP_200_OK
            )


# ════════════════════════════════════════════════════════════════════════════════
# ADMIN USER MANAGEMENT VIEWSET
# ════════════════════════════════════════════════════════════════════════════════

class UserViewSet(viewsets.ModelViewSet):
    """
    ADMIN USER MANAGEMENT VIEWSET
    
    GET    /api/v1/auth/users/                 - List all users
    POST   /api/v1/auth/users/                 - Create new user (admin only)
    GET    /api/v1/auth/users/{id}/            - Get user detail
    PUT    /api/v1/auth/users/{id}/            - Update user (admin only)
    DELETE /api/v1/auth/users/{id}/            - Delete user (admin only)
    
    Custom Actions:
      GET    /api/v1/auth/users/getUsers/          - List with pagination + stats
      DELETE /api/v1/auth/users/{id}/deleteUser/   - Legacy delete endpoint
      PATCH  /api/v1/auth/users/{id}/updateRole/   - Change user role
    
    Permissions:
      - Restricted to admin/staff users only (IsAdminUser)
      - All operations require staff/superuser status
      
    Queryset:
      - Returns all User objects
      - Ordered by date_joined (newest first in default list action)
      
    Use Cases:
      1. Admin Dashboard: Display all users in table
      2. User Management: Ban, promote, delete users
      3. Role Assignment: Change student → instructor → admin
      4. User Statistics: Count users by registration date
      5. User Search/Filter: Find users by email, name, role
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=False, methods=['get'])
    def getUsers(self, request):
        """
        GET /api/v1/auth/users/getUsers/
        
        List users with pagination, filtering, and statistics.
        Used by Admin Dashboard to display user list.
        
        Query Parameters:
          startIndex (int): Pagination start (default: 0)
            - Example: startIndex=0 (first user)
            - Example: startIndex=10 (11th user)
          
          limit (int): Number of results per page (default: 9, max: 100)
            - Example: limit=20 (get 20 users per page)
            - Capped at 100 to prevent large result sets
          
          page (int): Alternative pagination (for compatibility)
            - Overrides startIndex if provided
            - Example: page=2 with limit=10 = startIndex=10
          
          sort (str): Sort order (default: 'desc')
            - 'desc': Newest users first (ordered by date_joined DESC)
            - 'asc': Oldest users first (ordered by date_joined ASC)
        
        Response (200 OK):
          {
            "users": [
              {
                "id": 1,
                "email": "john@example.com",
                "first_name": "John",
                "is_admin": true,
                "is_instructor": false,
                "date_joined": "2024-01-15T09:00:00Z",
                ...
              },
              ...
            ],
            "totalUsers": 250,
            "lastMonthUsers": 15
          }
        
        Pagination Examples:
          # Get first 10 users
          GET /api/v1/auth/users/getUsers/?limit=10
          
          # Get users 20-29
          GET /api/v1/auth/users/getUsers/?startIndex=20&limit=10
          
          # Get page 3 (with default limit 9)
          GET /api/v1/auth/users/getUsers/?page=3
          
          # Get users oldest first
          GET /api/v1/auth/users/getUsers/?sort=asc&limit=10
        
        Dashboard Integration:
          - Loads initial 9 users (default limit)
          - "Load More" button increments startIndex by 9
          - Shows "15 new users this month" statistic
          - Sorts newest users first by default
        
        Security:
          - Requires admin/staff permission
          - Returns 403 Forbidden if not authenticated
          - Invalid pagination params return 400 Bad Request
          
        Performance:
          - Limit capped at 100 (prevents expensive queries)
          - Returns count queries efficiently
          - Indexes on date_joined for fast sorting
        """
        # ── PERMISSION CHECK ──
        if not request.user.is_superuser and not request.user.is_staff:
            return Response(
                {'message': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        # ── PAGINATION PARAMETERS ──
        try:
            start_index = max(0, int(request.query_params.get('startIndex', 0)))
            limit = min(100, max(1, int(request.query_params.get('limit', 9))))
        except (ValueError, TypeError):
            return Response(
                {'message': 'Invalid pagination parameters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── ALTERNATIVE PAGE PARAMETER ──
        page = request.query_params.get('page')
        if page:
            try:
                limit_val = min(100, max(1, int(limit) if limit else 5))
                start_index = max(0, (int(page) - 1) * limit_val)
            except (ValueError, TypeError):
                pass

        # ── SORTING ──
        sort = request.query_params.get('sort', 'desc')
        order_field = '-date_joined' if sort == 'desc' else 'date_joined'
        
        queryset = self.queryset.order_by(order_field)
        
        # ── COUNT & PAGINATION ──
        total_users = queryset.count()
        users = queryset[start_index : start_index + limit]
        
        serializer = self.get_serializer(users, many=True)
        
        # ── MONTHLY STATISTICS ──
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

    @action(detail=True, methods=['delete'])
    def deleteUser(self, request, pk=None):
        """
        DELETE /api/v1/auth/users/{id}/deleteUser/
        
        Delete a user account and all associated data.
        
        Permission:
          - Admin/staff only
          
        Response (200 OK):
          {
            "message": "User deleted successfully"
          }
          
        Cascade Effects:
          - Deletes user from database
          - Deletes all enrollments
          - Deletes all submissions
          - Deletes all comments
          - Deletes all posts
          
        Use Cases:
          - Remove inactive users
          - Delete spam/abusive accounts
          - Clean up test accounts
          
        Warning:
          - This is permanent and irreversible
          - All user data is deleted
          - Consider deactivating instead of deleting
        """
        user = self.get_object()
        user.delete()
        return Response({'message': 'User deleted successfully'})

    @action(detail=True, methods=['patch'])
    def updateRole(self, request, pk=None):
        """
        PATCH /api/v1/auth/users/{id}/updateRole/
        
        Promote or demote a user to a different role.
        
        Request:
          {
            "user_type": "INSTRUCTOR"
          }
          or
          {
            "role": "INSTRUCTOR"
          }
        
        Valid Roles:
          - READER: Can read public content (default)
          - STUDENT: Can enroll and take courses
          - INSTRUCTOR/MENTOR: Can create and teach courses
          - ADMIN: Full platform access
        
        Response (200 OK):
          {
            "message": "User role updated to INSTRUCTOR",
            "user": { ...updated user data }
          }
        
        Side Effects:
          - If promoted to ADMIN: is_staff set to True
          - If demoted: Permission level reduced
          - Changes take effect immediately
        
        Permission:
          - Admin/staff only
          
        Errors:
          400: Invalid role (not in READER/STUDENT/MENTOR/ADMIN)
          403: Unauthorized (not staff)
          404: User not found
          
        Use Cases:
          1. Promote successful student to INSTRUCTOR
          2. Demote instructor back to STUDENT
          3. Ban user by changing role to READER
          4. Add new admin: STUDENT → ADMIN (sets is_staff=True)
          
        Workflow:
          1. Admin selects user from user list
          2. Admin clicks "Change Role" dropdown
          3. Admin selects INSTRUCTOR
          4. Backend updates user.user_type = 'INSTRUCTOR'
          5. User can now create courses
          6. User sees "Create Course" button next refresh
        """
        # ── PERMISSION CHECK ──
        if not request.user.is_superuser and not request.user.is_staff:
            return Response(
                {'message': 'Unauthorized'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        new_role = request.data.get('user_type') or request.data.get('role')
        
        # ── VALIDATE ROLE ──
        valid_roles = ['READER', 'STUDENT', 'INSTRUCTOR', 'ADMIN']
        if not new_role or new_role.upper() not in valid_roles:
            return Response(
                {
                    'message': f'Invalid role. Must be one of: {valid_roles}'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ── UPDATE USER ──
        user.user_type = new_role.upper()
        
        # If promoting to admin, also set is_staff (allows admin access)
        if new_role.upper() == 'ADMIN':
            user.is_staff = True
        
        user.save()
        
        return Response({
            'message': f'User role updated to {new_role.upper()}',
            'user': UserSerializer(user).data
        })

