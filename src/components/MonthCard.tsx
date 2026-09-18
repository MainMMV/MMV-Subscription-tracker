import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronUp,
  SlidersHorizontal, 
  TrendingUp, 
  Sparkles, 
  Wallet, 
  ShieldCheck,
  Layers
} from 'lucide-react';
import { MonthRecord, calculateSalary, formatNumber } from '../types';
import { ThemeDefinition } from '../themes';

interface MonthCardProps {
  key?: string | number;
  month: MonthRecord;
  onOpenDrawer: (month: MonthRecord) => void;
  year: number;
  defaultCollapsed?: boolean;
  theme?: ThemeDefinition;
}

export default function MonthCard({ 
  month, 
  onOpenDrawer, 
  year,
  defaultCollapsed = false,
  theme
}: MonthCardProps) {
  // Full collapsing state: when true, ONLY 01/2026 and 3 icons are shown
  const [isFullyCollapsed, setIsFullyCollapsed] = useState(defaultCollapsed);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  useEffect(() => {
    setIsFullyCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);

  const calc = calculateSalary(month.metrics);
  const metrics = month.metrics;

  const monthNumStr = String(month.monthIndex + 1).padStart(2, '0');
  const monthYearLabel = `${monthNumStr}/${year}`;

  // Season-matching badge palette
  const getSeasonAccent = (idx: number) => {
    if (idx === 11 || idx === 0 || idx === 1) {
      // Winter (Dec, Jan, Feb)
      return { badge: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' };
    }
    if (idx >= 2 && idx <= 4) {
      // Spring (Mar, Apr, May)
      return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' };
    }
    if (idx >= 5 && idx <= 7) {
      // Summer (Jun, Jul, Aug)
      return { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
    }
    // Autumn (Sep, Oct, Nov)
    return { badge: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' };
  };

  const accent = getSeasonAccent(month.monthIndex);

  const handleToggleExpandInfo = () => {
    if (isFullyCollapsed) {
      setIsFullyCollapsed(false);
      setIsInfoExpanded(true);
    } else {
      setIsInfoExpanded(!isInfoExpanded);
    }
  };

  const cardBgClass = theme?.cardClass || 'bg-white shadow-xs hover:shadow-sm border border-gray-200/90';
  const cardRadius = theme?.cardRadius || 'rounded-2xl sm:rounded-[1.5rem]';
  const textPrimary = theme?.textPrimary || 'text-gray-900';
  const textMuted = theme?.textMuted || 'text-gray-500';

  return (
    <motion.div
      layout
      transition={{ duration: 0.15, ease: 'linear' }}
      className={`${cardBgClass} ${cardRadius} transition-all duration-150 flex flex-col justify-between overflow-hidden relative ${
        isFullyCollapsed ? 'p-2 px-3' : 'p-2.5 sm:p-3'
      }`}
      id={`month-card-${month.id}`}
    >
      {/* Top Header: Always visible. When collapsed, ONLY this header is shown */}
      <div className="flex items-center justify-between gap-1.5">
        {/* Left: 01/2026 Badge and Month Name */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border font-mono tracking-tight shrink-0 ${accent.badge} flex items-center gap-1`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`}></span>
            {monthYearLabel}
          </span>
          <span className={`text-xs font-semibold truncate ${textPrimary}`}>
            {month.name}
          </span>
        </div>

        {/* Right: 3 Action Icons (3rd one is full collapsing) */}
        <div className="flex items-center gap-0.5 shrink-0">
          {/* 1st Icon: Edit / Open Drawer */}
          <button
            id={`btn-drawer-${month.id}`}
            onClick={() => onOpenDrawer(month)}
            className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-gray-50/80 hover:bg-purple-50 text-gray-500 hover:text-purple-600 flex items-center justify-center transition-colors duration-150 ease-linear cursor-pointer"
            title="Edit parameters"
          >
            <SlidersHorizontal size={13} strokeWidth={2} />
          </button>

          {/* 2nd Icon: Expand information */}
          <button
            id={`btn-expand-info-${month.id}`}
            onClick={handleToggleExpandInfo}
            className={`w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-colors duration-150 ease-linear cursor-pointer ${
              !isFullyCollapsed && isInfoExpanded
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-50/80 hover:bg-purple-50 text-gray-500 hover:text-purple-600'
            }`}
            title={isInfoExpanded && !isFullyCollapsed ? 'Hide information' : 'Expand information'}
          >
            <Layers size={13} strokeWidth={2} />
          </button>

          {/* 3rd Icon: Full collapsing toggle */}
          <button
            id={`btn-collapse-${month.id}`}
            onClick={() => setIsFullyCollapsed(!isFullyCollapsed)}
            className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-lg bg-gray-50/80 hover:bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors duration-150 ease-linear cursor-pointer"
            title={isFullyCollapsed ? 'Expand card' : 'Collapse card'}
            aria-expanded={!isFullyCollapsed}
          >
            {isFullyCollapsed ? (
              <ChevronDown size={14} strokeWidth={2} />
            ) : (
              <ChevronUp size={14} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content (Hidden when fully collapsed) */}
      <AnimatePresence initial={false}>
        {!isFullyCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'linear' }}
            className="overflow-hidden flex flex-col pt-1.5 sm:pt-2"
          >
            {/* Calculations in Card Format: Amount, Bonus, Overall Gross */}
            <div className="space-y-1 mb-2">
              {/* Amount */}
              <div className="flex items-center justify-between py-0.5 border-b border-gray-100/70">
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${textMuted}`}>
                  <Wallet size={12} className="text-blue-500" strokeWidth={2} />
                  Amount
                </span>
                <span className={`text-xs font-bold tracking-tight font-mono ${textPrimary}`}>
                  {formatNumber(calc.amount)}
                </span>
              </div>

              {/* Bonus */}
              <div className="flex items-center justify-between py-0.5 border-b border-gray-100/70">
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${textMuted}`}>
                  <Sparkles size={12} className="text-amber-500" strokeWidth={2} />
                  Bonus
                </span>
                <span className="text-xs font-bold text-amber-600 tracking-tight font-mono">
                  {formatNumber(calc.bonus)}
                </span>
              </div>

              {/* Overall Gross */}
              <div className="flex items-center justify-between py-0.5">
                <span className={`text-[11px] font-bold flex items-center gap-1 ${textPrimary}`}>
                  <TrendingUp size={12} className="text-purple-600" strokeWidth={2} />
                  Overall Gross
                </span>
                <span className={`text-xs sm:text-sm font-extrabold tracking-tight font-mono ${textPrimary}`}>
                  {formatNumber(calc.overall)}
                </span>
              </div>
            </div>

            {/* Optional Detailed Parameters Breakdown (toggled via 2nd Expand Info button) */}
            <AnimatePresence>
              {isInfoExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'linear' }}
                  className="overflow-hidden mb-2 bg-gray-50/80 rounded-lg p-2 border border-gray-150 text-[10px] space-y-1"
                >
                  <div className="font-bold text-gray-500 uppercase tracking-wider text-[9px] pb-0.5 border-b border-gray-200/60 flex items-center justify-between">
                    <span>Detailed Breakdown</span>
                    <span className="text-purple-600">Parameters</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-gray-600">
                    <div className="flex justify-between">
                      <span>Completed Apps:</span>
                      <span className="font-semibold text-gray-900 font-mono">{metrics.completedApps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Range 0-5:</span>
                      <span className="font-semibold text-gray-900 font-mono">{metrics.range0_5}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retail:</span>
                      <span className="font-semibold text-gray-900 font-mono">{metrics.retail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Refused:</span>
                      <span className="font-semibold text-gray-900 font-mono">{metrics.refused}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus Points:</span>
                      <span className="font-semibold text-gray-900 font-mono">{formatNumber(metrics.bonusPoints)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Promotion:</span>
                      <span className="font-semibold text-gray-900 font-mono">{metrics.promotion}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card Bottom: -12% Tax Deduction and Net Income */}
            <div className="pt-1.5 border-t border-gray-100">
              <div className="bg-gray-50/90 rounded-lg p-2 flex flex-col gap-1">
                {/* -12% Tax Deduction */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-gray-500 flex items-center gap-1">
                    <span className="px-1 py-0.2 rounded bg-red-50 text-red-600 font-mono font-bold text-[9px]">
                      -12%
                    </span>
                    Tax Deduction
                  </span>
                  <span className="font-semibold text-red-600 font-mono text-[11px]">
                    -{formatNumber(calc.tax)}
                  </span>
                </div>

                {/* Net Income */}
                <div className="flex items-center justify-between pt-0.5 border-t border-gray-200/50">
                  <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-600" strokeWidth={2} />
                    Net Income
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-emerald-700 tracking-tight font-mono">
                    {formatNumber(calc.net)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
