'use client'
import StatusIcon from './StatusIcon'

interface Step {
  status: 'completed' | 'processing' | 'pending'
  startedAt?: string
  completedAt?: string
}

interface QueueItem {
  orderId: string
  status: 'processing' | 'pending' | 'completed'
  queuedAt: string
  steps: {
    topaz: Step
    lumaprint: Step
  }
}

const mockQueue: QueueItem[] = [
  {
    orderId: '1',
    status: 'processing',
    queuedAt: '2024-01-15T10:30:00Z',
    steps: {
      topaz: { status: 'completed', completedAt: '2024-01-15T10:35:00Z' },
      lumaprint: { status: 'processing', startedAt: '2024-01-15T10:36:00Z' }
    }
  },
  {
    orderId: '2',
    status: 'pending',
    queuedAt: '2024-01-15T10:45:00Z',
    steps: {
      topaz: { status: 'pending' },
      lumaprint: { status: 'pending' }
    }
  }
]

export default function QueueList() {
  return (
    <div className="glass-effect rounded-2xl p-6">
      <div className="space-y-4">
        {mockQueue.map((item) => (
          <div key={item.orderId} className="p-4 hover:bg-white/5 rounded-lg transition-colors border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-medium">Order #{item.orderId}</h3>
                <p className="text-gray-400 text-sm">
                  Queued: {new Date(item.queuedAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                item.status === 'completed' 
                  ? 'bg-green-500/20 text-green-400'
                  : item.status === 'processing'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {item.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <StatusIcon status={item.steps.topaz.status} />
                <div>
                  <p className="text-white text-sm font-medium">Topaz Enhancement</p>
                  <p className="text-gray-400 text-xs">{item.steps.topaz.status}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <StatusIcon status={item.steps.lumaprint.status} />
                <div>
                  <p className="text-white text-sm font-medium">LumaPrint</p>
                  <p className="text-gray-400 text-xs">{item.steps.lumaprint.status}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
