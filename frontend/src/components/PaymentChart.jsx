import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PaymentChart = ({ data, title }) => {
  if (!data) return null;

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          '#198754', // PAID
          '#ffc107', // PENDING
          '#fd7e14', // LATE
          '#dc3545', // OVERDUE
          '#212529', // MISSED
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="card p-3 h-100">
      <h5 className="text-center">{title}</h5>
      <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
        <Pie data={chartData} options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default PaymentChart;
