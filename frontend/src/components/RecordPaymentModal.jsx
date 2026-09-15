import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { recordPayment } from '../api/paymentApi';
import { useAuth } from '../hooks/useAuth';

const RecordPaymentModal = ({ show, onHide, paymentInfo, onSuccess }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recordPayment({
        cycleId: paymentInfo.cycleId,
        memberId: paymentInfo.memberId,
        amount: parseFloat(amount),
        notes
      }, user.userId);
      onSuccess();
      onHide();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{t('record_payment')}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <strong>Cycle:</strong> {paymentInfo?.cycleNumber}
          </div>
          <div className="mb-3">
            <strong>Member:</strong> {paymentInfo?.memberName}
          </div>
          <Form.Group className="mb-3">
            <Form.Label>{t('amount')}</Form.Label>
            <Form.Control 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required 
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>{t('notes')}</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>{t('cancel')}</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Recording...' : t('submit')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RecordPaymentModal;
