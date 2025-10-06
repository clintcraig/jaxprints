import React from 'react';
import StatusPill from '../common/StatusPill';
import { useDataContext } from '../../context/DataContext';
import { formatDate } from '../../utils/format';

const ApprovalsPage: React.FC = () => {
  const { approvals, projects, recordApprovalDecision } = useDataContext();

  return (
    <div className="space-y-6">
      {approvals.map(approval => {
        const project = projects.find(item => item.id === approval.projectId);
        return (
          <section key={approval.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{project?.name ?? 'Project'}</h2>
                <p className="text-sm text-slate-500">Review cycle v{approval.version} • Due {formatDate(approval.dueAt)}</p>
              </div>
              <StatusPill tone={approval.status === 'approved' ? 'emerald' : approval.status === 'pending' ? 'amber' : 'rose'}>
                {approval.status.replace('_', ' ')}
              </StatusPill>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-sm text-slate-600">
                  Client Reviewer: <span className="font-semibold text-slate-900">{approval.reviewer}</span>
                </p>
                <p className="mt-2 text-xs text-slate-500">Asset: {approval.assetUrl}</p>
                {approval.notes ? <p className="mt-2 text-xs text-slate-500">Notes: {approval.notes}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => recordApprovalDecision(approval.id, 'approved')}
                    className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-400"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => recordApprovalDecision(approval.id, 'revision_required', 'Needs color adjustment')}
                    className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50"
                  >
                    Request Revision
                  </button>
                  <a
                    href={approval.assetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
                  >
                    View Mockup
                  </a>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ApprovalsPage;
