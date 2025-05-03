import json
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import patch, MagicMock
import requests
from PIL import Image
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model, authenticate
from unittest.mock import patch
from io import BytesIO
import tempfile
from core.models import User, Story, Comment, Rating
from core.serializers import UserSerializer, StorySerializer, CommentSerializer, RatingSerializer
import json
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.contrib.auth.models import AbstractBaseUser
import os
import io
import tempfile
from PIL import Image
from decimal import Decimal

class UserSerializerTests(TestCase):
    def test_user_serializer_valid_data(self):
        """Test that UserSerializer accepts valid data"""
        user_data = {
            'username': 'testuser',
            'password': 'password123',
            'name': 'Test User',
            'role': 'Reader'
        }
        serializer = UserSerializer(data=user_data)
        self.assertTrue(serializer.is_valid())

    def test_user_serializer_missing_data(self):
        """Test that UserSerializer validates required fields"""
        user_data = {
            'username': 'testuser',
            # Missing password
            'name': 'Test User',
            'role': 'Reader'
        }
        serializer = UserSerializer(data=user_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)


class StorySerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username="author",
            name="Author Name",
            password="password123",
            role="Author"
        )

    def test_story_serializer_valid_data(self):
        """Test that StorySerializer accepts valid data"""
        story_data = {
            'title': 'Test Story',
            'content': 'This is a test story content.',
            'genre': 'Fiction',
            'description': 'A story for testing',
            'author': self.user.id
        }
        serializer = StorySerializer(data=story_data)
        self.assertTrue(serializer.is_valid())

    def test_story_serializer_missing_data(self):
        """Test that StorySerializer validates required fields"""
        story_data = {
            # Missing title
            'content': 'This is a test story content.',
            'genre': 'Fiction',
            'description': 'A story for testing',
            'author': self.user.id
        }
        serializer = StorySerializer(data=story_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

    def test_story_serializer_avg_rating(self):
        """Test avg_rating calculation in StorySerializer"""
        story = Story.objects.create(
            title='Test Story',
            content='This is a test story content.',
            genre='Fiction',
            description='A story for testing',
            author=self.user
        )
        
        # Create another user for ratings
        rater = User.objects.create(
            username="rater",
            name="Rater Name",
            password="password123",
            role="Reader"
        )
        
        # Add two ratings
        Rating.objects.create(rating=4, story=story, user=rater)
        Rating.objects.create(rating=5, story=story, user=self.user)
        
        serializer = StorySerializer(story)
        self.assertEqual(serializer.data['avg_rating'], 4.5)
        self.assertEqual(serializer.data['rating_count'], 2)


class CommentSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username="commenter",
            name="Commenter Name",
            password="password123",
            role="Reader"
        )
        self.author = User.objects.create(
            username="author",
            name="Author Name",
            password="password123",
            role="Author"
        )
        self.story = Story.objects.create(
            title="Test Story",
            content="This is a test story content.",
            genre="Fiction",
            description="A story for testing",
            author=self.author
        )

    def test_comment_serializer_valid_data(self):
        """Test that CommentSerializer accepts valid data"""
        comment_data = {
            'content': 'This is a test comment.',
            'story': self.story.id,
            'user': self.user.id
        }
        serializer = CommentSerializer(data=comment_data)
        self.assertTrue(serializer.is_valid())

    def test_comment_serializer_missing_data(self):
        """Test that CommentSerializer validates required fields"""
        comment_data = {
            'content': 'This is a test comment.',
            # Missing story
            'user': self.user.id
        }
        serializer = CommentSerializer(data=comment_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('story', serializer.errors)


class RatingSerializerTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            username="rater",
            name="Rater Name",
            password="password123",
            role="Reader"
        )
        self.author = User.objects.create(
            username="author",
            name="Author Name",
            password="password123",
            role="Author"
        )
        self.story = Story.objects.create(
            title="Test Story",
            content="This is a test story content.",
            genre="Fiction",
            description="A story for testing",
            author=self.author
        )

    def test_rating_serializer_valid_data(self):
        """Test that RatingSerializer accepts valid data"""
        rating_data = {
            'rating': 5,
            'story': self.story.id,
            'user': self.user.id
        }
        serializer = RatingSerializer(data=rating_data)
        self.assertTrue(serializer.is_valid())

    def test_rating_serializer_missing_data(self):
        """Test that RatingSerializer validates required fields"""
        rating_data = {
            # Missing rating
            'story': self.story.id,
            'user': self.user.id
        }
        serializer = RatingSerializer(data=rating_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('rating', serializer.errors)

class RegisterUserTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('register')
        self.valid_payload = {
            'username': 'testuser',
            'password': 'testpassword',
            'name': 'Test User',
            'role': 'Reader'
        }
    def test_register_valid_user(self):
        """Test registering a user with valid data"""
        response = self.client.post(
            self.register_url, 
            self.valid_payload, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().username, 'testuser')
        self.assertEqual(response.data['message'], 'User created successfully!')

    def test_register_duplicate_username(self):
        """Test registering a user with a duplicate username"""
        
        User.objects.create(
            username='testuser', 
            password='testpassword',
            name='Test User', 
            role='Reader'
        )
    
        response = self.client.post(
            self.register_url, 
            self.valid_payload, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)

    def test_register_missing_required_fields(self):
        """Test registering a user with missing required fields"""
        incomplete_payload = {
            'username': 'testuser',
            'password': 'testpassword'
            # Missing name and role
        }
        response = self.client.post(
            self.register_url, 
            incomplete_payload, 
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Both name and role should be in the errors
        self.assertIn('name', response.data)
        self.assertIn('role', response.data)
        self.assertEqual(User.objects.count(), 0)


class LoginTests(TestCase):
    def setUp(self):
        """Set up test data - create a test user"""
        self.client = APIClient()
        self.login_url = reverse('login')
        
        # Create a test user
        self.test_user = User.objects.create(
            username="testuser",
            name="Test User",
            role="Reader"
        )
        # Set password directly (will be hashed by the model's save method)
        self.test_user.password = "testpassword123"
        self.test_user.save()
        
        # Test credentials
        self.valid_credentials = {
            "username": "testuser",
            "password": "testpassword123"
        }
        self.invalid_credentials = {
            "username": "testuser",
            "password": "wrongpassword"
        }

    def test_login_success(self):
        """Test successful login with valid credentials"""
        
        user = authenticate(username=self.valid_credentials['username'], 
                            password=self.valid_credentials['password'])
        
        
        if user is None:
           
            self.test_user.set_password(self.valid_credentials['password'])
            self.test_user.save()
        
       
        response = self.client.post(
            self.login_url,
            self.valid_credentials,
            format='json'
        )
        
       
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user_id'], self.test_user.id)
        self.assertEqual(response.data['user_role'], self.test_user.role)

    def test_login_fail_with_invalid_password(self):
        """Test failed login with invalid password"""
        response = self.client.post(
            self.login_url,
            self.invalid_credentials,
            format='json'
        )
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'Invalid credentials')

    def test_login_fail_with_nonexistent_user(self):
        """Test failed login with a username that doesn't exist"""
        nonexistent_user = {
            "username": "nonexistentuser",
            "password": "somepassword"
        }
        
        response = self.client.post(
            self.login_url,
            nonexistent_user,
            format='json'
        )
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)
        self.assertEqual(response.data['detail'], 'Invalid credentials')

    def test_login_fail_with_missing_fields(self):
        """Test failed login with missing required fields"""
        # Missing password
        missing_password = {
            "username": "testuser"
        }
        
        response = self.client.post(
            self.login_url,
            missing_password,
            format='json'
        )
        
       
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
       
        missing_username = {
            "password": "testpassword123"
        }
        
        response = self.client.post(
            self.login_url,
            missing_username,
            format='json'
        )
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)



class AdminFeatureTests(TestCase):
    def setUp(self):
        """Set up test data - create admin user, regular user, story and comment"""
        self.client = APIClient()
        
        # Create an admin user
        self.admin_user = User.objects.create_user(
            username="admin_user",
            name="Admin User",
            role="admin",
            password="admin_password"
        )
        
        # Create a regular user (for deletion test and as author)
        self.regular_user = User.objects.create_user(
            username="regular_user",
            name="Regular User",
            role="Author",
            password="user_password"
        )
        
        # Create a story by the regular user
        self.test_story = Story.objects.create(
            title="Test Story",
            content="This is a test story content",
            genre="Fiction",
            description="Test story description",
            author=self.regular_user
        )
        
        # Create a comment on the story
        self.test_comment = Comment.objects.create(
            content="This is a test comment",
            story=self.test_story,
            user=self.regular_user
        )
        
        # URLs
        self.dashboard_url = reverse('admin-dashboard')
        self.delete_story_url = reverse('admin-delete-story', kwargs={'pk': self.test_story.pk})
        self.delete_user_url = reverse('admin-delete-user', kwargs={'pk': self.regular_user.pk})
        self.delete_comment_url = reverse('admin-delete-comment', kwargs={'pk': self.test_comment.pk})
        
        # Login directly using APIClient instead of tokens
        self.client.force_authenticate(user=self.admin_user)

    def test_admin_can_view_dashboard(self):
        """Test that admin can access the dashboard statistics"""
        # Make request
        response = self.client.get(self.dashboard_url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('total_stories', response.data)
        self.assertIn('user_roles', response.data)
        self.assertIn('story_genres', response.data)
        
        # Verify data is accurate
        self.assertEqual(response.data['total_users'], 2)  # admin and regular user
        self.assertEqual(response.data['total_stories'], 1)  # test story
        
        # Test that non-admin cannot access dashboard
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.dashboard_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_story(self):
        """Test that admin can delete stories"""
        # Re-authenticate as admin in case test order changes
        self.client.force_authenticate(user=self.admin_user)
        
        # Verify story exists before deletion
        story_exists = Story.objects.filter(pk=self.test_story.pk).exists()
        self.assertTrue(story_exists)
        
        # Delete story
        response = self.client.delete(self.delete_story_url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify story is deleted
        story_exists = Story.objects.filter(pk=self.test_story.pk).exists()
        self.assertFalse(story_exists)
        
        # Test that non-admin cannot delete stories via admin endpoint
        self.client.force_authenticate(user=self.regular_user)
        
        # Create a new story for this test
        new_story = Story.objects.create(
            title="Another Test Story",
            content="This is another test story content",
            genre="Fiction",
            description="Another test story description",
            author=self.regular_user
        )
        
        delete_url = reverse('admin-delete-story', kwargs={'pk': new_story.pk})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_user(self):
        """Test that admin can delete users"""
        # Re-authenticate as admin
        self.client.force_authenticate(user=self.admin_user)
        
        # Verify user exists before deletion
        user_exists = User.objects.filter(pk=self.regular_user.pk).exists()
        self.assertTrue(user_exists)
        
        # Delete user
        response = self.client.delete(self.delete_user_url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify user is deleted
        user_exists = User.objects.filter(pk=self.regular_user.pk).exists()
        self.assertFalse(user_exists)
        
        # Test that non-admin cannot delete users
        # Create another regular user
        another_user = User.objects.create_user(
            username="another_user",
            name="Another User",
            role="Reader",
            password="user_password"
        )
        
        # Login with another user
        self.client.force_authenticate(user=another_user)
        
        delete_url = reverse('admin-delete-user', kwargs={'pk': another_user.pk})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_comment(self):
        """Test that admin can delete comments"""
        # Re-authenticate as admin
        self.client.force_authenticate(user=self.admin_user)
        
        # Verify comment exists before deletion
        comment_exists = Comment.objects.filter(pk=self.test_comment.pk).exists()
        self.assertTrue(comment_exists)
        
        # Delete comment
        response = self.client.delete(self.delete_comment_url)
        
        # Assertions
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify comment is deleted
        comment_exists = Comment.objects.filter(pk=self.test_comment.pk).exists()
        self.assertFalse(comment_exists)
        
        # Test that non-admin cannot delete comments via admin endpoint
        self.client.force_authenticate(user=self.regular_user)
        
        # Create a new comment for this test
        new_story = Story.objects.create(
            title="Story for Comment Test",
            content="Content for comment test",
            genre="Fiction",
            description="Test description",
            author=self.admin_user
        )
        
        new_comment = Comment.objects.create(
            content="This is another test comment",
            story=new_story,
            user=self.admin_user
        )
        
        delete_url = reverse('admin-delete-comment', kwargs={'pk': new_comment.pk})
        response = self.client.delete(delete_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)



class StoryUploadTestCase(TestCase):
    """
    Test case for the story upload functionality
    """
    def setUp(self):
        """Set up test data and client"""
        # Create test users with different roles
        self.author_user = User.objects.create(
            username="testauthor",
            name="Test Author",
            role="Author"
        )
        self.author_user.set_password("password123")
        self.author_user.save()
        
        self.regular_user = User.objects.create(
            username="testuser",
            name="Test User",
            role="Reader"  # Assuming a reader role exists
        )
        self.regular_user.set_password("password123")
        self.regular_user.save()
        
        # Set up API client
        self.client = APIClient()
        
        # URL for story creation
        self.url = reverse('create_story')
        
        # Valid story data
        self.valid_story_data = {
            'title': 'Test Story',
            'content': 'This is a test story content.',
            'genre': 'Fantasy',
            'description': 'A test story for unit testing.'
        }
        
        # Story data with all fields including optional ones
        self.full_story_data = {
            'title': 'Complete Test Story',
            'content': 'This is a comprehensive test story content.',
            'genre': 'Historical Fiction',
            'description': 'A full test story with all fields for unit testing.',
            'historic_site_name': 'Test Historic Site',
            'historic_site_description': 'Description of test historic site',
            'historic_site_url': 'https://example.com/site',
            'food_name': 'Test Food',
            'restaurant_name': 'Test Restaurant',
            'food_description': 'Description of test food',
            'restaurant_url': 'https://example.com/restaurant'
        }
    
    def generate_test_image(self):
        """Generate a test image for cover_image field testing"""
        image = Image.new('RGB', (100, 100), color='red')
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        return image_io
    
    def test_story_upload_authentication_required(self):
        """Test that authentication is required for story upload"""
        # Attempt to create story without authentication
        response = self.client.post(self.url, self.valid_story_data, format='json')
        
        # Ensure 401 Unauthorized response
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_story_upload_success(self):
        """Test successful story upload by an author"""
        # Authenticate as an author
        self.client.force_authenticate(user=self.author_user)
        
        # Create story
        response = self.client.post(self.url, self.valid_story_data, format='json')
        
        # Check for successful creation
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify story exists in database
        self.assertTrue(Story.objects.filter(title='Test Story').exists())
        
        # Verify author was set correctly
        story = Story.objects.get(title='Test Story')
        self.assertEqual(story.author, self.author_user)
    
    def test_story_upload_with_all_fields(self):
        """Test story upload with all optional fields"""
        # Authenticate as an author
        self.client.force_authenticate(user=self.author_user)
        
        # Create story with all fields
        response = self.client.post(self.url, self.full_story_data, format='json')
        
        # Check for successful creation
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Get the story from database
        story = Story.objects.get(title='Complete Test Story')
        
        # Verify optional fields were saved
        self.assertEqual(story.historic_site_name, 'Test Historic Site')
        self.assertEqual(story.food_name, 'Test Food')
        self.assertEqual(story.restaurant_name, 'Test Restaurant')
    
    def test_story_upload_with_cover_image(self):
        """Test uploading a story with a cover image"""
        # Authenticate as an author
        self.client.force_authenticate(user=self.author_user)
        
        # Create temporary image file instead of BytesIO for more reliable testing
        with tempfile.NamedTemporaryFile(suffix='.jpg') as image_file:
            # Create a simple image and save it to the temporary file
            image = Image.new('RGB', (100, 100), color='red')
            image.save(image_file, format='JPEG')
            image_file.seek(0)
            
            # Create data with image
            data = self.valid_story_data.copy()
            data['cover_image'] = image_file
            
            # Create story with image
            response = self.client.post(self.url, data, format='multipart')
        
        # Check for successful creation
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify story has a cover image
        story = Story.objects.get(title='Test Story')
        self.assertTrue(story.cover_image.name)  # Check that the field is not empty
    
    def test_story_upload_missing_required_fields(self):
        """Test story upload with missing required fields"""
        # Authenticate as an author
        self.client.force_authenticate(user=self.author_user)
        
        # Create incomplete data without required fields
        incomplete_data = {
            'title': 'Incomplete Story'
            # Missing: content, genre, description
        }
        
        # Try to create story
        response = self.client.post(self.url, incomplete_data, format='json')
        
        # Check for bad request response
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verify errors for missing fields are returned
        self.assertIn('content', response.data)
        self.assertIn('genre', response.data)
        self.assertIn('description', response.data)
        
    def test_story_count_after_upload(self):
        """Test that story count increases after upload"""
        # Get initial count
        initial_count = Story.objects.count()
        
        # Authenticate as an author
        self.client.force_authenticate(user=self.author_user)
        
        # Create story
        response = self.client.post(self.url, self.valid_story_data, format='json')
        
        # Verify count increased by 1
        self.assertEqual(Story.objects.count(), initial_count + 1)

class EditStoryTest(TestCase):
    """Test suite for the edit story functionality"""

    def setUp(self):
        """Set up test data before each test"""
       
        self.user = User.objects.create(
            username="testauthor",
            name="Test Author",
            role="Author"
        )
        self.user.set_password("password123")
        self.user.save()
        
        self.story = Story.objects.create(
            title="Original Title",
            content="Original content of the story",
            description="Original description",
            genre="Fiction",
            author=self.user
        )
        self.client = APIClient()

    def test_update_story_authenticated(self):
        """Test that an authenticated author can update their own story"""
        self.client.force_authenticate(user=self.user)
 
        update_data = {
            "title": "Updated Title",
            "description": "Updated description",
            "content": "Updated content of the story"
        }

        url = reverse('update_story', kwargs={'pk': self.story.pk})
        response = self.client.put(url, update_data, format='json')
  
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.story.refresh_from_db()
        self.assertEqual(self.story.title, "Updated Title")
        self.assertEqual(self.story.description, "Updated description")
        self.assertEqual(self.story.content, "Updated content of the story")
        self.assertEqual(self.story.genre, "Fiction")
        self.assertEqual(self.story.author, self.user)

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from core.models import User, Story, Comment


class CommentTest(TestCase):
    """Test suite for comment creation and deletion functionality"""
    def setUp(self):
        """Set up test data before each test"""
        self.author = User.objects.create(
            username="testauthor",
            name="Test Author",
            role="Author"
        )
        self.author.set_password("password123")
        self.author.save()
        self.reader = User.objects.create(
            username="testreader",
            name="Test Reader",
            role="Reader"
        )
        self.reader.set_password("password123")
        self.reader.save()     
        self.story = Story.objects.create(
            title="Test Story",
            content="This is a test story content",
            description="Test description",
            genre="Fiction",
            author=self.author
        )
        self.client = APIClient()

    def test_add_comment(self):
        """Test that an authenticated user can add a comment to a story"""
        self.client.force_authenticate(user=self.reader)
        comment_data = {
            "content": "This is a test comment",
            "story": self.story.id
        }
        url = reverse('add-comment')
        response = self.client.post(url, comment_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Comment.objects.count(), 1)
        comment = Comment.objects.first()
        self.assertEqual(comment.content, "This is a test comment")
        self.assertEqual(comment.story, self.story)
        self.assertEqual(comment.user, self.reader)

    def test_delete_comment(self):
        """Test that a user can delete their own comment"""
        # Login the reader user
        self.client.force_authenticate(user=self.reader)
        
        # Create a comment first
        comment = Comment.objects.create(
            content="Comment to be deleted",
            story=self.story,
            user=self.reader
        )
        
        # Make DELETE request to delete comment
        url = reverse('manage-comment', kwargs={'comment_id': comment.id})
        response = self.client.delete(url)
        
        # Assert response is successful (204 No Content)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Check that comment was deleted from database
        self.assertEqual(Comment.objects.count(), 0)

class RatingTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword123",
            name="Test User",
            role="Reader"
        )

        self.author = User.objects.create_user(
            username="authoruser",
            password="authorpassword123",
            name="Author User",
            role="Author"
        )
        self.story = Story.objects.create(
            title="Test Story",
            content="This is a test story content.",
            genre="Fiction",
            description="A test story for unit testing",
            author=self.author
        )
        self.client = APIClient()
        
    def test_rate_story(self):
        """Test that a user can rate a story"""
        self.client.force_authenticate(user=self.user)
        rating_data = {
            "story": self.story.id,
            "rating": 4
        }
        response = self.client.post(reverse('rate-story'), rating_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['created'])
    
        rating_exists = Rating.objects.filter(
            user=self.user,
            story=self.story,
            rating=4
        ).exists()

        self.assertTrue(rating_exists)

class UserProfileUpdateTestCase(TestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword123",
            name="Original Name",
            role="Reader"
        )
        
        # Set up API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
    def test_update_user_profile(self):
        """Test that a user can update their profile information"""
        # Data to update
        update_data = {
            "name": "Updated Name",
            "username": "updated_username"
        }
        
        # Send update request
        response = self.client.put(reverse('update-user-profile'), update_data, format='json')
        
        # Check response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh the user from database
        self.user.refresh_from_db()
        
        # Verify user data was updated
        self.assertEqual(self.user.name, "Updated Name")
        self.assertEqual(self.user.username, "updated_username")
        
       