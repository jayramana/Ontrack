# Ontrack - Phase 1: Authentication System

A logistics tracking application with role-based authentication built with React (Vite + TailwindCSS) and ASP.NET Core Web API with PostgreSQL.

## 🚀 Features Implemented (Phase 1)

- ✅ **User Authentication** - Login with email, password, and role selection
- ✅ **Role-Based Access Control** - Three user roles: Customer, Driver, Admin
- ✅ **Protected Routes** - Route protection based on authentication and role
- ✅ **JWT Token Authentication** - Secure token-based auth
- ✅ **Password Hashing** - BCrypt password encryption
- ✅ **Responsive UI** - Clean, modern interface with TailwindCSS
- ✅ **Database Seeding** - Pre-populated test users

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite 7
- TailwindCSS 4
- React Router DOM 7
- Axios

### Backend
- ASP.NET Core 9.0
- Entity Framework Core 9
- PostgreSQL
- JWT Bearer Authentication
- BCrypt.Net

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **.NET SDK 9.0**
- **PostgreSQL** (running on localhost:5432)
  - Default credentials: Username: `postgres`, Password: `postgres`
  - Or update connection string in `backend/appsettings.json`

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
cd c:\Users\user\Desktop\ontrack-project\Ontrack
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Restore NuGet packages
dotnet restore

# Apply database migrations (creates database and tables)
dotnet ef database update

# Run the backend server
dotnet run
```

The backend will start at: `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start at: `http://localhost:5173`

## 👥 Test Users

The database is pre-seeded with three test users (one per role):

| Role     | Email                | Password    | Dashboard Path          |
|----------|---------------------|-------------|------------------------|
| Customer | customer@test.com   | password123 | /customer/dashboard    |
| Driver   | driver@test.com     | password123 | /driver/dashboard      |
| Admin    | admin@test.com      | password123 | /admin/dashboard       |

## 🎯 Usage

1. Open your browser to `http://localhost:5173`
2. You'll see the login page
3. Enter credentials from the table above (or use any test user)
4. Select the corresponding role from the dropdown
5. Click "Sign In"
6. You'll be redirected to the role-specific dashboard
7. Click "Logout" to return to the login page

## 📁 Project Structure

```
Ontrack/
├── backend/
│   ├── Controllers/
│   │   └── AuthController.cs      # Login endpoint
│   ├── Data/
│   │   └── AppDbContext.cs        # EF Core context with seed data
│   ├── Models/
│   │   ├── User.cs                # User entity
│   │   ├── LoginRequest.cs        # Login DTO
│   │   └── LoginResponse.cs       # Response DTO
│   ├── Program.cs                 # App configuration
│   └── appsettings.json           # DB connection & JWT settings
│
└── frontend/
    └── src/
        ├── components/
        │   └── ProtectedRoute.jsx  # Route protection component
        ├── context/
        │   └── AuthContext.jsx     # Auth state management
        ├── pages/
        │   ├── Login.jsx           # Login page
        │   ├── customer/
        │   │   └── CustomerDashboard.jsx
        │   ├── driver/
        │   │   └── DriverDashboard.jsx
        │   └── admin/
        │       └── AdminDashboard.jsx
        ├── services/
        │   └── api.js              # API client with interceptors
        └── App.jsx                 # Main app with routing
```

## 🔐 Security Notes

- Passwords are hashed using BCrypt before storage
- JWT tokens are stored in localStorage (consider httpOnly cookies for production)
- CORS is configured for `http://localhost:5173`
- Token expiration is set to 24 hours

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on `localhost:5432`
- Verify credentials in `backend/appsettings.json`
- Check if database `ontrack_db` was created

### CORS Errors
- Ensure backend is running on port 5000
- Ensure frontend is running on port 5173
- If using different ports, update CORS policy in `backend/Program.cs`

### Migration Issues
```bash
# Reset migrations and database
dotnet ef database drop --force
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## 🚧 Phase 2 Roadmap

- Order management and tracking
- Real-time delivery status updates
- Warehouse inventory management
- Route optimization for drivers
- Analytics dashboard for admins
- Notifications system

## 📝 API Endpoints

### POST `/api/auth/login`
Login endpoint for user authentication.

**Request Body:**
```json
{
  "email": "customer@test.com",
  "password": "password123",
  "role": "Customer"
}
```

**Response:**
```json
{
  "userId": 1,
  "name": "John Customer",
  "role": "Customer",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Login successful"
}
```

## 📄 License

This is a demo project for Phase 1 implementation.

---

**Built with ❤️ for Ontrack Project**