import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { applyOrganizer } from '../api/authApi';
import { requestOrganizer } from '../api/userApi';
import Icon from './Icons';

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const SRI_LANKA_PROVINCES = [
  'Western Province', 'Central Province', 'Southern Province',
  'Northern Province', 'Eastern Province', 'North Western Province',
  'North Central Province', 'Uva Province', 'Sabaragamuwa Province'
];

const BecomeOrganizerModal = ({ show, onHide }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    district: 'Colombo',
    postalCode: '',
    province: 'Western Province',
    email: '',
    phone: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill user data if already logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user, show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (user) {
        // Logged-in member requesting upgrade to Organizer
        await requestOrganizer({
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim(),
          district: formData.district,
          postalCode: formData.postalCode.trim(),
          province: formData.province,
          message: formData.message.trim()
        });
        setSuccess(true);
      } else {
        // Public visitor submitting organizer application inquiry (no password required)
        await applyOrganizer({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim(),
          district: formData.district,
          postalCode: formData.postalCode.trim(),
          province: formData.province,
          message: formData.message.trim()
        });

        setSuccess(true);
      }
    } catch (err) {
      console.error('Failed to submit organizer application', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to submit application. Please verify your contact details.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess(false);
    onHide();
  };

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: 'rgba(15, 47, 61, 0.72)',
        backdropFilter: 'blur(6px)',
        zIndex: 1080
      }}
    >
      <div 
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '840px', width: '94%', margin: '1.75rem auto' }}
      >
        <div className="modal-content rounded-4 border-0 shadow-2xl overflow-hidden bg-white">
          
          {/* Enhanced Professional Header */}
          <div
            className="text-white d-flex justify-content-between align-items-center"
            style={{
              background: 'linear-gradient(135deg, #071D27 0%, #0F2F3D 55%, #164354 100%)',
              padding: '24px 32px',
              borderTop: '3px solid #00E5FF',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(0, 229, 255, 0.12)',
                  border: '1.5px solid rgba(0, 229, 255, 0.35)'
                }}
              >
                <Icon name="user-check" size={26} color="#00E5FF" />
              </div>
              <div>
                <div 
                  className="d-inline-flex align-items-center gap-1.5 px-2.5 py-0.5 rounded-pill mb-1.5 fw-bold"
                  style={{
                    backgroundColor: 'rgba(0, 229, 255, 0.12)',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                    color: '#00E5FF',
                    fontSize: '0.68rem',
                    letterSpacing: '0.9px'
                  }}
                >
                  <Icon name="shield" size={11} color="#00E5FF" />
                  <span>OFFICIAL APPLICATION PORTAL</span>
                </div>
                <h4 className="fw-bold mb-1 text-white lh-sm" style={{ fontSize: '1.35rem', letterSpacing: '-0.3px' }}>
                  Become a Seettu Organizer
                </h4>
                <p className="text-white-50 mb-0 small" style={{ fontSize: '0.84rem', lineHeight: '1.4' }}>
                  Lead a verified savings circle in your community, workplace, or cooperative under Sri Lanka Cheetus Ordinance rules
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-link p-2 rounded-circle text-white-50 text-decoration-none border-0 ms-2 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
              onClick={handleClose}
              title="Close Application Modal"
            >
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 p-md-4.5 bg-light">
            {success ? (
              <div className="text-center py-4 px-2">
                <div
                  className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3 shadow-sm"
                  style={{ width: '64px', height: '64px', backgroundColor: '#E0F2FE', color: '#0097B2', border: '2px solid #0097B2' }}
                >
                  <Icon name="check" size={34} />
                </div>
                <h4 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.2px' }}>
                  Application Submitted Successfully!
                </h4>
                <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '520px', lineHeight: '1.6' }}>
                  Thank you for applying to become a Seettu Organizer. In accordance with The Cheetus Ordinance No. 61 of 1935, our administrative compliance team will review your contact and residential credentials.
                </p>

                <div className="p-3.5 bg-white border rounded-3 text-start small mb-4 mx-auto shadow-sm" style={{ maxWidth: '520px' }}>
                  <div className="fw-bold text-dark mb-1.5 d-flex align-items-center gap-2">
                    <Icon name="shield" size={16} color="#0097B2" />
                    <span>What Happens Next?</span>
                  </div>
                  <ul className="text-muted mb-0 ps-3 lh-base" style={{ fontSize: '0.84rem' }}>
                    <li>Our regional desk officer will verify your district and mobile contact.</li>
                    <li>You will be invited to submit your Grama Niladhari character certificate or NIC verification.</li>
                    <li>Upon admin approval, your organizer portal will be activated with circle creation capabilities.</li>
                  </ul>
                </div>

                <button
                  onClick={handleClose}
                  className="btn text-white fw-bold px-4 py-2.5 rounded-3 shadow-sm border-0"
                  style={{ backgroundColor: '#0097B2', fontSize: '0.9rem' }}
                >
                  Done & Return to Homepage
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Cheetus Ordinance Compliance Alert */}
                <div 
                  className="alert border-0 shadow-xs rounded-3 p-3 mb-3.5 d-flex align-items-start gap-2.5" 
                  style={{ backgroundColor: '#E0F7FA', color: '#0F2F3D' }}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <Icon name="shield" size={18} color="#0097B2" />
                  </div>
                  <div style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                    <strong>Cheetus Ordinance Compliance Rule:</strong> All applicants register as prospective organizers without upfront commitments. Once your identity is administratively verified, circle creation and management privileges are unlocked.
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                    <Icon name="alert-circle" size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Inputs Grid matching reference design */}
                <div className="row g-3">
                  {/* Section Title */}
                  <div className="col-12 mb-0">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5" style={{ fontSize: '0.88rem' }}>
                      <span className="badge rounded-circle p-1" style={{ backgroundColor: '#0097B2', color: '#fff', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</span>
                      <span>Personal & Contact Information</span>
                    </h6>
                  </div>

                  {/* Full Name */}
                  <div className="col-12">
                    <label className="form-label small text-muted mb-1 fw-semibold">Full Legal Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      className="form-control rounded-2 py-2"
                      placeholder="e.g. Kamala Perera / Sivalingam Mohan"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* E-Mail & Mobile Number */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1 fw-semibold">E-Mail Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control rounded-2 py-2"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={!!user}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1 fw-semibold">Mobile Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control rounded-2 py-2"
                      placeholder="e.g. 0771234567"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Section Title */}
                  <div className="col-12 mt-2 mb-0">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5" style={{ fontSize: '0.88rem' }}>
                      <span className="badge rounded-circle p-1" style={{ backgroundColor: '#0097B2', color: '#fff', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</span>
                      <span>Residential & District Details (Sri Lanka)</span>
                    </h6>
                  </div>

                  {/* Address Line 1 */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1 fw-semibold">Address Line 1 *</label>
                    <input
                      type="text"
                      name="addressLine1"
                      className="form-control rounded-2 py-2"
                      placeholder="Street address or village name"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="col-md-6">
                    <label className="form-label small text-muted mb-1 fw-semibold">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      className="form-control rounded-2 py-2"
                      placeholder="Apartment, suite, unit, or landmark"
                      value={formData.addressLine2}
                      onChange={handleChange}
                    />
                  </div>

                  {/* District & Pincode / Postal Code */}
                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1 fw-semibold">District *</label>
                    <select
                      name="district"
                      className="form-select rounded-2 py-2"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1 fw-semibold">Postal / Pin Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="form-control rounded-2 py-2"
                      placeholder="e.g. 00300"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small text-muted mb-1 fw-semibold">Province *</label>
                    <select
                      name="province"
                      className="form-select rounded-2 py-2"
                      value={formData.province}
                      onChange={handleChange}
                      required
                    >
                      {SRI_LANKA_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Title */}
                  <div className="col-12 mt-2 mb-0">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5" style={{ fontSize: '0.88rem' }}>
                      <span className="badge rounded-circle p-1" style={{ backgroundColor: '#0097B2', color: '#fff', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>3</span>
                      <span>Proposed Circle Details</span>
                    </h6>
                  </div>

                  {/* Message / Motivation */}
                  <div className="col-12">
                    <label className="form-label small text-muted mb-1 fw-semibold">Message & Savings Plan (Optional)</label>
                    <textarea
                      name="message"
                      rows="3"
                      className="form-control rounded-2"
                      placeholder="Briefly describe your planned circle (e.g., monthly contribution amount, expected members, community/workplace group)..."
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-4 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn w-100 fw-bold py-2.5 rounded-3 shadow text-white border-0 d-flex align-items-center justify-content-center gap-2"
                    style={{
                      backgroundColor: '#0097B2',
                      fontSize: '0.94rem',
                      letterSpacing: '0.4px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0F2F3D'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0097B2'}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>SUBMITTING APPLICATION...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="send" size={17} color="#FFFFFF" />
                        <span>SUBMIT APPLICATION FOR VERIFICATION</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeOrganizerModal;
