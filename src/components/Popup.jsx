// Non-blocking, dismissible card shown below the status card. Never a modal trap: there is
// always a visible X, tapping outside does nothing destructive, and dismissing costs nothing.

const TONE = {
  info: 'info-box',
  warn: 'banner',
  error: 'error-box',
}

export default function Popup({ tone = 'info', title, children, onClose, actions }) {
  return (
    <div className={TONE[tone] || 'info-box'} style={{ position: 'relative' }} role="status" aria-live="polite">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="link-btn"
          style={{ position: 'absolute', top: 8, right: 10, color: 'inherit', opacity: 0.7 }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      {title && <strong style={{ display: 'block', marginBottom: 4, paddingRight: 24 }}>{title}</strong>}
      <div style={{ fontSize: 14 }}>{children}</div>
      {actions && <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>{actions}</div>}
    </div>
  )
}
