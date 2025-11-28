'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Signature {
  id: string
  name: string
  content: string
  isDefault: boolean
  forAddress: string | null
  createdAt: string
}

const EMAIL_ADDRESSES = [
  { value: '', label: 'All email addresses' },
  { value: 'kyle@47industries.com', label: 'kyle@47industries.com' },
  { value: 'support@47industries.com', label: 'support@47industries.com' },
  { value: 'info@47industries.com', label: 'info@47industries.com' },
  { value: 'contact@47industries.com', label: 'contact@47industries.com' },
  { value: 'press@47industries.com', label: 'press@47industries.com' },
  { value: 'support@motorevapp.com', label: 'support@motorevapp.com' },
  { value: 'press@motorevapp.com', label: 'press@motorevapp.com' },
]

export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState('signatures')
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSignature, setEditingSignature] = useState<Signature | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    isDefault: false,
    forAddress: '',
  })
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchSignatures()
  }, [])

  async function fetchSignatures() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/email/signatures')
      const data = await response.json()
      if (data.signatures) {
        setSignatures(data.signatures)
      }
    } catch (error) {
      console.error('Error fetching signatures:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function saveSignature() {
    try {
      const url = editingSignature
        ? `/api/admin/email/signatures/${editingSignature.id}`
        : '/api/admin/email/signatures'

      const response = await fetch(url, {
        method: editingSignature ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          content: formData.content,
          isDefault: formData.isDefault,
          forAddress: formData.forAddress || null,
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchSignatures()
        resetForm()
      } else {
        alert('Failed to save signature: ' + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error saving signature:', error)
      alert('Failed to save signature')
    }
  }

  async function deleteSignature(id: string) {
    if (!confirm('Are you sure you want to delete this signature?')) return

    try {
      const response = await fetch(`/api/admin/email/signatures/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        fetchSignatures()
      } else {
        alert('Failed to delete signature')
      }
    } catch (error) {
      console.error('Error deleting signature:', error)
      alert('Failed to delete signature')
    }
  }

  function resetForm() {
    setFormData({ name: '', content: '', isDefault: false, forAddress: '' })
    setEditingSignature(null)
    setIsCreating(false)
    if (editorRef.current) {
      editorRef.current.innerHTML = ''
    }
  }

  function startEditing(signature: Signature) {
    setEditingSignature(signature)
    setFormData({
      name: signature.name,
      content: signature.content,
      isDefault: signature.isDefault,
      forAddress: signature.forAddress || '',
    })
    setIsCreating(true)
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = signature.content
      }
    }, 0)
  }

  function startCreating() {
    resetForm()
    setIsCreating(true)
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link
              href="/admin/email"
              style={{
                color: '#a1a1aa',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              Email
            </Link>
            <span style={{ color: '#52525b' }}>/</span>
            <span style={{ color: '#fff', fontSize: '14px' }}>Settings</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Email Settings</h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '24px',
        borderBottom: '1px solid #27272a',
        paddingBottom: '0',
      }}>
        {['signatures', 'forwarding', 'auto-reply'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab ? '#fff' : '#71717a',
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              marginBottom: '-1px',
            }}
          >
            {tab === 'auto-reply' ? 'Auto-Reply' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Signatures Tab */}
      {activeTab === 'signatures' && (
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Signature List */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Your Signatures</h2>
              {!isCreating && (
                <button
                  onClick={startCreating}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  + New Signature
                </button>
              )}
            </div>

            {isLoading ? (
              <p style={{ color: '#71717a', padding: '20px 0' }}>Loading signatures...</p>
            ) : signatures.length === 0 && !isCreating ? (
              <div style={{
                background: '#18181b',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
              }}>
                <p style={{ color: '#71717a', marginBottom: '16px' }}>No signatures yet</p>
                <button
                  onClick={startCreating}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Create your first signature
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {signatures.map((sig) => (
                  <div
                    key={sig.id}
                    style={{
                      background: '#18181b',
                      borderRadius: '12px',
                      padding: '16px',
                      border: editingSignature?.id === sig.id ? '2px solid #3b82f6' : '1px solid #27272a',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '15px' }}>{sig.name}</span>
                          {sig.isDefault && (
                            <span style={{
                              background: '#3b82f6',
                              color: '#fff',
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}>
                              Default
                            </span>
                          )}
                        </div>
                        {sig.forAddress && (
                          <span style={{ fontSize: '12px', color: '#71717a' }}>
                            For: {sig.forAddress}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => startEditing(sig)}
                          style={{
                            background: '#27272a',
                            border: 'none',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSignature(sig.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#a1a1aa',
                        maxHeight: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      dangerouslySetInnerHTML={{ __html: sig.content }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Signature Editor */}
          {isCreating && (
            <div style={{
              width: '450px',
              background: '#18181b',
              borderRadius: '12px',
              padding: '24px',
              height: 'fit-content',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>
                {editingSignature ? 'Edit Signature' : 'New Signature'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
                    Signature Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Work Signature"
                    style={{
                      width: '100%',
                      background: '#0a0a0a',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
                    For Email Address (optional)
                  </label>
                  <select
                    value={formData.forAddress}
                    onChange={(e) => setFormData({ ...formData, forAddress: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#0a0a0a',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      color: '#fff',
                      fontSize: '14px',
                    }}
                  >
                    {EMAIL_ADDRESSES.map((addr) => (
                      <option key={addr.value} value={addr.value}>{addr.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
                    Signature Content
                  </label>
                  {/* Toolbar */}
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '8px',
                    background: '#27272a',
                    borderRadius: '8px 8px 0 0',
                    border: '1px solid #3f3f46',
                    borderBottom: 'none',
                  }}>
                    <button
                      type="button"
                      onClick={() => document.execCommand('bold')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px',
                      }}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => document.execCommand('italic')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontStyle: 'italic',
                        fontSize: '13px',
                      }}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter link URL:')
                        if (url) document.execCommand('createLink', false, url)
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Link
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={(e) => setFormData({ ...formData, content: (e.target as HTMLDivElement).innerHTML })}
                    style={{
                      background: '#fff',
                      border: '1px solid #3f3f46',
                      borderRadius: '0 0 8px 8px',
                      padding: '12px',
                      color: '#000',
                      fontSize: '14px',
                      minHeight: '150px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="isDefault" style={{ fontSize: '14px', color: '#a1a1aa' }}>
                    Set as default signature
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    onClick={resetForm}
                    style={{
                      flex: 1,
                      background: '#27272a',
                      color: '#fff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSignature}
                    disabled={!formData.name || !formData.content}
                    style={{
                      flex: 1,
                      background: formData.name && formData.content ? '#3b82f6' : '#27272a',
                      color: '#fff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: formData.name && formData.content ? 'pointer' : 'not-allowed',
                      opacity: formData.name && formData.content ? 1 : 0.5,
                    }}
                  >
                    {editingSignature ? 'Update' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Forwarding Tab */}
      {activeTab === 'forwarding' && (
        <div style={{
          background: '#18181b',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Email Forwarding</h3>
          <p style={{ color: '#71717a', marginBottom: '24px' }}>
            Configure email forwarding rules for your mailboxes.
          </p>
          <p style={{ color: '#52525b', fontSize: '14px' }}>
            Coming soon - Email forwarding rules will be managed directly through Zoho Mail settings.
          </p>
        </div>
      )}

      {/* Auto-Reply Tab */}
      {activeTab === 'auto-reply' && (
        <div style={{
          background: '#18181b',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Auto-Reply / Vacation Messages</h3>
          <p style={{ color: '#71717a', marginBottom: '24px' }}>
            Set up automatic reply messages when you're away.
          </p>
          <p style={{ color: '#52525b', fontSize: '14px' }}>
            Coming soon - Auto-reply settings will be managed directly through Zoho Mail settings.
          </p>
        </div>
      )}
    </div>
  )
}
