import { Invoice } from '../types/invoice';
import { SubscriptionRecord } from '../types/subscription';
import { PaymentRecord } from '../types/payment';
import { LeakageIssue, LeakageSummary } from '../types/leakage';

const CURRENT_SYSTEM_DATE = '2026-10-31';

function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function detectRevenueLeakage(
  invoices: Invoice[],
  subscriptions: SubscriptionRecord[],
  payments: PaymentRecord[],
  currentDate = CURRENT_SYSTEM_DATE
): { issues: LeakageIssue[]; summary: LeakageSummary } {
  const issues: LeakageIssue[] = [];

  // Track invoice IDs already processed for overdue/payment issues to avoid double-counting
  const handledInvoiceIds = new Set<string>();

  // 1. Detect Overdue Invoices
  invoices.forEach((inv) => {
    if (inv.status === 'cancelled') return;

    // Confirmed with unpaid balance past due date
    if (inv.status === 'confirmed' && inv.balance > 0 && inv.dueDate < currentDate) {
      const daysOverdue = Math.max(1, getDaysDifference(inv.dueDate, currentDate));
      const severity = daysOverdue >= 14 ? 'critical' : 'high';

      issues.push({
        id: `leak-inv-${inv.id}`,
        issueType: 'overdue_invoice',
        category: 'hard_overdue',
        severity,
        customerId: inv.customerId,
        customerName: inv.customerName,
        customerCompany: inv.customerCompany,
        customerEmail: inv.customerEmail,
        subscriptionId: inv.subscriptionId,
        subscriptionNumber: inv.subscriptionNumber,
        planName: inv.planName,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amountAtRisk: inv.balance,
        daysOverdue,
        reason: `Invoice ${inv.invoiceNumber} is ${daysOverdue} days past due (${inv.dueDate}) with an unpaid balance of $${inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`,
        recommendedAction: `Record payment settlement or dispatch automated dunning notice.`,
        actionType: 'record_payment',
        detectedDate: currentDate,
      });

      handledInvoiceIds.add(inv.id);
    }

    // Draft invoices blocked from collection
    if (inv.status === 'draft') {
      issues.push({
        id: `leak-draft-${inv.id}`,
        issueType: 'draft_blocked',
        category: 'potential_loss',
        severity: 'medium',
        customerId: inv.customerId,
        customerName: inv.customerName,
        customerCompany: inv.customerCompany,
        customerEmail: inv.customerEmail,
        subscriptionId: inv.subscriptionId,
        subscriptionNumber: inv.subscriptionNumber,
        planName: inv.planName,
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amountAtRisk: inv.totalAmount,
        reason: `Invoice ${inv.invoiceNumber} remains in draft state for ${inv.customerCompany || inv.customerName}. Revenue is blocked from automated collection.`,
        recommendedAction: `Confirm and issue invoice to send payment link to customer.`,
        actionType: 'confirm_invoice',
        detectedDate: currentDate,
      });
    }
  });

  // 2. Detect Failed Payments
  payments.forEach((p) => {
    if (p.status === 'failed') {
      const inv = invoices.find((i) => i.id === p.invoiceId);
      // Only report if invoice still has a balance or if not already captured
      const alreadyCaptured = handledInvoiceIds.has(p.invoiceId);

      issues.push({
        id: `leak-pay-${p.id}`,
        issueType: 'failed_payment',
        category: 'hard_overdue',
        severity: 'critical',
        customerId: p.customerId,
        customerName: p.customerName,
        customerCompany: p.customerCompany,
        customerEmail: p.customerEmail,
        subscriptionId: p.subscriptionId,
        subscriptionNumber: p.subscriptionNumber,
        planName: p.planName,
        invoiceId: p.invoiceId,
        invoiceNumber: p.invoiceNumber,
        paymentId: p.id,
        transactionId: p.transactionId,
        amountAtRisk: p.amount,
        reason: `Transaction ${p.transactionId} failed: ${p.failureReason || 'Card decline'}. Outstanding charge awaiting recovery.`,
        recommendedAction: `Trigger payment gateway retry or request alternative payment method.`,
        actionType: 'retry_payment',
        detectedDate: p.paymentDate || currentDate,
      });
    }
  });

  // 3. Detect Missed Billing Cycles
  subscriptions.forEach((sub) => {
    if (sub.status !== 'active') return;

    // Check if nextBillingDate has arrived or passed
    if (sub.nextBillingDate && sub.nextBillingDate <= currentDate) {
      // Check if there is an invoice for this subscription issued on or around nextBillingDate
      const hasRecentInvoice = invoices.some((inv) => {
        if (inv.subscriptionId !== sub.id && inv.subscriptionNumber !== sub.subscriptionNumber) {
          return false;
        }
        // If invoice billing period covers the nextBillingDate or issueDate >= nextBillingDate
        return inv.issueDate >= sub.nextBillingDate || inv.billingPeriodEnd >= sub.nextBillingDate;
      });

      if (!hasRecentInvoice) {
        const daysPastCycle = Math.max(0, getDaysDifference(sub.nextBillingDate, currentDate));
        issues.push({
          id: `leak-cycle-${sub.id}`,
          issueType: 'missed_cycle',
          category: 'potential_loss',
          severity: daysPastCycle > 14 ? 'critical' : 'high',
          customerId: sub.customerId,
          customerName: sub.customerName,
          customerCompany: sub.customerCompany,
          customerEmail: sub.customerEmail,
          subscriptionId: sub.id,
          subscriptionNumber: sub.subscriptionNumber,
          planName: sub.planName,
          amountAtRisk: sub.totalAmount,
          daysOverdue: daysPastCycle,
          reason: `Active subscription ${sub.subscriptionNumber} renewal was scheduled for ${sub.nextBillingDate} (${daysPastCycle} days ago), but no renewal invoice has been generated.`,
          recommendedAction: `Generate renewal billing cycle invoice for $${sub.totalAmount.toFixed(2)}.`,
          actionType: 'generate_invoice',
          detectedDate: currentDate,
        });
      }
    }

    // 4. Active Subscriptions with Missing Invoices (Zero invoices ever generated)
    const totalInvoicesForSub = invoices.filter(
      (inv) => inv.subscriptionId === sub.id || inv.subscriptionNumber === sub.subscriptionNumber
    ).length;

    if (totalInvoicesForSub === 0) {
      issues.push({
        id: `leak-noinv-${sub.id}`,
        issueType: 'missing_invoice',
        category: 'potential_loss',
        severity: 'high',
        customerId: sub.customerId,
        customerName: sub.customerName,
        customerCompany: sub.customerCompany,
        customerEmail: sub.customerEmail,
        subscriptionId: sub.id,
        subscriptionNumber: sub.subscriptionNumber,
        planName: sub.planName,
        amountAtRisk: sub.totalAmount,
        reason: `Active subscription ${sub.subscriptionNumber} has zero generated invoices on record. Services are actively being delivered unbilled.`,
        recommendedAction: `Create initial contract invoice for ${sub.planName}.`,
        actionType: 'generate_invoice',
        detectedDate: currentDate,
      });
    }
  });

  // Calculate Summary Metrics
  let hardOverdueTotal = 0;
  let potentialLossTotal = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;

  issues.forEach((iss) => {
    if (iss.category === 'hard_overdue') {
      hardOverdueTotal += iss.amountAtRisk;
    } else {
      potentialLossTotal += iss.amountAtRisk;
    }

    if (iss.severity === 'critical') criticalCount++;
    else if (iss.severity === 'high') highCount++;
    else mediumCount++;
  });

  return {
    issues,
    summary: {
      totalAtRisk: hardOverdueTotal + potentialLossTotal,
      hardOverdueTotal,
      potentialLossTotal,
      totalIssues: issues.length,
      criticalCount,
      highCount,
      mediumCount,
    },
  };
}
