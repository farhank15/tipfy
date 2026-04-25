interface FeedItemProps {
  user: string
  msg: string
  type: 'tip' | 'info' | 'msg'
}

export const FeedItem = ({ user, msg, type }: FeedItemProps) => {
  const colors = { 
    tip: 'text-neon-cyan', 
    info: 'text-neutral-600', 
    msg: 'text-white' 
  }
  
  return (
    <div className="space-y-1 group">
      <div className="flex items-center justify-between text-[8px]">
        <span className={`${type === 'tip' ? 'text-neon-pink' : 'text-neutral-500'} font-bold`}>
          [{user.toUpperCase()}]
        </span>
        <span className="text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">12:44:02</span>
      </div>
      <p className={`${colors[type]} text-[10px] leading-relaxed break-words`}>
        {type === 'info' && '> '}
        {msg}
      </p>
    </div>
  )
}
