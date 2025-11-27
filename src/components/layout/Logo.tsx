import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 28,
    md: 36,
    lg: 48,
  }

  const dimension = sizes[size]

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="47 Industries"
        width={dimension}
        height={dimension}
        style={{ borderRadius: '8px' }}
      />
      {showText && (
        <span className="text-xl font-bold">47 Industries</span>
      )}
    </Link>
  )
}
