# Quick Start Guide - Ontrack Phase 1

## ⚡ Quick Setup (5 minutes)

### Step 1: Ensure PostgreSQL is Running

Make sure PostgreSQL is installed and running on your machine.

**Default connection expected:**
- Host: localhost
- Port: 5432
- Username: postgres
- Password: postgres

**If your PostgreSQL has different credentials**, update `backend/appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=ontrack_db;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
}
```

### Step 2: Setup Backend

Open a terminal and run:

```powershell
cd c:\Users\user\Desktop\ontrack-project\Ontrack\backend

# Restore packages
dotnet restore

# Create and apply database migration
dotnet ef database update

# If migration fails, try creating the database first in PostgreSQL:
# Then run: dotnet ef database update again

# Start the backend
dotnet run
```

Backend should now be running at: `http://localhost:5000`

### Step 3: Setup Frontend

Open a **NEW terminal** and run:

```powershell
cd c:\Users\user\Desktop\ontrack-project\Ontrack\frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend should now be running at: `http://localhost:5173`

### Step 4: Test the Application

1. Open browser to `http://localhost:5173`
2. Try logging in with:
   - Email: `customer@test.com`
   - Password: `password123`
   - Role: `Customer`
3. You should be redirected to the Customer Dashboard

### 🧪 Test All Roles

**Customer:**
- Email: customer@test.com
- Password: password123
- Role: Customer
- → Goes to `/customer/dashboard`

**Driver:**
- Email: driver@test.com
- Password: password123
- Role: Driver
- → Goes to `/driver/dashboard`

**Admin:**
- Email: admin@test.com
- Password: password123
- Role: Admin
- → Goes to `/admin/dashboard`

---

## 🐛 Common Issues

### Issue: "Could not connect to database"

**Solution:**
1. Verify PostgreSQL is running
2. Check your credentials in `backend/appsettings.json`
3. Manually create the database:
   ```sql
   CREATE DATABASE ontrack_db;
   ```
4. Run `dotnet ef database update` again

### Issue: "CORS error in browser"

**Solution:**
- Make sure backend is running on port 5000
- Make sure frontend is running on port 5173
- Both must be running simultaneously

### Issue: "Migration already exists"

**Solution:**
```powershell
cd backend
dotnet ef migrations remove
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Issue: "Port already in use"

**Backend (port 5000):**
- Check what's using port 5000 and stop it
- Or change port in `backend/Properties/launchSettings.json`

**Frontend (port 5173):**
- Vite will automatically use next available port
- Or specify port: `npm run dev -- --port 3000`

---

## ✅ Verification Checklist

- [ ] PostgreSQL is running
- [ ] Backend packages restored (`dotnet restore`)
- [ ] Database migration applied (`dotnet ef database update`)
- [ ] Backend is running (`dotnet run`) - accessible at http://localhost:5000
- [ ] Frontend packages installed (`npm install`)
- [ ] Frontend is running (`npm run dev`) - accessible at http://localhost:5173
- [ ] Can login with test credentials
- [ ] Can navigate to role-specific dashboards
- [ ] Can logout successfully

---

## 🎯 What You Should See

1. **Login Page**: Clean, centered form with email, password, and role dropdown
2. **Dashboard**: After login, you see a role-specific dashboard with:
   - Welcome message with your name
   - Logout button
   - Stat cards
   - Placeholder for Phase 2 features

---

## 🔍 Testing the Endpoints Directly

You can test the backend API directly using curl or any API client:

```powershell
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"customer@test.com\",\"password\":\"password123\",\"role\":\"Customer\"}'
```

Expected response:
```json
{
  "userId": 1,
  "name": "John Customer",
  "role": "Customer",
  "token": "eyJhbGc...",
  "message": "Login successful"
}
```

---

**Need Help?** Check the main README.md for detailed troubleshooting steps.
