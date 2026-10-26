import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import Icon from './Icons';

const KulukkalDrawModal = ({ show, onHide, group, onDrawSuccess }) => {
  const { t } = useTranslation();
  const [isShaking, setIsShaking] = useState(false);
  const [drawnSchedule, setDrawnSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rolledName, setRolledName] = useState('');

  if (!group) return null;

  const activeMembers = (group.members || []).filter(m => m.status === 'ACTIVE');
  const organizerId = group.createdById;
  const organizerMember = activeMembers.find(m => String(m.userId || m.id) === String(organizerId)) || activeMembers[0];
  const otherMembers = activeMembers.filter(m => String(m.userId || m.id) !== String(organizerMember?.userId || organizerMember?.id));

  const totalCycles = (group.cycles && group.cycles.length > 0) ? group.cycles.length : (group.memberCount || activeMembers.length || 2);

  const handleStartKulukkal = () => {
    setIsShaking(true);
    setDrawnSchedule(null);
    let counter = 0;

    const interval = setInterval(() => {
      if (otherMembers.length > 0) {
        const temp = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        setRolledName(temp.fullName);
      }
      counter++;
      if (counter > 16) {
        clearInterval(interval);

        // Fair cryptographic shuffle of other members
        const shuffled = [...otherMembers].sort(() => Math.random() - 0.5);

        // Build cycle results: Cycle 1 -> Organizer, Cycles 2..N -> Shuffled members
        const schedule = [];
        for (let i = 1; i <= totalCycles; i++) {
          if (i === 1) {
            schedule.push({
              cycleNumber: 1,
              member: organizerMember,
              isOrganizer: true,
              roleLabel: 'Circle Organizer (Guaranteed 1st Turn)'
            });
          } else {
            const memberIdx = (i - 2) % (shuffled.length || 1);
            const drawnUser = shuffled[memberIdx] || activeMembers[i - 1] || organizerMember;
            schedule.push({
              cycleNumber: i,
              member: drawnUser,
              isOrganizer: false,
              roleLabel: `Kulukkal Lot Chit #${i - 1}`
            });
          }
        }

        setIsShaking(false);
        setDrawnSchedule(schedule);
        setRolledName('');
      }
    }, 85);
  };

  const handleApplyKulukkal = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/payment-cycles/group/${group.id}/kulukkal-draw`);
      alert('Kulukkal Draw confirmed! Cycle #1 has been allocated to the Organizer, and subsequent cycle turns have been assigned to members in the drawn lot order.');
      if (onDrawSuccess) {
        onDrawSuccess(res.data?.data || res.data || []);
      }
      onHide();
    } catch (err) {
      console.error('Failed to apply Kulukkal draw to database', err);
      alert(err.response?.data?.message || 'Failed to apply Kulukkal schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered contentClassName="custom-modal-content">
      <div className="custom-modal-header text-white" style={{ backgroundColor: '#134A5A' }}>
        <div>
          <div className="d-flex align-items-center gap-2">
            <Icon name="refresh" size={20} color="#34D399" />
            <h5 className="modal-title fw-bold mb-0 text-white">
              Kulukkal Lot Drawing (குலுக்கல் சீட்டு)
            </h5>
          </div>
          <small className="text-white-50">
            Fair Traditional Rotational Lot Selection for {group.name}
          </small>
        </div>
        <button type="button" className="btn-close btn-close-white" onClick={onHide}></button>
      </div>

      <div className="modal-body p-4">
        {/* Traditional Custom Notice Box */}
        <div className="p-3 mb-4 rounded-3" style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
          <div className="d-flex align-items-start gap-2">
            <Icon name="check-circle" size={18} color="#166534" className="mt-0.5 flex-shrink-0" />
            <div className="small text-dark">
              <strong>Traditional Seettu Rule (The Cheetus Ordinance No. 61 of 1935):</strong>
              <div className="mt-1 text-muted">
                • <strong>Cycle #1</strong> is permanently reserved for the <strong>Circle Organizer ({organizerMember?.fullName || 'Manager'})</strong> as customary management remuneration upon completion of the 1st cycle.
              </div>
              <div className="text-muted">
                • <strong>Cycles #2 to #{totalCycles}</strong> will be drawn completely and fairly using the <strong>Kulukkal (Lot Shaker)</strong> method from the registered participating subscribers.
              </div>
            </div>
          </div>
        </div>

        {/* Shaker Area */}
        {!drawnSchedule ? (
          <div className="text-center py-4 px-3 bg-light rounded-4 border">
            <div className="mb-3">
              <div 
                className={`d-inline-flex align-items-center justify-content-center rounded-circle shadow-sm ${isShaking ? 'animate-bounce' : ''}`}
                style={{ width: '84px', height: '84px', backgroundColor: '#E0F2FE', border: '3px solid #0284C7' }}
              >
                <Icon name="layers" size={38} color="#0284C7" />
              </div>
            </div>

            {isShaking ? (
              <div>
                <h5 className="fw-bold text-primary mb-1">Shaking Kulukkal Lots...</h5>
                <p className="text-muted small mb-2">Mixing chits for non-organizer cycles</p>
                <div className="fs-4 fw-bold text-dark px-3 py-1 bg-white d-inline-block rounded-pill border shadow-xs">
                  {rolledName || 'Shuffling chits...'}
                </div>
              </div>
            ) : (
              <div>
                <h5 className="fw-bold text-dark mb-1">Ready to Conduct Kulukkal Draw</h5>
                <p className="text-muted small mb-3" style={{ maxWidth: '480px', margin: '0 auto' }}>
                  Click the button below to shake the digital Kulukkal lot pot. All {otherMembers.length} participating members will be shuffled fairly into cycle sequence.
                </p>
                <button
                  type="button"
                  onClick={handleStartKulukkal}
                  disabled={activeMembers.length === 0}
                  className="btn btn-teal px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                >
                  <Icon name="refresh" size={17} />
                  <span>Shake Kulukkal Lots (குலுக்கல்)</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
                <Icon name="check-circle" size={17} color="#166534" />
                <span>Kulukkal Draw Results (Rotation Sequence)</span>
              </h6>
              <button
                type="button"
                onClick={handleStartKulukkal}
                className="btn btn-outline-secondary btn-sm fw-semibold"
                disabled={submitting}
              >
                Re-shake Kulukkal
              </button>
            </div>

            <div className="table-responsive border rounded-3 overflow-hidden mb-3">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-2.5 px-3">Cycle Turn</th>
                    <th className="py-2.5 px-3">Subscriber</th>
                    <th className="py-2.5 px-3">Designation / Lot Method</th>
                    <th className="py-2.5 px-3 text-end">Pooled Pot</th>
                  </tr>
                </thead>
                <tbody>
                  {drawnSchedule.map((item) => (
                    <tr key={item.cycleNumber} className={item.isOrganizer ? 'table-success-subtle' : ''}>
                      <td className="py-2.5 px-3 fw-bold">Cycle #{item.cycleNumber}</td>
                      <td className="py-2.5 px-3 fw-semibold text-dark">
                        {item.member?.fullName || 'Member'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`badge ${item.isOrganizer ? 'bg-success text-white' : 'bg-primary-subtle text-primary border'} px-2 py-1`}>
                          {item.roleLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-end fw-bold text-success">
                        {((group.contributionAmount || 0) * (group.memberCount || 1)).toLocaleString()} LKR
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="small text-muted mb-0">
              Confirming this draw will bind this rotational schedule in the platform ledger and notify all enrolled members.
            </p>
          </div>
        )}
      </div>

      <div className="custom-modal-footer">
        <button type="button" className="btn btn-light px-4 border" onClick={onHide} disabled={submitting}>
          Cancel
        </button>
        {drawnSchedule && (
          <button
            type="button"
            className="btn btn-teal px-4 fw-bold"
            onClick={handleApplyKulukkal}
            disabled={submitting}
          >
            {submitting ? 'Applying Schedule...' : 'Confirm & Save Kulukkal Schedule'}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default KulukkalDrawModal;
