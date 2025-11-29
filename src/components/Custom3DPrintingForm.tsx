"use client"

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder } from '@fortawesome/free-solid-svg-icons'

export default function Custom3DPrintingForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    material: 'PLA',
    finish: 'Standard',
    color: 'Black',
    quantity: 1,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement form submission to API
    alert('Form submission will be implemented with backend!')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
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
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Company</label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
            placeholder="Company Name"
          />
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">3D Files *</label>
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-accent transition-colors cursor-pointer">
          <input type="file" multiple accept=".stl,.obj,.step,.stp" className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-4xl mb-4 text-zinc-400">
              <FontAwesomeIcon icon={faFolder} />
            </div>
            <p className="text-lg font-medium mb-2">Drop your files here or click to browse</p>
            <p className="text-sm text-text-secondary">Supports .STL, .OBJ, .STEP files (Max 50MB)</p>
          </label>
        </div>
      </div>

      {/* Print Specifications */}
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Material *</label>
          <select
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
          >
            <option>PLA</option>
            <option>ABS</option>
            <option>PETG</option>
            <option>Nylon</option>
            <option>TPU (Flexible)</option>
            <option>Resin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Finish *</label>
          <select
            value={formData.finish}
            onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
          >
            <option>Standard</option>
            <option>Smooth</option>
            <option>High Detail</option>
            <option>Painted</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Color *</label>
          <select
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
          >
            <option>Black</option>
            <option>White</option>
            <option>Gray</option>
            <option>Red</option>
            <option>Blue</option>
            <option>Green</option>
            <option>Yellow</option>
            <option>Custom</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Quantity *</label>
        <input
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-accent resize-none"
          placeholder="Any special requirements, deadlines, or questions..."
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 bg-text-primary text-background rounded-lg font-semibold hover:bg-text-secondary transition-all"
      >
        Submit Quote Request
      </button>
    </form>
  )
}
