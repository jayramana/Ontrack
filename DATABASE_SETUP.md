# Database Setup Guide for Ontrack

This guide helps you set up the PostgreSQL database for the Ontrack application.

## Prerequisites

- PostgreSQL installed and running
- Default port: 5432
- Default credentials: Username: `postgres`, Password: `postgres`

---

## Option 1: Automatic Setup (Recommended)

If your PostgreSQL uses the default credentials (`postgres`/`postgres`), simply run:

```powershell
cd c:\Users\user\Desktop\ontrack-project\Ontrack\backend
dotnet ef database update
```

This will:
1. Create the database `ontrack_db`
2. Create the `users` table
3. Seed 3 test users (Customer, Driver, Admin)

---

## Option 2: Custom PostgreSQL Credentials

If your PostgreSQL has different credentials:

### Step 1: Update Connection String

Edit `backend/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ontrack_db;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
  }
}
```

Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.

### Step 2: Apply Migration

```powershell
cd c:\Users\user\Desktop\ontrack-project\Ontrack\backend
dotnet ef database update
```

---

## Option 3: Manual Database Creation

If automatic migration fails, create the database manually:

### Step 1: Connect to PostgreSQL

```powershell
# Using psql command line
psql -U postgres
```

### Step 2: Create Database

```sql
CREATE DATABASE ontrack_db;
\q
```

### Step 3: Apply Migration

```powershell
cd c:\Users\user\Desktop\ontrack-project\Ontrack\backend
dotnet ef database update
```

---

## Verify Database Setup

### Check if database exists:

```powershell
psql -U postgres -c "\l" | findstr ontrack_db
```

### Check if table and data exist:

```powershell
psql -U postgres -d ontrack_db -c "SELECT * FROM users;"
```

Expected output:
```
 id |     name      |        email        |                      password_hash                        |   role
----+---------------+---------------------+-----------------------------------------------------------+-----------
  1 | John Customer | customer@test.com   | $2a$11$...                                                  | Customer
  2 | Jane Driver   | driver@test.com     | $2a$11$...                                                  | Driver
  3 | Mike Admin    | admin@test.com      | $2a$11$...                                                  | Admin
```

---

## Troubleshooting

### Error: "Password authentication failed"

**Solution:** Update your connection string in `appsettings.json` with correct credentials.

### Error: "Database already exists"

**Solution:** This is fine! Just run `dotnet ef database update` to apply migrations.

### Error: "Multiple instances of DbContext"

**Solution:** 
```powershell
cd backend
dotnet clean
dotnet restore
dotnet ef database update
```

### Error: "Role 'postgres' does not exist"

**Solution:** Your PostgreSQL uses a different username. Update the connection string.

### Reset Everything

To completely reset the database:

```powershell
cd backend

# Drop database
dotnet ef database drop --force

# Remove migration
dotnet ef migrations remove

# Create new migration
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update
```

---

## Next Steps

After successful database setup:

1. ✅ Database `ontrack_db` exists
2. ✅ Table `users` exists with 3 seed users
3. ➡️ Run the backend: `dotnet run`
4. ➡️ Run the frontend: `npm run dev`
5. ➡️ Test login at http://localhost:5173

See [QUICK_START.md](file:///c:/Users/user/Desktop/ontrack-project/Ontrack/QUICK_START.md) for testing instructions.
