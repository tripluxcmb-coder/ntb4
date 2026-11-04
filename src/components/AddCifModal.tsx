import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { CustomerDashboardSummary } from '../types/banking';

interface AddCifModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newDashboard: CustomerDashboardSummary) => void;
}

export const AddCifModal: React.FC<AddCifModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [cif, setCif] = useState('');
  const [legalName, setLegalName] = useState('');
  const [sector, setSector] = useState('Export Manufacturing & Logistics');
  const [description, setDescription] = useState('');
  const [latestAssetsMn, setLatestAssetsMn] = useState('420.50');
  const [latestLiabilitiesMn, setLatestLiabilitiesMn] = useState('95.25');
  const [ytdRevenueMn, setYtdRevenueMn] = useState('14.80');
  const [reportedLimitMn, setReportedLimitMn] = useState('650.00');
  const [nde, setNde] = useState(false);
  const [frimi, setFrimi] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoadPreset = () => {
    setCif('51890450');
    setLegalName('Singer (Sri Lanka) PLC');
    setSector('Consumer Durables, Retail & Financial Services');
    setDescription(
      'Sri Lanka’s largest consumer electronics and home appliances retailer (CSE: SINS.N0000) with 400+ retail showrooms and islandwide dealer distribution.'
    );
    setLatestAssetsMn('1840.00');
    setLatestLiabilitiesMn('315.40');
    setYtdRevenueMn('58.20');
    setReportedLimitMn('2500.00');
    setNde(true);
    setFrimi(true);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCif = cif.trim();
    const trimmedName = legalName.trim();

    if (!/^\d{6,10}$/.test(trimmedCif)) {
      setErrorMsg('CIF must be a 6 to 10 digit numeric identifier (e.g., 51890450).');
      return;
    }
    if (!trimmedName) {
      setErrorMsg('Customer Legal Name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cif: trimmedCif,
          legalName: trimmedName,
          sector,
          description:
            description.trim() ||
            `${trimmedName} is an institutional corporate banking client of Nations Trust Bank operating in the ${sector} sector.`,
          latestAssetsMn: Number(latestAssetsMn),
          latestLiabilitiesMn: Number(latestLiabilitiesMn),
          ytdRevenueMn: Number(ytdRevenueMn),
          reportedLimitMn: Number(reportedLimitMn),
          nde,
          frimi,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Could not create CIF profile.');
        setIsSubmitting(false);
        return;
      }

      onCreated(data as CustomerDashboardSummary);
      onClose();
    } catch {
      setErrorMsg('Network error while saving CIF snapshot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-cif-modal-title"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              CIF Snapshot Onboarding · CIF_main.csv & CIF_Balance.csv
            </div>
            <h2
              id="add-cif-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              Add New Customer CIF & Generate 360° Brief
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Add CIF Modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Want to test with a pre-filled corporate CIF extract?
            </span>
            <button
              type="button"
              onClick={handleLoadPreset}
              className="text-xs font-semibold text-rose-800 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Load Sample (Singer Sri Lanka · CIF 51890450)
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-800 dark:text-rose-300"
            >
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-cif-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Customer CIF Number *
              </label>
              <input
                id="new-cif-input"
                type="text"
                placeholder="e.g. 51890450"
                value={cif}
                onChange={(e) => setCif(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="new-legal-name-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Company Legal Name *
              </label>
              <input
                id="new-legal-name-input"
                type="text"
                placeholder="e.g. Singer (Sri Lanka) PLC"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="new-sector-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Industry Sector
            </label>
            <input
              id="new-sector-input"
              type="text"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label
                htmlFor="new-assets-input"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
              >
                Avg Assets (LKR Mn)
              </label>
              <input
                id="new-assets-input"
                type="number"
                step="0.01"
                value={latestAssetsMn}
                onChange={(e) => setLatestAssetsMn(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="new-liab-input"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
              >
                Avg Deposits (LKR Mn)
              </label>
              <input
                id="new-liab-input"
                type="number"
                step="0.01"
                value={latestLiabilitiesMn}
                onChange={(e) => setLatestLiabilitiesMn(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="new-rev-input"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
              >
                YTD Revenue (LKR Mn)
              </label>
              <input
                id="new-rev-input"
                type="number"
                step="0.01"
                value={ytdRevenueMn}
                onChange={(e) => setYtdRevenueMn(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="new-limit-input"
                className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
              >
                CIF Limit (LKR Mn)
              </label>
              <input
                id="new-limit-input"
                type="number"
                step="0.01"
                value={reportedLimitMn}
                onChange={(e) => setReportedLimitMn(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="new-desc-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Company Brief Description
            </label>
            <textarea
              id="new-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Concise company background and operations summary..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={nde}
                onChange={(e) => setNde(e.target.checked)}
                className="rounded border-slate-300"
              />
              Nations Direct Enterprise (NDE) Registered
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={frimi}
                onChange={(e) => setFrimi(e.target.checked)}
                className="rounded border-slate-300"
              />
              FriMi Ecosystem Registered
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {isSubmitting ? 'Generating View...' : 'Add CIF & Generate 360° View'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
