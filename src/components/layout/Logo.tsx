import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 36,
    md: 44,
    lg: 56,
  }

  const dimension = sizes[size]

  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo.png"
        alt="47 Industries"
        width={dimension}
        height={dimension}
        style={{ borderRadius: '8px' }}
      />
      <span
        className={`text-xl font-bold whitespace-nowrap transition-opacity duration-300 ${
          showText ? 'opacity-100' : 'opacity-0'
        }`}
      >
        47 Industries
      </span>
    </Link>
  )
}
