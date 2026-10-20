import React from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Icon from './Icons';

const ReviewPayoutModal = ({ show, onHide, payoutData, onApprove, canManage = true }) => {
  const { t } = useTranslation();
  const data = payoutData || {
    recipient: 'Kamala Perera',
    cycle: 'Cycle 3 Payout',
    scheduledDate: '2026-03-20',
    amount: '24,000 LKR'
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-content">
      <div className="custom-modal-header">
        <h5 className="fw-bold mb-0 text-dark">
          {canManage 
            ? t('modals.review_payout.title_manage', 'Review Upcoming Payout') 
            : t('modals.review_payout.title_view', 'Upcoming Payout Details')}
        </h5>
        <button className="btn btn-link text-muted p-0 border-0" onClick={onHide}>
          <Icon name="x" size={20} />
        </button>
      </div>

      <div className="custom-modal-body">
        <div className="bg-light p-3 rounded-3 border mb-3">
          <div className="d-flex justify-content-between py-1">
            <span className="text-muted">{t('modals.review_payout.recipient', 'Recipient:')}</span>
            <span className="fw-bold text-dark">{data.recipient}</span>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span className="text-muted">{t('modals.review_payout.cycle', 'Cycle:')}</span>
            <span className="fw-semibold text-dark">{data.cycle}</span>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span className="text-muted">{t('modals.review_payout.scheduled_date', 'Scheduled Date:')}</span>
            <span className="fw-semibold text-dark">{data.scheduledDate}</span>
          </div>
          
          <hr className="my-2" />

          <div className="d-flex justify-content-between align-items-center pt-1">
            <span className="fw-bold text-dark">{t('modals.review_payout.total_payout', 'Total Payout:')}</span>
            <span className="fw-bold fs-5 text-success">{data.amount}</span>
          </div>
        </div>

        <p className="small text-muted mb-0" style={{ fontSize: '0.825rem' }}>
          {canManage 
            ? t('modals.review_payout.note_manage', 'Please verify that all members have completed their contributions before approving this offline payout.') 
            : t('modals.review_payout.note_view', 'This payout is scheduled for distribution by your group Organizer upon cycle completion.')}
        </p>
      </div>

      <div className="custom-modal-footer">
        <button type="button" className="btn btn-light px-4 border" onClick={onHide}>
          {canManage 
            ? t('modals.review_payout.cancel', 'Cancel') 
            : t('modals.review_payout.close', 'Close')}
        </button>
        {canManage && (
          <button
            type="button"
            className="btn btn-teal px-4"
            onClick={() => {
              if (onApprove) onApprove(data);
              onHide();
            }}
          >
            {t('modals.review_payout.approve_btn', 'Approve Payout')}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default ReviewPayoutModal;
