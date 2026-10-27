import React from 'react';

const VerificationStatusBadge = ({ status, className = '' }) => {
  const normStatus = (status || 'INCOMPLETE').toUpperCase();

  let badgeStyle = {
    backgroundColor: '#6C757D',
    color: '#FFFFFF',
    text: 'INCOMPLETE',
    icon: '○'
  };

  switch (normStatus) {
    case 'VERIFIED':
      badgeStyle = {
        backgroundColor: '#198754',
        color: '#FFFFFF',
        text: 'VERIFIED',
        icon: '✓'
      };
      break;
    case 'PENDING':
      badgeStyle = {
        backgroundColor: '#FFC107',
        color: '#000000',
        text: 'PENDING',
        icon: '⏳'
      };
      break;
    case 'REJECTED':
      badgeStyle = {
        backgroundColor: '#DC3545',
        color: '#FFFFFF',
        text: 'REJECTED',
        icon: '✕'
      };
      break;
    case 'INCOMPLETE':
    case 'UNVERIFIED':
    default:
      badgeStyle = {
        backgroundColor: '#6C757D',
        color: '#FFFFFF',
        text: normStatus === 'UNVERIFIED' ? 'UNVERIFIED' : 'INCOMPLETE',
        icon: '○'
      };
      break;
  }

  return (
    <span
      className={`badge rounded-pill fw-bold d-inline-flex align-items-center gap-1 px-2.5 py-1 ${className}`}
      style={{
        backgroundColor: badgeStyle.backgroundColor,
        color: badgeStyle.color,
        fontSize: '0.8rem',
        letterSpacing: '0.3px',
      }}
    >
      <span style={{ fontSize: '0.75rem' }}>{badgeStyle.icon}</span>
      <span>{badgeStyle.text}</span>
    </span>
  );
};

export default VerificationStatusBadge;
