# Frontend-Backend Integration Guide

## Overview

This document describes the integration between the React frontend and Django REST backend for Ecodeed Academy.

## Authentication System

### JWT Token Flow

The authentication system uses JWT (JSON Web Tokens) with the following flow:

1. **Sign Up/Sign In**: User credentials are sent to the backend
2. **Token Generation**: Backend returns `access` and `refresh` tokens
3. **Token Storage**: Frontend stores tokens in `localStorage`
4. **API Requests**: Frontend includes `Authorization: Bearer <access_token>` header
5. **Token Refresh**: When access token expires (401), frontend automatically refreshes using the refresh token

### API Endpoints

| Purpose | Frontend Call | Backend Endpoint | Method |
|---------|---------------|------------------|--------|
| Register | `/api/auth/register/` | `UserRegistrationView` | POST |
| Login | `/api/auth/login/` | `UserLoginView` | POST |
| Logout | `/api/auth/logout/` | `LogoutView` | POST |
| Get Profile | `/api/auth/profile/` | `UserProfileView` | GET |
| Update Profile | `/api/auth/profile/update/` | `UserProfileUpdateView` | PATCH |
| Token Refresh | `/api/auth/token/refresh/` | `TokenRefreshView` | POST |

### Social Authentication Endpoints

| Provider | Endpoint | Method |
|----------|----------|--------|
| Google | `/api/auth/social/google/` | POST |
| Facebook | `/api/auth/social/facebook/` | POST |
| Twitter/X | `/api/auth/social/twitter/` | POST |
| Twitter Login | `/api/auth/social/twitter/login/` | GET |
| Twitter Callback | `/api/auth/social/twitter/callback/` | POST |

## User Data Model Mapping

### Django Backend Model → Frontend Model

```javascript
// Backend (Django) → Frontend (React)
{
  id: djangoUser.id,                    // User ID
  _id: djangoUser.id,                   // Backward compatibility
  email: djangoUser.email,              // Email (primary identifier)
  username: `${first_name} ${last_name}`, // Derived from name
  firstName: djangoUser.first_name,     // First name
  lastName: djangoUser.last_name,       // Last name
  profilePicture: djangoUser.profile_picture, // Profile image URL
  bio: djangoUser.bio,                  // User biography
  phoneNumber: djangoUser.phone_number, // Contact number
  userType: djangoUser.user_type,       // STUDENT/MENTOR/ADMIN/READER
  isAdmin: djangoUser.user_type === 'ADMIN' || djangoUser.is_staff,
  dateJoined: djangoUser.date_joined,   // Registration date
}
```

### Registration Payload

```javascript
// Frontend sends:
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "securepassword"
}

// Backend expects:
{
  first_name: "John",
  last_name: "Doe",
  email: "john@example.com",
  password: "securepassword",
  confirm_password: "securepassword"
}
```

## Social Authentication

### Google OAuth (via Firebase)
1. Frontend uses Firebase SDK to authenticate with Google
2. Firebase returns user data (email, name, photo)
3. Frontend sends user data to `/api/auth/social/google/`
4. Backend creates/updates user and returns JWT tokens

### Facebook OAuth
1. Frontend loads Facebook SDK
2. User clicks "Continue with Facebook"
3. Facebook SDK opens popup for authentication
4. On success, frontend sends data to `/api/auth/social/facebook/`
5. Backend creates/updates user and returns JWT tokens

### Twitter/X OAuth
1. Frontend requests auth URL from `/api/auth/social/twitter/login/`
2. User is redirected to Twitter for authorization
3. Twitter redirects back with auth code
4. Frontend sends code to `/api/auth/social/twitter/callback/`
5. Backend exchanges code for user data and returns JWT tokens

## Environment Variables

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Firebase (Google OAuth)
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project

# Facebook OAuth
VITE_FACEBOOK_APP_ID=your_app_id

# Twitter/X OAuth
VITE_TWITTER_CLIENT_ID=your_client_id
```

### Backend (.env)

```env
# Django Settings
SECRET_KEY=your_secret_key
DEBUG=True

# Database
MYSQL_DATABASE=ecodeed_db
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
MYSQL_HOST=localhost

# Social Auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
FACEBOOK_CLIENT_ID=your_facebook_id
FACEBOOK_CLIENT_SECRET=your_facebook_secret
TWITTER_CLIENT_ID=your_twitter_id
TWITTER_CLIENT_SECRET=your_twitter_secret
```

## Files Modified

### Frontend

1. **src/redux/user/userSlice.jsx**
   - Updated API endpoints for Django
   - Added `normalizeUser()` to map Django response to frontend format
   - Added `facebookSignIn` and `twitterSignIn` thunks
   - Added `fetchCurrentUser` thunk

2. **src/pages/SignUp.jsx**
   - Updated form fields (first_name, last_name instead of username)
   - Added password confirmation field
   - Updated Redux integration

3. **src/components/OAuth.jsx**
   - Added Facebook and Twitter OAuth buttons
   - Consolidated all social auth options

4. **src/components/SocialAuth/FacebookOAuth.jsx** (NEW)
   - Facebook SDK integration
   - Login flow handling

5. **src/components/SocialAuth/TwitterOAuth.jsx** (NEW)
   - Twitter OAuth 2.0 PKCE flow
   - Callback handler component

6. **src/components/Admin/Users/DashProfile.jsx**
   - Updated form fields for Django user model
   - Added bio, phone number fields

7. **src/utils/api.js**
   - Added automatic token refresh
   - Improved error handling for Django REST Framework responses

8. **src/App.jsx**
   - Added Twitter OAuth callback route

### Backend

1. **users/social_auth.py** (NEW)
   - `GoogleSocialAuthView` - Handle Google OAuth
   - `FacebookSocialAuthView` - Handle Facebook OAuth
   - `TwitterLoginView` - Initiate Twitter OAuth flow
   - `TwitterCallbackView` - Handle Twitter OAuth callback
   - `TwitterSocialAuthView` - Direct Twitter auth data

2. **users/urls.py**
   - Added social authentication endpoints

3. **config/urls.py**
   - Added JWT token refresh/verify endpoints

## Testing

### Test Registration
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "confirm_password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Test Profile
```bash
curl http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer <access_token>"
```

## Troubleshooting

### "Invalid user data" error
- Ensure the backend returns user data with `id` field
- Check `normalizeUser()` function in userSlice.jsx

### 401 Unauthorized
- Token may have expired
- Frontend should automatically refresh token
- Check if refresh token is valid

### Social auth buttons showing "Unavailable"
- Check environment variables are set
- Ensure Firebase/Facebook SDK is loaded
- Verify API keys in developer consoles
