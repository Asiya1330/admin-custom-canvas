'use client'
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type Status = 'completed' | 'processing' | 'failed' | 'pending'

export default function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="text-green-400" size={12} />
    case 'processing':
      return <Clock className="text-orange-400 animate-spin" size={12} />
    case 'failed':
      return <XCircle className="text-red-400" size={12} />
    default:
      return <AlertCircle className="text-gray-400" size={12} />
  }
}
