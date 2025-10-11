# Admin Dashboard Setup

## Accessing the Admin

The admin dashboard is accessible at: **admin.47industries.com**

## DNS Configuration

To set up the admin subdomain in Namecheap:

1. Go to Namecheap → Domain List → 47industries.com → Advanced DNS
2. Add a new CNAME record:
   - **Type**: CNAME Record
   - **Host**: `admin`
   - **Value**: `<your-railway-domain>.up.railway.app`
   - **TTL**: Automatic

3. In Railway:
   - Go to your 47-industries service
   - Settings → Domains
   - Click "Custom Domain"
   - Add: `admin.47industries.com`
   - Railway will verify and provision SSL

## How it Works

The middleware detects the subdomain:
- `admin.47industries.com` → Routes to `/admin/*` pages
- `47industries.com` → Public site
- `/admin` on main domain → Redirects to admin subdomain (in production)

## Admin Features

### Dashboard (`/admin`)
- Overview stats (orders, revenue, requests)
- Quick actions
- Recent activity

### Products (`/admin/products`)
- View all products
- Add new product
- Edit/delete products
- Manage inventory

### Orders (`/admin/orders`)
- View all orders
- Update order status
- Add tracking numbers
- View customer details

### 3D Print Requests (`/admin/custom-requests`)
- View quote requests
- Upload files from customers
- Send quotes
- Mark as completed

### Service Inquiries (`/admin/inquiries`)
- View web/app dev inquiries
- Respond to requests
- Track status

### Settings (`/admin/settings`)
- Site configuration
- Update content
- Manage users

## Authentication

Authentication will be added with NextAuth:
- Email/password login
- Protected routes
- Role-based access (Admin, Super Admin)

## Development

Locally, access admin at:
- `http://localhost:3000/admin`

In production:
- `https://admin.47industries.com`

## Security

- All admin routes require authentication
- HTTPS enforced
- CSRF protection
- Rate limiting
- Audit logs for admin actions
