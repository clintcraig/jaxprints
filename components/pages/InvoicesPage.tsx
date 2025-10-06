import React from 'react';
import StatusPill from '../common/StatusPill';
import { useDataContext } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/format';

const statusTone: Record<string, React.ComponentProps<typeof StatusPill>['tone']> = {
  draft: 'gray',
  issued: 'indigo',
  paid: 'emerald',
  overdue: 'rose',
};

const InvoicesPage: React.FC = () => {
  const { invoices, recordPayment, orders } = useDataContext();

  return (
    <div className="space-y-6">
      {invoices.map(invoice => {
        const order = orders.find(item => item.id === invoice.orderId);
        return (
          <section key={invoice.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{invoice.number}</h2>
                <p className="text-sm text-slate-500">
                  Order {order?.number ?? invoice.orderId} • Issued {formatDate(invoice.issueDate)} • Due {formatDate(invoice.dueDate)}
                </p>
              </div>
              <StatusPill tone={statusTone[invoice.status] ?? 'gray'}>{invoice.status}</StatusPill>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="text-sm font-semibold text-slate-900">Amount: {formatCurrency(invoice.totalAmount)}</p>
                <p className="mt-1 text-xs text-slate-500">Balance Due: {formatCurrency(invoice.balanceDue)}</p>
                <div className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payments</h3>
                  <ul className="mt-2 space-y-2">
                    {invoice.payments.map(payment => (
                      <li key={payment.id} className="rounded-lg border border-slate-100 px-3 py-2 text-xs text-slate-600">
                        {formatDate(payment.date)} • {formatCurrency(payment.amount)} • {payment.method.replace('_', ' ')}
                      </li>
                    ))}
                    {invoice.payments.length === 0 ? (
                      <li className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400">
                        No payments recorded yet.
                      </li>
                    ) : null}
                  </ul>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => recordPayment(invoice.id, invoice.balanceDue, 'bank_transfer')}
                    disabled={invoice.balanceDue <= 0}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                      invoice.balanceDue <= 0
                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    Apply Full Payment
                  </button>
                  <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600">
                    Send Reminder
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default InvoicesPage;
