import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { housesAPI, bookingsAPI, chatAPI, notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── DASHBOARD HOME ──────────────────────────────────────
export function DashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    housesAPI.myListings().then(d => setListings(d.results || d)).catch(() => {});
    bookingsAPI.landlordBookings().then(d => setBookings(d.results || d)).catch(() => {});
    notificationsAPI.list().then(d => setNotifications(d.results || d)).catch(() => {});
  }, []);

  const available = listings.filter(h => h.status === 'available').length;
  const booked = listings.filter(h => h.status === 'booked').length;
  const unread = notifications.filter(n => !n.is_read).length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h4>Welcome back, {user?.first_name || user?.username}! 👋</h4>
        <p className="text-muted">Here's what's happening with your listings today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon bg-primary"><i className="bi bi-house-fill"></i></div>
          <div><div className="stat-number">{listings.length}</div><div className="stat-label">Total Listings</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-success"><i className="bi bi-check-circle-fill"></i></div>
          <div><div className="stat-number">{available}</div><div className="stat-label">Available</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-warning"><i className="bi bi-clock-fill"></i></div>
          <div><div className="stat-number">{booked}</div><div className="stat-label">Booked</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-danger"><i className="bi bi-bell-fill"></i></div>
          <div><div className="stat-number">{unread}</div><div className="stat-label">Unread Notifications</div></div>
        </div>
      </div>

      <div className="dashboard-grid mt-4">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Recent Listings</h6>
            <Link to="/dashboard/listings" className="small text-primary">View all</Link>
          </div>
          {listings.slice(0, 4).map(h => (
            <div key={h.id} className="mini-listing-card">
              <div className="mini-listing-info">
                <span className="fw-semibold">{h.title}</span>
                <span className="text-muted small">{h.location}</span>
              </div>
              <div className="text-end">
                <div className="small">KES {Number(h.rent).toLocaleString()}/mo</div>
                <span className={`status-pill status-${h.status}`}>{h.status}</span>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="empty-state-sm">
              <i className="bi bi-house-add me-2"></i>
              <Link to="/dashboard/add-house">Add your first listing</Link>
            </div>
          )}
        </div>

        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Recent Notifications</h6>
            <Link to="/dashboard/notifications" className="small text-primary">View all</Link>
          </div>
          {notifications.slice(0, 5).map(n => (
            <div key={n.id} className={`notif-mini ${!n.is_read ? 'unread' : ''}`}>
              <i className={`bi ${n.type === 'booking' ? 'bi-calendar-check' : n.type === 'message' ? 'bi-chat' : n.type === 'payment' ? 'bi-cash' : 'bi-star'} me-2`}></i>
              <div>
                <div className="small fw-semibold">{n.title}</div>
                <div className="text-muted" style={{ fontSize: '0.75rem' }}>{n.body.slice(0, 60)}...</div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && <div className="empty-state-sm">No notifications yet.</div>}
        </div>
      </div>
    </div>
  );
}

// ── MY LISTINGS ──────────────────────────────────────
export function MyListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    housesAPI.myListings()
      .then(d => setListings(d.results || d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await housesAPI.delete(id);
      setListings(prev => prev.filter(h => h.id !== id));
    } catch { alert('Failed to delete.'); }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header-row">
        <h5 className="mb-0">My Listings</h5>
        <Link to="/dashboard/add-house" className="btn-nyumba btn-sm">
          <i className="bi bi-plus-lg me-1"></i>Add House
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4"><span className="spinner-border text-primary"></span></div>
      ) : listings.length > 0 ? (
        <div className="listings-table">
          {listings.map(h => (
            <div key={h.id} className="listing-row">
              <div className="listing-thumb">
                {h.cover_image ? <img src={h.cover_image} alt="" /> : <i className="bi bi-house fs-3"></i>}
              </div>
              <div className="listing-info flex-grow-1">
                <div className="fw-semibold">{h.title}</div>
                <div className="text-muted small"><i className="bi bi-geo-alt me-1"></i>{h.address}</div>
                <div className="small">
                  <span className="me-3">KES {Number(h.rent).toLocaleString()}/mo</span>
                  <span>{h.category?.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="listing-actions">
                <span className={`status-pill status-${h.status} mb-1`}>{h.status}</span>
                <div className="d-flex gap-1 mt-1">
                  <Link to={`/houses/${h.id}`} className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-eye"></i>
                  </Link>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/dashboard/edit-house/${h.id}`)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(h.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state text-center py-5">
          <i className="bi bi-house-add fs-1 d-block mb-3"></i>
          <h5>No listings yet</h5>
          <Link to="/dashboard/add-house" className="btn-nyumba">Add Your First House</Link>
        </div>
      )}
    </div>
  );
}

// ── ADD HOUSE ──────────────────────────────────────
export function AddHousePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'bedsitter', location: 'nairobi',
    address: '', rent: '', deposit: '', electricity: 'token', floor_number: 0,
    has_parking: false, has_shower: false, has_balcony: false, has_tiles: false,
    has_wifi: false, has_water: true, has_security: false, interior_color: '',
    bedrooms: 1, bathrooms: 1
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [createdId, setCreatedId] = useState(null);
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const house = await housesAPI.create(form);
      setCreatedId(house.id);
      setStep(2);
    } catch (err) {
      setErrors(err.data || {});
    } finally {
      setLoading(false);
    }
  };

  const handleMedia = async () => {
    setLoading(true);
    try {
      if (images.length > 0) {
        const fd = new FormData();
        images.forEach(img => fd.append('images', img));
        await housesAPI.uploadImages(createdId, fd);
      }
      if (video) {
        const fd = new FormData();
        fd.append('video', video);
        await housesAPI.uploadVideo(createdId, fd);
      }
      navigate('/dashboard/listings');
    } catch {
      alert('House created! Media upload had an issue. You can add media later.');
      navigate('/dashboard/listings');
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });
  const check = (key) => ({ checked: form[key], onChange: e => setForm({ ...form, [key]: e.target.checked }) });

  return (
    <div className="dashboard-page">
      <h5 className="mb-3">{step === 1 ? 'Add New House' : 'Upload Photos & Video'}</h5>
      <div className="steps-row mb-4">
        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className="step-line"></div>
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleCreate} className="add-house-form">
          <div className="form-section">
            <h6>Basic Info</h6>
            <div className="mb-3">
              <label className="form-label">Title *</label>
              <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} placeholder="e.g. Modern Bedsitter in Rongai" {...f('title')} required />
              {errors.title && <div className="invalid-feedback">{errors.title}</div>}
            </div>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Category *</label>
                <select className="form-select" {...f('category')}>
                  {[['bedsitter','Bedsitter'],['single_room','Single Room'],['one_bedroom','1 Bedroom'],['two_bedroom','2 Bedroom'],['three_bedroom','3 Bedroom'],['studio','Studio'],['maisonette','Maisonette'],['bungalow','Bungalow'],['villa','Villa']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Location *</label>
                <select className="form-select" {...f('location')}>
                  {[['nairobi','Nairobi'],['mombasa','Mombasa'],['kisumu','Kisumu'],['rongai','Rongai'],['nakuru','Nakuru'],['westlands','Westlands'],['kilimani','Kilimani'],['kasarani','Kasarani'],['kitengela','Kitengela'],['ngong','Ngong'],['karen','Karen'],['ruaka','Ruaka']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="form-label">Full Address *</label>
              <input className="form-control" placeholder="e.g. Rongai Town, near Equity Bank" {...f('address')} required />
            </div>
            <div className="mt-3">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows="4" placeholder="Describe the house, surroundings, nearby amenities..." {...f('description')} required></textarea>
            </div>
          </div>

          <div className="form-section">
            <h6>Pricing</h6>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Monthly Rent (KES) *</label>
                <input type="number" className={`form-control ${errors.rent ? 'is-invalid' : ''}`} placeholder="e.g. 8000" {...f('rent')} required />
                {errors.rent && <div className="invalid-feedback">{errors.rent}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label">Deposit (KES) *</label>
                <input type="number" className="form-control" placeholder="e.g. 8000" {...f('deposit')} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Electricity Payment</label>
                <select className="form-select" {...f('electricity')}>
                  <option value="token">Token (Prepaid)</option>
                  <option value="fixed">Fixed Monthly</option>
                  <option value="included">Included in Rent</option>
                  <option value="shared">Shared Meter</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h6>Details</h6>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Bedrooms</label>
                <input type="number" min="0" className="form-control" {...f('bedrooms')} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Bathrooms</label>
                <input type="number" min="0" className="form-control" {...f('bathrooms')} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Floor Number</label>
                <input type="number" min="0" className="form-control" {...f('floor_number')} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Interior Color</label>
                <input className="form-control" placeholder="e.g. White, Cream" {...f('interior_color')} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h6>Amenities</h6>
            <div className="amenities-checks">
              {[['has_parking','Parking','bi-car-front'],['has_shower','Shower','bi-droplet'],['has_balcony','Balcony','bi-building'],['has_tiles','Tiles','bi-grid-3x3'],['has_wifi','WiFi','bi-wifi'],['has_water','Water Supply','bi-water'],['has_security','Security','bi-shield-check']].map(([k,l,ic]) => (
                <label key={k} className="amenity-check">
                  <input type="checkbox" {...check(k)} />
                  <i className={`bi ${ic} me-1`}></i>{l}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-nyumba" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Continue to Media Upload
          </button>
        </form>
      ) : (
        <div className="media-upload-step">
          <div className="mb-4">
            <label className="form-label">Photos (you can upload multiple)</label>
            <div className="upload-area" onClick={() => document.getElementById('img-upload').click()}>
              <i className="bi bi-images fs-2 d-block mb-2"></i>
              <span>Click to upload photos</span>
              <input id="img-upload" type="file" multiple accept="image/*" className="d-none"
                onChange={e => setImages([...e.target.files])} />
            </div>
            {images.length > 0 && (
              <div className="preview-thumbs">
                {Array.from(images).map((f, i) => (
                  <img key={i} src={URL.createObjectURL(f)} alt="" className="preview-thumb" />
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="form-label">Video Tour (optional)</label>
            <div className="upload-area" onClick={() => document.getElementById('vid-upload').click()}>
              <i className="bi bi-camera-video fs-2 d-block mb-2"></i>
              <span>{video ? video.name : 'Click to upload video'}</span>
              <input id="vid-upload" type="file" accept="video/*" className="d-none"
                onChange={e => setVideo(e.target.files[0])} />
            </div>
          </div>

          <div className="d-flex gap-2">
            <button className="btn-nyumba" onClick={handleMedia} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {images.length > 0 || video ? 'Upload & Finish' : 'Skip & Finish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CHATS ──────────────────────────────────────
export function ChatsPage() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chatAPI.landlordChats()
      .then(d => setRooms(d.results || d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openRoom = async (room) => {
    setActiveRoom(room);
    await chatAPI.markRead(room.id).catch(() => {});
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeRoom) return;
    try {
      const msg = await chatAPI.sendMessage(activeRoom.id, { content: newMsg, sender_type: 'landlord' });
      setActiveRoom(prev => ({ ...prev, messages: [...(prev.messages || []), msg] }));
      setNewMsg('');
    } catch {}
  };

  return (
    <div className="dashboard-page">
      <h5 className="mb-3">Messages</h5>
      <div className="chat-layout">
        <div className="chat-list">
          {loading ? <div className="text-center py-3"><span className="spinner-border spinner-border-sm"></span></div> :
            rooms.length > 0 ? rooms.map(r => (
              <div key={r.id} className={`chat-list-item ${activeRoom?.id === r.id ? 'active' : ''}`}
                onClick={() => openRoom(r)}>
                <div className="chat-list-avatar">{r.tenant_name[0]}</div>
                <div className="flex-grow-1">
                  <div className="fw-semibold small">{r.tenant_name}</div>
                  <div className="text-muted" style={{ fontSize: '0.73rem' }}>{r.house_title}</div>
                </div>
                {r.unread_count > 0 && <span className="unread-dot">{r.unread_count}</span>}
              </div>
            )) : <div className="text-muted small p-3">No conversations yet.</div>}
        </div>

        <div className="chat-area">
          {activeRoom ? (
            <>
              <div className="chat-area-header">
                <strong>{activeRoom.tenant_name}</strong>
                <span className="text-muted small ms-2">{activeRoom.house_title}</span>
              </div>
              <div className="chat-messages-area">
                {(activeRoom.messages || []).map(m => (
                  <div key={m.id} className={`chat-msg ${m.sender_type === 'landlord' ? 'sent' : 'received'}`}>
                    <div className="chat-bubble">{m.content}</div>
                    <small className="chat-time">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                ))}
              </div>
              <form className="chat-input-row" onSubmit={sendReply}>
                <input className="form-control form-control-sm" placeholder="Type a reply..."
                  value={newMsg} onChange={e => setNewMsg(e.target.value)} />
                <button type="submit" className="btn-send"><i className="bi bi-send-fill"></i></button>
              </form>
            </>
          ) : (
            <div className="chat-empty-area">
              <i className="bi bi-chat-dots fs-1 d-block mb-3 opacity-25"></i>
              <p className="text-muted">Select a conversation to read and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BOOKINGS ──────────────────────────────────────
export function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.landlordBookings()
      .then(d => setBookings(d.results || d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { pending: 'warning', paid: 'success', confirmed: 'primary', expired: 'secondary', cancelled: 'danger' };

  return (
    <div className="dashboard-page">
      <h5 className="mb-3">Bookings</h5>
      {loading ? <div className="text-center py-4"><span className="spinner-border text-primary"></span></div> :
        bookings.length > 0 ? (
          <div>
            {bookings.map(b => (
              <div key={b.id} className="booking-card">
                <div className="booking-info">
                  <div className="fw-semibold">{b.tenant_name}</div>
                  <div className="text-muted small">{b.house_title} · {b.house_location}</div>
                  <div className="small mt-1">
                    <i className="bi bi-telephone me-1"></i>{b.tenant_phone}
                    {b.tenant_email && <><span className="mx-2">·</span><i className="bi bi-envelope me-1"></i>{b.tenant_email}</>}
                  </div>
                  {b.reservation_expires && (
                    <div className="small text-muted mt-1">
                      Reserved until: {new Date(b.reservation_expires).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="booking-meta text-end">
                  <div className="fw-semibold">KES {Number(b.amount_paid).toLocaleString()}</div>
                  <span className={`badge bg-${statusColor[b.status] || 'secondary'}`}>{b.status}</span>
                  <div className="small text-muted mt-1">{new Date(b.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-5">
            <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-25"></i>
            <p className="text-muted">No bookings received yet.</p>
          </div>
        )}
    </div>
  );
}

// ── NOTIFICATIONS ──────────────────────────────────────
export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.list()
      .then(d => setNotifications(d.results || d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationsAPI.markAllRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const typeIcon = { booking: 'bi-calendar-check', message: 'bi-chat-dots', review: 'bi-star', payment: 'bi-cash-coin' };
  const typeColor = { booking: 'text-primary', message: 'text-info', review: 'text-warning', payment: 'text-success' };

  return (
    <div className="dashboard-page">
      <div className="page-header-row">
        <h5 className="mb-0">Notifications</h5>
        <button className="btn btn-sm btn-outline-secondary" onClick={markAllRead}>Mark all read</button>
      </div>

      {loading ? <div className="text-center py-4"><span className="spinner-border text-primary"></span></div> :
        notifications.length > 0 ? (
          <div className="notif-list">
            {notifications.map(n => (
              <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                <div className={`notif-type-icon ${typeColor[n.type]}`}>
                  <i className={`bi ${typeIcon[n.type] || 'bi-bell'}`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-semibold small">{n.title}</div>
                  <div className="text-muted small">{n.body}</div>
                  <div style={{ fontSize: '0.72rem' }} className="text-muted mt-1">
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                {!n.is_read && <span className="unread-dot-sm"></span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-5">
            <i className="bi bi-bell-slash fs-1 d-block mb-3 opacity-25"></i>
            <p className="text-muted">No notifications yet.</p>
          </div>
        )}
    </div>
  );
}