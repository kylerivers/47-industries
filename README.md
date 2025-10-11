# 47 Industries E-Commerce Platform

Full-stack e-commerce platform for 47 Industries - specializing in 3D printing, custom manufacturing, and innovative web/app development solutions.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL (Railway)
- **Storage**: Cloudflare R2
- **Payment**: Stripe
- **Email**: Resend
- **Hosting**: Railway

## 📦 Features

### Customer Features
- Product catalog with filtering & search
- Shopping cart & checkout
- Custom 3D printing request forms
- Service inquiry forms (Web/App Development)
- Guest & registered checkout
- Order tracking

### Admin Dashboard
- Product management (CRUD)
- Order management
- Custom request management
- Service inquiry management
- Content management
- Analytics dashboard
- User management

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- Cloudflare R2 account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/47-industries.git
cd 47-industries
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Fill in your environment variables in `.env`.

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma db push
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Environment Variables

See `.env.example` for required environment variables.

## 🚢 Deployment

This project is configured for deployment on Railway:

1. Create a new Railway project
2. Add a MySQL database service
3. Connect your GitHub repository
4. Add environment variables
5. Deploy!

## 📄 License

Proprietary - 47 Industries

## 🤝 Contact

**47 Industries**
- Website: [47industries.com](https://47industries.com)
- Email: contact@47industries.com
