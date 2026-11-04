import React, { useState } from 'react';
import {
  ComputedProductMetrics,
  CustomerDashboardSummary,
} from '../types/banking';
import {
  formatMn,
  formatPct,
  formatSignedDeltaMn,
  REPORTING_MONTHS,
} from '../utils/financialEngine';

interface ProductScheduleTableProps {
  dashboard: CustomerDashboardSummary;
  onSelectProductForChart: (productCode: string, mode: 'assets' | 'liabilities' | 'revenue') => void;
}

export const ProductScheduleTable: React.FC<ProductScheduleTableProps> = ({
  dashboard,
  onSelectProductForChart,
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'monthly_balances' | 'monthly_revenue'>('summary');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredProducts = dashboard.products.filter((p) => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  const getCategoryLabel = (cat: ComputedProductMetrics['category']) => {
    switch (cat) {
      case 'asset':
        return 'Funded Bank Asset';
      case 'liability':
        return 'Bank Liability';
      case 'non_funded':
        return 'Non-Funded Facility';
      case 'remittance':
        return 'Remittance Measure';
      case 'lms_cr':
        return 'LMS Credit Balance';
    }
  };

  return (
    <section
      id="accounting-schedule-section"
      aria-label="Product-Wise Balance and Revenue Schedule"
      className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Product-Wise Balances &amp; Signed Revenue Schedule (LKR Mn)
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div
            role="group"
            aria-label="Filter schedule by accounting classification"
            className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg"
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'asset', label: 'Assets' },
              { id: 'liability', label: 'Liabilities' },
              { id: 'non_funded', label: 'Non-Funded' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Schedule Mode Toggle */}
          <div
            role="group"
            aria-label="Select schedule table columns"
            className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg"
          >
            <button
              type="button"
              onClick={() => setViewMode('summary')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'summary'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Variance
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly_balances')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'monthly_balances'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Balances
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly_revenue')}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'monthly_revenue'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        {viewMode === 'summary' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">Product Group</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3 text-right font-mono">Dec-25 Close BF</th>
                <th className="py-3 px-3 text-right font-mono">Aug-26 Avg</th>
                <th className="py-3 px-3 text-right font-mono text-slate-900">
                  Sep-26 Avg
                </th>
                <th className="py-3 px-3 text-right font-mono">MoM Change</th>
                <th className="py-3 px-3 text-right font-mono">Vs BF (Avg − Close)</th>
                <th className="py-3 pl-3 text-right font-mono text-emerald-700">
                  2026 YTD Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((p) => (
                <tr
                  key={p.productCode}
                  onClick={() =>
                    onSelectProductForChart(
                      p.productCode,
                      p.category === 'liability'
                        ? 'liabilities'
                        : p.category === 'asset'
                        ? 'assets'
                        : 'revenue'
                    )
                  }
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-900">
                      {p.productName}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {getCategoryLabel(p.category)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    {formatMn(p.dec25Bf, 3)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                    {formatMn(p.prevMonthAvg, 3)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatMn(p.latestAvg, 3)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono tabular-nums font-medium ${
                      p.momChangeMn >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatSignedDeltaMn(p.momChangeMn, 2)} ({formatPct(p.momChangePct)})
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-mono tabular-nums font-medium ${
                      p.vsBfChangeMn >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatSignedDeltaMn(p.vsBfChangeMn, 2)} ({formatPct(p.vsBfChangePct)})
                  </td>
                  <td className="py-3 pl-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                    {formatMn(p.ytdRevenueMn, 3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">Product Holding</th>
                {viewMode === 'monthly_balances' && (
                  <th className="py-3 px-2 text-right font-mono">Dec-25 BF</th>
                )}
                {REPORTING_MONTHS.map((m) => (
                  <th key={m} className="py-3 px-2 text-right font-mono">
                    {m}
                  </th>
                ))}
                {viewMode === 'monthly_revenue' && (
                  <th className="py-3 pl-3 text-right font-mono text-emerald-700">
                    2026 YTD
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((p) => (
                <tr
                  key={p.productCode}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-slate-900">
                      {p.productName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {getCategoryLabel(p.category)}
                    </div>
                  </td>
                  {viewMode === 'monthly_balances' && (
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-slate-500">
                      {formatMn(p.dec25Bf, 2)}
                    </td>
                  )}
                  {REPORTING_MONTHS.map((m) => (
                    <td
                      key={m}
                      className={`py-3 px-2 text-right font-mono tabular-nums ${
                        m === 'Sep-26'
                          ? 'font-bold text-slate-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatMn(
                        viewMode === 'monthly_balances'
                          ? p.monthlyBalances[m]
                          : p.monthlyRevenue[m],
                        2
                      )}
                    </td>
                  ))}
                  {viewMode === 'monthly_revenue' && (
                    <td className="py-3 pl-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                      {formatMn(p.ytdRevenueMn, 3)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};
