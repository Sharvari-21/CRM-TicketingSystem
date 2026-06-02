import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: 'var(--surface2)',
            border: `1px solid var(--border)`,
            borderLeft: `3px solid ${t.type === 'success' ? 'var(--green)' : t.type === 'error' ? 'var(--red)' : 'var(--cyan)'}`,
            borderRadius: 'var(--radius)',
            padding: '11px 16px',
            minWidth: 260,
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            fontSize: 12,
            animation: 'fadeUp 0.2s ease',
            color: 'var(--text)',
          }}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}