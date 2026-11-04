(() => {
  const state = {
    cif: null,
    dashboard: null,
    basis: 'monthly', // 'monthly' | 'vs_bf'
    chartMode: 'assets', // 'assets' | 'liabilities' | 'revenue'
    selectedProduct: 'ALL',
  };

  const fmtMn = (v, d = 2) =>
    v === null || v === undefined || Number.isNaN(Number(v))
      ? 'Not supplied'
      : Number(v).toLocaleString('en-US', {
          minimumFractionDigits: d,
          maximumFractionDigits: d,
        });

  const fmtSigned = (v, d = 2) => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
    const n = Number(v);
    const sign = n > 0 ? '+' : n < 0 ? '−' : '';
    return `${sign}${Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    })}`;
  };

  async function fetchJson(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'RelationshipDashboard',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function renderDashboard() {
    const d = state.dashboard;
    if (!d) return;

    const p = d.profile || {};
    const c = d.company || {};
    document.getElementById('customer-cif-badge').textContent = `CIF ${p.cif || state.cif}`;
    document.getElementById('customer-industry').textContent = c.industry || c.sector || 'Corporate Banking';
    document.getElementById('reporting-month-label').textContent = p.reporting_month || 'Sep-26';
    document.getElementById('company-name').textContent = c.name || p.name || state.cif;
    document.getElementById('company-description').textContent = c.description || '';
    document.getElementById('download-brief-link').href = `/brief/${encodeURIComponent(p.cif || state.cif)}?download=1`;

    // KPIs
    const assetsVal = p.assets?.current ?? d.kpis?.latestAssetsMn ?? 0;
    const liabVal = p.liabilities?.current ?? d.kpis?.latestLiabilitiesMn ?? 0;
    const revVal = p.revenue?.ytd ?? d.kpis?.ytdRevenueMn ?? 0;
    const limitVal = p.limit?.reported ?? d.kpis?.reportedLimitMn ?? null;

    document.getElementById('kpi-assets').textContent = `LKR ${fmtMn(assetsVal)} Mn`;
    document.getElementById('kpi-liabilities').textContent = `LKR ${fmtMn(liabVal)} Mn`;
    document.getElementById('kpi-revenue').textContent = `LKR ${fmtMn(revVal)} Mn`;
    document.getElementById('kpi-limit').textContent =
      limitVal !== null ? `LKR ${fmtMn(limitVal)} Mn` : 'Not supplied';

    const assetDelta =
      state.basis === 'monthly'
        ? p.assets?.monthly_change ?? d.kpis?.assetsMomDeltaMn
        : p.assets?.vs_bf ?? d.kpis?.assetsVsBfDeltaMn;
    const liabDelta =
      state.basis === 'monthly'
        ? p.liabilities?.monthly_change ?? d.kpis?.liabilitiesMomDeltaMn
        : p.liabilities?.vs_bf ?? d.kpis?.liabilitiesVsBfDeltaMn;

    document.getElementById('kpi-assets-delta').textContent = `${
      state.basis === 'monthly' ? 'MoM' : 'Vs Dec-25 BF'
    }: ${fmtSigned(assetDelta)} Mn`;
    document.getElementById('kpi-liabilities-delta').textContent = `${
      state.basis === 'monthly' ? 'MoM' : 'Vs Dec-25 BF'
    }: ${fmtSigned(liabDelta)} Mn`;
  }

  async function loadCustomer(cif) {
    try {
      document.getElementById('error-banner').hidden = true;
      const data = await fetchJson(`/api/customer/${encodeURIComponent(cif)}`);
      state.cif = cif;
      state.dashboard = data;
      renderDashboard();
    } catch (err) {
      const banner = document.getElementById('error-banner');
      banner.textContent = err.message;
      banner.hidden = false;
    }
  }

  async function init() {
    try {
      const list = await fetchJson('/api/customers');
      const select = document.getElementById('customer-select');
      const customers = list.customers || [];
      select.innerHTML = customers
        .map((c) => `<option value="${c.cif}">${c.name || c.shortName} — CIF ${c.cif}</option>`)
        .join('');

      if (customers.length > 0) {
        await loadCustomer(customers[0].cif);
      }

      select.addEventListener('change', (e) => loadCustomer(e.target.value));
      document.getElementById('cif-search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = document.getElementById('cif-input').value.trim();
        if (val) loadCustomer(val);
      });
      document.getElementById('basis-monthly').addEventListener('click', () => {
        state.basis = 'monthly';
        renderDashboard();
      });
      document.getElementById('basis-vsbf').addEventListener('click', () => {
        state.basis = 'vs_bf';
        renderDashboard();
      });
      document.getElementById('presentation-btn').addEventListener('click', () => {
        document.body.classList.toggle('presentation-mode');
      });
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
