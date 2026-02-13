from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


class TokenAuthView(APIView):
    """
    GET /api/auth/ — Authenticate with Basic Auth and return token.
    
    Similar to NOVUS auth pattern:
    - Send username:password via Basic Auth header
    - Returns JWT access token
    """
    authentication_classes = [BasicAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Generate JWT token for authenticated user
        refresh = RefreshToken.for_user(request.user)
        
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(request.user.id),
                'username': request.user.username,
                'role': request.user.role,
            }
        }, status=status.HTTP_200_OK)


class LoginView(APIView):
    """
    POST /api/auth/login/ — Login with username and password in body.
    
    Request body:
    {
        "username": "user",
        "password": "pass"
    }
    
    Returns:
    {
        "token": "access_token...",
        "refresh": "refresh_token...",
        "user": { "id": "...", "username": "...", "role": "..." }
    }
    """
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'detail': 'Username and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {'detail': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'detail': 'User account is disabled.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': str(user.id),
                'username': user.username,
                'role': user.role,
            }
        }, status=status.HTTP_200_OK)
