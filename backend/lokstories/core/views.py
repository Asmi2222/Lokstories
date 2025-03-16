#from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import CustomRefreshToken, Story
from .serializers import StorySerializer
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Story
from .serializers import UserSerializer
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate
import logging
from rest_framework import generics

from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)




@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data
    serializer = UserSerializer(data=data)

    if serializer.is_valid():
        serializer.save()  # Saves the new user
        return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
@permission_classes([AllowAny]) 
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    print(request.method)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"message": "Invalid credentials"}, status=400)

    if check_password(password, user.password):
        # Create an instance of CustomRefreshToken
        refresh = CustomRefreshToken()

        # Now call for_user method on that instance
        refresh = refresh.for_user(user)  # Associate the user correctly

        # Get the access token from the refresh token instance
        access_token = str(refresh.access_token)

        return Response({
            "message": "Login successful",
            "role": user.role,
            "access_token": access_token,
            "refresh_token": str(refresh)
        }, status=status.HTTP_200_OK)
    else:
        return Response({"message": "Invalid credentials"}, status=400)

    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    user = request.user
    return Response({'name': user.name, 'role': user.role})


class StoryListView(generics.ListAPIView):
    queryset = Story.objects.all()
    serializer_class = StorySerializer


@api_view(['POST'])

@permission_classes([IsAuthenticated])  # Only logged-in users can create stories


def create_story(request):
    """ API endpoint to allow authenticated users to create a story """
    
    # Get the logged-in user (author)
    author = request.user  
    
    # Add the author's ID to the request data
    request.data['author'] = author.id  

    # Serialize the data
    serializer = StorySerializer(data=request.data)
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_user_stories(request):
    user = request.user  # Get the logged-in user
    stories = Story.objects.filter(author=user)  # Get stories by this author
    serializer = StorySerializer(stories, many=True)  # Serialize the stories
    return Response(serializer.data)  # Return serialized data in response

@api_view(['PUT', 'PATCH'])
def update_story(request, pk):
    try:
        story = Story.objects.get(pk=pk, author=request.user)  # Get story by ID and check if it belongs to the user
    except Story.DoesNotExist:
        return Response({"detail": "Story not found or you do not have permission to edit this story."}, status=404)

    serializer = StorySerializer(story, data=request.data, partial=True)  # Partial=True allows partial updates
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)  # Return the updated story data
    return Response(serializer.errors, status=400)  # Return errors if the data is invalid

@api_view(['DELETE'])
def delete_story(request, pk):
    try:
        story = Story.objects.get(pk=pk, author=request.user)  # Get story by ID and check if it belongs to the user
    except Story.DoesNotExist:
        return Response({"detail": "Story not found or you do not have permission to delete this story."}, status=404)

    story.delete()  # Delete the story
    return Response({"detail": "Story deleted successfully."}, status=204)  # Return a success message