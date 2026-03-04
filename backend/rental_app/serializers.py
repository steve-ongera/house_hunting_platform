from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (
    User, LandlordProfile, House, HouseImage, HouseVideo,
    Review, Booking, ChatRoom, Message, Notification
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone', 'avatar', 'role', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name',
                  'phone', 'password', 'confirm_password', 'role']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        if user.role == 'landlord':
            LandlordProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        data['user'] = user
        return data


class HouseImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseImage
        fields = ['id', 'image', 'caption', 'is_cover', 'order']


class HouseVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HouseVideo
        fields = ['id', 'video', 'thumbnail', 'title', 'duration_seconds', 'created_at']


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'reviewer_name', 'reviewer_email', 'rating',
                  'comment', 'house', 'created_at', 'is_verified']
        read_only_fields = ['id', 'created_at', 'is_verified']


class LandlordProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    total_houses = serializers.IntegerField(read_only=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)

    class Meta:
        model = LandlordProfile
        fields = ['id', 'user', 'business_name', 'whatsapp', 'total_houses',
                  'average_rating', 'response_rate', 'joined_date', 'reviews']


class LandlordProfileMiniSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = LandlordProfile
        fields = ['id', 'user', 'business_name', 'average_rating', 'total_houses', 'whatsapp']


class HouseListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    landlord = LandlordProfileMiniSerializer(read_only=True)
    images_count = serializers.SerializerMethodField()
    videos_count = serializers.SerializerMethodField()

    class Meta:
        model = House
        fields = [
            'id', 'title', 'category', 'location', 'address',
            'rent', 'deposit', 'electricity', 'status', 'is_featured',
            'cover_image', 'landlord', 'images_count', 'videos_count',
            'has_parking', 'has_shower', 'has_balcony', 'bedrooms',
            'bathrooms', 'floor_number', 'views_count', 'created_at'
        ]

    def get_cover_image(self, obj):
        img = obj.cover_image
        if img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.image.url)
        return None

    def get_images_count(self, obj):
        return obj.images.count()

    def get_videos_count(self, obj):
        return obj.videos.count()


class HouseDetailSerializer(serializers.ModelSerializer):
    images = HouseImageSerializer(many=True, read_only=True)
    videos = HouseVideoSerializer(many=True, read_only=True)
    landlord = LandlordProfileSerializer(read_only=True)

    class Meta:
        model = House
        fields = [
            'id', 'title', 'description', 'category', 'location', 'address',
            'latitude', 'longitude', 'rent', 'deposit', 'electricity',
            'floor_number', 'has_parking', 'has_shower', 'has_balcony',
            'has_tiles', 'has_wifi', 'has_water', 'has_security',
            'has_gym', 'has_swimming_pool', 'interior_color',
            'bedrooms', 'bathrooms', 'status', 'is_featured',
            'views_count', 'images', 'videos', 'landlord',
            'created_at', 'updated_at'
        ]


class HouseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = House
        fields = [
            'title', 'description', 'category', 'location', 'address',
            'latitude', 'longitude', 'rent', 'deposit', 'electricity',
            'floor_number', 'has_parking', 'has_shower', 'has_balcony',
            'has_tiles', 'has_wifi', 'has_water', 'has_security',
            'has_gym', 'has_swimming_pool', 'interior_color',
            'bedrooms', 'bathrooms', 'status'
        ]

    def create(self, validated_data):
        landlord = self.context['request'].user.landlord_profile
        house = House.objects.create(landlord=landlord, **validated_data)
        landlord.total_houses = landlord.houses.count()
        landlord.save()
        return house


class BookingSerializer(serializers.ModelSerializer):
    house_title = serializers.CharField(source='house.title', read_only=True)
    house_location = serializers.CharField(source='house.location', read_only=True)
    house_rent = serializers.DecimalField(source='house.rent', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'house', 'house_title', 'house_location', 'house_rent',
            'tenant_name', 'tenant_email', 'tenant_phone',
            'amount_paid', 'status', 'reservation_expires',
            'mpesa_transaction_id', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'amount_paid', 'reservation_expires',
                            'mpesa_transaction_id', 'created_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['house', 'tenant_name', 'tenant_email', 'tenant_phone', 'notes']

    def validate_house(self, house):
        if house.status != 'available':
            raise serializers.ValidationError("This house is not available for booking.")
        return house


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender_type', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'is_read', 'created_at']


class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    house_title = serializers.CharField(source='house.title', read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            'id', 'house', 'house_title', 'tenant_name', 'tenant_email',
            'tenant_phone', 'last_message_at', 'messages', 'unread_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'last_message_at']

    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=False, sender_type='tenant').count()


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['house', 'tenant_name', 'tenant_email', 'tenant_phone']

    def create(self, validated_data):
        house = validated_data['house']
        existing = ChatRoom.objects.filter(
            house=house,
            tenant_email=validated_data.get('tenant_email', '')
        ).first()
        if existing:
            return existing
        validated_data['landlord'] = house.landlord
        return super().create(validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'type', 'title', 'body', 'is_read', 'related_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class MpesaPaymentSerializer(serializers.Serializer):
    booking_id = serializers.UUIDField()
    phone_number = serializers.CharField(max_length=13)

    def validate_phone_number(self, value):
        value = value.replace('+', '').replace(' ', '')
        if not value.startswith('254'):
            if value.startswith('0'):
                value = '254' + value[1:]
            else:
                value = '254' + value
        if len(value) != 12:
            raise serializers.ValidationError("Invalid Kenyan phone number.")
        return value