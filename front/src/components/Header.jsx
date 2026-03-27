import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../context/SettingsContext';
import api from '../services/api';

const TAGS = [
  { key: 'new',        label: 'Nuevos',       href: '/catalog?tag=new' },
  { key: 'sale',       label: 'Ofertas',      href: '/catalog?tag=sale' },
  { key: 'bestseller', label: 'Más vendidos', href: '/catalog?tag=bestseller' },
];

const Header = () => {
  const { itemCount } = useCart();
  const location      = useLocation();
  const settings      = useSettings();
  const [categories, setCategories] = useState([]);
  const [menuOpen,   setMenuOpen]   = useState(false);
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

  const navbarBg   = settings?.colors?.navbarBg  || '#ffffff';
  const navbarText = settings?.colors?.navbarText || '#1a0f0d';
  const accent     = settings?.colors?.primary    || '#c8a4a0';
  const storeName  = settings?.brand?.storeName   || 'Calia';
  const fontFamily = settings?.typography?.fontFamily || 'inherit';

  const navLinks = [
    { name: 'Inicio',   href: '/' },
    { name: 'Catálogo', href: '/catalog' },
    { name: 'FAQ',      href: '/faq' },
  ];

  return (
    <>
      <header style={{
        backgroundColor: navbarBg,
        color:           navbarText,
        borderBottom:    '1px solid rgba(0,0,0,0.07)',
        position:        'sticky',
        top:             0,
        zIndex:          100,
        backdropFilter:  'blur(12px)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

            {/* LOGO */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', color: navbarText, lineHeight: 1, fontFamily }}>
                {storeName}
              </span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block', marginLeft: 2, marginBottom: 3, flexShrink: 0 }} />
            </Link>

            {/* NAV DESKTOP */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
              {navLinks.map(item => {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.name} to={item.href}
                    style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: isActive ? 600 : 400, color: navbarText, opacity: isActive ? 1 : 0.6, textDecoration: 'none', background: isActive ? 'rgba(0,0,0,0.05)' : 'transparent', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.opacity = '0.6'; }}>
                    {item.name}
                  </Link>
                );
              })}

              {/* Dropdown */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(o => !o)}
                  style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, color: navbarText, opacity: menuOpen ? 1 : 0.6, background: menuOpen ? 'rgba(0,0,0,0.05)' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.opacity = '0.6'; }}>
                  Categorías
                  <span style={{ display: 'inline-block', width: 12, height: 12, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.5 }}>▾</span>
                </button>

                {menuOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)', minWidth: 360, padding: '20px 24px', zIndex: 200, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                    <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 2, background: accent, borderRadius: '0 0 2px 2px' }} />
                    <div>
                      <p style={dropLabel}>Colecciones</p>
                      <Link to="/catalog" style={dropLink} onMouseEnter={e => e.currentTarget.style.background='#f9f5f3'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>Ver todo el catálogo</Link>
                      {categories.map(cat => (
                        <Link key={cat.id} to={`/catalog?category=${cat.slug}`} style={dropLink} onMouseEnter={e => e.currentTarget.style.background='#f9f5f3'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>{cat.name}</Link>
                      ))}
                    </div>
                    <div>
                      <p style={dropLabel}>Destacados</p>
                      {TAGS.map(tag => (
                        <Link key={tag.key} to={tag.href} style={dropLink} onMouseEnter={e => e.currentTarget.style.background='#f9f5f3'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>{tag.label}</Link>
                      ))}
                      <div style={{ borderTop: '1px solid #f0ebe8', marginTop: 8, paddingTop: 8 }}>
                        <Link to="/faq" style={dropLink} onMouseEnter={e => e.currentTarget.style.background='#f9f5f3'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>Preguntas frecuentes</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* CARRITO + HAMBURGUESA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to="/cart"
                style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 500, color: navbarText, textDecoration: 'none', border: '1px solid rgba(0,0,0,0.1)', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,0,0,0.25)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='rgba(0,0,0,0.1)'}>
                <ShoppingBagIcon style={{ width: 16, height: 16 }} />
                <span className="hidden sm:inline">Carrito</span>
                {itemCount > 0 && (
                  <span style={{ position: 'absolute', top: -6, right: -6, background: accent, color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
                    {itemCount}
                  </span>
                )}
              </Link>

              <button onClick={() => setMobileOpen(o => !o)} className="md:hidden"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: navbarText, padding: 6, borderRadius: 8, display: 'flex' }}>
                {mobileOpen ? <XMarkIcon style={{ width: 22, height: 22 }} /> : <Bars3Icon style={{ width: 22, height: 22 }} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '16px 24px 24px', zIndex: 99, position: 'relative' }}>
          <p style={mobileSectionLabel}>Páginas</p>
          {navLinks.map(item => <Link key={item.name} to={item.href} style={mobileLink}>{item.name}</Link>)}
          <p style={{ ...mobileSectionLabel, marginTop: 20 }}>Colecciones</p>
          <Link to="/catalog" style={mobileLink}>Ver todo el catálogo</Link>
          {categories.map(cat => <Link key={cat.id} to={`/catalog?category=${cat.slug}`} style={mobileLink}>{cat.name}</Link>)}
          <p style={{ ...mobileSectionLabel, marginTop: 20 }}>Destacados</p>
          {TAGS.map(tag => <Link key={tag.key} to={tag.href} style={mobileLink}>{tag.label}</Link>)}
        </div>
      )}
    </>
  );
};

const dropLabel = { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#b0a09a', marginBottom: 8 };
const dropLink  = { display: 'block', padding: '8px 10px', borderRadius: 8, color: '#2d1a14', textDecoration: 'none', fontSize: 13, transition: 'background 0.12s', cursor: 'pointer' };
const mobileSectionLabel = { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#b0a09a', marginBottom: 10 };
const mobileLink = { display: 'block', padding: '11px 0', color: '#2d1a14', textDecoration: 'none', borderBottom: '1px solid #f5ede8', fontSize: 14 };

export default Header;