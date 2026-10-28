import React from 'react';
import Icon from './Icons';

const RotationResultCard = ({ assignment, currentUserId }) => {
  if (!assignment) return null;

  const isCurrentUser = currentUserId && String(currentUserId) === String(assignment.userId);
  const isOrganizer = assignment.isOrganizer;
  const isNo = assignment.spinResult === 'NO' || assignment.status === 'NO';
  const hasSpun = assignment.spunAt != null;
  const assignedNumber = assignment.assignedNumber;

  // Format date
  const formattedDate = assignment.spunAt
    ? new Date(assignment.spunAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  // Get initials
  const initials = (assignment.fullName || 'Member')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`card border-0 mb-2 shadow-sm transition-all ${isCurrentUser ? 'ring-2' : ''}`}
      style={{
        borderRadius: '12px',
        backgroundColor: isCurrentUser ? '#F0FDF4' : '#FFFFFF',
        border: isCurrentUser ? '1.5px solid #10B981' : '1px solid #E2E8F0',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      <div className="card-body p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        {/* Left: Avatar & Member Info */}
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              background: isOrganizer
                ? 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)'
                : isNo
                ? 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)'
                : hasSpun
                ? 'linear-gradient(135deg, #0097B2 0%, #0F2F3D 100%)'
                : '#94A3B8',
              fontSize: '0.88rem'
            }}
          >
            {isOrganizer ? '👑' : initials}
          </div>

          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark" style={{ fontSize: '0.93rem' }}>
                {assignment.fullName}
              </span>
              {isCurrentUser && (
                <span
                  className="badge"
                  style={{ background: '#10B981', color: '#fff', fontSize: '0.65rem' }}
                >
                  YOU
                </span>
              )}
              {isOrganizer && (
                <span
                  className="badge"
                  style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', fontSize: '0.65rem' }}
                >
                  ORGANIZER
                </span>
              )}
            </div>
            <div className="text-muted" style={{ fontSize: '0.76rem' }}>
              {assignment.email || assignment.phone || 'Active Member'}
              {formattedDate && (
                <span className="ms-2 text-secondary">
                  • Spun on {formattedDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Assigned Result Badge */}
        <div>
          {isOrganizer ? (
            <div className="text-end">
              <span
                className="badge px-3 py-2 fw-bold"
                style={{
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                  color: '#92400E',
                  border: '1px solid #F59E0B',
                  fontSize: '0.85rem'
                }}
              >
                🏆 Position #1 (Reserved)
              </span>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>
                Auto-assigned by tradition
              </div>
            </div>
          ) : isNo ? (
            <div className="text-end">
              <span
                className="badge px-3 py-2 fw-bold"
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: '1px solid #FCA5A5',
                  fontSize: '0.82rem'
                }}
              >
                ❌ Landed on "NO"
              </span>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>
                Waits for next cycle
              </div>
            </div>
          ) : hasSpun && assignedNumber ? (
            <div className="text-end">
              <span
                className="badge px-3 py-2 fw-bold"
                style={{
                  background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                  color: '#065F46',
                  border: '1px solid #34D399',
                  fontSize: '0.88rem'
                }}
              >
                🎉 Position #{assignedNumber}
              </span>
              <div className="text-success small mt-1 fw-semibold" style={{ fontSize: '0.7rem' }}>
                Payout Slot Confirmed
              </div>
            </div>
          ) : (
            <div className="text-end">
              <span
                className="badge px-3 py-2 fw-semibold"
                style={{
                  background: '#F1F5F9',
                  color: '#64748B',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.8rem'
                }}
              >
                ⏳ Pending Spin
              </span>
              <div className="text-muted small mt-1" style={{ fontSize: '0.7rem' }}>
                Awaiting wheel draw
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RotationResultCard;
