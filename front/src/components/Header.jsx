import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const TAGS = [
 { key:'new', label:'🆕 Productos nuevos', href:'/catalog?tag=new' },
 { key:'sale', label:'🔥 Ofertas del día', href:'/catalog?tag=sale' },
 { key:'bestseller', label:'⭐ Más vendidos', href:'/catalog?tag=bestseller' },
];

const Header = () => {
    const { itemCount } = useCart();
    const location = useLocation();
    const [categories, setCategories] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        api.get('/categories').then(r => {
            if (r.data?.data) setCategories(r.data.data);
        }).catch(() => {});
    }, []);

    // Cerrar mega-menú al hacer click fuera
    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Cerrar al navegar
    useEffect(() => {
        setMenuOpen(false);
        setMobileOpen(false);
    }, [location.pathname, location.search]);

    const primary    = 'var(--color-primary, #1d4ed8)';
    const navbarBg   = 'var(--color-navbar-bg, #ffffff)';
    const navbarText = 'var(--color-navbar-text, #1f2937)';

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
                boxShadow:       '0 1px 3px rgba(0,0,0,0.08)',
                borderBottom:    '1px solid rgba(0,0,0,0.06)',
                position:        'relative',
                zIndex:          50,
            }}>
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">

                        {/* ── Logo / trigger mega-menú ──────────────────────── */}
                        <div className="flex items-center" ref={menuRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setMenuOpen(o => !o)}
                                aria-label="Abrir categorías"
                                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: primary, flexShrink: 0 }}>
                                    <ShoppingBagIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="hidden sm:inline text-xl font-bold"
                                    style={{ color: navbarText }}>
                                    Carteras
                                </span>
                                <ChevronDownIcon
                                    className="hidden sm:block w-4 h-4 transition-transform duration-200"
                                    style={{
                                        color:     navbarText,
                                        opacity:   0.55,
                                        transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    }} />
                            </button>

                            {/* Mega-menú desktop */}
                            {menuOpen && (
                                <div style={{
                                    position:            'absolute',
                                    top:                 'calc(100% + 8px)',
                                    left:                0,
                                    background:          '#fff',
                                    boxShadow:           '0 16px 48px rgba(0,0,0,0.14)',
                                    borderRadius:        12,
                                    minWidth:            400,
                                    padding:             '20px 24px',
                                    zIndex:              200,
                                    borderTop:           `3px solid ${primary}`,
                                    display:             'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap:                 '4px 32px',
                                }}>
                                    {/* Categorías */}
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: '#9ca3af', marginBottom: 10 }}>
                                            Categorías
                                        </p>
                                        <Link to="/catalog"
                                            style={{ display: 'block', padding: '8px 10px', borderRadius: 8, color: '#111', fontWeight: 600, textDecoration: 'none', background: '#f9fafb', marginBottom: 4 }}>
                                            🛍️ Ver todo
                                        </Link>
                                        {categories.map(cat => (
                                            <Link key={cat.id} to={`/catalog?category=${cat.slug}`}
                                                style={{ display: 'block', padding: '8px 10px', borderRadius: 8, color: '#374151', textDecoration: 'none', transition: 'background .12s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Tags + FAQ */}
                                    <div>
                                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', color: '#9ca3af', marginBottom: 10 }}>
                                            Destacados
                                        </p>
                                        {TAGS.map(tag => (
                                            <Link key={tag.key} to={tag.href}
                                                style={{ display: 'block', padding: '8px 10px', borderRadius: 8, color: '#374151', textDecoration: 'none', transition: 'background .12s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                {tag.label}
                                            </Link>
                                        ))}
                                        <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 10, paddingTop: 10 }}>
                                            <Link to="/faq"
                                                style={{ display: 'block', padding: '8px 10px', borderRadius: 8, color: '#374151', textDecoration: 'none', transition: 'background .12s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                ❓ Preguntas Frecuentes
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Nav links desktop ────────────────────────────── */}
                        <nav className="hidden md:flex space-x-1">
                            {navLinks.map(item => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link key={item.name} to={item.href}
                                        className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                        style={{
                                            color:           isActive ? primary : navbarText,
                                            backgroundColor: isActive ? 'rgba(0,0,0,0.05)' : 'transparent',
                                            opacity:         isActive ? 1 : 0.8,
                                            textDecoration:  'none',
                                        }}>
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* ── Carrito + hamburguesa ─────────────────────────── */}
                        <div className="flex items-center gap-2">
                            <Link to="/cart"
                                className="relative flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium"
                                style={{ color: navbarText, textDecoration: 'none' }}>
                                <ShoppingBagIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">Carrito</span>
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                        style={{ backgroundColor: primary }}>
                                        {itemCount}
                                    </span>
                                )}
                            </Link>

                            <button onClick={() => setMobileOpen(o => !o)}
                                className="md:hidden p-2 rounded-md"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: navbarText }}>
                                {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Menú móvil ─────────────────────────────────────────────────── */}
            {mobileOpen && (
                <div style={{
                    background:   '#fff',
                    boxShadow:    '0 8px 24px rgba(0,0,0,0.1)',
                    padding:      '16px 20px',
                    zIndex:       49,
                    position:     'relative',
                    borderBottom: '1px solid #f3f4f6',
                }}>
                    <p style={sectionLabel}>Páginas</p>
                    {navLinks.map(item => (
                        <Link key={item.name} to={item.href} style={mobileLink}>
                            {item.name}
                        </Link>
                    ))}
                    <p style={{ ...sectionLabel, marginTop: 14 }}>Categorías</p>
                    <Link to="/catalog" style={mobileLink}>🛍️ Ver todo el catálogo</Link>
                    {categories.map(cat => (
                        <Link key={cat.id} to={`/catalog?category=${cat.slug}`} style={mobileLink}>
                            {cat.name}
                        </Link>
                    ))}
                    <p style={{ ...sectionLabel, marginTop: 14 }}>Destacados</p>
                    {TAGS.map(tag => (
                        <Link key={tag.key} to={tag.href} style={mobileLink}>{tag.label}</Link>
                    ))}
                </div>
            )}
        </>
    );
};

const sectionLabel = {
    fontSize:      10,
    fontWeight:    700,
    textTransform: 'uppercase',
    letterSpacing: '.12em',
    color:         '#9ca3af',
    marginBottom:  8,
    marginTop:     4,
};

const mobileLink = {
    display:        'block',
    padding:        '10px 4px',
    color:          '#374151',
    textDecoration: 'none',
    borderBottom:   '1px solid #f9fafb',
    fontSize:       '14px',
};

export default Header;
// import { Link, useLocation } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import { ShoppingBagIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// const Header = () => {
//     const { itemCount } = useCart();
//     const location = useLocation();

//     const navigation = [
//         { name: 'Inicio',    href: '/',        icon: HomeIcon },
//         { name: 'Catálogo',  href: '/catalog', icon: MagnifyingGlassIcon },
//     ];

//     return (
//         <header style={{
//             backgroundColor: 'var(--color-navbar-bg, #ffffff)',
//             color:           'var(--color-navbar-text, #1f2937)',
//             boxShadow:       '0 1px 3px rgba(0,0,0,0.08)',
//             borderBottom:    '1px solid rgba(0,0,0,0.06)',
//         }}>
//             <div className="container mx-auto px-4">
//                 <div className="flex items-center justify-between h-16">

//                     {/* Logo */}
//                     <Link to="/" className="flex items-center space-x-2">
//                         <div className="w-8 h-8 rounded-lg flex items-center justify-center"
//                             style={{ backgroundColor: 'var(--color-primary, #1d4ed8)' }}>
//                             <ShoppingBagIcon className="w-5 h-5 text-white" />
//                         </div>
//                         <span className="text-xl font-bold"
//                             style={{ color: 'var(--color-navbar-text, #1f2937)' }}>
//                             Carteras
//                         </span>
//                     </Link>

//                     {/* Nav links */}
//                     <nav className="hidden md:flex space-x-2">
//                         {navigation.map((item) => {
//                             const Icon = item.icon;
//                             const isActive = location.pathname === item.href;
//                             return (
//                                 <Link key={item.name} to={item.href}
//                                     className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//                                     style={{
//                                         color:           isActive ? 'var(--color-primary, #1d4ed8)' : 'var(--color-navbar-text, #1f2937)',
//                                         backgroundColor: isActive ? 'rgba(0,0,0,0.05)' : 'transparent',
//                                         opacity:         isActive ? 1 : 0.85,
//                                     }}>
//                                     <Icon className="w-4 h-4" />
//                                     <span>{item.name}</span>
//                                 </Link>
//                             );
//                         })}
//                     </nav>

//                     {/* Carrito */}
//                     <Link to="/cart"
//                         className="relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//                         style={{ color: 'var(--color-navbar-text, #1f2937)' }}>
//                         <ShoppingBagIcon className="w-5 h-5" />
//                         <span className="hidden sm:inline">Carrito</span>
//                         {itemCount > 0 && (
//                             <span className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
//                                 style={{ backgroundColor: 'var(--color-primary, #1d4ed8)' }}>
//                                 {itemCount}
//                             </span>
//                         )}
//                     </Link>

//                 </div>
//             </div>
//         </header>
//     );
// };

// export default Header;