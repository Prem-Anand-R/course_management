// course_management/src/components/MetricsCard.jsx
import React from 'react';

const MetricsCard = ({ title, value, icon, trend, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  const getTrendColor = (trend) => {
    if (trend.includes('+') || trend.includes('Improved')) {
      return 'text-green-700';
    } else if (trend.includes('-') || trend.includes('Decreased')) {
      return 'text-red-700';
    }
    return 'text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`inline-flex items-center justify-center p-3 rounded-lg ${colorClasses[color]}`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {trend && (
        <div className="bg-gray-50 px-6 py-3">
          <div className="text-sm">
            <span className={`font-medium ${getTrendColor(trend)}`}>{trend}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsCard;