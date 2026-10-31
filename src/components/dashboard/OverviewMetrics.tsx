import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Users2, ShieldAlert } from 'lucide-react';
import { KEY_METRICS, SECONDARY_METRICS } from '../../data/mockData';

const METRIC_ICONS = {
  mrr: DollarSign,
  arr: TrendingUp,
  active_subs: Users2,
  churn_rate: ShieldAlert,
};

export const OverviewMetrics: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KEY_METRICS.map((metric) => {
          const Icon = METRIC_ICONS[metric.id as keyof typeof METRIC_ICONS] || DollarSign;

          return (
            <div
              key={metric.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 transition-all duration-150"
            >
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {metric.title}
                </span>
                <div className="w-7 h-7 rounded-lg bg-[#E2F4F0] flex items-center justify-center text-[#1D8B94]">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2 mt-1">
                <div className="text-2xl font-bold text-[#04222B] font-mono tabular-nums tracking-tight">
                  {metric.value}
                </div>
                <div
                  className={`inline-flex items-center text-xs font-semibold font-mono ${
                    metric.isPositive ? 'text-[#1D8B94]' : 'text-[#EF4444]'
                  }`}
                >
                  {metric.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>{metric.change}</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{metric.benchmark}</span>
                <span className="text-slate-500 font-medium">{metric.period}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Metrics Strip */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:px-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {SECONDARY_METRICS.map((item, idx) => (
            <div key={item.label} className={idx > 0 ? 'pt-2 md:pt-0 md:pl-4' : ''}>
              <div className="text-[11px] text-slate-500 truncate">{item.label}</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-bold text-[#04222B] font-mono tabular-nums">
                  {item.value}
                </span>
                <span className="text-[11px] font-medium text-slate-500">{item.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
