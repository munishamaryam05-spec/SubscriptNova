import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Users,
  Package,
  FileSpreadsheet,
  Repeat,
  FileText,
  CreditCard,
  Percent,
  BarChart3,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { NavigationTab } from '../../types/navigation';
import { MODULE_ROADMAP, NAVIGATION_ITEMS } from '../../data/mockData';

interface ModulePlaceholderProps {
  tab: NavigationTab;
  onReturnToDashboard: () => void;
  onTriggerQuickDemo?: () => void;
}

const TAB_ICONS: Record<NavigationTab, React.ComponentType<{ className?: string }>> = {
  dashboard: Layers,
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

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  tab,
  onReturnToDashboard,
  onTriggerQuickDemo,
}) => {
  const meta = MODULE_ROADMAP[tab] || {
    title: tab.charAt(0).toUpperCase() + tab.slice(1),
    description: 'Manage this section within your SubscriptNova subscription operations.',
    highlights: ['Lifecycle management', 'Real-time billing automation', 'Enterprise audit logging'],
    upcomingActions: ['Configure Module', 'View Sample Records'],
  };

  const navItem = NAVIGATION_ITEMS.find((n) => n.id === tab);
  const Icon = TAB_ICONS[tab] || Layers;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Return link */}
      <button
        onClick={onReturnToDashboard}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#102B4E] hover:text-[#183B6B] mb-6 group cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Return to Dashboard Overview</span>
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#102B4E] text-[#10B981] flex items-center justify-center shrink-0 shadow-xs">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  SubscriptNova Module
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Step 1 Ready
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#102B4E] mt-1 tracking-tight">
                {meta.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {meta.description}
              </p>
            </div>
          </div>
        </div>

        {/* Planned Architecture / Highlights */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Core Specifications in SubscriptNova Architecture
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {meta.highlights.map((highlight, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 font-medium leading-snug">
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Planned Actions for subsequent prompt */}
        <div className="mt-8 p-4 rounded-xl bg-[#102B4E]/5 border border-[#102B4E]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#102B4E]">
              <Clock className="w-4 h-4 text-[#10B981]" />
              <span>Modular Construction Strategy</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Per your instructions, individual modules are left ready for subsequent prompts. You
              can request implementation of the {navItem?.label || tab} module in your next prompt.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReturnToDashboard}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#102B4E] hover:bg-[#183B6B] rounded-lg transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
