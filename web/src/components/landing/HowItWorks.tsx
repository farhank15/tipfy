import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'

const steps = [
  {
    step: '01',
    title: 'CONNECT WALLET',
    desc: 'Sign in with your favorite Web3 wallet. Your identity is your private key.',
  },
  {
    step: '02',
    title: 'SET UP PROFILE',
    desc: 'Create your unique Tipfy URL and link your socials to start receiving tips.',
  },
  {
    step: '03',
    title: 'RECEIVE ON-CHAIN',
    desc: 'Every tip is a blockchain transaction. Transferred directly and instantly.',
  },
]

export const HowItWorks = () => {
  return (
    <section className="py-40 px-6 w-full max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-4 text-white">
          THE <span className="text-neon-pink">PROTOCOL</span> WORKFLOW
        </h2>
        <p className="text-neutral-500 uppercase tracking-widest text-xs font-bold">
          Terminal Simulation v1.0.4
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        {/* Animated Connecting Line */}
        <div className="hidden md:block absolute top-12 left-20 right-20 h-px bg-neutral-800 -z-10" />

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="group"
          >
            <div className="bg-black border border-neutral-800 p-8 hover:border-neon-cyan transition-all relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-black border border-neutral-800 flex items-center justify-center text-neon-cyan font-black italic glow-cyan">
                {step.step}
              </div>
              <div className="flex items-center gap-3 mb-6 text-neutral-600">
                <Terminal size={16} />
                <span className="text-[10px] tracking-widest font-mono">
                  EXECUTING_STEP_{step.step}...
                </span>
              </div>
              <h3 className="text-2xl font-black mb-4 text-white group-hover:text-neon-cyan transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
