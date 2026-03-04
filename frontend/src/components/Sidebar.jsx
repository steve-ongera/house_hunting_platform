import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isLandlord } = useAuth();

  const links = isLandlord ? [
    { to: '/dashboard', icon: 'bi-grid-fill', label: 'Dashboard', end: true },
    { to: '/dashboard/listings', icon: 'bi-house-fill', label: 'My Listings' },
    { to: '/dashboard/add-house', icon: 'bi-plus-circle-fill', label: 'Add House' },
    { to: '/dashboard/chats', icon: 'bi-chat-dots-fill', label: 'Messages' },
    { to: '/dashboard/bookings', icon: 'bi-calendar-check-fill', label: 'Bookings' },
    { to: '/dashboard/notifications', icon: 'bi-bell-fill', label: 'Notifications' },
    { to: '/dashboard/profile', icon: 'bi-person-fill', label: 'Profile' },
  ] : [
    { to: '/houses', icon: 'bi-search', label: 'Browse Houses', end: true },
    { to: '/houses?category=bedsitter', icon: 'bi-door-open', label: 'Bedsitters' },
    { to: '/houses?category=one_bedroom', icon: 'bi-house', label: '1 Bedroom' },
    { to: '/houses?location=nairobi', icon: 'bi-geo-alt', label: 'Nairobi' },
    { to: '/houses?location=mombasa', icon: 'bi-geo-alt', label: 'Mombasa' },
    { to: '/houses?location=kisumu', icon: 'bi-geo-alt', label: 'Kisumu' },
    { to: '/houses?location=rongai', icon: 'bi-geo-alt', label: 'Rongai' },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-brand"><i className="bi bi-house-heart-fill me-2"></i>Nyumba</span>
          <button className="sidebar-close d-lg-none" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user.avatar ? <img src={user.avatar} alt="" /> : <span>{user.first_name?.[0] || user.username[0]}</span>}
            </div>
            <div>
              <div className="sidebar-username">{user.first_name || user.username}</div>
              <div className="sidebar-role">{isLandlord ? 'Landlord' : 'Tenant'}</div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <i className={`bi ${link.icon} me-3`}></i>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-tagline">
            <i className="bi bi-shield-check me-2 text-success"></i>
            <small>Safe & Verified Listings</small>
          </div>
        </div>
      </aside>
    </>
  );
}