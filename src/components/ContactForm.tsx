"use client"

import { useState } from 'react'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission
    alert('Form submission will be implemented with backend!')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email *</label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Subject *</label>
        <input
          type="text"
          required
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent"
          placeholder="How can we help?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Message *</label>
        <textarea
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-accent resize-none"
          placeholder="Tell us about your project..."
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-text-primary text-background rounded-lg font-semibold hover:bg-text-secondary transition-all"
      >
        Send Message
      </button>
    </form>
  )
}
