import Icon from './Icon.jsx'
import './Footer.css'

const SOCIAL_ICON = { GitHub: 'github', LinkedIn: 'linkedin' }

/**
 * @param {{profile: import('../data/profile.js').Profile}} props
 */
export default function Footer({ profile }) {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__cta">
          <h2 className="footer__headline">
            If any of this looks like your team&rsquo;s kind of problem, I&rsquo;d
            like to hear about it.
          </h2>

          <div className="footer__actions">
            <a className="btn btn--primary" href={`mailto:${profile.email}`}>
              <Icon name="mail" size={18} />
              Get in touch
            </a>
            {profile.socials.map((social) => (
              <a
                key={social.label}
                className="footer__social"
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name={SOCIAL_ICON[social.label] ?? 'arrowUpRight'} size={18} />
                {social.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__base">
          <p className="meta">
            {profile.name} — {profile.location}
          </p>
          <p className="meta">{profile.status}</p>
        </div>
      </div>
    </footer>
  )
}
