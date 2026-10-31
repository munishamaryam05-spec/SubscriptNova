import React from 'react';
import {
  TrendingUp,
  PlusCircle,
  RefreshCw,
  AlertOctagon,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { RECENT_ACTIVITY } from '../../data/mockData';
import { ActivityEvent } from '../../types/navigation';

interface RecentActivityProps {
  onViewAll?: () => void;
}

const EVENT_ICONS: Record<
  ActivityEvent['type'],
  { icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  upgrade: { icon: TrendingUp, color: 'text-[#10B981] bg-[#10B981]/10' },
  new_sub: { icon: PlusCircle, color: 'text-[#102B4E] bg-[#102B4E]/10' },
  renewal: { icon: RefreshCw, color: 'text-blue-600 bg-blue-50' },
  churn: { icon: AlertOctagon, color: 'text-[#EF4444] bg-[#EF4444]/10' },
  payment_failed: { icon: AlertOctagon, color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ onViewAll }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#102B4E]/10 flex items-center justify-center text-[#102B4E]">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#102B4E]">Lifecycle Activity Pulse</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Live events</span>
        </div>

        {/* Activity Feed */}
        <div className="mt-4 space-y-3.5">
          {RECENT_ACTIVITY.map((event) => {
            const config = EVENT_ICONS[event.type] || EVENT_ICONS.new_sub;
            const Icon = config.icon;

            return (
              <div key={event.id} className="flex items-start gap-3 text-xs">
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${config.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 truncate">{event.title}</span>
                    {event.amount && (
                      <span className="font-mono font-semibold text-[#102B4E] tabular-nums shrink-0">
                        {event.amount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{event.account}</span>
                    <span>·</span>
                    <span>{event.timeAgo}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={onViewAll}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-[#102B4E] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <span>View All Lifecycle Events</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
