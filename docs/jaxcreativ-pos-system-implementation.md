# JaxCreativ POS + Project Tracking System Implementation Playbook

> Companion asset derived from the functional specification. Organized by implementation concern so the delivery teams can plug the artifacts directly into migrations, services, and tests.

## 1. Data Model / Schema

### 1.1 Core Tables (PostgreSQL 15)

```sql
-- Users referenced by many tables
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT NOT NULL UNIQUE,
    full_name       VARCHAR(150) NOT NULL,
    role            VARCHAR(30) NOT NULL CHECK (role IN ('sales','designer','production','qc','finance','manager','admin')),
    password_hash   TEXT NOT NULL,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code        VARCHAR(20) NOT NULL UNIQUE,
    name                VARCHAR(255) NOT NULL,
    channel             VARCHAR(50) NOT NULL,
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
CREATE TABLE leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source          VARCHAR(100) NOT NULL,
    customer_id     UUID REFERENCES customers(id) ON DELETE SET NULL,
    status          VARCHAR(50) NOT NULL,
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
    status              VARCHAR(30) NOT NULL DEFAULT 'draft',
    subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    created_by          UUID NOT NULL REFERENCES users(id),
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (valid_until >= valid_from)
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
    fulfillment_type VARCHAR(30) NOT NULL,
    required_date   DATE
);

CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);
```

```sql
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(30) NOT NULL UNIQUE,
    quote_id            UUID REFERENCES quotes(id) ON DELETE SET NULL,
    customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status              VARCHAR(40) NOT NULL DEFAULT 'pending',
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
    status          VARCHAR(40) NOT NULL DEFAULT 'planning',
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
    status          VARCHAR(30) NOT NULL DEFAULT 'pending',
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
    event_type      VARCHAR(40) NOT NULL,
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
    visibility      VARCHAR(30) NOT NULL DEFAULT 'internal',
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
    status          VARCHAR(30) NOT NULL DEFAULT 'pending',
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
CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  VARCHAR(30) NOT NULL UNIQUE,
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    issue_date      DATE NOT NULL,
    due_date        DATE NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
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
    method          VARCHAR(30) NOT NULL,
    reference       VARCHAR(100),
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(30) NOT NULL DEFAULT 'received',
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
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku             VARCHAR(40) NOT NULL UNIQUE,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(40) NOT NULL,
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
    movement_type   VARCHAR(30) NOT NULL,
    quantity        NUMERIC(12,3) NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference       VARCHAR(100),
    created_by      UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id, occurred_at DESC);
```

```sql
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

### 1.2 Integrity & Enforcement
- **Cascades**: Contacts, project hierarchy, files, approvals cascade on delete; orders/projects cascade to dependent records; invoices and payments cascade but enforce business rule preventing deletion when `status` in ('sent','paid') via trigger.
- **Unique Sequences**: Application-managed sequences for quote/order/invoice/payment numbers ensure uniqueness even under concurrency by using PostgreSQL `nextval`.
- **Audit Hooks**: Trigger functions update `updated_at` and append to `audit_logs` table (`AFTER INSERT/UPDATE/DELETE`).
- **Soft Delete**: Use `archived_at` columns and filtered unique indexes (e.g., `UNIQUE(account_code) WHERE archived_at IS NULL`) when archiving is required.
- **Referential Integrity**: `ON DELETE SET NULL` for optional relationships (e.g., quote → lead). Use deferred constraints for bulk imports where necessary.

## 2. Backend API (REST)

### 2.1 Conventions
- Base path: `/api/v1` with OAuth2 bearer tokens. Require `X-Tenant` header if multi-tenant.
- Pagination: `GET` collections accept `page[number]`, `page[size]` (default 25, max 100) and return `{"data":[],"meta":{"page":{},"total":123}}`.
- Errors: RFC7807 JSON body with correlation ID header `X-Request-Id`.

### 2.2 Orders

| Method | Route | Auth Scope | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/orders` | `orders:read` | List orders (filters: `status`, `customerId`, `createdFrom`, `createdTo`). |
| POST | `/api/v1/orders` | `orders:write` | Create order manually or from quote. |
| GET | `/api/v1/orders/{orderId}` | `orders:read` | Fetch order with items, deposit summary, linked project. |
| PATCH | `/api/v1/orders/{orderId}` | `orders:write` | Update PO, priority, promised date, notes, status transitions. |
| POST | `/api/v1/orders/{orderId}/deposit` | `payments:write` | Record deposit receipt or initiate payment intent. |

**POST /api/v1/orders**
```json
{
  "quoteId": "6f5f...",
  "poNumber": "PO-2024-001",
  "priority": "rush",
  "promisedDate": "2024-06-01",
  "notes": "Install by weekend"
}
```
**Response**
```json
{
  "data": {
    "id": "3f4c...",
    "orderNumber": "SO-2400012",
    "status": "pending",
    "depositRequired": 500.0,
    "project": {"id": "e6de...", "projectCode": "PRJ-240045"}
  }
}
```

**POST /api/v1/orders/{orderId}/deposit**
```json
{
  "amount": 500.0,
  "method": "card",
  "reference": "pi_123"
}
```
Response includes updated invoice/payment records.

### 2.3 Projects

| Method | Route | Scope | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/projects` | `projects:read` | Filter by `status`, `dueBefore`, `type`, `customerId`. |
| POST | `/api/v1/projects` | `projects:write` | Manual project creation (rare). |
| GET | `/api/v1/projects/{id}` | `projects:read` | Include stages, tasks, approvals, job ticket URLs. |
| PATCH | `/api/v1/projects/{id}` | `projects:write` | Update metadata, due date, stage overrides. |
| POST | `/api/v1/projects/{id}/stages/{stageId}/start` | `projects:write` | Activate a stage (records timestamps + SLA). |
| POST | `/api/v1/projects/{id}/stages/{stageId}/complete` | `projects:write` | Complete stage, optionally include metrics. |

Sample `PATCH` payload
```json
{
  "dueDate": "2024-06-10",
  "status": "production",
  "notes": "Customer approved ahead of schedule"
}
```

### 2.4 Tasks

| Method | Route | Scope | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/tasks` | `tasks:read` | Query tasks (filters: `assigneeId`, `status`, `dueBefore`, `projectId`). |
| POST | `/api/v1/tasks` | `tasks:write` | Create task within stage. |
| GET | `/api/v1/tasks/{id}` | `tasks:read` | Detail with activity log + file metadata. |
| PATCH | `/api/v1/tasks/{id}` | `tasks:write` | Update status/time tracking. |
| POST | `/api/v1/tasks/{id}/activity` | `tasks:write` | Append comment/log entry or request file upload. |

Sample create payload
```json
{
  "projectStageId": "2d1c...",
  "title": "Prepare print layout",
  "assigneeId": "u-123",
  "dueAt": "2024-05-18T12:00:00Z",
  "estimatedHours": 3.5
}
```

### 2.5 Files
- `POST /api/v1/projects/{projectId}/files` (`files:write`): request signed upload URL.
  ```json
  {"fileName":"mockup.pdf","contentType":"application/pdf","size":5242880,"visibility":"customer"}
  ```
  Response: `{"uploadUrl":"https://...","fileId":"...","headers":{"Content-MD5":"..."}}`.
- `GET /api/v1/projects/{projectId}/files` (`files:read`): list available files, returns signed GET URLs per item when `include=downloadUrl`.
- `DELETE /api/v1/files/{fileId}`: mark file archived, revoke signed URLs.

### 2.6 Approvals

| Method | Route | Scope | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/stages/{stageId}/approvals` | `approvals:write` | Initiate approval request. |
| GET | `/api/v1/approvals/{id}` | `approvals:read` | Retrieve status, history. |
| POST | `/api/v1/approvals/{token}/decision` | public | Token-based decision endpoint. |
| POST | `/api/v1/approvals/{id}/remind` | `approvals:write` | Send reminder email/text. |

Sample decision payload
```json
{"decision":"approved","comment":"Looks good"}
```
Response returns updated stage snapshot.

### 2.7 Invoices

| Method | Route | Scope | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/invoices` | `invoices:read` | Filter by `status`, `customerId`, `orderId`. |
| POST | `/api/v1/invoices` | `invoices:write` | Create invoice (auto for deposit/final). |
| GET | `/api/v1/invoices/{id}` | `invoices:read` | Includes items, payments applied. |
| PATCH | `/api/v1/invoices/{id}` | `invoices:write` | Update due dates, notes, mark void. |
| POST | `/api/v1/invoices/{id}/send` | `invoices:write` | Queue send via email/portal. |

Sample create payload
```json
{
  "orderId": "3f4c...",
  "issueDate": "2024-05-01",
  "dueDate": "2024-05-15",
  "items": [
    {"orderItemId":"9a0b...","description":"Printed banners","quantity":10,"unitPrice":50,"taxRate":7}
  ]
}
```
Response returns totals and invoice number.

### 2.8 Payments

| Method | Route | Scope | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/payments` | `payments:read` | List payments with filters `customerId`, `status`. |
| POST | `/api/v1/payments` | `payments:write` | Record payment or gateway intent. |
| GET | `/api/v1/payments/{id}` | `payments:read` | Detail, including applications. |
| POST | `/api/v1/payments/{id}/apply` | `payments:write` | Apply amount to invoice(s). |

Sample apply payload
```json
{
  "applications": [
    {"invoiceId":"inv-1","amount":500.0}
  ]
}
```
Response returns updated invoice balances and payment status.

## 3. Business Logic Workflows

### 3.1 Quote ➜ Order ➜ Project
```typescript
class QuoteService {
  async acceptQuote(id: UUID, actor: User) {
    const quote = await this.quoteRepo.findSentById(id);
    if (!quote) throw new NotFoundError();
    return this.tx(async (trx) => {
      await this.quoteRepo.markAccepted(id, actor.id, trx);
      const order = await this.orderRepo.createFromQuote(quote, trx);
      const project = await this.projectService.ensureProjectForOrder(order, trx);
      await this.invoiceService.createDepositInvoice(order, trx);
      await this.jobTicketService.generate(project, trx);
      await this.notificationService.orderConfirmed(order, project, trx);
      return { quote, order, project };
    });
  }
}
```
`ensureProjectForOrder` selects stage template based on order type, activates stage 1, sets `due_at = now() + sla_hours`, and schedules SLA monitor via job queue.

### 3.2 Approval Loop
```typescript
class ApprovalService {
  async requestApproval(stageId: UUID, payload: ApprovalRequest) {
    const stage = await this.stageRepo.requireActive(stageId);
    const approval = await this.approvalRepo.create({
      projectStageId: stageId,
      approvalType: payload.type,
      approverEmail: payload.email,
      approverId: payload.contactId,
      approvalToken: randomToken(),
      expiresAt: addHours(new Date(), this.config.approvalExpiryHours)
    });
    await this.notificationService.sendApprovalEmail(approval);
    return approval;
  }

  async recordDecision(token: string, decision: 'approved'|'revision', comment?: string) {
    const approval = await this.approvalRepo.lockByToken(token);
    if (approval.status !== 'pending') throw new ConflictError();
    if (approval.expiresAt && approval.expiresAt < new Date()) {
      await this.approvalRepo.expire(approval.id);
      throw new GoneError('Approval expired');
    }

    if (decision === 'approved') {
      await this.stageService.completeApprovalStage(approval.projectStageId, approval.id);
    } else {
      await this.approvalRepo.markRevision(approval.id, comment);
      await this.stageService.flagRevision(approval.projectStageId, comment);
    }
    return this.approvalRepo.byId(approval.id);
  }
}
```

### 3.3 Stage Progression & SLA Timers
```typescript
class StageService {
  async completeStage(stageId: UUID) {
    const stage = await this.stageRepo.lockActive(stageId);
    const tasksDone = await this.taskRepo.areAllCompleted(stageId);
    if (!tasksDone) throw new ConflictError('Outstanding tasks');

    await this.stageRepo.markCompleted(stageId);
    const nextStage = await this.stageRepo.getNext(stage.projectId, stage.sequence);
    if (nextStage) {
      await this.stageRepo.activate(nextStage.id, this.config.now());
      await this.slaScheduler.schedule(nextStage.id, nextStage.slaHours);
    } else {
      await this.projectRepo.closeProject(stage.projectId);
    }
  }

  async flagRevision(stageId: UUID, comment: string) {
    await this.stageRepo.updateStatus(stageId, 'revision');
    await this.notificationService.stageRevision(stageId, comment);
  }
}

class SLAScheduler {
  async schedule(stageId: UUID, slaHours: number) {
    const dueAt = addHours(this.config.now(), slaHours);
    await this.jobQueue.enqueue('stage-sla-check', { stageId }, { runAt: dueAt });
  }

  async handleTimeout(stageId: UUID) {
    const stage = await this.stageRepo.byId(stageId);
    if (stage.status !== 'completed') {
      await this.stageRepo.updateStatus(stageId, 'overdue');
      await this.notificationService.stageOverdue(stageId);
    }
  }
}
```

### 3.4 QR / Barcode Job Tickets
```typescript
class JobTicketService {
  async generate(project: Project, trx) {
    const ticketCode = this.sequence.next('JOB');
    const qrImage = await this.qrGenerator.generate(`PRJ:${project.projectCode}`);
    const ticket = await this.ticketRepo.insert({
      projectId: project.id,
      ticketCode,
      metadata: { orderNumber: project.orderNumber, customer: project.customerName }
    }, trx);
    await this.pdfRenderer.renderJobTicket(ticket, qrImage);
    return ticket;
  }

  async registerScan(ticketCode: string, station: string) {
    const ticket = await this.ticketRepo.byCode(ticketCode);
    await this.ticketRepo.updateScan(ticket.id, station, this.config.now());
    await this.stageRepo.logCheckpoint(ticket.projectId, station);
  }
}
```

## 4. Customer Portal

### 4.1 Public/Portal Endpoints
- `POST /portal/auth/magic-link` → `{ "email": "contact@client.com" }` (creates one-time token, emails link).
- `POST /portal/auth/exchange` → `{ "token": "abc" }` returns JWT scoped to `customerId` & contact ID.
- `GET /portal/orders?page[size]=10` (requires portal JWT) → returns only customer orders with stage summaries.
- `GET /portal/orders/{orderId}` → includes `timeline`, `openApprovals`, `invoices` with balances.
- `GET /portal/projects/{projectId}/approvals/{token}` → fetch approval details for preview.
- `POST /portal/approvals/{token}/decision` → same payload as backend but audit contact info.
- `POST /portal/orders/{orderId}/uploads/size-list` → returns signed S3 PUT URL; metadata row inserted into `files` with `visibility='customer'`.
- `GET /portal/orders/{orderId}/files` → returns signed GET URLs valid 10 minutes.
- `POST /portal/payments` → integrates Stripe checkout session; returns hosted payment URL.

### 4.2 UI Flow Notes
1. **Dashboard**: After JWT exchange, load `GET /portal/orders`. Display per-order status with stage progress bar. Outstanding invoices call `GET /portal/invoices?status=open` (portal-scoped view).
2. **Mockup Approval**: Email link → `GET /portal/projects/{projectId}/approvals/{token}` to render preview (signed URL). Buttons call decision endpoint.
3. **Size List Upload**: Provide template download (static asset). On upload, request signed URL, perform PUT from browser, then notify backend via `POST /portal/files/complete` to finalize metadata.
4. **Online Payment**: `POST /portal/payments` returns `checkoutUrl`, redirect user; webhook from Stripe updates payment/invoice states.

### 4.3 File Security
- S3 bucket private; keys partitioned by customer/order.
- Signed URLs limited to 10 minutes and single-use via `X-Amz-Security-Token`.
- Upload completion triggers antivirus scan lambda before file visible to designers.
- Access logged in `file_access_logs` table with `contact_id`, `file_id`, `ip_address`, `accessed_at`.

## 5. Automations & Alerts

### 5.1 Scheduled Jobs
| Schedule | Job | Logic |
| --- | --- | --- |
| Daily 08:00 | Quote expiry checker | `UPDATE quotes SET status='expired' WHERE status='sent' AND valid_until < current_date` and enqueue reminder 3 days prior. |
| Hourly | Stage SLA sweep | fallback to ensure SLA job exists; mark overdue and notify manager. |
| Daily 07:30 | Inventory reorder | Query `inventory_levels` where `quantity_on_hand < reorder_point`; email purchasing. |
| Daily 18:00 | Outstanding deposit report | Identify orders where `deposit_required > deposit_received`. |

### 5.2 Event-Driven Automations
- **Quote Accepted** → triggers workflow from §3.1 plus `NotificationService.sendDepositInvoice()`.
- **Stage Activated** → schedule SLA job, notify assignees via Slack/email.
- **Stage Overdue** → escalate to manager after 24h by enqueuing `stage-overdue-escalation` job.
- **Approval Revision** → reopen design tasks, notify designer + customer with revision summary.
- **Payment Posted** → update invoice balance; if `balance_due <= 0`, mark invoice `paid` and release next production stage.
- **Inventory Consume Movement** → trigger function adjusts quantity and enqueues stock alert if below reorder point.

### 5.3 Example Implementations
```sql
CREATE OR REPLACE FUNCTION enforce_invoice_status_delete() RETURNS trigger AS $$
BEGIN
  IF OLD.status IN ('sent','partial','paid') THEN
    RAISE EXCEPTION 'Cannot delete posted invoice %', OLD.invoice_number;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoices_pre_delete
BEFORE DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION enforce_invoice_status_delete();
```

```typescript
jobQueue.process('quote-expiry-reminder', async ({ quoteId }) => {
  const quote = await quoteRepo.byId(quoteId);
  if (quote.status === 'sent' && isWithinDays(quote.validUntil, 3)) {
    await notificationService.sendQuoteReminder(quote);
  }
});
```

## 6. Dashboards & KPIs

### 6.1 Lead → Order Conversion
```sql
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) FILTER (WHERE status = 'closed_won')::DECIMAL / NULLIF(COUNT(*), 0) * 100 AS conversion_rate
FROM leads
GROUP BY 1
ORDER BY 1;
```

### 6.2 On-time Delivery Percentage
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

### 6.3 Revision Counts by Stage
```sql
SELECT
  ps.stage_code,
  COUNT(ar.id) AS revision_count
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
  SUM(t.actual_hours * lr.hourly_rate) AS labor_cost,
  SUM(oi.line_total) - SUM(sm.quantity * prod.cost_price) - SUM(t.actual_hours * lr.hourly_rate) AS profit,
  (SUM(oi.line_total) - SUM(sm.quantity * prod.cost_price) - SUM(t.actual_hours * lr.hourly_rate)) * 100.0 / NULLIF(SUM(oi.line_total), 0) AS margin_pct
FROM projects pr
JOIN orders o ON o.id = pr.order_id
JOIN order_items oi ON oi.order_id = o.id
LEFT JOIN stock_movements sm ON sm.order_item_id = oi.id AND sm.movement_type = 'consume'
LEFT JOIN products prod ON prod.id = sm.product_id
LEFT JOIN tasks t ON t.project_stage_id IN (SELECT id FROM project_stages WHERE project_id = pr.id)
LEFT JOIN labor_rates lr ON lr.role = t.assignee_role
GROUP BY pr.type;
```

### 6.5 WIP Dashboard
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
- Implement RBAC middleware referencing `users.role` and optional fine-grained policies (`user_permissions` table for overrides).
- Sample policy map:
```json
{
  "sales": ["leads:read","leads:write","quotes:read","quotes:write","orders:read"],
  "designer": ["projects:read","tasks:read","tasks:write","files:write"],
  "production": ["projects:read","tasks:read","tasks:write","jobtickets:scan"],
  "qc": ["projects:read","approvals:read","tasks:write"],
  "finance": ["invoices:read","invoices:write","payments:read","payments:write"],
  "manager": ["*"]
}
```
- Use middleware: `authorize(scope)` verifying JWT scopes aligned with role.
- Apply row-level checks: designers only access tasks assigned to them; finance limited to financial endpoints.

### 7.2 Data Protection
- Encrypt sensitive columns via `pgcrypto` or application-level encryption (`pgp_sym_encrypt` for `tax_id`).
- TLS enforced (HSTS, TLS1.2+). Secrets stored in AWS Secrets Manager.
- Payment integration via PCI-compliant provider; store only tokens/last4.
- Portal database connections use PostgreSQL RLS to restrict by `customer_id`.
- Maintain `audit_logs` table capturing user, action, resource, IP, payload hash.
- Regular vulnerability scans and dependency checks (e.g., `npm audit`, `snyk`).

## 8. Verification Steps

### 8.1 Scenario Tests
1. **Quote Acceptance**
   ```gherkin
   Given a quote in status "sent"
   When POST /api/v1/quotes/{id}/accept
   Then an order, project, deposit invoice, and job ticket exist
   And the first project stage is active with due_at populated
   ```
2. **Approval Revision Loop**
   ```gherkin
   Given a stage with a pending approval
   When POST /api/v1/approvals/{token}/decision {"decision":"revision","comment":"Adjust colors"}
   Then approval.status = 'revision_requested'
   And stage.status = 'revision'
   And a revision record is created
   ```
3. **Payment Allocation**
   ```gherkin
   Given invoice total 1000
   When POST /api/v1/payments amount 500
   And POST /api/v1/payments/{paymentId}/apply {"applications":[{"invoiceId":I,"amount":500}]}
   Then invoice.balance_due = 500 and status = 'partial'
   ```
4. **SLA Overdue**
   ```gherkin
   Given an active stage with due_at in the past
   When SLA job executes
   Then stage.status = 'overdue' and escalation notification queued
   ```
5. **Portal Upload**
   ```gherkin
   Given a customer contact with portal JWT
   When POST /portal/orders/{orderId}/uploads/size-list
   Then a signed URL is returned and file metadata stored with visibility='customer'
   ```

### 8.2 Automated Checks
- Unit tests (Jest) for `QuoteService.acceptQuote`, `StageService.completeStage`, `ApprovalService.recordDecision`.
- Integration tests using Supertest covering auth, orders, approvals, payments flows.
- Database migration tests via `pgTAP` verifying foreign keys, unique constraints, check constraints.
- Portal E2E tests (Cypress) for login, approval, upload, payment.
- Job queue tests verifying SLA timers trigger overdue notifications.

### 8.3 Linting & Formatting
- Backend: `eslint --max-warnings=0` + `prettier --check` on CI.
- SQL: `sqlfluff lint migrations/*.sql`.
- Portal: `pnpm lint` and `pnpm test` as pre-commit hooks via Husky.

### 8.4 Local Smoke Test Commands
- **Frontend bundle check** – `npm run build`
  - Validates that the portal bundle compiles without type or syntax errors before deployment.
- **Backend unit suite** – `npm run test` within the API package (assuming Jest-based setup described above).
  - Ensures workflow automation and service logic regressions are caught.
- **Background worker dry-run** – `npm run queue:dryrun`
  - Executes queue processors with a test harness to confirm SLA timers and alert emitters start correctly.
- **Infrastructure validation** – `terraform validate` in the IaC directory (if adopted per Section 5 automation guidance).
  - Guarantees infrastructure changes associated with alerts and schedulers stay consistent.
