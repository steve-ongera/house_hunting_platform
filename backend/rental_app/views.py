from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
import requests
import base64
from datetime import datetime, timedelta

from .models import (
    User, LandlordProfile, House, HouseImage, HouseVideo,
    Review, Booking, ChatRoom, Message, Notification
)
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    LandlordProfileSerializer, HouseListSerializer,
    HouseDetailSerializer, HouseCreateSerializer,
    HouseImageSerializer, HouseVideoSerializer,
    ReviewSerializer, BookingSerializer, BookingCreateSerializer,
    ChatRoomSerializer, ChatRoomCreateSerializer,
    MessageSerializer, NotificationSerializer, MpesaPaymentSerializer
)


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Account created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def logout(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)


class LandlordProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LandlordProfile.objects.all().select_related('user')
    serializer_class = LandlordProfileSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_profile(self, request):
        try:
            profile = request.user.landlord_profile
            return Response(LandlordProfileSerializer(profile).data)
        except LandlordProfile.DoesNotExist:
            return Response({'detail': 'Not a landlord account.'}, status=404)

    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_profile(self, request):
        try:
            profile = request.user.landlord_profile
            serializer = LandlordProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        except LandlordProfile.DoesNotExist:
            return Response({'detail': 'Not a landlord account.'}, status=404)

    @action(detail=True, methods=['get'])
    def houses(self, request, pk=None):
        landlord = self.get_object()
        houses = House.objects.filter(landlord=landlord)
        serializer = HouseListSerializer(houses, many=True, context={'request': request})
        return Response(serializer.data)


class HouseViewSet(viewsets.ModelViewSet):
    queryset = House.objects.all().select_related('landlord__user').prefetch_related('images', 'videos')
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'list':
            return HouseListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return HouseCreateSerializer
        return HouseDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy',
                           'upload_images', 'upload_video', 'delete_image']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        queryset = House.objects.all().select_related('landlord__user').prefetch_related('images', 'videos')
        params = self.request.query_params

        category = params.get('category')
        location = params.get('location')
        min_rent = params.get('min_rent')
        max_rent = params.get('max_rent')
        search = params.get('search')
        status_filter = params.get('status', 'available')
        has_parking = params.get('has_parking')
        has_balcony = params.get('has_balcony')
        electricity = params.get('electricity')
        featured = params.get('featured')

        if category:
            queryset = queryset.filter(category=category)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if min_rent:
            queryset = queryset.filter(rent__gte=min_rent)
        if max_rent:
            queryset = queryset.filter(rent__lte=max_rent)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(address__icontains=search) |
                Q(description__icontains=search)
            )
        if status_filter and status_filter != 'all':
            queryset = queryset.filter(status=status_filter)
        if has_parking:
            queryset = queryset.filter(has_parking=True)
        if has_balcony:
            queryset = queryset.filter(has_balcony=True)
        if electricity:
            queryset = queryset.filter(electricity=electricity)
        if featured:
            queryset = queryset.filter(is_featured=True)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'landlord_profile'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only landlords can create listings.")
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_images(self, request, pk=None):
        house = self.get_object()
        if house.landlord.user != request.user:
            return Response({'detail': 'Permission denied.'}, status=403)
        images = request.FILES.getlist('images')
        created = []
        for i, image in enumerate(images):
            img = HouseImage.objects.create(
                house=house,
                image=image,
                caption=request.data.get(f'caption_{i}', ''),
                is_cover=(i == 0 and not house.images.filter(is_cover=True).exists()),
                order=house.images.count() + i
            )
            created.append(HouseImageSerializer(img, context={'request': request}).data)
        return Response(created, status=201)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def upload_video(self, request, pk=None):
        house = self.get_object()
        if house.landlord.user != request.user:
            return Response({'detail': 'Permission denied.'}, status=403)
        video_file = request.FILES.get('video')
        if not video_file:
            return Response({'detail': 'No video file provided.'}, status=400)
        video = HouseVideo.objects.create(
            house=house,
            video=video_file,
            title=request.data.get('title', ''),
            thumbnail=request.FILES.get('thumbnail')
        )
        return Response(HouseVideoSerializer(video, context={'request': request}).data, status=201)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_image(self, request, pk=None):
        house = self.get_object()
        if house.landlord.user != request.user:
            return Response({'detail': 'Permission denied.'}, status=403)
        image_id = request.data.get('image_id')
        try:
            img = house.images.get(id=image_id)
            img.delete()
            return Response({'message': 'Image deleted.'})
        except HouseImage.DoesNotExist:
            return Response({'detail': 'Image not found.'}, status=404)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_listings(self, request):
        try:
            landlord = request.user.landlord_profile
            houses = House.objects.filter(landlord=landlord)
            serializer = HouseListSerializer(houses, many=True, context={'request': request})
            return Response(serializer.data)
        except LandlordProfile.DoesNotExist:
            return Response({'detail': 'Not a landlord.'}, status=403)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        from .models import CATEGORY_CHOICES, LOCATION_CHOICES
        return Response({
            'categories': [{'value': k, 'label': v} for k, v in CATEGORY_CHOICES],
            'locations': [{'value': k, 'label': v} for k, v in LOCATION_CHOICES],
        })

    @action(detail=False, methods=['get'])
    def featured(self, request):
        houses = House.objects.filter(is_featured=True, status='available')[:6]
        return Response(HouseListSerializer(houses, many=True, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total_houses': House.objects.filter(status='available').count(),
            'total_landlords': LandlordProfile.objects.count(),
            'locations': House.objects.values_list('location', flat=True).distinct().count(),
        })


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all().select_related('landlord__user')
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]

    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        landlord_id = self.request.query_params.get('landlord_id')
        if landlord_id:
            return Review.objects.filter(landlord_id=landlord_id)
        return Review.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save()
            Notification.objects.create(
                landlord=review.landlord,
                type='review',
                title='New Review Received',
                body=f'{review.reviewer_name} left a {review.rating}-star review.',
                related_id=str(review.id)
            )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        serializer = BookingCreateSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save()
            # Create notification for landlord
            Notification.objects.create(
                landlord=booking.house.landlord,
                type='booking',
                title='New Booking Request',
                body=f'{booking.tenant_name} wants to book {booking.house.title}.',
                related_id=str(booking.id)
            )

            if not settings.DEBUG:
                return Response({
                    'booking_id': str(booking.id),
                    'message': 'Booking created. Proceed to M-Pesa payment.',
                    'amount': str(booking.house.deposit),
                    'house': booking.house.title,
                }, status=201)
            else:
                # In DEBUG mode, auto-confirm booking
                booking.status = 'paid'
                booking.amount_paid = booking.house.deposit
                booking.reservation_expires = timezone.now() + timedelta(days=3)
                booking.mpesa_transaction_id = f'DEBUG-{booking.id}'
                booking.save()
                return Response({
                    'booking_id': str(booking.id),
                    'message': 'Booking confirmed (DEBUG mode - no real payment).',
                    'status': 'paid',
                    'reservation_expires': booking.reservation_expires,
                }, status=201)

        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def initiate_mpesa(self, request):
        if settings.DEBUG:
            return Response({'message': 'M-Pesa disabled in DEBUG mode.'}, status=400)

        serializer = MpesaPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        booking_id = serializer.validated_data['booking_id']
        phone = serializer.validated_data['phone_number']

        try:
            booking = Booking.objects.get(id=booking_id, status='pending')
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found or already paid.'}, status=404)

        try:
            token = _get_mpesa_token()
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            shortcode = settings.MPESA_SHORTCODE
            passkey = settings.MPESA_PASSKEY
            password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()

            payload = {
                "BusinessShortCode": shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(booking.house.deposit),
                "PartyA": phone,
                "PartyB": shortcode,
                "PhoneNumber": phone,
                "CallBackURL": settings.MPESA_CALLBACK_URL,
                "AccountReference": f"NYUMBA-{str(booking.id)[:8].upper()}",
                "TransactionDesc": f"Deposit for {booking.house.title}"
            }

            response = requests.post(
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers={"Authorization": f"Bearer {token}"}
            )
            data = response.json()

            if data.get('ResponseCode') == '0':
                booking.mpesa_checkout_request_id = data['CheckoutRequestID']
                booking.save()
                return Response({
                    'message': 'STK push sent. Enter PIN on your phone.',
                    'checkout_request_id': data['CheckoutRequestID']
                })
            return Response({'detail': data.get('errorMessage', 'M-Pesa error.')}, status=400)

        except Exception as e:
            return Response({'detail': str(e)}, status=500)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def mpesa_callback(self, request):
        data = request.data
        try:
            result = data['Body']['stkCallback']
            if result['ResultCode'] == 0:
                items = {i['Name']: i.get('Value') for i in result['CallbackMetadata']['Item']}
                checkout_id = result['CheckoutRequestID']
                transaction_id = items.get('MpesaReceiptNumber', '')
                amount = items.get('Amount', 0)

                booking = Booking.objects.get(mpesa_checkout_request_id=checkout_id)
                booking.status = 'paid'
                booking.mpesa_transaction_id = transaction_id
                booking.amount_paid = amount
                booking.save()

                Notification.objects.create(
                    landlord=booking.house.landlord,
                    type='payment',
                    title='Payment Received',
                    body=f'KES {amount} received from {booking.tenant_name} for {booking.house.title}.',
                    related_id=str(booking.id)
                )
        except Exception:
            pass
        return Response({'ResultCode': 0, 'ResultDesc': 'Success'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def landlord_bookings(self, request):
        try:
            landlord = request.user.landlord_profile
            bookings = Booking.objects.filter(house__landlord=landlord).select_related('house')
            return Response(BookingSerializer(bookings, many=True).data)
        except LandlordProfile.DoesNotExist:
            return Response({'detail': 'Not a landlord.'}, status=403)


def _get_mpesa_token():
    key = settings.MPESA_CONSUMER_KEY
    secret = settings.MPESA_CONSUMER_SECRET
    credentials = base64.b64encode(f"{key}:{secret}".encode()).decode()
    response = requests.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        headers={"Authorization": f"Basic {credentials}"}
    )
    return response.json()['access_token']


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        if self.request.user.is_authenticated and hasattr(self.request.user, 'landlord_profile'):
            return ChatRoom.objects.filter(landlord=self.request.user.landlord_profile)
        room_id = self.request.query_params.get('room_id')
        if room_id:
            return ChatRoom.objects.filter(id=room_id)
        return ChatRoom.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return ChatRoomCreateSerializer
        return ChatRoomSerializer

    def create(self, request, *args, **kwargs):
        serializer = ChatRoomCreateSerializer(data=request.data)
        if serializer.is_valid():
            room = serializer.save()
            Notification.objects.create(
                landlord=room.landlord,
                type='message',
                title='New Chat Started',
                body=f'{room.tenant_name} wants to chat about {room.house.title}.',
                related_id=str(room.id)
            )
            return Response(ChatRoomSerializer(room).data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'])
    def send_message(self, request, pk=None):
        room = self.get_object()
        content = request.data.get('content', '').strip()
        sender_type = request.data.get('sender_type', 'tenant')

        if not content:
            return Response({'detail': 'Message cannot be empty.'}, status=400)

        msg = Message.objects.create(room=room, content=content, sender_type=sender_type)
        room.last_message_at = timezone.now()
        room.save(update_fields=['last_message_at'])

        if sender_type == 'tenant':
            Notification.objects.create(
                landlord=room.landlord,
                type='message',
                title='New Message',
                body=f'{room.tenant_name}: {content[:80]}',
                related_id=str(room.id)
            )

        return Response(MessageSerializer(msg).data, status=201)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        room = self.get_object()
        room.messages.filter(sender_type='tenant', is_read=False).update(is_read=True)
        return Response({'message': 'Messages marked as read.'})


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            return Notification.objects.filter(landlord=self.request.user.landlord_profile)
        except LandlordProfile.DoesNotExist:
            return Notification.objects.none()

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        try:
            Notification.objects.filter(
                landlord=request.user.landlord_profile, is_read=False
            ).update(is_read=True)
            return Response({'message': 'All notifications marked as read.'})
        except LandlordProfile.DoesNotExist:
            return Response({'detail': 'Not a landlord.'}, status=403)

    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Marked as read.'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        try:
            count = Notification.objects.filter(
                landlord=request.user.landlord_profile, is_read=False
            ).count()
            return Response({'count': count})
        except LandlordProfile.DoesNotExist:
            return Response({'count': 0})