import { AlertTriangle, ArrowUp, Minus, ArrowDown } from 'lucide-react'

const config = {
  critical: { label: 'Critical', cls: 'badge-critical', Icon: AlertTriangle },
  high:     { label: 'High',     cls: 'badge-high',     Icon: ArrowUp },
  medium:   { label: 'Medium',   cls: 'badge-medium',   Icon: Minus },
  low:      { label: 'Low',      cls: 'badge-low',      Icon: ArrowDown },
}

export default function PriorityBadge({ priority }) {
  const key = (priority || 'medium').toLowerCase()
  const { label, cls, Icon } = config[key] || config.medium
  return (
    <span className={`badge priority-badge ${cls}`}>
      <Icon size={10} strokeWidth={2.5} />
      {label}
    </span>
  )
}