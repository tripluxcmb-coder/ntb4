import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';
import { CustomerDashboardSummary } from '../types/banking';

interface Props {
  dashboard: CustomerDashboardSummary;
  onRefreshAi: () => void;
  isRefreshingAi: boolean;
}

export const NextBestProductEngine: React.FC<Props> = ({
  dashboard,
  onRefreshAi,
  isRefreshingAi,
}) => {
  const [expandedPriority, setExpandedPriority] = useState<number | null>(null);

  const recommendations = dashboard.recommendations.items;

  return (
    <section
      id="next-best-products-section"
      aria-label="Next Best Product Recommendations"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden w-full"
    >
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#0076BE]/[0.04] via-white to-[#EC008C]/[0.04]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0076BE] to-[#EC008C] flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Next Best Product Suggestions
              </h2>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EC008C]/10 text-[#EC008C]">
                Top 3 Priorities
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Recommended bank products based on supplied balance &amp; digital registration data
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefreshAi}
          disabled={isRefreshingAi}
          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-[#0076BE] bg-[#0076BE]/10 hover:bg-[#0076BE]/15 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingAi ? 'animate-spin' : ''}`} />
          {isRefreshingAi ? 'Refreshing...' : 'Refresh Suggestions'}
        </button>
      </div>

      {/* 3 Visual Opportunity Cards (No Copy Pitch button, strictly factual rationale) */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {recommendations.map((rec, idx) => {
          const isExpanded = expandedPriority === rec.priority;
          const isPrimary = idx === 0;

          return (
            <div
              key={`${rec.productCode}-${rec.priority}`}
              className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all border ${
                isPrimary
                  ? 'border-[#0076BE]/35 bg-gradient-to-b from-[#0076BE]/[0.03] to-white shadow-xs'
                  : 'border-slate-200/80 bg-white hover:border-[#0076BE]/30'
              }`}
            >
              <div>
                {/* Top Priority Rank & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      isPrimary
                        ? 'bg-[#0076BE] text-white'
                        : idx === 1
                        ? 'bg-[#EC008C]/10 text-[#EC008C]'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    Priority #{rec.priority}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-500 truncate">
                    {rec.targetCategory}
                  </span>
                </div>

                {/* Product Headline & Supplied Bank Product Group */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1.5">
                  {rec.headlineOffer}
                </h3>
                <div className="mb-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bank Product Group
                  </span>
                  <span className="text-xs font-bold text-[#0076BE]">
                    {rec.productGroup}
                  </span>
                </div>

                {/* Factual Rationale */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {rec.financialRationale}
                </p>

                {/* Collapsible Evidence & Talking Points */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#EC008C]">
                      Supporting Balance &amp; Registration Facts
                    </p>
                    <ul className="space-y-1.5">
                      {rec.evidencePoints.map((pt, i) => (
                        <li
                          key={i}
                          className="text-xs text-slate-600 leading-snug flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0076BE] mt-1.5 shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Footer (Only Expand/Collapse Details — Copy Pitch removed per user request) */}
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedPriority(isExpanded ? null : rec.priority)
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0076BE] hover:text-[#EC008C] transition-colors cursor-pointer"
                >
                  {isExpanded ? (
                    <>
                      Hide Supporting Facts <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      View Supporting Facts ({rec.evidencePoints.length}){' '}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
