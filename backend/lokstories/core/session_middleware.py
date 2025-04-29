# core/session_middleware.py

from datetime import datetime, timedelta
from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.response import Response
from django.http import JsonResponse

class SessionTimeoutMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip for non-API endpoints or authentication endpoints
        if not request.path.startswith('/api/') or request.path in ['/api/login/', '/api/register/']:
            return self.get_response(request)

        # Check for JWT token in Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Verify token expiration
                token_obj = AccessToken(token)
                # If we get here, token is valid
                
                # You can add additional session expiry logic here if needed
                
            except Exception:
                # Token is invalid or expired
                return JsonResponse({"detail": "Session expired. Please log in again."}, status=401)

        # Process the request normally
        response = self.get_response(request)
        return response