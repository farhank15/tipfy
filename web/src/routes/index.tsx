import { createFileRoute } from '@tanstack/react-router'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { Zap, Shield, Globe } from 'lucide-react'
import { GlitchText } from '#/components/ui/GlitchText'
import { NeonButton } from '#/components/ui/NeonButton'
import { Navbar } from '#/components/layout/Navbar'
import { Footer } from '#/components/layout/Footer'
import { StatsSection } from '#/components/landing/StatsSection'
import { HowItWorks } from '#/components/landing/HowItWorks'
import { BottomCTA } from '#/components/landing/BottomCTA'
import { Marquee } from '#/components/landing/Marquee'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const { scrollYProgress } = useScroll()

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  })

  const gridY = useTransform(smoothProgress, [0, 1], ['0%', '10%'])
  const gridRotation = useTransform(smoothProgress, [0, 1], [60, 50])

  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.95])
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0])

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-cyber-dark selection:bg-neon-pink selection:text-black">
      {/* Subtle Background Grid - Lower opacity */}
      <motion.div
        style={{ rotateX: gridRotation, y: gridY }}
        className="retro-grid fixed inset-0 pointer-events-none opacity-10 z-0 h-[120vh]"
      />

      <Navbar />

      {/* Hero Section */}
      <div className="h-[120vh] w-full relative z-10 flex justify-center">
        <motion.main
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="sticky top-0 h-screen flex flex-col items-center justify-center text-center px-6 w-full max-w-7xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block px-4 py-1 border border-white/10 text-white/40 text-[9px] uppercase tracking-[0.4em] mb-6 font-bold"
          >
            Tipfy Protocol v1.0.1
          </motion.div>

          <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter mb-8 group cursor-default">
            <span className="block text-white leading-[0.85] transition-all group-hover:tracking-widest duration-500">
              FUTURE OF
            </span>
            <GlitchText text="SUPPORTING" className="text-neon-cyan" />
          </h1>

          <p className="max-w-xl mx-auto text-neutral-500 mb-12 text-sm md:text-base leading-relaxed font-medium">
            Jembatan masa depan bagi kreator dan pendukung. Transparansi
            on-chain, tanpa perantara.{' '}
            <span className="text-white/80">The Web3 way to tip.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <NeonButton variant="pink" className="px-12 py-3 text-sm">
              Join Creators
            </NeonButton>
            <NeonButton variant="cyan" className="px-12 py-3 text-sm">
              Explore Network
            </NeonButton>
          </div>
        </motion.main>
      </div>

      {/* Marquee Bar */}
      <Marquee />

      {/* Stats Section */}
      <div className="relative z-20 w-full mt-[-10vh]">
        <StatsSection />
      </div>

      {/* Features Section */}
      <section className="py-40 px-6 w-full max-w-7xl mx-auto z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Zap size={20} className="text-neon-yellow" />,
              title: 'Instant Payouts',
              desc: 'Donasi masuk langsung ke walletmu tanpa tertahan admin platform.',
            },
            {
              icon: <Shield size={20} className="text-neon-cyan" />,
              title: 'On-Chain Trust',
              desc: 'Semua transaksi tercatat di blockchain, transparan bagi semua orang.',
            },
            {
              icon: <Globe size={20} className="text-neon-pink" />,
              title: 'Global Reach',
              desc: 'Terima dukungan dari manapun di seluruh dunia tanpa batasan mata uang.',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-10 glass-card relative group text-left border border-white/5"
            >
              <div className="mb-6 bg-white/5 w-12 h-12 flex items-center justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-tight text-white/90 group-hover:text-neon-cyan transition-colors italic">
                {feature.title}
              </h3>
              <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <HowItWorks />
      <BottomCTA />
      <Footer />
    </div>
  )
}
