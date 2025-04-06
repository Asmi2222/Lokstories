from rest_framework import viewsets,permissions
from .models import Story, Rating, Comment
from .serializers import StorySerializer, RatingSerializer, CommentSerializer
from rest_framework.generics import ListAPIView
from django.db.models import Q
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
import json
from django.db.models import Avg, Count
from rest_framework.decorators import action
from rest_framework.response import Response

class StoryViewSet(viewsets.ModelViewSet):
    queryset = Story.objects.all()
    serializer_class = StorySerializer

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]  # Add authentication requirement

    @action(detail=False, methods=['post'], url_path='rate')
    def rate_story(self, request):
        """Custom action for rating a story"""
        try:
            rating = Rating.objects.get(
                user=request.user,
                story_id=request.data.get('story')
            )
            # Update existing rating
            rating.rating = request.data.get('rating')
            rating.save()
            created = False
        except Rating.DoesNotExist:
            # Create new rating
            data = request.data.copy()
            data['user'] = request.user.id
            serializer = RatingSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                created = True
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get updated average rating
        avg_rating = Rating.objects.filter(
            story_id=request.data.get('story')
        ).aggregate(
            avg_rating=Avg('rating'),
            count=Count('id')
        )
        
        return Response({
            'success': True,
            'created': created,
            'avg_rating': avg_rating['avg_rating'] or 0,
            'count': avg_rating['count'] or 0
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='story/(?P<story_id>[^/.]+)')
    def get_story_rating(self, request, story_id=None):
        """Get rating for a specific story"""
        # Get average rating
        avg_rating = Rating.objects.filter(story_id=story_id).aggregate(
            avg_rating=Avg('rating'),
            count=Count('id')
        )
        
        # Get user's rating if exists
        user_rating = None
        try:
            user_rating_obj = Rating.objects.get(
                user=request.user,
                story_id=story_id
            )
            user_rating = user_rating_obj.rating
        except Rating.DoesNotExist:
            pass
        
        return Response({
            'avg_rating': avg_rating['avg_rating'] or 0,
            'count': avg_rating['count'] or 0,
            'user_rating': user_rating
        })

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require authentication
    
    def perform_create(self, serializer):
        # Automatically set the user to the current authenticated user
        serializer.save(user=self.request.user)
    
    def get_queryset(self):
        """
        Optionally restricts the returned comments to a given story,
        by filtering against a `story_id` query parameter in the URL.
        """
        queryset = Comment.objects.all().order_by('-created_at')  # Order by newest first
        story_id = self.request.query_params.get('story_id', None)
        if story_id is not None:
            queryset = queryset.filter(story_id=story_id)
        return queryset
    
class StorySearchView(ListAPIView):
    serializer_class = StorySerializer  # Use your existing serializer
    
    def get_queryset(self):
        search_term = self.request.query_params.get('q', '').strip()
        
        if not search_term:
            return Story.objects.none()
            
        return Story.objects.filter(
            Q(title__icontains=search_term) | 
            Q(author_name__icontains=search_term) |
            Q(historic_site_name__icontains=search_term) |  # Optional: search historic sites too
            Q(food_name__icontains=search_term)           # Optional: search food names
        ).distinct().order_by('-created_at')[:20]  # Limit to 20 most recent results
@api_view(['POST'])
def translate_to_nepali(request):
    """
    Translates English text to Nepali using MyMemory API
    """
    try:
        # Get the input text
        text = request.data.get('text', '')
        
        if not text:
            return Response({"error": "Text parameter is required"}, status=400)
        
        # Check if input is a JSON string and parse it if needed
        try:
            # If it's JSON, we'll need to handle each field separately
            data = json.loads(text)
            result = {}
            
            # Process each field with separate API calls to avoid exceeding length limits
            for key, value in data.items():
                if not value or not isinstance(value, str):
                    result[key] = value
                    continue
                    
                # For longer text, break it into chunks
                if len(value) > 500:
                    chunks = [value[i:i+500] for i in range(0, len(value), 500)]
                    translated_chunks = []
                    
                    for chunk in chunks:
                        try:
                            response = requests.get(
                                "http://api.mymemory.translated.net/get",
                                params={
                                    "q": chunk,
                                    "langpair": "en|ne"
                                },
                                timeout=10  # Add timeout to prevent hanging
                            )
                            chunk_data = response.json()
                            translated_chunk = chunk_data.get("responseData", {}).get("translatedText", chunk)
                            translated_chunks.append(translated_chunk)
                        except Exception as e:
                            # If a chunk fails, use the original
                            translated_chunks.append(chunk)
                            print(f"Translation error for chunk: {str(e)}")
                    
                    result[key] = "".join(translated_chunks)
                else:
                    try:
                        response = requests.get(
                            "http://api.mymemory.translated.net/get",
                            params={
                                "q": value,
                                "langpair": "en|ne"
                            },
                            timeout=10  # Add timeout
                        )
                        field_data = response.json()
                        result[key] = field_data.get("responseData", {}).get("translatedText", value)
                    except Exception as e:
                        # If translation fails, keep original text
                        result[key] = value
                        print(f"Translation error for field {key}: {str(e)}")
            
            return Response({
                "original": text,
                "translation": json.dumps(result)  # Return as JSON string
            })
            
        except json.JSONDecodeError:
            # If not JSON, treat as plain text
            response = requests.get(
                "http://api.mymemory.translated.net/get",
                params={
                    "q": text,
                    "langpair": "en|ne"
                },
                timeout=10
            )
            data = response.json()
            translated_text = data.get("responseData", {}).get("translatedText", text)
            
            return Response({
                "original": text,
                "translation": translated_text
            })
            
    except Exception as e:
        import traceback
        print(f"Translation error: {str(e)}")
        print(traceback.format_exc())
        return Response({
            "error": str(e),
            "original": request.data.get('text', ''),
            "translation": request.data.get('text', '')  # Fallback to original
        }, status=500)