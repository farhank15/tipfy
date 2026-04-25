import {
  BellRing,
  Music,
  Timer,
  Vote,
  QrCode,
  Target,
  Trophy,
  Activity,
} from 'lucide-react'

export interface OverlayType {
  id: string
  label: string
  icon: any
  description: string
  color: string
}

export const OVERLAY_TYPES: OverlayType[] = [
  {
    id: 'ALERT',
    label: 'Alert Box',
    icon: BellRing,
    color: 'text-neon-pink',
    description: 'Notifikasi tip real-time di layar.',
  },
  {
    id: 'SOUNDBOARD',
    label: 'Soundboard',
    icon: Music,
    color: 'text-neon-cyan',
    description: 'Gunakan overlay ini untuk membolehkan penontonmu mengirimkan suara untuk dimainkan pada streammu.',
  },
  {
    id: 'SUBATHON',
    label: 'Subathon',
    icon: Timer,
    color: 'text-white',
    description: 'Hitung mundur waktu otomatis.',
  },
  {
    id: 'VOTING',
    label: 'Voting',
    icon: Vote,
    color: 'text-neon-pink',
    description: 'Adakan polling untuk penonton.',
  },
  {
    id: 'QR_CODE',
    label: 'QR Code',
    icon: QrCode,
    color: 'text-neon-cyan',
    description: 'QR link profil untuk di layar.',
  },
  {
    id: 'MILESTONE',
    label: 'Milestone',
    icon: Target,
    color: 'text-white',
    description: 'Target donasi / Goal bar.',
  },
  {
    id: 'LEADERBOARD',
    label: 'Leaderboard',
    icon: Trophy,
    color: 'text-neon-pink',
    description: 'Daftar donatur paling setia.',
  },
  {
    id: 'RUNNING_TEXT',
    label: 'Running Text',
    icon: Activity,
    color: 'text-neon-cyan',
    description: 'Teks berjalan untuk info stream.',
  },
  {
    id: 'WHEEL',
    label: 'Spin Wheel',
    icon: Target,
    color: 'text-neon-pink',
    description: 'Putar roda keberuntungan.',
  },
]
