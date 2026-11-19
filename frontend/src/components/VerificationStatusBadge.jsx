import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const VerificationStatusBadge = ({ status, className = '' }) => {
  const { t } = useTranslation();
  const normStatus = (status || 'INCOMPLETE').toUpperCase();

  let badgeStyle = {
    backgroundColor: '#6C757D',
    color: '#FFFFFF',
    text: 'INCOMPLETE',
    Icon: AlertCircle
  };

  switch (normStatus) {
    case 'VERIFIED':
      badgeStyle = {
        backgroundColor: '#198754',
        color: '#FFFFFF',
        text: t('verification_page.verified_badge', 'VERIFIED'),
        Icon: CheckCircle2
      };
      break;
    case 'PENDING':
      badgeStyle = {
        backgroundColor: '#FFC107',
        color: '#000000',
        text: 'PENDING',
        Icon: Clock
      };
      break;
    case 'REJECTED':
      badgeStyle = {
        backgroundColor: '#DC3545',
        color: '#FFFFFF',
        text: 'REJECTED',
        Icon: XCircle
      };
      break;
    case 'INCOMPLETE':
    case 'UNVERIFIED':
    default:
      badgeStyle = {
        backgroundColor: '#6C757D',
        color: '#FFFFFF',
        text: normStatus === 'UNVERIFIED' ? 'UNVERIFIED' : 'INCOMPLETE',
        Icon: AlertCircle
      };
      break;
  }

  const { Icon } = badgeStyle;

  return (
    <span
      className={`badge rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 px-2.5 py-1 ${className}`}
      style={{
        backgroundColor: badgeStyle.backgroundColor,
        color: badgeStyle.color,
        fontSize: '0.8rem',
        letterSpacing: '0.3px',
      }}
    >
      <Icon size={13} strokeWidth={2.2} />
      <span>{badgeStyle.text}</span>
    </span>
  );
};

export default VerificationStatusBadge;
