import React from 'react';
import { NavLink } from 'react-router-dom';

const items = [
  { label: 'Dashboard', to: '/' },
  { label: 'Leads', to: '/sales/leads' },
  { label: 'Quotes', to: '/sales/quotes' },
  { label: 'Orders', to: '/delivery/orders' },
  { label: 'Projects', to: '/delivery/projects' },
  { label: 'Tasks', to: '/delivery/tasks' },
];

const MobileNav: React.FC = () => (
  <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
    <div className="flex gap-3 overflow-x-auto text-sm font-medium text-slate-600">
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            [
              'whitespace-nowrap rounded-full px-3 py-1.5 transition',
              isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  </div>
);

export default MobileNav;
