import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { CustomerDashboardSummary } from '../types/banking';
import { formatMn, formatSignedDeltaMn } from '../utils/financialEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dashboard: CustomerDashboardSummary;
}

export const CeoPresentationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  dashboard,
}) => {
  const [slide, setSlide] = useState(0);
  const totalSlides = 3;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Executive Desk"
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Bar with NTB Logo */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-xs shrink-0">
              <img
                src="/assets/aistudio/image_ca62426b.png"
                alt="Nations Trust Bank"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white bg-[#0076BE] px-2 py-0.5 rounded-md">
                  Executive Desk
                </span>
                <span className="text-[11px] text-slate-400">
                  Slide {slide + 1} of {totalSlides}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                {dashboard.company.legalName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/brief/${dashboard.cif}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-[#EC008C]" />
              <span className="hidden sm:inline">Printable Dossier</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Executive Desk"
              className="p-2 rounded-xl bg-white/10 hover:bg-[#EC008C] text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-gradient-to-br from-slate-50 via-white to-[#0076BE]/[0.03]">
          {slide === 0 && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#EC008C]">
                    01 / Relationship Financial Snapshot
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    {dashboard.company.legalName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {dashboard.company.sector}
                  </p>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-[#0076BE]/10 border border-[#0076BE]/20 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#0076BE]">
                    Reporting Period
                  </p>
                  <p className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                    {dashboard.reportingMonth} (vs {dashboard.openingBaselineLabel})
                  </p>
                </div>
              </div>

              {/* 4 High-Impact KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Funded Assets ({dashboard.reportingMonth})
                  </p>
                  <p className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-[#0076BE] mt-1.5">
                    LKR {formatMn(dashboard.kpis.latestAssetsMn, 2)} Mn
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    MoM: {formatSignedDeltaMn(dashboard.kpis.assetsMomDeltaMn, 2)} Mn
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Bank Liabilities ({dashboard.reportingMonth})
                  </p>
                  <p className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-[#EC008C] mt-1.5">
                    LKR {formatMn(dashboard.kpis.latestLiabilitiesMn, 2)} Mn
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    MoM: {formatSignedDeltaMn(dashboard.kpis.liabilitiesMomDeltaMn, 2)} Mn
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    2026 YTD Revenue
                  </p>
                  <p className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
                    LKR {formatMn(dashboard.kpis.ytdRevenueMn, 2)} Mn
                  </p>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">
                    {dashboard.reportingMonth}: LKR{' '}
                    {formatMn(dashboard.kpis.latestMonthRevenueMn, 2)} Mn
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Reported CIF Limit
                  </p>
                  <p className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
                    {dashboard.kpis.reportedLimitMn !== null
                      ? `LKR ${formatMn(dashboard.kpis.reportedLimitMn, 2)} Mn`
                      : 'Not supplied'}
                  </p>
                  <p className="text-xs text-[#0076BE] font-semibold mt-1">
                    Non-Funded: LKR {formatMn(dashboard.kpis.latestNonFundedMn, 2)} Mn
                  </p>
                </div>
              </div>

              {/* Concise Factual Overview */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0076BE] mb-2">
                  <Award className="w-4 h-4 text-[#EC008C]" />
                  Customer Profile Summary
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {dashboard.company.description}
                </p>
              </div>
            </div>
          )}

          {slide === 1 && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#EC008C]">
                  02 / Next Best Product Suggestions
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  Recommended Product Groups for {dashboard.company.legalName}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboard.recommendations.items.map((rec) => (
                  <div
                    key={rec.priority}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0076BE]/10 text-[#0076BE]">
                          Priority #{rec.priority}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {rec.targetCategory}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
                        {rec.headlineOffer}
                      </h4>
                      <p className="text-xs font-semibold text-[#0076BE] mb-2.5">
                        {rec.productGroup}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rec.financialRationale}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {slide === 2 && (
            <div className="space-y-5">
              <div className="border-b border-slate-200 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#EC008C]">
                  03 / Digital Channels &amp; Connected Directors
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  Platform Registrations &amp; Linked Director Profiles
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0076BE]" />
                    Digital Channel Enrollment
                  </h4>
                  <div className="space-y-2.5">
                    {dashboard.digitalPlatforms.map((reg) => (
                      <div
                        key={reg.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50"
                      >
                        <span className="text-xs font-bold text-slate-800">{reg.name}</span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            reg.status === 'registered'
                              ? 'bg-emerald-500/10 text-emerald-700'
                              : 'bg-[#EC008C]/10 text-[#EC008C]'
                          }`}
                        >
                          {reg.status === 'registered' ? 'Registered' : 'Not Registered'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#EC008C]" />
                    Connected Director Relationships ({dashboard.directors.length})
                  </h4>
                  {dashboard.directors.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No linked individual director accounts supplied.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {dashboard.directors.map((d) => (
                        <div
                          key={d.directorCif}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{d.name}</p>
                            <p className="text-[11px] text-slate-500">
                              Linked Director Relationship
                            </p>
                          </div>
                          <div className="text-right font-mono text-xs font-bold text-[#0076BE]">
                            Assets: {formatMn(d.latestAssetsMn ?? 0, 2)}M | Liab:{' '}
                            {formatMn(d.latestLiabilitiesMn ?? 0, 2)}M
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  slide === idx ? 'w-8 bg-[#0076BE]' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSlide((s) => Math.max(0, s - 1))}
              disabled={slide === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                slide < totalSlides - 1 ? setSlide((s) => s + 1) : onClose()
              }
              className="inline-flex items-center gap-1 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#0076BE] hover:bg-[#005E99] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              {slide < totalSlides - 1 ? (
                <>
                  Next Slide
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Finish
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
