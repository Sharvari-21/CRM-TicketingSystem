import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'
import api from '../api/axios'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function TicketList() {
  const [tickets, setTickets]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const navigate = useNavigate()

  const fetchTickets = useCallback(async (pg, q, st) => {
    setLoading(true)
    try {
      let url = `/tickets?page=${pg}&limit=10`
      if (q)  url += `&search=${encodeURIComponent(q)}`
      if (st) url += `&status=${encodeURIComponent(st)}`
      const { data } = await api.get(url)
      const list  = data?.data?.tickets ?? data?.tickets ?? data?.data ?? []
      const pages = data?.data?.totalPages ?? data?.totalPages ?? 1
      setTickets(Array.isArray(list) ? list : [])
      setTotalPages(pages)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchTickets(1, '', '') }, [])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchTickets(1, search, statusFilter) }, 350)
    return () => clearTimeout(t)
  }, [search])

  function handleStatusChange(val) { setStatus(val); setPage(1); fetchTickets(1, search, val) }
  function goPage(p) { setPage(p); fetchTickets(p, search, statusFilter) }

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .slice(Math.max(0, page - 3), page + 2)

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main page-enter">

        {/* ── Banner ── */}
        <div className="page-header page-header-banner">
          <img src="/images/ticket-banner.jpg" alt="" aria-hidden="true"
               className="page-header-bg" style={{ objectPosition: 'center center' }} />
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div>
              <div className="page-title page-title-light">All Tickets</div>
              <div className="page-sub page-sub-light">Search, filter and manage support tickets</div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <button className="btn btn-primary" onClick={() => navigate('/tickets/new')}>
                + New Ticket
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          {/* ── Toolbar ── */}
          <div className="card-header">
            <div className="card-title">Tickets</div>
            <div className="toolbar">
              <div className="search-wrap">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Search name, email, ID, subject..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="filter-select" value={statusFilter}
                      onChange={e => handleStatusChange(e.target.value)}>
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-wrap"><span className="spinner" />Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <div className="empty-text">No tickets found for your search.</div>
            </div>
          ) : (
            <>
              {/* ── Desktop table ── */}
              <div className="table-wrap tl-desktop">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t._id} style={{ cursor: 'pointer' }}
                          onClick={() => navigate(`/tickets/${t.ticket_id}`)}>
                        <td className="td-id">{t.ticket_id}</td>
                        <td className="td-name">{t.customer_name}</td>
                        <td>{t.customer_email}</td>
                        <td>{t.subject}</td>
                        <td><StatusBadge status={t.status} /></td>
                        <td>{fmtDate(t.created_at || t.createdAt)}</td>
                        <td className="td-actions">
                          <button className="btn btn-ghost btn-sm"
                            onClick={e => { e.stopPropagation(); navigate(`/tickets/${t.ticket_id}`) }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile card list ── */}
              <div className="tl-mobile">
                {tickets.map(t => (
                  <div key={t._id} className="tl-card"
                       onClick={() => navigate(`/tickets/${t.ticket_id}`)}>
                    <div className="tl-card-top">
                      <span className="td-id">{t.ticket_id}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="tl-card-subject">{t.subject}</div>
                    <div className="tl-card-meta">
                      <span>{t.customer_name}</span>
                      <span>{fmtDate(t.created_at || t.createdAt)}</span>
                    </div>
                    <div className="tl-card-email">{t.customer_email}</div>
                  </div>
                ))}
              </div>

              {/* ── Pagination ── */}
              <div className="pagination">
                <div className="page-info">Page {page} of {totalPages}</div>
                <div className="page-btns">
                  <button className="page-btn" disabled={page <= 1} onClick={() => goPage(page - 1)}>←</button>
                  {visiblePages.map(p => (
                    <button key={p} className={`page-btn${p === page ? ' active' : ''}`}
                            onClick={() => goPage(p)}>{p}</button>
                  ))}
                  <button className="page-btn" disabled={page >= totalPages} onClick={() => goPage(page + 1)}>→</button>
                </div>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  )
}