import './PageHeader.css'

/**
 * The h1 block at the top of every page except home, whose h1 is the hero.
 * Shared so the three pages cannot drift apart.
 *
 * @param {{eyebrow: string, title: string, lede?: string}} props
 */
export default function PageHeader({ eyebrow, title, lede }) {
  return (
    <header className="page-head">
      <div className="shell page-head__inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="h1">{title}</h1>
        {lede && <p className="page-head__lede">{lede}</p>}
      </div>
    </header>
  )
}
