import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    section: 'Overview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
  },
  {
    label: 'Leads',
    to: '/sales/leads',
    section: 'Sales',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75a4.5 4.5 0 110 9 4.5 4.5 0 010-9zM7.5 4.5a3 3 0 110 6 3 3 0 010-6zm0 9a4.5 4.5 0 014.5 4.5v1.5H3v-1.5a4.5 4.5 0 014.5-4.5zm9 0a4.5 4.5 0 014.5 4.5v1.5H12v-1.5a4.5 4.5 0 014.5-4.5z" />
      </svg>
    ),
  },
  {
    label: 'Quotes',
    to: '/sales/quotes',
    section: 'Sales',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5h9a2.25 2.25 0 012.25 2.25v11.25L15 15.75H8.25A2.25 2.25 0 016 13.5v-6.75A2.25 2.25 0 018.25 4.5z" />
      </svg>
    ),
  },
  {
    label: 'Orders',
    to: '/delivery/orders',
    section: 'Operations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18M3 9h18M9 21h6" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    to: '/delivery/projects',
    section: 'Operations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    ),
  },
  {
    label: 'Tasks Board',
    to: '/delivery/tasks',
    section: 'Operations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15m-15 4.5h15m-15 4.5h7.5" />
      </svg>
    ),
  },
  {
    label: 'Approvals',
    to: '/ops/approvals',
    section: 'Operations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25h13.5v13.5H5.25zM8.25 9.75h7.5m-7.5 4.5h4.5" />
      </svg>
    ),
  },
  {
    label: 'Invoices & Payments',
    to: '/finance/invoices',
    section: 'Finance',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v7.5m-3.75-3.75h7.5M4.5 5.25h15v13.5h-15z" />
      </svg>
    ),
  },
  {
    label: 'Reports & KPIs',
    to: '/reports',
    section: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 19.5h16.5M7.5 16.5v-6m4.5 6V7.5m4.5 9V4.5" />
      </svg>
    ),
  },
  {
    label: 'Customer Portal',
    to: '/portal',
    section: 'Client Experience',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75A3.75 3.75 0 1012 8.25a3.75 3.75 0 000 7.5zm7.5-3.75a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
      </svg>
    ),
  },
];

const groupedNavigation = navItems.reduce<Record<string, typeof navItems[number][]>>((acc, item) => {
  if (!acc[item.section]) {
    acc[item.section] = [];
  }
  acc[item.section].push(item);
  return acc;
}, {});

const Sidebar: React.FC = () => (
  <aside className="hidden lg:flex lg:w-64 xl:w-72 bg-white border-r border-slate-200 flex-col min-h-screen">
    <div className="px-6 py-6 border-b border-slate-200">
      <div className="text-xs uppercase tracking-widest text-slate-400">JaxCreativ</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">OPS Control</div>
    </div>
    <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
      {Object.entries(groupedNavigation).map(([section, items]) => (
        <div key={section}>
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{section}</p>
          <div className="mt-2 space-y-1">
            {items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                <span className="text-slate-400">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
    <div className="px-6 py-6 border-t border-slate-200">
      <p className="text-xs text-slate-500">Last sync: {new Date().toLocaleTimeString()}</p>
    </div>
  </aside>
);

export default Sidebar;
