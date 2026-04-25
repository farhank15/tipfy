import { useState, useRef, useEffect } from 'react'
import Draggable from 'react-draggable'
import { MonitorPlay, Play, Pause, RefreshCw } from 'lucide-react'

export const Simulator = ({
  type,
  user,
  nodeRef,
  simulatorKey,
  isDragging,
  setIsDragging,
  setSimulatorKey,
  setShowSimulator,
}: {
  type: string
  user: any
  nodeRef: any
  simulatorKey: number
  isDragging: boolean
  setIsDragging: (val: boolean) => void
  setSimulatorKey: (val: any) => void
  setShowSimulator: (val: boolean) => void
}) => {
  const [isPaused, setIsPaused] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const togglePause = () => {
    const nextState = !isPaused
    setIsPaused(nextState)
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'SET_PAUSE', paused: nextState },
        '*',
      )
    }
  }

  // Ensure iframe is in sync with simulator state on reload
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'SET_PAUSE', paused: isPaused },
          '*',
        )
      }
    }, 1000) // Give it a second to load
    return () => clearTimeout(timer)
  }, [simulatorKey, type])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <Draggable
        nodeRef={nodeRef}
        handle=".handle"
        onStart={() => setIsDragging(true)}
        onStop={() => setIsDragging(false)}
      >
        <div
          ref={nodeRef}
          className="w-[800px] h-[450px] bg-black/90 border-2 border-neon-cyan shadow-[0_0_50px_rgba(0,243,255,0.2)] pointer-events-auto overflow-hidden flex flex-col relative"
        >
          <div
            className={`handle p-3 bg-neon-cyan text-black flex items-center justify-between shrink-0 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <div className="flex items-center gap-3">
              <MonitorPlay size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Live_Overlay_Preview (Interactive_Sim)
              </span>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-black/20" />
              <div className="w-3 h-3 rounded-full bg-black/20" />
            </div>
          </div>
          <div className="flex-1 bg-cyber-grid relative">
            {isDragging && (
              <div className="absolute inset-0 z-50 bg-transparent" />
            )}
            <iframe
              ref={iframeRef}
              key={simulatorKey}
              src={`${window.location.origin}/widgets/${type}/${user?.address}`}
              className="w-full h-full border-none"
            />
          </div>

          <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-mono text-neutral-500 uppercase">
                Stream_Buffer: ACTIVE
              </span>
            </div>
            <div className="flex gap-2">
              {type === 'SUBATHON' && (
                <button
                  type="button"
                  onClick={togglePause}
                  className={`px-3 py-1 ${isPaused ? 'bg-neon-cyan text-black' : 'bg-white/10 text-white'} text-[8px] font-black uppercase tracking-widest flex items-center gap-2 transition-all`}
                >
                  {isPaused ? <Play size={10} /> : <Pause size={10} />}
                  {isPaused ? 'Play' : 'Pause'}
                </button>
              )}

              {type !== 'ALERT' && type !== 'SOUNDBOARD' && (
                <button
                  type="button"
                  onClick={() => setSimulatorKey((prev: number) => prev + 1)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-[8px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <RefreshCw size={10} />
                  Restart
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSimulator(false)}
                className="px-3 py-1 bg-neon-pink text-black text-[8px] font-black uppercase tracking-widest"
              >
                Detach
              </button>
            </div>
          </div>
        </div>
      </Draggable>
    </div>
  )
}
