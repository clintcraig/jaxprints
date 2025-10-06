import React from 'react';
import MetricCard from '../common/MetricCard';
import { useDataContext } from '../../context/DataContext';
import { formatCurrency } from '../../utils/format';

const ReportsPage: React.FC = () => {
  const { leads, quotes, orders, projects, approvals } = useDataContext();

  const conversion = leads.length === 0 ? 0 : Math.round((orders.length / leads.length) * 100);
  const onTimeDeliveries = projects.filter(project => {
    if (!project.completionDate || !project.dueDate) return false;
    return new Date(project.completionDate) <= new Date(project.dueDate);
  });
  const onTimeRate = projects.length === 0 ? 0 : Math.round((onTimeDeliveries.length / projects.length) * 100);
  const revisionCount = approvals.filter(approval => approval.status === 'revision_required').length;
  const acceptedQuotes = quotes.filter(quote => quote.status === 'accepted');
  const totalRevenue = acceptedQuotes.reduce((sum, quote) => sum + quote.totalAmount, 0);
  const estimatedCost = acceptedQuotes.reduce((sum, quote) => sum + quote.totalAmount * 0.65, 0);
  const estimatedProfit = totalRevenue - estimatedCost;

  const metrics = [
    {
      label: 'Lead → Order Conversion',
      value: `${conversion}%`,
      helper: `${orders.length} of ${leads.length} leads converted`,
      trend: conversion >= 40 ? 'up' : conversion === 0 ? 'flat' : 'down',
    },
    {
      label: 'On-time Delivery',
      value: `${onTimeRate}%`,
      helper: `${onTimeDeliveries.length} / ${projects.length} projects closed on target`,
      trend: onTimeRate >= 80 ? 'up' : 'down',
    },
    {
      label: 'Revision Requests',
      value: revisionCount.toString(),
      helper: `${approvals.length} total approvals active`,
      trend: revisionCount <= 2 ? 'up' : 'down',
    },
    {
      label: 'Estimated Profit',
      value: formatCurrency(estimatedProfit),
      helper: `Revenue ${formatCurrency(totalRevenue)} • Cost ${formatCurrency(estimatedCost)}`,
      trend: estimatedProfit > 0 ? 'up' : 'down',
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(metric => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Operational Snapshot</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">By Stage</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Leads in pipe: {leads.length}</li>
              <li>Quotes awaiting decision: {quotes.filter(quote => quote.status === 'sent').length}</li>
              <li>Orders in production: {orders.filter(order => order.status === 'in_production').length}</li>
              <li>Projects in QC: {projects.filter(project => project.status === 'qc').length}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Process Health</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>Average quote value: {formatCurrency(quotes.reduce((sum, quote) => sum + quote.totalAmount, 0) / Math.max(quotes.length, 1))}</li>
              <li>Average stage SLA: {(
                projects.reduce((sum, project) => sum + project.stages.reduce((acc, stage) => acc + stage.slaHours, 0), 0) /
                Math.max(projects.length, 1)
              ).toFixed(1)} hours</li>
              <li>Active revision loops: {revisionCount}</li>
              <li>Projects over budget hours: {projects.filter(project => project.actualHours > project.budgetHours).length}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportsPage;
