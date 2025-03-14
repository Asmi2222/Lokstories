from rest_framework import serializers
from .models import Story, Rating, Comment
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username', 'password', 'name', 'role', 'profile_picture']
        extra_kwargs = {'password': {'write_only': True}}  # Make password write-only

    def create(self, validated_data):
        # No need to manually hash password here as it's handled in the model's save method
        user = User(**validated_data)
        user.save()
        return user
    
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
