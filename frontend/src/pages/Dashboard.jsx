import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Ticket, CircleDot, Loader2, CheckCircle2,
  Plus, ArrowRight, Inbox, TrendingUp, Activity, Clock,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import ActivityTimeline from '../components/ActivityTimeline'
import api from '../api/axios'

/* ─── helpers ─────────────────────────────────────── */
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildTrend(tickets) {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const map = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    map[key] = { day: DAY_LABELS[d.getDay()], date: key, open: 0, closed: 0, inProgress: 0 }
  }

  tickets.forEach(t => {
    const raw = t.created_at || t.createdAt
    if (!raw) return
    const key = new Date(raw).toISOString().slice(0, 10)
    if (!map[key]) return
    const status = (t.status || '').toLowerCase().replace(/\s+/g, '')
    if (status === 'closed' || status === 'resolved') map[key].closed++
    else if (status === 'inprogress' || status === 'in progress') map[key].inProgress++
    else map[key].open++
  })

  return Object.values(map)
}

/* ─── custom tooltip ───────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="ct-label">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="ct-row">
          <span className="ct-dot" style={{ background: p.color }} />
          <span>{p.name}</span>
          <b>{p.value}</b>
        </div>
      ))}
    </div>
  )
}

/* ─── component ─────────────────────────────────────── */
export default function Dashboard() {
  const [stats,     setStats]     = useState({ total: 0, open: 0, inProgress: 0, closed: 0 })
  const [recent,    setRecent]    = useState([])
  const [trendData, setTrendData] = useState([])
  const [loading,   setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, recentRes, allRes] = await Promise.all([
          api.get('/tickets/stats'),
          api.get('/tickets?limit=5&page=1'),
          api.get('/tickets?limit=200&page=1'),
        ])

        // ── stats ──
        const s = statsRes.data?.stats || statsRes.data?.data?.stats || {}
        setStats({
          total:      s.total      ?? s.totalTickets  ?? 0,
          open:       s.open       ?? s.openTickets   ?? 0,
          inProgress: s.inProgress ?? s['In Progress'] ?? 0,
          closed:     s.closed     ?? s.closedTickets ?? 0,
        })

        // ── recent table ──
        const recentTickets =
          recentRes.data?.data?.tickets ??
          recentRes.data?.tickets ??
          recentRes.data?.data ?? []
        setRecent(Array.isArray(recentTickets) ? recentTickets.slice(0, 5) : [])

        // ── chart source ──
        const allTickets =
          allRes.data?.data?.tickets ??
          allRes.data?.tickets ??
          allRes.data?.data ?? []

        const source = Array.isArray(allTickets) && allTickets.length > 0
          ? allTickets
          : (Array.isArray(recentTickets) ? recentTickets : [])

        setTrendData(buildTrend(source))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { cls: 's-total',    label: 'Total Tickets', value: stats.total,      icon: <Ticket size={22} /> },
    { cls: 's-open',     label: 'Open',          value: stats.open,       icon: <CircleDot size={22} /> },
    { cls: 's-progress', label: 'In Progress',   value: stats.inProgress, icon: <Loader2 size={22} /> },
    { cls: 's-closed',   label: 'Closed',        value: stats.closed,     icon: <CheckCircle2 size={22} /> },
  ]

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main page-enter">

        {/* ── Page header ── */}
<div className="page-header page-header-banner">
  <img
    src="/images/team-puzzle.jpg"
    alt=""
    aria-hidden="true"
    className="page-header-bg"
  />
  <div className="page-header-overlay" />
  <div className="page-header-content">
    <div>
      <div className="page-title page-title-light">
        <LayoutDashboard size={20} className="title-icon" />
        Dashboard
      </div>
      <div className="page-sub page-sub-light">Overview of your support system</div>
    </div>
    <div style={{ flexShrink: 0 }}>
  <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
    + New Ticket
  </button>
</div>
  </div>
</div>

        {/* ── Stat cards ── */}
        <div className="stats-grid">
          {statCards.map(s => (
            <div key={s.cls} className={`stat-card ${s.cls}`}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Charts row ── */}
        {!loading && (
          <div className="charts-grid">

            {/* Ticket volume trend */}
            <div className="card chart-card">
              <div className="card-header">
                <div className="card-title">
                  <TrendingUp size={15} className="card-title-icon" />
                  Ticket Volume (7d)
                </div>
              </div>
              <div className="chart-body">
                {trendData.length === 0 ? (
                  <div className="chart-empty">No data for the past 7 days</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={trendData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gOpen" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#D97706" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gClosed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#16A34A" stopOpacity={0.18} />
                            <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAECF0" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="open"       name="Open"        stroke="#D97706" strokeWidth={2} fill="url(#gOpen)"   dot={false} activeDot={{ r: 4 }} />
                        <Area type="monotone" dataKey="inProgress" name="In Progress" stroke="#2563EB" strokeWidth={2} fill="none"          dot={false} activeDot={{ r: 4 }} strokeDasharray="4 2" />
                        <Area type="monotone" dataKey="closed"     name="Closed"      stroke="#16A34A" strokeWidth={2} fill="url(#gClosed)" dot={false} activeDot={{ r: 4 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                      <span className="cl-item"><span className="cl-dot" style={{ background: '#D97706' }} />Open</span>
                      <span className="cl-item"><span className="cl-dot" style={{ background: '#2563EB', borderRadius: 1 }} />In Progress</span>
                      <span className="cl-item"><span className="cl-dot" style={{ background: '#16A34A' }} />Closed</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Daily resolution bar chart */}
            <div className="card chart-card chart-card-wide">
              <div className="card-header">
                <div className="card-title">
                  <Activity size={15} className="card-title-icon" />
                  Daily Resolution
                </div>
              </div>
              <div className="chart-body">
                {trendData.length === 0 ? (
                  <div className="chart-empty">No data for the past 7 days</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={trendData} margin={{ top: 10, right: 16, left: -20, bottom: 0 }} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#EAECF0" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="open"       name="Opened"      fill="#FDE68A" radius={[4,4,0,0]} />
                        <Bar dataKey="inProgress" name="In Progress" fill="#BFDBFE" radius={[4,4,0,0]} />
                        <Bar dataKey="closed"     name="Resolved"    fill="#BBF7D0" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                      <span className="cl-item"><span className="cl-dot" style={{ background: '#FDE68A', border: '1.5px solid #D97706' }} />Opened</span>
                      <span className="cl-item"><span className="cl-dot" style={{ background: '#BFDBFE', border: '1.5px solid #2563EB' }} />In Progress</span>
                      <span className="cl-item"><span className="cl-dot" style={{ background: '#BBF7D0', border: '1.5px solid #16A34A' }} />Resolved</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Lower grid: recent tickets + activity ── */}
        <div className="lower-grid">

          {/* Recent Tickets */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Inbox size={15} className="card-title-icon" />
                Recent Tickets
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tickets')}>
                View All <ArrowRight size={12} />
              </button>
            </div>

            {loading ? (
              <div className="loading-wrap"><span className="spinner" />Loading...</div>
            ) : recent.length === 0 ? (
              <div className="empty">
                <div className="empty-icon"><Inbox size={36} strokeWidth={1} /></div>
                <div className="empty-text">No tickets yet. Create one to get started.</div>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Customer</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(t => (
                      <tr key={t._id} onClick={() => navigate(`/tickets/${t.ticket_id}`)}>
                        <td className="td-id">{t.ticket_id}</td>
                        <td className="td-name">{t.customer_name}</td>
                        <td>{t.subject}</td>
                        <td><StatusBadge status={t.status} /></td>
                        <td>{fmtDate(t.created_at || t.createdAt)}</td>
                        <td className="td-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={e => { e.stopPropagation(); navigate(`/tickets/${t.ticket_id}`) }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <ActivityTimeline />
        </div>

      </main>
    </div>
  )
}