import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { applyOrganizer, getOrganizerStatus, activateOrganizer } from '../api/authApi';
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
  const { user, login } = useAuth();

  // Active view: 'APPLY' or 'TRACK'
  const [activeTab, setActiveTab] = useState('APPLY');

  // Application Form State
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
  const [submittedApplication, setSubmittedApplication] = useState(null);

  // Status Tracking State
  const [trackQuery, setTrackQuery] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  // Activation State (for approved applicants)
  const [activationPassword, setActivationPassword] = useState('');
  const [activationConfirm, setActivationConfirm] = useState('');
  const [activationLoading, setActivationLoading] = useState(false);
  const [activationError, setActivationError] = useState('');

  // Pre-fill user data if already logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
      setTrackQuery(user.email || user.phone || '');
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
        setSubmittedApplication({
          applicationId: `SEETTU-ORG-${String(user.id).padStart(5, '0')}`,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          district: formData.district,
          status: 'PENDING'
        });
      } else {
        // Public visitor submitting organizer application inquiry (no password required)
        const res = await applyOrganizer({
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

        const appData = res?.data || res;
        setSubmittedApplication(appData);
        setTrackQuery(formData.email || formData.phone);
      }
    } catch (err) {
      console.error('Failed to submit organizer application', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to submit application. Please verify your contact details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e?.preventDefault();
    if (!trackQuery.trim()) return;
    setTrackError('');
    setTrackResult(null);
    setTrackLoading(true);

    try {
      const res = await getOrganizerStatus(trackQuery.trim());
      const data = res?.data || res;
      setTrackResult(data);
    } catch (err) {
      console.error('Failed to look up application status', err);
      setTrackError(err?.response?.data?.message || err?.message || 'No application found with these details.');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleActivateAccount = async (e) => {
    e.preventDefault();
    setActivationError('');

    if (!activationPassword || activationPassword.length < 6) {
      setActivationError('Password must be at least 6 characters long.');
      return;
    }
    if (activationPassword !== activationConfirm) {
      setActivationError('Passwords do not match.');
      return;
    }

    setActivationLoading(true);
    try {
      const queryParam = trackResult?.email || trackResult?.phone || trackQuery.trim();
      const res = await activateOrganizer({
        query: queryParam,
        password: activationPassword
      });

      const authData = res?.data || res;
      if (authData?.token) {
        login(authData);
        onHide();
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Failed to activate organizer account', err);
      setActivationError(err?.response?.data?.message || err?.message || 'Failed to activate account.');
    } finally {
      setActivationLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSubmittedApplication(null);
    setTrackResult(null);
    setTrackError('');
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
        style={{ maxWidth: '860px', width: '94%', margin: '1.75rem auto' }}
      >
        <div className="modal-content rounded-4 border-0 shadow-2xl overflow-hidden bg-white">
          
          {/* Enhanced Professional Header with Tabs */}
          <div
            className="text-white"
            style={{
              background: 'linear-gradient(135deg, #071D27 0%, #0F2F3D 55%, #164354 100%)',
              padding: '24px 32px 14px 32px',
              borderTop: '3px solid #00E5FF',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                  style={{
                    width: '46px',
                    height: '46px',
                    backgroundColor: 'rgba(0, 229, 255, 0.12)',
                    border: '1.5px solid rgba(0, 229, 255, 0.35)'
                  }}
                >
                  <Icon name="user-check" size={24} color="#00E5FF" />
                </div>
                <div>
                  <div 
                    className="d-inline-flex align-items-center gap-1.5 px-2.5 py-0.5 rounded-pill mb-1 fw-bold"
                    style={{
                      backgroundColor: 'rgba(0, 229, 255, 0.12)',
                      border: '1px solid rgba(0, 229, 255, 0.25)',
                      color: '#00E5FF',
                      fontSize: '0.68rem',
                      letterSpacing: '0.9px'
                    }}
                  >
                    <Icon name="shield" size={11} color="#00E5FF" />
                    <span>ORGANIZER ONBOARDING & STATUS DESK</span>
                  </div>
                  <h4 className="fw-bold mb-0 text-white lh-sm" style={{ fontSize: '1.3rem', letterSpacing: '-0.3px' }}>
                    Become a Seettu Organizer
                  </h4>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-link p-2 rounded-circle text-white-50 text-decoration-none border-0 d-flex align-items-center justify-content-center"
                style={{
                  width: '34px',
                  height: '34px',
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
                title="Close Modal"
              >
                <Icon name="x" size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="d-flex gap-2 border-top border-white border-opacity-10 pt-2.5">
              <button
                type="button"
                onClick={() => { setActiveTab('APPLY'); setSubmittedApplication(null); }}
                className={`btn btn-sm px-3 py-1.5 rounded-pill fw-semibold border-0 d-inline-flex align-items-center gap-1.5 ${activeTab === 'APPLY' ? 'text-white shadow-sm' : 'text-white-50'}`}
                style={{
                  backgroundColor: activeTab === 'APPLY' ? '#0097B2' : 'transparent',
                  fontSize: '0.82rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon name="file-text" size={14} />
                <span>1. Submit Application</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TRACK')}
                className={`btn btn-sm px-3 py-1.5 rounded-pill fw-semibold border-0 d-inline-flex align-items-center gap-1.5 ${activeTab === 'TRACK' ? 'text-white shadow-sm' : 'text-white-50'}`}
                style={{
                  backgroundColor: activeTab === 'TRACK' ? '#0097B2' : 'transparent',
                  fontSize: '0.82rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon name="clock" size={14} />
                <span>2. Track Status & Activate</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4 p-md-4.5 bg-light">
            
            {/* VIEW 1: APPLICATION FORM OR POST-SUBMISSION CONFIRMATION */}
            {activeTab === 'APPLY' && (
              <>
                {submittedApplication ? (
                  /* POST-SUBMISSION STATUS SCREEN: WHAT HAPPENS NEXT */
                  <div className="text-center py-2 px-1">
                    <div
                      className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3 shadow-sm"
                      style={{ width: '60px', height: '60px', backgroundColor: '#E0F2FE', color: '#0097B2', border: '2px solid #0097B2' }}
                    >
                      <Icon name="check" size={32} />
                    </div>
                    
                    <span className="badge px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase" style={{ backgroundColor: '#E0F7FA', color: '#0F2F3D', border: '1px solid #B2EBF2', fontSize: '0.72rem' }}>
                      Application Received
                    </span>

                    <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.3px' }}>
                      Organizer Application Logged!
                    </h4>

                    <div className="p-2.5 rounded-3 bg-white border d-inline-flex align-items-center gap-2 mb-3 shadow-xs">
                      <span className="text-muted small">Application Reference:</span>
                      <strong className="font-monospace text-primary" style={{ fontSize: '0.98rem' }}>
                        {submittedApplication.applicationId || 'SEETTU-ORG-SUBMITTED'}
                      </strong>
                    </div>

                    {/* What Happens Next: Visual 4-Stage Workflow */}
                    <div className="p-3.5 bg-white border rounded-3 text-start small mb-3 mx-auto shadow-sm" style={{ maxWidth: '640px' }}>
                      <div className="fw-bold text-dark mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                        <Icon name="git-pull-request" size={16} color="#0097B2" />
                        <span style={{ fontSize: '0.92rem' }}>What Happens Next (Application Lifecycle)</span>
                      </div>

                      <div className="d-flex flex-column gap-3">
                        {/* Step 1 */}
                        <div className="d-flex align-items-start gap-2.5">
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white" style={{ width: '24px', height: '24px', backgroundColor: '#10B981', fontSize: '0.75rem' }}>
                            ✓
                          </div>
                          <div>
                            <strong className="text-dark d-block">Step 1: Application Received & Queued</strong>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Your contact details and proposed circle location ({submittedApplication.district || 'Sri Lanka'}) are securely logged.</span>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="d-flex align-items-start gap-2.5">
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white" style={{ width: '24px', height: '24px', backgroundColor: '#0097B2', fontSize: '0.75rem' }}>
                            2
                          </div>
                          <div>
                            <strong className="text-dark d-block">Step 2: Administrative Compliance & District Review (In Progress)</strong>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>In accordance with The Cheetus Ordinance No. 61 of 1935, our compliance desk verifies prospective organizers to protect savers.</span>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="d-flex align-items-start gap-2.5">
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-muted border bg-light" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                            3
                          </div>
                          <div>
                            <strong className="text-muted d-block">Step 3: Admin Approval & Account Promotion</strong>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>The system admin reviews and approves your application in the platform registry.</span>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="d-flex align-items-start gap-2.5">
                          <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-muted border bg-light" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                            4
                          </div>
                          <div>
                            <strong className="text-muted d-block">Step 4: Activate Password & Launch Organizer Portal</strong>
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>Switch to the "Track Status & Activate" tab, set your password, and start creating Seettu groups!</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap justify-content-center gap-2.5 mt-3">
                      <button
                        onClick={() => {
                          setActiveTab('TRACK');
                          handleTrackSubmit();
                        }}
                        className="btn text-white fw-bold px-4 py-2 rounded-3 shadow-sm border-0 d-inline-flex align-items-center gap-1.5"
                        style={{ backgroundColor: '#0097B2', fontSize: '0.88rem' }}
                      >
                        <Icon name="clock" size={15} />
                        <span>Track Application Status</span>
                      </button>
                      <button
                        onClick={handleClose}
                        className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold"
                        style={{ fontSize: '0.88rem' }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  /* APPLICATION FORM */
                  <form onSubmit={handleSubmit}>
                    <div 
                      className="alert border-0 shadow-xs rounded-3 p-3 mb-3.5 d-flex align-items-start gap-2.5" 
                      style={{ backgroundColor: '#E0F7FA', color: '#0F2F3D' }}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <Icon name="shield" size={18} color="#0097B2" />
                      </div>
                      <div style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                        <strong>Cheetus Ordinance Compliance Rule:</strong> All applicants register without password friction. Once your identity and location are verified by platform administration, circle creation and management privileges are unlocked.
                      </div>
                    </div>

                    {error && (
                      <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                        <Icon name="alert-circle" size={16} />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="row g-3">
                      {/* Section 1 */}
                      <div className="col-12 mb-0">
                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5" style={{ fontSize: '0.88rem' }}>
                          <span className="badge rounded-circle p-1" style={{ backgroundColor: '#0097B2', color: '#fff', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>1</span>
                          <span>Personal & Contact Information</span>
                        </h6>
                      </div>

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

                      {/* Section 2 */}
                      <div className="col-12 mt-2 mb-0">
                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5" style={{ fontSize: '0.88rem' }}>
                          <span className="badge rounded-circle p-1" style={{ backgroundColor: '#0097B2', color: '#fff', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>2</span>
                          <span>Residential & District Details (Sri Lanka)</span>
                        </h6>
                      </div>

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

                      {/* Section 3 */}
                      <div className="col-12 mt-2 mb-0">
                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5" style={{ fontSize: '0.88rem' }}>
                          <span className="badge rounded-circle p-1" style={{ backgroundColor: '#0097B2', color: '#fff', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>3</span>
                          <span>Proposed Circle Plan</span>
                        </h6>
                      </div>

                      <div className="col-12">
                        <label className="form-label small text-muted mb-1 fw-semibold">Message & Proposed Circle Details</label>
                        <textarea
                          name="message"
                          rows="3"
                          className="form-control rounded-2"
                          placeholder="Briefly describe your intended Seettu circle (e.g. expected members, monthly target, village/workplace group)..."
                          value={formData.message}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>

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
              </>
            )}

            {/* VIEW 2: APPLICATION STATUS LOOKUP & ACCOUNT ACTIVATION */}
            {activeTab === 'TRACK' && (
              <div>
                <div className="p-3 bg-white border rounded-3 mb-3.5 shadow-xs">
                  <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <Icon name="search" size={16} color="#0097B2" />
                    <span>Check Application Status</span>
                  </h6>
                  <p className="text-muted small mb-2.5">
                    Enter the email address or mobile phone number used during application submission to check your administrative review status.
                  </p>

                  <form onSubmit={handleTrackSubmit} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control rounded-2"
                      placeholder="Enter Email or Mobile (e.g. 0771234567)"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      disabled={trackLoading || !trackQuery.trim()}
                      className="btn text-white fw-semibold px-4 flex-shrink-0 d-inline-flex align-items-center gap-1.5 rounded-2"
                      style={{ backgroundColor: '#0097B2' }}
                    >
                      {trackLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                      ) : (
                        <>
                          <Icon name="search" size={15} />
                          <span>Check</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {trackError && (
                  <div className="alert alert-warning py-2.5 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                    <Icon name="alert-triangle" size={16} />
                    <span>{trackError}</span>
                  </div>
                )}

                {trackResult && (
                  <div className="card border rounded-3 shadow-sm overflow-hidden mb-3">
                    <div 
                      className="p-3 text-white d-flex justify-content-between align-items-center"
                      style={{ backgroundColor: trackResult.status === 'APPROVED' ? '#0F2F3D' : (trackResult.status === 'REJECTED' ? '#7F1D1D' : '#1A5265') }}
                    >
                      <div>
                        <div className="text-white-50 small" style={{ fontSize: '0.72rem' }}>REFERENCE NUMBER</div>
                        <strong className="font-monospace text-warning" style={{ fontSize: '1rem' }}>
                          {trackResult.applicationId}
                        </strong>
                      </div>
                      <div>
                        {trackResult.status === 'APPROVED' ? (
                          <span className="badge rounded-pill bg-success px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1">
                            <Icon name="check-circle" size={13} />
                            <span>APPROVED AS ORGANIZER</span>
                          </span>
                        ) : trackResult.status === 'REJECTED' ? (
                          <span className="badge rounded-pill bg-danger px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1">
                            <Icon name="x-circle" size={13} />
                            <span>APPLICATION NOT APPROVED</span>
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-warning text-dark px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1">
                            <Icon name="clock" size={13} />
                            <span>UNDER COMPLIANCE REVIEW</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 bg-white">
                      <div className="row g-2 mb-3">
                        <div className="col-sm-6">
                          <small className="text-muted d-block">Applicant Name</small>
                          <strong className="text-dark">{trackResult.fullName}</strong>
                        </div>
                        <div className="col-sm-6">
                          <small className="text-muted d-block">Contact Phone</small>
                          <strong className="text-dark">{trackResult.phone}</strong>
                        </div>
                        <div className="col-sm-6">
                          <small className="text-muted d-block">Email Address</small>
                          <span className="text-muted small">{trackResult.email}</span>
                        </div>
                        <div className="col-sm-6">
                          <small className="text-muted d-block">Jurisdiction / District</small>
                          <span className="text-dark small fw-semibold">{trackResult.district || 'Sri Lanka'}</span>
                        </div>
                      </div>

                      {/* Status Specific Action Cards */}
                      {trackResult.status === 'APPROVED' ? (
                        /* APPROVED: SET PASSWORD & LAUNCH ORGANIZER PORTAL */
                        <div className="p-3 rounded-3 border" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
                          <h6 className="fw-bold text-success mb-1 d-flex align-items-center gap-1.5">
                            <Icon name="check-circle" size={17} color="#16A34A" />
                            <span>Your Organizer Credentials Are Approved!</span>
                          </h6>
                          <p className="text-muted small mb-3">
                            You are now authorized to organize Seettu savings circles under The Cheetus Ordinance. Please set a secure password below to activate and enter your Organizer Portal:
                          </p>

                          {activationError && (
                            <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3">
                              {activationError}
                            </div>
                          )}

                          <form onSubmit={handleActivateAccount} className="row g-2">
                            <div className="col-md-6">
                              <label className="form-label small text-muted mb-1 fw-semibold">New Password *</label>
                              <input
                                type="password"
                                className="form-control form-control-sm rounded-2"
                                placeholder="Min 6 characters"
                                value={activationPassword}
                                onChange={(e) => setActivationPassword(e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small text-muted mb-1 fw-semibold">Confirm Password *</label>
                              <input
                                type="password"
                                className="form-control form-control-sm rounded-2"
                                placeholder="Re-enter password"
                                value={activationConfirm}
                                onChange={(e) => setActivationConfirm(e.target.value)}
                                required
                              />
                            </div>
                            <div className="col-12 mt-3">
                              <button
                                type="submit"
                                disabled={activationLoading}
                                className="btn w-100 fw-bold py-2 rounded-2 text-white shadow-sm border-0 d-inline-flex align-items-center justify-content-center gap-2"
                                style={{ backgroundColor: '#0097B2' }}
                              >
                                {activationLoading ? (
                                  <span className="spinner-border spinner-border-sm" role="status"></span>
                                ) : (
                                  <>
                                    <Icon name="log-in" size={16} />
                                    <span>ACTIVATE PASSWORD & ENTER ORGANIZER PORTAL</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : trackResult.status === 'REJECTED' ? (
                        <div className="alert alert-danger mb-0 small">
                          <strong>Reason for Rejection:</strong> {trackResult.rejectionReason || 'Contact details could not be validated. Please contact regional administrative desk.'}
                        </div>
                      ) : (
                        /* PENDING COMPLIANCE REVIEW */
                        <div className="p-3 rounded-3 border" style={{ backgroundColor: '#F8FAFC' }}>
                          <div className="d-flex align-items-center gap-2 mb-2 text-dark fw-bold small">
                            <span className="spinner-grow spinner-grow-sm text-info" role="status"></span>
                            <span>Current Stage: Regional Compliance & Contact Verification</span>
                          </div>
                          <p className="text-muted small mb-0" style={{ lineHeight: '1.5' }}>
                            Our compliance desk is currently verifying your district registry. Once approved by the administrator, you can return here to set your password and access circle creation features.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeOrganizerModal;
