from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from rest_framework_simplejwt.tokens import RefreshToken

# Define the Custom User Manager
class CustomUserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        """Create and return a regular user with a username and password."""
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)  # This will hash the password
        user.save(using=self._db)  # Save the user to the database
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        return self.create_user(username, password, **extra_fields)

class User(AbstractBaseUser):  # Inherit from AbstractBaseUser
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=50)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    # Set the custom manager for this model
    objects = CustomUserManager()

    # Specify which field will be used as the unique identifier
    USERNAME_FIELD = 'username'

    # Specify other fields that are required for user creation
    REQUIRED_FIELDS = ['name', 'role']

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('$'):
            self.password = make_password(self.password)
        super(User, self).save(*args, **kwargs)


class CustomRefreshToken(RefreshToken):
    def for_user(self, user):
        # Add user_id to the token payload
        self.payload['user_id'] = user.id

        # Add user_role to the token payload (ensure the user model has the 'role' attribute)
        self.payload['user_role'] = user.role if hasattr(user, 'role') else None
        
        return self

class Story(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    cover_image = models.ImageField(upload_to='story_covers/', null=True, blank=True)
    genre = models.CharField(max_length=100)
    description = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)

   # Historic site fields
    historic_site_name = models.CharField(max_length=255, null=True, blank=True)
    historic_site_description = models.TextField(null=True, blank=True)
    historic_site_url = models.URLField(max_length=500, null=True, blank=True)
    
    # Food location fields
    food_name = models.CharField(max_length=255, null=True, blank=True)
    restaurant_name = models.CharField(max_length=255, null=True, blank=True)
    food_description = models.TextField(null=True, blank=True)
    restaurant_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.title

class Comment(models.Model):
    id = models.AutoField(primary_key=True)
    content = models.TextField()
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.user.username} on {self.story.title}'

class Rating(models.Model):
    id = models.AutoField(primary_key=True)
    rating = models.IntegerField()  # Range of 1-5
    story = models.ForeignKey(Story, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user.username} rated {self.story.title}'