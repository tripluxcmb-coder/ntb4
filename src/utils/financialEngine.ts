import {
  ComputedProductMetrics,
  CustomerDashboardSummary,
  CustomerRecord,
  DigitalAccessItem,
  DigitalPlatformId,
  DirectorLink,
  ProductHoldingRow,
  ReportingMonth,
} from '../types/banking';

export const REPORTING_MONTHS: ReportingMonth[] = [
  'Jan-26',
  'Feb-26',
  'Mar-26',
  'Apr-26',
  'May-26',
  'Jun-26',
  'Jul-26',
  'Aug-26',
  'Sep-26',
];

export const LATEST_MONTH: ReportingMonth = 'Sep-26';
export const PREVIOUS_MONTH: ReportingMonth = 'Aug-26';
export const OPENING_BASELINE_LABEL = 'Dec-25 Closing BF';

export const BANK_22_PRODUCT_GROUPS: { code: string; name: string; category: string }[] = [
  { code: 'LN_TERM', name: 'Corporate Term Loans (LN DR)', category: 'Funded Asset' },
  { code: 'CASA_OD', name: 'Corporate Overdraft & Working Capital (CASA DR)', category: 'Funded Asset' },
  { code: 'LMS_ADV', name: 'LMS Structured Advances (LMS DR)', category: 'Funded Asset' },
  { code: 'FB_DISC', name: 'Foreign Bills Purchased & Discounted (FB DR)', category: 'Funded Asset' },
  { code: 'CORP_CARD_DR', name: 'Commercial & Corporate Credit Cards (CARD DR)', category: 'Funded Asset' },
  { code: 'CASA_DEP', name: 'Corporate Current & Call Accounts (CASA CR)', category: 'Bank Liability' },
  { code: 'SAVINGS_CR', name: 'High-Yield Corporate Savings & Money Market (CASA CR)', category: 'Bank Liability' },
  { code: 'TD_FIXED', name: 'Corporate Term & Fixed Deposits (TD CR)', category: 'Bank Liability' },
  { code: 'FC_MARGIN', name: 'Foreign Currency Margin Deposits (FC MARGIN CR)', category: 'Bank Liability' },
  { code: 'CORP_CARD_CR', name: 'Commercial Card Credit Balances (CARD CR)', category: 'Bank Liability' },
  { code: 'LMS_CRED', name: 'LMS Credit Balances (LMS CR)', category: 'Separate Credit Measure' },
  { code: 'BG_PERF', name: 'Bank Guarantees & Performance Bonds', category: 'Non-Funded Facility' },
  { code: 'DOC_LC', name: 'Letters of Credit & Documentary Credits', category: 'Non-Funded Facility' },
  { code: 'REMIT_TRADE', name: 'Inward & Outward International Remittances', category: 'Remittance Flow' },
  { code: 'NDE_H2H', name: 'Nations Direct Enterprise (Host-to-Host ERP Cash Mgmt)', category: 'Digital Cash Management' },
  { code: 'NDC_PORTAL', name: 'Nations Direct Commercial (Corporate Web Treasury)', category: 'Digital Cash Management' },
  { code: 'FRIMI_CORP', name: 'FriMi Ecosystem & Employee Payroll Disbursement', category: 'Digital Ecosystem' },
  { code: 'FX_FORWARD', name: 'Treasury FX Forwards, Swaps & Hedging Desk', category: 'Treasury & Markets' },
  { code: 'SCF_DIST', name: 'Supply Chain & Dealer/Vendor Financing Program', category: 'Working Capital & Trade' },
  { code: 'GREEN_FIN', name: 'Green & Sustainability-Linked Project Finance', category: 'Term & Sustainable Finance' },
  { code: 'IPG_MERCHANT', name: 'NTB IPG & POS Merchant Acquiring Solutions', category: 'Transaction Banking' },
  { code: 'PRIVATE_WEALTH', name: 'Nations Private Wealth & Inner Circle Advisory', category: 'Executive & Director Banking' },
];

export function round6(val: number): number {
  return Math.round((val + Number.EPSILON) * 1_000_000) / 1_000_000;
}

export function computePctChange(current: number, baseline: number): number | null {
  if (Math.abs(baseline) < 0.000001) {
    return null;
  }
  return Number((((current - baseline) / Math.abs(baseline)) * 100).toFixed(2));
}

export function computeProductMetrics(row: ProductHoldingRow): ComputedProductMetrics {
  const latestAvg = round6(row.monthlyBalances[LATEST_MONTH] ?? 0);
  const prevMonthAvg = round6(row.monthlyBalances[PREVIOUS_MONTH] ?? 0);
  const dec25Bf = round6(row.dec25Bf ?? 0);

  const momChangeMn = round6(latestAvg - prevMonthAvg);
  const vsBfChangeMn = round6(latestAvg - dec25Bf);

  // YTD Revenue is the sum of supplied current-year (2026) monthly signed values.
  // Dec-25 revenue column is excluded from 2026 YTD.
  const ytdRevenueMn = round6(
    REPORTING_MONTHS.reduce((sum, m) => sum + (row.monthlyRevenue[m] ?? 0), 0)
  );

  return {
    productCode: row.productCode,
    productName: row.productName,
    productGroup: row.productGroup,
    category: row.category,
    measureLabel: row.measureLabel,
    dec25Bf,
    latestAvg,
    prevMonthAvg,
    momChangeMn,
    momChangePct: computePctChange(latestAvg, prevMonthAvg),
    vsBfChangeMn,
    vsBfChangePct: computePctChange(latestAvg, dec25Bf),
    ytdRevenueMn,
    monthlyBalances: { ...row.monthlyBalances },
    monthlyRevenue: { ...row.monthlyRevenue },
  };
}

export function buildDigitalPlatforms(
  access: Record<DigitalPlatformId, 'registered' | 'not_registered' | 'not_supplied'>
): DigitalAccessItem[] {
  return [
    {
      id: 'frimi',
      name: 'FriMi Digital Bank',
      shortName: 'FriMi',
      category: 'Retail & Lifestyle',
      status: access.frimi ?? 'not_supplied',
      description: 'QR collections, instant B2C ecosystem & executive lifestyle banking',
    },
    {
      id: 'internet_banking',
      name: 'Internet Banking',
      shortName: 'Internet Banking',
      category: 'Retail & Lifestyle',
      status: access.internet_banking ?? 'not_supplied',
      description: 'Web-based account inquiry, statement exports & retail transfers',
    },
    {
      id: 'mobile_banking',
      name: 'Mobile Banking App',
      shortName: 'Mobile Banking',
      category: 'Retail & Lifestyle',
      status: access.mobile_banking ?? 'not_supplied',
      description: 'On-the-go transaction approvals and real-time balance alerts',
    },
    {
      id: 'ndc',
      name: 'Nations Direct Commercial',
      shortName: 'NDC',
      category: 'Corporate Cash Management',
      status: access.ndc ?? 'not_supplied',
      description: 'Multi-tier corporate workflow approvals, bulk salary & supplier runs',
    },
    {
      id: 'nde',
      name: 'Nations Direct Enterprise',
      shortName: 'NDE',
      category: 'Corporate Cash Management',
      status: access.nde ?? 'not_supplied',
      description: 'Host-to-Host ERP integration, automated reconciliation & trade initiation',
    },
  ];
}

export function filterNamedDirectors(directors: DirectorLink[]): DirectorLink[] {
  return directors.filter(
    (d) =>
      Boolean(d.name) &&
      !d.name!.trim().toLowerCase().startsWith('director cif')
  );
}

export function computeCustomerDashboard(
  record: CustomerRecord,
  overrideRecommendations?: CustomerDashboardSummary['recommendations']
): CustomerDashboardSummary {
  const products = record.holdings.map(computeProductMetrics);

  const assetProducts = products.filter((p) => p.category === 'asset');
  const liabilityProducts = products.filter((p) => p.category === 'liability');
  const nonFundedProducts = products.filter((p) => p.category === 'non_funded');
  const remittanceProducts = products.filter((p) => p.category === 'remittance');
  const lmsCrProducts = products.filter((p) => p.category === 'lms_cr');

  const sumByMonth = (
    list: ComputedProductMetrics[],
    field: 'monthlyBalances' | 'monthlyRevenue'
  ): Record<ReportingMonth, number> => {
    const result = {} as Record<ReportingMonth, number>;
    for (const m of REPORTING_MONTHS) {
      result[m] = round6(list.reduce((acc, item) => acc + (item[field][m] ?? 0), 0));
    }
    return result;
  };

  const monthlyAssets = sumByMonth(assetProducts, 'monthlyBalances');
  const monthlyLiabilities = sumByMonth(liabilityProducts, 'monthlyBalances');
  // Revenue is aggregated once across all products for the CIF
  const monthlyRevenue = sumByMonth(products, 'monthlyRevenue');
  const monthlyNonFunded = sumByMonth(nonFundedProducts, 'monthlyBalances');
  const monthlyRemittance = sumByMonth(remittanceProducts, 'monthlyBalances');

  const dec25BfAssetsMn = round6(assetProducts.reduce((s, p) => s + p.dec25Bf, 0));
  const dec25BfLiabilitiesMn = round6(liabilityProducts.reduce((s, p) => s + p.dec25Bf, 0));

  const latestAssetsMn = monthlyAssets[LATEST_MONTH];
  const prevAssetsMn = monthlyAssets[PREVIOUS_MONTH];
  const assetsMomDeltaMn = round6(latestAssetsMn - prevAssetsMn);
  const assetsVsBfDeltaMn = round6(latestAssetsMn - dec25BfAssetsMn);

  const latestLiabilitiesMn = monthlyLiabilities[LATEST_MONTH];
  const prevLiabilitiesMn = monthlyLiabilities[PREVIOUS_MONTH];
  const liabilitiesMomDeltaMn = round6(latestLiabilitiesMn - prevLiabilitiesMn);
  const liabilitiesVsBfDeltaMn = round6(latestLiabilitiesMn - dec25BfLiabilitiesMn);

  const ytdRevenueMn = round6(
    REPORTING_MONTHS.reduce((s, m) => s + monthlyRevenue[m], 0)
  );
  const latestMonthRevenueMn = monthlyRevenue[LATEST_MONTH];
  const prevMonthRevenueMn = monthlyRevenue[PREVIOUS_MONTH];
  const revenueMomDeltaMn = round6(latestMonthRevenueMn - prevMonthRevenueMn);

  const latestNonFundedMn = monthlyNonFunded[LATEST_MONTH];
  const latestRemittanceMn = monthlyRemittance[LATEST_MONTH];
  const latestLmsCrMn = round6(lmsCrProducts.reduce((s, p) => s + p.latestAvg, 0));

  // Filter unnamed director placeholders for the web view as required by spec
  // Do not invent legal board titles; label strictly as Linked Director Relationship
  const visibleDirectors = filterNamedDirectors(record.directors).map((d) => ({
    ...d,
    role: 'Linked Director Relationship',
  }));

  const registeredDigital = Object.entries(record.digitalAccess)
    .filter(([, status]) => status === 'registered')
    .map(([k]) => k.toUpperCase());
  const unregisteredDigital = Object.entries(record.digitalAccess)
    .filter(([, status]) => status === 'not_registered')
    .map(([k]) => k.toUpperCase());

  const factualDescription = !record.isPrimaryCustomer
    ? `Individual banking profile linked to ${
        record.parentCompanyName ?? 'the primary corporate customer'
      } in the supplied relationship extract. Personal balances and revenue are reported separately and are never included in company totals.`
    : record.company.entityType === 'Individual'
    ? `Primary individual customer relationship in the supplied bank extract. ${LATEST_MONTH} average funded assets total LKR ${formatMn(
        latestAssetsMn,
        2
      )} Mn and average bank liabilities total LKR ${formatMn(
        latestLiabilitiesMn,
        2
      )} Mn, with LKR ${formatMn(ytdRevenueMn, 2)} Mn in 2026 YTD signed revenue.`
    : `${record.company.legalName} is a corporate banking client in the ${
        record.company.sector
      } sector. Based on the supplied ${LATEST_MONTH} extract, average funded assets stand at LKR ${formatMn(
        latestAssetsMn,
        2
      )} Mn, average bank liabilities are LKR ${formatMn(
        latestLiabilitiesMn,
        2
      )} Mn, and 2026 YTD signed bank revenue is LKR ${formatMn(ytdRevenueMn, 2)} Mn.`;

  const factualRecommendations = record.savedRecommendations.map((rec) => {
    const evidencePoints = [
      `${LATEST_MONTH} average funded assets: LKR ${formatMn(latestAssetsMn, 2)} Mn (${formatSignedDeltaMn(
        assetsVsBfDeltaMn,
        2
      )} Mn vs Dec-25 closing BF)`,
      `${LATEST_MONTH} average bank liabilities: LKR ${formatMn(
        latestLiabilitiesMn,
        2
      )} Mn | 2026 YTD signed revenue: LKR ${formatMn(ytdRevenueMn, 2)} Mn`,
      unregisteredDigital.length > 0
        ? `Unregistered digital channels available for onboarding: ${unregisteredDigital.join(', ')}`
        : `Registered digital channels: ${registeredDigital.join(', ') || 'None supplied'}`,
    ];

    const factualRationale = `Selected from the bank's 22 product groups (${rec.productGroup}) based on ${LATEST_MONTH} average funded assets of LKR ${formatMn(
      latestAssetsMn,
      2
    )} Mn, average bank liabilities of LKR ${formatMn(
      latestLiabilitiesMn,
      2
    )} Mn, and current digital channel registration status.`;

    return {
      ...rec,
      financialRationale: factualRationale,
      evidencePoints,
    };
  });

  return {
    cif: record.cif,
    isPrimaryCustomer: record.isPrimaryCustomer,
    parentCompanyCif: record.parentCompanyCif,
    parentCompanyName: record.parentCompanyName,
    reportingMonth: LATEST_MONTH,
    previousMonth: PREVIOUS_MONTH,
    openingBaselineLabel: OPENING_BASELINE_LABEL,
    currency: 'LKR',
    company: {
      ...record.company,
      relationshipManager: '',
      branchName: '',
      description: factualDescription,
    },
    kpis: {
      latestAssetsMn,
      prevAssetsMn,
      dec25BfAssetsMn,
      assetsMomDeltaMn,
      assetsMomDeltaPct: computePctChange(latestAssetsMn, prevAssetsMn),
      assetsVsBfDeltaMn,
      assetsVsBfDeltaPct: computePctChange(latestAssetsMn, dec25BfAssetsMn),

      latestLiabilitiesMn,
      prevLiabilitiesMn,
      dec25BfLiabilitiesMn,
      liabilitiesMomDeltaMn,
      liabilitiesMomDeltaPct: computePctChange(latestLiabilitiesMn, prevLiabilitiesMn),
      liabilitiesVsBfDeltaMn,
      liabilitiesVsBfDeltaPct: computePctChange(latestLiabilitiesMn, dec25BfLiabilitiesMn),

      ytdRevenueMn,
      latestMonthRevenueMn,
      prevMonthRevenueMn,
      revenueMomDeltaMn,
      revenueMomDeltaPct: computePctChange(latestMonthRevenueMn, prevMonthRevenueMn),

      reportedLimitMn: record.reportedLimitMn,
      latestNonFundedMn,
      latestRemittanceMn,
      latestLmsCrMn,
    },
    monthlySeries: {
      months: REPORTING_MONTHS,
      dec25Bf: {
        assets: dec25BfAssetsMn,
        liabilities: dec25BfLiabilitiesMn,
      },
      assets: monthlyAssets,
      liabilities: monthlyLiabilities,
      revenue: monthlyRevenue,
      nonFunded: monthlyNonFunded,
      remittance: monthlyRemittance,
    },
    products,
    digitalPlatforms: buildDigitalPlatforms(record.digitalAccess),
    directors: visibleDirectors,
    recommendations: overrideRecommendations ?? {
      source: 'deterministic_engine',
      model: 'NTB Product Priority Engine',
      generatedAt: '2026-11-03T07:00:00Z',
      zdrEnforced: true,
      items: factualRecommendations,
    },
  };
}

export function formatMn(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || Number.isNaN(val)) {
    return 'Not supplied';
  }
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatSignedDeltaMn(val: number | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || Number.isNaN(val)) {
    return '—';
  }
  const sign = val > 0 ? '+' : val < 0 ? '−' : '';
  return `${sign}${Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatPct(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(val)) {
    return 'N/A';
  }
  const sign = val > 0 ? '+' : val < 0 ? '−' : '';
  return `${sign}${Math.abs(val).toFixed(2)}%`;
}
