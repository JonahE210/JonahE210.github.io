import Icon from './Icon.jsx'
import './SocialRail.css'

const SOCIAL_ICON = { GitHub: 'github', LinkedIn: 'linkedin' }

/**
 * Fixed social links down the left edge. Desktop only — see SocialRail.css.
 *
 * Icon-only, so every link carries an aria-label. The footer repeats these
 * with visible text, which is what narrow screens and screen readers get.
 *
 * @param {{profile: import('../data/profile.js').Profile}} props
 */
export default function SocialRail({ profile }) {
  return (
    <div className="rail">
      {profile.socials.map((social) => (
        <a
          key={social.label}
          className="rail__link"
          href={social.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${social.label} (opens in a new tab)`}
        >
          <Icon name={SOCIAL_ICON[social.label] ?? 'arrowUpRight'} size={20} />
        </a>
      ))}
      <a
        className="rail__link"
        href={`mailto:${profile.email}`}
        aria-label={`Email ${profile.name}`}
      >
        <Icon name="mail" size={20} />
      </a>
    </div>
  )
}
