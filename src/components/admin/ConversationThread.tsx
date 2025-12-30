'use client'

interface Message {
  id: string
  message: string
  isFromAdmin: boolean
  senderName: string | null
  senderEmail: string | null
  createdAt: string
  isQuote: boolean
  quoteAmount: number | null
  quoteMonthly?: number | null
}

interface ConversationThreadProps {
  messages: Message[]
  inquiryType: 'service' | 'custom' | 'contact'
}

export default function ConversationThread({ messages, inquiryType }: ConversationThreadProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!messages || messages.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#71717a',
      }}>
        <p>No messages yet</p>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {messages.map((msg) => {
        const isQuote = msg.isQuote
        const isAdmin = msg.isFromAdmin

        return (
          <div
            key={msg.id}
            style={{
              padding: '16px',
              background: isQuote ? '#10b98110' : (isAdmin ? '#3b82f610' : '#09090b'),
              border: `1px solid ${isQuote ? '#10b98130' : (isAdmin ? '#3b82f630' : '#27272a')}`,
              borderRadius: '12px',
              borderLeft: `4px solid ${isQuote ? '#10b981' : (isAdmin ? '#3b82f6' : '#71717a')}`,
            }}
          >
            {/* Message Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: '8px',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div>
                <p style={{
                  margin: 0,
                  fontWeight: 600,
                  fontSize: '14px',
                  color: isAdmin ? '#3b82f6' : '#a1a1aa',
                }}>
                  {msg.senderName || (isAdmin ? 'Admin' : 'Customer')}
                </p>
                {msg.senderEmail && (
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '12px',
                    color: '#71717a',
                  }}>
                    {msg.senderEmail}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isQuote && (
                  <span style={{
                    padding: '2px 8px',
                    background: '#10b981',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    Quote
                  </span>
                )}
                <span style={{
                  fontSize: '12px',
                  color: '#71717a',
                }}>
                  {formatDate(msg.createdAt)}
                </span>
              </div>
            </div>

            {/* Message Content */}
            <div style={{
              color: '#e4e4e7',
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.message}
            </div>

            {/* Quote Pricing Display */}
            {isQuote && (msg.quoteAmount || msg.quoteMonthly) && (
              <div style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #27272a',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {msg.quoteAmount && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: '#a1a1aa', fontSize: '14px' }}>
                      {inquiryType === 'custom' ? 'Total Price' : 'Project Total'}
                    </span>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: '#10b981',
                    }}>
                      ${Number(msg.quoteAmount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </span>
                  </div>
                )}
                {msg.quoteMonthly && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ color: '#a1a1aa', fontSize: '14px' }}>
                      Monthly Fee
                    </span>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#3b82f6',
                    }}>
                      ${Number(msg.quoteMonthly).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}/mo
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
