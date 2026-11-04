import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { CustomerDashboardSummary, DigitalPlatformId } from '../types/banking';

interface Props {
  dashboard: CustomerDashboardSummary;
}

function getChannelIcon(id: DigitalPlatformId, isRegistered: boolean) {
  const strokeColor = isRegistered ? '#0076BE' : '#EC008C';
  switch (id) {
    case 'frimi':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="2" width="14" height="20" rx="3" stroke={strokeColor} strokeWidth="2" />
          <path d="M9 7H15M9 11H13" stroke="#EC008C" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="17.5" r="1.2" fill={strokeColor} />
        </svg>
      );
    case 'internet_banking':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="2" />
          <path d="M3.6 9H20.4M3.6 15H20.4" stroke={strokeColor} strokeWidth="1.6" />
          <path
            d="M12 3C14.5 6 14.5 18 12 21C9.5 18 9.5 6 12 3Z"
            stroke="#EC008C"
            strokeWidth="1.8"
          />
        </svg>
      );
    case 'mobile_banking':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="6" y="3" width="12" height="18" rx="2.5" stroke={strokeColor} strokeWidth="2" />
          <path d="M10 17.5H14" stroke="#EC008C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'ndc':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 9L12 4L21 9V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V9Z"
            stroke={strokeColor}
            strokeWidth="2"
          />
          <path d="M9 14H15M9 17H13" stroke="#EC008C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2.5" stroke={strokeColor} strokeWidth="2" />
          <path d="M3 10H21" stroke="#EC008C" strokeWidth="2" />
          <circle cx="7.5" cy="14.5" r="1.2" fill={strokeColor} />
        </svg>
      );
  }
}

export const DigitalEcosystemPanel: React.FC<Props> = ({ dashboard }) => {
  const platforms = dashboard.digitalPlatforms;
  const registeredCount = platforms.filter((r) => r.status === 'registered').length;
  const adoptionPct = Math.round((registeredCount / platforms.length) * 100);

  return (
    <section
      id="digital-ecosystem-section"
      aria-label="Digital Banking Ecosystem"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between h-full"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Digital Channel Footprint
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Omnichannel enrollment &amp; white-space opportunities
            </p>
          </div>
          <div className="text-right">
            <span className="font-mono tabular-nums text-lg font-bold text-[#0076BE]">
              {registeredCount}/{platforms.length}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Active ({adoptionPct}%)
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 mb-4">
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${adoptionPct}%`,
                background: 'linear-gradient(90deg, #0076BE 0%, #EC008C 100%)',
              }}
            />
          </div>
        </div>

        {/* 5 Visual Channel Rows */}
        <div className="space-y-2.5">
          {platforms.map((reg) => {
            const isRegistered = reg.status === 'registered';
            return (
              <div
                key={reg.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  isRegistered
                    ? 'bg-[#0076BE]/[0.03] border-[#0076BE]/20'
                    : 'bg-slate-50/70 border-slate-200/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isRegistered ? 'bg-white shadow-2xs' : 'bg-white border border-slate-200/60'
                    }`}
                  >
                    {getChannelIcon(reg.id, isRegistered)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {reg.shortName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{reg.name}</p>
                  </div>
                </div>

                {isRegistered ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Registered
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EC008C]/10 text-[#EC008C] shrink-0">
                    <Clock className="w-3 h-3" />
                    Pitch Now
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Digital Cross-Sell Priority</span>
        <span className="font-semibold text-[#EC008C]">
          {platforms.filter((r) => r.status !== 'registered').length === 0
            ? '100% Channel Coverage'
            : `Onboard ${platforms
                .filter((r) => r.status !== 'registered')
                .map((r) => r.shortName)
                .join(' & ')}`}
        </span>
      </div>
    </section>
  );
};
