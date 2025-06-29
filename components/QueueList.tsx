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
    <div className="glass-effect rounded-lg p-3">
      <div className="space-y-2">
        {mockQueue.map((item) => (
          <div key={item.orderId} className="p-2 hover:bg-white/5 rounded transition-colors border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-white font-medium text-sm">Order #{item.orderId}</h3>
                <p className="text-gray-400 text-xs">
                  Queued: {new Date(item.queuedAt).toLocaleString()}
                </p>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                item.status === 'completed' 
                  ? 'bg-green-500/20 text-green-400'
                  : item.status === 'processing'
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {item.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 p-2 bg-white/5 rounded">
                <StatusIcon status={item.steps.topaz.status} />
                <div>
                  <p className="text-white text-xs font-medium">Topaz Enhancement</p>
                  <p className="text-gray-400 text-xs">{item.steps.topaz.status}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 p-2 bg-white/5 rounded">
                <StatusIcon status={item.steps.lumaprint.status} />
                <div>
                  <p className="text-white text-xs font-medium">LumaPrint</p>
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
