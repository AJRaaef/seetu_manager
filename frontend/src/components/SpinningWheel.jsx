import React, { useState, useEffect, useRef } from 'react';
import { Wheel } from 'react-custom-roulette';
import Confetti from './Confetti';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icons';

// Segment color palette with high contrast and aesthetic feel
const PALETTE = [
  '#0097B2', // Seettu Teal
  '#0F2F3D', // Deep Navy
  '#F59E0B', // Amber Gold
  '#10B981', // Emerald Green
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#3B82F6', // Royal Blue
  '#14B8A6'  // Light Teal
];

const SpinningWheel = ({
  availableNumbers = [],
  mustSpin = false,
  targetResult = null, // e.g. "2" or "NO"
  onSpinClick,
  onSpinComplete,
  disabled = false,
  disabledMessage = ''
}) => {
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [localMustSpin, setLocalMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Measure window for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Build roulette segments data
  // Pool includes untaken numbers + "NO"
  const segments = React.useMemo(() => {
    const items = [];
    availableNumbers.forEach((num, idx) => {
      items.push({
        option: `#${num}`,
        rawValue: String(num),
        style: {
          backgroundColor: PALETTE[idx % PALETTE.length],
          textColor: '#ffffff'
        }
      });
    });

    // Add the "NO" segment
    items.push({
      option: '❌ NO',
      rawValue: 'NO',
      style: {
        backgroundColor: '#DC2626', // Crimson red for NO
        textColor: '#ffffff'
      }
    });

    // react-custom-roulette requires at least 2 segments
    if (items.length === 1) {
      items.push({
        option: '❌ NO',
        rawValue: 'NO',
        style: { backgroundColor: '#991B1B', textColor: '#ffffff' }
      });
    }

    return items;
  }, [availableNumbers]);

  // When targetResult is set by the backend response, find the matching segment index
  useEffect(() => {
    if (mustSpin && targetResult !== null && segments.length > 0) {
      const idx = segments.findIndex(
        (s) => s.rawValue.toUpperCase() === String(targetResult).toUpperCase()
      );
      const chosenIndex = idx >= 0 ? idx : 0;
      setPrizeNumber(chosenIndex);
      setLocalMustSpin(true);
      setHasStarted(true);
    }
  }, [mustSpin, targetResult, segments]);

  const handleStopSpinning = () => {
    setLocalMustSpin(false);
    const wonSegment = segments[prizeNumber];
    const isWin = wonSegment && wonSegment.rawValue !== 'NO';

    if (isWin) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5500);
    }

    if (onSpinComplete) {
      onSpinComplete(wonSegment ? wonSegment.rawValue : targetResult);
    }
  };

  const handleCenterButtonClick = () => {
    if (disabled || localMustSpin) return;
    if (onSpinClick) {
      onSpinClick();
    }
  };

  return (
    <div className="d-flex flex-column align-items-center position-relative my-3" style={{ overflow: 'hidden' }}>
      {/* Confetti celebration overlay */}
      {showConfetti && (
        <Confetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={false}
          numberOfPieces={380}
          gravity={0.25}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
        />
      )}

      {/* Wheel Card Container */}
      <div
        className="p-4 p-md-5 rounded-4 shadow-lg text-center position-relative"
        style={{
          background: 'linear-gradient(145deg, #0F2F3D 0%, #164E63 50%, #0F2F3D 100%)',
          border: '2px solid rgba(0, 151, 178, 0.4)',
          maxWidth: '520px',
          width: '100%'
        }}
      >
        {/* Glow halo behind wheel */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            height: '360px',
            background: 'radial-gradient(circle, rgba(0,151,178,0.28) 0%, rgba(15,47,61,0) 70%)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        {/* Header Badges */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <span
            className="badge px-3 py-2 text-white fw-semibold"
            style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', fontSize: '0.78rem' }}
          >
            🎡 Payout Rotation
          </span>
          <span
            className="badge px-3 py-2 fw-semibold"
            style={{
              background: 'rgba(0,151,178,0.25)',
              color: '#38BDF8',
              border: '1px solid rgba(56,189,248,0.3)',
              fontSize: '0.78rem'
            }}
          >
            {availableNumbers.length} Slot{availableNumbers.length === 1 ? '' : 's'} Remaining
          </span>
        </div>

        {/* Wheel wrapper */}
        <div className="position-relative d-inline-block mx-auto mb-3" style={{ minHeight: '340px' }}>
          {/* Wheel Component */}
          <div style={{ transform: 'scale(0.92)', transformOrigin: 'center center' }}>
            <Wheel
              mustStartSpinning={localMustSpin}
              prizeNumber={prizeNumber}
              data={segments}
              onStopSpinning={handleStopSpinning}
              spinDuration={0.45} // ~4.5 seconds smooth cinematic rotation
              outerBorderColor="#0097B2"
              outerBorderWidth={6}
              innerBorderColor="#ffffff"
              innerBorderWidth={3}
              innerRadius={24}
              radiusLineWidth={2}
              radiusLineColor="rgba(255,255,255,0.35)"
              textDistance={60}
              fontSize={18}
            />
          </div>

          {/* Central Overlay Spin Button */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 30
            }}
          >
            <motion.button
              whileHover={{ scale: disabled || localMustSpin ? 1 : 1.08 }}
              whileTap={{ scale: disabled || localMustSpin ? 1 : 0.95 }}
              onClick={handleCenterButtonClick}
              disabled={disabled || localMustSpin}
              className="btn rounded-circle d-flex flex-column align-items-center justify-content-center shadow-lg border-0"
              style={{
                width: '74px',
                height: '74px',
                background: disabled
                  ? '#475569'
                  : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#ffffff',
                boxShadow: disabled
                  ? 'none'
                  : '0 0 25px rgba(245, 158, 11, 0.7), inset 0 0 10px rgba(255,255,255,0.4)',
                cursor: disabled || localMustSpin ? 'not-allowed' : 'pointer'
              }}
            >
              {localMustSpin ? (
                <div className="spinner-border spinner-border-sm text-white" role="status" />
              ) : (
                <>
                  <Icon name="play" size={18} color="#ffffff" />
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                    SPIN
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Wheel Status Footer */}
        <div className="mt-2 text-white">
          {localMustSpin && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="d-flex align-items-center justify-content-center gap-2"
              style={{ color: '#FCD34D' }}
            >
              <div className="spinner-grow spinner-grow-sm text-warning" role="status" />
              <span className="fw-semibold small">Spinning the wheel... Good luck!</span>
            </motion.div>
          )}

          {!localMustSpin && disabled && disabledMessage && (
            <div
              className="alert border-0 py-2 px-3 small text-white mb-0"
              style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '10px' }}
            >
              <Icon name="alert-circle" size={15} className="me-2 text-danger" />
              {disabledMessage}
            </div>
          )}

          {!localMustSpin && !disabled && (
            <div className="text-white-50 small">
              Click <strong className="text-warning">SPIN</strong> to draw your Seettu payout number!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpinningWheel;
