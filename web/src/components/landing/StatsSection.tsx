import { motion } from 'framer-motion'

const stats = [
  { label: 'Total Volume', value: '$2.4M+', color: 'text-neon-cyan' },
  { label: 'Active Creators', value: '1,200+', color: 'text-neon-pink' },
  { label: 'Total Tips', value: '45K+', color: 'text-neon-yellow' },
  { label: 'Network', value: 'MONAD', color: 'text-white' },
]

export const StatsSection = () => {
  return (
    <div className="w-full py-20 border-y border-white/5 bg-black/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: 'spring' }}
            className="text-center"
          >
            <div className={`text-3xl md:text-5xl font-black mb-2 ${stat.color} text-glow`}>
              {stat.value}
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
