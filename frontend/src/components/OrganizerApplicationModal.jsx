import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { applyForOrganizer } from '../api/organizerApi';
import { getErrorMessage } from '../utils/errorHandler';
import Icon from './Icons';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Galle', 'Matara',
  'Jaffna', 'Kurunegala', 'Anuradhapura', 'Trincomalee', 'Batticaloa', 'Other'
];


const EXPERIENCE_LEVELS = [
  'Beginner',
  '1-3 Years',
  '5+ Years'
];

const OrganizerApplicationModal = ({ show, onClose, onSuccess }) => {
  const { user, updateUser, refreshUser } = useAuth();

  const [form, setForm] = useState({
    operatingDistrict: '',
    targetMemberCount: '',
    plannedContributionAmount: '',
    experienceLevel: '',
    proposalNotes: '',
    agreementAccepted: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!show) return null;

  const nicNumber = user?.nicNumber || '—';
  const fullName = user?.fullName || 'Member';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    if (!form.operatingDistrict) return 'Please select your operating district.';
    if (!form.targetMemberCount || parseInt(form.targetMemberCount) < 2)
      return 'Target member count must be at least 2.';
    if (!form.plannedContributionAmount || parseFloat(form.plannedContributionAmount) < 100)
      return 'Planned contribution amount must be at least LKR 100.';
    if (!form.experienceLevel) return 'Please select your experience level.';
    if (!form.agreementAccepted) return 'You must accept the Organizer Terms & Conditions.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await applyForOrganizer({
        operatingDistrict: form.operatingDistrict,
        targetMemberCount: parseInt(form.targetMemberCount),
        plannedContributionAmount: parseFloat(form.plannedContributionAmount),
        experienceLevel: form.experienceLevel,
        proposalNotes: form.proposalNotes || '',
        agreementAccepted: true
      });

      // Update user context immediately so UI reflects pending state
      updateUser({ requestedRole: 'ORGANIZER', district: form.operatingDistrict });

      setSuccess(true);

      // Refresh backend user data in background
      setTimeout(() => {
        refreshUser().catch(() => {});
      }, 500);

      // Close modal after brief success display
      setTimeout(() => {
        setSuccess(false);
        onSuccess && onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit application. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        style={{ zIndex: 1050 }}
        aria-modal="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>

            {/* Header */}
            <div
              className="modal-header px-4 py-3 text-white border-0"
              style={{ background: 'linear-gradient(135deg, #0F2F3D 0%, #0097B2 100%)' }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '44px', height: '44px', backgroundColor: 'rgba(255,255,255,0.18)', flexShrink: 0 }}
                >
                  <Icon name="award" size={22} color="#fff" />
                </div>
                <div>
                  <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.15rem' }}>
                    Register as a Seettu Organizer
                  </h5>
                  <small style={{ opacity: 0.82, fontSize: '0.8rem' }}>
                    Upgrade your member account to create &amp; lead Seettu circles
                  </small>
                </div>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white ms-auto"
                aria-label="Close"
                onClick={handleClose}
                disabled={submitting}
              />
            </div>

            {/* Body */}
            <div className="modal-body px-4 py-3">

              {/* Success banner */}
              {success && (
                <div
                  className="alert border-0 d-flex align-items-center gap-3 mb-3"
                  style={{ background: '#D1FAE5', borderRadius: '12px' }}
                >
                  <span style={{ fontSize: '1.4rem' }}>✅</span>
                  <div>
                    <div className="fw-bold" style={{ color: '#065F46' }}>Application Submitted!</div>
                    <small style={{ color: '#047857' }}>Your application is now under admin review.</small>
                  </div>
                </div>
              )}

              {/* Error alert */}
              {error && (
                <div
                  className="alert border-0 d-flex align-items-center gap-2 mb-3"
                  style={{ background: '#FEE2E2', borderRadius: '10px' }}
                >
                  <Icon name="alert-circle" size={16} color="#DC2626" />
                  <span style={{ color: '#991B1B', fontSize: '0.88rem' }}>{error}</span>
                  <button
                    type="button"
                    className="btn-close ms-auto"
                    style={{ fontSize: '0.7rem' }}
                    onClick={() => setError('')}
                  />
                </div>
              )}

              {/* Verified Member Badge */}
              <div
                className="d-flex align-items-center justify-content-between p-3 mb-3 rounded-3"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
              >
                <div className="d-flex align-items-start gap-2">

                  <div>
                    <div className="fw-bold" style={{ color: '#065F46', fontSize: '0.93rem' }}>
                      {fullName} (NIC: {nicNumber})
                    </div>
                    <div style={{ color: '#047857', fontSize: '0.8rem' }}>
                      ✓ Identity and Grama Niladhari certificate verified on file
                    </div>
                  </div>
                </div>
                <span
                  className="badge border fw-semibold"
                  style={{ color: '#047857', borderColor: '#6EE7B7', background: '#fff', fontSize: '0.72rem' }}
                >
                  Verified Member
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-muted mb-3" style={{ fontSize: '0.87rem' }}>
                You are already a trusted and verified member. Please specify your operating district and planned Seettu
                circle terms below. System Administrator will review and activate your Organizer privileges.
              </p>

              <form onSubmit={handleSubmit} id="organizer-application-form" noValidate>
                {/* Row 1: District + Experience */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small mb-1">
                      Operating District <span className="text-danger">*</span>
                    </label>
                    <select
                      name="operatingDistrict"
                      className="form-select"
                      value={form.operatingDistrict}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select district…</option>
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d} {d !== 'Other' ? 'District' : ''}</option>
                      ))}
                    </select>
                    <div className="form-text" style={{ fontSize: '0.75rem' }}>
                      Primary region where your circle members reside.
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small mb-1">
                      Organizer Experience <span className="text-danger">*</span>
                    </label>
                    <select
                      name="experienceLevel"
                      className="form-select"
                      value={form.experienceLevel}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select experience level…</option>
                      {EXPERIENCE_LEVELS.map((e) => (
                        <option key={e} value={e}>{e}</option>
                      ))}
                    </select>
                    <div className="form-text" style={{ fontSize: '0.75rem' }}>
                      Your prior background managing Seettu groups.
                    </div>
                  </div>
                </div>

                {/* Row 2: Target members + Amount */}
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small mb-1">
                      Target Member Count <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="targetMemberCount"
                      className="form-control"
                      placeholder="e.g. 10"
                      min="2"
                      value={form.targetMemberCount}
                      onChange={handleChange}
                      required
                    />
                    <div className="form-text" style={{ fontSize: '0.75rem' }}>
                      Minimum 2 members required.
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold small mb-1">
                      Planned Contribution Amount <span className="text-muted fw-normal">(LKR)</span>{' '}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="plannedContributionAmount"
                      className="form-control"
                      placeholder="e.g. 5000"
                      min="100"
                      step="0.01"
                      value={form.plannedContributionAmount}
                      onChange={handleChange}
                      required
                    />
                    <div className="form-text" style={{ fontSize: '0.75rem' }}>
                      Minimum LKR 100 per contribution cycle.
                    </div>
                  </div>
                </div>

                {/* Row 4: Proposal Notes */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-1">
                    Application Proposal / Notes for Administrator{' '}
                    <span className="text-muted fw-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="proposalNotes"
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Planning a 10-member monthly gold savings circle (LKR 50,000/month) for community shopkeepers. Group members are ready to enroll."
                    value={form.proposalNotes}
                    onChange={handleChange}
                    style={{ resize: 'vertical', fontSize: '0.9rem' }}
                  />
                  <div className="form-text" style={{ fontSize: '0.75rem' }}>
                    Brief summary to help Administrator expedite your organizer approval.
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="agreementAccepted"
                      name="agreementAccepted"
                      checked={form.agreementAccepted}
                      onChange={handleChange}
                    />
                    <label className="form-check-label small" htmlFor="agreementAccepted" style={{ fontSize: '0.86rem' }}>
                      I agree to the{' '}
                      <span className="fw-semibold" style={{ color: '#0097B2' }}>Organizer Terms &amp; Conditions</span>.
                      I understand I am responsible for collecting and distributing funds offline.
                    </label>
                  </div>
                </div>

                {/* Info Alert */}
                <div
                  className="d-flex align-items-start gap-2 p-3 rounded-3"
                  style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '0.82rem', color: '#1E40AF' }}
                >
                  <Icon name="info" size={15} color="#3B82F6" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span className="fw-bold">Organizer Responsibilities: </span>
                    As an Organizer, you will oversee group cycle scheduling, verify member contributions, and
                    disburse scheduled payouts transparently in compliance with platform rules.
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 fw-semibold"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="organizer-application-form"
                className="btn fw-semibold px-4 d-inline-flex align-items-center gap-2"
                disabled={submitting || success}
                style={{ background: '#0F2F3D', color: '#fff', minWidth: '210px' }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Submitting…</span>
                  </>
                ) : (
                  <>
                    <Icon name="check" size={16} color="#fff" />
                    <span>Submit Organizer Application</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerApplicationModal;
