import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const TAG_OPTIONS = [
    { key: 'new',        label: '🆕 Nuevos' },
    { key: 'sale',       label: '🔴 Ofertas' },
    { key: 'bestseller', label: '⭐ Más Vendidos' },
];

const Catalog = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [products,    setProducts]    = useState([]);
    const [categories,  setCategories]  = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState(null);
    const [searchTerm,  setSearchTerm]  = useState('');

    // Leer filtros desde la URL (compatibles con el mega-menú)
    const activeCategory = searchParams.get('category') || 'all';
    const activeTag      = searchParams.get('tag')      || '';

    // Cargar productos y categorías en paralelo
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

    // Aplicar filtros
    const filtered = products.filter(p => {
        const matchSearch   = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = activeCategory === 'all' || p.category === activeCategory;
        const matchTag =
            !activeTag ||
            (activeTag === 'new'        && p.flags?.isNew) ||
            (activeTag === 'sale'       && p.flags?.isSale) ||
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary, #1d4ed8)' }} />
        </div>
    );

    if (error) return (
        <div className="text-center py-16">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button onClick={() => window.location.reload()}
                className="px-4 py-2 text-white rounded-lg"
                style={{ background: 'var(--color-primary, #1d4ed8)' }}>
                Intentar de nuevo
            </button>
        </div>
    );

    return (
        <div>
            {/* ── Encabezado ──────────────────────────────────────────────────── */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--color-text, #1f2937)' }}>
                    Catálogo
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text, #1f2937)', opacity: 0.55 }}>
                    {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* ── Barra de búsqueda ───────────────────────────────────────────── */}
            <div className="mb-5">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, marca o tipo..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': 'var(--color-primary, #1d4ed8)' }}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filtros de categoría ────────────────────────────────────────── */}
            {categories.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            label="Todas"
                            active={activeCategory === 'all'}
                            onClick={() => setCategory('all')}
                        />
                        {categories.map(cat => (
                            <FilterChip
                                key={cat.id}
                                label={cat.name}
                                active={activeCategory === cat.slug}
                                onClick={() => setCategory(cat.slug)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Filtros de tag ───────────────────────────────────────────────── */}
            <div className="mb-6 flex flex-wrap gap-2 items-center">
                {TAG_OPTIONS.map(tag => (
                    <FilterChip
                        key={tag.key}
                        label={tag.label}
                        active={activeTag === tag.key}
                        onClick={() => setTag(tag.key)}
                        accent
                    />
                ))}
                {hasFilters && (
                    <button onClick={clearAll}
                        className="text-sm px-3 py-1 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                        ✕ Limpiar filtros
                    </button>
                )}
            </div>

            {/* ── Grid de productos ───────────────────────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-lg text-gray-500 mb-3">No encontramos productos con esos filtros</p>
                    <button onClick={clearAll}
                        className="px-4 py-2 text-white rounded-lg text-sm"
                        style={{ background: 'var(--color-primary, #1d4ed8)' }}>
                        Limpiar filtros
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Chip reutilizable para filtros
const FilterChip = ({ label, active, onClick, accent = false }) => (
    <button
        onClick={onClick}
        style={{
            padding:          '6px 14px',
            borderRadius:     '999px',
            border:           active
                ? `1.5px solid var(--color-primary, #1d4ed8)`
                : '1.5px solid #e5e7eb',
            background:       active
                ? 'var(--color-primary, #1d4ed8)'
                : (accent ? '#fafafa' : '#fff'),
            color:            active ? '#fff' : '#374151',
            fontSize:         '13px',
            fontWeight:       active ? 600 : 400,
            cursor:           'pointer',
            transition:       'all .15s',
            whiteSpace:       'nowrap',
        }}
    >
        {label}
    </button>
);

export default Catalog;
// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../services/api';
// import ProductCard from '../components/ProductCard';
// import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

// const Catalog = () => {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('all');

//   // Obtener productos del backend
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await api.get('/products');
//         if (response.data.status === 'success') {
//           setProducts(response.data.data);
//           setFilteredProducts(response.data.data);
//         }
//       } catch (err) {
//         setError('Error al cargar los productos');
//         console.error('Error fetching products:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   // Filtrar productos cuando cambie la búsqueda o categoría
//   useEffect(() => {
//     let filtered = products;

//     // Filtrar por búsqueda
//     if (searchTerm) {
//       filtered = filtered.filter(product =>
//         product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (product.characteristics?.Marca && product.characteristics.Marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (product.characteristics?.Tipo && product.characteristics.Tipo.toLowerCase().includes(searchTerm.toLowerCase()))
//       );
//     }

//     // Filtrar por categoría
//     if (selectedCategory !== 'all') {
//       filtered = filtered.filter(product => product.category === selectedCategory);
//     }

//     setFilteredProducts(filtered);
//   }, [products, searchTerm, selectedCategory]);

//   // Obtener categorías únicas
//   const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-16">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-16">
//         <div className="text-red-600 text-lg mb-4">{error}</div>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
//         >
//           Intentar nuevamente
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Catálogo de Carteras</h1>

//         {/* Filtros y búsqueda */}
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <div className="flex flex-col md:flex-row gap-4">
//             {/* Búsqueda */}
//             <div className="flex-1 relative">
//               <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Buscar por nombre, marca o tipo..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
//               />
//             </div>

//             {/* Filtro por categoría */}
//             <div className="relative">
//               <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
//               >
//                 <option value="all">Todas las categorías</option>
//                 {categories.filter(cat => cat !== 'all').map(category => (
//                   <option key={category} value={category}>
//                     {category.charAt(0).toUpperCase() + category.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Resultados */}
//           <div className="mt-4 text-sm text-gray-600">
//             {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
//           </div>
//         </div>
//       </div>

//       {/* Lista de productos */}
//       {filteredProducts.length === 0 ? (
//         <div className="text-center py-16">
//           <div className="text-gray-500 text-lg mb-4">
//             {searchTerm || selectedCategory !== 'all'
//               ? 'No se encontraron productos que coincidan con tu búsqueda'
//               : 'No hay productos disponibles'
//             }
//           </div>
//           {(searchTerm || selectedCategory !== 'all') && (
//             <button
//               onClick={() => {
//                 setSearchTerm('');
//                 setSelectedCategory('all');
//               }}
//               className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
//             >
//               Limpiar filtros
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {filteredProducts.map(product => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Catalog;