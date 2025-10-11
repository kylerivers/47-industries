"use client"

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <span className="text-text-primary">47</span>
            <span className="text-accent"> Industries</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-text-secondary hover:text-text-primary transition-colors">
              Shop
            </Link>
            <Link href="/custom-3d-printing" className="text-text-secondary hover:text-text-primary transition-colors">
              Custom 3D Printing
            </Link>
            <Link href="/web-development" className="text-text-secondary hover:text-text-primary transition-colors">
              Web Dev
            </Link>
            <Link href="/app-development" className="text-text-secondary hover:text-text-primary transition-colors">
              App Dev
            </Link>
            <Link href="/motorev" className="text-text-secondary hover:text-text-primary transition-colors">
              MotoRev
            </Link>
            <Link href="/about" className="text-text-secondary hover:text-text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-text-secondary hover:text-text-primary transition-colors">
              Contact
            </Link>
          </div>

          {/* Cart & User */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/cart" className="text-text-secondary hover:text-text-primary transition-colors">
              Cart (0)
            </Link>
            <Link href="/admin" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
              Admin
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-border">
            <Link href="/shop" className="block text-text-secondary hover:text-text-primary transition-colors">
              Shop
            </Link>
            <Link href="/custom-3d-printing" className="block text-text-secondary hover:text-text-primary transition-colors">
              Custom 3D Printing
            </Link>
            <Link href="/web-development" className="block text-text-secondary hover:text-text-primary transition-colors">
              Web Development
            </Link>
            <Link href="/app-development" className="block text-text-secondary hover:text-text-primary transition-colors">
              App Development
            </Link>
            <Link href="/motorev" className="block text-text-secondary hover:text-text-primary transition-colors">
              MotoRev
            </Link>
            <Link href="/about" className="block text-text-secondary hover:text-text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="block text-text-secondary hover:text-text-primary transition-colors">
              Contact
            </Link>
            <Link href="/cart" className="block text-text-secondary hover:text-text-primary transition-colors">
              Cart (0)
            </Link>
            <Link href="/admin" className="block px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-center">
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
