import { useState } from 'react';
import { bookingsAPI } from '../services/api';

export default function BookingModal({ house, onClose, onSuccess }) {
  const [step, setStep] = useState('form'); // form | confirm | mpesa | success
  const [booking, setBooking] = useState(null);
  const [form, setForm] = useState({ tenant_name: '', tenant_email: '', tenant_phone: '', notes: '' });
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDev = import.meta.env.DEV;

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await bookingsAPI.create({ ...form, house: house.id });
      setBooking(data);
      if (isDev) {
        setStep('success');
      } else {
        setStep('mpesa');
        setMpesaPhone(form.tenant_phone);
      }
    } catch (err) {
      setError(err.data?.detail || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMpesa = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await bookingsAPI.initiateMpesa({ booking_id: booking.booking_id, phone_number: mpesaPhone });
      setStep('success');
    } catch (err) {
      setError(err.data?.detail || 'M-Pesa payment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header-nyumba">
          <div>
            <h5 className="mb-0">Book This House</h5>
            <small className="opacity-75">{house.title}</small>
          </div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleBook} className="modal-body-nyumba">
            <div className="booking-summary mb-4">
              <div className="d-flex justify-content-between mb-1">
                <span>Monthly Rent</span>
                <strong>KES {Number(house.rent).toLocaleString()}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Deposit Required</span>
                <strong className="text-success">KES {Number(house.deposit).toLocaleString()}</strong>
              </div>
              <div className="deposit-note">
                <i className="bi bi-info-circle me-1"></i>
                Pay the deposit to reserve this house for 3 days.
              </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="mb-3">
              <label className="form-label">Full Name *</label>
              <input className="form-control form-control-sm" required placeholder="Your full name"
                value={form.tenant_name} onChange={e => setForm({ ...form, tenant_name: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Email *</label>
              <input type="email" className="form-control form-control-sm" required placeholder="your@email.com"
                value={form.tenant_email} onChange={e => setForm({ ...form, tenant_email: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone (M-Pesa) *</label>
              <input className="form-control form-control-sm" required placeholder="0712345678"
                value={form.tenant_phone} onChange={e => setForm({ ...form, tenant_phone: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Notes (optional)</label>
              <textarea className="form-control form-control-sm" rows="2" placeholder="Move-in date, questions..."
                value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}></textarea>
            </div>

            <button type="submit" className="btn-nyumba w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-lock-fill me-2"></i>}
              {isDev ? 'Book Now (Demo)' : 'Proceed to Pay Deposit'}
            </button>
          </form>
        )}

        {step === 'mpesa' && (
          <form onSubmit={handleMpesa} className="modal-body-nyumba">
            <div className="text-center mb-4">
              <div className="mpesa-icon"><i className="bi bi-phone-fill"></i></div>
              <h6>M-Pesa Payment</h6>
              <p className="text-muted small">You'll receive a push notification on your phone to confirm KES {Number(house.deposit).toLocaleString()}</p>
            </div>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <div className="mb-3">
              <label className="form-label">M-Pesa Number</label>
              <input className="form-control form-control-sm" required placeholder="0712345678"
                value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} />
            </div>
            <button type="submit" className="btn-mpesa w-100" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              Send STK Push – KES {Number(house.deposit).toLocaleString()}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="modal-body-nyumba text-center">
            <div className="success-icon"><i className="bi bi-check-circle-fill"></i></div>
            <h5>House Reserved!</h5>
            <p className="text-muted">
              {booking?.reservation_expires
                ? `This house is reserved for you until ${new Date(booking.reservation_expires).toLocaleDateString()}.`
                : 'Your booking was confirmed. The landlord will contact you soon.'}
            </p>
            <div className="booking-ref">
              <small>Booking Ref: <strong>{booking?.booking_id?.slice(0, 8).toUpperCase()}</strong></small>
            </div>
            <button className="btn-nyumba mt-3" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}