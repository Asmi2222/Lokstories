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
from rest_framework.views import APIView
from .serializers import CommentSerializer
from .models import Comment, Rating
from django.db import models  
from .serializers import RatingSerializer
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import IsAdminUser
from django.db.models import Count 


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
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    # Authenticate user
    user = authenticate(request, username=username, password=password)

    if user is not None:
        # Generate token for the authenticated user
        token = CustomRefreshToken().for_user(user)
        
        # Optionally, you can also return user info along with the token
        response_data = {
           "access": str(token.access_token),  # Access token for API calls
            "refresh": str(token),
            "user_id": user.id,
            "user_role": user.role,  # Assuming user has a role field
        }

        return Response(response_data)
    else:
        return Response({"detail": "Invalid credentials"}, status=400)


    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    user = request.user
    return Response({'name': user.name, 'role': user.role})


class StoryListView(generics.ListAPIView):
    queryset = Story.objects.all()
    serializer_class = StorySerializer

class AuthorBooksView(APIView):
    permission_classes = [IsAuthenticated]  # Only allow authenticated users to access this view

    def get(self, request):
        # Get the logged-in user
        user = request.user  # This user is the one who is authenticated

        if user.role == 'Author':  # Check if the user is an Author
            # Fetch only the stories written by this author
            stories = Story.objects.filter(author=user)
            serializer = StorySerializer(stories, many=True)  # Serialize the stories
            return Response(serializer.data)  # Return serialized data of the stories
        else:
            # If the user is not an Author, deny access
            return Response({'detail': 'You do not have access to this resource'}, status=403)


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

@api_view(['GET'])
def get_story_detail(request, pk):
    try:
        story = Story.objects.get(pk=pk)
        serializer = StorySerializer(story)
        return Response(serializer.data)
    except Story.DoesNotExist:
        return Response({"detail": "Story not found."}, status=404)

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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request):
    """Add a comment to a story"""
    # Add the current user to the data
    data = request.data.copy()
    data['user'] = request.user.id
    
    serializer = CommentSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_story_comments(request, story_id):
    """Get all comments for a specific story"""
    comments = Comment.objects.filter(story_id=story_id).order_by('-created_at')
    serializer = CommentSerializer(comments, many=True)
    return Response(serializer.data)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def manage_comment(request, comment_id):
    """Update or delete a comment"""
    try:
        comment = Comment.objects.get(id=comment_id, user=request.user)
    except Comment.DoesNotExist:
        return Response({"detail": "Comment not found or you don't have permission."},
                        status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'DELETE':
        comment.delete()
        return Response({"detail": "Comment deleted successfully."},
                        status=status.HTTP_204_NO_CONTENT)
    
    # For PUT requests (update)
    serializer = CommentSerializer(comment, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_story(request):
    try:
        rating = Rating.objects.get(
            user=request.user,
            story_id=request.data.get('story')
        )
        rating.rating = request.data.get('rating')
        rating.save()
        created = False
    except Rating.DoesNotExist:
        serializer = RatingSerializer(data={
            'user': request.user.id,
            'story': request.data.get('story'),
            'rating': request.data.get('rating')
        })
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        serializer.save()
        created = True
    
    # Get the updated story with average rating
    story = Story.objects.get(id=request.data.get('story'))
    serializer = StorySerializer(story)
    
    return Response({
        'success': True,
        'created': created,
        'story': serializer.data  # Includes avg_rating now
    }, status=201 if created else 200)

@api_view(['GET'])
def get_story_rating(request, story_id):
    """Get the average rating for a story and the user's own rating if available"""
    # Get average rating
    avg_rating = Rating.objects.filter(story_id=story_id).aggregate(
        avg_rating=models.Avg('rating'),
        count=models.Count('id')
    )
    
    # Get user's rating if logged in
    user_rating = None
    if request.user.is_authenticated:
        try:
            user_rating_obj = Rating.objects.get(user=request.user, story_id=story_id)
            user_rating = user_rating_obj.rating
        except Rating.DoesNotExist:
            pass
    
    return Response({
        'avg_rating': avg_rating['avg_rating'] or 0,
        'count': avg_rating['count'] or 0,
        'user_rating': user_rating
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """API endpoint to get dashboard statistics for admin"""
    # Check if user is admin
    if request.user.role != 'admin':
        return Response({"detail": "You do not have permission to access this data."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    try:
        total_users = User.objects.count()
        total_stories = Story.objects.count()
        
        # Get count of users by role
        user_roles = User.objects.values('role').annotate(count=Count('id'))
        
        # Get count of stories by genre
        story_genres = Story.objects.values('genre').annotate(count=Count('id'))
        
        return Response({
            'total_users': total_users,
            'total_stories': total_stories,
            'user_roles': user_roles,
            'story_genres': story_genres
        })
    except Exception as e:
        # Log the error
        logger.error(f"Error in admin_dashboard_stats: {str(e)}")
        return Response({"detail": "An error occurred while fetching dashboard statistics."},
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stories_list(request):
    """API endpoint to get all stories for admin"""
    # Check if user is admin
    if request.user.role != 'admin':
        return Response({"detail": "You do not have permission to access this data."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    try:
        stories = Story.objects.all().order_by('-id')
        serializer = StorySerializer(stories, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in admin_stories_list: {str(e)}")
        return Response({"detail": "An error occurred while fetching stories."},
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_story(request, pk):
    """API endpoint for admin to delete a story"""
    # Check if user is admin
    if request.user.role != 'admin':
        return Response({"detail": "You do not have permission to delete stories."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    try:
        story = Story.objects.get(pk=pk)
        story.delete()
        return Response({"detail": "Story deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    except Story.DoesNotExist:
        return Response({"detail": "Story not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in admin_delete_story: {str(e)}")
        return Response({"detail": "An error occurred while deleting the story."},
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """API endpoint to get all users for admin"""
    # Check if user is admin
    if request.user.role != 'admin':
        return Response({"detail": "You do not have permission to access this data."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    try:
        users = User.objects.all().order_by('-id')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error in admin_users_list: {str(e)}")
        return Response({"detail": "An error occurred while fetching users."},
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def admin_delete_user(request, pk):
    """API endpoint for admin to delete a user"""
    # Check if user is admin
    if request.user.role != 'admin':
        return Response({"detail": "You do not have permission to delete users."}, 
                        status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Prevent deleting the admin user who is logged in
        if request.user.id == pk:
            return Response({"detail": "Cannot delete your own account."}, 
                          status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.get(pk=pk)
        user.delete()
        return Response({"detail": "User deleted successfully."}, 
                      status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({"detail": "User not found."}, 
                      status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in admin_delete_user: {str(e)}")
        return Response({"detail": "An error occurred while deleting the user."},
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """Get the profile information of the currently logged in user"""
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """Update profile without affecting authentication"""
    user = request.user
    
    # Only allow updating these fields
    allowed_fields = ['username', 'name', 'profile_picture']
    update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
    
    # Handle profile picture separately
    if 'profile_picture' in update_data and update_data['profile_picture'] == '':
        user.profile_picture = None
        update_data.pop('profile_picture')
    
    # Update fields directly to avoid password hashing
    for field, value in update_data.items():
        setattr(user, field, value)
    
    try:
        user.save(update_fields=update_data.keys())
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)