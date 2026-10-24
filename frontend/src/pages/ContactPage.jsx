import React, { useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Icon from '../components/Icons';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('https://formsubmit.co/ajax/seetumanager@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          _subject: `New SeettuManager Inquiry [${formData.subject}] from ${formData.name}`,
          _template: 'table',
          _captcha: 'false'
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('FormSubmit error:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-light min-vh-100 pb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* Top Header Banner with Project Theme */}
      <div 
        className="text-white py-5 position-relative overflow-hidden" 
        style={{ 
          background: 'linear-gradient(135deg, #0F2F3D 0%, #003847 60%, #00222B 100%)',
          borderBottom: '4px solid #0097B2' 
        }}
      >
        <div className="container py-3 position-relative" style={{ zIndex: 2 }}>
          
          {/* Breadcrumb Navigation */}
          <div className="d-flex align-items-center gap-2 small text-white-50 mb-3">
            <Link to="/" className="text-white-50 text-decoration-none hover-white">Home</Link>
            <span>/</span>
            <span className="text-white fw-semibold">Contact Us</span>
          </div>

          <div className="row align-items-center justify-content-between g-4">
            <div className="col-lg-8">
              {/* Cyan Accent Bar */}
              <div style={{ width: '42px', height: '4px', backgroundColor: '#00E5FF', marginBottom: '14px', borderRadius: '2px' }} />
              
              <span className="badge px-3 py-1.5 rounded-pill fw-bold text-white mb-2" style={{ backgroundColor: '#0097B2', fontSize: '0.75rem' }}>
                DIRECT SUPPORT & HEADQUARTERS
              </span>

              <h1 className="fw-black display-6 text-white mb-2" style={{ letterSpacing: '-0.5px' }}>
                Contact & Support Desk
              </h1>
              
              <p className="text-white-50 lead mb-0" style={{ fontSize: '1.05rem', maxWidth: '720px' }}>
                Have questions about organizing a Seettu group, verifying contribution slips, or statutory dispute resolution? Our Colombo support team is ready to assist you.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <div 
                className="p-3 rounded-3 text-start d-inline-block text-white border"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                <div className="fw-bold small mb-1" style={{ color: '#00E5FF' }}>Direct Helplines</div>
                <div className="small text-white-50">+94 75 297 5632 / 4040</div>
                <div className="small text-white-50">seetumanager@gmail.com</div>
                <div className="small fw-semibold text-white mt-1">Mon – Sat (8:30 AM – 6:00 PM IST)</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="container py-5">
        <div className="row g-4 justify-content-center">
          
          {/* Left Column: Contact Cards */}
          <div className="col-lg-5">
            <div className="d-flex flex-column gap-3">
              
              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0097B2', width: '42px', height: '42px' }}>
                    <Icon name="phone" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Telephone Helplines</h6>
                    <small className="text-muted">Dedicated voice and WhatsApp support</small>
                  </div>
                </div>
                <div className="ps-5 pt-1">
                  <a href="tel:+94752975632" className="d-block fw-bold text-decoration-none mb-1" style={{ color: '#003847', fontSize: '1rem' }}>
                    +94 75 297 5632
                  </a>
                  <a href="tel:+94752974040" className="d-block fw-bold text-decoration-none" style={{ color: '#003847', fontSize: '1rem' }}>
                    +94 75 297 4040
                  </a>
                  <span className="text-muted small d-block mt-1">Monday through Saturday (8:30 AM – 6:00 PM)</span>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#003847', width: '42px', height: '42px' }}>
                    <Icon name="mail" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Email Correspondence</h6>
                    <small className="text-muted">Formal compliance and technical support</small>
                  </div>
                </div>
                <div className="ps-5 pt-1">
                  <a href="mailto:seetumanager@gmail.com" className="fw-bold text-decoration-none d-block" style={{ color: '#0097B2', fontSize: '0.98rem' }}>
                    seetumanager@gmail.com
                  </a>
                  <span className="text-muted small d-block mt-1">Average response time: within 4 business hours</span>
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-3 text-white d-flex align-items-center justify-content-center" style={{ backgroundColor: '#FFB020', width: '42px', height: '42px' }}>
                    <Icon name="shield" size={20} color="#0F2F3D" />
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Platform Headquarters</h6>
                    <small className="text-muted">Western Province Central Operations</small>
                  </div>
                </div>
                <div className="ps-5 pt-1">
                  <div className="text-secondary small fw-medium">
                    SeettuManager Digital Systems<br />
                    Colombo, Western Province<br />
                    Democratic Socialist Republic of Sri Lanka
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-3 p-4 p-md-5 bg-white">
              
              <div className="border-bottom pb-3 mb-4">
                <h4 className="fw-bold text-dark mb-1" style={{ color: '#003847' }}>
                  Send an Inquiry or Dispute Notice
                </h4>
                <p className="text-secondary small mb-0">
                  Fill in your details below and our team will get in touch with you promptly.
                </p>
              </div>

              {submitted ? (
                <div className="alert alert-success border-0 p-4 rounded-3 text-center my-3" style={{ backgroundColor: '#E8F5E9', color: '#1B5E20' }}>
                  <Icon name="check" size={32} className="mb-2" />
                  <h5 className="fw-bold mb-1">Message Sent Successfully!</h5>
                  <p className="small mb-3">Thank you for reaching out. A representative will contact you via phone or email shortly.</p>
                  <button 
                    type="button" 
                    onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '', email: '', subject: 'General Inquiry', message: '' }); }}
                    className="btn btn-sm btn-outline-success px-4 fw-semibold"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        className="form-control bg-light"
                        placeholder="e.g. Kasun Perera"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Phone Number (Sri Lanka) *</label>
                      <input 
                        type="tel" 
                        required
                        className="form-control bg-light"
                        placeholder="e.g. 077 123 4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Email Address *</label>
                      <input 
                        type="email" 
                        required
                        className="form-control bg-light"
                        placeholder="e.g. kasun@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-dark">Inquiry Subject *</label>
                      <select 
                        className="form-select bg-light"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      >
                        <option value="General Inquiry">General Platform Inquiry</option>
                        <option value="Organizer Assistance">Become a Seettu Organizer</option>
                        <option value="Payment Verification">Payment Slip Verification Issue</option>
                        <option value="Dispute Escalation">Dispute Escalation (DSP)</option>
                        <option value="Legal Compliance">Statutory Compliance (Chapter 190)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark">Your Message / Case Summary *</label>
                      <textarea 
                        rows={4}
                        required
                        className="form-control bg-light"
                        placeholder="Provide details of your question, group reference, or issue..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <div className="col-12 mt-4">
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="btn fw-bold text-white px-4 py-2 w-100 shadow-sm"
                        style={{ backgroundColor: '#0097B2', borderRadius: '8px' }}
                      >
                        {submitting ? 'Sending Message...' : 'Submit Message'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="mt-5 pt-5 pb-4 text-white" style={{ backgroundColor: '#0B232E' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <p className="text-white-50 small mb-0">
              © 2026 SeettuManager. All rights reserved. • Sri Lanka Digital Rotating Savings Platform
            </p>
            <button 
              onClick={scrollToTop} 
              className="btn btn-outline-light btn-sm rounded-circle d-inline-flex align-items-center justify-content-center"
              style={{ width: '34px', height: '34px', backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
              title="Back to Top"
            >
              <Icon name="chevron-up" size={16} />
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ContactPage;
