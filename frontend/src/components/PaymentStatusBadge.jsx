import React from 'react';
import { useTranslation } from 'react-i18next';

const PaymentStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  
  let bgClass = 'bg-secondary';
  switch (status) {
    case 'PAID': bgClass = 'bg-success'; break;
    case 'PENDING': bgClass = 'bg-warning text-dark'; break;
    case 'OVERDUE': bgClass = 'bg-danger'; break;
    case 'LATE': bgClass = 'bg-warning'; break;
    case 'MISSED': bgClass = 'bg-dark'; break;
    default: bgClass = 'bg-secondary';
  }

  return (
    <span className={`badge ${bgClass}`}>
      {t(`status.${status}`) || status}
    </span>
  );
};

export default PaymentStatusBadge;
