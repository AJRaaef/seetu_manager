import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import Icon from './Icons';

const CHIT_COLORS = [
  '#0284C7', // Sky Blue
  '#0D9488', // Teal
  '#D97706', // Amber/Gold
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#059669', // Emerald
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#0891B2', // Cyan
  '#65A30D'  // Lime
];

const KulukkalDrawModal = ({ show, onHide, group, onDrawSuccess }) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [winningChit, setWinningChit] = useState(null);
  const [drawnSchedule, setDrawnSchedule] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!group) return null;

  const activeMembers = (group.members || []).filter((m) => m.status === 'ACTIVE');
  const organizerId = group.createdById;
  const organizerMember =
    activeMembers.find((m) => String(m.userId || m.id) === String(organizerId)) || activeMembers[0];
  const otherMembers = activeMembers.filter(
    (m) => String(m.userId || m.id) !== String(organizerMember?.userId || organizerMember?.id)
  );

  const totalCycles =
    group.cycles && group.cycles.length > 0
      ? group.cycles.length
      : group.memberCount || activeMembers.length || 2;

  // We assign chits: Chit #1 = Organizer, Chit #2..N = Other Members
  // Total chits in the wheel equals activeMembers.length (or at least 2)
  const allChitMembers = [
    organizerMember,
    ...otherMembers
  ].filter(Boolean);

  const numSlices = Math.max(2, allChitMembers.length);
  const sliceAngle = 360 / numSlices;

  // Spin the wheel with realistic deceleration physics
  const handleSpinKulukkal = () => {
    if (isSpinning || otherMembers.length === 0) return;

    setIsSpinning(true);
    setDrawnSchedule(null);
    setWinningChit(null);

    // Pick winner from subscribers (otherMembers)
    const winnerIdx = Math.floor(Math.random() * otherMembers.length);
    const chosenWinner = otherMembers[winnerIdx];
    // In allChitMembers, organizer is at index 0 (Chit #1), otherMembers are at index winnerIdx + 1 (Chit #(winnerIdx + 2))
    const winnerWheelSliceIdx = winnerIdx + 1;
    const winningChitNumber = winnerIdx + 2;

    // Calculate landing angle for winnerWheelSliceIdx to stop under top pointer (12 o'clock)
    const midAngleDeg = (winnerWheelSliceIdx * sliceAngle) + (sliceAngle / 2) - 90;
    const targetAngle = (360 - ((midAngleDeg + 90) % 360)) % 360;

    // Spin at least 6 full revolutions (2160 deg) plus offset
    const fullSpins = 6;
    const nextRotation = rotationDeg + fullSpins * 360 + ((targetAngle - (rotationDeg % 360) + 360) % 360);

    setRotationDeg(nextRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningChit({
        number: winningChitNumber,
        member: chosenWinner
      });

      // Fair shuffle of remaining subscribers for subsequent cycles
      const remainingOthers = otherMembers.filter(
        (m) => String(m.userId || m.id) !== String(chosenWinner.userId || chosenWinner.id)
      );
      const shuffledRemaining = [...remainingOthers].sort(() => Math.random() - 0.5);
      const subscribersOrdered = [chosenWinner, ...shuffledRemaining];

      const schedule = [];
      for (let i = 1; i <= totalCycles; i++) {
        if (i === 1) {
          schedule.push({
            cycleNumber: 1,
            chitNumber: 1,
            member: organizerMember,
            isOrganizer: true,
            roleLabel: 'Circle Organizer (Guaranteed 1st Turn)'
          });
        } else {
          const subIdx = (i - 2) % subscribersOrdered.length;
          const assignedMember = subscribersOrdered[subIdx] || activeMembers[i - 1] || organizerMember;
          const originalChitIdx = otherMembers.findIndex(
            (om) => String(om.userId || om.id) === String(assignedMember?.userId || assignedMember?.id)
          );
          const chitNum = originalChitIdx !== -1 ? originalChitIdx + 2 : i;

          schedule.push({
            cycleNumber: i,
            chitNumber: chitNum,
            member: assignedMember,
            isOrganizer: false,
            roleLabel: `Kulukkal Lot Chit #${chitNum}`
          });
        }
      }

      setDrawnSchedule(schedule);
    }, 3900);
  };

  const handleApplyKulukkal = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/payment-cycles/group/${group.id}/kulukkal-draw`);
      alert(
        'Kulukkal Draw confirmed! Cycle #1 has been allocated to the Organizer, and subsequent cycle turns have been assigned in drawn lot order.'
      );
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

  // Helper to render SVG slices with large, bold, centered numbers
  const renderWheelSlices = () => {
    const cx = 140;
    const cy = 140;
    const r = 126;

    return allChitMembers.map((member, i) => {
      const startAngleDeg = i * sliceAngle - 90;
      const endAngleDeg = (i + 1) * sliceAngle - 90;
      const midAngleDeg = startAngleDeg + sliceAngle / 2;

      const startRad = (startAngleDeg * Math.PI) / 180;
      const endRad = (endAngleDeg * Math.PI) / 180;
      const midRad = (midAngleDeg * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      // Numbers placed at radius 75px (far away from center hub)
      const textR = r * 0.62;
      const tx = cx + textR * Math.cos(midRad);
      const ty = cy + textR * Math.sin(midRad);

      const chitNum = i + 1;
      const color = CHIT_COLORS[i % CHIT_COLORS.length];

      return (
        <g key={chitNum}>
          {/* Slice Wedge */}
          <path
            d={pathData}
            fill={color}
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          {/* Slice Chit Number - Large, Bold and Clear */}
          <text
            x={tx}
            y={ty}
            fill="#FFFFFF"
            fontSize={numSlices > 8 ? '20' : '26'}
            fontWeight="900"
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
              letterSpacing: '-0.5px'
            }}
          >
            #{chitNum}
          </text>
        </g>
      );
    });
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
                • <strong>Cycles #2 to #{totalCycles}</strong> are drawn using this live <strong>Kulukkal Number Wheel</strong> across all participating subscribers.
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Spinner & Chit Legend Section */}
        <div className="bg-light rounded-4 border p-4 mb-4">
          <div className="row g-4 align-items-center">
            {/* Spinning Wheel */}
            <div className="col-12 col-md-6 text-center">
              <div style={{ position: 'relative', width: '280px', height: '280px', margin: '0 auto' }}>
                {/* Fixed Ticker Needle pointing down at 12 o'clock */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '14px solid transparent',
                    borderRight: '14px solid transparent',
                    borderTop: '26px solid #DC2626',
                    zIndex: 30,
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))'
                  }}
                />

                {/* Rotating SVG Wheel */}
                <svg
                  width="280"
                  height="280"
                  viewBox="0 0 280 280"
                  style={{
                    transform: `rotate(${rotationDeg}deg)`,
                    transition: isSpinning
                      ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)'
                      : 'none',
                    filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.18))'
                  }}
                >
                  {/* Outer Rim Ring */}
                  <circle cx="140" cy="140" r="130" fill="none" stroke="#FFFFFF" strokeWidth="6" />

                  {/* Numbered Slices */}
                  {renderWheelSlices()}

                  {/* Wheel Center Hub - Small Pin (Does NOT cover numbers) */}
                  <circle cx="140" cy="140" r="22" fill="#FFFFFF" stroke="#0F2F3D" strokeWidth="3" />
                  <circle cx="140" cy="140" r="10" fill="#0F2F3D" />
                  <circle cx="140" cy="140" r="4" fill="#34D399" />
                </svg>
              </div>

              <div className="mt-3">
                {isSpinning ? (
                  <div className="badge rounded-pill bg-primary px-3 py-1.5 fs-6 shadow-sm">
                    Spinning Kulukkal Wheel...
                  </div>
                ) : winningChit ? (
                  <div className="badge rounded-pill bg-success px-3.5 py-1.5 fs-6 shadow-sm">
                    Drawn: Chit #{winningChit.number} ({winningChit.member?.fullName})
                  </div>
                ) : (
                  <span className="small text-muted fw-semibold">
                    {allChitMembers.length} Members on Number Wheel
                  </span>
                )}
              </div>
            </div>

            {/* Member Chit Mapping Table */}
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
                <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                  <Icon name="users" size={16} color="#0F2F3D" />
                  <span>Kulukkal Lot Chits (சீட்டு எண்கள்)</span>
                </h6>
                <div className="d-flex flex-column gap-2 small">
                  {/* Organizer Chit #1 */}
                  <div
                    className="d-flex align-items-center justify-content-between p-2 rounded-2"
                    style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="badge rounded-pill text-white fw-bold px-2.5 py-1 shadow-xs"
                        style={{ backgroundColor: CHIT_COLORS[0] }}
                      >
                        Chit #1
                      </span>
                      <span className="fw-bold text-dark">
                        {organizerMember?.fullName || 'Circle Organizer'}
                      </span>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                      Cycle 1 (Guaranteed)
                    </span>
                  </div>

                  {/* Subscriber Chits #2..N */}
                  {otherMembers.map((m, idx) => {
                    const chitNum = idx + 2;
                    const color = CHIT_COLORS[(idx + 1) % CHIT_COLORS.length];
                    const isWinner = winningChit && winningChit.number === chitNum;

                    return (
                      <div
                        key={m.userId || m.id || idx}
                        className={`d-flex align-items-center justify-content-between p-2 rounded-2 border ${
                          isWinner ? 'bg-success-subtle border-success' : 'bg-light'
                        }`}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="badge rounded-pill text-white fw-bold px-2.5 py-1 shadow-xs"
                            style={{ backgroundColor: color }}
                          >
                            Chit #{chitNum}
                          </span>
                          <span className="fw-semibold text-dark">{m.fullName}</span>
                        </div>
                        <span className="text-muted small">
                          {isWinner ? (
                            <strong className="text-success">Won Cycle #2</strong>
                          ) : (
                            'In Wheel Pool'
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={handleSpinKulukkal}
                    disabled={isSpinning || otherMembers.length === 0}
                    className="btn btn-teal w-100 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center justify-content-center gap-2"
                  >
                    <Icon name="refresh" size={17} />
                    <span>
                      {isSpinning
                        ? 'Spinning...'
                        : drawnSchedule
                        ? 'Spin Again (மீண்டும் சுழற்று)'
                        : 'Spin Kulukkal Wheel (குலுக்கல் சுழற்று)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawn Results Schedule Table */}
        {drawnSchedule && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
                <Icon name="check-circle" size={17} color="#166534" />
                <span>Kulukkal Draw Results (Rotation Sequence)</span>
              </h6>
            </div>

            <div className="table-responsive border rounded-3 overflow-hidden mb-3">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-2.5 px-3">Cycle Turn</th>
                    <th className="py-2.5 px-3">Lot Chit</th>
                    <th className="py-2.5 px-3">Subscriber</th>
                    <th className="py-2.5 px-3">Designation / Lot Method</th>
                    <th className="py-2.5 px-3 text-end">Pooled Pot</th>
                  </tr>
                </thead>
                <tbody>
                  {drawnSchedule.map((item) => (
                    <tr
                      key={item.cycleNumber}
                      className={item.isOrganizer ? 'table-success-subtle' : ''}
                    >
                      <td className="py-2.5 px-3 fw-bold">Cycle #{item.cycleNumber}</td>
                      <td className="py-2.5 px-3">
                        <span className="badge rounded-pill bg-secondary px-2.5 py-1">
                          Chit #{item.chitNumber}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 fw-semibold text-dark">
                        {item.member?.fullName || 'Member'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`badge ${
                            item.isOrganizer
                              ? 'bg-success text-white'
                              : 'bg-primary-subtle text-primary border'
                          } px-2 py-1`}
                        >
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
        <button
          type="button"
          className="btn btn-light px-4 border"
          onClick={onHide}
          disabled={submitting || isSpinning}
        >
          Cancel
        </button>
        {drawnSchedule && (
          <button
            type="button"
            className="btn btn-teal px-4 fw-bold"
            onClick={handleApplyKulukkal}
            disabled={submitting || isSpinning}
          >
            {submitting ? 'Applying Schedule...' : 'Confirm & Save Kulukkal Schedule'}
          </button>
        )}
      </div>
    </Modal>
  );
};

export default KulukkalDrawModal;
