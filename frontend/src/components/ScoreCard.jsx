import React from 'react';
import { useTranslation } from 'react-i18next';

const ScoreCard = ({ score = 95, category = 'EXCELLENT' }) => {
  const { t } = useTranslation();
  
  let colorClass = 'text-success';
  let badgeBg = 'bg-success text-white';
  if (category === 'GOOD') { colorClass = 'text-info'; badgeBg = 'bg-info text-dark'; }
  if (category === 'FAIR') { colorClass = 'text-warning'; badgeBg = 'bg-warning text-dark'; }
  if (category === 'POOR') { colorClass = 'text-orange'; badgeBg = 'bg-warning-subtle text-dark'; }
  if (category === 'HIGH_RISK') { colorClass = 'text-danger fw-bold'; badgeBg = 'bg-danger text-white'; }

  return (
    <div className="card shadow-sm h-100 border-0 p-4 text-center">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-dark mb-0">{t('discipline_score') || 'Financial Trust Score'}</h5>
        <span className={`badge ${badgeBg} px-3 py-2 fs-7`}>{category.replace('_', ' ')}</span>
      </div>

      <div className="py-3">
        <div className={`display-3 fw-extrabold ${colorClass} mb-1`}>{score}</div>
        <div className="progress mx-auto mb-3" style={{ height: '8px', maxWidth: '240px' }}>
          <div
            className={`progress-bar ${score > 80 ? 'bg-success' : score > 60 ? 'bg-primary' : 'bg-warning'}`}
            role="progressbar"
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <p className="text-muted small mb-0">
          Calculated based on timely contribution payments, attendance, dispute resolution, and member trust ratings.
        </p>
      </div>
    </div>
  );
};

export default ScoreCard;
