import React from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from './Icons';

const DeletePaymentModal = ({ show, onHide, payment, onDelete }) => {
  const { t } = useTranslation();
  if (!payment) return null;

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', backgroundColor: '#FEE2E2', color: '#EF4444' }}
          >
            <Icon name="trash" size={16} color="#EF4444" />
          </div>
          <h5 className="fw-bold mb-0 text-dark">{t('payments_page.delete_payment_title')}</h5>
        </div>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="custom-modal-body">
        <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
          {t('payments_page.delete_payment_confirmation')}
        </p>

        <div className="bg-light p-3 rounded-3 border mb-1">
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">{t('payments_page.member')}:</span>
            <span className="fw-semibold text-dark">{payment.member || payment.memberName || t('payments_page.member')}</span>
          </div>
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">{t('payments_page.group')}:</span>
            <span className="fw-semibold text-dark">{payment.group || '—'}</span>
          </div>
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">{t('payments_page.amount')}:</span>
            <span className="fw-semibold text-dark">{payment.amount ? `${Number(payment.amount).toLocaleString()} ${t('payments_page.currency')}` : '—'}</span>
          </div>
          <div className="d-flex justify-content-between py-1 small">
            <span className="text-muted">{t('payments_page.date')}:</span>
            <span className="fw-semibold text-dark">{payment.date || '—'}</span>
          </div>
        </div>
      </div>

      <div className="custom-modal-footer">
        <button type="button" className="btn btn-light px-4 border" onClick={onHide}>
          {t('payments_page.cancel')}
        </button>
        <button
          type="button"
          className="btn btn-danger px-4"
          onClick={() => {
            if (onDelete) onDelete(payment);
            onHide();
          }}
        >
          {t('payments_page.delete_record')}
        </button>
      </div>
    </Modal>
  );
};

export default DeletePaymentModal;
