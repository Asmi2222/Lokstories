
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from core import api_views 
from core.views import register_user, login_user, get_user_data,create_story, get_user_stories, update_story, delete_story,StoryListView,AuthorBooksView, get_story_detail, add_comment, get_story_comments,manage_comment, rate_story,get_story_rating,admin_dashboard_stats, admin_stories_list, admin_delete_story, admin_users_list, admin_delete_user,get_user_profile,update_user_profile,logout_user,admin_comments_list,admin_delete_comment,check_edit_permission
from .views import index
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import path
from core.api_views import translate_to_nepali
router = DefaultRouter()
router.register(r'stories', api_views.StoryViewSet)

#router.register(r'ratings', api_views.RatingViewSet)
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
    path('api/stories/<int:pk>/', get_story_detail, name='story-detail'),
    path('stories/create/', create_story, name='create_story'),
    path('stories/', get_user_stories, name='get_user_stories'),
    path('stories/update/<int:pk>/', update_story, name='update_story'),
    path('stories/delete/<int:pk>/', delete_story, name='delete_story'),
    
    path('api/comments/add', add_comment, name='add-comment'),
    path('api/comments/story/<int:story_id>/', get_story_comments, name='story-comments'),
    path('api/comments/<int:comment_id>/', manage_comment, name='manage-comment'),

    path('api/ratings/rate/', rate_story, name='rate-story'),
    path('api/ratings/story/<int:story_id>/', get_story_rating, name='story-rating'),

    path('api/translate/', translate_to_nepali, name='translate'),


    path('api/admin/dashboard/', admin_dashboard_stats, name='admin-dashboard'),
    path('api/admin/stories/', admin_stories_list, name='admin-stories'),
    path('api/admin/stories/delete/<int:pk>/', admin_delete_story, name='admin-delete-story'),
    path('api/admin/users/', admin_users_list, name='admin-users'),
    path('api/admin/users/delete/<int:pk>/', admin_delete_user, name='admin-delete-user'),

    path('api/profile/', get_user_profile, name='user-profile'),
    path('api/profile/update/', update_user_profile, name='update-user-profile'),

    path('api/logout/', logout_user, name='logout'),

    path('api/admin/comments/', admin_comments_list, name='admin-comments'),
    path('api/admin/comments/delete/<int:pk>/', admin_delete_comment, name='admin-delete-comment'),

    path('',index),

    path('api/stories/<int:story_id>/check-edit-permission/', check_edit_permission, name='check-edit-permission'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



