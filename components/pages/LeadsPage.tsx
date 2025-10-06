import React from 'react';
import StatusPill from '../common/StatusPill';
import { useDataContext } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/format';

const statusTone: Record<string, React.ComponentProps<typeof StatusPill>['tone']> = {
  new: 'gray',
  contacted: 'sky',
  quoted: 'indigo',
  closed_won: 'emerald',
  closed_lost: 'rose',
};

const LeadsPage: React.FC = () => {
  const { leads } = useDataContext();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Lead Activity</h2>
            <p className="text-sm text-slate-500">Track marketing sources, expected close dates, and pipeline value.</p>
          </div>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Expected Close</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{lead.company}</div>
                    <div className="text-xs text-slate-500">{lead.name} • {lead.email}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{lead.source}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{lead.owner}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{formatDate(lead.expectedClose)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">{formatCurrency(lead.value)}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusPill tone={statusTone[lead.status] ?? 'gray'}>{lead.status.replace('_', ' ')}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default LeadsPage;
