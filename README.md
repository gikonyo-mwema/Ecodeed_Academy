# Ecodeed Academy

[![Backend CI](https://github.com/gikonyo-mwema/Ecodeed_Academy/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/gikonyo-mwema/Ecodeed_Academy/actions/workflows/backend-ci.yml)
[![Docker](https://img.shields.io/badge/Docker-gikonyomwema%2Fecodeed--backend-blue)](https://hub.docker.com/r/gikonyomwema/ecodeed-backend)

An online learning platform built with Django REST Framework and React + Vite. Supports courses, blog posts, payments via Paystack, async email via Celery + Brevo, social authentication, and role-based dashboards for students, instructors, and admins.

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [PROJECT_DOCUMENTATION_INDEX.md](PROJECT_DOCUMENTATION_INDEX.md) | Master index and maintenance rules |
| [FRONTEND_DOCUMENTATION_COMPLETE.md](FRONTEND_DOCUMENTATION_COMPLETE.md) | Frontend architecture and component docs |
| [BACKEND_API_DOCUMENTATION.md](BACKEND_API_DOCUMENTATION.md) | Complete backend API reference |
| [FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md) | Full-stack request/response flows |
| [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) | Historical change log |

---

## 🏗️ Project Structure

```
Ecodeed_Academy/
├── backend/
│   ├── config/             # Django settings, Celery config, URL routing
│   ├── users/              # Custom user model, JWT auth, social OAuth
│   ├── courses/            # Courses, modules, lessons, assignments, live sessions
│   ├── posts/              # Blog posts, categories, tags, feeds, sitemaps
│   ├── comments/           # Post & lesson comments with moderation
│   ├── payments/           # Paystack payment flow and webhook handling
│   ├── messages_app/       # Contact form, newsletter, Brevo email campaigns
│   ├── services/           # Professional services catalog
│   ├── requirements.txt
│   ├── manage.py
│   ├── start.sh            # Container entrypoint (Redis → migrate → Celery → Gunicorn)
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components (Admin, Dashboard, etc.)
│   │   ├── pages/          # Route-level page components
│   │   ├── redux/          # Redux Toolkit store and slices
│   │   └── utils/          # API helpers, Cloudinary utils
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile / Dockerfile.dev
├── .github/workflows/
│   └── backend-ci.yml      # Ruff lint + Django tests on MySQL
├── docker-compose.yml      # Dev: backend + db + frontend
└── docker-compose.prod.yml # Prod: pre-built images
```

---

## 🚀 Features

### Role-Based Dashboards
- **Student**: Enrolled courses, progress tracking, week-based curriculum, assignments
- **Instructor**: Course authoring, student roster, earnings, live session scheduling
- **Admin**: User management, enrollment management, content moderation, newsletter campaigns, announcements, platform analytics

### Core Platform
- **Authentication**: JWT (access 15 min, refresh 7 days), social login (Google, Facebook, Twitter), email-based custom user model
- **Courses**: Multi-level hierarchy — Course → Modules → Lessons → Assignments → Live Sessions → Resources; draft/publish workflow; free & paid enrollment
- **Payments**: Paystack integration (card + M-Pesa); webhook-based verification; auto-enrollment on success
- **Blog**: Rich HTML posts (TipTap editor); categories, tags, search, pagination; RSS/Atom feeds; XML sitemaps
- **Comments**: Threaded comments on posts and lessons; moderation workflow; like system
- **Newsletter & Email**: Double opt-in subscriptions; Brevo API for bulk & transactional email; all emails queued via Celery
- **Services Catalog**: EIA, EA, Training, Consulting, Research — with pricing, timelines, FAQs, deliverables
- **Media**: Cloudinary CDN for profile pictures and post images (5 MB limit, JPEG/PNG/GIF/WebP/AVIF)
- **API Docs**: Swagger UI + ReDoc (auto-generated from drf-yasg)

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | Django 4.2 + Django REST Framework |
| Language | Python 3.10 |
| Database | MySQL 8.0 (utf8mb4) |
| Task Queue | Celery 5.5 + Redis 6.1 |
| Authentication | JWT (SimpleJWT), django-allauth (OAuth) |
| Email | Brevo API + SMTP relay |
| Media CDN | Cloudinary |
| Payments | Paystack |
| API Docs | drf-yasg (OpenAPI 3.0) |
| Linting | Ruff |
| WSGI Server | Gunicorn |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 + Flowbite |
| State | Redux Toolkit 2 + Redux Persist |
| Editor | TipTap 3 (rich text) |
| Auth | Firebase 11 |
| Payments | @paystack/inline-js |
| Routing | React Router DOM 6 |
| Animation | Framer Motion 12 |
| Video | React Player 2 |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Containerisation | Docker + Docker Compose |
| Dev proxy / Prod server | Vite proxy / Nginx |
| Background jobs | Celery workers (in backend container) |
| Message broker | Redis (in-process in dev container) |
| CI/CD | GitHub Actions |

---

## 📋 Prerequisites

- Docker & Docker Compose **or** Python 3.10+ / Node.js 18+ / MySQL 8.0 installed locally

---

## 🏃 Quick Start

### Using Docker (Recommended)

```bash
git clone https://github.com/gikonyo-mwema/Ecodeed_Academy.git
cd Ecodeed_Academy

# Copy and fill in environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

docker-compose up -d

# Frontend:    http://localhost:5173
# Backend API: http://localhost:8000
# Swagger UI:  http://localhost:8000/swagger/
```

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # edit with your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env          # edit with your values
npm run dev
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
# ── Core ───────────────────────────────────────────────────────────────────────
SECRET_KEY=your-django-secret-key          # required
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,backend
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ── Database (MySQL) ──────────────────────────────────────────────────────────
MYSQL_DATABASE=ecodeed_db                  # required
MYSQL_USER=ecodeed_user                    # required
MYSQL_PASSWORD=your-db-password            # required
MYSQL_ROOT_PASSWORD=your-root-password     # required (Docker)
MYSQL_HOST=db                              # use 'localhost' outside Docker
MYSQL_PORT=3306

# ── URLs ──────────────────────────────────────────────────────────────────────
SITE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# ── Celery / Redis ────────────────────────────────────────────────────────────
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# ── Payments (Paystack) ───────────────────────────────────────────────────────
PAYSTACK_SECRET_KEY=sk_live_...            # required for payments
PAYSTACK_PUBLIC_KEY=pk_live_...            # required for payments
PAYSTACK_WEBHOOK_SECRET=                   # optional in dev

# ── Email (Brevo / Sendinblue) ────────────────────────────────────────────────
BREVO_API_KEY=
BREVO_SMTP_LOGIN=
BREVO_SMTP_KEY=
BREVO_SENDER_EMAIL=noreply@ecodeedacademy.com
BREVO_SENDER_NAME=Ecodeed
BREVO_NEWSLETTER_LIST_ID=0
DEFAULT_FROM_EMAIL=Ecodeed <noreply@ecodeed.co.ke>
ADMIN_CONTACT_EMAIL=contact@ecodeed.co.ke
ADMIN_CONTACT_NAME=Ecodeed Team

# ── Social OAuth ──────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# ── Media / Storage (Cloudinary) ──────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`frontend/.env`)

```env
# ── API ───────────────────────────────────────────────────────────────────────
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000

# ── Firebase ──────────────────────────────────────────────────────────────────
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# ── Payments (Paystack) ───────────────────────────────────────────────────────
VITE_PAYSTACK_PUBLIC_KEY=pk_live_...
```

---

## 🐳 Docker Architecture

### Development (`docker-compose.yml`)

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `backend` | Custom build | 8000 | Django + Redis (in-process) + Celery worker + Gunicorn |
| `db` | mysql:8 | 3306 (local only) | MySQL 8.0 with persistent volume |
| `frontend` | Custom build | 5173 | Vite dev server with HMR |

**Backend startup order** (`start.sh`):
1. `redis-server` — in-memory broker (no persistence)
2. `python manage.py migrate` — apply schema changes
3. `celery -A config worker` — async email/task worker
4. `gunicorn config.wsgi:application` — API server (3 workers)

### Production (`docker-compose.prod.yml`)

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| `frontend` | Docker Hub pre-built | 8080 | Nginx serving compiled React SPA |
| `backend` | Docker Hub pre-built | — | Same startup as dev |
| `db` | mysql:8 | — | MySQL with tuned InnoDB buffer pool |

> Requires `DOCKERHUB_USER` environment variable for image pulls.

---

## 🧪 Running Tests

```bash
cd backend
python manage.py test

# With coverage
coverage run manage.py test
coverage report -m
```

---

## 📝 Code Quality

Uses [Ruff](https://github.com/astral-sh/ruff) for linting and formatting.

```bash
ruff check backend/           # lint
ruff check --fix backend/     # auto-fix
ruff format backend/          # format
```

---

## 🔄 CI/CD Pipeline

**Workflow**: [.github/workflows/backend-ci.yml](.github/workflows/backend-ci.yml)

**Triggers**: push to `develop` or `feature/**`; PRs to `develop` or `master`

| Job | Depends on | What it does |
|-----|-----------|--------------|
| `lint` | — | Ruff check + format check |
| `test` | `lint` | Django tests against MySQL 8 service container |

---

## 🌿 Git Workflow

| Branch | Purpose |
|--------|---------|
| `master` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | Feature development |

---

## 📚 Key API Endpoints

Full reference: [BACKEND_API_DOCUMENTATION.md](BACKEND_API_DOCUMENTATION.md)
Interactive docs: `http://localhost:8000/swagger/` | `http://localhost:8000/redoc/`

### Auth
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register/` | POST | Register new user |
| `/api/v1/auth/login/` | POST | Obtain JWT tokens |
| `/api/v1/auth/logout/` | POST | Blacklist refresh token |
| `/api/v1/auth/jwt/refresh/` | POST | Refresh access token |
| `/api/v1/auth/profile/` | GET/PUT | View/update own profile |
| `/api/v1/auth/users/getUsers/` | GET | List all users (admin) |

### Courses & Enrollment
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/courses/` | GET/POST | Browse / create courses |
| `/api/v1/enrollments/` | GET/POST | Admin enrollment management |
| `/api/v1/enrollments/my-courses/` | GET | Student enrolled courses |
| `/api/v1/lessons/{id}/complete/` | POST | Mark lesson complete |
| `/api/v1/assignments/{id}/submit/` | POST | Submit assignment |

### Payments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/payments/verify/` | POST | Verify Paystack payment + auto-enroll |
| `/api/v1/payments/webhook/` | POST | Paystack webhook (HMAC-SHA512) |

### Blog & Comments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/posts/` | GET/POST | List / create posts |
| `/api/v1/posts/{slug}/` | GET/PUT/DELETE | Post detail |
| `/api/v1/comments/` | GET/POST | Post comments |

### Newsletter & Messaging
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/messages/newsletter/subscribe/` | POST | Subscribe to newsletter |
| `/api/v1/messages/newsletter/unsubscribe/` | POST | Unsubscribe |
| `/api/v1/messages/newsletter/broadcast/` | POST | Send campaign (admin) |
| `/api/v1/messages/contact/` | POST | Send contact form message |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'feat: your feature description'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request targeting `develop`

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 👥 Authors

**Gikonyo Mwema** — [GitHub](https://github.com/gikonyo-mwema)
