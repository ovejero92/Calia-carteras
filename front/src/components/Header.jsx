import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';

const TAGS = [
  { key: 'new',        label: 'Nuevos',       href: '/catalog?tag=new' },
  { key: 'sale',       label: 'Ofertas',      href: '/catalog?tag=sale' },
  { key: 'bestseller', label: 'Más vendidos', href: '/catalog?tag=bestseller' },
];

const AnnouncementBar = ({ eyebrow, tagline, accent, heroBg }) => {
  const a = eyebrow?.trim() || '';
  const b = tagline?.trim() || '';
  if (!a && !b) return null;
  return (
    <div
      className="w-full text-center px-4 py-2.5 text-[11px] sm:text-xs font-medium tracking-wide"
      style={{
        background: heroBg,
        color: 'rgba(255,255,255,0.92)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}
    >
      <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {a && <span>{a}</span>}
        {a && b && <span className="opacity-40 hidden sm:inline" aria-hidden>|</span>}
        {b && (
          <span style={{ color: accent }} className="font-semibold normal-case tracking-normal">
            {b}
          </span>
        )}
      </span>
    </div>
  );
};

const Header = () => {
  const { itemCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const settings = useSettings();
  const [categories, setCategories] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    api.get('/categories').then(r => {
      if (r.data?.data) setCategories(r.data.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const navbarBg = settings?.colors?.navbarBg || '#ffffff';
  const navbarText = settings?.colors?.navbarText || '#1a0f0d';
  const accent = settings?.colors?.primary || '#c8a4a0';
  const heroBg = settings?.colors?.heroBackground || '#2d1f1a';
  const storeName = settings?.brand?.storeName || 'Calia';
  const fontFamily = settings?.typography?.fontFamily || 'inherit';
  const h = settings?.hero || {};
  const heroEyebrow = h.eyebrow || '';
  const tagline = settings?.brand?.tagline || '';

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalog' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <>
      <AnnouncementBar eyebrow={heroEyebrow} tagline={tagline} accent={accent} heroBg={heroBg} />

      <header
        style={{
          backgroundColor: navbarBg,
          color: navbarText,
          borderBottom: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'saturate(180%) blur(14px)',
          fontFamily,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-[64px] lg:h-[72px] gap-4">

            <Link
              to="/"
              className="shrink-0 group text-decoration-none flex items-baseline gap-1"
              style={{ textDecoration: 'none' }}
            >
              <span
                className="font-editorial text-[1.45rem] sm:text-[1.65rem] font-semibold tracking-tight leading-none"
                style={{ color: navbarText }}
              >
                {storeName}
              </span>
              <span
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full inline-block mb-0.5 sm:mb-1 ml-0.5 transition-transform duration-300 group-hover:scale-125"
                style={{ background: accent }}
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map(item => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-4 py-2 rounded-full text-[13px] transition-all duration-200"
                    style={{
                      fontWeight: isActive ? 600 : 500,
                      color: navbarText,
                      opacity: isActive ? 1 : 0.55,
                      textDecoration: 'none',
                      background: isActive ? `color-mix(in srgb, ${accent} 12%, transparent)` : 'transparent',
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}

              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(o => !o)}
                  className="px-4 py-2 rounded-full text-[13px] border-0 cursor-pointer flex items-center gap-1 transition-all duration-200"
                  style={{
                    color: navbarText,
                    opacity: menuOpen ? 1 : 0.55,
                    fontWeight: 500,
                    background: menuOpen ? `color-mix(in srgb, ${accent} 12%, transparent)` : 'transparent',
                  }}
                >
                  Colecciones
                  <span
                    className="inline-block text-[10px] transition-transform duration-200 opacity-50"
                    style={{ transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    ▾
                  </span>
                </button>

                {menuOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl p-6 z-[200] grid grid-cols-2 gap-4 shadow-[0_24px_80px_rgba(0,0,0,0.12)]"
                    style={{
                      background: navbarBg,
                      border: '1px solid color-mix(in srgb, var(--color-text) 8%, transparent)',
                    }}
                  >
                    <div
                      className="absolute left-6 right-6 top-0 h-0.5 rounded-b-full"
                      style={{ background: accent }}
                    />
                    <div className="pt-2">
                      <p style={dropLabel}>Shop</p>
                      <Link to="/catalog" style={dropLink(navbarText)}>Ver todo</Link>
                      {categories.map(cat => (
                        <Link key={cat.id} to={`/catalog?category=${cat.slug}`} style={dropLink(navbarText)}>
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                    <div className="pt-2">
                      <p style={dropLabel}>Destacados</p>
                      {TAGS.map(tag => (
                        <Link key={tag.key} to={tag.href} style={dropLink(navbarText)}>
                          {tag.label}
                        </Link>
                      ))}
                      <div className="border-t border-black/[0.06] mt-2 pt-2">
                        <Link to="/faq" style={dropLink(navbarText)}>Ayuda</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/catalog"
                className="hidden sm:inline-flex p-2.5 rounded-full transition-colors"
                style={{ color: navbarText, opacity: 0.55 }}
                title="Buscar en catálogo"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </Link>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full text-[13px] font-semibold transition-all border"
                style={{
                  color: navbarText,
                  borderColor: 'color-mix(in srgb, var(--color-text) 12%, transparent)',
                  background: 'transparent',
                }}
              >
                <ShoppingBagIcon className="w-[18px] h-[18px]" />
                <span className="hidden sm:inline">Bolsa</span>
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-bold text-white rounded-full border-2"
                    style={{ background: accent, borderColor: navbarBg }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMobileOpen(o => !o)}
                className="lg:hidden p-2 rounded-xl border-0 cursor-pointer flex"
                style={{ color: navbarText, background: 'color-mix(in srgb, var(--color-text) 5%, transparent)' }}
              >
                {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="lg:hidden border-b px-5 py-5 space-y-1"
          style={{
            background: navbarBg,
            borderColor: 'color-mix(in srgb, var(--color-text) 8%, transparent)',
            fontFamily,
          }}
        >
          <p style={mobileSectionLabel}>Menú</p>
          {navLinks.map(item => (
            <Link key={item.name} to={item.href} style={mobileLink}>
              {item.name}
            </Link>
          ))}
          <p style={{ ...mobileSectionLabel, marginTop: 18 }}>Colecciones</p>
          <Link to="/catalog" style={mobileLink}>Ver todo</Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/catalog?category=${cat.slug}`} style={mobileLink}>
              {cat.name}
            </Link>
          ))}
          <p style={{ ...mobileSectionLabel, marginTop: 18 }}>Destacados</p>
          {TAGS.map(tag => (
            <Link key={tag.key} to={tag.href} style={mobileLink}>
              {tag.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

const dropLabel = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  opacity: 0.45,
  marginBottom: 10,
};

const dropLink = (color) => ({
  display: 'block',
  padding: '10px 8px',
  borderRadius: 10,
  color,
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: 500,
  opacity: 0.85,
});

const mobileSectionLabel = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
  opacity: 0.4,
  marginBottom: 8,
};

const mobileLink = {
  display: 'block',
  padding: '12px 0',
  color: 'inherit',
  textDecoration: 'none',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  fontSize: 15,
  fontWeight: 500,
};

export default Header;
