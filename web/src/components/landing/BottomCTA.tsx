import { motion } from 'framer-motion'
import { NeonButton } from '../ui/NeonButton'

export const BottomCTA = () => {
  return (
    <section className="py-60 w-full relative flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-neon-pink/10 blur-150 -z-10 rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-3xl"
      >
        <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-8 text-white">
          READY TO <span className="text-neon-cyan text-glow">JOIN THE</span> FUTURE?
        </h2>
        <p className="text-neutral-500 mb-12 text-lg font-medium">
          The next generation of content creation is on-chain. 
          Stop letting platforms take your revenue. 
          Start your Tipfy profile today.
        </p>
        <NeonButton variant="pink" className="scale-125">
          Get Started Now
        </NeonButton>
      </motion.div>
    </section>
  )
}
