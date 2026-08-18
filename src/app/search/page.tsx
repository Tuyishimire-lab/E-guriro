'use client';
import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS, PRODUCT_CATEGORIES, formatRWF } from '@/lib/constants';
import { UilSearch, UilFilter, UilTimes, UilSlidersV } from '@/components/Icons';
import styles from './page.module.css';

const BRANDS = ['Samsung', 'Apple', 'Tecno', 'Infinix', 'Xiaomi', 'HP', 'Lenovo', 'Sony'];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [inputVal, setInputVal] = useState(initialQ);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const toggleCat = (c: string) => setSelectedCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const toggleBrand = (b: string) => setSelectedBrands(p => p.includes(b) ? p.filter(x => x !== b) : [...p, b]);
  const clearFilters = () => { setSelectedCats([]); setSelectedBrands([]); setMinPrice(''); setMaxPrice(''); setMinRating(0); };

  const results = useMemo(() => {
    let list = MOCK_PRODUCTS.filter(p => {
      if (!query) return true;
      const q = query.toLowerCase();
      return p.title.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.seller?.toLowerCase().includes(q) ||
        (p as any).brand?.toLowerCase().includes(q);
    });
    if (selectedCats.length) list = list.filter(p => selectedCats.includes(p.category || ''));
    if (selectedBrands.length) list = list.filter(p => selectedBrands.some(b => p.title.includes(b)));
    if (minPrice) list = list.filter(p => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter(p => p.price <= Number(maxPrice));
    if (minRating) list = list.filter(p => p.rating >= minRating);
    switch (sort) {
      case 'price_asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price_desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating': list = [...list].sort((a, b) => b.rating - a.rating); break;
    }
    return list;
  }, [query, selectedCats, selectedBrands, minPrice, maxPrice, minRating, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputVal.trim());
    window.history.pushState({}, '', `/search?q=${encodeURIComponent(inputVal.trim())}`);
  };

  const activeFilterCount = selectedCats.length + selectedBrands.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (minRating ? 1 : 0);

  return (
    <div className={styles.page}>
      {/* Search Bar */}
      <div className={styles.searchHeader}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchWrap}>
            <UilSearch size="20" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className={styles.searchInput}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Search products, brands, categories..."
              autoFocus
            />
            {inputVal && (
              <button type="button" onClick={() => { setInputVal(''); setQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <UilTimes size="18" />
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
          </div>
        </form>
        <p className={styles.resultCount}>
          {query
            ? <><strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for <em>"{query}"</em></>
            : <><strong>{results.length}</strong> products</>}
        </p>
      </div>

      <div className={styles.layout}>
        {/* Filters Sidebar */}
        <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Filters</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: '0.78rem' }}>
                  Clear all ({activeFilterCount})
                </button>
              )}
              <button className={styles.closeSidebar} onClick={() => setFiltersOpen(false)}><UilTimes size="18" /></button>
            </div>
          </div>

          {/* Category filter */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Category</p>
            <div className={styles.filterList}>
              {PRODUCT_CATEGORIES.map(c => (
                <label key={c.id} className={styles.filterItem}>
                  <input type="checkbox" checked={selectedCats.includes(c.id)} onChange={() => toggleCat(c.id)} />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Price Range (RWF)</p>
            <div className={styles.priceInputs}>
              <input className={styles.priceInput} type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              <span style={{ color: 'var(--text-muted)' }}>to</span>
              <input className={styles.priceInput} type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
          </div>

          {/* Brand filter */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Brand</p>
            <div className={styles.filterList}>
              {BRANDS.map(b => (
                <label key={b} className={styles.filterItem}>
                  <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} />
                  <span>{b}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating filter */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Min Rating</p>
            <div className={styles.ratingBtns}>
              {[4, 3, 2, 0].map(r => (
                <button key={r} onClick={() => setMinRating(r === minRating ? 0 : r)}
                  className={`${styles.ratingBtn} ${minRating === r ? styles.ratingBtnActive : ''}`}>
                  {r > 0 ? `${r}+ stars` : 'All'}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className={styles.results}>
          {/* Sort + mobile filter toggle */}
          <div className={styles.resultsHeader}>
            <button className={styles.filterToggle} onClick={() => setFiltersOpen(true)}>
              <UilSlidersV size="16" />
              Filters {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </button>
            <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {results.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No results found</p>
              <p className={styles.emptySub}>Try adjusting your search or filters</p>
              {activeFilterCount > 0 && (
                <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={clearFilters}>
                  Clear filters
                </button>
              )}
              <div style={{ marginTop: 24 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>Popular categories:</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {PRODUCT_CATEGORIES.slice(0, 4).map(c => (
                    <Link key={c.id} href={`/products?category=${c.id}`} className="btn btn-ghost btn-sm">{c.label}</Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {results.map(p => (
                <ProductCard key={p.id} {...p} reviews={p.reviews ?? 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: 'var(--text-muted)', textAlign: 'center' }}>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
