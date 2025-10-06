import React from 'react';

type Tone = 'gray' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';

interface StatusPillProps {
  tone?: Tone;
  children: React.ReactNode;
}

const toneClasses: Record<Tone, string> = {
  gray: 'bg-slate-100 text-slate-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  sky: 'bg-sky-100 text-sky-700',
};

const StatusPill: React.FC<StatusPillProps> = ({ tone = 'gray', children }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>
    {children}
  </span>
);

export default StatusPill;
