import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

export async function GET() {
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

    // Show which database we're using
    const [currentDb] = await connection.execute('SELECT DATABASE() as current_database')

    // List all tables
    const [tables] = await connection.execute('SHOW TABLES')

    // Count users if table exists
    let userCount = 0
    try {
      const [result] = await connection.execute('SELECT COUNT(*) as count FROM User')
      userCount = (result as any)[0].count
    } catch (e) {
      // Table doesn't exist
    }

    return NextResponse.json({
      connectedToDatabase: connectionConfig.database,
      currentDatabase: currentDb,
      tables: tables,
      tableCount: (tables as any[]).length,
      userCount
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      code: error.code
    }, { status: 500 })
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
