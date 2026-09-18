import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  ChevronDown, 
  Wallet,
  FoldVertical,
  UnfoldVertical,
  CloudCheck,
  Lock
} from 'lucide-react';
import { 
  MonthRecord, 
  MonthMetrics, 
  MONTH_NAMES, 
  EMPTY_METRICS, 
  calculateSalary, 
  formatNumber 
} from './types';
import { getInitialYearData } from './initialData';
import YearSelector from './components/YearSelector';
import MonthCard from './components/MonthCard';
import MonthDrawer from './components/MonthDrawer';
import PinLockScreen from './components/PinLockScreen';
import ThemeSelector from './components/ThemeSelector';
import { THEMES, ThemeDefinition, ThemeId } from './themes';
import { isSessionUnlocked, lockSession } from './lib/security';
import { 
  subscribeYearData, 
  saveYearDataToFirestore, 
  subscribeAvailableYears, 
  saveAvailableYearsToFirestore 
} from './lib/syncService';

const DEFAULT_YEARS = [2027, 2026, 2025, 2024, 2023];

type SeasonFilter = 'ALL' | 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';

interface SeasonTab {
  id: SeasonFilter;
  label: string;
  dotColor: string;
  activeClass: string;
  inactiveClass: string;
}

const SEASON_TABS: SeasonTab[] = [
  {
    id: 'ALL',
    label: 'All Months',
    dotColor: 'bg-gray-500',
    activeClass: 'bg-gray-900 text-white shadow-xs',
    inactiveClass: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  },
  {
    id: 'SPRING',
    label: 'Spring',
    dotColor: 'bg-emerald-500',
    activeClass: 'bg-emerald-600 text-white shadow-xs',
    inactiveClass: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  },
  {
    id: 'SUMMER',
    label: 'Summer',
    dotColor: 'bg-amber-500',
    activeClass: 'bg-amber-600 text-white shadow-xs',
    inactiveClass: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  },
  {
    id: 'AUTUMN',
    label: 'Autumn',
    dotColor: 'bg-orange-500',
    activeClass: 'bg-orange-600 text-white shadow-xs',
    inactiveClass: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  },
  {
    id: 'WINTER',
    label: 'Winter',
    dotColor: 'bg-sky-500',
    activeClass: 'bg-sky-600 text-white shadow-xs',
    inactiveClass: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  },
];

export default function App() {
  // Check if session has been unlocked via PIN 9309
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => isSessionUnlocked());

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>(() => {
    const saved = localStorage.getItem('mmv_available_years_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_YEARS;
  });

  // Selected Theme state (default: 'main' / 0. this theme)
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('mmv_current_theme');
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved as ThemeId;
    }
    return 'main';
  });

  const currentTheme: ThemeDefinition = useMemo(() => {
    return THEMES.find((t) => t.id === currentThemeId) || THEMES[0];
  }, [currentThemeId]);

  const handleSelectTheme = (theme: ThemeDefinition) => {
    setCurrentThemeId(theme.id);
    localStorage.setItem('mmv_current_theme', theme.id);
  };

  const [isAnnualSummaryOpen, setIsAnnualSummaryOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<SeasonFilter>('ALL');
  const [activeDrawerMonth, setActiveDrawerMonth] = useState<MonthRecord | null>(null);
  const [globalCollapsedTrigger, setGlobalCollapsedTrigger] = useState<boolean | null>(null);

  // Initialize data per year in localStorage with real historical figures
  const [yearData, setYearData] = useState<Record<number, MonthRecord[]>>(() => {
    const saved = localStorage.getItem('mmv_salary_records_v5');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return getInitialYearData();
  });

  // Subscribe to real-time available years in Firestore
  useEffect(() => {
    const unsubscribe = subscribeAvailableYears(availableYears, (updatedYears) => {
      setAvailableYears(updatedYears);
      localStorage.setItem('mmv_available_years_v1', JSON.stringify(updatedYears));
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to active year data in Firestore
  useEffect(() => {
    const unsubscribe = subscribeYearData(selectedYear, (cloudMonths) => {
      setYearData((prev) => ({
        ...prev,
        [selectedYear]: cloudMonths,
      }));
    });
    return () => unsubscribe();
  }, [selectedYear]);

  // Persist locally
  useEffect(() => {
    localStorage.setItem('mmv_salary_records_v5', JSON.stringify(yearData));
  }, [yearData]);

  const handleCreateYear = (year: number) => {
    if (!availableYears.includes(year)) {
      const updated = [...availableYears, year];
      setAvailableYears(updated);
      setSelectedYear(year);
      localStorage.setItem('mmv_available_years_v1', JSON.stringify(updated));
      saveAvailableYearsToFirestore(updated);
    } else {
      setSelectedYear(year);
    }
  };

  // Get months array for selected year
  const months = useMemo<MonthRecord[]>(() => {
    if (yearData[selectedYear] && yearData[selectedYear].length === 12) {
      return yearData[selectedYear];
    }
    return MONTH_NAMES.map((name, index) => ({
      id: `${selectedYear}-${String(index + 1).padStart(2, '0')}`,
      name,
      shortName: name.slice(0, 3),
      monthIndex: index,
      metrics: { ...EMPTY_METRICS },
    }));
  }, [yearData, selectedYear]);

  // Update metrics for a month and broadcast to Firestore
  const handleUpdateMonthMetrics = (monthId: string, updatedMetrics: MonthMetrics) => {
    const currentYearMonths = yearData[selectedYear] || months;
    const updatedMonths = currentYearMonths.map((m) =>
      m.id === monthId ? { ...m, metrics: updatedMetrics } : m
    );

    setYearData((prev) => ({
      ...prev,
      [selectedYear]: updatedMonths,
    }));

    saveYearDataToFirestore(selectedYear, updatedMonths);

    setActiveDrawerMonth((prev) => (prev && prev.id === monthId ? { ...prev, metrics: updatedMetrics } : prev));
  };

  const handleLockSession = () => {
    lockSession();
    setIsUnlocked(false);
  };

  // Seasons Filter
  const filteredMonths = useMemo(() => {
    if (selectedSeason === 'SPRING') {
      return months.filter((m) => m.monthIndex >= 2 && m.monthIndex <= 4);
    }
    if (selectedSeason === 'SUMMER') {
      return months.filter((m) => m.monthIndex >= 5 && m.monthIndex <= 7);
    }
    if (selectedSeason === 'AUTUMN') {
      return months.filter((m) => m.monthIndex >= 8 && m.monthIndex <= 10);
    }
    if (selectedSeason === 'WINTER') {
      return months.filter((m) => m.monthIndex === 11 || m.monthIndex === 0 || m.monthIndex === 1);
    }
    return months;
  }, [months, selectedSeason]);

  // Annual Totals
  const annualSummary = useMemo(() => {
    return months.reduce(
      (acc, curr) => {
        const c = calculateSalary(curr.metrics);
        return {
          totalAmount: acc.totalAmount + c.amount,
          totalBonus: acc.totalBonus + c.bonus,
          totalGross: acc.totalGross + c.overall,
          totalTax: acc.totalTax + c.tax,
          totalNet: acc.totalNet + c.net,
        };
      },
      { totalAmount: 0, totalBonus: 0, totalGross: 0, totalTax: 0, totalNet: 0 }
    );
  }, [months]);

  if (!isUnlocked) {
    return <PinLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} ${currentTheme.textPrimary} font-sans selection:bg-purple-100 flex flex-col w-full transition-colors duration-200`}>
      {/* Background Blobs for styles that use them */}
      {currentTheme.hasBlobs && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] bg-[#EAF5EC] rounded-full blur-3xl opacity-60"></div>
          <div className="absolute top-[5%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#EFEAFE] rounded-full blur-3xl opacity-65"></div>
        </div>
      )}

      {/* Full Width Container with ultra-compact vertical padding to prevent scrolling */}
      <div className="w-full px-2.5 sm:px-5 py-1 sm:py-1.5 flex flex-col">
        
        {/* Compact Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 pb-1.5 mb-1.5 border-b border-gray-200/70">
          {/* Left: Themes selector placed directly BEFORE MMV Salary word */}
          <div className="flex items-center gap-2">
            <ThemeSelector
              currentThemeId={currentThemeId}
              onSelectTheme={handleSelectTheme}
              buttonClass={currentTheme.buttonClass}
            />
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight">
              MMV Salary
            </h1>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {/* Real-time Cloud Sync Indicator (Icon only, no text) */}
            <div 
              title="Cloud Sync Active (Real-time Firestore)"
              className="w-7.5 h-7.5 sm:w-8 sm:h-8 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/80 shadow-2xs"
            >
              <CloudCheck size={14} className="text-emerald-600" strokeWidth={2} />
            </div>

            {/* Annual Overview Pill Button */}
            <button
              id="annual-overview-toggle-btn"
              onClick={() => setIsAnnualSummaryOpen(!isAnnualSummaryOpen)}
              className={`flex items-center gap-1.5 px-3 py-1 ${currentTheme.buttonClass} text-xs font-medium ${currentTheme.pillRadius} transition-colors duration-150 ease-linear cursor-pointer`}
            >
              <TrendingUp size={13} strokeWidth={2} />
              <span className="font-semibold tracking-tight">Annual Overview</span>
              <motion.div 
                animate={{ rotate: isAnnualSummaryOpen ? 180 : 0 }}
                transition={{ duration: 0.15, ease: 'linear' }}
              >
                <ChevronDown size={12} />
              </motion.div>
            </button>

            {/* Year Selector with custom year creation */}
            <YearSelector
              selectedYear={selectedYear}
              years={availableYears}
              onSelectYear={setSelectedYear}
              onCreateYear={handleCreateYear}
            />

            {/* Lock Session Button (Icon only matching button size) */}
            <button
              id="lock-app-btn"
              title="Lock Screen"
              onClick={handleLockSession}
              className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full transition-colors flex items-center justify-center cursor-pointer border ${currentTheme.buttonClass}`}
              aria-label="Lock screen"
            >
              <Lock size={14} strokeWidth={2} />
            </button>
          </div>
        </header>

        {/* Collapsible Annual Overview Panel */}
        <AnimatePresence>
          {isAnnualSummaryOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'linear' }}
              className="overflow-hidden mb-1.5"
            >
              <div className={`${currentTheme.cardClass} ${currentTheme.cardRadius} p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                    {selectedYear} Financial Overview
                  </h2>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 ${currentTheme.pillRadius} ${currentTheme.accentClass}`}>
                    12 Months Combined
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/5">
                    <div className="text-[11px] font-medium opacity-70 mb-0.5 flex items-center gap-1">
                      <Wallet size={11} className="text-blue-500" strokeWidth={2} />
                      Total Amount
                    </div>
                    <div className="text-base sm:text-lg font-bold font-mono">
                      {formatNumber(annualSummary.totalAmount)}
                    </div>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/5">
                    <div className="text-[11px] font-medium opacity-70 mb-0.5 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-500" strokeWidth={2} />
                      Total Bonus
                    </div>
                    <div className="text-base sm:text-lg font-bold text-amber-600 font-mono">
                      {formatNumber(annualSummary.totalBonus)}
                    </div>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/5">
                    <div className="text-[11px] font-medium opacity-70 mb-0.5 flex items-center gap-1">
                      <span className="text-red-500 font-mono font-bold text-[10px]">-12%</span>
                      Total Tax
                    </div>
                    <div className="text-base sm:text-lg font-bold text-red-600 font-mono">
                      -{formatNumber(annualSummary.totalTax)}
                    </div>
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-black/5">
                    <div className="text-[11px] font-medium opacity-70 mb-0.5 flex items-center gap-1">
                      <ShieldCheck size={11} className="text-emerald-600" strokeWidth={2} />
                      Total Net
                    </div>
                    <div className="text-base sm:text-lg font-bold text-emerald-600 font-mono">
                      {formatNumber(annualSummary.totalNet)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Bar: Seasons with matching colors & Collapse Controls */}
        <div className="mb-1.5 sm:mb-2 flex flex-wrap items-center justify-between gap-1.5">
          {/* Seasons Pills with Matching Colors */}
          <div className="flex items-center gap-0.5 bg-white/90 p-0.5 rounded-full shadow-xs border border-gray-200/90">
            {SEASON_TABS.map((season) => {
              const isActive = selectedSeason === season.id;
              return (
                <button
                  key={season.id}
                  id={`season-filter-${season.id.toLowerCase()}`}
                  onClick={() => setSelectedSeason(season.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all duration-150 ease-linear cursor-pointer flex items-center gap-1 ${
                    isActive ? season.activeClass : season.inactiveClass
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${season.dotColor}`}></span>
                  <span>{season.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Collapse / Expand All */}
          <div className="flex items-center gap-0.5 bg-white/90 p-0.5 rounded-full border border-gray-200/90 shadow-xs">
            <button
              id="collapse-all-btn"
              onClick={() => setGlobalCollapsedTrigger(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 ease-linear cursor-pointer"
              title="Collapse all cards to close compact mode"
            >
              <FoldVertical size={12} strokeWidth={2} />
              <span>Collapse All</span>
            </button>
            <button
              id="expand-all-btn"
              onClick={() => setGlobalCollapsedTrigger(false)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-150 ease-linear cursor-pointer"
              title="Expand all cards"
            >
              <UnfoldVertical size={12} strokeWidth={2} />
              <span>Expand All</span>
            </button>
          </div>
        </div>

        {/* 12 Months Responsive Grid */}
        <div 
          key={`grid-${selectedYear}-${selectedSeason}-${globalCollapsedTrigger !== null ? String(globalCollapsedTrigger) : 'normal'}`}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 content-start items-start"
        >
          {filteredMonths.map((month) => (
            <MonthCard
              key={month.id}
              month={month}
              year={selectedYear}
              defaultCollapsed={globalCollapsedTrigger !== null ? globalCollapsedTrigger : false}
              theme={currentTheme}
              onOpenDrawer={(m) => setActiveDrawerMonth(m)}
            />
          ))}
        </div>

      </div>

      {/* Slide-over Drawer for Parameter Adjustments */}
      <MonthDrawer
        month={activeDrawerMonth}
        isOpen={Boolean(activeDrawerMonth)}
        onClose={() => setActiveDrawerMonth(null)}
        onUpdateMetrics={handleUpdateMonthMetrics}
      />
    </div>
  );
}
