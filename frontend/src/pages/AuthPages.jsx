import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(form);
      if (data.user.role === 'landlord') navigate('/dashboard');
      else navigate('/houses');
    } catch (err) {
      setError(err.data?.non_field_errors?.[0] || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-brand"><i className="bi bi-house-heart-fill me-2"></i>Nyumba</Link>
          <h4>Welcome Back</h4>
          <p className="text-muted">Sign in to your account</p>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <div className="input-icon-wrap">
              <i className="bi bi-person input-icon"></i>
              <input className="form-control ps-5" placeholder="Enter your username"
                value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="input-icon-wrap">
              <i className="bi bi-lock input-icon"></i>
              <input type="password" className="form-control ps-5" placeholder="Enter your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn-nyumba w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Sign In
          </button>
        </form>

        <div className="auth-footer mt-3 text-center">
          <span className="text-muted">Don't have an account? </span>
          <Link to="/register">Create one</Link>
        </div>
        <div className="text-center mt-2">
          <Link to="/houses" className="text-muted small">
            <i className="bi bi-arrow-left me-1"></i>Browse houses without account
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', confirm_password: '', role: 'landlord'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const data = await register(form);
      if (data.user.role === 'landlord') navigate('/dashboard');
      else navigate('/houses');
    } catch (err) {
      setErrors(err.data || { detail: 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input type={type} className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
        placeholder={placeholder}
        value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
      {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <Link to="/" className="auth-brand"><i className="bi bi-house-heart-fill me-2"></i>Nyumba</Link>
          <h4>Create Account</h4>
          <p className="text-muted">List your house or start looking for a home</p>
        </div>

        {errors.detail && <div className="alert alert-danger py-2">{errors.detail}</div>}

        <div className="role-toggle mb-4">
          <button className={`role-btn ${form.role === 'landlord' ? 'active' : ''}`}
            type="button" onClick={() => setForm({ ...form, role: 'landlord' })}>
            <i className="bi bi-key me-2"></i>I'm a Landlord
          </button>
          <button className={`role-btn ${form.role === 'tenant' ? 'active' : ''}`}
            type="button" onClick={() => setForm({ ...form, role: 'tenant' })}>
            <i className="bi bi-search me-2"></i>I'm a Tenant
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">{field('first_name', 'First Name', 'text', 'John')}</div>
            <div className="col-md-6">{field('last_name', 'Last Name', 'text', 'Doe')}</div>
          </div>
          {field('username', 'Username *', 'text', 'johndoe')}
          {field('email', 'Email *', 'email', 'john@example.com')}
          {field('phone', 'Phone Number', 'tel', '0712345678')}
          <div className="row g-3">
            <div className="col-md-6">{field('password', 'Password *', 'password', 'Min. 8 characters')}</div>
            <div className="col-md-6">{field('confirm_password', 'Confirm Password *', 'password', 'Repeat password')}</div>
          </div>
          <button type="submit" className="btn-nyumba w-100 mt-2" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Create Account
          </button>
        </form>

        <div className="auth-footer mt-3 text-center">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}