import React, { useState } from 'react';
import {
  CustomerDashboardSummary,
  ReportingMonth,
} from '../types/banking';
import {
  formatMn,
  formatPct,
  formatSignedDeltaMn,
  computePctChange,
  round6,
} from '../utils/financialEngine';

export type ChartMetricMode = 'assets' | 'liabilities' | 'revenue';
export type ComparisonBasis = 'monthly' | 'vs_bf';

interface InteractiveTrajectoryChartProps {
  dashboard: CustomerDashboardSummary;
  metricMode: ChartMetricMode;
  onMetricModeChange: (mode: ChartMetricMode) => void;
  selectedProductCode: string;
  onProductCodeChange: (code: string) => void;
  comparisonBasis: ComparisonBasis;
  onComparisonBasisChange: (basis: ComparisonBasis) => void;
}

export const InteractiveTrajectoryChart: React.FC<InteractiveTrajectoryChartProps> = ({
  dashboard,
  metricMode,
  onMetricModeChange,
  selectedProductCode,
  onProductCodeChange,
  comparisonBasis,
  onComparisonBasisChange,
}) => {
  const months = dashboard.monthlySeries.months;
  const [focusedMonth, setFocusedMonth] = useState<ReportingMonth>(
    dashboard.reportingMonth
  );

  const eligibleProducts = dashboard.products.filter((p) => {
    if (metricMode === 'assets') return p.category === 'asset';
    if (metricMode === 'liabilities') return p.category === 'liability';
    return true;
  });

  const activeProduct =
    selectedProductCode === 'ALL'
      ? null
      : eligibleProducts.find((p) => p.productCode === selectedProductCode) ?? null;

  const seriesByMonth: Record<ReportingMonth, number> = {} as Record<
    ReportingMonth,
    number
  >;
  for (const m of months) {
    if (activeProduct) {
      seriesByMonth[m] =
        metricMode === 'revenue'
          ? activeProduct.monthlyRevenue[m]
          : activeProduct.monthlyBalances[m];
    } else {
      seriesByMonth[m] = dashboard.monthlySeries[metricMode][m];
    }
  }

  const dec25Baseline: number | null =
    metricMode === 'revenue'
      ? null
      : activeProduct
      ? activeProduct.dec25Bf
      : metricMode === 'assets'
      ? dashboard.monthlySeries.dec25Bf.assets
      : dashboard.monthlySeries.dec25Bf.liabilities;

  const focusedIdx = months.indexOf(focusedMonth);
  const focusedValue = seriesByMonth[focusedMonth] ?? 0;
  const prevMonthLabel =
    focusedIdx > 0 ? months[focusedIdx - 1] : 'Dec-25 BF';
  const prevMonthValue =
    focusedIdx > 0
      ? seriesByMonth[months[focusedIdx - 1]]
      : dec25Baseline ?? 0;

  const focusedMomDelta = round6(focusedValue - prevMonthValue);
  const focusedMomPct = computePctChange(focusedValue, prevMonthValue);

  const focusedVsBfDelta =
    dec25Baseline !== null ? round6(focusedValue - dec25Baseline) : null;
  const focusedVsBfPct =
    dec25Baseline !== null ? computePctChange(focusedValue, dec25Baseline) : null;

  const valuesForScale = [
    ...months.map((m) => seriesByMonth[m]),
    ...(dec25Baseline !== null ? [dec25Baseline] : []),
  ];
  const maxVal = Math.max(0.01, ...valuesForScale.map((v) => Math.abs(v))) * 1.08;

  const svgWidth = 880;
  const svgHeight = 250;
  const padLeft = 64;
  const padRight = 24;
  const padTop = 28;
  const padBottom = 38;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const yTicks = [0, 0.5, 1].map((ratio) => ({
    value: maxVal * ratio,
    y: padTop + plotHeight - ratio * plotHeight,
  }));

  const barSlotWidth = plotWidth / months.length;
  const barWidth = Math.min(46, barSlotWidth * 0.54);

  const baselineY =
    dec25Baseline !== null
      ? padTop +
        plotHeight -
        Math.min(1, Math.max(0, dec25Baseline / maxVal)) * plotHeight
      : null;

  const linePoints = months
    .map((m, idx) => {
      const val = Math.max(0, seriesByMonth[m] ?? 0);
      const ratio = Math.min(1, val / maxVal);
      const x = padLeft + idx * barSlotWidth + barSlotWidth / 2;
      const y = padTop + plotHeight - ratio * plotHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const primaryHex =
    metricMode === 'assets'
      ? '#0076BE'
      : metricMode === 'liabilities'
      ? '#EC008C'
      : '#059669';

  return (
    <section
      id="trajectory-section"
      aria-label="Financial Trajectory and Product Matrix"
      className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs w-full overflow-hidden"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 pb-4 border-b border-slate-100">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-[#0076BE]">
            Monthly Performance Trajectory (Jan – Sep 2026)
          </div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5 break-words">
            {activeProduct ? activeProduct.productName : 'Total Portfolio Balance & Revenue Trend'}
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
          {/* Metric Segmented Control in NTB Blue & Pink */}
          <div
            role="group"
            aria-label="Select Financial Metric"
            className="grid grid-cols-3 sm:flex items-center gap-1 p-1 bg-slate-100 rounded-xl"
          >
            <button
              type="button"
              onClick={() => {
                onMetricModeChange('assets');
                onProductCodeChange('ALL');
              }}
              className={`px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                metricMode === 'assets'
                  ? 'bg-[#0076BE] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Assets
            </button>
            <button
              type="button"
              onClick={() => {
                onMetricModeChange('liabilities');
                onProductCodeChange('ALL');
              }}
              className={`px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                metricMode === 'liabilities'
                  ? 'bg-[#EC008C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Liabilities
            </button>
            <button
              type="button"
              onClick={() => {
                onMetricModeChange('revenue');
                onProductCodeChange('ALL');
              }}
              className={`px-2.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                metricMode === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Product Selector */}
            <select
              id="chart-product-select"
              aria-label="Filter trajectory chart by product"
              value={selectedProductCode}
              onChange={(e) => onProductCodeChange(e.target.value)}
              className="flex-1 sm:flex-initial min-w-0 max-w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 truncate focus:outline-none focus:ring-2 focus:ring-[#0076BE]"
            >
              <option value="ALL">
                All {metricMode === 'assets' ? 'Asset' : metricMode === 'liabilities' ? 'Liability' : 'Active'} Products ({eligibleProducts.length})
              </option>
              {eligibleProducts.map((p) => (
                <option key={p.productCode} value={p.productCode}>
                  {p.productName}
                </option>
              ))}
            </select>

            {/* Comparison Basis */}
            <div
              role="group"
              aria-label="Select Comparison Basis"
              className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0"
            >
              <button
                type="button"
                onClick={() => onComparisonBasisChange('monthly')}
                className={`px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  comparisonBasis === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => onComparisonBasisChange('vs_bf')}
                className={`px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  comparisonBasis === 'vs_bf'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Vs BF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Scannable Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4 py-3.5 border-b border-slate-100">
        <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
          <span className="text-xs text-slate-500">
            {focusedMonth} {metricMode === 'revenue' ? 'Revenue:' : 'Average:'}
          </span>
          <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-slate-900">
            LKR {formatMn(focusedValue, 2)} Mn
          </span>
        </div>

        <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
          <span className="text-xs text-slate-500">
            vs {prevMonthLabel}:
          </span>
          <span
            className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
              focusedMomDelta >= 0 ? 'text-emerald-600' : 'text-[#EC008C]'
            }`}
          >
            {formatSignedDeltaMn(focusedMomDelta, 2)} Mn ({formatPct(focusedMomPct)})
          </span>
        </div>

        <div className="flex items-baseline justify-between sm:justify-start sm:gap-2">
          <span className="text-xs text-slate-500">
            {metricMode === 'revenue' ? '2026 YTD Total:' : 'vs Dec-25 BF:'}
          </span>
          {metricMode === 'revenue' ? (
            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-emerald-600">
              LKR{' '}
              {formatMn(
                activeProduct
                  ? activeProduct.ytdRevenueMn
                  : dashboard.kpis.ytdRevenueMn,
                2
              )}{' '}
              Mn
            </span>
          ) : (
            <span
              className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
                (focusedVsBfDelta ?? 0) >= 0 ? 'text-emerald-600' : 'text-[#EC008C]'
              }`}
            >
              {formatSignedDeltaMn(focusedVsBfDelta, 2)} Mn ({formatPct(focusedVsBfPct)})
            </span>
          )}
        </div>
      </div>

      {/* Responsive SVG Chart — Locked to Phone & Desktop Width with Zero Horizontal Overflow */}
      <div className="mt-4 w-full">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto block select-none"
          role="img"
          aria-label={`Monthly ${metricMode} chart from Jan-26 to Sep-26`}
        >
          <defs>
            <linearGradient id="ntbBlueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0076BE" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0076BE" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="ntbPinkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EC008C" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#EC008C" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="ntbGreenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={t.y}
                x2={svgWidth - padRight}
                y2={t.y}
                stroke="currentColor"
                className="text-slate-100"
                strokeWidth="1"
              />
              <text
                x={padLeft - 10}
                y={t.y + 4}
                textAnchor="end"
                className="fill-slate-400 font-mono text-[11px]"
              >
                {formatMn(t.value, t.value >= 100 ? 0 : 1)}
              </text>
            </g>
          ))}

          {/* Dec-25 Closing BF Dashed Reference Line */}
          {baselineY !== null && dec25Baseline !== null && (
            <g>
              <line
                x1={padLeft}
                y1={baselineY}
                x2={svgWidth - padRight}
                y2={baselineY}
                stroke="#EC008C"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x={svgWidth - padRight - 4}
                y={Math.max(14, baselineY - 6)}
                textAnchor="end"
                className="font-mono text-[10px] font-bold"
                fill="#EC008C"
              >
                Dec-25 BF: {formatMn(dec25Baseline, 1)} Mn
              </text>
            </g>
          )}

          {/* Trend Polyline */}
          <polyline
            fill="none"
            stroke={primaryHex}
            strokeWidth="2"
            strokeOpacity="0.35"
            points={linePoints}
          />

          {/* Bars */}
          {months.map((m, idx) => {
            const val = Math.max(0, seriesByMonth[m] ?? 0);
            const ratio = Math.min(1, val / maxVal);
            const barH = Math.max(6, ratio * plotHeight);
            const centerX = padLeft + idx * barSlotWidth + barSlotWidth / 2;
            const barX = centerX - barWidth / 2;
            const barY = padTop + plotHeight - barH;
            const isFocused = m === focusedMonth;

            const fillUrl =
              metricMode === 'assets'
                ? isFocused
                  ? '#0076BE'
                  : 'url(#ntbBlueGrad)'
                : metricMode === 'liabilities'
                ? isFocused
                  ? '#EC008C'
                  : 'url(#ntbPinkGrad)'
                : isFocused
                ? '#059669'
                : 'url(#ntbGreenGrad)';

            return (
              <g
                key={m}
                className="cursor-pointer"
                onClick={() => setFocusedMonth(m)}
                onMouseEnter={() => setFocusedMonth(m)}
              >
                <rect
                  x={padLeft + idx * barSlotWidth + 4}
                  y={padTop}
                  width={barSlotWidth - 8}
                  height={plotHeight}
                  rx="8"
                  fill={isFocused ? 'rgba(0, 118, 190, 0.06)' : 'transparent'}
                />
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barH}
                  rx="6"
                  fill={fillUrl}
                />
                <text
                  x={centerX}
                  y={Math.max(14, barY - 7)}
                  textAnchor="middle"
                  className={`font-mono text-[11px] ${
                    isFocused
                      ? 'fill-slate-900 font-bold'
                      : 'fill-slate-500'
                  }`}
                >
                  {formatMn(seriesByMonth[m], seriesByMonth[m] >= 100 ? 1 : 2)}
                </text>
                <text
                  x={centerX}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className={`font-mono text-xs ${
                    isFocused
                      ? 'fill-[#0076BE] font-bold'
                      : 'fill-slate-500'
                  }`}
                >
                  {m}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
};
