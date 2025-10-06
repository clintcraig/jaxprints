import React, { createContext, useContext, useMemo, useState } from 'react';
import type {
  Approval,
  Invoice,
  InventoryItem,
  Lead,
  Order,
  PortalMilestone,
  Project,
  ProjectStage,
  Quote,
  Task,
} from '../types';
import {
  initialApprovals,
  initialInvoices,
  initialInventory,
  initialLeads,
  initialOrders,
  initialProjectTemplates,
  initialProjects,
  initialQuotes,
  initialTasks,
  initialTasksCatalog,
  portalMilestones,
} from '../services/mockData';

interface DataContextValue {
  leads: Lead[];
  quotes: Quote[];
  orders: Order[];
  projects: Project[];
  approvals: Approval[];
  invoices: Invoice[];
  tasks: Task[];
  inventory: InventoryItem[];
  portalMilestones: PortalMilestone[];
  convertQuoteToOrder: (quoteId: string) => void;
  updateQuoteStatus: (quoteId: string, status: Quote['status']) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateProjectStage: (projectId: string, stageId: string, status: ProjectStage['status']) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  recordApprovalDecision: (approvalId: string, status: Approval['status'], notes?: string) => void;
  recordPayment: (invoiceId: string, amount: number, method: Invoice['payments'][number]['method']) => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const cloneStageTemplate = () =>
  initialProjectTemplates.map(stage => ({
    ...stage,
    templateId: stage.id,
    id: generateId(stage.id),
    status: 'pending' as const,
    startedAt: undefined,
    completedAt: undefined,
    dueAt: undefined,
  }));

const assignTasksFromTemplate = (projectId: string, stages: ProjectStage[]): Task[] => {
  const stageIdMap = new Map(stages.map(stage => [stage.templateId ?? stage.name, stage.id]));
  return initialTasksCatalog.map(task => ({
    ...task,
    id: generateId('task'),
    projectId,
    stageId: stageIdMap.get(task.stageId) ?? stages[0].id,
    status: 'Not Started',
    actualHours: 0,
  }));
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState(initialLeads);
  const [quotes, setQuotes] = useState(initialQuotes);
  const [orders, setOrders] = useState(initialOrders);
  const [projects, setProjects] = useState(initialProjects);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [tasks, setTasks] = useState(initialTasks);
  const [inventory] = useState(initialInventory);
  const [portalMilestoneState] = useState(portalMilestones);

  const updateQuoteStatus = (quoteId: string, status: Quote['status']) => {
    setQuotes(prev => prev.map(quote => (quote.id === quoteId ? { ...quote, status } : quote)));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const timestamp = new Date().toISOString().split('T')[0];
    setOrders(prev => prev.map(order => (order.id === orderId ? { ...order, status, updatedAt: timestamp } : order)));
    if (status === 'completed') {
      setProjects(prev =>
        prev.map(project =>
          project.orderId === orderId
            ? {
                ...project,
                status: 'ready',
                completionDate: timestamp,
              }
            : project,
        ),
      );
    }
  };

  const updateProjectStage = (projectId: string, stageId: string, status: ProjectStage['status']) => {
    const timestamp = new Date().toISOString().split('T')[0];
    setProjects(prev =>
      prev.map(project => {
        if (project.id !== projectId) return project;
        const stages = project.stages.map(stage => {
          if (stage.id !== stageId) return stage;
          return {
            ...stage,
            status,
            startedAt: stage.startedAt ?? timestamp,
            completedAt: status === 'completed' ? timestamp : stage.completedAt,
          };
        });
        const nextStatus = stages.some(stage => stage.status === 'in_progress')
          ? 'production'
          : stages.every(stage => stage.status === 'completed')
          ? 'ready'
          : project.status;
        return {
          ...project,
          stages,
          status: nextStatus,
        };
      }),
    );
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => (task.id === taskId ? { ...task, status } : task)));
  };

  const recordApprovalDecision = (approvalId: string, status: Approval['status'], notes?: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    setApprovals(prev =>
      prev.map(approval =>
        approval.id === approvalId
          ? {
              ...approval,
              status,
              notes: notes ?? approval.notes,
              dueAt: status === 'revision_required' ? formatDateWithOffset(2) : approval.dueAt,
            }
          : approval,
      ),
    );

    if (status === 'approved') {
      const approval = approvals.find(item => item.id === approvalId);
      if (!approval) return;
      setProjects(prev =>
        prev.map(project =>
          project.id === approval.projectId
            ? {
                ...project,
                stages: project.stages.map(stage =>
                  stage.ownerRole === 'Designer' && stage.status !== 'completed'
                    ? { ...stage, status: 'completed', completedAt: timestamp }
                    : stage,
                ),
              }
            : project,
        ),
      );
    }
  };

  const recordPayment = (
    invoiceId: string,
    amount: number,
    method: Invoice['payments'][number]['method'],
  ) => {
    const timestamp = new Date().toISOString().split('T')[0];
    setInvoices(prev =>
      prev.map(invoice => {
        if (invoice.id !== invoiceId) return invoice;
        const newPayment = {
          id: generateId('pay'),
          invoiceId,
          amount,
          method,
          date: timestamp,
        };
        const balanceDue = Math.max(invoice.balanceDue - amount, 0);
        const status = balanceDue === 0 ? 'paid' : invoice.status;
        return {
          ...invoice,
          payments: [...invoice.payments, newPayment],
          balanceDue,
          status,
        };
      }),
    );
  };

  const convertQuoteToOrder = (quoteId: string) => {
    const quote = quotes.find(item => item.id === quoteId);
    if (!quote) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const orderId = generateId('order');
    const orderNumber = `SO-${timestamp.replace(/-/g, '').slice(2)}-${Math.floor(Math.random() * 90 + 10)}`;

    const newOrder: Order = {
      id: orderId,
      number: orderNumber,
      customerId: quote.customerId,
      customerName: quote.customerName,
      status: 'pending',
      quoteId: quote.id,
      priority: 'normal',
      promisedDate: quote.items.find(item => item.dueDate)?.dueDate,
      depositRequired: quote.depositRequired,
      depositReceived: quote.depositReceived,
      totalAmount: quote.totalAmount,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const stages = cloneStageTemplate().map(stage => {
      if (stage.name === 'Design') {
        return {
          ...stage,
          status: quote.status === 'accepted' ? 'completed' : 'in_progress',
          startedAt: timestamp,
          completedAt: quote.status === 'accepted' ? timestamp : undefined,
        };
      }
      return stage;
    });

    const newProject: Project = {
      id: generateId('project'),
      code: `PR-${timestamp.replace(/-/g, '').slice(2)}-${Math.floor(Math.random() * 90 + 10)}`,
      orderId,
      name: `${quote.customerName} Job`,
      type: quote.items.some(item => item.fulfillmentType === 'install') ? 'Installation' : 'Print',
      status: 'planning',
      startDate: timestamp,
      dueDate: quote.items.find(item => item.dueDate)?.dueDate,
      budgetHours: quote.items.length * 20,
      actualHours: 0,
      stages,
    };

    const projectTasks = assignTasksFromTemplate(newProject.id, stages);

    const invoice: Invoice = {
      id: generateId('inv'),
      orderId,
      number: `INV-${timestamp.replace(/-/g, '').slice(2)}-${Math.floor(Math.random() * 90 + 10)}`,
      status: quote.depositReceived >= quote.depositRequired ? 'issued' : 'draft',
      issueDate: timestamp,
      dueDate: quote.validUntil,
      totalAmount: quote.totalAmount,
      balanceDue: quote.totalAmount - quote.depositReceived,
      payments:
        quote.depositReceived > 0
          ? [
              {
                id: generateId('pay'),
                invoiceId: '',
                amount: quote.depositReceived,
                method: 'bank_transfer',
                date: timestamp,
              },
            ]
          : [],
    };

    invoice.payments = invoice.payments.map(payment => ({ ...payment, invoiceId: invoice.id }));

    setQuotes(prev => prev.map(item => (item.id === quoteId ? { ...item, status: 'accepted' } : item)));
    setOrders(prev => [newOrder, ...prev]);
    setProjects(prev => [newProject, ...prev]);
    setInvoices(prev => [invoice, ...prev]);
    setTasks(prev => [...projectTasks, ...prev]);
  };

  const value = useMemo(
    () => ({
      leads,
      quotes,
      orders,
      projects,
      approvals,
      invoices,
      tasks,
      inventory,
      portalMilestones: portalMilestoneState,
      convertQuoteToOrder,
      updateQuoteStatus,
      updateOrderStatus,
      updateProjectStage,
      updateTaskStatus,
      recordApprovalDecision,
      recordPayment,
    }),
    [
      approvals,
      inventory,
      invoices,
      leads,
      orders,
      projects,
      portalMilestoneState,
      quotes,
      tasks,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const formatDateWithOffset = (offset: number) => {
  const timestamp = new Date();
  timestamp.setDate(timestamp.getDate() + offset);
  return timestamp.toISOString().split('T')[0];
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
