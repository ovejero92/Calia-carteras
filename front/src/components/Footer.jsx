import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const settings    = useSettings();

  const footerBg   = settings?.colors?.footerBg   || '#1a0f0d';
  const footerText = settings?.colors?.footerText  || '#d4c4bc';
  const accent     = settings?.colors?.primary     || '#c8a4a0';
  const storeName  = settings?.brand?.storeName    || 'Calia';
  const tagline    = settings?.brand?.tagline      || 'Tu estilo, tu esencia.';
  const email      = settings?.brand?.email        || '';
  const phone      = settings?.brand?.phone        || '';
  const address    = settings?.brand?.address      || 'Buenos Aires, Argentina';
  const instagram  = settings?.brand?.instagram    || '';
  const whatsapp   = settings?.brand?.whatsapp     || '';
  const facebook   = settings?.brand?.facebook     || '';
  const fontFamily = settings?.typography?.fontFamily || 'inherit';

  const navLinks = [
    { label: 'Catálogo',              href: '/catalog' },
    { label: 'Carrito',               href: '/cart' },
    { label: 'Seguimiento de pedido', href: '/order-tracking' },
    { label: 'Preguntas frecuentes',  href: '/faq' },
  ];

  const contactItems = [
    email   && { icon: '✉', text: email,   href: `mailto:${email}` },
    phone   && { icon: '◎', text: phone,   href: `tel:${phone}` },
    address && { icon: '◈', text: address, href: null },
  ].filter(Boolean);

  const socialLinks = [
    instagram && { name: 'Instagram', href: `https://instagram.com/${instagram}` },
    whatsapp  && { name: 'WhatsApp',  href: `https://wa.me/${whatsapp}` },
    facebook  && { name: 'Facebook',  href: `https://facebook.com/${facebook}` },
  ].filter(Boolean);

  return (
    <footer style={{ backgroundColor: footerBg, color: footerText, marginTop: '5rem' }}>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '56px 48px 48px', maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px 48px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
            <span style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', lineHeight: 0.9, fontFamily }}>
              {storeName}
            </span>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: accent, display: 'inline-block', marginBottom: 8, marginLeft: 2, flexShrink: 0 }} />
          </div>
          <p style={{ fontSize: 13, color: footerText, opacity: 0.55, maxWidth: 340, lineHeight: 1.7 }}>
            {tagline}
          </p>
        </div>

        <Link to="/catalog"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', transition: 'border-color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}>
          Ver catálogo →
        </Link>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 48px 52px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '36px 48px' }}>

        <div>
          <p style={colLabel(accent)}>Navegación</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {navLinks.map(({ label, href }) => (
              <li key={href}>
                <Link to={href}
                  style={{ color: footerText, opacity: 0.55, textDecoration: 'none', fontSize: 13, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='1'}
                  onMouseLeave={e => e.currentTarget.style.opacity='0.55'}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {contactItems.length > 0 && (
          <div>
            <p style={colLabel(accent)}>Contacto</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {contactItems.map(({ icon, text, href }) => (
                <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, opacity: 0.55, color: footerText }}>
                  <span style={{ color: accent, flexShrink: 0, fontSize: 12, marginTop: 1 }}>{icon}</span>
                  {href
                    ? <a href={href} style={{ color: footerText, textDecoration: 'none' }}>{text}</a>
                    : text
                  }
                </li>
              ))}
            </ul>
          </div>
        )}

        {socialLinks.length > 0 && (
          <div>
            <p style={colLabel(accent)}>Seguinos</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {socialLinks.map(({ name, href }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ color: footerText, opacity: 0.55, textDecoration: 'none', fontSize: 13, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='1'}
                  onMouseLeave={e => e.currentTarget.style.opacity='0.55'}>
                  {name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Copyright */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px 48px', maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <p style={{ fontSize: 11, opacity: 0.3, color: footerText, margin: 0 }}>
          © {currentYear} {storeName}. Todos los derechos reservados.
        </p>
        <p style={{ fontSize: 11, opacity: 0.2, color: footerText, margin: 0, letterSpacing: '0.05em' }}>
          {address}
        </p>
      </div>
    </footer>
  );
};

const colLabel = (accent) => ({
  fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.18em', color: accent, marginBottom: 16, opacity: 0.9,
});

export default Footer;