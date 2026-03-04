import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';

export default function ChatWidget({ house, onClose }) {
  const [step, setStep] = useState('form'); // form | chat
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState({ tenant_name: '', tenant_email: '', tenant_phone: '' });
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval;
    if (room) {
      interval = setInterval(async () => {
        try {
          const r = await chatAPI.getRoom(room.id);
          setMessages(r.messages || []);
        } catch {}
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [room]);

  const startChat = async (e) => {
    e.preventDefault();
    if (!tenant.tenant_name.trim()) return;
    setLoading(true);
    try {
      const r = await chatAPI.createRoom({ ...tenant, house: house.id });
      setRoom(r);
      setMessages(r.messages || []);
      setStep('chat');
    } catch (err) {
      alert('Could not start chat. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !room) return;
    const content = newMsg;
    setNewMsg('');
    try {
      const msg = await chatAPI.sendMessage(room.id, { content, sender_type: 'tenant' });
      setMessages(prev => [...prev, msg]);
    } catch {}
  };

  return (
    <div className="chat-widget">
      <div className="chat-header">
        <div className="chat-header-info">
          <i className="bi bi-chat-dots-fill me-2"></i>
          <div>
            <div className="fw-semibold">Chat with Landlord</div>
            <small className="opacity-75">{house.title}</small>
          </div>
        </div>
        <button className="chat-close" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {step === 'form' ? (
        <form className="chat-form" onSubmit={startChat}>
          <p className="chat-intro">Enter your details to start chatting with the landlord.</p>
          <div className="mb-3">
            <label className="form-label">Your Name *</label>
            <input
              className="form-control form-control-sm"
              placeholder="John Doe"
              value={tenant.tenant_name}
              onChange={e => setTenant({ ...tenant, tenant_name: e.target.value })}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control form-control-sm"
              placeholder="john@email.com"
              value={tenant.tenant_email}
              onChange={e => setTenant({ ...tenant, tenant_email: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input
              className="form-control form-control-sm"
              placeholder="0712345678"
              value={tenant.tenant_phone}
              onChange={e => setTenant({ ...tenant, tenant_phone: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-nyumba w-100" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Start Chat
          </button>
        </form>
      ) : (
        <div className="chat-room">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">Say hello to the landlord!</div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg ${msg.sender_type === 'tenant' ? 'sent' : 'received'}`}>
                <div className="chat-bubble">{msg.content}</div>
                <small className="chat-time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </small>
              </div>
            ))}
            <div ref={messagesEnd}></div>
          </div>
          <form className="chat-input-row" onSubmit={sendMessage}>
            <input
              className="form-control form-control-sm"
              placeholder="Type a message..."
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
            />
            <button type="submit" className="btn-send">
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}