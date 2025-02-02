from django.contrib import admin

from .models import User, Story, Comment, Rating

admin.site.register(User)
admin.site.register(Story)
admin.site.register(Comment)
admin.site.register(Rating)