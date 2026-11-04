import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { CustomerDashboardSummary } from '../types/banking';
import { formatMn } from '../utils/financialEngine';

interface Props {
  dashboard: CustomerDashboardSummary;
  onSelectDirectorCif: (cif: string) => void;
}

export const DirectorNetworkPanel: React.FC<Props> = ({
  dashboard,
  onSelectDirectorCif,
}) => {
  const directors = dashboard.directors;

  return (
    <section
      id="director-network-section"
      aria-label="Connected Board Directors"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 w-full"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0076BE]/10 text-[#0076BE] flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Connected Director Relationships
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#0076BE]/10 text-[#0076BE]">
                {directors.length} {directors.length === 1 ? 'Profile' : 'Profiles'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Separate personal banking figures from the supplied relationship extract (excluded from company totals)
            </p>
          </div>
        </div>
      </div>

      {directors.length === 0 ? (
        <div className="rounded-xl bg-slate-50 border border-slate-200/60 p-5 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No Named Director Profiles Supplied
          </p>
          <p className="text-xs text-slate-500 mt-1">
            No named director balance records are linked to this customer in the supplied extract.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {directors.map((dir, index) => {
            const displayName = dir.name || 'Director';
            const initials = displayName
              .replace(/^(Mr\.|Ms\.|Dr\.|Prof\.|Deshamanya|Mrs\.)\s+/i, '')
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? '')
              .join('');

            const isPinkAccent = index % 2 === 1;

            return (
              <div
                key={dir.directorCif}
                className="rounded-2xl border border-slate-200/80 hover:border-[#0076BE]/40 bg-white p-4 flex flex-col justify-between transition-all hover:shadow-xs"
              >
                <div>
                  {/* Director Identity Header (Strictly Factual — No CIF or Invented Titles) */}
                  <div className="flex items-center gap-3 mb-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                      style={{
                        background: isPinkAccent
                          ? 'linear-gradient(135deg, #EC008C, #0076BE)'
                          : 'linear-gradient(135deg, #0076BE, #005A92)',
                      }}
                    >
                      {initials || 'DR'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {displayName}
                      </h3>
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        Linked Director Relationship
                      </p>
                    </div>
                  </div>

                  {/* Clean 3-Metric Strip */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50/80 rounded-lg py-2 px-1.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Assets</p>
                      <p className="font-mono tabular-nums text-xs font-bold text-[#0076BE] mt-0.5">
                        {formatMn(dir.latestAssetsMn ?? 0, 2)}M
                      </p>
                    </div>
                    <div className="bg-slate-50/80 rounded-lg py-2 px-1.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Liabilities</p>
                      <p className="font-mono tabular-nums text-xs font-bold text-[#EC008C] mt-0.5">
                        {formatMn(dir.latestLiabilitiesMn ?? 0, 2)}M
                      </p>
                    </div>
                    <div className="bg-slate-50/80 rounded-lg py-2 px-1.5">
                      <p className="text-[10px] font-semibold uppercase text-slate-400">Revenue</p>
                      <p className="font-mono tabular-nums text-xs font-bold text-slate-800 mt-0.5">
                        {formatMn(dir.ytdRevenueMn ?? 0, 2)}M
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => onSelectDirectorCif(dir.directorCif)}
                  className="mt-3.5 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-[#0076BE] text-slate-700 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View Director Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
