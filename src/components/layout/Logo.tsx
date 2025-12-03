import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export default function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 52,
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
        className={`text-xl font-bold transition-all duration-300 ${
          showText ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'
        }`}
      >
        47 Industries
      </span>
    </Link>
  )
}
