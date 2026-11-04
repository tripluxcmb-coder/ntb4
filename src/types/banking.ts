export type DigitalStatus = 'registered' | 'not_registered' | 'not_supplied';

export type DigitalPlatformId =
  | 'frimi'
  | 'internet_banking'
  | 'mobile_banking'
  | 'ndc'
  | 'nde';

export interface DigitalAccessItem {
  id: DigitalPlatformId;
  name: string;
  shortName: string;
  category: 'Retail & Lifestyle' | 'Corporate Cash Management';
  status: DigitalStatus;
  description: string;
}

export type AccountingCategory =
  | 'asset'
  | 'liability'
  | 'non_funded'
  | 'remittance'
  | 'lms_cr';

export type ReportingMonth =
  | 'Jan-26'
  | 'Feb-26'
  | 'Mar-26'
  | 'Apr-26'
  | 'May-26'
  | 'Jun-26'
  | 'Jul-26'
  | 'Aug-26'
  | 'Sep-26';

export interface ProductHoldingRow {
  productCode: string;
  productName: string;
  productGroup: string;
  category: AccountingCategory;
  measureLabel: 'AVG_BAL_DR_LCY' | 'AVG_BAL_CR_LCY' | 'NON_FUNDED_LCY' | 'REMITTANCE_LCY';
  dec25Bf: number; // December 2025 closing balance brought forward (LKR Mn)
  monthlyBalances: Record<ReportingMonth, number>; // Jan-26 to Sep-26 monthly average balances (LKR Mn)
  monthlyRevenue: Record<ReportingMonth, number>; // Jan-26 to Sep-26 signed monthly revenue (LKR Mn)
  dec25Revenue?: number; // Retained in source, excluded from 2026 YTD
}

export interface CompanyPublicLink {
  label: string;
  url: string;
  type: 'website' | 'annual_report' | 'cse_filing' | 'regulatory';
}

export interface CompanyMasterProfile {
  legalName: string;
  shortName: string;
  entityType: 'Corporate' | 'SME' | 'Individual';
  sector: string;
  subSector: string;
  incorporationNumber?: string;
  headquarters: string;
  relationshipTier: 'Institutional Tier 1' | 'Corporate Premier' | 'Mid-Market Growth' | 'Private Wealth';
  relationshipManager: string;
  branchName: string;
  description: string;
  strategicContext: string;
  keyHighlights: string[];
  links: CompanyPublicLink[];
  lastVerifiedDate: string;
}

export interface DirectorLink {
  directorCif: string;
  name: string | null; // null if no balance extract was supplied for this director CIF
  role: string;
  hasBalanceExtract: boolean;
  latestAssetsMn?: number;
  latestLiabilitiesMn?: number;
  ytdRevenueMn?: number;
  reportedLimitMn?: number | null;
}

export interface NextBestProductRecommendation {
  priority: 1 | 2 | 3;
  productCode: string;
  productGroup: string;
  headlineOffer: string;
  targetCategory: 'Cash Management & Digital' | 'Working Capital & Trade' | 'Term & Sustainable Finance' | 'Treasury & FX' | 'Wealth & Executive Banking';
  confidenceScore: string;
  estimatedAnnualRevenueUpliftMn: number;
  financialRationale: string;
  evidencePoints: string[];
  talkingPoints: string[];
  implementationTimeline: string;
}

export interface CustomerRecord {
  cif: string;
  isPrimaryCustomer: boolean; // True if in CIF_main.csv (17 primary customers)
  parentCompanyCif?: string; // Present if this is a linked Director CIF
  parentCompanyName?: string;
  company: CompanyMasterProfile;
  reportedLimitMn: number | null; // null means Not Supplied in CIF_Limit.csv
  digitalAccess: Record<DigitalPlatformId, DigitalStatus>;
  holdings: ProductHoldingRow[];
  directors: DirectorLink[];
  savedRecommendations: NextBestProductRecommendation[];
}

export interface ComputedProductMetrics {
  productCode: string;
  productName: string;
  productGroup: string;
  category: AccountingCategory;
  measureLabel: string;
  dec25Bf: number;
  latestAvg: number; // Sep-26
  prevMonthAvg: number; // Aug-26
  momChangeMn: number; // Sep-26 avg minus Aug-26 avg
  momChangePct: number | null;
  vsBfChangeMn: number; // Sep-26 avg minus Dec-25 closing BF
  vsBfChangePct: number | null;
  ytdRevenueMn: number; // Sum of Jan-26..Sep-26 signed revenue
  monthlyBalances: Record<ReportingMonth, number>;
  monthlyRevenue: Record<ReportingMonth, number>;
}

export interface CustomerDashboardSummary {
  cif: string;
  isPrimaryCustomer: boolean;
  parentCompanyCif?: string;
  parentCompanyName?: string;
  reportingMonth: ReportingMonth;
  previousMonth: ReportingMonth;
  openingBaselineLabel: string;
  currency: string;
  company: CompanyMasterProfile;
  kpis: {
    latestAssetsMn: number;
    prevAssetsMn: number;
    dec25BfAssetsMn: number;
    assetsMomDeltaMn: number;
    assetsMomDeltaPct: number | null;
    assetsVsBfDeltaMn: number;
    assetsVsBfDeltaPct: number | null;

    latestLiabilitiesMn: number;
    prevLiabilitiesMn: number;
    dec25BfLiabilitiesMn: number;
    liabilitiesMomDeltaMn: number;
    liabilitiesMomDeltaPct: number | null;
    liabilitiesVsBfDeltaMn: number;
    liabilitiesVsBfDeltaPct: number | null;

    ytdRevenueMn: number;
    latestMonthRevenueMn: number;
    prevMonthRevenueMn: number;
    revenueMomDeltaMn: number;
    revenueMomDeltaPct: number | null;

    reportedLimitMn: number | null;
    latestNonFundedMn: number;
    latestRemittanceMn: number;
    latestLmsCrMn: number;
  };
  monthlySeries: {
    months: ReportingMonth[];
    dec25Bf: {
      assets: number;
      liabilities: number;
    };
    assets: Record<ReportingMonth, number>;
    liabilities: Record<ReportingMonth, number>;
    revenue: Record<ReportingMonth, number>;
    nonFunded: Record<ReportingMonth, number>;
    remittance: Record<ReportingMonth, number>;
  };
  products: ComputedProductMetrics[];
  digitalPlatforms: DigitalAccessItem[];
  directors: DirectorLink[];
  recommendations: {
    source: 'openrouter_ai' | 'deterministic_engine';
    model: string;
    generatedAt: string;
    zdrEnforced: boolean;
    items: NextBestProductRecommendation[];
  };
}
