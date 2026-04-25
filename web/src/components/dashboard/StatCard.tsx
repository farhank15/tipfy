export interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  trend: string
}

export const StatCard = ({ icon, label, value, unit, trend }: StatCardProps) => {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-4">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-white tracking-tighter italic">{value}</span>
        <span className="text-[10px] font-bold text-neutral-500 uppercase">{unit}</span>
      </div>
      <p className="text-[9px] font-bold text-neon-cyan mt-4 uppercase tracking-widest italic">{trend}</p>
    </div>
  )
}
