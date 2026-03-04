from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, LandlordProfile, House, HouseImage, HouseVideo,
    Review, Booking, ChatRoom, Message, Notification
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_verified', 'date_joined']
    list_filter = ['role', 'is_verified']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra', {'fields': ('role', 'phone', 'avatar', 'bio', 'is_verified')}),
    )


class HouseImageInline(admin.TabularInline):
    model = HouseImage
    extra = 1


class HouseVideoInline(admin.TabularInline):
    model = HouseVideo
    extra = 1


@admin.register(House)
class HouseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'location', 'rent', 'status', 'is_featured', 'views_count']
    list_filter = ['category', 'location', 'status', 'is_featured']
    search_fields = ['title', 'address', 'description']
    inlines = [HouseImageInline, HouseVideoInline]
    list_editable = ['status', 'is_featured']


@admin.register(LandlordProfile)
class LandlordProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'business_name', 'total_houses', 'average_rating']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['tenant_name', 'house', 'amount_paid', 'status', 'created_at']
    list_filter = ['status']
    readonly_fields = ['mpesa_transaction_id', 'reservation_expires']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer_name', 'landlord', 'rating', 'is_verified', 'created_at']
    list_editable = ['is_verified']


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ['tenant_name', 'landlord', 'house', 'last_message_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['landlord', 'type', 'title', 'is_read', 'created_at']
    list_filter = ['type', 'is_read']