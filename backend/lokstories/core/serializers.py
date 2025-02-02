from rest_framework import serializers
from .models import Story, Rating, Comment

class StorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Story
        fields = '__all__'  # or you can list specific fields here

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
