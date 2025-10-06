import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MobileNav from './components/layout/MobileNav';
import DashboardPage from './components/pages/DashboardPage';
import LeadsPage from './components/pages/LeadsPage';
import QuotesPage from './components/pages/QuotesPage';
import OrdersPage from './components/pages/OrdersPage';
import ProjectsPage from './components/pages/ProjectsPage';
import TasksPage from './components/pages/TasksPage';
import ApprovalsPage from './components/pages/ApprovalsPage';
import InvoicesPage from './components/pages/InvoicesPage';
import ReportsPage from './components/pages/ReportsPage';
import PortalPage from './components/pages/PortalPage';
import { DataProvider } from './context/DataContext';

const App: React.FC = () => (
  <HashRouter>
    <DataProvider>
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <MobileNav />
            <TopBar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/sales/leads" element={<LeadsPage />} />
                <Route path="/sales/quotes" element={<QuotesPage />} />
                <Route path="/delivery/orders" element={<OrdersPage />} />
                <Route path="/delivery/projects" element={<ProjectsPage />} />
                <Route path="/delivery/tasks" element={<TasksPage />} />
                <Route path="/ops/approvals" element={<ApprovalsPage />} />
                <Route path="/finance/invoices" element={<InvoicesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/portal" element={<PortalPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </DataProvider>
  </HashRouter>
);

export default App;
