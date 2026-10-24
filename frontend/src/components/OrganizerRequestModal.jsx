import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from './Icons';
import { requestOrganizer } from '../api/userApi';
import { useAuth } from '../hooks/useAuth';

const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle'
];

const SEETTU_PURPOSES = [
  { value: 'FIXED_ROTATION', label: 'Monthly Fixed Cash Rotation' },
  { value: 'GOLD_ASSET', label: 'Gold / Precious Asset Seettu' },
  { value: 'AUCTION_BIDDING', label: 'Auction / Bidding Seettu' },
  { value: 'BUSINESS_MERCHANT', label: 'SME / Merchant Capital Circle' },
  { value: 'COMMUNITY_SAVINGS', label: 'Neighborhood / Family Circle' }
];

const OrganizerRequestModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [district, setDistrict] = useState(user?.district || 'Colombo');
  const [purpose, setPurpose] = useState('FIXED_ROTATION');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const isKycVerified = user?.kycStatus === 'VERIFIED';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const selectedPurpose = SEETTU_PURPOSES.find(p => p.value === purpose)?.label || purpose;
      const combinedMessage = `[Model: ${selectedPurpose}] ${message.trim()}`;
      
      await requestOrganizer({
        district,
        message: combinedMessage
      });

      if (updateUser) {
        updateUser({
          requestedRole: 'ORGANIZER',
          district
        });
      }

      setSubmitted(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit organizer application. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          {/* Header */}
          <div className="modal-header text-white px-4 py-3" style={{ backgroundColor: '#1A5265' }}>
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <Icon name="award" size={20} color="#FFFFFF" />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.1rem' }}>
                  Register as a Seettu Organizer
                </h5>
                <small className="text-white-50" style={{ fontSize: '0.78rem' }}>
                  Upgrade your member account to create & lead Seettu circles
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={submitting}
            />
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {submitted ? (
              <div className="text-center py-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px', backgroundColor: '#DEF7EC', color: '#0E9F6E' }}>
                  <Icon name="check" size={36} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Organizer Application Submitted!</h5>
                <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '480px', lineHeight: '1.5' }}>
                  Thank you, <strong>{user?.fullName}</strong>. In accordance with The Cheetus Ordinance, our System Administrator will review your verified member records and activate your Group Organizer privileges shortly.
                </p>
                <div className="p-3 bg-light rounded-3 text-start small border mx-auto mb-4" style={{ maxWidth: '480px' }}>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Applicant:</span>
                    <span className="fw-semibold text-dark">{user?.fullName}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Operating District:</span>
                    <span className="fw-semibold text-dark">{district}</span>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Status:</span>
                    <span className="badge bg-warning bg-opacity-25 text-warning-emphasis border border-warning px-2 py-1">
                      Pending Administrator Approval
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-teal px-4 py-2 fw-semibold shadow-sm"
                  style={{ backgroundColor: '#0097B2', color: '#FFFFFF' }}
                  onClick={onClose}
                >
                  Done
                </button>
              </div>
            ) : !isKycVerified ? (
              <div className="py-3">
                <div className="alert alert-warning border-0 rounded-3 p-3 mb-4 d-flex gap-3 align-items-start">
                  <Icon name="shield" size={24} className="text-warning-emphasis flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1 text-dark">Identity Verification Required First</h6>
                    <p className="mb-0 small text-muted" style={{ lineHeight: '1.45' }}>
                      To protect member funds, prevent illegal schemes, and comply with The Cheetus Ordinance, all Organizers must first verify their Sri Lankan National Identity Card (NIC) and submit a Grama Niladhari Character Certificate on their Profile.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 mb-4 small">
                  <div className="fw-semibold text-dark mb-1">How to become an Organizer:</div>
                  <ol className="mb-0 ps-3 text-muted" style={{ lineHeight: '1.6' }}>
                    <li>Go to your <strong>Profile</strong> page and submit your NIC + Grama Niladhari certificate.</li>
                    <li>Once Admin approves your identity, return here and apply for Organizer status with 1 click.</li>
                    <li>No need to log out or create a separate account!</li>
                  </ol>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary px-3" onClick={onClose}>
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-teal px-4 fw-semibold text-white shadow-sm"
                    style={{ backgroundColor: '#0097B2' }}
                    onClick={() => {
                      onClose();
                      navigate('/profile');
                    }}
                  >
                    Go to Profile Verification
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3">
                    {error}
                  </div>
                )}

                {/* Verified Identity Summary Banner */}
                <div className="p-3 rounded-3 mb-3 border d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
                  <div className="d-flex align-items-center gap-2">
                    <Icon name="check" size={18} color="#16A34A" />
                    <div>
                      <div className="fw-bold text-dark small" style={{ fontSize: '0.84rem' }}>
                        {user?.fullName} (NIC: {user?.nicNumber || 'Verified'})
                      </div>
                      <small className="text-success" style={{ fontSize: '0.74rem' }}>
                        ✓ Identity and Grama Niladhari certificate verified on file
                      </small>
                    </div>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 small">
                    Verified Member
                  </span>
                </div>

                <p className="small text-muted mb-3" style={{ fontSize: '0.8rem', lineHeight: '1.45' }}>
                  You are already a trusted and verified member. Please specify your operating district and planned Seettu circle terms below. System Administrator will review and activate your Organizer privileges.
                </p>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-semibold small mb-1">
                      Operating District <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d} District</option>
                      ))}
                    </select>
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Primary region where your circle members reside.
                    </small>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-secondary fw-semibold small mb-1">
                      Planned Seettu Model <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
                    >
                      {SEETTU_PURPOSES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Type of Seettu circle you plan to launch.
                    </small>
                  </div>

                  <div className="col-12">
                    <label className="form-label text-secondary fw-semibold small mb-1">
                      Application Proposal / Notes for Administrator <span className="text-muted fw-normal">(Optional)</span>
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      placeholder="e.g. Planning a 10-member monthly gold savings circle (LKR 50,000/month) for community shopkeepers. Group members are ready to enroll."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={500}
                    />
                    <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Brief summary to help Administrator expedite your organizer approval.
                    </small>
                  </div>
                </div>

                <div className="p-2.5 rounded-2 mb-3 bg-light border small text-muted" style={{ fontSize: '0.74rem' }}>
                  <Icon name="info" size={14} className="me-1 text-info" />
                  <strong>Organizer Responsibilities:</strong> As an Organizer, you will oversee group cycle scheduling, verify member contributions, and disburse scheduled payouts transparently in compliance with platform rules.
                </div>

                <div className="modal-footer border-top px-0 pb-0 pt-3">
                  <button
                    type="button"
                    className="btn btn-secondary px-3 py-1.5 small"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-teal px-4 py-1.5 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5 text-white"
                    style={{ backgroundColor: '#1A5265' }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={15} />
                        <span>Submit Organizer Application</span>
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

export default OrganizerRequestModal;
