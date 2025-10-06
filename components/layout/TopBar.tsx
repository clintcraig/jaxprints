import React from 'react';
import { useLocation } from 'react-router-dom';

const breadcrumbs: Record<string, string> = {
  '/': 'Operational Overview',
  '/sales/leads': 'Sales Pipeline',
  '/sales/quotes': 'Quotes & Proposals',
  '/delivery/orders': 'Production Orders',
  '/delivery/projects': 'Project Tracker',
  '/delivery/tasks': 'Team Tasks Board',
  '/ops/approvals': 'Mockup Approvals',
  '/finance/invoices': 'Billing & Collections',
  '/reports': 'Analytics & KPIs',
  '/portal': 'Customer Portal Preview',
};

const TopBar: React.FC = () => {
  const location = useLocation();
  const title = breadcrumbs[location.pathname] ?? 'Workspace';

  return (
    <header className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:z-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">JaxCreativ POS + Project Tracking</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="hidden rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 sm:inline-flex">
            Sync with ERP
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
            </svg>
            Create
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
