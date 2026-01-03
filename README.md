# Ecodeed Academy

[![Backend CI](https://github.com/gikonyo-mwema/Ecodeed_Academy/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/gikonyo-mwema/Ecodeed_Academy/actions/workflows/backend-ci.yml)
[![Docker](https://img.shields.io/badge/Docker-gikonyomwema%2Fecodeed--backend-blue)](https://hub.docker.com/r/gikonyomwema/ecodeed-backend)

An online learning platform built with Django REST Framework (backend) and React + Vite (frontend).

## 🏗️ Project Structure

```
Ecodeed_Academy/
├── backend/                 # Django REST API
│   ├── config/             # Django settings and configuration
│   ├── users/              # User authentication and profiles
│   ├── manage.py           # Django management script
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend container definition
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # State management
│   │   └── utils/          # Utility functions
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile.dev      # Frontend dev container
├── docs/                   # Documentation
├── .github/workflows/      # CI/CD pipelines
└── docker-compose.yml      # Multi-container orchestration
```

## 🚀 Features

- **User Authentication**: JWT-based auth with social login (Google, Facebook, Twitter)
- **Course Management**: Create, browse, and enroll in courses
- **Blog System**: Educational content and articles
- **Admin Dashboard**: Administrative controls for content management
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- Python 3.10+
- Django 4.2
- Django REST Framework
- MySQL 8.0
- JWT Authentication (SimpleJWT)
- Social Auth (Google, Facebook, Twitter)

### Frontend
- React 18
- Vite
- Redux Toolkit
- Tailwind CSS
- Firebase (Social Auth)

### DevOps
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Ruff (Linting & Formatting)

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0 (or use Docker)

## 🏃 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/gikonyo-mwema/Ecodeed_Academy.git
cd Ecodeed_Academy

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
```

### Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
MYSQL_DATABASE=ecodeed_db
MYSQL_USER=ecodeed_user
MYSQL_PASSWORD=your-password
MYSQL_HOST=localhost
MYSQL_PORT=3306

# Social Auth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret
```

## 🧪 Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# With coverage
coverage run manage.py test
coverage report -m
```

## 📝 Code Quality

This project uses [Ruff](https://github.com/astral-sh/ruff) for linting and formatting.

```bash
# Check for issues
ruff check backend/

# Auto-fix issues
ruff check --fix backend/

# Format code
ruff format backend/
```

## 🌿 Git Workflow

| Branch | Purpose |
|--------|---------|
| `master` | Production-ready code |
| `develop` | Integration branch |
| `feature/*` | New features |

### CI/CD Pipeline

1. **Push to feature branch** → Runs linting + tests
2. **PR to develop** → Runs linting + tests
3. **Merge to master** → Runs linting + tests + Docker build/push

## 📚 API Documentation

API documentation is available at:
- Swagger UI: `http://localhost:8000/swagger/`
- ReDoc: `http://localhost:8000/redoc/`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | User registration |
| `/api/auth/login/` | POST | User login |
| `/api/auth/logout/` | POST | User logout |
| `/api/auth/profile/` | GET | Get user profile |
| `/api/auth/token/refresh/` | POST | Refresh JWT token |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Gikonyo Mwema** - [GitHub](https://github.com/gikonyo-mwema)

## 🙏 Acknowledgments

- Django REST Framework documentation
- React and Vite communities
- Tailwind CSS team
