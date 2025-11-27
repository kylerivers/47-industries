'use client'

import { useState, useEffect } from 'react'

interface Settings {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  socialTwitter: string
  socialFacebook: string
  socialInstagram: string
  socialLinkedin: string
  shippingFlatRate: number
  shippingFreeThreshold: number
  taxRate: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: '47 Industries',
    siteDescription: '3D printing and custom solutions',
    contactEmail: 'contact@47industries.com',
    contactPhone: '',
    address: '',
    socialTwitter: '',
    socialFacebook: '',
    socialInstagram: '',
    socialLinkedin: '',
    shippingFlatRate: 9.99,
    shippingFreeThreshold: 100,
    taxRate: 8.25,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'contact', label: 'Contact' },
    { id: 'social', label: 'Social' },
    { id: 'shipping', label: 'Shipping & Tax' },
  ]

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: '#09090b',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#a1a1aa',
  }

  const fieldStyle = {
    marginBottom: '20px',
  }

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#71717a' }}>Loading settings...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: isMobile ? '28px' : '36px',
          fontWeight: 700,
          marginBottom: '8px',
          margin: 0
        }}>Settings</h1>
        <p style={{
          color: '#a1a1aa',
          margin: 0,
          fontSize: isMobile ? '14px' : '16px'
        }}>Configure your site settings</p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? '#3b82f6' : '#18181b',
              color: activeTab === tab.id ? 'white' : '#a1a1aa',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '16px',
        padding: '24px',
      }}>
        {activeTab === 'general' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', margin: '0 0 24px 0' }}>
              General Settings
            </h2>
            <div style={fieldStyle}>
              <label style={labelStyle}>Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', margin: '0 0 24px 0' }}>
              Contact Information
            </h2>
            <div style={fieldStyle}>
              <label style={labelStyle}>Contact Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Contact Phone</label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Business Address</label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', margin: '0 0 24px 0' }}>
              Social Media Links
            </h2>
            <div style={fieldStyle}>
              <label style={labelStyle}>Twitter/X</label>
              <input
                type="url"
                value={settings.socialTwitter}
                onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                placeholder="https://twitter.com/47industries"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Facebook</label>
              <input
                type="url"
                value={settings.socialFacebook}
                onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                placeholder="https://facebook.com/47industries"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Instagram</label>
              <input
                type="url"
                value={settings.socialInstagram}
                onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                placeholder="https://instagram.com/47industries"
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>LinkedIn</label>
              <input
                type="url"
                value={settings.socialLinkedin}
                onChange={(e) => setSettings({ ...settings, socialLinkedin: e.target.value })}
                placeholder="https://linkedin.com/company/47industries"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', margin: '0 0 24px 0' }}>
              Shipping & Tax Settings
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: '20px',
            }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Flat Rate Shipping ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shippingFlatRate}
                  onChange={(e) => setSettings({ ...settings, shippingFlatRate: parseFloat(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Free Shipping Threshold ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.shippingFreeThreshold}
                  onChange={(e) => setSettings({ ...settings, shippingFreeThreshold: parseFloat(e.target.value) || 0 })}
                  style={inputStyle}
                />
                <p style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>
                  Orders over this amount get free shipping
                </p>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #27272a' }}>
          <button
            onClick={saveSettings}
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
