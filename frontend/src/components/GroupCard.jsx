import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const GroupCard = ({ 
  group, 
  userRole, 
  userId, 
  onRequestJoin, 
  joinRequestStatus, 
  onRecordPayment, 
  onGenerateReport 
}) => {
  const { t } = useTranslation();
  const isOrganizer = userRole === 'ORGANIZER' || group.createdById === userId;
  const isMember = group.members?.some(m => (m.userId === userId || m.id === userId) && m.status === 'ACTIVE');
  
  const activeMembersCount = group.members?.length || 0;
  const targetMembersCount = group.memberCount || 10;
  const progressPercent = Math.min(100, Math.round((activeMembersCount / targetMembersCount) * 100));

  // Determine color badge for status (green: Active, blue: Completed, gray: Inactive)
  let statusBadgeClass = 'bg-secondary';
  if (group.status === 'ACTIVE') statusBadgeClass = 'bg-success';
  if (group.status === 'COMPLETED') statusBadgeClass = 'bg-primary';
  if (group.status === 'INACTIVE') statusBadgeClass = 'bg-secondary';

  // Determine current active cycle
  const currentCycle = group.cycles?.find(c => c.status === 'ACTIVE')?.cycleNumber || 1;
  const totalCycles = group.cycles?.length || targetMembersCount;

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      <div className="card h-100 shadow-sm border-0 rounded-3">
        {/* Header */}
        <div className="card-header bg-white border-bottom-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-start">
          <span className="badge bg-primary-subtle text-primary border fw-bold px-2 py-1">
            {group.category || 'GENERAL'}
          </span>
          <span className={`badge ${statusBadgeClass} text-white fw-bold px-3 py-1 rounded-pill`}>
            {t(`status.${group.status}`, group.status || 'ACTIVE')}
          </span>
        </div>

        {/* Body */}
        <div className="card-body px-4 py-3">
          <h5 className="card-title fw-bold text-dark mb-2">{group.name}</h5>
          <p className="card-text text-muted small mb-3 text-truncate-2" style={{ minHeight: '38px' }}>
            {group.description || t('group_card.no_description', 'No description provided.')}
          </p>

          <div className="p-3 bg-light rounded-3 mb-3 border">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">{t('group_card.contribution_amount', 'Contribution Amount:')}</span>
              <strong className="text-primary fw-bold">LKR {(group.contributionAmount || 0).toLocaleString()}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">{t('group_card.cycle_frequency', 'Cycle Frequency:')}</span>
              <span className="badge bg-outline-secondary text-dark border">{group.cycleFrequency || 'MONTHLY'}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted small">{t('group_card.cycle_progress', 'Cycle Progress:')}</span>
              <strong className="text-dark small">
                {t('group_card.cycle_x_of_y', { current: currentCycle, total: totalCycles, defaultValue: `Cycle ${currentCycle} of ${totalCycles}` })}
              </strong>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">{t('group_card.members_capacity', 'Members Capacity:')}</span>
              <span className="fw-bold text-dark small">{activeMembersCount} / {targetMembersCount}</span>
            </div>
            <div className="progress mt-2" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Footer with Role-Based Action Buttons */}
        <div className="card-footer bg-white border-top-0 px-4 pb-4 pt-0">
          {isOrganizer ? (
            <div className="d-flex flex-column gap-2">
              <Link to={`/groups/${group.id}`} className="btn btn-primary w-100 fw-bold">
                 {t('group_card.view_details', 'View Details')}
              </Link>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-success btn-sm w-50 fw-bold"
                  onClick={() => onRecordPayment && onRecordPayment(group)}
                >
                  {t('group_card.record_payment', 'Record Payment')}
                </button>
                <button
                  className="btn btn-outline-info btn-sm w-50 fw-bold"
                  onClick={() => onGenerateReport && onGenerateReport(group)}
                >
                  {t('group_card.report', 'Report')}
                </button>
              </div>
            </div>
          ) : isMember ? (
            <Link to={`/groups/${group.id}`} className="btn btn-outline-primary w-100 fw-bold">
                {t('group_card.view_details', 'View Details')}
            </Link>
          ) : (
            <div>
              {joinRequestStatus === 'PENDING' ? (
                <button className="btn btn-warning w-100 fw-bold text-dark" disabled>
                    {t('group_card.request_pending', 'Request Pending')}
                </button>
              ) : joinRequestStatus === 'APPROVED' ? (
                <Link to={`/groups/${group.id}`} className="btn btn-outline-primary w-100 fw-bold">
                   {t('group_card.view_details', 'View Details')}
                </Link>
              ) : (
                <button
                  className="btn btn-success w-100 fw-bold"
                  onClick={() => onRequestJoin && onRequestJoin(group)}
                >
                  ️ {t('group_card.request_to_join', 'Request to Join')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
