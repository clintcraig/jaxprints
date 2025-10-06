import React from 'react';
import StatusPill from '../common/StatusPill';
import ProgressBar from '../common/ProgressBar';
import { useDataContext } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/format';

const orderTone: Record<string, React.ComponentProps<typeof StatusPill>['tone']> = {
  pending: 'amber',
  in_production: 'indigo',
  ready: 'emerald',
  completed: 'emerald',
  cancelled: 'rose',
};

const OrdersPage: React.FC = () => {
  const { orders, projects, updateOrderStatus } = useDataContext();

  const getOrderProgress = (orderId: string) => {
    const project = projects.find(item => item.orderId === orderId);
    if (!project) return 0;
    const completed = project.stages.filter(stage => stage.status === 'completed').length;
    return Math.round((completed / project.stages.length) * 100);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Production Orders</h2>
            <p className="text-sm text-slate-500">Monitor SLAs, deposits, and downstream project execution.</p>
          </div>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
            Create Order
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Promised</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {orders.map(order => {
                const progress = getOrderProgress(order.id);
                return (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900">{order.number}</div>
                      <div className="text-xs text-slate-500">Created {formatDate(order.createdAt)}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{order.customerName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{formatDate(order.promisedDate)}</td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-900">{progress}%</span>
                        <div className="w-32">
                          <ProgressBar value={progress} />
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                      {formatCurrency(order.depositReceived)} / {formatCurrency(order.depositRequired)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusPill tone={orderTone[order.status] ?? 'gray'}>{order.status.replace('_', ' ')}</StatusPill>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'in_production')}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-sky-200 hover:text-sky-600"
                        >
                          Mark Ready
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-400"
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default OrdersPage;
