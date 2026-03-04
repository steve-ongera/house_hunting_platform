# 🏠 Nyumba – Kenya House Hunting Platform

Find your next home without an account. Nyumba connects tenants and landlords across Kenya, featuring direct chat, video tours, M-Pesa deposit payments, and instant reservations.

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🔍 Browse without account | No signup needed to search or view houses |
| 📍 Location-based search | Nairobi, Mombasa, Kisumu, Rongai & 14+ areas |
| 🏷️ Category filter | Bedsitter, Studio, 1BR, Maisonette, Bungalow, etc. |
| 📸 Image gallery | Multiple photos per listing with cover image |
| 🎬 Video tours | Short snip videos of each house |
| 💬 Direct chat | Tenants chat with landlords instantly (no account needed) |
| 📱 M-Pesa payments | Pay deposit via STK push (production only) |
| 🔒 House reservation | Deposit holds the house for 3 days automatically |
| ⭐ Landlord reviews | Ratings and comments from real tenants |
| 🏡 Landlord dashboard | Manage listings, chats, bookings, notifications |
| 🔔 Notifications | Landlords notified on bookings, messages, payments, reviews |
| 📋 Amenity details | Parking, balcony, shower, WiFi, tiles, floor, electricity type |
| 🎨 Interior details | Interior color, floor number, balcony info |

---

## 🗂 Project Structure

```
nyumba/
├── backend/                        # Django REST API
│   ├── nyumba/
│   │   ├── settings.py             # All settings including M-Pesa config
│   │   ├── urls.py                 # Root URLs → path('api/', include('rental_app.urls'))
│   │   └── wsgi.py
│   ├── rental_app/
│   │   ├── models.py               # User, LandlordProfile, House, HouseImage,
│   │   │                           # HouseVideo, Review, Booking, ChatRoom,
│   │   │                           # Message, Notification
│   │   ├── serializers.py          # All DRF serializers
│   │   ├── views.py                # ViewSets + M-Pesa STK push logic
│   │   ├── urls.py                 # DefaultRouter registrations
│   │   ├── admin.py                # Django admin config
│   │   └── apps.py
│   └── requirements.txt
│
└── frontend/                       # React + Vite
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx                # Entry point
        ├── App.jsx                 # Router + Layout + ProtectedRoute
        ├── index.css               # Full design system (no Tailwind needed)
        ├── context/
        │   └── AuthContext.jsx     # Login, register, logout, useAuth hook
        ├── services/
        │   └── api.js              # All API calls (authAPI, housesAPI,
        │                           # landlordAPI, reviewsAPI, bookingsAPI,
        │                           # chatAPI, notificationsAPI)
        ├── components/
        │   ├── Navbar.jsx          # Sticky nav with notification badge
        │   ├── Sidebar.jsx         # Drawerable sidebar (mobile + desktop)
        │   ├── HouseCard.jsx       # House listing card with badges
        │   ├── ChatWidget.jsx      # Floating chat bubble (no account needed)
        │   └── BookingModal.jsx    # Book + M-Pesa / debug auto-confirm
        └── pages/
            ├── HomePage.jsx        # Hero, search, categories, locations, featured
            ├── HousesPage.jsx      # Filtered listing with search bar
            ├── HouseDetailPage.jsx # Gallery, video, tabs, chat, booking
            ├── AuthPages.jsx       # LoginPage + RegisterPage
            └── DashboardPages.jsx  # DashboardPage, MyListingsPage, AddHousePage,
                                    # ChatsPage, BookingsPage, NotificationsPage
```

---

## ⚙️ Backend Setup (Django)

### 1. Create & activate virtual environment

```bash
cd nyumba/backend
python -m venv venv

# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Create the Django project files (if starting fresh)

```bash
django-admin startproject nyumba .
python manage.py startapp rental_app
```

### 4. Apply migrations

```bash
python manage.py makemigrations rental_app
python manage.py migrate
```

### 5. Create a superuser

```bash
python manage.py createsuperuser
```

### 6. Collect static files (for production)

```bash
python manage.py collectstatic
```

### 7. Run the development server

```bash
python manage.py runserver
```

API is now available at: `http://localhost:8000/api/`
Admin panel: `http://localhost:8000/admin/`

---

## 🌐 API Endpoints

All endpoints are prefixed with `/api/`

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Create account | No |
| POST | `/api/auth/login/` | Login, returns token | No |
| POST | `/api/auth/logout/` | Invalidate token | Yes |
| GET  | `/api/auth/me/` | Get current user | Yes |

### Houses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/houses/` | List all houses (filterable) | No |
| POST | `/api/houses/` | Create new listing | Yes (landlord) |
| GET | `/api/houses/{id}/` | House detail | No |
| PATCH | `/api/houses/{id}/` | Update listing | Yes (owner) |
| DELETE | `/api/houses/{id}/` | Delete listing | Yes (owner) |
| GET | `/api/houses/featured/` | Featured houses | No |
| GET | `/api/houses/categories/` | Categories + locations list | No |
| GET | `/api/houses/stats/` | Platform statistics | No |
| GET | `/api/houses/my_listings/` | Landlord's own listings | Yes |
| POST | `/api/houses/{id}/upload_images/` | Upload images | Yes (owner) |
| POST | `/api/houses/{id}/upload_video/` | Upload video | Yes (owner) |

#### Query Parameters for `/api/houses/`
```
?search=       Search title/address/description
?location=     Filter by location slug (e.g. nairobi, rongai)
?category=     Filter by category (e.g. bedsitter, one_bedroom)
?min_rent=     Minimum rent in KES
?max_rent=     Maximum rent in KES
?electricity=  token | fixed | included | shared
?has_parking=  true
?has_balcony=  true
?status=       available | booked | occupied | all
?page=         Pagination (12 per page)
```

### Landlords
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/landlords/` | List all landlords | No |
| GET | `/api/landlords/{id}/` | Landlord profile + reviews | No |
| GET | `/api/landlords/{id}/houses/` | Landlord's listings | No |
| GET | `/api/landlords/my_profile/` | Own profile | Yes |
| PATCH | `/api/landlords/update_profile/` | Update profile | Yes |

### Reviews
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reviews/?landlord_id={id}` | Reviews for a landlord | No |
| POST | `/api/reviews/` | Submit a review | No |

### Bookings
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/bookings/` | Create a booking | No |
| POST | `/api/bookings/initiate_mpesa/` | Send STK push (prod only) | No |
| POST | `/api/bookings/mpesa_callback/` | M-Pesa webhook | No |
| GET | `/api/bookings/landlord_bookings/` | Landlord's bookings | Yes |

### Chat
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/chats/` | Start a chat room | No |
| GET | `/api/chats/{id}/` | Get room + messages | No |
| GET | `/api/chats/` | Landlord's all chats | Yes |
| POST | `/api/chats/{id}/send_message/` | Send a message | No |
| POST | `/api/chats/{id}/mark_read/` | Mark messages read | Yes |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications/` | All notifications | Yes |
| GET | `/api/notifications/unread_count/` | Unread count | Yes |
| POST | `/api/notifications/mark_all_read/` | Mark all read | Yes |
| PATCH | `/api/notifications/{id}/mark_read/` | Mark one read | Yes |

---

## 💻 Frontend Setup (React)

### 1. Install dependencies

```bash
cd nyumba/frontend
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Or create `.env` manually:

```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Run development server

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

### 4. Build for production

```bash
npm run build
```

Output goes to `frontend/dist/` — copy these files into Django's static/template folder.

---

## 📱 M-Pesa Integration

### DEBUG = True (Development)
- No real payments are made
- Booking is auto-confirmed immediately
- Status is set to `paid` with a mock transaction ID
- House is reserved for 3 days automatically

### DEBUG = False (Production)
- Real Safaricom Daraja API is used
- STK Push is sent to tenant's phone
- Tenant enters M-Pesa PIN to confirm
- Webhook at `/api/bookings/mpesa_callback/` confirms booking
- House is reserved for 3 days on successful payment

### Required Environment Variables for Production

```env
DEBUG=False
SECRET_KEY=your-very-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# M-Pesa Daraja API (get from developer.safaricom.co.ke)
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/bookings/mpesa_callback/

# Database (MySQL recommended for production)
DB_NAME=nyumba_db
DB_USER=db_user
DB_PASSWORD=db_password
DB_HOST=localhost
```

### Getting Daraja Credentials
1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an account and log in
3. Go to **My Apps** → **Create App**
4. Enable **Lipa Na M-Pesa Online** (STK Push)
5. Copy your **Consumer Key**, **Consumer Secret**, and **Passkey**
6. Use **Shortcode 174379** for sandbox testing

---

## 🗃️ Database Models

```
User (extends AbstractUser)
│   role: landlord | tenant
│   phone, avatar, bio, is_verified
│
├── LandlordProfile (OneToOne → User)
│   │   business_name, whatsapp, total_houses
│   │   average_rating, response_rate
│   │
│   ├── House (ForeignKey → LandlordProfile)
│   │   │   title, description, category, location, address
│   │   │   rent, deposit, electricity (token/fixed/included/shared)
│   │   │   floor_number, bedrooms, bathrooms, interior_color
│   │   │   has_parking, has_shower, has_balcony, has_tiles
│   │   │   has_wifi, has_water, has_security, has_gym, has_swimming_pool
│   │   │   status (available/booked/occupied), is_featured
│   │   │   latitude, longitude, views_count
│   │   │
│   │   ├── HouseImage  (image, caption, is_cover, order)
│   │   ├── HouseVideo  (video, thumbnail, title, duration_seconds)
│   │   └── Booking
│   │           tenant_name, tenant_email, tenant_phone
│   │           amount_paid, status, reservation_expires
│   │           mpesa_transaction_id, mpesa_checkout_request_id
│   │
│   ├── Review
│   │       reviewer_name, reviewer_email, rating (1-5)
│   │       comment, house (FK), is_verified
│   │
│   ├── ChatRoom
│   │   │   house (FK), tenant_name, tenant_email, tenant_phone
│   │   │   last_message_at
│   │   │
│   │   └── Message
│   │           sender_type (tenant|landlord), content, is_read
│   │
│   └── Notification
│           type (booking/message/review/payment)
│           title, body, is_read, related_id
```

---

## 🖥️ Frontend Pages

| Page | Route | Auth | Description |
|------|-------|------|-------------|
| Home | `/` | No | Hero, search, categories, locations, featured houses |
| Browse | `/houses` | No | Filterable house listings |
| Detail | `/houses/:id` | No | Gallery, video, amenities, chat, booking |
| Login | `/login` | No | Landlord/tenant login |
| Register | `/register` | No | Create landlord or tenant account |
| Dashboard | `/dashboard` | Yes | Stats, recent listings, recent notifications |
| My Listings | `/dashboard/listings` | Yes | View, edit, delete listings |
| Add House | `/dashboard/add-house` | Yes | 2-step wizard: details then media upload |
| Chats | `/dashboard/chats` | Yes | Inbox + reply to tenant messages |
| Bookings | `/dashboard/bookings` | Yes | All booking requests with status |
| Notifications | `/dashboard/notifications` | Yes | All notifications with mark-read |

---

## 🎨 Design System

The frontend uses a custom CSS design system (no Tailwind needed):

```css
--brand:        #1a6b4a  (Kenyan green)
--accent:       #f4a223  (warm amber)
--danger:       #e63946  (alerts/booked badge)
--font:         Plus Jakarta Sans (headings)
--font-body:    DM Sans (body text)
--radius:       12px
--card-shadow:  layered soft shadows
```

### Key Components
- **Navbar** — Sticky, notification badge, user dropdown, mobile sidebar toggle
- **Sidebar** — Drawerable on mobile, fixed on desktop (240px), role-aware links
- **HouseCard** — Cover image, badges (Featured/Booked/Video), features, landlord mini-profile
- **ChatWidget** — Floating bottom-right chat, tenant fills name first, polls for new messages
- **BookingModal** — Multi-step: fill form → M-Pesa STK push → success screen

---

## 🚀 Deployment on cPanel

### Backend

```bash
# 1. Upload backend/ to public_html/nyumba/
# 2. In cPanel → Setup Python App:
#    - Python version: 3.10+
#    - App root: public_html/nyumba
#    - Startup file: passenger_wsgi.py
#    - Entry point: application

# 3. Create passenger_wsgi.py in project root:
```

```python
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from django.core.wsgi import get_wsgi_application
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nyumba.settings')
application = get_wsgi_application()
```

```bash
# 4. SSH into server and activate virtualenv:
source ~/virtualenv/public_html/nyumba/3.10/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
```

### Frontend

```bash
# 1. Build locally:
cd frontend
npm run build

# 2. Upload dist/ contents to public_html/ (or subdomain folder)
# 3. Create .htaccess for React Router:
```

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## 🧪 Quick Test (Development)

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Then visit `http://localhost:3000`

### Test the full flow:
1. Go to `http://localhost:3000` — browse houses without login
2. Click any house → view details, images, amenities
3. Click **Chat with Landlord** — enter your name and send a message
4. Click **Book & Pay Deposit** — fill form, confirm (auto in DEBUG mode)
5. Register as a landlord at `/register`
6. Go to `/dashboard/add-house` — add a listing with photos
7. Check `/dashboard/notifications` — see booking and message notifications

---

## 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| CORS errors | Add frontend URL to `CORS_ALLOWED_ORIGINS` in settings.py |
| Images not loading | Ensure `MEDIA_URL` and `MEDIA_ROOT` are set; run with `DEBUG=True` |
| M-Pesa not working | Set `DEBUG=False` and add all `MPESA_*` env variables |
| 500 on login | Check `AUTH_USER_MODEL = 'rental_app.User'` is in settings.py |
| Chat not updating | Chat polls every 5 seconds; check CORS and network tab |
| Booking not reserving | In DEBUG mode it auto-reserves; in prod M-Pesa callback must fire |
| Static files 404 on cPanel | Run `collectstatic` and check `STATIC_ROOT` path |

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 4.2, Django REST Framework |
| Auth | Token Authentication (DRF) |
| Database | SQLite (dev) / MySQL (prod) |
| Payments | Safaricom Daraja M-Pesa STK Push |
| Frontend | React 18, React Router v6, Vite |
| Styling | Custom CSS + Bootstrap 5 grid + Bootstrap Icons |
| Fonts | Plus Jakarta Sans + DM Sans (Google Fonts) |
| Hosting | cPanel (backend) + static hosting or same cPanel (frontend) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

Made with ❤️ in Kenya 🇰🇪 — *Nyumba* means *House* in Swahili.