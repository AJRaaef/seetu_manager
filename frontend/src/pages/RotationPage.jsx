import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getRotationStatus,
  initializeRotation,
  spinWheel,
  completeRotation
} from '../api/rotationApi';
import SpinningWheel from '../components/SpinningWheel';
import RotationResultCard from '../components/RotationResultCard';
import Icon from '../components/Icons';
import { getErrorMessage } from '../utils/errorHandler';

const RotationPage = () => {
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
  const [myWonResult, setMyWonResult] = useState(null);

  // Organizer controls
  const [monthlySlotsInput, setMonthlySlotsInput] = useState('');
  const [initializing, setInitializing] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Fetch full status
  const fetchStatus = useCallback(async () => {
    try {
      setError('');
      const res = await getRotationStatus(cycleId);
      const data = res.data || res;
      setStatusData(data);
      if (data.maxPayoutSlots) {
        setMonthlySlotsInput(String(data.maxPayoutSlots));
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

  // Handle Initialize (Organizer)
  const handleInitialize = async () => {
    setInitializing(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = {};
      if (statusData?.cycleFrequency === 'MONTHLY' && monthlySlotsInput) {
        const slots = parseInt(monthlySlotsInput, 10);
        if (slots > 0) payload.maxPayoutSlots = slots;
      }
      const res = await initializeRotation(cycleId, payload);
      setSuccessMsg('Spinning wheel rotation opened! All active members can now spin.');
      setStatusData(res.data || res);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to initialize rotation.'));
    } finally {
      setInitializing(false);
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

      // Backend calculated the result! Feed it to the wheel to animate
      const resultVal = resultData.spinResult || String(resultData.assignedNumber || 'NO');
      setTargetResult(resultVal);
      setMyWonResult(resultData);
    } catch (err) {
      setIsSpinning(false);
      setSpinError(getErrorMessage(err, 'Failed to spin the wheel.'));
    }
  };

  // Callback when wheel finishes its 4-second animation
  const handleSpinComplete = (finalResult) => {
    setIsSpinning(false);
    if (finalResult === 'NO' || myWonResult?.isNo) {
      setSuccessMsg('You landed on "NO". You will wait for the next month\'s rotation cycle.');
    } else {
      setSuccessMsg(`🎉 Congratulations! You won payout position #${finalResult}!`);
    }
    // Refresh status to update lists and taken numbers
    fetchStatus();
  };

  // Handle Finalize / Complete Rotation (Organizer)
  const handleFinalize = async () => {
    if (!window.confirm('Are you sure you want to finalize this rotation? This locks all numbers and confirms the payout member.')) {
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
        <p className="mt-3 text-muted fw-semibold">Loading spinning wheel rotation...</p>
      </div>
    );
  }

  const isFullyPaid = statusData?.isFullyPaid;
  const rotationStatus = statusData?.rotationStatus || 'PENDING';
  const isOrganizer = statusData?.isOrganizer;
  const canSpin = statusData?.canSpin && !isSpinning;
  const hasSpun = statusData?.hasSpun;
  const availableNumbers = statusData?.availableNumbers || [];
  const assignments = statusData?.assignments || [];
  const isMonthly = statusData?.cycleFrequency === 'MONTHLY';

  // Determine disabled reason for wheel
  let wheelDisabledReason = '';
  if (!isFullyPaid) {
    wheelDisabledReason = 'Wheel locked: Payments not fully completed.';
  } else if (rotationStatus === 'PENDING') {
    wheelDisabledReason = 'Wheel not started yet. Awaiting organizer to open rotation.';
  } else if (rotationStatus === 'COMPLETED') {
    wheelDisabledReason = 'Rotation is completed and locked for this cycle.';
  } else if (isOrganizer) {
    wheelDisabledReason = 'Organizer is automatically assigned position #1 and does not spin.';
  } else if (hasSpun) {
    wheelDisabledReason = `You have already spun! Result: ${statusData?.myResult?.spinResult || 'Completed'}.`;
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb / Top Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <Link
            to={statusData?.groupId ? `/groups/${statusData.groupId}` : '/my-groups'}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
          >
            <Icon name="arrow-left" size={16} /> Back to Group
          </Link>
          <div>
            <h3 className="fw-bold mb-0" style={{ color: '#0F2F3D' }}>
              🎡 Seettu Spinning Wheel Rotation
            </h3>
            <small className="text-muted">
              {statusData?.groupName} • Cycle #{statusData?.cycleNumber} ({statusData?.cycleFrequency})
            </small>
          </div>
        </div>

        {/* Rotation Status Badge */}
        <div>
          {rotationStatus === 'IN_PROGRESS' && (
            <span className="badge px-3 py-2 bg-success text-white fw-bold" style={{ fontSize: '0.85rem' }}>
              ● ROTATION OPEN
            </span>
          )}
          {rotationStatus === 'COMPLETED' && (
            <span className="badge px-3 py-2 bg-secondary text-white fw-bold" style={{ fontSize: '0.85rem' }}>
              ✓ ROTATION COMPLETED
            </span>
          )}
          {rotationStatus === 'PENDING' && (
            <span className="badge px-3 py-2 bg-warning text-dark fw-bold" style={{ fontSize: '0.85rem' }}>
              🔒 PENDING PAYMENTS / START
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

      {/* Payment Completeness Alert / Locked State */}
      {!isFullyPaid && (
        <div
          className="alert border-0 p-4 mb-4 shadow-sm"
          style={{ background: '#FFFBEB', borderLeft: '5px solid #F59E0B', borderRadius: '12px' }}
        >
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-warning"
              style={{ width: '44px', height: '44px', background: '#FEF3C7', flexShrink: 0 }}
            >
              <Icon name="lock" size={24} color="#D97706" />
            </div>
            <div className="flex-grow-1">
              <h5 className="fw-bold mb-1" style={{ color: '#92400E' }}>
                Rotation Wheel Locked
              </h5>
              <p className="mb-2" style={{ color: '#B45309', fontSize: '0.92rem' }}>
                Awaiting all members to complete payments before rotation can begin.
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
                  {statusData?.paidMembersCount} / {statusData?.totalMembersCount} Paid
                </span>
              </div>
              <small className="text-muted d-block mt-2">
                All members must submit and have their contributions marked as PAID before the organizer can unlock the spinning wheel.
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Wheel, Right Members & Controls */}
      <div className="row g-4">
        {/* Left Column: The Spinning Wheel */}
        <div className="col-12 col-lg-6">
          <div className="ui-card p-3 p-md-4 shadow-sm h-100 d-flex flex-column align-items-center justify-content-between">
            <div className="w-100 text-center mb-2">
              <h5 className="fw-bold mb-1" style={{ color: '#0F2F3D' }}>
                🎯 Draw Your Payout Position
              </h5>
              <p className="text-muted small mb-0">
                Organizer position #1 is reserved by Seettu tradition. All other positions (2 to N) are distributed by the wheel!
              </p>
            </div>

            {/* The Spinning Wheel Component */}
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
                  border: statusData.myResult.spinResult === 'NO' ? '1px solid #FCA5A5' : '1px solid #A7F3D0'
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
                    ? '❌ Landed on "NO" — Wait for next month'
                    : `🎉 Payout Position #${statusData.myResult.assignedNumber}`}
                </div>
              </div>
            )}

            {/* Organizer Note */}
            {isOrganizer && (
              <div className="w-100 p-3 mt-3 rounded-3 text-center" style={{ background: '#FEF3C7', border: '1px solid #FCD34D' }}>
                <span className="fw-bold" style={{ color: '#92400E' }}>
                  👑 You are the Organizer
                </span>
                <p className="small mb-0 mt-1" style={{ color: '#B45309' }}>
                  Position #1 is automatically reserved for you. You supervise the draws and finalize the rotation once members finish spinning.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Organizer Actions & Member Status List */}
        <div className="col-12 col-lg-6">
          {/* Organizer Control Box (Visible to Organizer / Admin) */}
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
                  Control the lifecycle of the rotation. You can initiate spins once payments are verified, and finalize the final positions.
                </p>

                {/* Monthly Group Max Slots Config */}
                {isMonthly && rotationStatus !== 'COMPLETED' && (
                  <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <label className="form-label fw-semibold small mb-1 text-white">
                      Monthly Payout Slots Limit (Optional)
                    </label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white text-dark fw-bold">Max Slots</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="e.g. 3 (number of members to spin this month)"
                        min="2"
                        value={monthlySlotsInput}
                        onChange={(e) => setMonthlySlotsInput(e.target.value)}
                        disabled={rotationStatus === 'IN_PROGRESS'}
                      />
                    </div>
                    <small className="text-white-50 d-block mt-1" style={{ fontSize: '0.72rem' }}>
                      In monthly circles, limits how many members spin this month. Remaining members wait for next month.
                    </small>
                  </div>
                )}

                {/* Organizer Action Buttons */}
                <div className="d-flex gap-2 flex-wrap">
                  {rotationStatus !== 'IN_PROGRESS' && rotationStatus !== 'COMPLETED' && (
                    <button
                      className="btn btn-warning fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm"
                      onClick={handleInitialize}
                      disabled={!isFullyPaid || initializing}
                      style={{ borderRadius: '8px' }}
                    >
                      {initializing ? (
                        <div className="spinner-border spinner-border-sm" role="status" />
                      ) : (
                        <Icon name="play" size={16} />
                      )}
                      Unlock &amp; Start Rotation
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
                      Finalize &amp; Lock Rotation Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Member Roster & Spin Status */}
          <div className="ui-card p-4 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#0F2F3D' }}>
                  👥 Member Draw Roster
                </h5>
                <small className="text-muted">
                  {statusData?.totalSpinsCompleted || 0} of {Math.max(0, (statusData?.totalMembersCount || 1) - 1)} members have spun
                </small>
              </div>

              {/* Available Numbers Chip List */}
              <div className="d-flex align-items-center gap-1 flex-wrap">
                <span className="small text-muted fw-semibold me-1">Available:</span>
                {availableNumbers.length > 0 ? (
                  availableNumbers.map((num) => (
                    <span
                      key={num}
                      className="badge fw-bold"
                      style={{
                        background: '#E0F2FE',
                        color: '#0369A1',
                        border: '1px solid #BAE6FD',
                        fontSize: '0.78rem'
                      }}
                    >
                      #{num}
                    </span>
                  ))
                ) : (
                  <span className="badge bg-light text-muted border">None left</span>
                )}
                <span
                  className="badge fw-bold"
                  style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', fontSize: '0.78rem' }}
                >
                  NO
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
    </div>
  );
};

export default RotationPage;
