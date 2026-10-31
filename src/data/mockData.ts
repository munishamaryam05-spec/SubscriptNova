import {
  ActivityEvent,
  InvoiceItem,
  MetricCardData,
  NavItemConfig,
  PlanTier,
} from '../types/navigation';

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    category: 'core',
    description: 'High-level subscription metrics, revenue performance, and billing pulse.',
  },
  {
    id: 'customers',
    label: 'Customers',
    category: 'core',
    badge: '1,428',
    description: 'Manage accounts, subscription histories, credit balances, and contacts.',
  },
  {
    id: 'products',
    label: 'Products',
    category: 'catalog',
    badge: '8',
    description: 'Service items, digital goods, add-on components, and meter units.',
  },
  {
    id: 'plans',
    label: 'Plans',
    category: 'catalog',
    description: 'Recurring billing tiers, feature gates, usage limits, and trials.',
  },
  {
    id: 'quotations',
    label: 'Quotations',
    category: 'catalog',
    badge: '4 pending',
    description: 'Enterprise quote proposals, custom billing terms, and approvals.',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    category: 'billing',
    badge: 'Active',
    description: 'Lifecycle orchestration, renewals, upgrades, pauses, and cancellations.',
  },
  {
    id: 'invoices',
    label: 'Invoices',
    category: 'billing',
    description: 'Automated invoice generation, tax calculations, and status tracking.',
  },
  {
    id: 'payments',
    label: 'Payments',
    category: 'billing',
    description: 'Transaction reconciliation, dunning cycles, and retry schedules.',
  },
  {
    id: 'discounts',
    label: 'Discounts',
    category: 'billing',
    description: 'Coupon codes, volume discount rules, promotional grants, and credits.',
  },
  {
    id: 'leakage',
    label: 'Revenue Leakage',
    category: 'insights',
    badge: 'Alerts',
    description: 'Detect billing leaks, unbilled subscriptions, failed charges, and overdue invoices.',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    category: 'insights',
    description: 'Cohort retention, Net Revenue Retention (NRR), LTV, and churn modeling.',
  },
];

export const KEY_METRICS: MetricCardData[] = [
  {
    id: 'mrr',
    title: 'Monthly Recurring Revenue',
    value: '$84,290',
    change: '+12.4%',
    isPositive: true,
    benchmark: '+$9,280 vs last month',
    period: 'Current cycle',
  },
  {
    id: 'arr',
    title: 'Annual Run Rate (ARR)',
    value: '$1,011,480',
    change: '+18.2%',
    isPositive: true,
    benchmark: '+$155,000 YoY',
    period: 'Projected annualized',
  },
  {
    id: 'active_subs',
    title: 'Active Subscriptions',
    value: '1,428',
    change: '+86 net new',
    isPositive: true,
    benchmark: '98.2% healthy status',
    period: 'Across 4 active plans',
  },
  {
    id: 'churn_rate',
    title: 'Net Revenue Churn',
    value: '0.84%',
    change: '-0.32%',
    isPositive: true,
    benchmark: 'Below target 1.50%',
    period: 'Trailing 30 days',
  },
];

export const SECONDARY_METRICS = [
  { label: 'Average Revenue Per User (ARPU)', value: '$59.02', change: '+4.8%' },
  { label: 'Lifetime Value (LTV)', value: '$2,140', change: '+9.1%' },
  { label: 'Trial-to-Paid Conversion', value: '28.4%', change: '+3.2%' },
  { label: 'Overdue Receivables', value: '$4,120', change: '4 invoices pending' },
];

export const REVENUE_SERIES_30D = [
  { label: 'Oct 01', revenue: 75200, newMrr: 2100 },
  { label: 'Oct 05', revenue: 76400, newMrr: 1200 },
  { label: 'Oct 10', revenue: 78100, newMrr: 1700 },
  { label: 'Oct 15', revenue: 79800, newMrr: 1700 },
  { label: 'Oct 20', revenue: 81200, newMrr: 1400 },
  { label: 'Oct 25', revenue: 82900, newMrr: 1700 },
  { label: 'Oct 30', revenue: 84290, newMrr: 1390 },
];

export const REVENUE_SERIES_90D = [
  { label: 'Aug 01', revenue: 64100, newMrr: 4200 },
  { label: 'Aug 15', revenue: 67300, newMrr: 3200 },
  { label: 'Sep 01', revenue: 70800, newMrr: 3500 },
  { label: 'Sep 15', revenue: 74200, newMrr: 3400 },
  { label: 'Oct 01', revenue: 78400, newMrr: 4200 },
  { label: 'Oct 15', revenue: 81200, newMrr: 2800 },
  { label: 'Oct 30', revenue: 84290, newMrr: 3090 },
];

export const REVENUE_SERIES_12M = [
  { label: 'Nov 25', revenue: 42000, newMrr: 3800 },
  { label: 'Dec 25', revenue: 46200, newMrr: 4200 },
  { label: 'Jan 26', revenue: 50400, newMrr: 4200 },
  { label: 'Feb 26', revenue: 54100, newMrr: 3700 },
  { label: 'Mar 26', revenue: 58900, newMrr: 4800 },
  { label: 'Apr 26', revenue: 63200, newMrr: 4300 },
  { label: 'May 26', revenue: 67800, newMrr: 4600 },
  { label: 'Jun 26', revenue: 71500, newMrr: 3700 },
  { label: 'Jul 26', revenue: 74800, newMrr: 3300 },
  { label: 'Aug 26', revenue: 78200, newMrr: 3400 },
  { label: 'Sep 26', revenue: 81400, newMrr: 3200 },
  { label: 'Oct 26', revenue: 84290, newMrr: 2890 },
];

export const PLAN_TIERS: PlanTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    pricePerMonth: 49,
    subscribers: 720,
    mrr: 35280,
    color: '#4FB8B4', // Aqua accent
    percentage: 42,
  },
  {
    id: 'growth',
    name: 'Growth',
    pricePerMonth: 149,
    subscribers: 460,
    mrr: 29900,
    color: '#1D8B94', // Primary teal
    percentage: 35,
  },
  {
    id: 'scale',
    name: 'Scale',
    pricePerMonth: 349,
    subscribers: 180,
    mrr: 15705,
    color: '#0A3D4A', // Dark teal
    percentage: 18,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    pricePerMonth: 850,
    subscribers: 68,
    mrr: 3405,
    color: '#98D8D0', // Soft mint
    percentage: 5,
  },
];

export const RECENT_ACTIVITY: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'upgrade',
    title: 'Plan Upgraded to Scale',
    description: 'Apex Cloud Solutions upgraded from Growth ($149/mo) to Scale ($349/mo).',
    amount: '+$200/mo',
    timeAgo: '12 min ago',
    account: 'Apex Cloud Solutions',
  },
  {
    id: 'act-2',
    type: 'new_sub',
    title: 'New Annual Subscription',
    description: 'Meridian Logistics initiated Scale Tier billed annually.',
    amount: '+$3,820/yr',
    timeAgo: '45 min ago',
    account: 'Meridian Logistics',
  },
  {
    id: 'act-3',
    type: 'renewal',
    title: 'Automatic Cycle Renewal',
    description: 'Vanguard Cybertech renewed Starter Tier for 12 seats.',
    amount: '+$588/mo',
    timeAgo: '2 hours ago',
    account: 'Vanguard Cybertech',
  },
  {
    id: 'act-4',
    type: 'payment_failed',
    title: 'Smart Dunning Recovery Triggered',
    description: 'Retry #1 scheduled in 48 hours for failed corporate card.',
    amount: '$349.00 pending',
    timeAgo: '3 hours ago',
    account: 'Solis Data Systems',
  },
  {
    id: 'act-5',
    type: 'new_sub',
    title: 'Self-Serve Checkout Completed',
    description: 'OmniFlow Studios activated Growth Tier via direct checkout.',
    amount: '+$149/mo',
    timeAgo: '5 hours ago',
    account: 'OmniFlow Studios',
  },
];

export const SAMPLE_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1082',
    invoiceNumber: 'INV-2026-1082',
    customerName: 'Kallisto AI Corp',
    customerEmail: 'billing@kallisto.ai',
    planName: 'Scale Plan',
    amount: 349.0,
    currency: 'USD',
    billingCycle: 'Monthly',
    status: 'paid',
    issueDate: 'Oct 28, 2026',
    dueDate: 'Nov 04, 2026',
  },
  {
    id: 'inv-1081',
    invoiceNumber: 'INV-2026-1081',
    customerName: 'Meridian Logistics Ltd',
    customerEmail: 'finance@meridianlog.co',
    planName: 'Scale Enterprise',
    amount: 3820.0,
    currency: 'USD',
    billingCycle: 'Annual',
    status: 'paid',
    issueDate: 'Oct 28, 2026',
    dueDate: 'Nov 11, 2026',
  },
  {
    id: 'inv-1080',
    invoiceNumber: 'INV-2026-1080',
    customerName: 'Solis Data Systems',
    customerEmail: 'accounts@solisdata.io',
    planName: 'Growth Plan',
    amount: 149.0,
    currency: 'USD',
    billingCycle: 'Monthly',
    status: 'past_due',
    issueDate: 'Oct 22, 2026',
    dueDate: 'Oct 29, 2026',
  },
  {
    id: 'inv-1079',
    invoiceNumber: 'INV-2026-1079',
    customerName: 'Aetherian BioTech',
    customerEmail: 'ap@aetherianbio.com',
    planName: 'Enterprise Custom',
    amount: 1250.0,
    currency: 'USD',
    billingCycle: 'Monthly',
    status: 'processing',
    issueDate: 'Oct 27, 2026',
    dueDate: 'Nov 03, 2026',
  },
  {
    id: 'inv-1078',
    invoiceNumber: 'INV-2026-1078',
    customerName: 'Helios Media Network',
    customerEmail: 'admin@heliosmedia.tv',
    planName: 'Starter Tier',
    amount: 49.0,
    currency: 'USD',
    billingCycle: 'Monthly',
    status: 'paid',
    issueDate: 'Oct 26, 2026',
    dueDate: 'Nov 02, 2026',
  },
  {
    id: 'inv-1077',
    invoiceNumber: 'INV-2026-1077',
    customerName: 'Quantum Dynamics Inc',
    customerEmail: 'invoicing@quantumdyn.tech',
    planName: 'Growth Plan',
    amount: 149.0,
    currency: 'USD',
    billingCycle: 'Monthly',
    status: 'paid',
    issueDate: 'Oct 25, 2026',
    dueDate: 'Nov 01, 2026',
  },
  {
    id: 'inv-1076',
    invoiceNumber: 'INV-2026-1076',
    customerName: 'Nordic Cloud Consulting',
    customerEmail: 'payables@nordiccloud.se',
    planName: 'Scale Plan',
    amount: 349.0,
    currency: 'USD',
    billingCycle: 'Monthly',
    status: 'draft',
    issueDate: 'Oct 29, 2026',
    dueDate: 'Nov 12, 2026',
  },
];

export const MODULE_ROADMAP: Record<
  string,
  {
    title: string;
    description: string;
    highlights: string[];
    upcomingActions: string[];
  }
> = {
  customers: {
    title: 'Customer Directory & Accounts',
    description:
      'Unified customer master view with full billing hierarchy, tax residency, default payment instruments, and subscription lineage.',
    highlights: [
      'Account hierarchy with parent/subsidiary billing consolidation',
      'Unified timeline of charges, credits, and communication history',
      'Credit balance management and multi-currency billing profiles',
    ],
    upcomingActions: ['Add Customer', 'Import CSV', 'Export Accounts'],
  },
  products: {
    title: 'Product Catalog & Service Units',
    description:
      'Manage recurring software products, metered usage components, one-off onboarding fees, and add-on services.',
    highlights: [
      'Configurable product families with tiered pricing models',
      'Usage-based metering units (API calls, active seats, gigabytes)',
      'Product tax classifications and regional catalog assignments',
    ],
    upcomingActions: ['New Product', 'Add Meter Component', 'Catalog Sync'],
  },
  plans: {
    title: 'Subscription Plans & Tier Definitions',
    description:
      'Design modular pricing tiers with billing frequency cadences, free trial rules, grace periods, and feature allowances.',
    highlights: [
      'Monthly, quarterly, and annual billing cadence configurations',
      'Automated trial rules with friction-free upgrade paths',
      'Feature-gate entitlement linking and grandfathered plan versions',
    ],
    upcomingActions: ['Create Plan', 'Clone Plan', 'Archive Legacy Tier'],
  },
  quotations: {
    title: 'B2B Quotations & Custom Deals',
    description:
      'Generate customized sales quotes with negotiated line items, contract terms, ramp-up schedules, and electronic sign-off.',
    highlights: [
      'Multi-year ramp pricing with scheduled tier escalations',
      'Internal review workflow and discount threshold approvals',
      '1-click conversion from accepted quotation to active subscription',
    ],
    upcomingActions: ['Draft Quote', 'Configure Ramp Schedule', 'Send for Review'],
  },
  subscriptions: {
    title: 'Subscription Lifecycle Engine',
    description:
      'End-to-end subscription lifecycle orchestrator handling co-termed renewals, mid-cycle prorations, seat expansions, and pauses.',
    highlights: [
      'Automated proration calculation for mid-cycle plan changes',
      'Co-terming multi-subscription accounts to a single billing date',
      'Churn mitigation flows with temporary pause and downgrade offers',
    ],
    upcomingActions: ['New Subscription', 'Upgrade/Downgrade Flow', 'Pause Cycle'],
  },
  invoices: {
    title: 'Invoicing & Tax Automation',
    description:
      'Generate compliant PDF invoices with automated tax determination, sequential numbering, and consolidated billing items.',
    highlights: [
      'Compliant automated invoicing engine with regional tax support',
      'Smart consolidation of base plan + overage meters',
      'Custom branding, notes, payment terms, and downloadable PDF receipts',
    ],
    upcomingActions: ['Create Manual Invoice', 'Run Billing Batch', 'Export Ledgers'],
  },
  payments: {
    title: 'Payment Reconciliation & Dunning',
    description:
      'Track incoming credit card, ACH, and wire transfers with automated smart dunning to recover failed transactions.',
    highlights: [
      'Multi-gateway payment attempt tracking and unified ledger',
      'Smart retry rules to maximize recovery of card declines',
      'Automated email notification sequences for expired payment methods',
    ],
    upcomingActions: ['Retry Failed Charge', 'Record Offline Payment', 'Dunning Rules'],
  },
  discounts: {
    title: 'Discounts, Coupons & Credits',
    description:
      'Create promotional coupon codes, percentage/fixed discounts, duration limits, and customer-specific credits.',
    highlights: [
      'Time-limited and recurring percentage/fixed discount rules',
      'Customer-specific credit balances applied automatically to renewals',
      'Coupon usage limits and campaign performance metrics',
    ],
    upcomingActions: ['Create Coupon', 'Issue Credit Note', 'Campaign Rules'],
  },
  analytics: {
    title: 'Revenue Analytics & Churn Insights',
    description:
      'Deep revenue intelligence tracking Net Revenue Retention (NRR), customer cohort retention curves, and churn forecasting.',
    highlights: [
      'Cohort analysis showing customer retention over 12-month periods',
      'Net Revenue Retention (NRR) and Quick Ratio decomposition',
      'LTV to CAC ratio calculation and subscription lifetime curves',
    ],
    upcomingActions: ['Export Financial Report', 'Custom Cohort Filter', 'Forecast ARR'],
  },
};
