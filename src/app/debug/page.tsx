'use client'

import { useDrawer } from '@/components/DrawerContext'

export default function DebugDrawerPage() {
  const { selectedStartupId, setSelectedStartupId } = useDrawer()

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Debug Drawer Context</h1>
      <p className="text-gray-600">Selected ID: {selectedStartupId ?? 'None'}</p>
      <div className="space-x-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setSelectedStartupId('startup-123')}
        >
          Set to startup-123
        </button>
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded"
          onClick={() => setSelectedStartupId(null)}
        >
          Clear
        </button>
      </div>
    </div>
  )
} 