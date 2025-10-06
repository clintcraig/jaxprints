import React from 'react';
import StatusPill from '../common/StatusPill';
import { useDataContext } from '../../context/DataContext';
import { formatCurrency, formatDate } from '../../utils/format';

const QuotesPage: React.FC = () => {
  const { quotes, convertQuoteToOrder, updateQuoteStatus } = useDataContext();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Quotes & Proposals</h2>
            <p className="text-sm text-slate-500">Send digital approvals, track deposits, and convert won deals to orders.</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
              New Quote
            </button>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600">
              Share Portal Link
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Quote</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Valid Until</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {quotes.map(quote => (
                <tr key={quote.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">{quote.number}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{quote.customerName}</div>
                    <div className="text-xs text-slate-500">Owner: {quote.owner}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{formatDate(quote.validUntil)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-900">{formatCurrency(quote.totalAmount)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {formatCurrency(quote.depositReceived)} / {formatCurrency(quote.depositRequired)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusPill tone={quote.status === 'accepted' ? 'emerald' : quote.status === 'sent' ? 'indigo' : quote.status === 'rejected' ? 'rose' : 'gray'}>
                      {quote.status.replace('_', ' ')}
                    </StatusPill>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => updateQuoteStatus(quote.id, 'sent')}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => updateQuoteStatus(quote.id, 'rejected')}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => convertQuoteToOrder(quote.id)}
                        disabled={quote.status === 'accepted'}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                          quote.status === 'accepted'
                            ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                            : 'bg-indigo-600 text-white hover:bg-indigo-500'
                        }`}
                      >
                        Convert
                      </button>
                    </div>
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

export default QuotesPage;
