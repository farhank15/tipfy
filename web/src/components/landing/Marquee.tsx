import { motion } from 'framer-motion'

const items = [
  'ETHEREUM', 'MONAD', 'SOLANA', 'BITCOIN', 'STARKNET', 'ARBITRUM', 'OPTIMISM', 'POLYGON'
]

export const Marquee = () => {
  return (
    <div className="w-full overflow-hidden bg-white/5 border-y border-white/5 py-4 z-10 rotate-[-1deg] translate-y-[-20px]">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="flex gap-20 whitespace-nowrap"
      >
        {[...items, ...items].map((item, i) => (
          <span 
            key={i} 
            className="text-2xl font-black italic tracking-tighter opacity-20 hover:opacity-100 hover:text-neon-cyan transition-all cursor-default text-white"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
