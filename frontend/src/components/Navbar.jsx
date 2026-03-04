import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

export default function Navbar({ onSidebarToggle }) {
  const { user, logout, isLandlord } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);

  useEffect(() => {
    if (isLandlord) {
      notificationsAPI.unreadCount()
        .then(d => setUnread(d.count))
        .catch(() => {});
      const interval = setInterval(() => {
        notificationsAPI.unreadCount().then(d => setUnread(d.count)).catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isLandlord]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDropOpen(false);
  };

  return (
    <nav className="nyumba-navbar">
      <div className="nav-inner">
        <div className="nav-left">
          <button className="sidebar-toggle d-lg-none" onClick={onSidebarToggle}>
            <i className="bi bi-list fs-4"></i>
          </button>
          <Link to="/" className="nav-brand">
            <i className="bi bi-house-heart-fill me-2"></i>
            <span>Nyumba</span>
          </Link>
        </div>

        <div className="nav-links d-none d-lg-flex">
          <Link to="/houses" className={`nav-link ${location.pathname === '/houses' ? 'active' : ''}`}>
            Browse Houses
          </Link>
          <Link to="/houses?location=nairobi" className="nav-link">Nairobi</Link>
          <Link to="/houses?location=mombasa" className="nav-link">Mombasa</Link>
          <Link to="/houses?location=kisumu" className="nav-link">Kisumu</Link>
          <Link to="/houses?location=rongai" className="nav-link">Rongai</Link>
        </div>

        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              {isLandlord && (
                <Link to="/dashboard/notifications" className="notif-btn">
                  <i className="bi bi-bell-fill"></i>
                  {unread > 0 && <span className="notif-badge">{unread}</span>}
                </Link>
              )}
              <div className="user-dropdown" onClick={() => setDropOpen(!dropOpen)}>
                <div className="user-avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.username} />
                    : <span>{user.first_name?.[0] || user.username[0]}</span>}
                </div>
                <span className="d-none d-md-inline">{user.first_name || user.username}</span>
                <i className="bi bi-chevron-down ms-1"></i>
                {dropOpen && (
                  <div className="dropdown-menu-custom">
                    {isLandlord ? (
                      <>
                        <Link to="/dashboard" onClick={() => setDropOpen(false)}><i className="bi bi-grid me-2"></i>Dashboard</Link>
                        <Link to="/dashboard/listings" onClick={() => setDropOpen(false)}><i className="bi bi-house me-2"></i>My Listings</Link>
                        <Link to="/dashboard/chats" onClick={() => setDropOpen(false)}><i className="bi bi-chat me-2"></i>Messages</Link>
                        <Link to="/dashboard/bookings" onClick={() => setDropOpen(false)}><i className="bi bi-calendar-check me-2"></i>Bookings</Link>
                      </>
                    ) : (
                      <Link to="/profile" onClick={() => setDropOpen(false)}><i className="bi bi-person me-2"></i>Profile</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn-ghost">Login</Link>
              <Link to="/register" className="btn-primary-nav">List Your House</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}