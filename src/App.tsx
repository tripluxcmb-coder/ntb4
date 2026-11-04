import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Sparkles,
  FileText,
  Presentation,
  Plus,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Layers,
  ExternalLink,
  Download,
} from 'lucide-react';
import {
  INITIAL_CUSTOMERS,
  buildCompleteCustomerDirectory,
} from './data/bankData';
import {
  CustomerDashboardSummary,
  CustomerRecord,
} from './types/banking';
import {
  computeCustomerDashboard,
  formatMn,
  formatSignedDeltaMn,
} from './utils/financialEngine';
import {
  InteractiveTrajectoryChart,
  ChartMetricMode,
  ComparisonBasis,
} from './components/InteractiveTrajectoryChart';
import { NextBestProductEngine } from './components/NextBestProductEngine';
import { DigitalEcosystemPanel } from './components/DigitalEcosystemPanel';
import { DirectorNetworkPanel } from './components/DirectorNetworkPanel';
import { CeoPresentationModal } from './components/CeoPresentationModal';
import { AddCifModal } from './components/AddCifModal';
import { ProductScheduleTable } from './components/ProductScheduleTable';

export default function App() {
  const [customerRegistry] = useState<Map<string, CustomerRecord>>(() =>
    buildCompleteCustomerDirectory(INITIAL_CUSTOMERS)
  );
  const [customDashboards, setCustomDashboards] = useState<
    Record<string, CustomerDashboardSummary>
  >({});

  const [selectedCif, setSelectedCif] = useState<string>('51012681'); // Default: Central Finance Company PLC
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState<boolean>(false);

  // Chart Interactive Controls
  const [metricMode, setMetricMode] = useState<ChartMetricMode>('assets');
  const [selectedProductCode, setSelectedProductCode] = useState<string>('ALL');
  const [comparisonBasis, setComparisonBasis] = useState<ComparisonBasis>('monthly');

  // AI Refresh & Overrides
  const [isRefreshingAi, setIsRefreshingAi] = useState<boolean>(false);
  const [aiOverrides, setAiOverrides] = useState<
    Record<
      string,
      {
        recommendations?: CustomerDashboardSummary['recommendations'];
        description?: string;
      }
    >
  >({});

  // Modals & Collapsible Sections
  const [showExecutiveDesk, setShowExecutiveDesk] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showProductSchedule, setShowProductSchedule] = useState<boolean>(false);

  // Primary corporate customers list for selector dropdown (17 primary customers from CIF_main.csv)
  const primaryCustomerOptions = useMemo(() => {
    const items: { cif: string; name: string; sector: string }[] = [];
    for (const d of Object.values(customDashboards)) {
      items.push({
        cif: d.cif,
        name: d.company.legalName,
        sector: d.company.sector,
      });
    }
    for (const rec of customerRegistry.values()) {
      if (rec.isPrimaryCustomer && !customDashboards[rec.cif]) {
        items.push({
          cif: rec.cif,
          name: rec.company.legalName,
          sector: rec.company.sector,
        });
      }
    }
    return items;
  }, [customerRegistry, customDashboards]);

  // Compute active CustomerDashboardSummary
  const dashboard = useMemo<CustomerDashboardSummary>(() => {
    if (customDashboards[selectedCif]) {
      const baseCustom = customDashboards[selectedCif];
      const override = aiOverrides[selectedCif];
      if (!override) return baseCustom;
      return {
        ...baseCustom,
        company: {
          ...baseCustom.company,
          description: override.description || baseCustom.company.description,
        },
        recommendations: override.recommendations || baseCustom.recommendations,
      };
    }

    const record =
      customerRegistry.get(selectedCif) ??
      customerRegistry.get('51012681') ??
      INITIAL_CUSTOMERS[0];

    const override = aiOverrides[record.cif];
    const computed = computeCustomerDashboard(record, override?.recommendations);
    if (override?.description) {
      return {
        ...computed,
        company: {
          ...computed.company,
          description: override.description,
        },
      };
    }
    return computed;
  }, [selectedCif, customerRegistry, customDashboards, aiOverrides]);

  // Search box supports searching by company name, director name, sector, or CIF code internally,
  // while keeping CIF numbers hidden on the visual customer profile cards.
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: {
      cif: string;
      name: string;
      sector: string;
      isPrimary: boolean;
    }[] = [];

    for (const d of Object.values(customDashboards)) {
      if (
        d.company.legalName.toLowerCase().includes(q) ||
        d.cif.toLowerCase().includes(q) ||
        d.company.sector.toLowerCase().includes(q)
      ) {
        results.push({
          cif: d.cif,
          name: d.company.legalName,
          sector: d.company.sector,
          isPrimary: true,
        });
      }
    }

    for (const rec of customerRegistry.values()) {
      if (customDashboards[rec.cif]) continue;
      if (
        rec.company.legalName.toLowerCase().includes(q) ||
        rec.cif.toLowerCase().includes(q) ||
        rec.company.sector.toLowerCase().includes(q)
      ) {
        results.push({
          cif: rec.cif,
          name: rec.company.legalName,
          sector: rec.company.sector,
          isPrimary: rec.isPrimaryCustomer,
        });
      }
    }

    return results.slice(0, 8);
  }, [searchQuery, customerRegistry, customDashboards]);

  const handleSelectCif = (cif: string) => {
    setSelectedCif(cif);
    setSelectedProductCode('ALL');
    setSearchQuery('');
    setSearchDropdownOpen(false);
  };

  const handleRefreshAi = async () => {
    setIsRefreshingAi(true);
    try {
      const [recRes, ovRes] = await Promise.all([
        fetch(`/api/customer/${dashboard.cif}/recommendations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch(`/api/customer/${dashboard.cif}/overview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      const recJson = recRes.ok ? await recRes.json() : null;
      const ovJson = ovRes.ok ? await ovRes.json() : null;

      setAiOverrides((prev) => ({
        ...prev,
        [dashboard.cif]: {
          recommendations: recJson?.recommendations ?? prev[dashboard.cif]?.recommendations,
          description: ovJson?.description ?? prev[dashboard.cif]?.description,
        },
      }));
    } catch {
      // Keep deterministic engine output gracefully
    } finally {
      setIsRefreshingAi(false);
    }
  };

  const handleCreatedCustomCif = (newDashboard: CustomerDashboardSummary) => {
    setCustomDashboards((prev) => ({
      ...prev,
      [newDashboard.cif]: newDashboard,
    }));
    setSelectedCif(newDashboard.cif);
    setSelectedProductCode('ALL');
  };

  // Top 4 active product holdings for visual summary
  const topActiveProducts = useMemo(() => {
    return [...dashboard.products]
      .filter((p) => p.latestAvg > 0 || p.ytdRevenueMn > 0)
      .sort((a, b) => b.latestAvg - a.latestAvg)
      .slice(0, 4);
  }, [dashboard]);

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#F4F7FB] text-slate-900 flex flex-col">
      {/* Top Executive Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs w-full">
        {/* Top Brand Accent Ribbon in NTB Blue & Pink */}
        <div
          className="h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, #0076BE 0%, #0076BE 65%, #EC008C 100%)',
          }}
        />

        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Top Row on Mobile: Logo + Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Attached NTB Logo & Brand Title */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/80 p-1 sm:p-1.5 flex items-center justify-center shadow-2xs shrink-0">
                <img
                  src="/assets/aistudio/image_ca62426b.png"
                  alt="Nations Trust Bank Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#0076BE] truncate">
                    Nations Trust Bank
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-md bg-[#EC008C]/10 text-[#EC008C] shrink-0">
                    Relationship 360
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
                  Customer Visit Intelligence &amp; Next Best Product Portal
                </p>
              </div>
            </div>

            {/* Action Buttons on Mobile/Tablet/Desktop */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 lg:hidden">
              <a
                href="/ntb-relationship-360-vercel.zip"
                download="ntb-relationship-360-vercel.zip"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-[#0076BE] hover:text-[#0076BE]"
                title="Download Vercel Ready ZIP"
              >
                <Download className="w-3.5 h-3.5 text-[#0076BE]" />
                <span>ZIP</span>
              </a>
              <button
                type="button"
                onClick={() => setShowExecutiveDesk(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white shadow-2xs cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #0076BE 0%, #EC008C 100%)',
                }}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Executive Desk</span>
              </button>
            </div>
          </div>

          {/* Center Row: Customer Selector + Search Input (Responsive on Phone & Desktop) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-2xl">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 min-w-0 flex-1">
              <Building2 className="w-4 h-4 text-[#0076BE] shrink-0" />
              <label htmlFor="primary-customer-select" className="sr-only">
                Select Corporate Customer
              </label>
              <select
                id="primary-customer-select"
                aria-label="Select Primary Corporate Customer"
                value={
                  !dashboard.isPrimaryCustomer && dashboard.parentCompanyCif
                    ? dashboard.parentCompanyCif
                    : dashboard.cif
                }
                onChange={(e) => handleSelectCif(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer w-full truncate"
              >
                {primaryCustomerOptions.map((c) => (
                  <option key={c.cif} value={c.cif}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input (Visible on Phone & Desktop) */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchDropdownOpen(true)}
                onBlur={() => setTimeout(() => setSearchDropdownOpen(false), 180)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchDropdownOpen(true);
                }}
                placeholder="Search customer, director, or CIF..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0076BE]"
              />
              {searchDropdownOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 max-h-64 overflow-y-auto">
                  {searchResults.map((item) => (
                    <button
                      key={item.cif}
                      type="button"
                      onMouseDown={() => handleSelectCif(item.cif)}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#0076BE]/5 flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.sector}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          !item.isPrimary
                            ? 'bg-[#EC008C]/10 text-[#EC008C]'
                            : 'bg-[#0076BE]/10 text-[#0076BE]'
                        }`}
                      >
                        {!item.isPrimary ? 'Director' : 'Corporate'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Desktop & Mobile Secondary Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 hover:border-[#0076BE] text-xs font-semibold text-slate-700 hover:text-[#0076BE] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#EC008C]" />
                <span>Add Client</span>
              </button>

              <a
                href={`/brief/${dashboard.cif}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 hover:border-[#0076BE] text-xs font-semibold text-slate-700 hover:text-[#0076BE] transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-[#0076BE]" />
                <span>Visit Brief</span>
              </a>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <a
                href="/ntb-relationship-360-vercel.zip"
                download="ntb-relationship-360-vercel.zip"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#0076BE]/30 bg-[#0076BE]/5 hover:bg-[#0076BE]/10 text-xs font-bold text-[#0076BE] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download ZIP</span>
              </a>

              <button
                type="button"
                onClick={() => setShowExecutiveDesk(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #0076BE 0%, #EC008C 100%)',
                }}
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Executive Desk</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Executive Workspace */}
      <main className="max-w-[1440px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 flex-1">
        {/* Return Banner when viewing a Linked Director Profile */}
        {!dashboard.isPrimaryCustomer && dashboard.parentCompanyCif && (
          <div className="bg-gradient-to-r from-[#0076BE] to-[#EC008C] text-white rounded-2xl px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/20">
                Linked Director View
              </span>
              <p className="text-xs sm:text-sm font-medium">
                Viewing individual banking portfolio of{' '}
                <strong>{dashboard.company.legalName}</strong> (Linked to{' '}
                {dashboard.parentCompanyName})
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectCif(dashboard.parentCompanyCif!)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#0076BE] hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to {dashboard.parentCompanyName}
            </button>
          </div>
        )}

        {/* 1. Customer Profile & 4-KPI Summary Card (No CIF, No RM, No Branch, Strictly Factual) */}
        <section className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden w-full">
          <div className="p-4 sm:p-7 bg-gradient-to-r from-[#0076BE]/[0.05] via-white to-[#EC008C]/[0.05]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              {/* Left: Customer Identity & Factual Summary */}
              <div className="space-y-2.5 max-w-3xl min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0076BE] text-white">
                    <Briefcase className="w-3.5 h-3.5" />
                    {dashboard.company.sector}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EC008C]/10 text-[#EC008C]">
                    Reporting Month: {dashboard.reportingMonth}
                  </span>
                </div>

                <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight break-words">
                  {dashboard.company.legalName}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {dashboard.company.description}
                </p>

                {dashboard.company.links.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {dashboard.company.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0076BE] hover:text-[#EC008C] bg-[#0076BE]/5 hover:bg-[#EC008C]/10 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <span>{link.label}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Factual Reporting Extract Metadata (RM & Branch Removed) */}
              <div className="flex flex-col justify-between gap-2.5 bg-white/95 border border-slate-200/80 rounded-2xl p-4 shrink-0 w-full lg:w-auto lg:min-w-[250px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Reporting Period
                  </span>
                  <span className="font-mono text-xs font-bold text-[#0076BE]">
                    {dashboard.reportingMonth}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Opening Baseline
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-700">
                    {dashboard.openingBaselineLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Reporting Currency
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    LKR Millions (Mn)
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Factual KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 mt-5 sm:mt-6">
              {/* KPI 1: Funded Assets */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Funded Assets ({dashboard.reportingMonth})
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#0076BE]/10 text-[#0076BE] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-mono tabular-nums text-xl sm:text-2xl font-extrabold text-[#0076BE] mt-2">
                  LKR {formatMn(dashboard.kpis.latestAssetsMn, 2)} Mn
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>MoM Change (vs {dashboard.previousMonth})</span>
                  <span
                    className={`font-mono font-bold ${
                      dashboard.kpis.assetsMomDeltaMn >= 0
                        ? 'text-emerald-600'
                        : 'text-[#EC008C]'
                    }`}
                  >
                    {formatSignedDeltaMn(dashboard.kpis.assetsMomDeltaMn, 2)} Mn
                  </span>
                </div>
              </div>

              {/* KPI 2: Bank Liabilities */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bank Liabilities ({dashboard.reportingMonth})
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#EC008C]/10 text-[#EC008C] flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-mono tabular-nums text-xl sm:text-2xl font-extrabold text-[#EC008C] mt-2">
                  LKR {formatMn(dashboard.kpis.latestLiabilitiesMn, 2)} Mn
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>vs Dec-25 Closing BF</span>
                  <span
                    className={`font-mono font-bold ${
                      dashboard.kpis.liabilitiesVsBfDeltaMn >= 0
                        ? 'text-emerald-600'
                        : 'text-[#EC008C]'
                    }`}
                  >
                    {formatSignedDeltaMn(dashboard.kpis.liabilitiesVsBfDeltaMn, 2)} Mn
                  </span>
                </div>
              </div>

              {/* KPI 3: 2026 YTD Revenue */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2026 YTD Bank Revenue
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#0076BE]/10 text-[#0076BE] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-mono tabular-nums text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  LKR {formatMn(dashboard.kpis.ytdRevenueMn, 2)} Mn
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>{dashboard.reportingMonth} Monthly Revenue</span>
                  <span className="font-mono font-bold text-emerald-600">
                    LKR {formatMn(dashboard.kpis.latestMonthRevenueMn, 2)} Mn
                  </span>
                </div>
              </div>

              {/* KPI 4: Reported CIF Limit */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Reported Facility Limit
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#EC008C]/10 text-[#EC008C] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="font-mono tabular-nums text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                  {dashboard.kpis.reportedLimitMn !== null
                    ? `LKR ${formatMn(dashboard.kpis.reportedLimitMn, 2)} Mn`
                    : 'Not supplied'}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <span>Non-Funded (BG / LC)</span>
                  <span className="font-mono font-bold text-[#0076BE]">
                    LKR {formatMn(dashboard.kpis.latestNonFundedMn, 2)} Mn
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Visual Analytics Grid: 9-Month Balance Trajectory + Digital Ecosystem */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          <div className="lg:col-span-8 min-w-0">
            <InteractiveTrajectoryChart
              dashboard={dashboard}
              metricMode={metricMode}
              onMetricModeChange={setMetricMode}
              selectedProductCode={selectedProductCode}
              onProductCodeChange={setSelectedProductCode}
              comparisonBasis={comparisonBasis}
              onComparisonBasisChange={setComparisonBasis}
            />
          </div>
          <div className="lg:col-span-4 min-w-0">
            <DigitalEcosystemPanel dashboard={dashboard} />
          </div>
        </div>

        {/* 3. Active Product Portfolio Highlights + Optional Collapsible Full Schedule */}
        <section className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden w-full">
          <div className="p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#EC008C]/10 text-[#EC008C] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Active Product Portfolio Highlights
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supplied product balances &amp; revenue contributions for {dashboard.company.legalName}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProductSchedule((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-slate-200 hover:border-[#0076BE] text-xs font-semibold text-[#0076BE] transition-colors cursor-pointer"
            >
              {showProductSchedule ? (
                <>
                  Hide Schedule <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  View Full Schedule ({dashboard.products.length}){' '}
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Visual Top 4 Active Facilities */}
          <div className="px-4 sm:px-6 pb-5 sm:pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {topActiveProducts.map((prod) => {
              const isAsset = prod.category === 'asset';
              return (
                <div
                  key={prod.productCode}
                  onClick={() => {
                    setMetricMode(
                      prod.category === 'liability'
                        ? 'liabilities'
                        : prod.category === 'asset'
                        ? 'assets'
                        : 'revenue'
                    );
                    setSelectedProductCode(prod.productCode);
                  }}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-[#0076BE]/40 flex flex-col justify-between cursor-pointer transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isAsset
                            ? 'bg-[#0076BE]/10 text-[#0076BE]'
                            : 'bg-[#EC008C]/10 text-[#EC008C]'
                        }`}
                      >
                        {prod.category.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        Rev: LKR {formatMn(prod.ytdRevenueMn, 2)}M
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {prod.productName}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-baseline justify-between">
                    <span className="text-[11px] text-slate-500">
                      {dashboard.reportingMonth} Avg
                    </span>
                    <span
                      className={`font-mono tabular-nums text-sm font-bold ${
                        isAsset ? 'text-[#0076BE]' : 'text-[#EC008C]'
                      }`}
                    >
                      LKR {formatMn(prod.latestAvg, 2)} Mn
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Collapsible Full Accounting Schedule */}
          {showProductSchedule && (
            <div className="border-t border-slate-200 p-3 sm:p-4 bg-slate-50/40">
              <ProductScheduleTable
                dashboard={dashboard}
                onSelectProductForChart={(code, mode) => {
                  setMetricMode(mode);
                  setSelectedProductCode(code);
                }}
              />
            </div>
          )}
        </section>

        {/* 4. Next Best Product Suggestions (Placed Directly Above Director Details) */}
        <NextBestProductEngine
          dashboard={dashboard}
          onRefreshAi={handleRefreshAi}
          isRefreshingAi={isRefreshingAi}
        />

        {/* 5. Connected Director Details (Placed at the Bottom of the Page) */}
        {dashboard.isPrimaryCustomer && (
          <DirectorNetworkPanel
            dashboard={dashboard}
            onSelectDirectorCif={(cif) => handleSelectCif(cif)}
          />
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-6">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/image_ca62426b.png"
              alt="Nations Trust Bank"
              className="w-5 h-5 object-contain"
            />
            <span className="font-bold text-slate-700">Nations Trust Bank PLC</span>
            <span>•</span>
            <span>Relationship 360</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            All monetary values reported in LKR Millions (Mn)
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CeoPresentationModal
        isOpen={showExecutiveDesk}
        onClose={() => setShowExecutiveDesk(false)}
        dashboard={dashboard}
      />

      <AddCifModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleCreatedCustomCif}
      />
    </div>
  );
}
