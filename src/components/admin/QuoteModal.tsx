'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'

interface QuoteModalProps {
  isOpen: boolean
  onClose: () => void
  inquiryType: 'service' | 'custom' | 'contact'
  recipientEmail: string
  recipientName: string
  referenceNumber: string
  inquiryId: string
  quantity?: number  // For custom requests
  onQuoteSent: () => void
}

export default function QuoteModal({
  isOpen,
  onClose,
  inquiryType,
  recipientEmail,
  recipientName,
  referenceNumber,
  inquiryId,
  quantity = 1,
  onQuoteSent,
}: QuoteModalProps) {
  // Service/Contact quote fields
  const [oneTimeAmount, setOneTimeAmount] = useState('')
  const [monthlyAmount, setMonthlyAmount] = useState('')

  // Custom request quote fields
  const [perUnitPrice, setPerUnitPrice] = useState('')
  const [quoteQuantity, setQuoteQuantity] = useState(quantity.toString())
  const [estimatedDays, setEstimatedDays] = useState('')

  // Common fields
  const [notes, setNotes] = useState('')
  const [validDays, setValidDays] = useState('14')
  const [sending, setSending] = useState(false)

  const { showToast } = useToast()

  // Calculate total for custom requests
  const totalPrice = perUnitPrice && quoteQuantity
    ? (parseFloat(perUnitPrice) * parseInt(quoteQuantity)).toFixed(2)
    : '0.00'

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setOneTimeAmount('')
      setMonthlyAmount('')
      setPerUnitPrice('')
      setQuoteQuantity(quantity.toString())
      setEstimatedDays('')
      setNotes('')
      setValidDays('14')
    }
  }, [isOpen, quantity])

  const handleSendQuote = async () => {
    // Validation based on inquiry type
    if (inquiryType === 'custom') {
      if (!perUnitPrice || !quoteQuantity) {
        showToast('Please enter per-unit price and quantity', 'warning')
        return
      }
    } else {
      if (!oneTimeAmount && !monthlyAmount) {
        showToast('Please enter at least one quote amount', 'warning')
        return
      }
    }

    try {
      setSending(true)

      const endpoint = inquiryType === 'custom'
        ? '/api/admin/custom-requests/send-quote'
        : '/api/admin/inquiries/send-quote'

      const body = inquiryType === 'custom'
        ? {
            to: recipientEmail,
            name: recipientName,
            requestNumber: referenceNumber,
            requestId: inquiryId,
            perUnitPrice: parseFloat(perUnitPrice),
            quantity: parseInt(quoteQuantity),
            totalPrice: parseFloat(totalPrice),
            estimatedDays: estimatedDays ? parseInt(estimatedDays) : null,
            notes: notes || null,
            validDays: parseInt(validDays),
          }
        : {
            to: recipientEmail,
            name: recipientName,
            inquiryNumber: referenceNumber,
            inquiryId,
            oneTimeAmount: oneTimeAmount ? parseFloat(oneTimeAmount) : null,
            monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount) : null,
            notes: notes || null,
            validDays: parseInt(validDays),
          }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        showToast('Quote sent successfully!', 'success')
        onQuoteSent()
        onClose()
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to send quote', 'error')
      }
    } catch (error) {
      console.error('Error sending quote:', error)
      showToast('Failed to send quote', 'error')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          zIndex: 9999,
        }}
      >
        <h2 style={{
          margin: '0 0 24px 0',
          fontSize: '24px',
          fontWeight: 700,
        }}>
          Send Quote
        </h2>

        {/* Recipient Info */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: '#09090b',
          borderRadius: '12px',
          fontSize: '14px',
        }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#71717a' }}>To: </span>
            <span style={{ color: '#e4e4e7' }}>{recipientName}</span>
          </div>
          <div>
            <span style={{ color: '#71717a' }}>Email: </span>
            <span style={{ color: '#3b82f6' }}>{recipientEmail}</span>
          </div>
        </div>

        {/* Form Fields - Type Specific */}
        {inquiryType === 'custom' ? (
          // 3D Print Quote Form
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
              }}>
                Per-Unit Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={perUnitPrice}
                onChange={(e) => setPerUnitPrice(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
              }}>
                Quantity
              </label>
              <input
                type="number"
                value={quoteQuantity}
                onChange={(e) => setQuoteQuantity(e.target.value)}
                min="1"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>

            {perUnitPrice && quoteQuantity && (
              <div style={{
                marginBottom: '16px',
                padding: '16px',
                background: '#10b98110',
                border: '1px solid #10b98130',
                borderRadius: '8px',
              }}>
                <div style={{ color: '#71717a', fontSize: '13px', marginBottom: '4px' }}>
                  Total Price
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
                  ${totalPrice}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
              }}>
                Estimated Production Days
              </label>
              <input
                type="number"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                placeholder="Number of days"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>
          </>
        ) : (
          // Service/Contact Quote Form
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
              }}>
                {inquiryType === 'contact' ? 'Quote Amount ($)' : 'One-Time Amount ($)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={oneTimeAmount}
                onChange={(e) => setOneTimeAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                }}
              />
            </div>

            {inquiryType === 'service' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}>
                  Monthly Amount ($)
                  <span style={{ color: '#71717a', fontWeight: 400, fontSize: '13px' }}> (optional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#09090b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Common Fields */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '8px',
          }}>
            Additional Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional details about the quote..."
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#09090b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '8px',
          }}>
            Quote Valid For
          </label>
          <select
            value={validDays}
            onChange={(e) => setValidDays(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#09090b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
            }}
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            onClick={onClose}
            disabled={sending}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid #27272a',
              borderRadius: '8px',
              color: '#a1a1aa',
              fontSize: '14px',
              fontWeight: 500,
              cursor: sending ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSendQuote}
            disabled={sending}
            style={{
              padding: '12px 24px',
              background: sending ? '#3b82f660' : '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: sending ? 'not-allowed' : 'pointer',
            }}
          >
            {sending ? 'Sending...' : 'Send Quote'}
          </button>
        </div>
      </div>
    </>
  )
}
