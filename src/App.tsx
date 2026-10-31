import React, { useState } from 'react';
import {
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Plus,
  FileText,
  Repeat,
  CheckCircle2,
  Download,
  Filter,
} from 'lucide-react';
import { NavigationTab, InvoiceItem } from './types/navigation';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewMetrics } from './components/dashboard/OverviewMetrics';
import { RevenueChart } from './components/dashboard/RevenueChart';
import { PlanDistribution } from './components/dashboard/PlanDistribution';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { RecentInvoicesTable } from './components/dashboard/RecentInvoicesTable';
import { ModulePlaceholder } from './components/placeholder/ModulePlaceholder';
import { CustomersView } from './components/customers/CustomersView';
import { ProductsView } from './components/products/ProductsView';
import { PlansView } from './components/plans/PlansView';
import { QuotationsView } from './components/quotations/QuotationsView';
import { SubscriptionsView } from './components/subscriptions/SubscriptionsView';
import { InvoicesView } from './components/invoices/InvoicesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { DiscountsView } from './components/discounts/DiscountsView';
import { LeakageView } from './components/leakage/LeakageView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { InvoiceDetailModal } from './components/modals/InvoiceDetailModal';
import { CreateSubscriptionModal } from './components/modals/CreateSubscriptionModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isCreateSubOpen, setIsCreateSubOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubscriptionCreated = (sub: {
    customer: string;
    plan: string;
    amount: number;
    cycle: string;
  }) => {
    showToast(`New ${sub.plan} subscription created for ${sub.customer} ($${sub.amount}/${sub.cycle.toLowerCase()})`);
  };

  return (
    <div className="min-h-screen bg-[#F6FAF9] flex text-[#0A3D4A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#04222B] text-white px-4 py-3 rounded-xl shadow-lg border border-[#0A3D4A] flex items-center gap-2.5 text-xs animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#4FB8B4] shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCreateSubscription={() => setIsCreateSubOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' ? (
            <>
              {/* Product Header & Tagline Banner */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1D8B94]">
                    <span className="w-2 h-2 rounded-full bg-[#1D8B94]" />
                    <span>Live Revenue Orchestration</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-[#04222B] mt-1 tracking-tight">
                    SubscriptNova Revenue Console
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                    Simplify Subscriptions. Automate Billing. Understand Revenue.
                  </p>
                </div>

                {/* Quick Dashboard Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsCreateSubOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1D8B94] hover:bg-[#10606F] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#E2F4F0]" />
                    <span>Create Subscription</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0A3D4A] bg-[#E2F4F0]/60 hover:bg-[#E2F4F0] border border-[#98D8D0]/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#1D8B94]" />
                    <span>Invoices</span>
                  </button>
                  <button
                    onClick={() => showToast('Exporting current MRR ledger summary to CSV...')}
                    className="p-2 text-slate-500 hover:text-[#04222B] hover:bg-[#E2F4F0]/50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    title="Export financial snapshot"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Primary KPIs + Secondary Strip */}
              <OverviewMetrics />

              {/* Grid 1: Revenue Trajectory + Plan Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RevenueChart />
                </div>
                <div>
                  <PlanDistribution />
                </div>
              </div>

              {/* Grid 2: Recent Invoices Table + Lifecycle Activity Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RecentInvoicesTable
                    onSelectInvoice={setSelectedInvoice}
                    onNavigateToInvoices={() => setActiveTab('invoices')}
                  />
                </div>
                <div>
                  <RecentActivity onViewAll={() => setActiveTab('subscriptions')} />
                </div>
              </div>
            </>
          ) : activeTab === 'customers' ? (
            <CustomersView onShowToast={showToast} />
          ) : activeTab === 'products' ? (
            <ProductsView onShowToast={showToast} />
          ) : activeTab === 'plans' ? (
            <PlansView onShowToast={showToast} />
          ) : activeTab === 'quotations' ? (
            <QuotationsView onShowToast={showToast} />
          ) : activeTab === 'subscriptions' ? (
            <SubscriptionsView onShowToast={showToast} />
          ) : activeTab === 'invoices' ? (
            <InvoicesView onShowToast={showToast} />
          ) : activeTab === 'payments' ? (
            <PaymentsView
              onShowToast={showToast}
              onNavigateToInvoice={(invId) => {
                setActiveTab('invoices');
                showToast(`Navigated to invoice ${invId}`);
              }}
            />
          ) : activeTab === 'discounts' ? (
            <DiscountsView onShowToast={showToast} />
          ) : activeTab === 'leakage' ? (
            <LeakageView
              onShowToast={showToast}
              onNavigateToTab={(t) => setActiveTab(t as NavigationTab)}
            />
          ) : activeTab === 'analytics' ? (
            <AnalyticsView onShowToast={showToast} />
          ) : (
            <ModulePlaceholder
              tab={activeTab}
              onReturnToDashboard={() => setActiveTab('dashboard')}
              onTriggerQuickDemo={() => setIsCreateSubOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      <CreateSubscriptionModal
        isOpen={isCreateSubOpen}
        onClose={() => setIsCreateSubOpen(false)}
        onSuccess={handleSubscriptionCreated}
      />
    </div>
  );
}
