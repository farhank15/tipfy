import type { LucideIcon } from 'lucide-react'

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  color: string
}

interface DashboardMobileNavProps {
  items: NavItem[]
  activeTab: string
  setActiveTab: (id: string) => void
}

export const DashboardMobileNav = ({ items, activeTab, setActiveTab }: DashboardMobileNavProps) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#080808]/90 backdrop-blur-xl border-t border-white/10 flex justify-around p-4 z-[100]">
      {items.map((item: NavItem) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === item.id ? item.color : 'text-neutral-500'
          }`}
        >
          <item.icon size={20} />
          <span className="text-[8px] font-black uppercase tracking-tighter italic">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
