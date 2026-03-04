import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import HousesPage from './pages/HousesPage';
import HouseDetailPage from './pages/HouseDetailPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import {
  DashboardPage, MyListingsPage, AddHousePage,
  ChatsPage, BookingsPage, NotificationsPage
} from './pages/DashboardPages';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-5"><span className="spinner-border text-primary"></span></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuth = ['/login', '/register'].includes(location.pathname);

  if (isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <div className={`app-shell ${isDashboard ? 'has-sidebar' : ''}`}>
      <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

      {isDashboard && (
        <>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="sidebar-desktop d-none d-lg-block">
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
        </>
      )}

      <main className={`main-content ${isDashboard ? 'main-with-sidebar' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/houses" element={<HousesPage />} />
          <Route path="/houses/:id" element={<HouseDetailPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/add-house" element={<ProtectedRoute><AddHousePage /></ProtectedRoute>} />
          <Route path="/dashboard/chats" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
          <Route path="/dashboard/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isDashboard && (
        <footer className="nyumba-footer">
          <div className="container-nyumba">
            <div className="footer-grid">
              <div>
                <div className="footer-brand"><i className="bi bi-house-heart-fill me-2"></i>Nyumba</div>
                <p className="footer-desc">Kenya's fastest way to find a house. No account needed to browse.</p>
              </div>
              <div>
                <h6>Quick Links</h6>
                <a href="/houses">Browse Houses</a>
                <a href="/houses?location=nairobi">Nairobi</a>
                <a href="/houses?location=mombasa">Mombasa</a>
                <a href="/houses?location=kisumu">Kisumu</a>
              </div>
              <div>
                <h6>House Types</h6>
                <a href="/houses?category=bedsitter">Bedsitter</a>
                <a href="/houses?category=one_bedroom">1 Bedroom</a>
                <a href="/houses?category=studio">Studio</a>
                <a href="/houses?category=maisonette">Maisonette</a>
              </div>
              <div>
                <h6>Landlords</h6>
                <a href="/register">List Your House</a>
                <a href="/login">Landlord Login</a>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© 2024 Nyumba. Made in Kenya 🇰🇪</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}