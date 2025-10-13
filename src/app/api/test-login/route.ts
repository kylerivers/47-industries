import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== 'setup47industries') {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
  }

  let connection: any = null

  try {
    const dbUrl = process.env.DATABASE_URL!
    const url = new URL(dbUrl.replace('mysql://', 'http://'))
    const connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', '') || 'railway'
    }

    connection = await mysql.createConnection(connectionConfig)

    // Try to find user by username
    const [users] = await connection.execute(
      'SELECT id, username, email, password, role FROM User WHERE username = ?',
      ['47industries']
    )

    if ((users as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      })
    }

    const user = (users as any)[0]

    // Test password
    const isPasswordValid = await bcrypt.compare('Balance47420', user.password)

    return NextResponse.json({
      success: true,
      userExists: true,
      usernameMatch: user.username === '47industries',
      emailMatch: user.email === 'admin@47industries.com',
      roleMatch: user.role === 'ADMIN',
      passwordValid: isPasswordValid,
      message: isPasswordValid ? 'Login credentials are valid!' : 'Password does not match'
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
