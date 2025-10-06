import React from 'react';
import MetricCard from '../common/MetricCard';
import StatusPill from '../common/StatusPill';
import ProgressBar from '../common/ProgressBar';
import { useDataContext } from '../../context/DataContext';
import { daysUntil, formatCurrency, formatDate } from '../../utils/format';

const DashboardPage: React.FC = () => {
  const { leads, quotes, orders, projects, approvals, invoices } = useDataContext();

  const conversionRate = leads.length === 0 ? 0 : Math.round((orders.length / leads.length) * 100);
  const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue' || invoice.balanceDue > 0 && new Date(invoice.dueDate) < new Date());
  const activeProjects = projects.filter(project => !['delivered', 'closed'].includes(project.status));

  const metrics = [
    {
      label: 'Active Leads',
      value: leads.length.toString(),
      helper: `${conversionRate}% converted this cycle`,
      trend: conversionRate >= 50 ? 'up' : conversionRate === 0 ? 'flat' : 'down',
    },
    {
      label: 'Orders in Production',
      value: orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length.toString(),
      helper: `${projects.length} live projects`,
      trend: 'flat' as const,
    },
    {
      label: 'Open Approvals',
      value: approvals.filter(approval => approval.status === 'pending').length.toString(),
      helper: `${approvals.length} total iterations this week`,
      trend: 'up' as const,
    },
    {
      label: 'Outstanding Balance',
      value: formatCurrency(
        invoices.reduce((acc, invoice) => acc + invoice.balanceDue, 0),
      ),
      helper: `${overdueInvoices.length} overdue`,
      trend: overdueInvoices.length > 0 ? 'down' : 'up',
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(metric => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Sales Pipeline</h2>
            <StatusPill tone="indigo">{leads.length} leads</StatusPill>
          </div>
          <div className="mt-6 space-y-4">
            {quotes.map(quote => {
              const daysLeft = daysUntil(quote.validUntil);
              return (
                <div key={quote.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{quote.number}</p>
                      <p className="text-base font-semibold text-slate-900">{quote.customerName}</p>
                    </div>
                    <StatusPill tone={quote.status === 'accepted' ? 'emerald' : quote.status === 'sent' ? 'indigo' : 'amber'}>
                      {quote.status.replace('_', ' ')}
                    </StatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                    <span>Total {formatCurrency(quote.totalAmount)}</span>
                    <span>Valid until {formatDate(quote.validUntil)}</span>
                    {typeof daysLeft === 'number' && (
                      <span className={daysLeft < 3 ? 'text-rose-500 font-medium' : ''}>
                        {daysLeft >= 0 ? `${daysLeft} day(s) left` : 'Expired'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Production Health</h2>
            <StatusPill tone="sky">{activeProjects.length} active</StatusPill>
          </div>
          <div className="mt-6 space-y-5">
            {activeProjects.map(project => {
              const completedStages = project.stages.filter(stage => stage.status === 'completed').length;
              const progress = Math.round((completedStages / project.stages.length) * 100);
              return (
                <div key={project.id} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{project.code}</p>
                      <p className="text-base font-semibold text-slate-900">{project.name}</p>
                      <p className="text-xs text-slate-500">Due {formatDate(project.dueDate)}</p>
                    </div>
                    <StatusPill tone="indigo">{progress}%</StatusPill>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={progress} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.stages.map(stage => (
                      <StatusPill
                        key={stage.id}
                        tone={
                          stage.status === 'completed'
                            ? 'emerald'
                            : stage.status === 'in_progress'
                            ? 'indigo'
                            : stage.status === 'blocked'
                            ? 'rose'
                            : 'gray'
                        }
                      >
                        {stage.name}
                      </StatusPill>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Approvals Queue</h2>
            <StatusPill tone="amber">{approvals.length} active</StatusPill>
          </div>
          <ul className="mt-4 space-y-4">
            {approvals.map(approval => (
              <li key={approval.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-500">v{approval.version}</p>
                    <p className="text-base font-semibold text-slate-900">{approval.reviewer}</p>
                  </div>
                  <StatusPill tone={approval.status === 'approved' ? 'emerald' : approval.status === 'pending' ? 'amber' : 'rose'}>
                    {approval.status.replace('_', ' ')}
                  </StatusPill>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Due {formatDate(approval.dueAt)} • Asset{' '}
                  <a className="text-indigo-600 underline" href={approval.assetUrl} target="_blank" rel="noreferrer">
                    View
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Receivables Watchlist</h2>
            <StatusPill tone="rose">{overdueInvoices.length} alerts</StatusPill>
          </div>
          <div className="mt-4 space-y-4">
            {invoices.map(invoice => (
              <div key={invoice.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{invoice.number}</p>
                    <p className="text-base font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</p>
                  </div>
                  <StatusPill tone={invoice.status === 'paid' ? 'emerald' : invoice.balanceDue === 0 ? 'emerald' : 'rose'}>
                    {invoice.status}
                  </StatusPill>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Balance {formatCurrency(invoice.balanceDue)} • Due {formatDate(invoice.dueDate)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
