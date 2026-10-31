export type LeakageSeverity = 'critical' | 'high' | 'medium';

export type LeakageIssueType =
  | 'overdue_invoice'
  | 'failed_payment'
  | 'missed_cycle'
  | 'missing_invoice'
  | 'draft_blocked';

export type LeakageCategory = 'hard_overdue' | 'potential_loss';

export interface LeakageIssue {
  id: string;
  issueType: LeakageIssueType;
  category: LeakageCategory;
  severity: LeakageSeverity;
  customerId: string;
  customerName: string;
  customerCompany?: string;
  customerEmail: string;
  subscriptionId?: string;
  subscriptionNumber?: string;
  planName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  paymentId?: string;
  transactionId?: string;
  amountAtRisk: number;
  daysOverdue?: number;
  reason: string;
  recommendedAction: string;
  actionType: 'record_payment' | 'retry_payment' | 'generate_invoice' | 'confirm_invoice' | 'view_invoice';
  detectedDate: string;
}

export interface LeakageSummary {
  totalAtRisk: number;
  hardOverdueTotal: number;
  potentialLossTotal: number;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
}
