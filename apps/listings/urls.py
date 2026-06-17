from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ListingViewSet, CategoryViewSet

router = DefaultRouter()
router.register('listings', ListingViewSet, basename='listing')
router.register('categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
]