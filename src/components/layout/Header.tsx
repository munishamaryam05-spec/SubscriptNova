import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { NavigationTab } from '../../types/navigation';
import { NAVIGATION_ITEMS } from '../../data/mockData';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenMobileMenu: () => void;
  onOpenCreateSubscription: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenCreateSubscription,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentTabConfig = NAVIGATION_ITEMS.find((item) => item.id === activeTab);

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left Zone: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">SubscriptNova</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <h1 className="text-sm sm:text-base font-bold text-[#102B4E] tracking-tight truncate">
            {currentTabConfig ? currentTabConfig.label : 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Center Zone: Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subscriptions, customers, invoices... (⌘K)"
            className="w-full pl-9 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102B4E]/10 focus:border-[#102B4E] transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 border border-slate-200 rounded">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Zone: Actions & Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Quick Action Button */}
        <button
          onClick={onOpenCreateSubscription}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] active:bg-[#0A1C33] rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#10B981]" />
          <span>New Subscription</span>
        </button>

        {/* Notifications Flyout */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-[#102B4E]">Billing Activity Alerts</span>
                <span className="text-[10px] text-slate-400">3 unread</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Annual Payment Collected</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    $3,820.00 from Meridian Logistics settled via ACH.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">45 min ago</span>
                </div>

                <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200/50">
                  <div className="flex items-center gap-1.5 text-amber-900 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Dunning Retry #1 Scheduled</span>
                  </div>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    $349 card decline for Solis Data Systems. Auto-retry in 48h.
                  </p>
                  <span className="text-[10px] text-amber-500 mt-1 block">3 hours ago</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 transition-colors">
                  <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#102B4E]" />
                    <span>Trial Expiring Soon</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    OmniFlow Studios trial converts in 48 hours.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">5 hours ago</span>
                </div>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full mt-2 pt-2 border-t border-slate-100 text-center text-[11px] text-[#102B4E] font-medium hover:underline"
              >
                Close notifications
              </button>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#102B4E] text-white flex items-center justify-center text-xs font-bold">
              ER
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">Elena Rostova</div>
              <div className="text-[10px] text-slate-400">RevOps Manager</div>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-[#102B4E]">Elena Rostova</p>
                <p className="text-[11px] text-slate-500 truncate">elena.rostova@acme.tech</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#10B981] font-mono">
                  <span>●</span> Role: Admin / Billing Superuser
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  alert('SubscriptNova workspace settings are managed in your company profile.');
                }}
                className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md"
              >
                Workspace Settings
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  alert('API Keys and Webhooks module will be configurable in subsequent steps.');
                }}
                className="w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md"
              >
                API Keys & Webhooks
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full text-left px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-50 rounded-md"
              >
                Dismiss Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
