import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { housesAPI } from '../services/api';
import HouseCard from '../components/HouseCard';

const CATEGORIES = [
  { value: 'bedsitter', label: 'Bedsitter', icon: 'bi-door-open' },
  { value: 'single_room', label: 'Single Room', icon: 'bi-house-door' },
  { value: 'one_bedroom', label: '1 Bedroom', icon: 'bi-house' },
  { value: 'two_bedroom', label: '2 Bedroom', icon: 'bi-houses' },
  { value: 'three_bedroom', label: '3 Bedroom', icon: 'bi-building' },
  { value: 'studio', label: 'Studio', icon: 'bi-easel' },
  { value: 'maisonette', label: 'Maisonette', icon: 'bi-house-check' },
  { value: 'bungalow', label: 'Bungalow', icon: 'bi-house-fill' },
];

const POPULAR_LOCATIONS = [
  { value: 'rongai', label: 'Rongai', desc: 'Affordable suburb' },
  { value: 'nairobi', label: 'Nairobi', desc: 'Capital city' },
  { value: 'mombasa', label: 'Mombasa', desc: 'Coastal city' },
  { value: 'kisumu', label: 'Kisumu', desc: 'Lakeside city' },
  { value: 'westlands', label: 'Westlands', desc: 'Upmarket area' },
  { value: 'kasarani', label: 'Kasarani', desc: 'North-east Nairobi' },
  { value: 'kilimani', label: 'Kilimani', desc: 'Central Nairobi' },
  { value: 'kitengela', label: 'Kitengela', desc: 'Athi River outskirts' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([housesAPI.featured(), housesAPI.stats()])
      .then(([f, s]) => { setFeatured(f.results || f); setStats(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    if (category) params.set('category', category);
    navigate(`/houses?${params.toString()}`);
  };

  return (
    <div className="home-page">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Find Your Next <span className="hero-accent">Home</span><br />in Kenya
          </h1>
          <p className="hero-sub">No account needed. Browse thousands of verified houses, chat with landlords, and book your deposit online.</p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="search-row">
              <div className="search-input-wrap">
                <i className="bi bi-search search-icon-left"></i>
                <input
                  className="search-input"
                  placeholder="Search houses, areas..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="search-select" value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">All Locations</option>
                {POPULAR_LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <select className="search-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Types</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <button type="submit" className="search-btn">
                <i className="bi bi-search me-2"></i>Search
              </button>
            </div>
          </form>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-num">{stats.total_houses || '500'}+</span>
              <span className="stat-label">Houses Available</span>
            </div>
            <div className="hero-stat">
              <span className="stat-num">{stats.total_landlords || '120'}+</span>
              <span className="stat-label">Verified Landlords</span>
            </div>
            <div className="hero-stat">
              <span className="stat-num">{stats.locations || '18'}+</span>
              <span className="stat-label">Locations</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section-pad">
        <div className="container-nyumba">
          <div className="section-header">
            <h2 className="section-title">Browse by Type</h2>
            <p className="section-sub">Find the perfect home for your needs</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <button key={cat.value} className="category-card"
                onClick={() => navigate(`/houses?category=${cat.value}`)}>
                <i className={`bi ${cat.icon} category-icon`}></i>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section className="section-pad section-alt">
        <div className="container-nyumba">
          <div className="section-header">
            <h2 className="section-title">Popular Locations</h2>
            <p className="section-sub">Houses across Kenya's major cities and towns</p>
          </div>
          <div className="locations-grid">
            {POPULAR_LOCATIONS.map(loc => (
              <button key={loc.value} className="location-card"
                onClick={() => navigate(`/houses?location=${loc.value}`)}>
                <i className="bi bi-geo-alt-fill location-icon"></i>
                <div>
                  <div className="location-name">{loc.label}</div>
                  <div className="location-desc">{loc.desc}</div>
                </div>
                <i className="bi bi-arrow-right ms-auto"></i>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED HOUSES */}
      <section className="section-pad">
        <div className="container-nyumba">
          <div className="section-header">
            <h2 className="section-title">Featured Houses</h2>
            <a href="/houses" className="section-link">View all <i className="bi bi-arrow-right"></i></a>
          </div>
          {loading ? (
            <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>
          ) : featured.length > 0 ? (
            <div className="houses-grid">
              {featured.slice(0, 6).map(h => <HouseCard key={h.id} house={h} />)}
            </div>
          ) : (
            <div className="empty-state">
              <i className="bi bi-house-x fs-1 mb-3"></i>
              <p>No featured houses yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* WHY NYUMBA */}
      <section className="section-pad section-alt">
        <div className="container-nyumba">
          <div className="section-header">
            <h2 className="section-title">Why Choose Nyumba?</h2>
          </div>
          <div className="features-row">
            {[
              { icon: 'bi-person-x', title: 'No Account Needed', desc: 'Browse all houses without creating an account.' },
              { icon: 'bi-camera-video', title: 'Snip Videos', desc: 'Watch short video tours before visiting.' },
              { icon: 'bi-chat-dots', title: 'Direct Chat', desc: 'Message landlords instantly without intermediaries.' },
              { icon: 'bi-shield-lock', title: 'Secure Booking', desc: 'Pay deposit via M-Pesa & hold the house for 3 days.' },
              { icon: 'bi-star', title: 'Verified Reviews', desc: 'Read honest reviews from actual tenants.' },
              { icon: 'bi-geo-alt', title: 'All Over Kenya', desc: 'Nairobi, Mombasa, Kisumu, Rongai & more.' },
            ].map(f => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon-wrap"><i className={`bi ${f.icon}`}></i></div>
                <h6>{f.title}</h6>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOR LANDLORDS */}
      <section className="landlord-cta">
        <div className="container-nyumba text-center">
          <h2>Are You a Landlord?</h2>
          <p>List your property for free and reach thousands of tenants across Kenya.</p>
          <a href="/register" className="btn-cta">
            <i className="bi bi-plus-circle me-2"></i>List Your House Free
          </a>
        </div>
      </section>
    </div>
  );
}