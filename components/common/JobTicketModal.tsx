import React from 'react';
import StatusPill from './StatusPill';
import type { Order, Project } from '../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format';

const statusTone: Record<string, React.ComponentProps<typeof StatusPill>['tone']> = {
  pending: 'gray',
  in_progress: 'indigo',
  completed: 'emerald',
  blocked: 'rose',
};

interface JobTicketModalProps {
  project: Project;
  order?: Order;
  onClose: () => void;
}

const JobTicketModal: React.FC<JobTicketModalProps> = ({ project, order, onClose }) => {
  const completedStages = project.stages.filter(stage => stage.status === 'completed').length;
  const progress = Math.round((completedStages / Math.max(project.stages.length, 1)) * 100);

  const jobTicketPayload = {
    projectId: project.id,
    projectCode: project.code,
    orderNumber: order?.number,
    dueDate: project.dueDate,
    stages: project.stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      status: stage.status,
      dueAt: stage.dueAt,
    })),
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    JSON.stringify(jobTicketPayload),
  )}`;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4 py-8">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          aria-label="Close job ticket"
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l8 8m0-8L4 12" />
          </svg>
        </button>
        <div className="grid gap-6 p-6 md:grid-cols-[240px_1fr]">
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <img
              src={qrUrl}
              alt="Job ticket QR code"
              className="h-52 w-52 rounded-xl border border-slate-200 bg-white p-3"
            />
            <p className="text-center text-xs text-slate-500">
              Scan to pull up the digital ticket, checklists, and asset links on mobile.
            </p>
          </div>
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>
              <p className="text-sm text-slate-500">
                Project {project.code} • Order {order?.number ?? '—'}
              </p>
              <p className="text-xs text-slate-500">
                Started {formatDate(project.startDate)} • Due {formatDate(project.dueDate)} • Progress {progress}%
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 md:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-900">Production Summary</p>
                <p>Budget Hours: {project.budgetHours}</p>
                <p>Logged Hours: {project.actualHours}</p>
                <p>Active Stage: {project.stages.find(stage => stage.status === 'in_progress')?.name ?? '—'}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Financials</p>
                <p>Total: {order ? formatCurrency(order.totalAmount) : '—'}</p>
                <p>
                  Deposit: {order ? `${formatCurrency(order.depositReceived)} / ${formatCurrency(order.depositRequired)}` : '—'}
                </p>
                <p>Status: {order?.status ?? 'Pending'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stages & SLAs</h3>
              <ul className="mt-2 space-y-2">
                {project.stages.map(stage => (
                  <li
                    key={stage.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{stage.name}</p>
                      <p className="text-xs text-slate-500">
                        Owner {stage.ownerRole} • Due {formatDateTime(stage.dueAt)}
                      </p>
                    </div>
                    <StatusPill tone={statusTone[stage.status] ?? 'gray'}>
                      {stage.status.replace('_', ' ')}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTicketModal;
