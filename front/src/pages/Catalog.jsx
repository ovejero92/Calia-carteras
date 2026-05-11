import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../context/SettingsContext';

const TAG_OPTIONS = [
    { key: 'new',        label: 'Nuevos' },
    { key: 'sale',       label: 'Ofertas' },
    { key: 'bestseller', label: 'Más vendidos' },
];

const Catalog = () => {
    const settings = useSettings();
    const accent = settings?.colors?.primary || '#c8a4a0';
    const storeName = settings?.brand?.storeName || 'Calia';

    const [searchParams, setSearchParams] = useSearchParams();

    const [products,    setProducts]    = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [searchTerm,  setSearchTerm]  = useState('');

    const activeCategory = searchParams.get('category') || 'all';
    const activeTag      = searchParams.get('tag')      || '';

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories'),
                ]);
                if (prodRes.data.status === 'success') setProducts(prodRes.data.data);
                if (catRes.data.status  === 'success') setCategories(catRes.data.data);
            } catch (err) {
                setError('Error al cargar los productos');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filtered = products.filter(p => {
        const matchSearch   = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchTag =
            !activeTag ||
            (activeTag === 'new'        && p.flags?.isNew) ||
            (activeTag === 'sale'       && (p.flags?.isSale || (p.discount && p.discount > 0))) ||
            (activeTag === 'bestseller' && p.flags?.isBestSeller);
        return matchSearch && matchCategory && matchTag;
    });

    const setCategory = (slug) => {
        const next = new URLSearchParams(searchParams);
        if (slug === 'all') next.delete('category'); else next.set('category', slug);
        setSearchParams(next);
    };

    const setTag = (key) => {
        const next = new URLSearchParams(searchParams);
        if (!key || key === activeTag) next.delete('tag'); else next.set('tag', key);
        setSearchParams(next);
    };

    const clearAll = () => {
        setSearchTerm('');
        setSearchParams({});
    };

    const hasFilters = activeCategory !== 'all' || activeTag || searchTerm;

    if (loading) return (
        <div className="flex justify-center items-center py-24">
            <div
              className="animate-spin h-11 w-11 rounded-full border-2 border-solid"
              style={{ borderColor: `${accent}30`, borderTopColor: accent }}
            />
        </div>
    );

    if (error) return (
        <div className="text-center py-16">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button onClick={() => window.location.reload()}
                className="px-5 py-2.5 text-white rounded-full text-sm font-semibold"
                style={{ background: accent }}>
                Intentar de nuevo
            </button>
        </div>
    );

    return (
        <div className="pb-8">
            <div className="rounded-3xl px-6 sm:px-10 py-12 mb-10 lg:mb-12 text-center sm:text-left border border-black/[0.06]"
                style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${accent} 12%, var(--color-bg)), var(--color-bg))` }}>
                <p className="text-[11px] font-semibold tracking-[0.28em] uppercase mb-4" style={{ color: accent }}>
                    {storeName} · Tienda
                </p>
                <h1 className="font-editorial text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.05] mb-3" style={{ color: 'var(--color-text)' }}>
                    Catálogo
                </h1>
                <p className="text-sm sm:text-base opacity-55 max-w-2xl leading-relaxed">
                    Encontrá tu próxima pieza favorita. Filtrá por colección, ofertas o novedades — pocos productos, máxima claridad.
                </p>
            </div>

            <div className="mb-7">
                <div className="relative max-w-xl">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="¿Qué estás buscando?"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-11 py-3.5 rounded-full border border-black/[0.08] bg-white/80 shadow-sm focus:outline-none focus:ring-2 text-sm"
                        style={{ '--tw-ring-color': accent }}
                    />
                    {searchTerm && (
                        <button type="button" onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-full">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {categories.length > 0 && (
                <div className="mb-5">
                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            label="Todas"
                            active={activeCategory === 'all'}
                            onClick={() => setCategory('all')}
                            accent={accent}
                        />
                        {categories.map(cat => (
                            <FilterChip
                                key={cat.id}
                                label={cat.name}
                                active={activeCategory === cat.slug}
                                onClick={() => setCategory(cat.slug)}
                                accent={accent}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-wrap gap-2 items-center">
                {TAG_OPTIONS.map(tag => (
                    <FilterChip
                        key={tag.key}
                        label={tag.label}
                        active={activeTag === tag.key}
                        onClick={() => setTag(tag.key)}
                        accent={accent}
                        accentMode
                    />
                ))}
                {hasFilters && (
                    <button type="button" onClick={clearAll}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-black/10 text-neutral-500 hover:bg-neutral-50 transition-colors">
                        Limpiar filtros
                    </button>
                )}
            </div>

            <p className="text-xs font-medium opacity-45 mb-8 tracking-wide uppercase">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
                <div className="text-center py-24 rounded-3xl border border-dashed border-black/10 bg-neutral-50/50">
                    <p className="text-lg text-neutral-500 mb-4">No encontramos productos con esos filtros</p>
                    <button type="button" onClick={clearAll}
                        className="px-6 py-3 text-white rounded-full text-sm font-semibold"
                        style={{ background: accent }}>
                        Ver todo el catálogo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
                    {filtered.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

const FilterChip = ({ label, active, onClick, accent = '#c8a4a0', accentMode = false }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            padding:          '8px 16px',
            borderRadius:     '999px',
            border:           active ? `1.5px solid ${accent}` : '1.5px solid rgba(0,0,0,0.08)',
            background:       active
                ? accentMode ? `color-mix(in srgb, ${accent} 18%, transparent)` : accent
                : accentMode ? 'color-mix(in srgb, var(--color-bg) 40%, white)' : 'var(--color-bg)',
            color:            active
                ? (accentMode ? 'var(--color-text)' : '#fff')
                : 'var(--color-text)',
            fontSize:         '13px',
            fontWeight:       active ? 600 : 500,
            cursor:           'pointer',
            transition:       'all .15s',
            whiteSpace:       'nowrap',
            opacity:          active ? 1 : 0.75,
        }}
    >
        {label}
    </button>
);

export default Catalog;
