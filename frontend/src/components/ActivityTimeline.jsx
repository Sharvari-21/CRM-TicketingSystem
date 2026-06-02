import { useEffect, useState } from 'react'
import {
  Clock, User, MessageSquare, Edit3, CheckCheck, Plus, AlertTriangle,
} from 'lucide-react'
import api from '../api/axios'

/* ── derive activity events from real ticket data ── */
function buildActivity(tickets) {
  const events = []

  tickets.forEach(t => {
    const id   = t.ticket_id
    const name = t.customer_name || 'Unknown'
    const subj = t.subject       || '(no subject)'
    const created = new Date(t.createdAt || t.created_at)
    const updated = new Date(t.updatedAt || t.updated_at)

    // 1 — ticket created
    events.push({
      id:      `${id}-created`,
      type:    'created',
      icon:    Plus,
      iconCls: 'at-icon-green',
      title:   `Ticket ${id} created`,
      sub:     `by ${name} · "${subj}"`,
      ts:      created,
    })

    // 2 — if ticket is closed/resolved, add a resolved event at updatedAt
    const st = (t.status || '').toLowerCase().replace(/\s+/g, '')
    if (st === 'closed' || st === 'resolved') {
      events.push({
        id:      `${id}-closed`,
        type:    'closed',
        icon:    CheckCheck,
        iconCls: 'at-icon-green',
        title:   `Ticket ${id} resolved`,
        sub:     `by ${name}`,
        ts:      updated,
      })
    }

    // 3 — if in-progress, add a status-change event
    if (st === 'inprogress' || st === 'in progress') {
      events.push({
        id:      `${id}-inprogress`,
        type:    'status',
        icon:    Edit3,
        iconCls: 'at-icon-blue',
        title:   `Status changed to In Progress`,
        sub:     `${id} · ${subj}`,
        ts:      updated,
      })
    }

    // 4 — notes
    if (Array.isArray(t.notes)) {
      t.notes.forEach((note, i) => {
        const noteTs = new Date(note.createdAt || note.created_at || updated)
        events.push({
          id:      `${id}-note-${i}`,
          type:    'note',
          icon:    MessageSquare,
          iconCls: 'at-icon-purple',
          title:   `Note added`,
          sub:     `${id} · "${note.text || note.content || note.message || ''}"`,
          ts:      noteTs,
        })
      })
    }
  })

  // Sort newest first, take top 10
  events.sort((a, b) => b.ts - a.ts)
  return events.slice(0, 10)
}

/* ── relative time helper ── */
function relTime(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/* ── component ── */
export default function ActivityTimeline() {
  const [activity, setActivity] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/tickets?limit=50&page=1')
        const tickets =
          res.data?.data?.tickets ??
          res.data?.tickets ??
          res.data?.data ?? []
        setActivity(buildActivity(Array.isArray(tickets) ? tickets : []))
      } catch (e) {
        console.error('ActivityTimeline:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="card activity-card">
      <div className="card-header">
        <div className="card-title">
          <Clock size={15} className="card-title-icon" />
          Activity Timeline
        </div>
      </div>

      <div className="activity-list">
        {loading ? (
          <div className="loading-wrap"><span className="spinner" />Loading...</div>
        ) : activity.length === 0 ? (
          <div className="empty">
            <div className="empty-text">No recent activity.</div>
          </div>
        ) : (
          activity.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={item.id} className="at-item">
                <div className="at-track">
                  <div className={`at-icon-wrap ${item.iconCls}`}>
                    <Icon size={12} strokeWidth={2.5} />
                  </div>
                  {i < activity.length - 1 && <div className="at-line" />}
                </div>
                <div className="at-body">
                  <div className="at-title">{item.title}</div>
                  <div className="at-sub">{item.sub}</div>
                  <div className="at-time">{relTime(item.ts)}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}