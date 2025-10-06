import React from 'react';
import StatusPill from '../common/StatusPill';
import { useDataContext } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/format';

const PortalPage: React.FC = () => {
  const { portalMilestones, approvals, invoices } = useDataContext();
  const latestApproval = approvals[0];
  const latestInvoice = invoices[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Customer Portal Checklist</h2>
        <p className="mt-1 text-sm text-slate-500">
          Share secure links for clients to approve designs, upload assets, and settle balances.
        </p>
        <ul className="mt-4 space-y-3">
          {portalMilestones.map(milestone => (
            <li key={milestone.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{milestone.name}</p>
                {milestone.completedAt ? (
                  <p className="text-xs text-slate-500">Completed {formatDate(milestone.completedAt)}</p>
                ) : null}
              </div>
              <StatusPill tone={milestone.completed ? 'emerald' : 'amber'}>
                {milestone.completed ? 'Done' : 'Pending'}
              </StatusPill>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Latest Approval Link</h2>
        {latestApproval ? (
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Reviewer: {latestApproval.reviewer}</p>
            <p>Due: {formatDate(latestApproval.dueAt)}</p>
            <p>
              Secure URL:{' '}
              <a href={latestApproval.assetUrl} className="text-indigo-600 underline" target="_blank" rel="noreferrer">
                View mockup
              </a>
            </p>
            <p className="text-xs text-slate-500">Share via signed URL that expires after 24 hours.</p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No approval cycles yet.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Latest Invoice Summary</h2>
        {latestInvoice ? (
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>Invoice: {latestInvoice.number}</p>
            <p>Balance: {latestInvoice.balanceDue === 0 ? 'Paid' : formatCurrency(latestInvoice.balanceDue)}</p>
            <p>Due Date: {formatDate(latestInvoice.dueDate)}</p>
            <p className="text-xs text-slate-500">
              Embed payment link (Stripe / Xendit / GCash) with automatic receipt upload.
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No invoices ready for the portal.</p>
        )}
      </section>
    </div>
  );
};

export default PortalPage;
