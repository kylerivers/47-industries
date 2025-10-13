import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  // Simple protection
  if (key !== 'setup47industries') {
    return NextResponse.json({ error: 'Invalid setup key' }, { status: 403 })
  }

  try {
    const results: string[] = []
    results.push('🚀 Running database schema push...')
    results.push('')

    // Run prisma db push
    const { stdout, stderr } = await execAsync('npx prisma db push --skip-generate --accept-data-loss')

    if (stdout) {
      results.push('📋 Output:')
      results.push(stdout)
    }

    if (stderr && !stderr.includes('warn')) {
      results.push('⚠️ Warnings:')
      results.push(stderr)
    }

    results.push('')
    results.push('✅ Database schema pushed successfully!')
    results.push('')
    results.push('🔗 Now visit: /api/setup?key=setup47industries')
    results.push('   This will create your admin user')

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to push database schema',
      details: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    }, { status: 500 })
  }
}
