"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Logo from './Logo'
import { useCart } from '@/lib/cart-store'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { getItemCount } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  const itemCount = mounted ? getItemCount() : 0

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Shop
            </Link>
            <Link href="/custom-3d-printing" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Custom Manufacturing
            </Link>
            <Link href="/web-development" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Services
            </Link>
            <Link href="/motorev" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              MotoRev
            </Link>
            <Link href="/about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Cart */}
          <div className="hidden md:flex items-center">
            <Link href="/cart" className="relative text-text-secondary hover:text-text-primary transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/cart" className="relative text-text-secondary hover:text-text-primary transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-primary"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-border animate-fadeIn">
            <Link href="/shop" className="block text-text-secondary hover:text-text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </Link>
            <Link href="/custom-3d-printing" className="block text-text-secondary hover:text-text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Custom Manufacturing
            </Link>
            <Link href="/web-development" className="block text-text-secondary hover:text-text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Services
            </Link>
            <Link href="/motorev" className="block text-text-secondary hover:text-text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              MotoRev
            </Link>
            <Link href="/about" className="block text-text-secondary hover:text-text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="block text-text-secondary hover:text-text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
