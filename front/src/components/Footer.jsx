import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const settings = useSettings();
  const [email, setEmail] = useState('');

  const footerBg = settings?.colors?.footerBg || '#1a0f0d';
  const footerText = settings?.colors?.footerText || '#d4c4bc';
  const accent = settings?.colors?.primary || '#c8a4a0';
  const storeName = settings?.brand?.storeName || 'Calia';
  const tagline = settings?.brand?.tagline || 'Tu estilo, tu esencia.';
  const brandEmail = settings?.brand?.email || '';
  const phone = settings?.brand?.phone || '';
  const address = settings?.brand?.address || 'Buenos Aires, Argentina';
  const instagram = settings?.brand?.instagram || '';
  const whatsapp = settings?.brand?.whatsapp || '';
  const facebook = settings?.brand?.facebook || '';
  const fontFamily = settings?.typography?.fontFamily || 'inherit';

  const navLinks = [
    { label: 'Catálogo', href: '/catalog' },
    { label: 'Carrito', href: '/cart' },
    { label: 'Seguimiento', href: '/order-tracking' },
    { label: 'FAQ', href: '/faq' },
  ];

  const contactItems = [
    brandEmail && { icon: '✉', text: brandEmail, href: `mailto:${brandEmail}` },
    phone && { icon: '☎', text: phone, href: `tel:${phone}` },
    address && { icon: '⌖', text: address, href: null },
  ].filter(Boolean);

  const socialLinks = [
    instagram && { name: 'Instagram', href: `https://instagram.com/${instagram}` },
    whatsapp && { name: 'WhatsApp', href: `https://wa.me/${whatsapp}` },
    facebook && { name: 'Facebook', href: `https://facebook.com/${facebook}` },
  ].filter(Boolean);

  const newsletterSubmit = (e) => {
    e.preventDefault();
    const q = email.trim();
    if (brandEmail && q) {
      window.location.href = `mailto:${brandEmail}?subject=${encodeURIComponent('Newsletter Calia')}&body=${encodeURIComponent(`Quiero recibir novedades: ${q}`)}`;
    }
    setEmail('');
  };

  return (
    <footer style={{ backgroundColor: footerBg, color: footerText, marginTop: 0, fontFamily }} className="relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          background: `radial-gradient(circle at 20% 0%, ${accent}, transparent 45%)`,
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 lg:pt-20 pb-6">
        <div className="rounded-3xl border border-white/10 px-6 sm:px-10 py-10 mb-14 bg-white/[0.03] backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-lg">
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: accent }}>
                Newsletter
              </p>
              <h3 className="font-editorial text-2xl sm:text-3xl text-white leading-snug mb-2">
                Sumate a las novedades sin spam
              </h3>
              <p className="text-sm opacity-55 leading-relaxed">
                Dejá tu mail y te escribimos cuando haya algo que valga la pena: lanzamientos, restock y tips de uso.
              </p>
            </div>
            <form onSubmit={newsletterSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3 shrink-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 rounded-full px-5 py-3.5 text-sm border border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-white/25"
                style={{ fontFamily }}
              />
              <button
                type="submit"
                className="rounded-full px-6 py-3.5 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                style={{ background: accent, color: '#1a120e' }}
              >
                Suscribirme
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
          {!brandEmail && (
            <p className="text-[11px] opacity-40 mt-4">
              Tip: cargá el email de la tienda en el panel para activar el envío automático desde este formulario.
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-editorial text-4xl sm:text-5xl text-white tracking-tight leading-none">{storeName}</span>
              <span className="w-2 h-2 rounded-full shrink-0 mb-1" style={{ background: accent }} />
            </div>
            <p className="text-sm opacity-55 max-w-sm leading-relaxed">{tagline}</p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors self-start lg:self-auto"
          >
            Ver tienda
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 py-12">
          <div>
            <p style={colLabel(accent)}>Tienda</p>
            <ul className="space-y-2.5 m-0 p-0 list-none">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-sm opacity-55 hover:opacity-100 transition-opacity no-underline"
                    style={{ color: footerText }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {contactItems.length > 0 && (
            <div>
              <p style={colLabel(accent)}>Contacto</p>
              <ul className="space-y-2.5 m-0 p-0 list-none">
                {contactItems.map(({ icon, text, href }) => (
                  <li key={text} className="text-sm opacity-55 flex gap-2 items-start">
                    <span style={{ color: accent }} className="shrink-0 text-xs mt-0.5">
                      {icon}
                    </span>
                    {href ? (
                      <a href={href} className="no-underline hover:opacity-100 opacity-80 transition-opacity" style={{ color: footerText }}>
                        {text}
                      </a>
                    ) : (
                      <span>{text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {socialLinks.length > 0 && (
            <div>
              <p style={colLabel(accent)}>Seguinos</p>
              <div className="flex flex-col gap-2.5">
                {socialLinks.map(({ name, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm opacity-55 hover:opacity-100 transition-opacity no-underline"
                    style={{ color: footerText }}
                  >
                    {name}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={colLabel(accent)}>Calia</p>
            <p className="text-sm opacity-45 leading-relaxed">
              Carteras y complementos con mirada editorial. Diseñado para sentirse tuyo, no para aparecer en todos lados.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 border-t border-white/[0.07] text-[11px] opacity-35">
          <p className="m-0">
            © {currentYear} {storeName}. Todos los derechos reservados.
          </p>
          <p className="m-0 tracking-wide">{address}</p>
        </div>
      </div>
    </footer>
  );
};

const colLabel = (accent) => ({
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color: accent,
  marginBottom: 14,
  opacity: 0.95,
});

export default Footer;
