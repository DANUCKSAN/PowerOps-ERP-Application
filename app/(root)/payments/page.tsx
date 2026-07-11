import { desc, eq } from "drizzle-orm";
import {
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Landmark,
  ListChecks,
  ReceiptText,
  ShieldCheck,
  TriangleAlert,
  WalletCards,
} from "lucide-react";

import { db } from "@/db";
import {
  paymentAllocations,
  paymentApprovals,
  paymentEvents,
  payments,
  suppliers,
  users,
} from "@/db/schema";
import { formatCurrency, formatNumber } from "@/lib/inventory-display";

export const dynamic = "force-dynamic";

type PaymentStatus = typeof payments.$inferSelect.status;
type PaymentDirection = typeof payments.$inferSelect.direction;
type PaymentMethod = typeof payments.$inferSelect.method;
type ApprovalStatus = typeof paymentApprovals.$inferSelect.status;

const paymentStatusLabels: Record<PaymentStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  PAID: "Paid",
  PARTIALLY_PAID: "Partially paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  RECONCILED: "Reconciled",
};

const paymentDirectionLabels: Record<PaymentDirection, string> = {
  INCOMING: "Incoming",
  OUTGOING: "Outgoing",
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CASH: "Cash",
  CHEQUE: "Cheque",
  STRIPE: "Stripe",
  MANUAL_ADJUSTMENT: "Manual adjustment",
};

const approvalStatusLabels: Record<ApprovalStatus, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const getStatusClass = (status: PaymentStatus) => {
  if (status === "RECONCILED" || status === "PAID") {
    return "payment-status payment-status-success";
  }

  if (status === "PENDING_APPROVAL" || status === "APPROVED") {
    return "payment-status payment-status-warning";
  }

  if (status === "FAILED" || status === "REFUNDED") {
    return "payment-status payment-status-danger";
  }

  return "payment-status payment-status-neutral";
};

const formatDate = (value: string | Date | null) => {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const PaymentsPage = async () => {
  const [paymentRows, allocationRows, approvalRows, eventRows] =
    await Promise.all([
      db
        .select({
          payment: payments,
          supplierName: suppliers.name,
          createdByName: users.name,
        })
        .from(payments)
        .leftJoin(suppliers, eq(suppliers.id, payments.supplierId))
        .leftJoin(users, eq(users.id, payments.createdByUserId))
        .orderBy(desc(payments.createdAt)),
      db.select().from(paymentAllocations),
      db
        .select({
          approval: paymentApprovals,
          requestedByName: users.name,
        })
        .from(paymentApprovals)
        .leftJoin(users, eq(users.id, paymentApprovals.requestedByUserId))
        .orderBy(desc(paymentApprovals.requestedAt)),
      db
        .select({
          event: paymentEvents,
          performedByName: users.name,
        })
        .from(paymentEvents)
        .leftJoin(users, eq(users.id, paymentEvents.performedByUserId))
        .orderBy(desc(paymentEvents.createdAt))
        .limit(8),
    ]);

  const totalIncoming = paymentRows
    .filter((row) => row.payment.direction === "INCOMING")
    .reduce((total, row) => total + Number(row.payment.amount), 0);
  const totalOutgoing = paymentRows
    .filter((row) => row.payment.direction === "OUTGOING")
    .reduce((total, row) => total + Number(row.payment.amount), 0);
  const pendingApprovals = paymentRows.filter(
    (row) => row.payment.status === "PENDING_APPROVAL"
  );
  const unreconciledPayments = paymentRows.filter(
    (row) =>
      !["RECONCILED", "FAILED", "REFUNDED"].includes(row.payment.status)
  );
  const failedPayments = paymentRows.filter(
    (row) => row.payment.status === "FAILED"
  ).length;

  const allocationsByPayment = allocationRows.reduce(
    (summary, allocation) => {
      const current = summary.get(allocation.paymentId) ?? [];
      summary.set(allocation.paymentId, [...current, allocation]);
      return summary;
    },
    new Map<string, (typeof paymentAllocations.$inferSelect)[]>()
  );

  return (
    <section className="ops-page">
      <div className="ops-page-header">
        <div>
          <p className="ops-eyebrow">Finance control</p>
          <h1 className="ops-page-title">Payments</h1>
          <p className="ops-page-description">
            Internal payment register for receipts, supplier payouts,
            approvals, allocations, and reconciliation follow-up.
          </p>
        </div>

        <div className="payment-header-actions">
          <span>
            <ShieldCheck className="size-4" />
            Approval controlled
          </span>
          <span>
            <Landmark className="size-4" />
            Reconciliation ready
          </span>
        </div>
      </div>

      <div className="ops-metric-grid">
        <div className="ops-metric-card">
          <span>Incoming receipts</span>
          <strong>{formatCurrency(totalIncoming)}</strong>
          <p>Customer payments recorded in the register</p>
        </div>
        <div className="ops-metric-card">
          <span>Outgoing payments</span>
          <strong>{formatCurrency(totalOutgoing)}</strong>
          <p>Supplier and operational payments tracked</p>
        </div>
        <div className="ops-metric-card">
          <span>Pending approval</span>
          <strong>{formatNumber(pendingApprovals.length)}</strong>
          <p>Outgoing payments waiting for release</p>
        </div>
        <div className="ops-metric-card">
          <span>Unreconciled</span>
          <strong>{formatNumber(unreconciledPayments.length)}</strong>
          <p>{formatNumber(failedPayments)} failed payment needs attention</p>
        </div>
      </div>

      <div className="payment-workbench">
        <div className="ops-table-card">
          <div className="ops-table-header">
            <div>
              <h2>Approval queue</h2>
              <p>Payments that need finance review before release</p>
            </div>
            <ListChecks className="size-5 text-muted-foreground" />
          </div>

          <div className="payment-approval-list">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((row) => {
                const approval = approvalRows.find(
                  (item) => item.approval.paymentId === row.payment.id
                );

                return (
                  <div className="payment-approval-item" key={row.payment.id}>
                    <div className="payment-approval-icon">
                      <Clock3 className="size-5" />
                    </div>
                    <div>
                      <strong>{row.payment.counterpartyName}</strong>
                      <span>{row.payment.paymentNumber}</span>
                      <p>{row.payment.description}</p>
                    </div>
                    <div className="payment-approval-meta">
                      <strong>{formatCurrency(row.payment.amount)}</strong>
                      <span>
                        {approval
                          ? approvalStatusLabels[approval.approval.status]
                          : "No approval row"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="payment-empty-row">
                <BadgeCheck className="size-5" />
                No payments are waiting for approval.
              </div>
            )}
          </div>
        </div>

        <div className="ops-table-card">
          <div className="ops-table-header">
            <div>
              <h2>Recent payment events</h2>
              <p>Immutable activity trail across payment records</p>
            </div>
            <FileCheck2 className="size-5 text-muted-foreground" />
          </div>

          <div className="payment-event-list">
            {eventRows.map((row) => (
              <div className="payment-event-item" key={row.event.id}>
                <div className="payment-event-dot" />
                <div>
                  <strong>{row.event.title}</strong>
                  <span>
                    {formatDate(row.event.createdAt)} by{" "}
                    {row.performedByName ?? "System"}
                  </span>
                  <p>{row.event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="payment-section-heading">
        <div>
          <h2>Payment snapshots</h2>
          <p>
            Card view for quick finance review before scanning the full
            register.
          </p>
        </div>
        <span>{formatNumber(paymentRows.length)} payments</span>
      </div>

      <div className="payment-card-grid">
        {paymentRows.map((row) => {
          const allocations = allocationsByPayment.get(row.payment.id) ?? [];
          const Icon =
            row.payment.direction === "INCOMING"
              ? CircleDollarSign
              : WalletCards;

          return (
            <article className="payment-card" key={row.payment.id}>
              <div className="payment-card-top">
                <div className="payment-card-icon">
                  <Icon className="size-5" />
                </div>
                <span className={getStatusClass(row.payment.status)}>
                  {paymentStatusLabels[row.payment.status]}
                </span>
              </div>

              <div className="payment-card-main">
                <span>{row.payment.paymentNumber}</span>
                <h2>{row.payment.counterpartyName}</h2>
                <p>{row.payment.description}</p>
              </div>

              <div className="payment-card-amount">
                <strong>{formatCurrency(row.payment.amount)}</strong>
                <span>{paymentDirectionLabels[row.payment.direction]}</span>
              </div>

              <div className="payment-card-details">
                <div>
                  <span>Method</span>
                  <strong>{paymentMethodLabels[row.payment.method]}</strong>
                </div>
                <div>
                  <span>Payment date</span>
                  <strong>{formatDate(row.payment.paymentDate)}</strong>
                </div>
                <div>
                  <span>Settlement</span>
                  <strong>{formatDate(row.payment.settlementDate)}</strong>
                </div>
              </div>

              <div className="payment-allocation-strip">
                <ReceiptText className="size-4" />
                <span>
                  {allocations.length > 0
                    ? `${allocations.length} allocation${
                        allocations.length === 1 ? "" : "s"
                      }`
                    : "No allocation"}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div>
            <h2>Payment register</h2>
            <p>Scan receipts, supplier payments, allocations, and status</p>
          </div>
          <Banknote className="size-5 text-muted-foreground" />
        </div>

        <div className="ops-table-scroll">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Payment</th>
                <th>Direction</th>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Allocated to</th>
                <th>Reconciliation</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentRows.map((row) => {
                const allocations =
                  allocationsByPayment.get(row.payment.id) ?? [];

                return (
                  <tr key={row.payment.id}>
                    <td>
                      <div className="ops-primary-cell">
                        <strong>{row.payment.paymentNumber}</strong>
                        <span>{formatDate(row.payment.paymentDate)}</span>
                      </div>
                    </td>
                    <td>{paymentDirectionLabels[row.payment.direction]}</td>
                    <td>
                      <div className="ops-primary-cell">
                        <strong>{row.payment.counterpartyName}</strong>
                        <span>
                          {row.supplierName ??
                            row.payment.counterpartyType.toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td>{formatCurrency(row.payment.amount)}</td>
                    <td>{paymentMethodLabels[row.payment.method]}</td>
                    <td>
                      <div className="payment-allocation-cell">
                        {allocations.length > 0 ? (
                          allocations.map((allocation) => (
                            <span key={allocation.id}>
                              {allocation.targetReference} -{" "}
                              {formatCurrency(allocation.amount)}
                            </span>
                          ))
                        ) : (
                          <span>No allocation</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {row.payment.reconciledAt ? (
                        <span className="payment-reconcile-ok">
                          <BadgeCheck className="size-4" />
                          {formatDate(row.payment.reconciledAt)}
                        </span>
                      ) : (
                        <span className="payment-reconcile-pending">
                          <TriangleAlert className="size-4" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={getStatusClass(row.payment.status)}>
                        {paymentStatusLabels[row.payment.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default PaymentsPage;
