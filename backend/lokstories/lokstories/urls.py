
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core import api_views 
from core.views import register_user, login_user, get_user_data,create_story, get_user_stories, update_story, delete_story,StoryListView,AuthorBooksView 
from .views import index
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
router = DefaultRouter()
router.register(r'stories', api_views.StoryViewSet)
router.register(r'ratings', api_views.RatingViewSet)
router.register(r'comments', api_views.CommentViewSet)

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin/', admin.site.urls),
    path('api/register/', register_user, name='register'),
    path('api/login/', login_user, name='login'),
    path('login/', login_user, name='login_user'),
    path('api/user-data/', get_user_data, name='user-data'),
    path('api/', include(router.urls)),
    path('api/author/books/', AuthorBooksView.as_view(), name='author-books'),
    path('api/stories/', StoryListView.as_view(), name='story-list'),
    path('stories/create/', create_story, name='create_story'),
    path('stories/', get_user_stories, name='get_user_stories'),
    path('stories/update/<int:pk>/', update_story, name='update_story'),
    path('stories/delete/<int:pk>/', delete_story, name='delete_story'),
    path('',index),
]

