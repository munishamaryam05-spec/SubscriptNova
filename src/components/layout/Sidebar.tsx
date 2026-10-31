import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  FileSpreadsheet,
  Repeat,
  FileText,
  CreditCard,
  Percent,
  BarChart3,
  Building2,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  X,
} from 'lucide-react';
import { NavigationTab, NavItemConfig } from '../../types/navigation';
import { NAVIGATION_ITEMS } from '../../data/mockData';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const TAB_ICONS: Record<NavigationTab, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  customers: Users,
  products: Package,
  plans: Layers,
  quotations: FileSpreadsheet,
  subscriptions: Repeat,
  invoices: FileText,
  payments: CreditCard,
  discounts: Percent,
  leakage: ShieldAlert,
  analytics: BarChart3,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const renderNavGroup = (title: string, items: NavItemConfig[]) => (
    <div className="mb-6">
      <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#98D8D0]/60">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = TAB_ICONS[item.id] || LayoutDashboard;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 text-left cursor-pointer ${
                isActive
                  ? 'bg-[#1D8B94] text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0A3D4A]/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#E2F4F0]' : 'text-[#98D8D0]/70 group-hover:text-[#4FB8B4]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-[#04222B]/50 text-[#E2F4F0] border border-[#4FB8B4]/30'
                      : 'bg-[#0A3D4A] text-[#98D8D0] border border-[#10606F]/40 group-hover:border-[#4FB8B4]/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const coreItems = NAVIGATION_ITEMS.filter((i) => i.category === 'core');
  const catalogItems = NAVIGATION_ITEMS.filter((i) => i.category === 'catalog');
  const billingItems = NAVIGATION_ITEMS.filter((i) => i.category === 'billing');
  const insightsItems = NAVIGATION_ITEMS.filter((i) => i.category === 'insights');

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#04222B] border-r border-[#0A3D4A] text-slate-300 w-64 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#0A3D4A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A3D4A] border border-[#10606F] flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-4 h-4 text-[#4FB8B4]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>SubscriptNova</span>
              <span className="text-[10px] font-mono font-medium text-[#98D8D0] bg-[#10606F]/60 px-1 py-0.2 rounded border border-[#10606F]">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-[#98D8D0]/60 truncate">Subscription & Revenue Engine</p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Workspace Switcher */}
      <div className="px-3 pt-3 pb-2">
        <div className="p-2 rounded-lg bg-[#0A3D4A]/70 border border-[#10606F]/50 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-[#10606F] flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-[#4FB8B4]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">Acme Technologies</div>
              <div className="text-[10px] text-[#98D8D0]/70 flex items-center gap-1 font-mono">
                <span>Production</span>
                <span>·</span>
                <span className="text-[#4FB8B4] font-medium">Live</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {renderNavGroup('Core Overview', coreItems)}
        {renderNavGroup('Catalog & Deals', catalogItems)}
        {renderNavGroup('Billing & Lifecycle', billingItems)}
        {renderNavGroup('Revenue Intelligence', insightsItems)}
      </div>

      {/* Brand Footer Info */}
      <div className="p-3 border-t border-[#0A3D4A] bg-[#04222B]/95">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-[#4FB8B4] shrink-0" />
          <div className="truncate">
            <span className="font-medium text-slate-200">SubscriptNova MVP</span>
            <div className="text-[10px] text-[#98D8D0]/60">Automate Billing · Understand Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen shrink-0 sticky top-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-[#04222B]/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
