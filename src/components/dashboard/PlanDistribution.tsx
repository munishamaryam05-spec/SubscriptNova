import React from 'react';
import { Layers } from 'lucide-react';
import { PLAN_TIERS } from '../../data/mockData';

export const PlanDistribution: React.FC = () => {
  const totalSubscribers = PLAN_TIERS.reduce((acc, p) => acc + p.subscribers, 0);
  const totalMrr = PLAN_TIERS.reduce((acc, p) => acc + p.mrr, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#0A3D4A]/10 flex items-center justify-center text-[#0A3D4A]">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#04222B]">Plan Tier Distribution</h3>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-500 tabular-nums">
            {totalSubscribers} active subs
          </span>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="mt-4">
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {PLAN_TIERS.map((tier) => (
              <div
                key={tier.id}
                style={{
                  width: `${tier.percentage}%`,
                  backgroundColor: tier.color,
                }}
                className="h-full transition-all duration-300"
                title={`${tier.name}: ${tier.subscribers} subs (${tier.percentage}%)`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 font-mono">
            <span>Starter: 42%</span>
            <span>Growth: 35%</span>
            <span>Scale: 18%</span>
            <span>Enterprise: 5%</span>
          </div>
        </div>

        {/* Breakdown List */}
        <div className="mt-5 space-y-3">
          {PLAN_TIERS.map((tier) => (
            <div
              key={tier.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: tier.color }}
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">{tier.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    ${tier.pricePerMonth}/mo · {tier.subscribers} accounts
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold font-mono text-[#04222B] tabular-nums">
                  ${tier.mrr.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {tier.percentage}% of total
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Combined MRR from Tiers</span>
        <span className="font-bold text-[#04222B] font-mono tabular-nums">
          ${totalMrr.toLocaleString()} / mo
        </span>
      </div>
    </div>
  );
};
