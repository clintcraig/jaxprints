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

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (days: number) => formatDate(new Date(today.getTime() + days * 24 * 60 * 60 * 1000));

export const initialLeads: Lead[] = [
  {
    id: 'lead-001',
    name: 'Mark Rivera',
    company: 'Rivera Events',
    email: 'mark@riveraevents.com',
    phone: '+63 917 555 0123',
    status: 'contacted',
    source: 'Facebook Ads',
    expectedClose: addDays(7),
    owner: 'Aira (Sales)',
    value: 45000,
    notes: 'Needs rush tarpaulin and backdrop for weekend event.',
  },
  {
    id: 'lead-002',
    name: 'Lara Santos',
    company: 'Santos Fitness',
    email: 'lara@santosfitness.ph',
    phone: '+63 918 444 9987',
    status: 'quoted',
    source: 'Walk-in',
    expectedClose: addDays(3),
    owner: 'Ben (Sales)',
    value: 82000,
    notes: 'Expansion signage package pending approval.',
  },
  {
    id: 'lead-003',
    name: 'Jude Tan',
    company: 'Tan Tech',
    email: 'jude@tantech.io',
    phone: '+63 926 671 2211',
    status: 'new',
    source: 'Referral',
    expectedClose: addDays(14),
    owner: 'Aira (Sales)',
    value: 30000,
  },
];

export const initialQuotes: Quote[] = [
  {
    id: 'quote-001',
    number: 'QT-2025-0011',
    customerId: 'cust-001',
    customerName: 'Rivera Events',
    status: 'sent',
    validFrom: formatDate(today),
    validUntil: addDays(14),
    subtotal: 48000,
    discountAmount: 3000,
    taxAmount: 5760,
    totalAmount: 50760,
    depositRequired: 20000,
    depositReceived: 10000,
    createdAt: formatDate(today),
    owner: 'Aira (Sales)',
    items: [
      {
        id: 'qi-001',
        product: '12ft Stage Backdrop',
        fulfillmentType: 'print',
        quantity: 1,
        unitPrice: 18000,
        discountPct: 5,
        taxRate: 12,
        dueDate: addDays(10),
      },
      {
        id: 'qi-002',
        product: '4x6m Tarpaulin',
        fulfillmentType: 'print',
        quantity: 2,
        unitPrice: 7500,
        taxRate: 12,
        dueDate: addDays(8),
      },
    ],
  },
  {
    id: 'quote-002',
    number: 'QT-2025-0012',
    customerId: 'cust-002',
    customerName: 'Santos Fitness',
    status: 'accepted',
    validFrom: formatDate(today),
    validUntil: addDays(10),
    subtotal: 90000,
    discountAmount: 0,
    taxAmount: 10800,
    totalAmount: 100800,
    depositRequired: 40000,
    depositReceived: 40000,
    createdAt: formatDate(today),
    owner: 'Ben (Sales)',
    items: [
      {
        id: 'qi-003',
        product: 'Lighted Acrylic Signage',
        fulfillmentType: 'install',
        quantity: 1,
        unitPrice: 60000,
        taxRate: 12,
        dueDate: addDays(21),
      },
      {
        id: 'qi-004',
        product: 'Interior Wall Graphics',
        fulfillmentType: 'design',
        quantity: 1,
        unitPrice: 30000,
        taxRate: 12,
        notes: 'Includes three design revisions.',
      },
    ],
  },
];

export const initialOrders: Order[] = [
  {
    id: 'order-001',
    number: 'SO-2025-0041',
    customerId: 'cust-002',
    customerName: 'Santos Fitness',
    status: 'in_production',
    quoteId: 'quote-002',
    poNumber: 'SF-PO-1022',
    priority: 'high',
    promisedDate: addDays(25),
    depositRequired: 40000,
    depositReceived: 40000,
    totalAmount: 100800,
    createdAt: formatDate(today),
    updatedAt: formatDate(today),
  },
];

const santosStages: ProjectStage[] = [
  {
    id: 'stage-001',
    name: 'Design',
    status: 'completed',
    ownerRole: 'Designer',
    startedAt: addDays(-5),
    completedAt: addDays(-2),
    slaHours: 48,
  },
  {
    id: 'stage-002',
    name: 'Production',
    status: 'in_progress',
    ownerRole: 'Production',
    startedAt: addDays(-2),
    dueAt: addDays(3),
    slaHours: 72,
  },
  {
    id: 'stage-003',
    name: 'QC & Handover',
    status: 'pending',
    ownerRole: 'QC',
    slaHours: 24,
  },
];

export const initialProjects: Project[] = [
  {
    id: 'project-001',
    code: 'PR-2025-030',
    orderId: 'order-001',
    name: 'Santos Fitness Signage Rollout',
    type: 'Signage',
    status: 'production',
    startDate: addDays(-6),
    dueDate: addDays(7),
    budgetHours: 120,
    actualHours: 46,
    stages: santosStages,
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task-001',
    projectId: 'project-001',
    stageId: 'stage-002',
    title: 'Prepare acrylic panels',
    assignee: 'Jon (Production)',
    role: 'Production',
    status: 'In Progress',
    dueAt: addDays(2),
    estimatedHours: 12,
    actualHours: 6,
  },
  {
    id: 'task-002',
    projectId: 'project-001',
    stageId: 'stage-002',
    title: 'Print wall graphics',
    assignee: 'Mae (Production)',
    role: 'Production',
    status: 'Not Started',
    dueAt: addDays(1),
    estimatedHours: 10,
    actualHours: 0,
  },
  {
    id: 'task-003',
    projectId: 'project-001',
    stageId: 'stage-003',
    title: 'Schedule QC walk-through',
    assignee: 'Ivy (QC)',
    role: 'QC',
    status: 'Blocked',
    notes: 'Awaiting production completion',
    estimatedHours: 3,
    actualHours: 0,
  },
];

export const initialApprovals: Approval[] = [
  {
    id: 'approval-001',
    projectId: 'project-001',
    version: 2,
    status: 'pending',
    requestedAt: addDays(-1),
    dueAt: addDays(1),
    reviewer: 'Lara Santos',
    assetUrl: 'https://cdn.example.com/mockups/santos-fitness-v2.pdf',
    notes: 'Client requested brighter lighting in revision 1.',
  },
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-001',
    orderId: 'order-001',
    number: 'INV-2025-0081',
    status: 'issued',
    issueDate: formatDate(today),
    dueDate: addDays(15),
    totalAmount: 100800,
    balanceDue: 60800,
    payments: [
      {
        id: 'pay-001',
        invoiceId: 'inv-001',
        amount: 40000,
        method: 'bank_transfer',
        date: addDays(-1),
        reference: 'UBP-45891',
      },
    ],
  },
];

export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-item-001',
    sku: 'TARP-13OZ',
    name: 'Tarpaulin 13oz (Roll)',
    unit: 'roll',
    stockOnHand: 18,
    reorderPoint: 10,
    status: 'in_stock',
    vendor: 'WideFormat Supply Co.',
  },
  {
    id: 'inv-item-002',
    sku: 'INK-CMYK-SET',
    name: 'CMYK Ink Set',
    unit: 'set',
    stockOnHand: 3,
    reorderPoint: 5,
    status: 'low',
    vendor: 'ColorLab Philippines',
  },
];

export const portalMilestones: PortalMilestone[] = [
  {
    id: 'portal-001',
    name: 'Approve Design Mockups',
    completed: false,
  },
  {
    id: 'portal-002',
    name: 'Submit Jersey Sizes',
    completed: true,
    completedAt: addDays(-1),
  },
  {
    id: 'portal-003',
    name: 'Pay Remaining Balance',
    completed: false,
  },
];

export const initialProjectTemplates: ProjectStage[] = [
  {
    id: 'template-design',
    name: 'Design',
    status: 'pending',
    ownerRole: 'Designer',
    slaHours: 48,
  },
  {
    id: 'template-production',
    name: 'Production',
    status: 'pending',
    ownerRole: 'Production',
    slaHours: 72,
  },
  {
    id: 'template-qc',
    name: 'QC & Handover',
    status: 'pending',
    ownerRole: 'QC',
    slaHours: 24,
  },
];

export const initialTasksCatalog: Task[] = [
  {
    id: 'template-task-design-brief',
    projectId: 'template',
    stageId: 'template-design',
    title: 'Finalize creative brief',
    assignee: 'Designer Team',
    role: 'Designer',
    status: 'Not Started',
    estimatedHours: 4,
    actualHours: 0,
  },
  {
    id: 'template-task-production-schedule',
    projectId: 'template',
    stageId: 'template-production',
    title: 'Schedule print run',
    assignee: 'Production Planner',
    role: 'Production',
    status: 'Not Started',
    estimatedHours: 2,
    actualHours: 0,
  },
];
