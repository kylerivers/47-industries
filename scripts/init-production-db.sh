#!/bin/bash

# 47 Industries - Production Database Initialization Script
# This script initializes the production database with all tables and seed data

echo "==============================================="
echo "47 Industries - Database Initialization"
echo "==============================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it to your Railway MySQL connection string:"
    echo "export DATABASE_URL='mysql://user:password@host:port/database'"
    echo ""
    echo "You can find this in Railway > Variables > DATABASE_URL"
    exit 1
fi

echo "Step 1: Creating initial migration..."
npx prisma migrate dev --name init --create-only

echo ""
echo "Step 2: Deploying migration to production database..."
npx prisma migrate deploy

echo ""
echo "Step 3: Seeding database with initial data..."
npm run seed

echo ""
echo "==============================================="
echo "Database initialization complete!"
echo "==============================================="
echo ""
echo "Your admin credentials:"
echo "  Username: 47industries"
echo "  Email: admin@47industries.com"
echo "  Password: Balance47420"
echo ""
echo "Next steps:"
echo "1. Commit and push the migration files: git add prisma/migrations && git commit -m 'Add initial migration' && git push"
echo "2. Railway will automatically redeploy with the updated build script"
echo "3. Log in at https://47industries.com/admin/login"
echo ""
