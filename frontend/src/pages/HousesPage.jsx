import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { housesAPI } from '../services/api';
import HouseCard from '../components/HouseCard';

const CATEGORIES = [
  { value: '', label: 'All Types' },
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: 'single_room', label: 'Single Room' },
  { value: 'one_bedroom', label: '1 Bedroom' },
  { value: 'two_bedroom', label: '2 Bedroom' },
  { value: 'three_bedroom', label: '3 Bedroom' },
  { value: 'studio', label: 'Studio' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'maisonette', label: 'Maisonette' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'villa', label: 'Villa' },
];

const LOCATIONS = [
  { value: '', label: 'All Locations' },
  { value: 'nairobi', label: 'Nairobi' },
  { value: 'mombasa', label: 'Mombasa' },
  { value: 'kisumu', label: 'Kisumu' },
  { value: 'rongai', label: 'Rongai' },
  { value: 'nakuru', label: 'Nakuru' },
  { value: 'westlands', label: 'Westlands' },
  { value: 'kilimani', label: 'Kilimani' },
  { value: 'kasarani', label: 'Kasarani' },
  { value: 'kitengela', label: 'Kitengela' },
  { value: 'ngong', label: 'Ngong' },
  { value: 'ruaka', label: 'Ruaka' },
  { value: 'karen', label: 'Karen' },
];

export default function HousesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    category: searchParams.get('category') || '',
    min_rent: searchParams.get('min_rent') || '',
    max_rent: searchParams.get('max_rent') || '',
    has_parking: searchParams.get('has_parking') || '',
    has_balcony: searchParams.get('has_balcony') || '',
    electricity: searchParams.get('electricity') || '',
  });

  const fetchHouses = async (reset = true) => {
    setLoading(true);
    try {
      const params = { ...filters, page: reset ? 1 : page };
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      const data = await housesAPI.list(params);
      if (reset) {
        setHouses(data.results || data);
        setPage(1);
      } else {
        setHouses(prev => [...prev, ...(data.results || data)]);
      }
      setCount(data.count || (data.results || data).length);
      setNextPage(data.next);
    } catch {
      setHouses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHouses(true); }, [filters]);

  const updateFilter = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set(key, val); else newParams.delete(key);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ search: '', location: '', category: '', min_rent: '', max_rent: '', has_parking: '', has_balcony: '', electricity: '' });
    setSearchParams({});
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  return (
    <div className="houses-page">
      {/* SEARCH BAR */}
      <div className="houses-searchbar">
        <div className="container-nyumba">
          <div className="searchbar-row">
            <div className="search-wrap flex-grow-1">
              <i className="bi bi-search search-icon-left"></i>
              <input className="search-input" placeholder="Search by name, area..."
                value={filters.search} onChange={e => updateFilter('search', e.target.value)} />
            </div>
            <select className="search-select" value={filters.location} onChange={e => updateFilter('location', e.target.value)}>
              {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <select className="search-select" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <button className={`filter-toggle-btn ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(!showFilters)}>
              <i className="bi bi-sliders me-1"></i>Filters
              {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
            </button>
          </div>

          {showFilters && (
            <div className="filters-expanded">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Min Rent (KES)</label>
                  <input type="number" className="form-control form-control-sm" placeholder="e.g. 5000"
                    value={filters.min_rent} onChange={e => updateFilter('min_rent', e.target.value)} />
                </div>
                <div className="filter-group">
                  <label>Max Rent (KES)</label>
                  <input type="number" className="form-control form-control-sm" placeholder="e.g. 30000"
                    value={filters.max_rent} onChange={e => updateFilter('max_rent', e.target.value)} />
                </div>
                <div className="filter-group">
                  <label>Electricity</label>
                  <select className="form-select form-select-sm" value={filters.electricity} onChange={e => updateFilter('electricity', e.target.value)}>
                    <option value="">Any</option>
                    <option value="token">Token</option>
                    <option value="fixed">Fixed</option>
                    <option value="included">Included</option>
                  </select>
                </div>
                <div className="filter-group d-flex gap-3 align-items-end">
                  <label className="check-label">
                    <input type="checkbox" checked={!!filters.has_parking}
                      onChange={e => updateFilter('has_parking', e.target.checked ? 'true' : '')} />
                    <span>Parking</span>
                  </label>
                  <label className="check-label">
                    <input type="checkbox" checked={!!filters.has_balcony}
                      onChange={e => updateFilter('has_balcony', e.target.checked ? 'true' : '')} />
                    <span>Balcony</span>
                  </label>
                </div>
                {activeFiltersCount > 0 && (
                  <button className="btn-clear-filters" onClick={clearFilters}>
                    <i className="bi bi-x-circle me-1"></i>Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RESULTS */}
      <div className="container-nyumba py-4">
        <div className="results-header">
          <span className="results-count">
            {loading ? 'Loading...' : `${count} house${count !== 1 ? 's' : ''} found`}
          </span>
          {filters.location && (
            <span className="active-filter-tag">
              <i className="bi bi-geo-alt me-1"></i>{filters.location}
              <button onClick={() => updateFilter('location', '')}><i className="bi bi-x"></i></button>
            </span>
          )}
          {filters.category && (
            <span className="active-filter-tag">
              <i className="bi bi-house me-1"></i>{filters.category.replace('_', ' ')}
              <button onClick={() => updateFilter('category', '')}><i className="bi bi-x"></i></button>
            </span>
          )}
        </div>

        {loading && houses.length === 0 ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
          </div>
        ) : houses.length > 0 ? (
          <>
            <div className="houses-grid">
              {houses.map(h => <HouseCard key={h.id} house={h} />)}
            </div>
            {nextPage && (
              <div className="text-center mt-4">
                <button className="btn-load-more" onClick={() => { setPage(p => p + 1); fetchHouses(false); }} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <i className="bi bi-house-x fs-1 mb-3 d-block"></i>
            <h5>No houses found</h5>
            <p className="text-muted">Try adjusting your filters or search in a different area.</p>
            <button className="btn-nyumba" onClick={clearFilters}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}