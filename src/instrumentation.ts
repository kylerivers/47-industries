export async function register() {
  // Only run cron on the server (not during build or on edge)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startBillScannerCron } = await import('@/lib/cron-scheduler')
    startBillScannerCron()
  }
}
