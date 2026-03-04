from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class User(AbstractUser):
    ROLE_CHOICES = [('landlord', 'Landlord'), ('tenant', 'Tenant')]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='tenant')
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class LandlordProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='landlord_profile')
    business_name = models.CharField(max_length=200, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    total_houses = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    response_rate = models.PositiveIntegerField(default=0, help_text="Percentage")
    joined_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Landlord: {self.user.get_full_name() or self.user.username}"

    def update_rating(self):
        reviews = Review.objects.filter(landlord=self)
        if reviews.exists():
            avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
            self.average_rating = round(avg, 2)
            self.save()


CATEGORY_CHOICES = [
    ('bedsitter', 'Bedsitter'),
    ('single_room', 'Single Room'),
    ('one_bedroom', '1 Bedroom'),
    ('two_bedroom', '2 Bedroom'),
    ('three_bedroom', '3 Bedroom'),
    ('studio', 'Studio'),
    ('penthouse', 'Penthouse'),
    ('maisonette', 'Maisonette'),
    ('bungalow', 'Bungalow'),
    ('villa', 'Villa'),
]

ELECTRICITY_CHOICES = [
    ('token', 'Token (Prepaid)'),
    ('fixed', 'Fixed Monthly'),
    ('included', 'Included in Rent'),
    ('shared', 'Shared Meter'),
]

LOCATION_CHOICES = [
    ('nairobi', 'Nairobi'),
    ('mombasa', 'Mombasa'),
    ('kisumu', 'Kisumu'),
    ('nakuru', 'Nakuru'),
    ('eldoret', 'Eldoret'),
    ('thika', 'Thika'),
    ('rongai', 'Rongai'),
    ('kikuyu', 'Kikuyu'),
    ('karen', 'Karen'),
    ('westlands', 'Westlands'),
    ('kilimani', 'Kilimani'),
    ('kasarani', 'Kasarani'),
    ('ruaka', 'Ruaka'),
    ('mlolongo', 'Mlolongo'),
    ('kitengela', 'Kitengela'),
    ('syokimau', 'Syokimau'),
    ('ngong', 'Ngong'),
    ('limuru', 'Limuru'),
]

STATUS_CHOICES = [
    ('available', 'Available'),
    ('booked', 'Booked'),
    ('occupied', 'Occupied'),
]


class House(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    landlord = models.ForeignKey(LandlordProfile, on_delete=models.CASCADE, related_name='houses')
    title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    location = models.CharField(max_length=50, choices=LOCATION_CHOICES)
    address = models.CharField(max_length=500)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Pricing
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2)
    electricity = models.CharField(max_length=20, choices=ELECTRICITY_CHOICES, default='token')

    # Features
    floor_number = models.PositiveIntegerField(default=0)
    has_parking = models.BooleanField(default=False)
    has_shower = models.BooleanField(default=False)
    has_balcony = models.BooleanField(default=False)
    has_tiles = models.BooleanField(default=False)
    has_wifi = models.BooleanField(default=False)
    has_water = models.BooleanField(default=True)
    has_security = models.BooleanField(default=False)
    has_gym = models.BooleanField(default=False)
    has_swimming_pool = models.BooleanField(default=False)
    interior_color = models.CharField(max_length=100, blank=True)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.location}"

    @property
    def cover_image(self):
        img = self.images.filter(is_cover=True).first()
        if img:
            return img
        return self.images.first()


class HouseImage(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='houses/images/')
    caption = models.CharField(max_length=200, blank=True)
    is_cover = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image for {self.house.title}"


class HouseVideo(models.Model):
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='videos')
    video = models.FileField(upload_to='houses/videos/')
    thumbnail = models.ImageField(upload_to='houses/thumbnails/', blank=True, null=True)
    title = models.CharField(max_length=200, blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Video for {self.house.title}"


class Review(models.Model):
    landlord = models.ForeignKey(LandlordProfile, on_delete=models.CASCADE, related_name='reviews')
    reviewer_name = models.CharField(max_length=200)
    reviewer_email = models.EmailField(blank=True)
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    house = models.ForeignKey(House, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.reviewer_name} - {self.rating}/5"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.landlord.update_rating()


class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid - House Reserved'),
        ('confirmed', 'Confirmed'),
        ('expired', 'Expired'),
        ('cancelled', 'Cancelled'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='bookings')
    tenant_name = models.CharField(max_length=200)
    tenant_email = models.EmailField()
    tenant_phone = models.CharField(max_length=20)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reservation_expires = models.DateTimeField(null=True, blank=True)
    mpesa_transaction_id = models.CharField(max_length=100, blank=True)
    mpesa_checkout_request_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id} - {self.house.title} by {self.tenant_name}"

    def save(self, *args, **kwargs):
        if self.status == 'paid':
            from datetime import timedelta
            from django.utils import timezone
            if not self.reservation_expires:
                self.reservation_expires = timezone.now() + timedelta(days=3)
            self.house.status = 'booked'
            self.house.save()
        super().save(*args, **kwargs)


class ChatRoom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    house = models.ForeignKey(House, on_delete=models.CASCADE, related_name='chat_rooms')
    tenant_name = models.CharField(max_length=200)
    tenant_email = models.EmailField(blank=True)
    tenant_phone = models.CharField(max_length=20, blank=True)
    landlord = models.ForeignKey(LandlordProfile, on_delete=models.CASCADE, related_name='chat_rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-last_message_at']

    def __str__(self):
        return f"Chat: {self.tenant_name} <-> {self.landlord.user.username}"


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender_type = models.CharField(max_length=10, choices=[('tenant', 'Tenant'), ('landlord', 'Landlord')])
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender_type} in {self.room.id}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('booking', 'New Booking'),
        ('message', 'New Message'),
        ('review', 'New Review'),
        ('payment', 'Payment Received'),
    ]
    landlord = models.ForeignKey(LandlordProfile, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    body = models.TextField()
    is_read = models.BooleanField(default=False)
    related_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.landlord.user.username}: {self.title}"