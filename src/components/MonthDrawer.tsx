import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, RefreshCw, Layers, Check } from 'lucide-react';
import { MonthRecord, MonthMetrics, calculateSalary, formatNumber } from '../types';

interface MonthDrawerProps {
  month: MonthRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateMetrics: (monthId: string, updated: MonthMetrics) => void;
  onCopyFromPrevious?: (targetMonthId: string) => void;
  hasPreviousMonth?: boolean;
}

export default function MonthDrawer({
  month,
  isOpen,
  onClose,
  onUpdateMetrics,
  onCopyFromPrevious,
  hasPreviousMonth,
}: MonthDrawerProps) {
  if (!month) return null;

  const metrics = month.metrics;
  const calc = calculateSalary(metrics);

  const handleFieldChange = (key: keyof MonthMetrics, val: number) => {
    onUpdateMetrics(month.id, {
      ...metrics,
      [key]: isNaN(val) ? 0 : val,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 transition-opacity"
            id="month-drawer-backdrop"
          />

          {/* Drawer Body - Compact Google Labs style */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'linear' }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md sm:max-w-lg bg-white z-50 shadow-2xl flex flex-col border-l border-gray-150 overflow-hidden"
            id={`month-drawer-${month.id}`}
          >
            {/* Drawer Header - Compact */}
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-600 mb-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                  Month Parameters
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                  {month.name}
                </h2>
              </div>
              <button
                id="drawer-close-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-4 py-1.5 sm:px-5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Edit parameters to update calculations</span>
              {hasPreviousMonth && onCopyFromPrevious && (
                <button
                  id="drawer-copy-prev-btn"
                  onClick={() => onCopyFromPrevious(month.id)}
                  className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold transition-colors cursor-pointer"
                >
                  <RefreshCw size={11} />
                  Copy from prev month
                </button>
              )}
            </div>

            {/* Compact Form Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2.5 sm:px-5 sm:py-3 space-y-2.5 sm:space-y-3 custom-scrollbar">
              {/* Primary Volumes */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 tracking-tight">
                    Volume & Ranges
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <DrawerInput
                    id="input-range-0-5"
                    label="0-5"
                    multiplier="20 000"
                    rate={20000}
                    value={metrics.range0_5}
                    onChange={(v) => handleFieldChange('range0_5', v)}
                  />
                  <DrawerInput
                    id="input-range-6-10"
                    label="6-10"
                    multiplier="12 000"
                    rate={12000}
                    value={metrics.range6_10}
                    onChange={(v) => handleFieldChange('range6_10', v)}
                  />
                  <DrawerInput
                    id="input-range-11-20"
                    label="11-20"
                    multiplier="5 000"
                    rate={5000}
                    value={metrics.range11_20}
                    onChange={(v) => handleFieldChange('range11_20', v)}
                  />
                  <DrawerInput
                    id="input-completed-apps"
                    label="Completed Apps"
                    multiplier="12 000"
                    rate={12000}
                    value={metrics.completedApps}
                    onChange={(v) => handleFieldChange('completedApps', v)}
                  />
                </div>
              </div>

              {/* Adjustments */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 tracking-tight">
                    Adjustments & Clients
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <DrawerInput
                    id="input-refused"
                    label="Refused (Отказанный)"
                    multiplier="5 000"
                    rate={5000}
                    value={metrics.refused}
                    onChange={(v) => handleFieldChange('refused', v)}
                  />
                  <DrawerInput
                    id="input-retail"
                    label="Retail (Розничные)"
                    multiplier="2 000"
                    rate={2000}
                    value={metrics.retail}
                    onChange={(v) => handleFieldChange('retail', v)}
                  />
                  <div className="col-span-2">
                    <DrawerInput
                      id="input-unfinished"
                      label="Unfinished (Незавершённые)"
                      multiplier="-20 000"
                      rate={20000}
                      value={metrics.unfinished}
                      isDeduction
                      onChange={(v) => handleFieldChange('unfinished', v)}
                    />
                  </div>
                </div>
              </div>

              {/* Bonus Section */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-bold">
                    3
                  </div>
                  <h3 className="text-xs font-bold text-gray-900 tracking-tight flex items-center gap-1">
                    Bonus & Promotions
                    <Sparkles size={12} className="text-amber-500" />
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <DrawerInput
                    id="input-bonus-points"
                    label="Bonus Points (Баллы)"
                    multiplier="1x"
                    rate={1}
                    value={metrics.bonusPoints}
                    allowDecimals
                    onChange={(v) => handleFieldChange('bonusPoints', v)}
                  />
                  <DrawerInput
                    id="input-promotion"
                    label="Promotion (Акция)"
                    multiplier="12 000"
                    rate={12000}
                    value={metrics.promotion}
                    onChange={(v) => handleFieldChange('promotion', v)}
                  />
                </div>
              </div>
            </div>

            {/* Drawer Calculation Preview Footer - Compact */}
            <div className="p-3 sm:p-3.5 bg-gray-50/90 border-t border-gray-150 flex flex-col gap-2">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Instant Calculation Breakdown
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                <div className="bg-white p-2 rounded-xl border border-gray-200/60">
                  <div className="text-[10px] text-gray-400 font-medium">Amount</div>
                  <div className="font-bold text-gray-900 text-xs sm:text-sm font-mono truncate">
                    {formatNumber(calc.amount)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-200/60">
                  <div className="text-[10px] text-gray-400 font-medium">Bonus</div>
                  <div className="font-bold text-amber-600 text-xs sm:text-sm font-mono truncate">
                    {formatNumber(calc.bonus)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-200/60">
                  <div className="text-[10px] text-gray-400 font-medium">Gross</div>
                  <div className="font-bold text-gray-900 text-xs sm:text-sm font-mono truncate">
                    {formatNumber(calc.overall)}
                  </div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-200/60">
                  <div className="text-[10px] text-red-500 font-medium">-12% Tax</div>
                  <div className="font-bold text-red-600 text-xs sm:text-sm font-mono truncate">
                    -{formatNumber(calc.tax)}
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/90 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Net Income (After Tax)
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-700 tracking-tight font-mono">
                    {formatNumber(calc.net)}
                  </div>
                </div>
                <button
                  id="drawer-save-btn"
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  Done
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

interface DrawerInputProps {
  id: string;
  label: string;
  multiplier: string;
  rate: number;
  value: number;
  onChange: (val: number) => void;
  isDeduction?: boolean;
  allowDecimals?: boolean;
}

function DrawerInput({ id, label, multiplier, rate, value, onChange, isDeduction, allowDecimals }: DrawerInputProps) {
  const calcTotal = Math.round((value || 0) * rate * 100) / 100;

  return (
    <div className="flex flex-col bg-gray-50/60 hover:bg-gray-50 px-2.5 py-1.5 rounded-xl border border-gray-200/80 transition-all focus-within:border-purple-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/10">
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <label htmlFor={id} className="text-[11px] font-semibold text-gray-700 truncate">
          {label}
        </label>
        <span
          className={`text-[9px] font-mono font-medium px-1 py-0.2 rounded shrink-0 ${
            isDeduction
              ? 'bg-red-50 text-red-600'
              : 'bg-white text-gray-500 border border-gray-200'
          }`}
        >
          {multiplier}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1.5">
        <input
          id={id}
          type="number"
          step="any"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="min-w-0 flex-1 bg-transparent font-bold text-gray-900 text-sm outline-none placeholder:text-gray-300 py-0"
        />

        {/* Calculation display directly below the multiplier - showing only the calculated amount with space separator */}
        <div className="text-right shrink-0 flex items-center select-none">
          <span
            className={`text-xs sm:text-[13px] font-mono font-bold ${
              isDeduction && calcTotal > 0 ? 'text-red-600' : 'text-purple-700'
            }`}
          >
            {isDeduction && calcTotal > 0 ? '-' : ''}{formatNumber(calcTotal, allowDecimals)}
          </span>
        </div>
      </div>
    </div>
  );
}
