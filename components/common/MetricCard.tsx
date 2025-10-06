import React, { type ReactElement } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  trend?: 'up' | 'down' | 'flat';
}

const trendIcons: Record<NonNullable<MetricCardProps['trend']>, ReactElement> = {
  up: (
    <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 4.5 4.5 3-3M4.5 8.25h6" />
    </svg>
  ),
  down: (
    <svg className="h-3.5 w-3.5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-4.5-4.5-3 3M19.5 15.75h-6" />
    </svg>
  ),
  flat: (
    <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15" />
    </svg>
  ),
};

const MetricCard: React.FC<MetricCardProps> = ({ label, value, helper, trend }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <div className="mt-3 flex items-baseline gap-2">
      <span className="text-2xl font-semibold text-slate-900">{value}</span>
      {trend ? trendIcons[trend] : null}
    </div>
    {helper ? <p className="mt-3 text-xs text-slate-500">{helper}</p> : null}
  </div>
);

export default MetricCard;
