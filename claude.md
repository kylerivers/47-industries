# 47 Industries E-Commerce Platform

## Project Overview
Full-stack e-commerce platform for 47 Industries - a 3D printing company offering mass-produced items, custom 3D printing services, web development, and app development. Parent company to MotoRev.

**Domain**: 47industries.com
**Deployment**: Railway
**Repository**: [To be created on GitHub]

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **UI Components**: Radix UI (dark theme)
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Animations**: Framer Motion

### Backend
- **API**: Next.js API Routes
- **Auth**: NextAuth.js
- **Email**: Resend
- **Payment**: Stripe
- **File Upload**: Cloudflare R2

### Database
- **Database**: MySQL (Railway)
- **ORM**: Prisma
- **Caching**: Redis (Railway, optional)

### Infrastructure
- **Hosting**: Railway
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Domain**: 47industries.com (Namecheap)
- **SSL**: Automatic (Railway)

---

## Environment Variables

### Database
```env
DATABASE_URL="mysql://user:password@host:port/database"
```

### Authentication
```env
NEXTAUTH_URL="https://47industries.com"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl"
```

### Stripe Payment
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Cloudflare R2
```env
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="47industries-files"
R2_PUBLIC_URL="https://files.47industries.com"
```

### Email (Resend)
```env
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@47industries.com"
ADMIN_EMAIL="admin@47industries.com"
```

### App Configuration
```env
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://47industries.com"
```

---

## Project Structure

```
47-industries/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth routes (login, register)
│   │   ├── (shop)/              # Shop routes
│   │   ├── admin/               # Admin dashboard
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   ├── shop/                # Shop components
│   │   └── admin/               # Admin components
│   ├── lib/                     # Utilities
│   │   ├── prisma.ts            # Prisma client
│   │   ├── stripe.ts            # Stripe client
│   │   ├── r2.ts                # R2 client
│   │   └── utils.ts             # Helpers
│   ├── types/                   # TypeScript types
│   └── styles/                  # Global styles
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # DB migrations
├── public/                      # Static files
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── next.config.js               # Next.js config
├── tailwind.config.ts           # Tailwind config
├── tsconfig.json                # TypeScript config
├── package.json
└── claude.md                    # This file
```

---

## Features

### Customer-Facing
- **Landing Page**: High-quality, Apple-inspired dark UI
- **Shop**: Product catalog with filtering, cart, checkout
- **Custom 3D Printing**: Detailed form with file upload, material/finish selection
- **Web Development**: Service packages, portfolio, quote requests
- **App Development**: AI solutions showcase, consultation booking
- **MotoRev Page**: Brand overview, link to motorevapp.com
- **About/Contact**: Company info, contact form
- **Legal**: Terms, Privacy Policy, Refund/Shipping policies

### Admin Dashboard
- **Analytics**: Real-time sales dashboard
- **Products**: CRUD operations, inventory management
- **Orders**: Order management, status updates
- **Custom Requests**: 3D printing quote management
- **Service Inquiries**: Web/app dev quote management
- **Content Management**: Edit all page content
- **Users**: Customer management
- **Settings**: Site-wide configuration

### E-Commerce
- Stripe checkout integration
- Guest + registered user checkout
- Order tracking
- Email notifications
- Invoice generation
- Discount codes
- Tax/shipping calculation
- Inventory management

---

## Database Schema (Core Models)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          Role      @default(CUSTOMER)
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Product {
  id            String    @id @default(cuid())
  name          String
  description   String    @db.Text
  price         Decimal   @db.Decimal(10, 2)
  images        String[]
  category      Category  @relation(fields: [categoryId], references: [id])
  categoryId    String
  stock         Int       @default(0)
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Order {
  id            String      @id @default(cuid())
  user          User?       @relation(fields: [userId], references: [id])
  userId        String?
  items         OrderItem[]
  total         Decimal     @db.Decimal(10, 2)
  status        OrderStatus @default(PENDING)
  stripeId      String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model CustomRequest {
  id            String    @id @default(cuid())
  name          String
  email         String
  fileUrl       String
  material      String
  finish        String
  color         String
  quantity      Int
  notes         String?   @db.Text
  status        String    @default("pending")
  createdAt     DateTime  @default(now())
}
```

---

## Railway Deployment

### Setup Steps
1. Create Railway project
2. Add MySQL database service
3. Connect GitHub repository
4. Set environment variables
5. Configure domain (47industries.com)
6. Enable auto-deploy on push to main

### Railway Configuration
```
Build Command: npm run build
Start Command: npm start
Root Directory: /
Node Version: 22.x
```

---

## Design System

### Color Palette (Dark Theme)
```css
--background: #000000
--surface: #1a1a1a
--surface-elevated: #27272a
--border: #3f3f46
--accent: #3b82f6
--text-primary: #ffffff
--text-secondary: #a1a1aa
--success: #10b981
--warning: #f59e0b
--error: #ef4444
```

### Typography
- **Font Family**: Inter, SF Pro Display
- **Headings**: Bold, clean
- **Body**: Regular, high readability

### UI Principles
- Minimalist, clean layouts
- Generous white space
- Smooth animations
- Glass-morphism effects (subtle)
- High contrast
- Mobile-first responsive design

---

## Development Workflow

```
Feature Branch → PR → Staging → Main (Production)
```

**Branching**:
- `main` → Production (auto-deploys to Railway)
- `staging` → Staging environment
- `feature/*` → Feature development

---

## Security

- SSL/TLS encryption (Railway)
- Stripe PCI compliance
- Input validation (Zod)
- Rate limiting
- Secure file uploads (R2)
- RBAC (Role-Based Access Control)
- Audit logs

---

## Cost Breakdown (Monthly)

- **Railway**: $5-20 (includes MySQL, web service)
- **Cloudflare R2**: $0 (free tier: 10GB, 10M reads)
- **Resend**: $0 (free tier: 3000 emails/month)
- **Stripe**: 2.9% + $0.30 per transaction
- **Domain**: $0 (already owned)

**Total**: ~$5-20/month + transaction fees

---

## MotoRev Integration

**Subsidiary**: MotoRev (motorevapp.com)
- iOS motorcycle tracking app
- Launch: October 17, 2025
- Features: GPS tracking, social, safety, garage management
- Pricing: Free + Pro ($4.99/mo or $49.99/yr)

**Integration**: Dedicated page on 47industries.com with brand overview and redirect to motorevapp.com

---

## Next Steps

1. ✅ Initialize repository
2. ✅ Create claude.md
3. ⏳ Initialize Next.js project
4. ⏳ Setup Prisma schema
5. ⏳ Install dependencies
6. ⏳ Create base layout
7. ⏳ Setup authentication
8. ⏳ Build landing page
9. ⏳ Setup Stripe integration
10. ⏳ Deploy to Railway

---

## Contact

**Company**: 47 Industries
**Domain**: 47industries.com
**Developer**: Kyle Rivers
**Repository**: [GitHub URL - to be added]

---

*This is a comprehensive, production-ready e-commerce platform built with modern web technologies.*
