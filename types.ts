export interface RestorationOptions {
  restoreFace: boolean;
  colorize: boolean;
  upscale: boolean;
  cleanNoise: boolean;
}

export interface TarpDesignOptions {
  name: string;
  age: string;
  theme: string;
  orientation: 'Portrait' | 'Landscape';
}

export type LeadStatus = 'new' | 'contacted' | 'quoted' | 'closed_won' | 'closed_lost';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  expectedClose: string;
  owner: string;
  value: number;
  notes?: string;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface QuoteItem {
  id: string;
  product: string;
  fulfillmentType: 'print' | 'install' | 'design';
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxRate?: number;
  dueDate?: string;
  notes?: string;
}

export interface Quote {
  id: string;
  number: string;
  customerName: string;
  customerId: string;
  status: QuoteStatus;
  validFrom: string;
  validUntil: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  depositRequired: number;
  depositReceived: number;
  createdAt: string;
  owner: string;
  items: QuoteItem[];
}

export type OrderStatus = 'pending' | 'in_production' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  number: string;
  customerName: string;
  customerId: string;
  status: OrderStatus;
  quoteId?: string;
  poNumber?: string;
  priority: 'rush' | 'high' | 'normal';
  promisedDate?: string;
  depositRequired: number;
  depositReceived: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStageStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface ProjectStage {
  id: string;
  name: string;
  status: ProjectStageStatus;
  ownerRole: 'Sales' | 'Designer' | 'Production' | 'QC' | 'Manager';
  startedAt?: string;
  dueAt?: string;
  completedAt?: string;
  slaHours: number;
  notes?: string;
  templateId?: string;
}

export type ProjectStatus = 'planning' | 'design' | 'production' | 'qc' | 'ready' | 'delivered' | 'closed';

export interface Project {
  id: string;
  code: string;
  orderId: string;
  name: string;
  type: string;
  status: ProjectStatus;
  startDate: string;
  dueDate?: string;
  completionDate?: string;
  budgetHours: number;
  actualHours: number;
  stages: ProjectStage[];
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Done';

export interface Task {
  id: string;
  projectId: string;
  stageId: string;
  title: string;
  assignee: string;
  role: 'Sales' | 'Designer' | 'Production' | 'QC' | 'Finance';
  status: TaskStatus;
  dueAt?: string;
  estimatedHours: number;
  actualHours: number;
  notes?: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'revision_required';

export interface Approval {
  id: string;
  projectId: string;
  version: number;
  status: ApprovalStatus;
  requestedAt: string;
  dueAt: string;
  reviewer: string;
  assetUrl: string;
  notes?: string;
}

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue';

export interface Payment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'gcash' | 'card';
  reference?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  number: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  balanceDue: number;
  payments: Payment[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  stockOnHand: number;
  reorderPoint: number;
  status: 'in_stock' | 'low' | 'out_of_stock';
  vendor?: string;
}

export interface PortalMilestone {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
}
