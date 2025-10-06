# JaxCreativ POS + Project Tracking System Technical Blueprint

> **Note:** The following assets translate the functional specification into database schemas, API contracts, automations, and validation scenarios that can be executed by implementation teams. They assume a PostgreSQL 15 backend, Node/TypeScript REST API, and a React/Next.js customer portal.

## 1. Data Model / Schema

### 1.1 Core Entity Tables

```sql
-- Customers store profile + billing contacts.
CREATE TABLE customers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code        VARCHAR(20) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    channel             VARCHAR(50) NOT NULL, -- walk-in, corporate, online, etc.
    phone               VARCHAR(32),
    email               CITEXT UNIQUE,
    billing_address     JSONB,
    shipping_address    JSONB,
    tax_id              VARCHAR(50),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at         TIMESTAMPTZ
);

CREATE TABLE contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    role            VARCHAR(100),
    phone           VARCHAR(32),
    email           CITEXT,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, email)
);

CREATE INDEX idx_contacts_customer_primary ON contacts (customer_id) WHERE is_primary;
```

```sql
-- Pipeline entities
CREATE TABLE leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source          VARCHAR(100) NOT NULL,
    customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
    status          VARCHAR(50) NOT NULL, -- new, contacted, quoted, closed_won, closed_lost
    notes           TEXT,
    expected_close  DATE,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
```

```sql
CREATE TABLE quotes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_number        VARCHAR(30) NOT NULL UNIQUE,
    lead_id             UUID REFERENCES leads(id) ON DELETE SET NULL,
    customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    valid_from          DATE NOT NULL,
    valid_until         DATE NOT NULL,
    status              VARCHAR(30) NOT NULL DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
    subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    created_by          UUID NOT NULL REFERENCES users(id),
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_customer_status ON quotes(customer_id, status);
```

```sql
CREATE TABLE quote_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id        UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    description     TEXT,
    quantity        NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount_pct    NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 100),
    tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
    line_total      NUMERIC(12,2) NOT NULL,
    fulfillment_type VARCHAR(30) NOT NULL, -- print, install, design, etc.
    required_date   DATE
);

CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
```

```sql
-- Sales order & project delivery
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(30) NOT NULL UNIQUE,
    quote_id            UUID REFERENCES quotes(id) ON DELETE SET NULL,
    customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status              VARCHAR(40) NOT NULL DEFAULT 'pending', -- pending, in_production, ready, completed, cancelled
    po_number           VARCHAR(50),
    priority            VARCHAR(20) NOT NULL DEFAULT 'normal',
    promised_date       DATE,
    deposit_required    NUMERIC(12,2) NOT NULL DEFAULT 0,
    deposit_received    NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
```

```sql
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    quote_item_id   UUID REFERENCES quote_items(id) ON DELETE SET NULL,
    product_id      UUID NOT NULL REFERENCES products(id),
    description     TEXT,
    quantity        NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
    line_total      NUMERIC(12,2) NOT NULL,
    production_notes TEXT
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

```sql
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    project_code    VARCHAR(30) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    status          VARCHAR(40) NOT NULL DEFAULT 'planning', -- planning, design, production, qc, ready, delivered, closed
    start_date      DATE,
    due_date        DATE,
    completion_date DATE,
    budget_hours    NUMERIC(8,2),
    actual_hours    NUMERIC(8,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
```

```sql
CREATE TABLE project_stages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_code      VARCHAR(30) NOT NULL,
    name            VARCHAR(120) NOT NULL,
    sequence        SMALLINT NOT NULL,
    sla_hours       INTEGER NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, active, completed, blocked
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    due_at          TIMESTAMPTZ,
    UNIQUE(project_id, stage_code),
    UNIQUE(project_id, sequence)
);

CREATE INDEX idx_project_stages_status ON project_stages(project_id, status);
```

```sql
CREATE TABLE tasks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_stage_id UUID NOT NULL REFERENCES project_stages(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'todo',
    assignee_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    due_at          TIMESTAMPTZ,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    estimated_hours NUMERIC(6,2),
    actual_hours    NUMERIC(6,2) DEFAULT 0,
    priority        VARCHAR(20) NOT NULL DEFAULT 'normal'
);

CREATE INDEX idx_tasks_stage_status ON tasks(project_stage_id, status);
```

```sql
CREATE TABLE task_activity_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    event_type      VARCHAR(40) NOT NULL, -- status_change, comment, file_added
    payload         JSONB NOT NULL,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_logs_task ON task_activity_logs(task_id);
```

```sql
CREATE TABLE files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id         UUID REFERENCES tasks(id) ON DELETE SET NULL,
    storage_key     VARCHAR(255) NOT NULL UNIQUE,
    file_name       VARCHAR(255) NOT NULL,
    content_type    VARCHAR(120) NOT NULL,
    size_bytes      BIGINT NOT NULL,
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    visibility      VARCHAR(30) NOT NULL DEFAULT 'internal', -- internal, customer, vendor
    checksum        VARCHAR(64),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_project_visibility ON files(project_id, visibility);
```

```sql
CREATE TABLE approvals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_stage_id UUID NOT NULL REFERENCES project_stages(id) ON DELETE CASCADE,
    approval_type   VARCHAR(40) NOT NULL,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    requested_by    UUID NOT NULL REFERENCES users(id),
    approver_id     UUID REFERENCES contacts(id),
    approver_email  CITEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, approved, revision_requested, expired
    decided_at      TIMESTAMPTZ,
    decision_notes  TEXT,
    approval_token  VARCHAR(64) UNIQUE NOT NULL,
    expires_at      TIMESTAMPTZ
);

CREATE INDEX idx_approvals_status ON approvals(status);
```

```sql
CREATE TABLE approval_revisions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id     UUID NOT NULL REFERENCES approvals(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    comment         TEXT,
    created_by      UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(approval_id, revision_number)
);
```

```sql
-- Financials
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  VARCHAR(30) NOT NULL UNIQUE,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    issue_date      DATE NOT NULL,
    due_date        DATE NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft', -- draft, sent, partial, paid, void
    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due     NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_order_status ON invoices(order_id, status);
```

```sql
CREATE TABLE invoice_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    order_item_id   UUID REFERENCES order_items(id) ON DELETE SET NULL,
    description     TEXT NOT NULL,
    quantity        NUMERIC(12,2) NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12,2) NOT NULL,
    tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_total      NUMERIC(12,2) NOT NULL
);
```

```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number  VARCHAR(30) NOT NULL UNIQUE,
    customer_id     UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    method          VARCHAR(30) NOT NULL, -- card, cash, bank_transfer
    reference       VARCHAR(100),
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(30) NOT NULL DEFAULT 'received', -- received, pending, failed
    created_by      UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_payments_customer ON payments(customer_id);
```

```sql
CREATE TABLE payment_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id      UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount_applied  NUMERIC(12,2) NOT NULL CHECK (amount_applied > 0),
    applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(payment_id, invoice_id)
);

CREATE INDEX idx_payment_applications_invoice ON payment_applications(invoice_id);
```

```sql
-- Inventory + production resources
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku             VARCHAR(40) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(40) NOT NULL, -- material, print, service
    default_price   NUMERIC(12,2) NOT NULL,
    cost_price      NUMERIC(12,2) NOT NULL,
    uom             VARCHAR(20) NOT NULL,
    track_inventory BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_locations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    type            VARCHAR(40) NOT NULL
);

CREATE TABLE inventory_levels (
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id     UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
    quantity_on_hand NUMERIC(12,3) NOT NULL DEFAULT 0,
    reorder_point   NUMERIC(12,3) NOT NULL DEFAULT 0,
    PRIMARY KEY (product_id, location_id)
);

CREATE TABLE stock_movements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id     UUID REFERENCES inventory_locations(id) ON DELETE SET NULL,
    order_item_id   UUID REFERENCES order_items(id) ON DELETE SET NULL,
    movement_type   VARCHAR(30) NOT NULL, -- receive, consume, adjust
    quantity        NUMERIC(12,3) NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference       VARCHAR(100),
    created_by      UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, occurred_at DESC);
```

```sql
-- QR / barcode job tickets
CREATE TABLE job_tickets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_id        UUID REFERENCES project_stages(id) ON DELETE SET NULL,
    ticket_code     VARCHAR(64) NOT NULL UNIQUE,
    generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    printed_at      TIMESTAMPTZ,
    last_scanned_at TIMESTAMPTZ,
    metadata        JSONB
);
```

### 1.2 Integrity Notes
- **Cascade deletes**: Project, stage, task, file, and approval data cascade when parent is removed. Invoices/payments cascade to maintain financial consistency; avoid deleting posted records by enforcing status check in application.
- **Unique constraints**: Quote/order/invoice numbers; per-project unique stage sequences; account code; one project per order.
- **Check constraints**: Positive quantities/amounts, discount percentages.
- **Foreign key on update**: Use `ON UPDATE CASCADE` on reference tables (not shown) if codes can change.
- **Audit triggers**: Add `updated_at` triggers via `SET updated_at = NOW()` before updates.
- **Soft deletes**: Use `archived_at` for customers; stage statuses ensure history retention.

## 2. Backend API Design (REST)

### 2.1 Standards
- JSON:API-style pagination (`?page[number]=1&page[size]=25`).
- Authentication: OAuth2/JWT bearer tokens with scopes per role.
- Errors: RFC 7807 Problem Details (`{"type":"...","title":"...","detail":"..."}`).

### 2.2 Orders

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/orders` | List orders (filters: status, customer_id, date range, project_status). |
| POST | `/api/orders` | Create order (auto from accepted quote). |
| GET | `/api/orders/{id}` | Fetch order with items, project summary. |
| PATCH | `/api/orders/{id}` | Update status, promised dates. |
| POST | `/api/orders/{id}/deposit` | Record deposit payment intent. |

**Create Order Payload**
```json
{
  "quoteId": "UUID",
  "poNumber": "PO-123",
  "priority": "rush",
  "promisedDate": "2024-06-01",
  "notes": "Install by weekend"
}
```
**Response**
```json
{
  "id": "UUID",
  "orderNumber": "SO-2400012",
  "status": "pending",
  "depositRequired": 500.00,
  "project": {"id": "UUID", "projectCode": "PRJ-240045"}
}
```

### 2.3 Projects
- `GET /api/projects` (filters: status, dueDate<=, type).
- `POST /api/projects` (manual creation).
- `GET /api/projects/{id}` returns stages, tasks, approvals.
- `PATCH /api/projects/{id}` updates metadata, due date, statuses.
- `POST /api/projects/{id}/stages/{stageId}/start` triggers stage start + SLA timer.
- `POST /api/projects/{id}/stages/{stageId}/complete` finalizes stage.

### 2.4 Tasks
- `GET /api/tasks` (filters: assignee, status, dueBefore, projectId).
- `POST /api/tasks` create task within stage.
- `PATCH /api/tasks/{id}` update status/times.
- `POST /api/tasks/{id}/activity` add comment or file.

### 2.5 Files
- `POST /api/projects/{id}/files` (request signed URL, metadata). Payload: `{"fileName","contentType","size"}` -> response signed PUT URL + file id.
- `GET /api/projects/{id}/files` list (internal vs customer).
- `GET /api/files/{id}/download` returns signed download URL.

### 2.6 Approvals
- `POST /api/projects/{id}/approvals` create approval request (includes file references, approver info).
- `GET /api/approvals/{token}` public endpoint (no auth) for customer view.
- `POST /api/approvals/{token}/decision` payload `{ "decision": "approved" | "revision", "comment": "..." }`.
- `POST /api/approvals/{id}/resend` internal to reissue.

### 2.7 Invoices & Payments
- `GET /api/orders/{id}/invoices`
- `POST /api/orders/{id}/invoices`
- `PATCH /api/invoices/{id}` (status transitions, due date adjustments).
- `POST /api/invoices/{id}/send` triggers email + portal availability.
- `POST /api/payments` create payment (with gateway token).
- `POST /api/payments/{id}/apply` apply to invoice.
- `GET /api/payments` listing.

### 2.8 Sample Request/Response

```http
GET /api/projects?page[number]=1&page[size]=20&status=production
Authorization: Bearer <token>
```
```json
{
  "data": [
    {
      "id": "UUID",
      "projectCode": "PRJ-240045",
      "orderId": "UUID",
      "status": "production",
      "dueDate": "2024-06-05",
      "stages": [
        {"id": "UUID", "stageCode": "design", "status": "completed"},
        {"id": "UUID", "stageCode": "print", "status": "active", "dueAt": "2024-05-27T10:00:00Z"}
      ]
    }
  ],
  "meta": {"total": 42, "page": 1, "pageSize": 20},
  "links": {"next": "/api/projects?page[number]=2&page[size]=20&status=production"}
}
```

### 2.9 Error Handling Example
```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/problem+json

{
  "type": "https://errors.jaxcreativ.com/validation",
  "title": "Validation failed",
  "detail": "Stage cannot be completed before all tasks are done.",
  "status": 422,
  "errors": {"stageId": ["Tasks remain open: TASK-123"]}
}
```

## 3. Business Logic

### 3.1 Quote → Order → Project Automation

```pseudo
function acceptQuote(quoteId, userId) {
  quote = QuoteRepository.getForUpdate(quoteId)
  assert quote.status == 'sent'
  quote.status = 'accepted'
  quote.approved_by = userId
  quote.approved_at = now()
  QuoteRepository.save(quote)

  order = OrderRepository.createFromQuote(quote)
  ProjectService.ensureProject(order)
  InvoiceService.generateDepositInvoice(order)
}

class OrderRepository {
  createFromQuote(quote) {
    order = new Order({
      orderNumber: Sequence.next('SO'),
      quoteId: quote.id,
      customerId: quote.customer_id,
      status: 'pending',
      depositRequired: quote.total_amount * SETTINGS.deposit_rate(quote.channel)
    })
    order.items = quote.items.map(mapQuoteItem)
    return persist(order)
  }
}

class ProjectService {
  ensureProject(order) {
    if (ProjectRepository.existsForOrder(order.id)) return
    template = StageTemplateService.getForOrder(order)
    project = ProjectRepository.create({
      orderId: order.id,
      projectCode: Sequence.next('PRJ'),
      name: `${order.orderNumber} - ${order.customer.name}`,
      type: template.projectType,
      status: 'planning',
      dueDate: order.promised_date
    })
    template.stages.forEach(stageDef =>
      ProjectStageRepository.create({
        projectId: project.id,
        stageCode: stageDef.code,
        name: stageDef.name,
        sequence: stageDef.sequence,
        slaHours: stageDef.slaHours,
        status: stageDef.sequence == 1 ? 'active' : 'pending',
        dueAt: stageDef.sequence == 1 ? now() + stageDef.slaHours.hours() : null
      })
    )
    JobTicketService.generate(project)
  }
}
```

### 3.2 Approval Loop Workflow

```pseudo
function submitForApproval(stageId, payload) {
  stage = StageRepo.get(stageId)
  assert stage.status == 'active'
  approval = ApprovalRepo.create({
    projectStageId: stageId,
    approvalType: payload.type,
    approverEmail: payload.email,
    approvalToken: randomToken(),
    expiresAt: now() + SETTINGS.approvalExpiryHours
  })
  EmailService.sendApprovalRequest(approval)
}

function recordApprovalDecision(token, decision, comment) {
  approval = ApprovalRepo.getByTokenForUpdate(token)
  if (approval.status != 'pending') throw AlreadyDecided
  if (approval.expiresAt < now()) {
    approval.status = 'expired'
    throw Expired
  }

  if (decision == 'approved') {
    approval.status = 'approved'
    approval.decided_at = now()
    StageService.advance(approval.projectStageId)
  } else {
    approval.status = 'revision_requested'
    ApprovalRevisionRepo.create({approvalId: approval.id, comment, revisionNumber: approval.nextRevisionNumber()})
    StageService.flagRevision(approval.projectStageId)
  }
  ApprovalRepo.save(approval)
}
```

### 3.3 Stage Progression + SLA Timers

```pseudo
class StageService {
  advance(stageId) {
    stage = StageRepo.getForUpdate(stageId)
    assert stage.status == 'active'
    assert TasksRepo.allCompleted(stageId)
    stage.status = 'completed'
    stage.completed_at = now()
    StageRepo.save(stage)

    nextStage = StageRepo.getNext(stage.projectId, stage.sequence)
    if (nextStage) {
      nextStage.status = 'active'
      nextStage.started_at = now()
      nextStage.due_at = now() + nextStage.sla_hours.hours()
      StageRepo.save(nextStage)
      SLAScheduler.scheduleCheck(nextStage.id, nextStage.due_at)
    } else {
      ProjectRepo.markCompleted(stage.projectId)
    }
  }

  flagRevision(stageId) {
    stage = StageRepo.getForUpdate(stageId)
    stage.status = 'revision'
    StageRepo.save(stage)
    NotificationService.notifyStageRevision(stage)
  }
}

class SLAScheduler {
  scheduleCheck(stageId, dueAt) {
    JobQueue.enqueue('stage-sla-check', {stageId}, runAt=dueAt)
  }

  handleTimeout(stageId) {
    stage = StageRepo.get(stageId)
    if (stage.status != 'completed') {
      stage.status = 'overdue'
      StageRepo.save(stage)
      NotificationService.sendOverdue(stage)
    }
  }
}
```

### 3.4 QR/Barcode Job Tickets

```pseudo
class JobTicketService {
  generate(project) {
    ticketCode = QRCode.generateValue(`PRJ:${project.projectCode}`)
    ticket = JobTicketRepo.create({
      projectId: project.id,
      ticketCode,
      metadata: {orderNumber: project.order.orderNumber, customer: project.order.customer.name}
    })
    PdfRenderer.renderTicket(ticket)
    return ticket
  }

  scan(ticketCode, station) {
    ticket = JobTicketRepo.getByCode(ticketCode)
    ticket.last_scanned_at = now()
    JobTicketRepo.save(ticket)
    StageService.logScan(ticket.projectId, station)
  }
}
```

## 4. Customer Portal

### 4.1 Authentication
- Magic link or SSO per customer contact with JWT tokens scoped to customer ID.

### 4.2 API Endpoints (Portal Gateway)
- `POST /portal/auth/magic-link` → sends link to email.
- `POST /portal/auth/exchange` → verifies token, issues JWT.
- `GET /portal/orders` (customer-scoped).
- `GET /portal/orders/{orderId}` includes status timeline, outstanding invoices.
- `GET /portal/projects/{projectId}/approvals/{approvalToken}` for mockup approval.
- `POST /portal/approvals/{token}/decision` (same as public but with audit of contact).
- `POST /portal/orders/{orderId}/uploads/size-list` returns signed S3 PUT URL (folder `customers/{customerId}/orders/{orderId}/size-lists/`).
- `GET /portal/orders/{orderId}/files` returns signed GET URLs (time-limited, 10 minutes).
- `POST /portal/payments` integrate with payment gateway (Stripe) to create payment intent.

### 4.3 UI Flows
1. **Dashboard:** List open orders, statuses (with progress bar per stage), outstanding balances.
2. **Approve Mockup:** Notification email -> Portal route -> display mockup preview + approve/revision form -> on approval, show success + next steps.
3. **Upload Size List:** Provide template download, drag-drop upload -> confirm.
4. **Pay Online:** Outstanding invoices -> choose invoice -> open hosted payment page -> redirect back with success.

### 4.4 File Security
- Use cloud storage (S3) with private bucket.
- Upload: backend signs `PUT` URL with `Content-MD5` and size limit.
- Download: backend validates request (customer, order) before generating signed GET URL with `Response-Content-Disposition`.
- Audit logs: record who accessed file (contact, IP).

## 5. Automations & Alerts

### 5.1 Scheduled Jobs
- `cron.daily 08:00` → Quote expiry checker: mark quotes `expired` if `valid_until < now()` and send reminder 3 days before.
- `cron.hourly` → Stage SLA monitor (fallback to queue-based scheduling).
- `cron.daily 07:30` → Inventory reorder report (select `quantity_on_hand < reorder_point`).

### 5.2 Event Triggers
- **Quote Accepted** → Auto order/project creation, send deposit invoice, create approval tasks.
- **Stage Activated** → Schedule SLA check; notify assignees.
- **Stage Overdue** → Slack/Email to manager, escalate after 24h.
- **Approval Revision** → Reopen tasks, notify designer + customer.
- **Payment Posted** → Update invoice balance, send receipt, release production if deposit threshold met.

### 5.3 Implementation Pseudocode

```pseudo
JobQueue.on('quote-expiry-reminder', (quoteId) => {
  quote = QuoteRepo.get(quoteId)
  if (quote.status == 'sent' && quote.valid_until - now() <= 3 days) {
    NotificationService.sendQuoteReminder(quote)
  }
})

trigger after insert on stock_movements when movement_type = 'consume' execute procedure check_stock_level();

CREATE OR REPLACE FUNCTION check_stock_level() RETURNS trigger AS $$
BEGIN
  UPDATE inventory_levels
  SET quantity_on_hand = quantity_on_hand - NEW.quantity
  WHERE product_id = NEW.product_id AND location_id = COALESCE(NEW.location_id, default_location());

  IF (SELECT quantity_on_hand FROM inventory_levels WHERE product_id = NEW.product_id) <
     (SELECT reorder_point FROM inventory_levels WHERE product_id = NEW.product_id) THEN
     PERFORM NotificationService.enqueue('stock-alert', json_build_object('productId', NEW.product_id));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 6. Dashboards & KPIs

### 6.1 Lead → Order Conversion
```sql
SELECT
  DATE_TRUNC('month', l.created_at) AS month,
  COUNT(*) FILTER (WHERE l.status = 'closed_won')::DECIMAL / NULLIF(COUNT(*),0) * 100 AS conversion_rate
FROM leads l
GROUP BY 1
ORDER BY 1;
```

### 6.2 On-time Delivery %
```sql
SELECT
  DATE_TRUNC('month', o.created_at) AS month,
  COUNT(*) FILTER (WHERE p.completion_date <= o.promised_date) * 100.0 / NULLIF(COUNT(*), 0) AS on_time_pct
FROM orders o
JOIN projects p ON p.order_id = o.id
WHERE o.status = 'completed'
GROUP BY 1
ORDER BY 1;
```

### 6.3 Revision Counts per Stage
```sql
SELECT
  ps.stage_code,
  COUNT(ar.id) AS revision_count,
  COUNT(DISTINCT ps.project_id) AS impacted_projects
FROM approvals a
JOIN approval_revisions ar ON ar.approval_id = a.id
JOIN project_stages ps ON ps.id = a.project_stage_id
GROUP BY ps.stage_code
ORDER BY revision_count DESC;
```

### 6.4 Profitability per Job Type
```sql
SELECT
  pr.type AS project_type,
  SUM(oi.line_total) AS revenue,
  SUM(sm.quantity * prod.cost_price) AS material_cost,
  SUM(t.actual_hours * rate.hourly_rate) AS labor_cost,
  SUM(oi.line_total) - SUM(sm.quantity * prod.cost_price) - SUM(t.actual_hours * rate.hourly_rate) AS profit,
  (SUM(oi.line_total) - SUM(sm.quantity * prod.cost_price) - SUM(t.actual_hours * rate.hourly_rate)) * 100.0 / NULLIF(SUM(oi.line_total),0) AS margin_pct
FROM projects pr
JOIN orders o ON o.id = pr.order_id
JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN stock_movements sm ON sm.order_item_id = oi.id AND sm.movement_type = 'consume'
LEFT JOIN products prod ON prod.id = sm.product_id
LEFT JOIN tasks t ON t.project_stage_id IN (
  SELECT id FROM project_stages WHERE project_id = pr.id
)
LEFT JOIN labor_rates rate ON rate.role = t.assignee_role
GROUP BY pr.type;
```

### 6.5 WIP Dashboard Query
```sql
SELECT
  pr.project_code,
  pr.status,
  ps.stage_code,
  ps.status AS stage_status,
  ps.due_at,
  EXTRACT(EPOCH FROM (ps.due_at - NOW()))/3600 AS hours_remaining,
  COUNT(t.id) FILTER (WHERE t.status != 'completed') AS open_tasks
FROM projects pr
JOIN project_stages ps ON ps.project_id = pr.id
LEFT JOIN tasks t ON t.project_stage_id = ps.id
WHERE pr.status NOT IN ('delivered', 'closed')
ORDER BY ps.due_at;
```

## 7. Security

### 7.1 Role-Based Access Control

| Role | Permissions |
| --- | --- |
| Sales | Manage leads, quotes, view own orders. |
| Designer | View assigned projects/stages, upload files, request approvals. |
| Production | View production stages, log time, scan job tickets. |
| QC | Access QC stages, mark pass/fail, view approvals. |
| Finance | Manage invoices/payments, view financial reports. |
| Manager/Admin | Full access, manage roles, audit logs. |

Implementation outline:

```pseudo
class Policy {
  static can(user, action, resource) {
    switch user.role:
      case 'sales': return action in SALES_PERMISSIONS[resource]
      case 'designer': ...
  }
}

middleware authorize(action, resource):
  user = authContext.user
  if (!Policy.can(user, action, resource)) throw Forbidden
```

- Use `users` table with `role` ENUM and `team_id` for row-level restrictions.
- Implement attribute-based checks (e.g., designers only see `tasks.assignee_id = user.id`).

### 7.2 Data Protection
- Encrypt PII at rest via column-level encryption (e.g., using pgcrypto for `customers.email`, `tax_id`).
- Force TLS for all API & portal traffic.
- Secure secrets in vault (AWS Secrets Manager).
- Financial data: segregate `payments` service; store only last4 + tokens. Integrate PCI-compliant processor.
- Audit logging: `audit_logs` table capturing user, action, timestamp, metadata.
- Apply database row-level security (RLS) for portal connections limited to customer data.
- Backup & retention: daily encrypted backups with retention policy.

## 8. Verification Steps

### 8.1 Test Scenarios
1. **Quote Acceptance Flow**
   ```pseudo
   Given quote Q in status 'sent'
   When POST /api/quotes/{id}/accept
   Then Order, Project, Deposit Invoice created
   And project first stage is active with due_at set
   And job ticket generated
   ```
2. **Approval Revision Loop**
   ```pseudo
   Given stage S with approval pending
   When customer submits decision=revision with comment
   Then approval.status='revision_requested'
   And revision record appended
   And stage.status='revision'
   And notification to designer
   ```
3. **Payment Allocation**
   ```pseudo
   Given invoice I total=1000
   When POST /api/payments with amount=500
   And POST /api/payments/{paymentId}/apply {invoiceId:I, amount:500}
   Then invoice.balance_due=500 and status='partial'
   ```
4. **SLA Overdue**
   ```pseudo
   Given stage due_at in past and status='active'
   When SLA job runs
   Then stage.status='overdue' and alert created
   ```

### 8.2 Automated Tests
- Backend unit tests (Jest) for services: `ProjectService.ensureProject`, `StageService.advance`, `ApprovalService`.
- Integration tests using supertest for REST endpoints (mock auth + DB).
- SQL migration tests verifying constraints using `pgTAP`.
- Portal Cypress tests for approve/upload/pay flows.

### 8.3 Linting & Formatting
- Configure `eslint` + `prettier` for Node/TypeScript services.
- Use `sqlfluff` for SQL migrations.
- Git hooks via Husky to run lint + tests before push.
```

