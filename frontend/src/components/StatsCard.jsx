import React from 'react';

const StatsCard = ({ title, value, icon, colorClass = 'primary', subtitle }) => {
  const getGradient = () => {
    switch(colorClass) {
      case 'success': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'warning': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'danger': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'info': return 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)';
      default: return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
    }
  };

  return (
    <div className="card shadow-sm border-0 h-100 text-white" style={{ background: getGradient() }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <span className="text-white-50 text-uppercase fw-bold small tracking-wider">{title}</span>
            <h2 className="display-6 fw-bold mb-0 mt-2">{value}</h2>
            {subtitle && <p className="mb-0 mt-1 small text-white-50">{subtitle}</p>}
          </div>
          <div className="bg-white bg-opacity-25 rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px', fontSize: '1.5rem' }}>
            {icon === 'fa-users' ? '👥' : icon === 'fa-check-circle' ? '✅' : icon === 'fa-money-bill' ? '💵' : '📊'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
