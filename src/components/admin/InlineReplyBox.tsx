'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from '@/components/ui/Toast'

interface InlineReplyBoxProps {
  recipientEmail: string
  recipientName: string
  referenceNumber: string
  inquiryType: 'service' | 'custom' | 'contact'
  inquiryId: string
  onReplySent: () => void
}

export default function InlineReplyBox({
  recipientEmail,
  recipientName,
  referenceNumber,
  inquiryType,
  inquiryId,
  onReplySent,
}: InlineReplyBoxProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showSubjectEdit, setShowSubjectEdit] = useState(false)
  const [subject, setSubject] = useState(`Re: ${referenceNumber}`)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { showToast } = useToast()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [message])

  const handleSend = async () => {
    if (!message.trim()) {
      showToast('Please enter a message', 'warning')
      return
    }

    try {
      setSending(true)

      const endpoint = inquiryType === 'custom'
        ? '/api/admin/custom-requests/reply'
        : '/api/admin/inquiries/reply'

      const body = {
        to: recipientEmail,
        subject,
        message: message.trim(),
        referenceNumber,
        [inquiryType === 'custom' ? 'requestId' : 'inquiryId']: inquiryId,
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        showToast('Email sent successfully!', 'success')
        setMessage('')
        setSubject(`Re: ${referenceNumber}`)
        setShowSubjectEdit(false)
        onReplySent()
      } else {
        const data = await res.json()
        showToast(data.error || 'Failed to send email', 'error')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      showToast('Failed to send email', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      id="inline-reply"
      style={{
        background: '#18181b',
        border: '1px solid #27272a',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
      }}
    >
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        fontWeight: 600,
      }}>
        Reply via Email
      </h3>

      {/* To Field */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          color: '#a1a1aa',
          marginBottom: '6px',
        }}>
          To
        </label>
        <div style={{
          padding: '10px 12px',
          background: '#09090b',
          border: '1px solid #27272a',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#71717a',
        }}>
          {recipientName} &lt;{recipientEmail}&gt;
        </div>
      </div>

      {/* Subject Field */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}>
          <label style={{
            fontSize: '13px',
            color: '#a1a1aa',
          }}>
            Subject
          </label>
          <button
            onClick={() => setShowSubjectEdit(!showSubjectEdit)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#3b82f6',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '2px 4px',
            }}
          >
            {showSubjectEdit ? 'Hide' : 'Edit'}
          </button>
        </div>
        {showSubjectEdit ? (
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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
        ) : (
          <div style={{
            padding: '10px 12px',
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#71717a',
          }}>
            {subject}
          </div>
        )}
      </div>

      {/* Message Field */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          color: '#a1a1aa',
          marginBottom: '6px',
        }}>
          Message
        </label>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your reply..."
          rows={4}
          style={{
            width: '100%',
            padding: '12px',
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            resize: 'vertical',
            minHeight: '100px',
            maxHeight: '300px',
            fontFamily: 'inherit',
          }}
        />
        <p style={{
          margin: '6px 0 0 0',
          fontSize: '12px',
          color: '#71717a',
        }}>
          Press Cmd+Enter to send
        </p>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
      }}>
        <button
          onClick={() => {
            setMessage('')
            setSubject(`Re: ${referenceNumber}`)
            setShowSubjectEdit(false)
          }}
          disabled={sending}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: '1px solid #27272a',
            borderRadius: '8px',
            color: '#a1a1aa',
            fontSize: '14px',
            fontWeight: 500,
            cursor: sending ? 'not-allowed' : 'pointer',
            opacity: sending ? 0.5 : 1,
          }}
        >
          Clear
        </button>
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          style={{
            padding: '10px 20px',
            background: sending || !message.trim() ? '#3b82f660' : '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {sending ? 'Sending...' : 'Send →'}
        </button>
      </div>
    </div>
  )
}
