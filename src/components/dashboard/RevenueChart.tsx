import React, { useState } from 'react';
import {
  REVENUE_SERIES_30D,
  REVENUE_SERIES_90D,
  REVENUE_SERIES_12M,
} from '../../data/mockData';

type TimeRange = '30d' | '90d' | '12m';
type ViewMode = 'mrr' | 'newMrr';

export const RevenueChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [viewMode, setViewMode] = useState<ViewMode>('mrr');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const seriesData =
    timeRange === '30d'
      ? REVENUE_SERIES_30D
      : timeRange === '90d'
      ? REVENUE_SERIES_90D
      : REVENUE_SERIES_12M;

  const values = seriesData.map((d) => (viewMode === 'mrr' ? d.revenue : d.newMrr));
  const minVal = Math.min(...values) * 0.95;
  const maxVal = Math.max(...values) * 1.05;
  const valRange = maxVal - minVal || 1;

  // Chart coordinates
  const svgWidth = 650;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = seriesData.map((d, index) => {
    const val = viewMode === 'mrr' ? d.revenue : d.newMrr;
    const x = paddingX + (index / (seriesData.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - ((val - minVal) / valRange) * chartHeight;
    return { x, y, label: d.label, val, newMrr: d.newMrr };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    svgHeight - paddingY
  } L ${points[0].x} ${svgHeight - paddingY} Z`;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#102B4E]">Recurring Revenue Trajectory</h2>
            <span className="text-[11px] text-slate-400 font-medium">· Real-time sync</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-[#102B4E] tabular-nums">
              {formatCurrency(activePoint.val)}
            </span>
            <span className="text-xs font-semibold text-[#10B981] font-mono">
              +{formatCurrency(activePoint.newMrr)} net additions ({activePoint.label})
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Segment */}
          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('mrr')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'mrr'
                  ? 'bg-white text-[#102B4E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Total MRR
            </button>
            <button
              onClick={() => setViewMode('newMrr')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                viewMode === 'newMrr'
                  ? 'bg-white text-[#102B4E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Net Additions
            </button>
          </div>

          {/* Timeframe Segment */}
          <div className="flex items-center bg-slate-100/90 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-white text-[#102B4E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeRange === '90d'
                  ? 'bg-white text-[#102B4E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              90D
            </button>
            <button
              onClick={() => setTimeRange('12m')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeRange === '12m'
                  ? 'bg-white text-[#102B4E] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12M
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 sm:h-64 overflow-visible"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#102B4E" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#10B981" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + ratio * chartHeight;
            const gridVal = maxVal - ratio * valRange;
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94A3B8"
                  className="font-mono tabular-nums"
                >
                  {formatCurrency(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Shaded Area */}
          <path d={areaD} fill="url(#revenueGrad)" />

          {/* Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#102B4E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active / Hover Crosshair & Data points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            const isLast = idx === points.length - 1 && hoveredIdx === null;
            const showPoint = isHovered || isLast;

            return (
              <g key={pt.label}>
                {/* Invisible hover hotspot */}
                <rect
                  x={pt.x - 20}
                  y={0}
                  width="40"
                  height={svgHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                />

                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={svgHeight - paddingY}
                    stroke="#102B4E"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Point circle */}
                {showPoint && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? '5' : '4'}
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                )}

                {/* X-axis date labels */}
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isHovered ? '#102B4E' : '#94A3B8'}
                  fontWeight={isHovered ? '600' : '400'}
                  className="font-mono"
                >
                  {pt.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#102B4E] rounded-full inline-block" />
            <span className="text-slate-600">Recurring Contract Value</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />
            <span className="text-slate-600">Net Growth Velocity</span>
          </span>
        </div>
        <span className="font-mono">Automated reconciliation: 100% synced</span>
      </div>
    </div>
  );
};
