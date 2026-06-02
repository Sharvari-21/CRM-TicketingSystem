export default function StatusBadge({ status }) {
  const cls =
    status === 'Open' ? 'badge badge-open' :
    status === 'In Progress' ? 'badge badge-progress' :
    status === 'Closed' ? 'badge badge-closed' : 'badge'
  return <span className={cls}>{status}</span>
}