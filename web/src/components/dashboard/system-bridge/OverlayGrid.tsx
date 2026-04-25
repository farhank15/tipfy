import { motion } from 'framer-motion'
import { OVERLAY_TYPES } from './constants'

export const OverlayGrid = ({
  onSelect,
}: {
  onSelect: (id: string) => void
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
          System <span className="text-neon-cyan">Bridge</span>
        </h2>
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">
          Central overlay configuration hub // Status: STANDBY
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {OVERLAY_TYPES.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="p-6 bg-white/2 border border-white/5 space-y-4 group hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all text-left relative overflow-hidden skew-x--5"
          >
            <div className="skew-x-5">
              <div
                className={`w-10 h-10 bg-white/5 flex items-center justify-center ${item.color} mb-4`}
              >
                <item.icon size={20} />
              </div>
              <h3 className="font-black uppercase tracking-widest italic text-white text-sm">
                {item.label}
              </h3>
              <p className="text-[10px] text-neutral-500 leading-relaxed uppercase font-bold tracking-widest mt-1 italic">
                {item.description}
              </p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
              <item.icon size={40} />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  )
}
