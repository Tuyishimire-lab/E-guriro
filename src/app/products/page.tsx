'use client';
import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES, FEATURED_BRANDS, formatRWF } from '@/lib/constants';
import {
  UilFilter, UilSlidersV, UilSearch, UilGrid, UilListUl,
  UilRefresh, UilMobileAndroid, UilTablet, UilLaptop, UilTvRetro,
  UilHeadphones, UilCamera, UilPlug, UilBolt, UilWifi,
  UilBatteryBolt, UilWatch, UilHistory, UilShieldCheck,
} from '@/components/Icons';
import styles from './page.module.css';

// Category ID  icon map (same as homepage)
const CAT_ICON_MAP: Record<string, React.ComponentType<{ size?: string | number; style?: React.CSSProperties }>> = {
  smartphones: UilMobileAndroid,
  tablets:     UilTablet,
  laptops:     UilLaptop,
  tvs:         UilTvRetro,
  audio:       UilHeadphones,
  cameras:     UilCamera,
  accessories: UilPlug,
  gaming:      UilBolt,
  networking:  UilWifi,
  powerbanks:  UilBatteryBolt,
  smartwatches: UilWatch,
  refurbished: UilHistory,
};

const PRICE_PRESETS = [
  { label: 'Under 100K',    min: 0,       max: 100000 },
  { label: '100K300K',     min: 100000,  max: 300000 },
  { label: '300K600K',     min: 300000,  max: 600000 },
  { label: '600K1M',       min: 600000,  max: 1000000 },
  { label: 'Over 1M',       min: 1000000, max: Infinity },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialBrand    = searchParams.get('brand') || 'all';

  const [category,  setCategory]  = useState(initialCategory);
  const [brand,     setBrand]     = useState(initialBrand);
  const [condition, setCondition] = useState<'all' | 'new' | 'refurbished'>('all');
  const [search,    setSearch]    = useState(searchParams.get('search') || '');
  const [sortBy,    setSortBy]    = useState('relevance');
  const [priceMin,  setPriceMin]  = useState('');
  const [priceMax,  setPriceMax]  = useState('');
  const [minRating, setMinRating] = useState(0);
  const [viewMode,  setViewMode]  = useState<'grid' | 'list'>('grid');
  // Start sidebar CLOSED on mobile (<=900px), open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR: default open
    return window.innerWidth > 900;
  });

  const clearAll = () => {
    setCategory('all'); setBrand('all'); setCondition('all');
    setSearch('');      setPriceMin(''); setPriceMax('');
    setMinRating(0);    setSortBy('relevance');
  };

  const activeFilterCount = [
    category !== 'all', brand !== 'all', condition !== 'all',
    !!search, !!priceMin || !!priceMax, minRating > 0,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = [...MOCK_PRODUCTS];
    if (category !== 'all') result = result.filter(p => p.category === category);
    if (brand !== 'all')    result = result.filter(p => (p.brand || '').toLowerCase() === brand);
    if (condition !== 'all') result = result.filter(p => (p.condition || 'new') === condition);
    if (search)   result = result.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.seller.toLowerCase().includes(search.toLowerCase())
    );
    if (priceMin) result = result.filter(p => p.price >= Number(priceMin));
    if (priceMax) result = result.filter(p => p.price <= Number(priceMax));
    if (minRating > 0) result = result.filter(p => p.rating >= minRating);

    switch (sortBy) {
      case 'price-asc':  return result.sort((a, b) => a.price - b.price);
      case 'price-desc': return result.sort((a, b) => b.price - a.price);
      case 'rating':     return result.sort((a, b) => b.rating - a.rating);
      case 'newest':     return result.reverse();
      default:           return result;
    }
  }, [category, brand, condition, search, sortBy, priceMin, priceMax, minRating]);

  const currentCategoryLabel = category === 'all'
    ? 'All Electronics'
    : PRODUCT_CATEGORIES.find(c => c.id === category)?.label ?? 'Products';

  return (
    <div className={styles.page}>

      {/*  PAGE HEADER  */}
      <div className={styles.pageHeader}>
        <div className="container">
          <div className={styles.pageHeaderInner}>
            <div>
              <div className={styles.breadcrumb}>
                <span>Home</span>
                <span className={styles.breadSep}>/</span>
                <span className={styles.breadActive}>Products</span>
                {category !== 'all' && (
                  <>
                    <span className={styles.breadSep}>/</span>
                    <span className={styles.breadActive}>{currentCategoryLabel}</span>
                  </>
                )}
              </div>
              <h1 className={styles.pageTitle}>{currentCategoryLabel}</h1>
              <p className={styles.pageSubtitle}>
                {filtered.length} products &mdash; genuine, warranted, delivered across Rwanda
              </p>
            </div>

            {/* Quick brand filter pills */}
            <div className={styles.brandPillsHeader}>
              {FEATURED_BRANDS.slice(0, 6).map(b => (
                <button
                  key={b.id}
                  onClick={() => setBrand(brand === b.id ? 'all' : b.id)}
                  className={`${styles.brandPillHead} ${brand === b.id ? styles.brandPillHeadActive : ''}`}
                  style={{ '--brand-color': b.color } as React.CSSProperties}
                >
                  <span className={styles.brandDotHead} style={{ background: b.color }} />
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/*  MAIN LAYOUT  */}
      <div className="container">
        <div className={`${styles.layout} ${sidebarOpen ? '' : styles.sidebarCollapsed}`}>

          {/*  SIDEBAR  */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <div className={styles.sidebarTitleRow}>
                <UilSlidersV size="18" style={{ color: 'var(--brand-green)' }} />
                <h2 className={styles.sidebarTitle}>Filters</h2>
                {activeFilterCount > 0 && (
                  <span className={styles.filterBadge}>{activeFilterCount}</span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button className={styles.clearBtn} onClick={clearAll} id="clear-filters-btn">
                  <UilRefresh size="14" />
                  Reset
                </button>
              )}
            </div>

            {/* Search */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Search</p>
              <div className={styles.searchBox}>
                <UilSearch size="16" className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Search devices..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  id="product-search"
                />
              </div>
            </div>

            {/* Category */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Category</p>
              <div className={styles.categoryList}>
                <button
                  className={`${styles.catBtn} ${category === 'all' ? styles.catBtnActive : ''}`}
                  onClick={() => setCategory('all')}
                  id="cat-all"
                >
                  <span className={styles.catIconWrap} style={{ background: '#ffffff1a' }}>
                    <UilGrid size="16" style={{ color: '#aaa' }} />
                  </span>
                  All Products
                  <span className={styles.catCount}>{MOCK_PRODUCTS.length}</span>
                </button>
                {PRODUCT_CATEGORIES.map(cat => {
                  const IconComp = CAT_ICON_MAP[cat.id];
                  const count = MOCK_PRODUCTS.filter(p => p.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      className={`${styles.catBtn} ${category === cat.id ? styles.catBtnActive : ''}`}
                      onClick={() => setCategory(cat.id)}
                      id={`cat-${cat.id}`}
                    >
                      <span className={styles.catIconWrap} style={{ background: `${cat.color}1A` }}>
                        {IconComp && <IconComp size="15" style={{ color: cat.color }} />}
                      </span>
                      {cat.label}
                      {count > 0 && <span className={styles.catCount}>{count}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Brand</p>
              <div className={styles.brandList}>
                <button
                  className={`${styles.brandBtn} ${brand === 'all' ? styles.brandBtnActive : ''}`}
                  onClick={() => setBrand('all')}
                >All Brands</button>
                {FEATURED_BRANDS.map(b => (
                  <button
                    key={b.id}
                    className={`${styles.brandBtn} ${brand === b.id ? styles.brandBtnActive : ''}`}
                    onClick={() => setBrand(b.id)}
                    id={`brand-filter-${b.id}`}
                  >
                    <span className={styles.brandDotSidebar} style={{ background: b.color }} />
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Condition</p>
              <div className={styles.conditionBtns}>
                {(['all', 'new', 'refurbished'] as const).map(c => (
                  <button
                    key={c}
                    className={`${styles.condBtn} ${condition === c ? styles.condBtnActive : ''}`}
                    onClick={() => setCondition(c)}
                    id={`cond-${c}`}
                  >
                    {c === 'all' ? 'All' : c === 'new' ? 'New' : 'Refurbished'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Price Range (RWF)</p>
              <div className={styles.pricePresets}>
                {PRICE_PRESETS.map(preset => {
                  const isActive =
                    priceMin === String(preset.min === 0 ? '' : preset.min) &&
                    priceMax === String(preset.max === Infinity ? '' : preset.max);
                  return (
                    <button
                      key={preset.label}
                      className={`${styles.pricePresetBtn} ${isActive ? styles.pricePresetActive : ''}`}
                      onClick={() => {
                        setPriceMin(preset.min === 0 ? '' : String(preset.min));
                        setPriceMax(preset.max === Infinity ? '' : String(preset.max));
                      }}
                    >{preset.label}</button>
                  );
                })}
              </div>
              <div className={styles.priceInputs}>
                <input className={styles.priceInput} type="number" placeholder="Min" value={priceMin} onChange={e => setPriceMin(e.target.value)} id="price-min" />
                <span className={styles.priceDash}>to</span>
                <input className={styles.priceInput} type="number" placeholder="Max" value={priceMax} onChange={e => setPriceMax(e.target.value)} id="price-max" />
              </div>
            </div>

            {/* Rating */}
            <div className={styles.filterSection}>
              <p className={styles.filterLabel}>Minimum Rating</p>
              <div className={styles.ratingBtns}>
                {[0, 3, 4, 4.5].map(r => (
                  <button
                    key={r}
                    className={`${styles.ratingBtn} ${minRating === r ? styles.ratingBtnActive : ''}`}
                    onClick={() => setMinRating(r)}
                    id={`rating-${r}`}
                  >
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Warranty filter */}
            <div className={styles.filterSection}>
              <div className={styles.warrantyRow}>
                <UilShieldCheck size="15" style={{ color: 'var(--brand-green)' }} />
                <span className={styles.filterLabel} style={{ marginBottom: 0 }}>Warranty Included</span>
                <label className={styles.toggle}>
                  <input type="checkbox" id="warranty-toggle" />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          </aside>

          {/*  MAIN CONTENT  */}
          <div className={styles.main}>

            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <button
                  className={styles.sidebarToggleBtn}
                  onClick={() => setSidebarOpen(s => !s)}
                  id="sidebar-toggle-btn"
                  title={sidebarOpen ? 'Hide filters' : 'Show filters'}
                >
                  <UilFilter size="16" />
                  {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
                  {activeFilterCount > 0 && (
                    <span className={styles.filterBadge}>{activeFilterCount}</span>
                  )}
                </button>
                <p className={styles.resultsCount}>
                  <strong>{filtered.length}</strong> results
                  {category !== 'all' && (
                    <span className={styles.categoryChip}>
                      {currentCategoryLabel}
                      <button onClick={() => setCategory('all')} className={styles.chipClose}>x</button>
                    </span>
                  )}
                  {brand !== 'all' && (
                    <span className={styles.categoryChip}>
                      {FEATURED_BRANDS.find(b => b.id === brand)?.label}
                      <button onClick={() => setBrand('all')} className={styles.chipClose}>x</button>
                    </span>
                  )}
                  {condition !== 'all' && (
                    <span className={styles.categoryChip}>
                      {condition === 'new' ? 'New' : 'Refurbished'}
                      <button onClick={() => setCondition('all')} className={styles.chipClose}>x</button>
                    </span>
                  )}
                </p>
              </div>
              <div className={styles.toolbarRight}>
                <div className={styles.viewToggle}>
                  <button
                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                    onClick={() => setViewMode('grid')}
                    id="view-grid-btn"
                    aria-label="Grid view"
                  ><UilGrid size="16" /></button>
                  <button
                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                    onClick={() => setViewMode('list')}
                    id="view-list-btn"
                    aria-label="List view"
                  ><UilListUl size="16" /></button>
                </div>
                <div className={styles.sortRow}>
                  <label className={styles.sortLabel} htmlFor="sort-select">Sort:</label>
                  <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)} id="sort-select">
                    <option value="relevance">Relevance</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Best Rated</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIconWrap}>
                  <UilSearch size="40" style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 className={styles.emptyTitle}>No products found</h3>
                <p className={styles.emptyText}>Try adjusting your filters or search term</p>
                <button className="btn btn-primary" onClick={clearAll} id="clear-search-btn">
                  <UilRefresh size="16" />
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'products-grid' : styles.listView}>
                {filtered.map(p => <ProductCard key={p.id} {...p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
