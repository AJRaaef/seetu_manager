import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getRotationStatus,
  startRotation,
  setPayoutLimit,
  spinWheel,
  completeRotation
} from '../api/rotationApi';
import SpinningWheel from '../components/SpinningWheel';
import RotationResultCard from '../components/RotationResultCard';
import Icon from '../components/Icons';
import { getErrorMessage } from '../utils/errorHandler';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const MonthlyRotationPage = () => {
  const { cycleId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Wheel animation states
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetResult, setTargetResult] = useState(null);
  const [spinError, setSpinError] = useState('');

  // Modal / Popup states for spin result
  const [popupResult, setPopupResult] = useState(null); // { isNo: boolean, number: number|string }
  const [showConfetti, setShowConfetti] = useState(false);

  // Organizer controls
  const [limitInput, setLimitInput] = useState('');
  const [savingLimit, setSavingLimit] = useState(false);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Fetch full status
  const fetchStatus = useCallback(async () => {
    try {
      setError('');
      const res = await getRotationStatus(cycleId);
      const data = res.data || res;
      setStatusData(data);
      if (data.maxPayoutSlots) {
        setLimitInput(String(data.maxPayoutSlots));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch rotation status for this cycle.'));
    } finally {
      setLoading(false);
    }
  }, [cycleId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle Organizer Setting Limit
  const handleSetLimit = async (e) => {
    e?.preventDefault();
    const limitVal = parseInt(limitInput, 10);
    if (!limitVal || limitVal < 1) {
      setError('Please enter a valid payout limit (minimum 1).');
      return;
    }
    setSavingLimit(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await setPayoutLimit(cycleId, limitVal);
      setSuccessMsg(`Monthly payout slots limit set to ${limitVal}.`);
      setStatusData(res.data || res);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update payout slots limit.'));
    } finally {
      setSavingLimit(false);
    }
  };

  // Handle Organizer Start Rotation
  const handleStartRotation = async () => {
    setStarting(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await startRotation(cycleId);
      setSuccessMsg('Rotation opened! Active members can now spin the wheel.');
      setStatusData(res.data || res);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to start rotation.'));
    } finally {
      setStarting(false);
    }
  };

  // Handle Member Spin Action
  const handleSpinClick = async () => {
    if (isSpinning) return;
    setSpinError('');
    setError('');
    setIsSpinning(true);

    try {
      const res = await spinWheel(cycleId);
      const resultData = res.data || res;

      // Backend calculated the result: feed to wheel for animation
      const resultVal = resultData.spinResult || (resultData.isNo ? 'NO' : String(resultData.assignedNumber));
      setTargetResult(resultVal);
    } catch (err) {
      setIsSpinning(false);
      setSpinError(getErrorMessage(err, 'Failed to spin the wheel.'));
    }
  };

  // Callback when wheel finishes animation
  const handleSpinComplete = (finalResult) => {
    setIsSpinning(false);
    const isNo = String(finalResult).toUpperCase() === 'NO';

    if (isNo) {
      setPopupResult({ isNo: true, number: null });
    } else {
      setPopupResult({ isNo: false, number: finalResult });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 6000);
    }

    // Refresh status to update lists, strikethrough taken numbers, and locked state
    fetchStatus();
  };

  // Handle Finalize / Complete Rotation (Organizer)
  const handleFinalize = async () => {
    if (!window.confirm('Are you sure you want to finalize this rotation? This locks all numbers and confirms the payout recipient.')) {
      return;
    }
    setCompleting(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await completeRotation(cycleId);
      setSuccessMsg('Rotation finalized and locked successfully!');
      setStatusData(res.data || res);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to complete rotation.'));
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ color: '#0097B2' }} role="status" />
        <p className="mt-3 text-muted fw-semibold">Loading Monthly Seettu Rotation...</p>
      </div>
    );
  }

  const isFullyPaid = statusData?.isFullyPaid;
  const rotationStatus = statusData?.rotationStatus || 'PENDING';
  const isOrganizer = statusData?.isOrganizer;
  const canSpin = statusData?.canSpin && !isSpinning;
  const hasSpun = statusData?.hasSpun;
  const isLocked = statusData?.isLocked;
  const allPossibleNumbers = statusData?.allPossibleNumbers || [];
  const takenNumbers = statusData?.takenNumbers || [];
  const availableNumbers = statusData?.availableNumbers || [];
  const assignments = statusData?.assignments || [];
  const maxSlots = statusData?.maxPayoutSlots;

  // Determine disabled reason for wheel
  let wheelDisabledReason = '';
  if (!isFullyPaid) {
    wheelDisabledReason = 'Awaiting all members to complete payments before rotation can begin.';
  } else if (rotationStatus === 'PENDING') {
    wheelDisabledReason = 'Wheel is locked. Awaiting organizer to click "Start Rotation".';
  } else if (rotationStatus === 'COMPLETED') {
    wheelDisabledReason = 'Rotation is finalized and locked for this cycle.';
  } else if (isOrganizer) {
    wheelDisabledReason = 'The Organizer is automatically assigned position #1 and does not spin.';
  } else if (hasSpun) {
    wheelDisabledReason = `You have already spun! Result: ${statusData?.myResult?.spinResult || 'Completed'}.`;
  } else if (isLocked) {
    wheelDisabledReason = 'The wheel is locked for this month (limit reached or all members have spun).';
  }

  return (
    <div className="container py-4">
      {/* Confetti celebration for successful number draw */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={450}
          gravity={0.25}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 99999, pointerEvents: 'none' }}
        />
      )}

      {/* Top Header & Breadcrumb */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <Link
            to={statusData?.groupId ? `/groups/${statusData.groupId}` : '/groups'}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          >
            <Icon name="arrow-left" size={16} /> Back to Group
          </Link>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#0F2F3D' }}>
              🎡 Monthly Seettu Spinning Wheel Rotation
            </h3>
            <small className="text-muted">
              {statusData?.groupName} • Cycle #{statusData?.cycleNumber} • {statusData?.totalMembersCount} Total Members
            </small>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {rotationStatus === 'IN_PROGRESS' && !isLocked && (
            <span className="badge px-3 py-2 bg-success text-white fw-bold shadow-xs" style={{ fontSize: '0.85rem' }}>
              ● ROTATION OPEN
            </span>
          )}
          {rotationStatus === 'IN_PROGRESS' && isLocked && (
            <span className="badge px-3 py-2 bg-warning text-dark fw-bold shadow-xs" style={{ fontSize: '0.85rem' }}>
              🔒 WHEEL LOCKED (LIMIT REACHED)
            </span>
          )}
          {rotationStatus === 'COMPLETED' && (
            <span className="badge px-3 py-2 bg-secondary text-white fw-bold shadow-xs" style={{ fontSize: '0.85rem' }}>
              ✓ ROTATION COMPLETED
            </span>
          )}
          {rotationStatus === 'PENDING' && (
            <span className="badge px-3 py-2 bg-warning text-dark fw-bold shadow-xs" style={{ fontSize: '0.85rem' }}>
              ⏳ AWAITING START
            </span>
          )}
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-3" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{error}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setError('')} />
        </div>
      )}
      {spinError && (
        <div className="alert alert-warning alert-dismissible fade show d-flex align-items-center gap-2 mb-3" role="alert">
          <Icon name="alert-circle" size={18} />
          <div>{spinError}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setSpinError('')} />
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2 mb-3" role="alert">
          <Icon name="check-circle" size={18} />
          <div className="fw-semibold">{successMsg}</div>
          <button type="button" className="btn-close ms-auto" onClick={() => setSuccessMsg('')} />
        </div>
      )}

      {/* Payment Completeness Warning (Rule 1) */}
      {!isFullyPaid && (
        <div
          className="alert border-0 p-4 mb-4 shadow-sm"
          style={{ background: '#FFFBEB', borderLeft: '5px solid #F59E0B', borderRadius: '12px' }}
        >
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-warning flex-shrink-0"
              style={{ width: '44px', height: '44px', background: '#FEF3C7' }}
            >
              <Icon name="lock" size={24} color="#D97706" />
            </div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1" style={{ color: '#92400E' }}>
                Awaiting all members to complete payments before rotation can begin.
              </h5>
              <p className="mb-2" style={{ color: '#B45309', fontSize: '0.92rem' }}>
                All member contributions must be marked as PAID before the Organizer can open the rotation wheel.
              </p>
              <div className="d-flex align-items-center gap-3 mt-2">
                <div className="progress flex-grow-1" style={{ height: '10px', borderRadius: '5px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
                    role="progressbar"
                    style={{
                      width: `${statusData?.totalMembersCount ? (statusData.paidMembersCount / statusData.totalMembersCount) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="fw-bold small" style={{ color: '#92400E' }}>
                  {statusData?.paidMembersCount} / {statusData?.totalMembersCount} Members Paid
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Number Pool Tracker: Visual Strikethrough/Cross (X) on Taken Numbers (Rule 5) */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '14px', background: '#FFFFFF' }}>
        <div className="card-body p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
              <h6 className="fw-bold mb-0 text-dark">
                🎯 Monthly Number Pool (Numbers 2 to {statusData?.totalMembersCount || 'N'})
              </h6>
              <small className="text-muted">
                Position #1 is reserved for Organizer. Numbers taken by members are crossed out with (X).
              </small>
            </div>
            <div className="d-flex gap-2 align-items-center">
              <span className="badge bg-light text-secondary border">
                {availableNumbers.length} Available
              </span>
              <span className="badge bg-danger-subtle text-danger border border-danger">
                {takenNumbers.length} Taken
              </span>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            {/* Position 1 Badge */}
            <span
              className="badge px-3 py-2 fw-bold"
              style={{
                background: '#FEF3C7',
                color: '#92400E',
                border: '1.5px solid #F59E0B',
                fontSize: '0.85rem'
              }}
              title="Position #1 is automatically assigned to Organizer"
            >
              👑 #1 (Organizer)
            </span>

            {/* Numbers from 2 to N */}
            {allPossibleNumbers.map((num) => {
              const isTaken = takenNumbers.includes(num);
              return isTaken ? (
                <span
                  key={num}
                  className="badge px-3 py-2 fw-bold position-relative text-decoration-line-through shadow-xs"
                  style={{
                    background: '#FEE2E2',
                    color: '#991B1B',
                    border: '1.5px solid #EF4444',
                    fontSize: '0.85rem',
                    opacity: 0.85
                  }}
                  title={`Position #${num} is taken`}
                >
                  ❌ #{num}
                </span>
              ) : (
                <span
                  key={num}
                  className="badge px-3 py-2 fw-bold shadow-xs"
                  style={{
                    background: '#E0F2FE',
                    color: '#0369A1',
                    border: '1.5px solid #38BDF8',
                    fontSize: '0.85rem'
                  }}
                  title={`Position #${num} is available on the wheel`}
                >
                  #{num}
                </span>
              );
            })}

            {/* "NO" Option Badge */}
            <span
              className="badge px-3 py-2 fw-bold"
              style={{
                background: '#F8FAFC',
                color: '#475569',
                border: '1.5px dashed #94A3B8',
                fontSize: '0.85rem'
              }}
              title="Wheel always includes one NO option"
            >
              ❌ NO (Wait next month)
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Wheel, Right Members & Controls */}
      <div className="row g-4">
        {/* Left Column: Spinning Wheel */}
        <div className="col-12 col-lg-6">
          <div className="ui-card p-3 p-md-4 shadow-sm h-100 d-flex flex-column align-items-center justify-content-between">
            <div className="w-100 text-center mb-2">
              <h5 className="fw-bold mb-1" style={{ color: '#0F2F3D' }}>
                🎡 Draw Your Monthly Payout Order
              </h5>
              <p className="text-muted small mb-0">
                Spin to receive a number (2 to {statusData?.totalMembersCount}). If you land on "NO", you wait for the next month.
              </p>
            </div>

            {/* Spinning Wheel */}
            <SpinningWheel
              availableNumbers={availableNumbers}
              mustSpin={isSpinning}
              targetResult={targetResult}
              onSpinClick={handleSpinClick}
              onSpinComplete={handleSpinComplete}
              disabled={!canSpin}
              disabledMessage={wheelDisabledReason}
            />

            {/* Member's Personal Result Card */}
            {hasSpun && statusData?.myResult && (
              <div
                className="w-100 p-3 mt-3 rounded-3 text-center"
                style={{
                  background: statusData.myResult.spinResult === 'NO' ? '#FEE2E2' : '#ECFDF5',
                  border: statusData.myResult.spinResult === 'NO' ? '1.5px solid #FCA5A5' : '1.5px solid #A7F3D0'
                }}
              >
                <span className="text-muted small fw-semibold d-block mb-1">Your Result:</span>
                <div
                  className="fw-bold"
                  style={{
                    fontSize: '1.25rem',
                    color: statusData.myResult.spinResult === 'NO' ? '#991B1B' : '#065F46'
                  }}
                >
                  {statusData.myResult.spinResult === 'NO'
                    ? '😢 Landed on "NO" — You do not receive a payout this month'
                    : `🎉 You got #${statusData.myResult.assignedNumber}! Payout order confirmed`}
                </div>
              </div>
            )}

            {/* Organizer Note */}
            {isOrganizer && (
              <div className="w-100 p-3 mt-3 rounded-3 text-center" style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
                <span className="fw-bold" style={{ color: '#92400E' }}>
                  👑 Organizer Position #1 Reserved
                </span>
                <p className="small mb-0 mt-1" style={{ color: '#B45309' }}>
                  You supervise member draws and finalize the rotation order once members finish spinning.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Organizer Controls & Member Spin Status Roster */}
        <div className="col-12 col-lg-6">
          {/* Organizer Control Panel (Rule 1 & Rule 3) */}
          {isOrganizer && (
            <div
              className="card border-0 shadow-sm mb-4"
              style={{ background: 'linear-gradient(135deg, #0F2F3D 0%, #164E63 100%)', borderRadius: '16px' }}
            >
              <div className="card-body p-4 text-white">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Icon name="settings" size={20} color="#FCD34D" />
                  <h5 className="fw-bold mb-0 text-white">Organizer Control Panel</h5>
                </div>
                <p className="small text-white-50 mb-3">
                  Set how many members can spin this month, then click "Start Rotation" to open the wheel.
                </p>

                {/* Limit Input (Rule 3) */}
                <form onSubmit={handleSetLimit} className="mb-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <label className="form-label fw-semibold small mb-1 text-white">
                    Monthly Payout Slots Limit (e.g. 3)
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-dark fw-bold">Max Members</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 3"
                      min="1"
                      max={statusData?.totalMembersCount || 20}
                      value={limitInput}
                      onChange={(e) => setLimitInput(e.target.value)}
                      disabled={rotationStatus === 'COMPLETED'}
                    />
                    <button
                      type="submit"
                      className="btn btn-warning fw-bold px-3"
                      disabled={savingLimit || rotationStatus === 'COMPLETED'}
                    >
                      {savingLimit ? 'Saving...' : 'Set Limit'}
                    </button>
                  </div>
                  <small className="text-white-50 d-block mt-1" style={{ fontSize: '0.74rem' }}>
                    Wheel automatically locks after exactly {maxSlots || limitInput || 'N'} members spin this month.
                  </small>
                </form>

                {/* Organizer Action Buttons (Rule 1 & Finalize) */}
                <div className="d-flex gap-2 flex-wrap">
                  {rotationStatus !== 'IN_PROGRESS' && rotationStatus !== 'COMPLETED' && (
                    <button
                      className="btn btn-warning fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                      onClick={handleStartRotation}
                      disabled={!isFullyPaid || starting}
                      style={{ borderRadius: '8px' }}
                    >
                      {starting ? (
                        <div className="spinner-border spinner-border-sm" role="status" />
                      ) : (
                        <Icon name="play" size={16} />
                      )}
                      Start Rotation
                    </button>
                  )}

                  {rotationStatus === 'IN_PROGRESS' && (
                    <button
                      className="btn btn-success fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                      onClick={handleFinalize}
                      disabled={completing}
                      style={{ borderRadius: '8px' }}
                    >
                      {completing ? (
                        <div className="spinner-border spinner-border-sm" role="status" />
                      ) : (
                        <Icon name="check" size={16} />
                      )}
                      Finalize Rotation
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Member Roster & Spin Status List */}
          <div className="ui-card p-4 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#0F2F3D' }}>
                  👥 Member Spin Status Roster
                </h5>
                <small className="text-muted">
                  Spins Completed: {statusData?.totalSpinsCompleted || 0}
                  {maxSlots ? ` / ${maxSlots} Monthly Limit` : ''}
                </small>
              </div>

              {/* Status summary pill */}
              <div>
                <span className="badge px-3 py-2 bg-light text-dark border">
                  Remaining Spins: {statusData?.remainingSpins ?? 0}
                </span>
              </div>
            </div>

            {/* List of Member Result Cards */}
            <div className="mt-3" style={{ maxHeight: '520px', overflowY: 'auto' }}>
              {assignments.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No member assignments recorded for this cycle yet.
                </div>
              ) : (
                assignments.map((assignment) => (
                  <RotationResultCard
                    key={assignment.id || assignment.userId}
                    assignment={assignment}
                    currentUserId={user?.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: "😢 NO" or "🎉 You got [number]!" (Requirement 5) */}
      <AnimatePresence>
        {popupResult && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 100000 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="modal-content border-0 shadow-lg text-center p-4"
                style={{
                  borderRadius: '20px',
                  background: popupResult.isNo ? '#FFF5F5' : '#F0FDF4'
                }}
              >
                {popupResult.isNo ? (
                  <>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: '80px', height: '80px', background: '#FEE2E2', fontSize: '2.5rem' }}
                    >
                      😢
                    </div>
                    <h3 className="fw-bold mb-2" style={{ color: '#991B1B' }}>
                      You Landed on "NO"
                    </h3>
                    <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                      You do not receive a payout order for this month. You will wait for the next month's rotation cycle.
                    </p>
                    <button
                      className="btn btn-danger fw-bold px-4 py-2 mx-auto"
                      style={{ borderRadius: '10px' }}
                      onClick={() => setPopupResult(null)}
                    >
                      Understood
                    </button>
                  </>
                ) : (
                  <>
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                      style={{ width: '80px', height: '80px', background: '#D1FAE5', fontSize: '2.5rem' }}
                    >
                      🎉
                    </div>
                    <h3 className="fw-bold mb-1" style={{ color: '#065F46' }}>
                      You Got Position #{popupResult.number}!
                    </h3>
                    <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
                      Congratulations! Your monthly payout order has been officially recorded and reserved.
                    </p>
                    <button
                      className="btn btn-success fw-bold px-4 py-2 mx-auto"
                      style={{ borderRadius: '10px', background: '#059669' }}
                      onClick={() => setPopupResult(null)}
                    >
                      Awesome!
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonthlyRotationPage;
