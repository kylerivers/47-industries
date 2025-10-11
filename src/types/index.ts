// Core types for 47 Industries platform

export type Role = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'

export type CustomRequestStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'QUOTED'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'COMPLETED'
  | 'CANCELLED'

export type ServiceType =
  | 'WEB_DEVELOPMENT'
  | 'APP_DEVELOPMENT'
  | 'AI_SOLUTIONS'
  | 'CONSULTATION'
  | 'OTHER'

export type InquiryStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'COMPLETED'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Cart types
export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  maxQuantity?: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
}

// Checkout types
export interface CheckoutFormData {
  email: string
  name: string
  phone?: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
}

// Custom 3D Printing Request Form
export interface CustomPrintRequest {
  name: string
  email: string
  phone?: string
  company?: string
  file: File
  material: string
  finish: string
  color: string
  quantity: number
  dimensions?: string
  scale?: number
  notes?: string
  deadline?: Date
}

// Service Inquiry Form
export interface ServiceInquiryForm {
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  serviceType: ServiceType
  budget?: string
  timeline?: string
  description: string
  attachments?: File[]
}

// Product types
export interface ProductFilter {
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  featured?: boolean
  search?: string
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest'
}
