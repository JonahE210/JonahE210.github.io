import './ErrorState.css'

/**
 * Shown when a content load fails. Always offers a recovery path — a bare
 * error message with no way forward is a dead end.
 *
 * @param {{title?: string, message?: string, onRetry?: () => void}} props
 */
export default function ErrorState({
  title = "That didn’t load",
  message = 'Something went wrong fetching this content. It is probably me, not you.',
  onRetry,
}) {
  return (
    <div className="error-state" role="alert">
      <p className="meta error-state__code">Error</p>
      <h2 className="h3">{title}</h2>
      <p className="error-state__message">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
