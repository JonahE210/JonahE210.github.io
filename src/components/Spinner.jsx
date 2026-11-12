import './Spinner.css'

/**
 * Shown while content loads. In Phase 1 the local data resolves on a
 * microtask, so this is effectively never visible — it exists so that Phase 2,
 * where the same call crosses the network, needs no new UI.
 *
 * @param {{label?: string}} props
 */
export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner__dots" aria-hidden="true">
        <i /><i /><i />
      </span>
      <span className="spinner__label">{label}</span>
    </div>
  )
}
