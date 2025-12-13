# 🚀 Backend Assignment - Full Stack Task Management System

A scalable full-stack application with **Go backend** + **React frontend** + **Supabase** for authentication and database.

## 📋 Features

### Backend (Go + Gin)
- ✅ JWT authentication with Supabase
- ✅ Role-based access control (User/Admin)
- ✅ RESTful API with versioning (`/api/v1/`)
- ✅ CRUD operations for tasks
- ✅ Admin panel for user management
- ✅ Input validation & error handling
- ✅ CORS middleware
- ✅ Structured logging

### Frontend (React + Vite)
- ✅ Modern UI with Tailwind CSS
- ✅ User authentication (Register/Login)
- ✅ Protected routes
- ✅ Task management dashboard
- ✅ Admin panel (user & task management)
- ✅ Real-time updates with Supabase
- ✅ Responsive design

### Database (Supabase PostgreSQL)
- ✅ Row Level Security (RLS) policies
- ✅ User roles table
- ✅ Tasks table with relationships
- ✅ Automated triggers for new users

---

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   React     │─────▶│   Go API    │─────▶│  Supabase   │
│  Frontend   │◀─────│   Backend   │◀─────│   Database  │
└─────────────┘      └─────────────┘      └─────────────┘
     :5173               :8080           PostgreSQL+Auth
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Go 1.21, Gin Framework |
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth (JWT) |
| **API** | RESTful, JSON |

---

## 📁 Project Structure

```
backend-assignment/
├── backend/
│   ├── cmd/
│   │   └── main.go                 # Application entry point
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go           # Configuration management
│   │   ├── handlers/
│   │   │   ├── auth.go             # Auth endpoints
│   │   │   ├── task.go             # Task CRUD endpoints
│   │   │   └── admin.go            # Admin endpoints
│   │   ├── middleware/
│   │   │   ├── auth.go             # JWT authentication
│   │   │   ├── role.go             # Role-based access
│   │   │   └── common.go           # CORS, logging
│   │   └── models/
│   │       ├── user.go             # User models
│   │       ├── task.go             # Task models
│   │       └── response.go         # API responses
│   ├── go.mod
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   ├── lib/
│   │   │   └── supabase.js         # Supabase client
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env.example
│
└── SUPABASE_SETUP.md               # Database setup guide
```

---

## 🚀 Quick Start

### Prerequisites
- Go 1.21+
- Node.js 18+
- Supabase account

### 1️⃣ Setup Supabase
Follow the complete guide in [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

### 2️⃣ Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# PORT=8080
# JWT_SECRET=your-secret-key

# Install dependencies
go mod download

# Run the server
go run cmd/main.go
```

Server will start at `http://localhost:8080`

### 3️⃣ Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...
# VITE_API_URL=http://localhost:8080/api/v1

# Run development server
npm run dev
```

Frontend will start at `http://localhost:5173`

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/v1/auth/register    # Register new user
POST   /api/v1/auth/login       # Login user
GET    /api/v1/auth/profile     # Get user profile (protected)
```

### Tasks (Protected)
```
GET    /api/v1/tasks            # Get user's tasks
GET    /api/v1/tasks/:id        # Get specific task
POST   /api/v1/tasks            # Create new task
PUT    /api/v1/tasks/:id        # Update task
DELETE /api/v1/tasks/:id        # Delete task
```

### Admin (Protected - Admin Only)
```
GET    /api/v1/admin/users           # Get all users
GET    /api/v1/admin/users/:id       # Get user by ID
PUT    /api/v1/admin/users/:id/role  # Update user role
DELETE /api/v1/admin/users/:id       # Delete user
GET    /api/v1/admin/tasks           # Get all tasks
```

### Health Check
```
GET    /health                  # API health status
```

---

## 📝 API Examples

### Register User
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Task
```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete project",
    "description": "Finish the backend assignment",
    "status": "pending",
    "priority": "high"
  }'
```

---

## 🔐 Security Features

- **Password Hashing**: Handled by Supabase Auth
- **JWT Authentication**: Secure token-based auth
- **Role-Based Access Control**: User/Admin roles
- **Input Validation**: Request body validation
- **Row Level Security**: Database-level security policies
- **CORS**: Configured for cross-origin requests
- **Environment Variables**: Sensitive data protection

---

## 📊 Database Schema

### Tables

**users** (Supabase Auth - auto-generated)
- Standard auth fields

**user_roles**
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK to auth.users)
- `role` (VARCHAR: user/admin)
- `created_at`, `updated_at`

**tasks**
- `id` (UUID, Primary Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `status` (VARCHAR: pending/in-progress/completed)
- `priority` (VARCHAR: low/medium/high)
- `user_id` (UUID, FK to auth.users)
- `created_at`, `updated_at`

**user_profiles**
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK to auth.users)
- `full_name` (VARCHAR)
- `avatar_url` (TEXT)
- `bio` (TEXT)
- `created_at`, `updated_at`

---

## 🧪 Testing

### Backend
```bash
cd backend
go test ./...
```

### Frontend
```bash
cd frontend
npm run test
```

### Manual Testing
1. Start both backend and frontend
2. Register a new user
3. Login with credentials
4. Create, update, delete tasks
5. Test admin features (if admin role)

---

## 🚢 Deployment

### Backend (Go)
```bash
# Build binary
go build -o app cmd/main.go

# Run
./app
```

Deploy to: Heroku, Railway, Render, or any Go-compatible platform

### Frontend (React)
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

Deploy to: Vercel, Netlify, or any static hosting

---

## 🎯 Scalability Considerations

### Current Implementation
- ✅ Modular code structure for easy expansion
- ✅ API versioning for backward compatibility
- ✅ Environment-based configuration
- ✅ Stateless backend (horizontal scaling ready)

### Future Enhancements
- **Caching**: Redis for session management
- **Rate Limiting**: Protect against abuse
- **Logging**: Structured logging with log aggregation
- **Monitoring**: Application performance monitoring
- **Microservices**: Split into auth, task, and admin services
- **Load Balancing**: Nginx or cloud load balancer
- **Database**: Read replicas for scaling reads
- **CDN**: Static asset delivery
- **Docker**: Containerization for consistent deployments

---

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if Go is installed
go version

# Verify dependencies
go mod tidy

# Check port availability
lsof -i :8080
```

### Frontend Issues
```bash
# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check port availability
lsof -i :5173
```

### Supabase Issues
- Verify API keys are correct
- Check RLS policies are enabled
- Ensure tables are created
- Verify admin user role is set

---

## 📚 Documentation

- [Go Documentation](https://golang.org/doc/)
- [Gin Framework](https://gin-gonic.com/en/docs/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 👤 Author

**V Aditya Teja**  
Software Developer  
Pursuing the interest of understanding core computers in a better way

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/vadityateja)  
[![Resume](https://img.shields.io/badge/Resume-View-green)](https://drive.google.com/drive/folders/1epLxLC2RVqvb91otO4G_bs-iqY0Rt8mi?usp=drive_link)

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## ✨ Key Highlights

✅ **Production-Ready Code**: Clean, modular, and well-structured  
✅ **Security First**: JWT, RLS, input validation  
✅ **Scalable Architecture**: Ready for microservices  
✅ **Modern Stack**: Latest technologies and best practices  
✅ **Full Documentation**: Setup guides and API docs  
✅ **Admin Features**: Complete user management  

---

**Built with ❤️ using Go, React, and Supabase**
