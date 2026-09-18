import { useState, useRef, useEffect, FormEvent } from 'react';
import { Calendar, ChevronDown, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface YearSelectorProps {
  selectedYear: number;
  years: number[];
  onSelectYear: (year: number) => void;
  onCreateYear: (year: number) => void;
}

export default function YearSelector({
  selectedYear,
  years,
  onSelectYear,
  onCreateYear,
}: YearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setErrorMsg('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort years from High to Low (descending)
  const sortedYears = [...years].sort((a, b) => b - a);

  const handleAddYear = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const yr = parseInt(newYearInput.trim(), 10);
    if (isNaN(yr) || yr < 1900 || yr > 2200) {
      setErrorMsg('Enter a valid year (1900-2200)');
      return;
    }
    setErrorMsg('');
    onCreateYear(yr);
    setNewYearInput('');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef} id="year-selector-container">
      {/* Year Pill Button matching screenshot exactly */}
      <button
        id="year-selector-toggle-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          setErrorMsg('');
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-gray-50 text-gray-800 text-xs font-medium rounded-full border border-gray-200/90 shadow-xs transition-colors duration-150 ease-linear cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
          <Calendar size={12} strokeWidth={2.2} />
        </div>
        <span className="font-semibold text-gray-900 tracking-tight">Year {selectedYear}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.15, ease: 'linear' }}
        >
          <ChevronDown size={13} className="text-gray-400" />
        </motion.div>
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'linear' }}
            className="absolute right-0 mt-1 z-50 bg-white rounded-2xl shadow-xl border border-gray-150 p-2.5 min-w-[210px]"
            id="year-selector-dropdown"
          >
            {/* Create New Year Form */}
            <div className="pb-2 mb-2 border-b border-gray-100">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1.5">
                Add Custom Year
              </div>
              <form onSubmit={handleAddYear} className="flex items-center gap-1.5 px-1">
                <input
                  ref={inputRef}
                  type="number"
                  placeholder="e.g. 2028 or 2021"
                  value={newYearInput}
                  onChange={(e) => {
                    setNewYearInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-900 outline-none focus:border-purple-400 focus:bg-white transition-all duration-150 ease-linear placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  id="add-year-submit-btn"
                  className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors duration-150 ease-linear shrink-0"
                  title="Create Year"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </form>
              {errorMsg && (
                <div className="text-[11px] text-red-500 font-medium px-2 mt-1">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Years List Header */}
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
              <span>Select Year</span>
            </div>

            {/* Scrollable list of years ordered high to low */}
            <div className="space-y-0.5 max-h-52 overflow-y-auto custom-scrollbar pr-0.5">
              {sortedYears.map((yr) => (
                <button
                  key={yr}
                  id={`year-option-${yr}`}
                  onClick={() => {
                    onSelectYear(yr);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-xl transition-all duration-150 ease-linear font-medium ${
                    selectedYear === yr
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{yr}</span>
                  {selectedYear === yr && <Check size={14} className="text-purple-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
