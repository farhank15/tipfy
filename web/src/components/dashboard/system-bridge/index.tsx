import { useState } from 'react'
import { OverlayGrid } from './OverlayGrid'
import { OverlayEditor } from './OverlayEditor'

export const SystemBridge = ({ user }: { user: any }) => {
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null)

  if (selectedOverlay) {
    return (
      <OverlayEditor
        user={user}
        type={selectedOverlay}
        onBack={() => setSelectedOverlay(null)}
      />
    )
  }

  return <OverlayGrid onSelect={setSelectedOverlay} />
}
