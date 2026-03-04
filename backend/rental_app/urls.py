from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, LandlordProfileViewSet, HouseViewSet,
    ReviewViewSet, BookingViewSet, ChatRoomViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'landlords', LandlordProfileViewSet, basename='landlord')
router.register(r'houses', HouseViewSet, basename='house')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'chats', ChatRoomViewSet, basename='chat')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]