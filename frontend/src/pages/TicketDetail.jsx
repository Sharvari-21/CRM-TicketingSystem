import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'
import { useToast } from '../components/Toast'
import api from '../api/axios'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updateStatus, setUpdateStatus] = useState('Open')
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/tickets/${id}`)
        const t = data?.data || data?.ticket || data
        setTicket(t)
        setUpdateStatus(t.status || 'Open')
      } catch {
        addToast('Ticket not found', 'error')
        navigate('/tickets')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleUpdate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put(`/tickets/${id}`, { status: updateStatus, notes: noteText })
      addToast('Ticket updated successfully!')
      setNoteText('')
      // Refresh ticket
      const { data } = await api.get(`/tickets/${id}`)
      const t = data?.data || data?.ticket || data
      setTicket(t)
      setUpdateStatus(t.status || 'Open')
    } catch (err) {
      addToast(err.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="main">
          <div className="loading-wrap"><span className="spinner" />Loading ticket...</div>
        </main>
      </div>
    )
  }

  if (!ticket) return null

  const notes = ticket.notes || []

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main page-enter">
        <Link to="/tickets" className="back-link">← Back to Tickets</Link>

        <div className="page-header">
          <div>
            <div className="page-title">{ticket.ticket_id}</div>
            <div className="page-sub">Ticket Details</div>
          </div>
          <div className="header-actions">
            <StatusBadge status={ticket.status} />
          </div>
        </div>

        <div className="detail-grid">
          {/* LEFT: ticket info + notes */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ padding: '22px 24px' }}>
                <div className="detail-section">Ticket Information</div>

                <div className="detail-field">
                  <div className="detail-label">Subject</div>
                  <div className="detail-value subject">{ticket.subject}</div>
                </div>

                <div className="detail-field">
                  <div className="detail-label">Description</div>
                  <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
                </div>

                <div className="meta-grid">
                  <div className="detail-field">
                    <div className="detail-label">Customer Name</div>
                    <div className="detail-value">{ticket.customer_name}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-label">Customer Email</div>
                    <div className="detail-value">{ticket.customer_email}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-label">Created At</div>
                    <div className="detail-value">{fmtDate(ticket.created_at || ticket.createdAt)}</div>
                  </div>
                  <div className="detail-field">
                    <div className="detail-label">Last Updated</div>
                    <div className="detail-value">{fmtDate(ticket.updated_at || ticket.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ padding: '22px 24px' }}>
                <div className="detail-section">Notes & Comments ({notes.length})</div>
                {notes.length === 0 ? (
                  <div className="notes-empty">No notes added yet.</div>
                ) : (
                  notes.map((n, i) => (
                    <div key={i} className="note-item">
                      <div className="note-text">
                        {typeof n === 'string' ? n : (n.note_text || n.text || JSON.stringify(n))}
                      </div>
                      {(n.created_at || n.createdAt) && (
                        <div className="note-meta">{fmtDate(n.created_at || n.createdAt)}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: update panel */}
          <div className="card detail-sticky-panel">
            <div style={{ padding: '22px 24px' }}>
              <div className="detail-section">Update Ticket</div>
              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={updateStatus}
                    onChange={e => setUpdateStatus(e.target.value)}
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Add Note</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Add a note or comment..."
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                  {saving ? <><span className="spinner" />Saving...</> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}