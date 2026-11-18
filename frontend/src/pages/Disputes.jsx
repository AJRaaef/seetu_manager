import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'react-bootstrap';
import Icon from '../components/Icons';
import { getAllDisputes, getDisputesByUser, createDispute, updateDisputeStatus } from '../api/disputeApi';
import { getAllGroups, getGroupsByUser } from '../api/groupApi';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';

const Disputes = () => {
  const { t } = useTranslation();
  const { user, isOrganizer, isAdmin } = useAuth();

  const [disputes, setDisputes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Form state
  const [selectedGroupId, setSelectedGroupId] = useState('general');
  const [disputeType, setDisputeType] = useState('Payment');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');

  // Review Modal state
  const [reviewingDispute, setReviewingDispute] = useState(null);
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchDisputesAndGroups = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      let gList = [];
      const disputesPromise = (isAdmin || isOrganizer
        ? getAllDisputes()
        : (user?.id ? getDisputesByUser(user.id) : getAllDisputes())
      ).catch(() => ({ data: [] }));

      let groupsPromise;
      if (isAdmin || isOrganizer) {
        groupsPromise = getAllGroups().catch(() => ({ data: [] }));
      } else if (user?.id) {
        // For members, fetch joined groups first, or fallback to all groups
        groupsPromise = getGroupsByUser(user.id)
          .catch(() => getAllGroups())
          .catch(() => ({ data: [] }));
      } else {
        groupsPromise = getAllGroups().catch(() => ({ data: [] }));
      }

      const [groupsRes, disputesRes] = await Promise.all([
        groupsPromise,
        disputesPromise
      ]);

      gList = groupsRes?.data || groupsRes || [];
      if (!isAdmin && !isOrganizer && (!Array.isArray(gList) || gList.length === 0)) {
        try {
          const fallbackRes = await getAllGroups();
          gList = fallbackRes?.data || fallbackRes || [];
        } catch {
          // ignore
        }
      }

      const dList = disputesRes?.data || disputesRes || [];
      const safeGroups = Array.isArray(gList) ? gList : [];

      setGroups(safeGroups);
      if (safeGroups.length > 0) {
        const exists = safeGroups.some(g => String(g.id) === String(selectedGroupId));
        if (!selectedGroupId || (!exists && selectedGroupId !== 'general')) {
          setSelectedGroupId(String(safeGroups[0].id));
        }
      } else {
        setSelectedGroupId('general');
      }

      setDisputes(Array.isArray(dList) ? dList : []);
    } catch (err) {
      console.error('Failed to load disputes data:', err);
      setErrorMsg(getErrorMessage(err, t('disputes_page.fetch_failed')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputesAndGroups();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin) {
      alert(t('disputes_page.admin_no_raise'));
      return;
    }
    if (!description.trim()) {
      alert(t('disputes_page.description_required'));
      return;
    }

    setSubmitting(true);
    setActionMsg('');
    setErrorMsg('');

    try {
      const payloadGroupId = (selectedGroupId && selectedGroupId !== 'general')
        ? Number(selectedGroupId)
        : null;

      await createDispute({
        groupId: payloadGroupId,
        type: disputeType,
        description: description.trim()
      }, user?.id);

      setActionMsg(t('disputes_page.submitted_success'));
      setDescription('');
      setFileName('');
      await fetchDisputesAndGroups();
    } catch (err) {
      setErrorMsg(getErrorMessage(err, t('disputes_page.submit_failed')));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!reviewingDispute) return;

    setStatusUpdating(true);
    try {
      await updateDisputeStatus(
        reviewingDispute.id,
        newStatus,
        resolutionNotes,
        user?.id
      );
      setActionMsg(t('disputes_page.status_updated', { id: reviewingDispute.id, status: newStatus }));
      setReviewingDispute(null);
      setResolutionNotes('');
      await fetchDisputesAndGroups();
    } catch (err) {
      alert(getErrorMessage(err, t('disputes_page.update_failed')));
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'OPEN':
        return <span className="badge-peach">{t('disputes_page.status_open')}</span>;
      case 'UNDER_REVIEW':
      case 'IN_REVIEW':
        return <span className="badge-in-review">{t('disputes_page.status_in_review')}</span>;
      case 'RESOLVED':
        return <span className="badge-mint">{t('disputes_page.status_resolved')}</span>;
      case 'REJECTED':
        return <span className="badge bg-danger-subtle text-danger border border-danger small px-2 py-1">{t('disputes_page.status_rejected')}</span>;
      default:
        return <span className="badge-peach">{status}</span>;
    }
  };

  const openDisputesCount = disputes.filter(d => {
    const s = String(d.status || '').toUpperCase();
    return s !== 'RESOLVED' && s !== 'REJECTED';
  }).length;

  return (
    <div className="disputes-page-container pb-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#0F2F3D' }}>{t('disputes_page.title', 'Disputes & Grievances')}</h2>
          <p className="text-muted small mb-0">
            {isOrganizer 
              ? t('disputes_page.organizer_subtitle')
              : t('disputes_page.subtitle', 'Mediate, investigate, and record resolutions for member grievances')}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          {!isAdmin && (
            <button
              type="button"
              className="btn btn-teal px-3 py-2 d-flex align-items-center gap-2 shadow-sm fw-semibold"
              onClick={() => {
                const el = document.getElementById('raise-dispute-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Icon name="plus" size={16} />
              <span>{isOrganizer ? t('disputes_page.raise_group') : t('disputes_page.raise_btn', 'Raise Dispute')}</span>
            </button>
          )}
          <span className="badge-peach px-3 py-2 fs-6 fw-semibold">
            {openDisputesCount} {openDisputesCount === 1 ? t('disputes_page.open_dispute') : t('disputes_page.open_disputes')}
          </span>
        </div>
      </div>

      {actionMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="check" size={18} />
          <div>{actionMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setActionMsg('')} aria-label={t('disputes_page.close')}></button>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{errorMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setErrorMsg('')} aria-label={t('disputes_page.close')}></button>
        </div>
      )}

      {/* Existing Disputes Table Card */}
      <div className="table-card shadow-sm mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              <tr>
                <th className="py-3 px-3 text-muted fw-semibold small">ID</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('common.date', 'Date')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('common.group', 'Group')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('disputes_page.col_complainant', 'Complainant')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('disputes_page.col_subject', 'Subject')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small">{t('common.notes', 'Notes')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-center">{t('common.status', 'Status')}</th>
                <th className="py-3 px-3 text-muted fw-semibold small text-end">{t('common.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="spinner-border text-teal" role="status" style={{ color: '#1A5265' }}></div>
                    <p className="mt-2 text-muted small">{t('disputes_page.loading')}</p>
                  </td>
                </tr>
              ) : disputes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <Icon name="disputes" size={36} color="#94A3B8" className="mb-2" />
                    <h6 className="fw-bold text-dark">{t('disputes_page.no_disputes')}</h6>
                    <p className="text-muted small mb-0">{t('disputes_page.no_active_disputes')}</p>
                  </td>
                </tr>
              ) : (
                disputes.map((d) => {
                  const dateStr = d.createdAt ? d.createdAt.split('T')[0] : (d.date || t('disputes_page.na'));
                  const groupName = d.group?.name || d.group || t('disputes_page.general_group');
                  const filedByName = d.raisedBy?.fullName || d.filedBy || t('disputes_page.member');

                  return (
                    <tr key={d.id}>
                      <td className="py-3 px-3 fw-bold text-dark small">DIS-{String(d.id).padStart(3, '0')}</td>
                      <td className="py-3 px-3 text-muted small">{dateStr}</td>
                      <td className="py-3 px-3 text-dark small">{groupName}</td>
                      <td className="py-3 px-3 text-muted small">{filedByName}</td>
                      <td className="py-3 px-3 text-muted small">{d.type}</td>
                      <td className="py-3 px-3 text-dark small" style={{ maxWidth: '280px' }}>
                        <div className="text-truncate">{d.description}</div>
                      </td>
                      <td className="py-3 px-3 text-center">{getStatusBadge(d.status)}</td>
                      <td className="py-3 px-3 text-end">
                        <button
                          className="btn btn-link text-success fw-semibold p-0 text-decoration-none small"
                          onClick={() => {
                            setReviewingDispute(d);
                            setNewStatus(d.status === 'OPEN' ? 'RESOLVED' : d.status);
                            setResolutionNotes(d.resolutionNotes || '');
                          }}
                        >
                          {(isOrganizer || isAdmin) ? (d.status === 'RESOLVED' || d.status === 'REJECTED' ? t('disputes_page.view') : t('disputes_page.review')) : t('disputes_page.view')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit New Dispute Card - Members & Organizers */}
      {!isAdmin && (
        <div id="raise-dispute-section" className="ui-card p-4 shadow-sm mb-4" style={{ borderRadius: '12px' }}>
          <div className="mb-2">
            <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.2rem' }}>
              {isOrganizer ? t('disputes_page.escalate_title') : t('disputes_page.submit_new')}
            </h4>
          </div>
          <p className="text-muted small mb-3">
            {isOrganizer 
              ? t('disputes_page.organizer_form_desc')
              : t('disputes_page.member_form_desc')}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label text-dark fw-semibold small">
                  {isOrganizer ? t('disputes_page.select_circle') : t('disputes_page.select_group_scope')}
                </label>
                <select
                  className="form-select bg-white"
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="general">{t('disputes_page.general_issue')}</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-dark fw-semibold small">{t('disputes_page.category')}</label>
                <select
                  className="form-select bg-white"
                  value={disputeType}
                  onChange={(e) => setDisputeType(e.target.value)}
                  style={{ borderRadius: '8px' }}
                >
                  {isOrganizer ? (
                    <>
                      <option value="Member Delinquency / Default">{t('disputes_page.cat_delinquency')}</option>
                      <option value="Forged Slip / Payment Fraud">{t('disputes_page.cat_fraud')}</option>
                      <option value="Rule Violation / Contract Breach">{t('disputes_page.cat_breach')}</option>
                      <option value="Cycle / Payout Conflict">{t('disputes_page.cat_conflict')}</option>
                      <option value="Platform Admin Escalation">{t('disputes_page.cat_escalation')}</option>
                      <option value="Other Big Issue">{t('disputes_page.cat_other_big')}</option>
                    </>
                  ) : (
                    <>
                      <option value="Payment">{t('disputes_page.cat_payment')}</option>
                      <option value="Payout">{t('disputes_page.cat_payout')}</option>
                      <option value="Member">{t('disputes_page.cat_member')}</option>
                      <option value="Cycle">{t('disputes_page.cat_cycle')}</option>
                      <option value="Other">{t('disputes_page.cat_other')}</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-dark fw-semibold small">{t('disputes_page.col_subject', 'Subject / Details')}</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder={isOrganizer 
                  ? t('disputes_page.organizer_placeholder')
                  : t('disputes_page.member_placeholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ borderRadius: '8px' }}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-dark fw-semibold small">{t('disputes_page.upload_evidence')}</label>
              <div
                className="border border-dashed rounded-3 p-4 text-center"
                style={{ borderColor: '#CBD5E1', backgroundColor: '#FAFAFA', cursor: 'pointer' }}
                onClick={() => document.getElementById('evidenceFileInput').click()}
              >
                <div className="text-muted mb-2">
                  <Icon name="upload" size={28} color="#94A3B8" />
                </div>
                <div className="fw-semibold text-dark small">
                  {fileName ? fileName : t('disputes_page.upload_prompt')}
                </div>
                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                  {t('disputes_page.file_types')}
                </div>
                <input
                  id="evidenceFileInput"
                  type="file"
                  className="d-none"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-teal w-100 py-2.5 fw-semibold shadow-sm"
              style={{ borderRadius: '8px' }}
              disabled={submitting}
            >
              {submitting 
                ? t('common.loading', 'Submitting...') 
                : (isOrganizer ? t('disputes_page.submit_escalate') : t('disputes_page.raise_btn', 'Raise Dispute'))}
            </button>
          </form>
        </div>
      )}

      {/* Organizer Mediation Banner */}
      {isOrganizer && (
        <div className="alert border-0 shadow-sm d-flex align-items-start gap-3 p-3 mb-4" style={{ backgroundColor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '10px' }}>
          <Icon name="shield" size={24} color="#166534" className="mt-0.5 flex-shrink-0" />
          <div>
            <strong className="d-block mb-1">{t('disputes_page.organizer_banner_title')}</strong>
            <span className="small">
              {t('disputes_page.organizer_banner_text')}
            </span>
          </div>
        </div>
      )}

      {/* Admin Arbitrator Banner */}
      {isAdmin && (
        <div className="alert alert-info border-0 shadow-sm d-flex align-items-center gap-3 p-3 mb-4" style={{ backgroundColor: '#E0F2FE', color: '#0369A1' }}>
          <Icon name="shield" size={24} />
          <div>
            <strong className="d-block mb-1">{t('disputes_page.admin_banner_title')}</strong>
            <span className="small">
              {t('disputes_page.admin_banner_text')}
            </span>
          </div>
        </div>
      )}

      {/* Review / Details Modal */}
      <Modal show={!!reviewingDispute} onHide={() => setReviewingDispute(null)} centered contentClassName="custom-modal-content">
        <div className="custom-modal-header">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold mb-0 text-dark">{t('disputes_page.details_title')}</h5>
            {reviewingDispute && (
              <span className="badge bg-light text-muted border small">
                #DIS-{String(reviewingDispute.id).padStart(3, '0')}
              </span>
            )}
          </div>
          <button className="btn btn-link text-muted p-0 border-0" onClick={() => setReviewingDispute(null)} type="button">
            <Icon name="x" size={20} />
          </button>
        </div>

        {reviewingDispute && (
          <form onSubmit={handleUpdateStatus}>
            <div className="custom-modal-body">
              <div className="mb-3 bg-light p-3 rounded-3 border">
                <div className="row g-2 small">
                  <div className="col-6">
                    <span className="text-muted">{t('disputes_page.detail_group')}: </span>
                    <strong className="text-dark">{reviewingDispute.group?.name || reviewingDispute.group}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted">{t('disputes_page.detail_type')}: </span>
                    <strong className="text-dark">{reviewingDispute.type}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted">{t('disputes_page.detail_filed_by')}: </span>
                    <strong className="text-dark">{reviewingDispute.raisedBy?.fullName || reviewingDispute.filedBy || t('disputes_page.member')}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted">{t('disputes_page.detail_status')}: </span>
                    {getStatusBadge(reviewingDispute.status)}
                  </div>
                </div>
                <hr className="my-2" />
                <div>
                  <span className="text-muted small">{t('disputes_page.detail_description')}:</span>
                  <p className="mb-0 mt-1 text-dark small">{reviewingDispute.description}</p>
                </div>
              </div>

              {(isAdmin || isOrganizer) ? (
                <>
                  <div className="mb-3">
                    <label className="form-label text-dark fw-semibold small">{t('disputes_page.update_status')}</label>
                    <select
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                    >
                      <option value="UNDER_REVIEW">{t('disputes_page.status_in_review')}</option>
                      <option value="RESOLVED">{t('disputes_page.status_resolved')}</option>
                      <option value="REJECTED">{t('disputes_page.status_rejected')}</option>
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label text-dark fw-semibold small">{t('disputes_page.resolution_notes')}</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder={t('disputes_page.resolution_placeholder')}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                reviewingDispute.resolutionNotes && (
                  <div className="mb-2 p-3 bg-success-subtle rounded-3 border border-success-subtle">
                    <span className="fw-semibold small text-success">{t('disputes_page.resolution_notes')}:</span>
                    <p className="mb-0 text-dark small">{reviewingDispute.resolutionNotes}</p>
                  </div>
                )
              )}
            </div>

            <div className="custom-modal-footer">
              <button type="button" className="btn btn-light px-4 border" onClick={() => setReviewingDispute(null)}>
                {t('disputes_page.close')}
              </button>
              {(isAdmin || isOrganizer) && (
                <button type="submit" className="btn btn-teal px-4" disabled={statusUpdating}>
                  {statusUpdating ? t('disputes_page.saving') : t('disputes_page.save_resolution')}
                </button>
              )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Disputes;
