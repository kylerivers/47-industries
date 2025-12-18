# Database Setup & Migration Guide

## Problem

The production database on Railway is missing required tables. This causes errors like:

```
The table `ActiveSession` does not exist in the current database.
The table `Setting` does not exist in the current database.
The table `User` does not exist in the current database.
```

## Root Cause

The Prisma migrations were never run against the production database. The schema.prisma file defines all tables, but they don't exist in MySQL yet.

## Solution

Follow these steps to initialize the production database:

### Step 1: Get Your Railway Database Connection String

1. Go to Railway dashboard: https://railway.app
2. Open your 47-industries project
3. Click on the MySQL service
4. Go to "Variables" tab
5. Copy the `DATABASE_URL` value

It will look like:
```
mysql://root:password@hostname.railway.app:3306/railway
```

### Step 2: Run the Initialization Script

In your terminal, run:

```bash
# Set the DATABASE_URL (paste your Railway connection string)
export DATABASE_URL='mysql://root:password@hostname.railway.app:3306/railway'

# Run the initialization script
./scripts/init-production-db.sh
```

This script will:
1. Create an initial migration with all tables
2. Apply the migration to your production database
3. Seed the database with:
   - Admin user (username: 47industries, password: Balance47420)
   - Initial product categories

### Step 3: Commit and Push

```bash
# Add the migration files
git add prisma/migrations

# Commit
git commit -m "Add initial database migration

Generated migration for production database setup.
Includes all tables: User, Product, Order, Bill, etc.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to GitHub
git push
```

Railway will automatically redeploy with the updated build script that now runs migrations on every deployment.

### Step 4: Verify

1. Go to https://47industries.com/admin/login
2. Log in with:
   - Username: `47industries`
   - Email: `admin@47industries.com`
   - Password: `Balance47420`
3. Navigate to Admin > Users
4. You should now see the admin user listed

## What Changed

The `package.json` build script was updated to run migrations before building:

**Before:**
```json
"build": "next build"
```

**After:**
```json
"build": "prisma migrate deploy && next build"
```

This ensures that every Railway deployment will automatically apply any pending database migrations.

## Alternative: Manual Migration

If you prefer to run migrations manually without the script:

```bash
# Set DATABASE_URL
export DATABASE_URL='your-railway-connection-string'

# Create initial migration
npx prisma migrate dev --name init

# Or just deploy existing migrations
npx prisma migrate deploy

# Seed the database
npm run seed
```

## Future Deployments

From now on, when you need to add a new table or change the schema:

1. Modify `prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name descriptive_name`
3. Commit and push
4. Railway will automatically apply the migration during deployment

## Troubleshooting

### "Error connecting to database"

Check that your DATABASE_URL is correct and the Railway MySQL service is running.

### "Migration already applied"

If you see this, the migration has already been run. You can safely ignore it.

### "Table already exists"

If some tables already exist, you may need to:
1. Check which tables exist in Railway's MySQL console
2. Either drop them or create a migration that only adds missing tables

## Security Note

After logging in for the first time, change the default admin password:

1. Go to Admin > Users
2. Click on the admin user
3. Update the password to something secure
