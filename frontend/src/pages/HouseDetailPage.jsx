import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { housesAPI } from '../services/api';
import ChatWidget from '../components/ChatWidget';
import BookingModal from '../components/BookingModal';

const ELEC_MAP = { token: 'Token (Prepaid)', fixed: 'Fixed Monthly', included: 'Included in Rent', shared: 'Shared Meter' };

export default function HouseDetailPage() {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showVideo, setShowVideo] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    housesAPI.detail(id)
      .then(setHouse)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  if (!house) return <div className="text-center py-5"><h5>House not found.</h5><Link to="/houses">Back to listings</Link></div>;

  const images = house.images || [];
  const videos = house.videos || [];
  const landlord = house.landlord;
  const amenities = [
    { key: 'has_parking', label: 'Parking', icon: 'bi-car-front' },
    { key: 'has_shower', label: 'Shower', icon: 'bi-droplet' },
    { key: 'has_balcony', label: 'Balcony', icon: 'bi-building' },
    { key: 'has_tiles', label: 'Tiles', icon: 'bi-grid-3x3' },
    { key: 'has_wifi', label: 'WiFi', icon: 'bi-wifi' },
    { key: 'has_water', label: 'Water', icon: 'bi-water' },
    { key: 'has_security', label: 'Security', icon: 'bi-shield-check' },
    { key: 'has_gym', label: 'Gym', icon: 'bi-bicycle' },
    { key: 'has_swimming_pool', label: 'Pool', icon: 'bi-water' },
  ];

  return (
    <div className="house-detail-page">
      <div className="container-nyumba py-4">
        {/* BREADCRUMB */}
        <nav className="breadcrumb-nyumba mb-3">
          <Link to="/">Home</Link> <i className="bi bi-chevron-right mx-1"></i>
          <Link to="/houses">Houses</Link> <i className="bi bi-chevron-right mx-1"></i>
          <span>{house.title}</span>
        </nav>

        <div className="detail-grid">
          {/* LEFT: Images + Info */}
          <div className="detail-main">
            {/* IMAGE GALLERY */}
            <div className="gallery-main">
              {images.length > 0 ? (
                <img src={images[activeImg]?.image} alt={house.title} className="gallery-hero" />
              ) : (
                <div className="gallery-placeholder"><i className="bi bi-image fs-1"></i><span>No images</span></div>
              )}
              {house.status === 'booked' && <div className="status-ribbon">BOOKED</div>}
            </div>
            {images.length > 1 && (
              <div className="gallery-thumbs">
                {images.map((img, i) => (
                  <button key={img.id} className={`thumb-btn ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}>
                    <img src={img.image} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* VIDEOS */}
            {videos.length > 0 && (
              <div className="video-section">
                <h6 className="section-label"><i className="bi bi-play-circle me-2"></i>Video Tours</h6>
                <div className="video-thumbs">
                  {videos.map(v => (
                    <button key={v.id} className="video-thumb-btn" onClick={() => { setActiveVideo(v); setShowVideo(true); }}>
                      {v.thumbnail
                        ? <img src={v.thumbnail} alt={v.title} />
                        : <div className="video-placeholder"><i className="bi bi-play-circle-fill fs-2"></i></div>}
                      <div className="video-play-overlay"><i className="bi bi-play-fill"></i></div>
                      {v.title && <span className="video-label">{v.title}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TABS */}
            <div className="detail-tabs">
              <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Details</button>
              <button className={`tab-btn ${activeTab === 'amenities' ? 'active' : ''}`} onClick={() => setActiveTab('amenities')}>Amenities</button>
              <button className={`tab-btn ${activeTab === 'landlord' ? 'active' : ''}`} onClick={() => setActiveTab('landlord')}>Landlord</button>
              <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
                Reviews {landlord?.reviews?.length > 0 && <span className="tab-count">{landlord.reviews.length}</span>}
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="tab-content-nyumba">
                <h4 className="detail-title">{house.title}</h4>
                <div className="detail-location mb-2">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>{house.address}
                </div>
                <div className="detail-specs">
                  <span><i className="bi bi-door-open me-1"></i>{house.category?.replace('_', ' ')}</span>
                  <span><i className="bi bi-building me-1"></i>Floor {house.floor_number}</span>
                  <span><i className="bi bi-bed me-1"></i>{house.bedrooms} bed</span>
                  <span><i className="bi bi-droplet me-1"></i>{house.bathrooms} bath</span>
                  {house.interior_color && <span><i className="bi bi-palette me-1"></i>{house.interior_color}</span>}
                </div>
                <h6 className="mt-3 mb-2">Description</h6>
                <p className="detail-desc">{house.description}</p>
                <div className="detail-payment mt-3">
                  <div className="payment-item">
                    <i className="bi bi-lightning-fill text-warning me-2"></i>
                    <span>Electricity: <strong>{ELEC_MAP[house.electricity] || house.electricity}</strong></span>
                  </div>
                  <div className="payment-item">
                    <i className="bi bi-eye text-muted me-2"></i>
                    <span><strong>{house.views_count}</strong> views</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="tab-content-nyumba">
                <div className="amenities-grid">
                  {amenities.map(a => (
                    <div key={a.key} className={`amenity-item ${house[a.key] ? 'available' : 'unavailable'}`}>
                      <i className={`bi ${a.icon} me-2`}></i>
                      <span>{a.label}</span>
                      <i className={`bi ${house[a.key] ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'} ms-auto`}></i>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'landlord' && landlord && (
              <div className="tab-content-nyumba">
                <div className="landlord-profile-card">
                  <div className="landlord-avatar-lg">
                    {landlord.user?.avatar
                      ? <img src={landlord.user.avatar} alt="" />
                      : <span>{(landlord.user?.first_name || landlord.user?.username || 'L')[0]}</span>}
                  </div>
                  <div className="landlord-info">
                    <h5>{landlord.user?.first_name} {landlord.user?.last_name || ''}</h5>
                    {landlord.business_name && <div className="text-muted">{landlord.business_name}</div>}
                    <div className="landlord-stats mt-2">
                      <span><i className="bi bi-house me-1"></i>{landlord.total_houses} houses</span>
                      <span><i className="bi bi-star-fill text-warning me-1"></i>{Number(landlord.average_rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="landlord-contacts mt-3">
                  {landlord.user?.phone && (
                    <a href={`tel:${landlord.user.phone}`} className="contact-btn">
                      <i className="bi bi-telephone-fill me-2"></i>{landlord.user.phone}
                    </a>
                  )}
                  {landlord.user?.email && (
                    <a href={`mailto:${landlord.user.email}`} className="contact-btn">
                      <i className="bi bi-envelope-fill me-2"></i>{landlord.user.email}
                    </a>
                  )}
                  {landlord.whatsapp && (
                    <a href={`https://wa.me/${landlord.whatsapp}`} target="_blank" rel="noopener noreferrer" className="contact-btn whatsapp">
                      <i className="bi bi-whatsapp me-2"></i>WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-content-nyumba">
                {landlord?.reviews?.length > 0 ? (
                  <div className="reviews-list">
                    {landlord.reviews.map(r => (
                      <div key={r.id} className="review-item">
                        <div className="review-header">
                          <strong>{r.reviewer_name}</strong>
                          <div className="stars">
                            {[1,2,3,4,5].map(s => (
                              <i key={s} className={`bi bi-star${s <= r.rating ? '-fill text-warning' : ''}`}></i>
                            ))}
                          </div>
                          <small className="text-muted ms-auto">{new Date(r.created_at).toLocaleDateString()}</small>
                        </div>
                        <p className="review-text">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="bi bi-chat-square-dots fs-1 mb-2 d-block"></i>
                    <p>No reviews yet. Be the first to review this landlord.</p>
                  </div>
                )}
                <ReviewForm landlordId={landlord?.id} houseId={house.id} />
              </div>
            )}
          </div>

          {/* RIGHT: Pricing + Actions */}
          <div className="detail-sidebar">
            <div className="price-card">
              <div className="price-main">
                <span className="price-amount">KES {Number(house.rent).toLocaleString()}</span>
                <span className="price-period">/month</span>
              </div>
              <div className="price-deposit">
                Deposit: <strong>KES {Number(house.deposit).toLocaleString()}</strong>
              </div>
              <div className={`status-badge status-${house.status}`}>
                <i className={`bi ${house.status === 'available' ? 'bi-check-circle-fill' : 'bi-clock-fill'} me-1`}></i>
                {house.status.charAt(0).toUpperCase() + house.status.slice(1)}
              </div>

              {house.status === 'available' && (
                <>
                  <button className="btn-book-now w-100 mt-3" onClick={() => setShowBooking(true)}>
                    <i className="bi bi-lock-fill me-2"></i>Book & Pay Deposit
                  </button>
                  <button className="btn-chat-landlord w-100 mt-2" onClick={() => setShowChat(true)}>
                    <i className="bi bi-chat-dots-fill me-2"></i>Chat with Landlord
                  </button>
                </>
              )}
              {house.status === 'booked' && (
                <div className="booked-notice">
                  <i className="bi bi-clock-history me-2"></i>
                  This house is currently reserved. Check back soon.
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="quick-info-card mt-3">
              <h6 className="quick-info-title">Quick Info</h6>
              <div className="quick-info-row"><i className="bi bi-geo-alt me-2 text-primary"></i><span>{house.location}</span></div>
              <div className="quick-info-row"><i className="bi bi-building me-2 text-primary"></i><span>Floor {house.floor_number}</span></div>
              <div className="quick-info-row"><i className="bi bi-lightning me-2 text-warning"></i><span>{ELEC_MAP[house.electricity]}</span></div>
              {house.has_parking && <div className="quick-info-row"><i className="bi bi-car-front me-2 text-success"></i><span>Parking Available</span></div>}
              {house.has_balcony && <div className="quick-info-row"><i className="bi bi-building me-2 text-success"></i><span>Has Balcony</span></div>}
              {house.interior_color && <div className="quick-info-row"><i className="bi bi-palette me-2 text-info"></i><span>{house.interior_color} interior</span></div>}
            </div>
          </div>
        </div>
      </div>

      {/* CHAT WIDGET */}
      {showChat && <div className="chat-widget-container"><ChatWidget house={house} onClose={() => setShowChat(false)} /></div>}

      {/* BOOKING MODAL */}
      {showBooking && <BookingModal house={house} onClose={() => setShowBooking(false)} />}

      {/* VIDEO MODAL */}
      {showVideo && activeVideo && (
        <div className="modal-overlay" onClick={() => setShowVideo(false)}>
          <div className="video-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowVideo(false)}><i className="bi bi-x-lg"></i></button>
            <video src={activeVideo.video} controls autoPlay className="w-100" style={{ maxHeight: '80vh' }}></video>
            {activeVideo.title && <div className="video-modal-title">{activeVideo.title}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewForm({ landlordId, houseId }) {
  const [form, setForm] = useState({ reviewer_name: '', reviewer_email: '', rating: 5, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { reviewsAPI } = await import('../services/api');
      await reviewsAPI.create({ ...form, landlord: landlordId, house: houseId });
      setSubmitted(true);
    } catch {
      alert('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div className="review-success mt-3">
      <i className="bi bi-check-circle-fill text-success me-2"></i>Thank you for your review!
    </div>
  );

  return (
    <form className="review-form mt-4" onSubmit={handleSubmit}>
      <h6>Leave a Review</h6>
      <div className="mb-2">
        <input className="form-control form-control-sm" placeholder="Your name" required
          value={form.reviewer_name} onChange={e => setForm({ ...form, reviewer_name: e.target.value })} />
      </div>
      <div className="mb-2">
        <input type="email" className="form-control form-control-sm" placeholder="Your email (optional)"
          value={form.reviewer_email} onChange={e => setForm({ ...form, reviewer_email: e.target.value })} />
      </div>
      <div className="mb-2">
        <select className="form-select form-select-sm" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
        </select>
      </div>
      <div className="mb-2">
        <textarea className="form-control form-control-sm" rows="3" placeholder="Share your experience..." required
          value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}></textarea>
      </div>
      <button type="submit" className="btn-nyumba btn-sm" disabled={loading}>
        {loading ? <span className="spinner-border spinner-border-sm me-1"></span> : null}
        Submit Review
      </button>
    </form>
  );
}