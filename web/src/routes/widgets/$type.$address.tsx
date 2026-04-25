import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause } from 'lucide-react'
import Ably from 'ably'
import {
  getPublicOverlayConfigServerFn,
  getVotingResultsServerFn,
  getActiveVotingServerFn,
  getLeaderboardServerFn,
} from '../../lib/overlay-utils'

export const Route = createFileRoute('/widgets/$type/$address')({
  loader: async ({ params }) => {
    const config = await getPublicOverlayConfigServerFn({
      data: { type: params.type, address: params.address },
    })
    return { config: config as any, address: params.address, type: params.type }
  },
  component: WidgetPage,
})

function WidgetPage() {
  const { config, address, type } = Route.useLoaderData() as any
  const [activeAlert, setActiveAlert] = useState<any>(null)
  const [activeSoundName, setActiveSoundName] = useState<string | null>(null)
  const [votingData, setVotingData] = useState<any>(null)
  const [votingResults, setVotingResults] = useState<any[]>([])
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])
  const [recentDonations, setRecentDonations] = useState<any[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('connecting')
  const ablyClientRef = useRef<Ably.Realtime | null>(null)

  const isProcessing = useRef(false)
  const queue = useRef<any[]>([])

  const [timeLeft, setTimeLeft] = useState(0)
  const [isPaused, setIsPaused] = useState(type.toUpperCase() === 'SUBATHON')
  const timerRef = useRef<any>(null)

  const refreshData = async () => {
    const c = config
    if (!c) return
    if (type.toUpperCase() === 'LEADERBOARD') {
      try {
        const res = await getLeaderboardServerFn({
          data: {
            profileId: c.profileId,
            timeRange: c.config.timeRange || 'ALL',
            startDate: c.config.startDate,
          },
        })
        setLeaderboardData(res || [])
      } catch (e) {
        console.error('Refresh leaderboard failed:', e)
      }
    } else if (type.toUpperCase() === 'RUNNING_TEXT') {
      try {
        const res = await getLeaderboardServerFn({
          data: {
            profileId: c.profileId,
            timeRange: 'ALL',
          },
        })
        setRecentDonations(res || [])
      } catch (e) {
        console.error('Refresh running text failed:', e)
      }
    }
  }

  useEffect(() => {
    if (!address) return
    const c = config
    if (!c) return

    const ably = new Ably.Realtime({ 
      authUrl: '/api/auth/ably-token',
    })
    ablyClientRef.current = ably

    ably.connection.on('connected', () => {
      setConnectionStatus('connected')
    })

    ably.connection.on('disconnected', () => {
      setConnectionStatus('disconnected')
    })

    ably.connection.on('failed', () => {
      setConnectionStatus('failed')
    })

    const channel = ably.channels.get(`donations:${address}`)
    channel.subscribe('new-donation', (message) => {
      const donation = message.data
      if (type.toUpperCase() === 'ALERT' || type.toUpperCase() === 'SOUNDBOARD') {
        queue.current.push(donation)
        processQueue()
      } else if (type.toUpperCase() === 'SUBATHON') {
        const rules = c.config.rules || []
        const amount = Number(donation.amount)
        const sortedRules = [...rules].sort((a: any, b: any) => b.amount - a.amount)
        const match = sortedRules.find((r: any) => amount >= r.amount)
        if (match) {
          const addSecs = match.hours * 3600 + match.minutes * 60 + match.seconds
          setTimeLeft((prev) => prev + addSecs)
        }
      } else if (type.toUpperCase() === 'LEADERBOARD' || type.toUpperCase() === 'RUNNING_TEXT') {
        refreshData()
      }
    })

    return () => {
      channel.unsubscribe()
      ably.close()
    }
  }, [address, type, config])

  useEffect(() => {
    const c = config
    if (type.toUpperCase() === 'VOTING' && c && !votingData) {
      const fetchVoting = async () => {
        try {
          const res = await getActiveVotingServerFn({
            data: { profileId: c.profileId },
          })
          if (res) setVotingData(res)
        } catch (e) {
          console.error('Fetch voting error:', e)
        }
      }
      const interval = setInterval(fetchVoting, 5000)
      fetchVoting()
      return () => clearInterval(interval)
    }
  }, [type, config, votingData])

  useEffect(() => {
    if (type.toUpperCase() === 'VOTING' && votingData) {
      const pollResults = async () => {
        try {
          const res = await getVotingResultsServerFn({
            data: { votingId: (votingData as any).id },
          })
          setVotingResults(res as any[])
        } catch (e) {
          console.error('Poll results error:', e)
        }
      }
      const interval = setInterval(pollResults, 5000)
      pollResults()
      return () => clearInterval(interval)
    }
  }, [type, votingData])

  useEffect(() => {
    const c = config
    if (type.toUpperCase() === 'SUBATHON' && c?.config) {
      const initial = c.config.initialHours * 3600 + c.config.initialMinutes * 60 + c.config.initialSeconds
      setTimeLeft(initial)
    }
    refreshData()
  }, [type, config])

  useEffect(() => {
    if (type.toUpperCase() === 'SUBATHON' && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [type, isPaused, timeLeft])

  const processQueue = () => {
    if (isProcessing.current || queue.current.length === 0) return
    isProcessing.current = true
    const next = queue.current.shift()
    setActiveAlert(next)
    const c = (config as any)?.config
    if (!c) return
    const amount = Number(next.amount)
    if (c.mediaEnabled && c.sounds && c.sounds.length > 0) {
      const sound = c.sounds.find((s: any) => amount >= (s.minAmount || 0))
      if (sound) {
        const audio = new Audio(sound.url)
        if (type.toUpperCase() === 'SOUNDBOARD') setActiveSoundName(sound.name)
        audio.play().catch((e) => console.error('Audio play failed:', e))
      }
    }
    if (c.ttsEnabled && amount >= (c.minTtsAmount || 0) && next.message) {
      const utterance = new SpeechSynthesisUtterance(next.message)
      utterance.lang = c.ttsVoice?.startsWith('id') ? 'id-ID' : 'en-US'
      setTimeout(() => window.speechSynthesis.speak(utterance), 1000)
    }
    setTimeout(() => {
      setActiveAlert(null)
      setActiveSoundName(null)
      setTimeout(() => {
        isProcessing.current = false
        processQueue()
      }, 500)
    }, c.duration || 5000)
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  if (!config || (config as any).isEnabled === false) return null

  if (type.toUpperCase() === 'RUNNING_TEXT') {
    const s = (config as any).config
    const shouldHideAmount = s.hideAmount === true || s.showAmount === false
    const marqueeText = recentDonations.map((d: any) => `${d.senderName || 'Anonymous'}${shouldHideAmount ? '' : `: ${d.totalAmount} MON`}`).join('  ///  ')
    const fullText = `${s.extraText || 'TIPFY LIVE STREAM OVERLAY'}  ${marqueeText ? `  [ LATEST DONATIONS: ${marqueeText} ]` : ''}`
    return (
      <div className="w-screen h-screen flex items-end overflow-hidden" style={{ backgroundColor: 'transparent' }}>
        <div className={`w-full py-4 overflow-hidden relative ${s.showBorder ? 'border-y-2' : ''}`} style={{ backgroundColor: s.backgroundColor, borderColor: s.highlightColor }}>
          <motion.div initial={{ x: '100%' }} animate={{ x: '-100%' }} transition={{ duration: Number(s.speed) || 20, repeat: Infinity, ease: 'linear' }} className="whitespace-nowrap flex items-center gap-12">
            <span style={{ color: s.textColor, fontSize: s.fontSize || '2rem', fontWeight: s.fontWeight || '800' }} className="italic uppercase tracking-wider">{fullText}</span>
            <span style={{ color: s.textColor, fontSize: s.fontSize || '2rem', fontWeight: s.fontWeight || '800' }} className="italic uppercase tracking-wider">{fullText}</span>
          </motion.div>
        </div>
      </div>
    )
  }

  if (type.toUpperCase() === 'LEADERBOARD') {
    const s = (config as any).config
    const shouldHideAmount = s.hideAmount === true || s.showAmount === false
    return (
      <div className="w-screen h-screen flex items-center justify-center p-8 overflow-hidden">
        <div className={`max-w-xl w-full p-10 space-y-8 bg-black/70 backdrop-blur-xl ${!s.showBorder ? '' : 'border-l-4'}`} style={{ borderColor: s.highlightColor, backgroundColor: s.backgroundColor }}>
          <h2 className="text-4xl italic tracking-tighter uppercase leading-none" style={{ color: s.textColor, fontWeight: s.fontTitle || '900' }}>{s.title || 'Leaderboard'}</h2>
          <div className="space-y-3">
            {leaderboardData.slice(0, 10).map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 skew-x--10 transition-all">
                <div className="flex items-center gap-4 skew-x-10">
                  <span className="text-[10px] font-mono opacity-30">#{(i + 1).toString().padStart(2, '0')}</span>
                  <span className="text-xl italic uppercase tracking-tight" style={{ color: s.textColor, fontWeight: s.fontContent || '700' }}>{item.senderName || 'Anonymous'}</span>
                </div>
                {!shouldHideAmount && <div className="skew-x-10 text-right"><span className="text-lg font-black italic" style={{ color: s.highlightColor }}>{item.totalAmount} MON</span></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type.toUpperCase() === 'VOTING') {
    const s = (config as any).config
    const now = new Date()
    if (!votingData) return null
    const start = new Date(votingData.startAt), end = new Date(votingData.endAt)
    const isLive = now >= start && now <= end
    const totalVotes = votingResults.reduce((sum, r) => sum + Number(r.count), 0)
    const getPercentage = (idx: number) => totalVotes === 0 ? 0 : Math.round((Number(votingResults.find(r => r.optionIndex === idx)?.count || 0) / totalVotes) * 100)
    return (
      <div className="w-screen h-screen flex items-center justify-center p-12 overflow-hidden">
        <div className={`max-w-2xl w-full p-12 space-y-10 bg-black/60 backdrop-blur-xl ${!s.showBorder ? '' : 'border-l-4'}`} style={{ borderColor: isLive ? s.highlightColor : '#444', backgroundColor: s.backgroundColor }}>
          <h2 className="text-5xl italic tracking-tighter uppercase leading-none" style={{ color: s.textColor, fontWeight: s.fontTitle || '900' }}>{votingData.title}</h2>
          <div className="space-y-6">
            {(votingData.options as string[]).map((opt, i) => {
              const pct = getPercentage(i)
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-2xl italic uppercase tracking-tight" style={{ color: s.textColor, fontWeight: s.fontContent || '700' }}>{opt}</span>
                    <span className="text-lg font-mono opacity-50">{pct}%</span>
                  </div>
                  <div className="h-4 bg-white/5 border border-white/5 relative overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="absolute inset-0 bg-neon-cyan" style={{ backgroundColor: s.highlightColor }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (type.toUpperCase() === 'SUBATHON') {
    const s = (config as any).config
    return (
      <div className="w-screen h-screen flex items-center justify-center font-mono overflow-hidden" style={{ backgroundColor: s.backgroundColor }}>
        <div className={`px-12 py-8 bg-black/60 backdrop-blur-md ${s.showBorder ? 'border-4' : ''}`} style={{ borderColor: s.highlightColor }}>
          <div style={{ color: s.textColor, fontSize: s.fontSize || '6rem', fontWeight: s.fontWeight || '900', textShadow: `0 0 30px ${s.highlightColor}66` }} className="tracking-tighter italic leading-none text-center">{formatTime(timeLeft)}</div>
        </div>
        <button onClick={() => setIsPaused(!isPaused)} className="fixed bottom-6 right-6 p-2 bg-black/60 border border-white/20 text-white/50 z-50 pointer-events-auto rounded-lg">
          {isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
        </button>
      </div>
    )
  }

  if (type.toUpperCase() !== 'ALERT' && type.toUpperCase() !== 'SOUNDBOARD') return null
  const styles = (config as any)?.config || { backgroundColor: '#00000000', textColor: '#ffffff', highlightColor: '#00f3ff' }

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden font-sans" style={{ backgroundColor: 'transparent' }}>
      <AnimatePresence>
        {activeAlert && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-px" style={{ backgroundColor: styles.highlightColor }} />
              <p className="text-xs font-black uppercase tracking-[0.5em] italic" style={{ color: styles.textColor }}>TRANSMISSION_FROM: {activeAlert.senderName}</p>
              <div className="w-12 h-px" style={{ backgroundColor: styles.highlightColor }} />
            </div>
            <h2 className="text-9xl font-black italic tracking-tighter uppercase leading-none" style={{ color: styles.textColor }}>{activeAlert.amount} <span style={{ color: styles.highlightColor }}>{activeAlert.currency}</span></h2>
            {type.toUpperCase() === 'SOUNDBOARD' && activeSoundName && (
              <div className="mb-10 flex items-center justify-center gap-4">
                <div className="px-6 py-3 bg-white/5 border border-white/10 flex items-center gap-4 skew-x--10">
                  <span className="text-3xl font-black italic uppercase tracking-tighter text-white skew-x-10">Playing: {activeSoundName}</span>
                </div>
              </div>
            )}
            {activeAlert.message && (
              <div className="max-w-3xl mx-auto mt-10">
                <div className="relative px-12 py-6 bg-black/60 border border-white/10 backdrop-blur-sm skew-x--10">
                  <p className="text-3xl font-bold uppercase tracking-wide skew-x-10 leading-relaxed" style={{ color: styles.textColor }}>"{activeAlert.message}"</p>
                </div>
              </div>
            )}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-50 blur-100 -z-10 opacity-30" style={{ backgroundColor: styles.highlightColor }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
