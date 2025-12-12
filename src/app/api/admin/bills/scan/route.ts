import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { verifyAdminAuth } from '@/lib/auth-helper'

// POST /api/admin/bills/scan - Scan a bill image using Claude Vision
export async function POST(request: NextRequest) {
  const isAuthorized = await verifyAdminAuth(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { image } = body

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        error: 'Bill scanning not configured. Please add ANTHROPIC_API_KEY to environment.'
      }, { status: 500 })
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    // Determine media type from base64 header or default to JPEG
    let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'
    let imageData = image

    if (image.startsWith('data:')) {
      const match = image.match(/^data:(image\/\w+);base64,(.*)$/)
      if (match) {
        mediaType = match[1] as typeof mediaType
        imageData = match[2]
      }
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: `Analyze this bill/invoice image and extract the following information. Return ONLY a valid JSON object with these fields:
{
  "vendor": "the company or service provider name",
  "amount": the total amount due as a number (no currency symbols),
  "vendorType": "UTILITY" | "CREDIT_CARD" | "SUBSCRIPTION" | "RENT" | "BANK_ALERT" | "OTHER",
  "dueDate": "YYYY-MM-DD format if visible, or null"
}

Guidelines for vendorType:
- UTILITY: Electric, water, gas, trash, internet/wifi bills
- CREDIT_CARD: Credit card statements (Chase, Amex, Discover, etc)
- SUBSCRIPTION: Streaming services, software subscriptions
- RENT: Rent payments, landlord payments
- BANK_ALERT: Bank transaction alerts, balance updates
- OTHER: Everything else

If you cannot determine a field, use null for it. Only return the JSON object, no other text.`,
            },
          ],
        },
      ],
    })

    // Parse Claude's response
    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    // Extract JSON from the response
    let result
    try {
      // Try to parse the response as JSON directly
      result = JSON.parse(textContent.text)
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = textContent.text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1].trim())
      } else {
        // Try to find JSON object in the text
        const objectMatch = textContent.text.match(/\{[\s\S]*\}/)
        if (objectMatch) {
          result = JSON.parse(objectMatch[0])
        } else {
          throw new Error('Could not parse AI response')
        }
      }
    }

    return NextResponse.json({
      vendor: result.vendor || null,
      amount: result.amount || null,
      vendorType: result.vendorType || 'OTHER',
      dueDate: result.dueDate || null,
    })
  } catch (error: any) {
    console.error('Error scanning bill:', error)
    return NextResponse.json({
      error: 'Failed to scan bill image',
      details: error.message
    }, { status: 500 })
  }
}
