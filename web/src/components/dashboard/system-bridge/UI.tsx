import { motion } from 'framer-motion'

export function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: any
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
        active ? 'text-neon-cyan' : 'text-neutral-500 hover:text-white'
      }`}
    >
      {icon}
      {label}
      {active && (
        <motion.div
          layoutId="activeSubTab"
          className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-neon-cyan"
        />
      )}
    </button>
  )
}

export function InputField({
  label,
  name,
  form,
  type = 'text',
  placeholder,
}: {
  label: string
  name: any
  form: any
  type?: string
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
        {label}
      </label>
      <form.Field
        name={name}
        children={(field: any) => (
          <input
            type={type}
            placeholder={placeholder}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            className="w-full bg-black border border-white/10 p-3 font-mono text-xs text-white focus:border-neon-cyan focus:outline-none transition-colors"
          />
        )}
      />
    </div>
  )
}

export function ToggleField({
  label,
  name,
  form,
  icon,
}: {
  label: string
  name: any
  form: any
  icon: any
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 skew-x--5">
      <div className="flex items-center gap-3 skew-x-5">
        <div className="text-neon-cyan">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-white">
          {label}
        </span>
      </div>
      <form.Field
        name={name}
        children={(field: any) => (
          <button
            type="button"
            onClick={() => field.handleChange(!field.state.value)}
            className={`w-12 h-6 flex items-center px-1 transition-all skew-x-5 ${field.state.value ? 'bg-neon-cyan' : 'bg-neutral-800'}`}
          >
            <div
              className={`w-4 h-4 bg-white transition-all ${field.state.value ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        )}
      />
    </div>
  )
}
