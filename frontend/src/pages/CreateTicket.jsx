import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, FileText, AlignLeft, Info, Clock, Tag } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useToast } from '../components/Toast'
import api from '../api/axios'

/* ── tiny helpers ── */
function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
function getAvatarColor(name) {
  const colors = [
    ['#166534','#DCFCE7'], ['#1E40AF','#DBEAFE'],
    ['#7C2D12','#FEF3C7'], ['#6B21A8','#EDE9FE'],
    ['#0F766E','#CCFBF1'],
  ]
  const i = name.charCodeAt(0) % colors.length
  return colors[i]
}

function LabelWithIcon({ icon: Icon, children }) {
  return (
    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <Icon size={12} style={{ color: 'var(--accent)', opacity: 0.8 }} />
      {children}
    </label>
  )
}

export default function CreateTicket() {
  const [form, setForm] = useState({ customer_name: '', customer_email: '', subject: '', description: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const navigate = useNavigate()

  function validate() {
    const e = {}
    if (!form.customer_name.trim())   e.customer_name  = 'Customer name is required'
    if (!form.customer_email.trim())  e.customer_email = 'Customer email is required'
    else if (!/\S+@\S+\.\S+/.test(form.customer_email)) e.customer_email = 'Enter a valid email'
    if (!form.subject.trim())         e.subject        = 'Subject is required'
    if (!form.description.trim())     e.description    = 'Description is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const { data } = await api.post('/tickets', form)
      const id = data?.data?._id || data?._id || data?.data?.ticket_id
      addToast(`Ticket ${data?.data?.ticket_id || ''} created successfully!`)
      navigate(id ? `/tickets/${id}` : '/tickets')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create ticket', 'error')
    } finally {
      setLoading(false)
    }
  }

  const field = (name) => ({
    value: form[name],
    onChange: e => { setForm(p => ({ ...p, [name]: e.target.value })); setErrors(p => ({ ...p, [name]: '' })) }
  })

  /* avatar preview state */
  const showAvatar = form.customer_name.trim().length > 0
  const initials   = showAvatar ? getInitials(form.customer_name) : ''
  const [fg, bg]   = showAvatar ? getAvatarColor(form.customer_name) : ['','']

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main page-enter">
        <Link to="/tickets" className="back-link">← Back to Tickets</Link>

        {/* ── Banner ── */}
        <div className="page-header page-header-banner">
          <img src="/images/new-ticket.png" alt="" aria-hidden="true"
               className="page-header-bg" style={{ objectPosition: 'center center' }} />
          <div className="page-header-overlay" />
          <div className="page-header-content">
            <div>
              <div className="page-title page-title-light">New Ticket</div>
              <div className="page-sub page-sub-light">Create a support ticket for a customer</div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="ticket-layout">

          {/* LEFT — form */}
          <div className="form-page-card">
            <form onSubmit={handleSubmit} noValidate>

              {/* Avatar preview strip */}
              {showAvatar && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '10px 14px',
                  marginBottom: 20, animation: 'fadeUp 0.2s ease'
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: bg, color: fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                    border: `1px solid ${fg}22`
                  }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
                      {form.customer_name}
                    </div>
                    {form.customer_email && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>
                        {form.customer_email}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <LabelWithIcon icon={User}>Customer Name *</LabelWithIcon>
                  <input className="form-input" type="text" placeholder="John Doe" {...field('customer_name')} />
                  {errors.customer_name && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.customer_name}</div>}
                </div>
                <div className="form-group">
                  <LabelWithIcon icon={Mail}>Customer Email *</LabelWithIcon>
                  <input className="form-input" type="email" placeholder="john@example.com" {...field('customer_email')} />
                  {errors.customer_email && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.customer_email}</div>}
                </div>
              </div>

              <div className="form-group">
                <LabelWithIcon icon={FileText}>Subject *</LabelWithIcon>
                <input className="form-input" type="text" placeholder="Brief description of the issue" {...field('subject')} />
                {errors.subject && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.subject}</div>}
              </div>

              <div className="form-group">
                <LabelWithIcon icon={AlignLeft}>Description *</LabelWithIcon>
                <textarea className="form-input" rows={5} placeholder="Detailed description of the issue..." {...field('description')} />
                {errors.description && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4 }}>{errors.description}</div>}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><span className="spinner" />Creating...</> : '+ Create Ticket'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/tickets')}>
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT — sidebar guidance */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Tips */}
            <div className="mini-card">
              <div className="mc-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={14} style={{ color: 'var(--accent)' }} /> Guidelines
              </div>
              {[
                { tip: 'Use a clear, specific subject line so agents can triage quickly.' },
                { tip: 'Include steps to reproduce the issue in the description.' },
                { tip: 'Understand the customer thoroughly.' },
              ].map((g, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, padding: '8px 0',
                  borderBottom: i < 2 ? '1px solid var(--surface2)' : 'none'
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'var(--accent-light)', color: 'var(--accent-text)',
                    fontSize: 10, fontWeight: 700, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.6 }}>{g.tip}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}