interface GlitchTextProps {
  text: string
  className?: string
}

export const GlitchText = ({ text, className = '' }: GlitchTextProps) => {
  return (
    <div
      className={`relative inline-block font-black ${className} select-none group`}
    >
      {/* Base Text */}
      <span className="relative z-10 block opacity-90">{text}</span>

      {/* Glitch Layer 1 (Pink/Red) */}
      <span
        className="absolute top-0 left-0 w-full h-full -z-10 text-neon-pink opacity-0 group-hover:opacity-100 animate-glitch-1"
        style={{ clipPath: 'inset(80% 0 1% 0)' }}
      >
        {text}
      </span>

      {/* Glitch Layer 2 (Cyan/Blue) */}
      <span
        className="absolute top-0 left-0 w-full h-full -z-10 text-neon-cyan opacity-0 group-hover:opacity-100 animate-glitch-2"
        style={{ clipPath: 'inset(10% 0 58% 0)' }}
      >
        {text}
      </span>

      <span className="absolute top-0 left-0 w-full h-full -z-20 opacity-0 group-hover:opacity-40 animate-pulse text-white bg-white/5" />
    </div>
  )
}
