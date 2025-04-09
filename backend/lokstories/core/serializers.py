from rest_framework import serializers
from .models import Story, Rating, Comment
from .models import User
from django.db import models

class UserSerializer(serializers.ModelSerializer):
    books_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id','username', 'password', 'name', 'role', 'profile_picture', 'books_count', 'comments_count']
        extra_kwargs = {'password': {'write_only': True}}  # Make password write-only

    def create(self, validated_data):
        # No need to manually hash password here as it's handled in the model's save method
        user = User(**validated_data)
        user.save()
        return user
    def get_books_count(self, obj):
        return Story.objects.filter(author=obj).count()
    
    def get_comments_count(self, obj):
        return Comment.objects.filter(user=obj).count()
    
class StorySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    avg_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    class Meta:
        model = Story
        fields = ['id', 'author', 'author_name', 'title', 'content', 'cover_image', 
                  'genre', 'description', 'historic_site_name', 
                  'historic_site_description', 'historic_site_url',
                  'food_name', 'restaurant_name', 'food_description', 
                  'restaurant_url','avg_rating', 'rating_count']
        
    def get_avg_rating(self, obj):
        return Rating.objects.filter(story=obj).aggregate(
            avg_rating=models.Avg('rating')
        )['avg_rating'] or 0
    
    def get_rating_count(self, obj):
        return Rating.objects.filter(story=obj).count()

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    # Add username field fetched from related User model
    username = serializers.CharField(source='user.username', read_only=True)
    story_title = serializers.CharField(source='story.title', read_only=True)
    profile_picture = serializers.ImageField(source='user.profile_picture', read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'content', 'story', 'story_title','user', 'username', 'created_at','profile_picture']
        read_only_fields = ['created_at'] 