import { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { THEMES, ThemeDefinition, ThemeId } from '../themes';

interface ThemeSelectorProps {
  currentThemeId: ThemeId;
  onSelectTheme: (theme: ThemeDefinition) => void;
  buttonClass?: string;
}

export default function ThemeSelector({ currentThemeId, onSelectTheme, buttonClass }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES.find((t) => t.id === currentThemeId) || THEMES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const btnStyle = buttonClass || 'bg-white hover:bg-gray-50 text-gray-800 border-gray-200/90 shadow-xs';

  return (
    <div className="relative inline-block" ref={dropdownRef} id="theme-selector-container">
      {/* Theme Icon Button - One Palette Icon with button dimensions matching the header */}
      <button
        id="theme-selector-toggle-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${btnStyle} focus:outline-none`}
        title={`Theme: ${currentTheme.name} (${currentTheme.index})`}
        aria-label="Select Theme"
      >
        <Palette size={15} className="text-purple-600" strokeWidth={2} />
      </button>

      {/* Theme Picker Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12, ease: 'linear' }}
            className="absolute left-0 mt-1.5 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-gray-200/90 py-2 z-50 overflow-hidden font-sans text-left max-h-[75vh] flex flex-col"
          >
            <div className="px-3.5 py-1.5 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Palette size={13} className="text-purple-500" strokeWidth={2} />
                Themes ({THEMES.length})
              </span>
              <span className="text-[10px] font-mono font-medium text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded">
                Live Preview
              </span>
            </div>

            <div className="overflow-y-auto py-1 flex-1 space-y-0.5 px-1.5">
              {THEMES.map((theme) => {
                const Icon = theme.icon;
                const isSelected = theme.id === currentThemeId;

                return (
                  <button
                    key={theme.id}
                    id={`theme-option-${theme.id}`}
                    type="button"
                    onClick={() => {
                      onSelectTheme(theme);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 text-purple-900 font-bold shadow-2xs'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-[10px] font-mono text-gray-400 w-4 text-right">
                        {theme.index}.
                      </span>
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        <Icon size={13} strokeWidth={2} />
                      </div>
                      <span className="truncate">{theme.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${
                          isSelected
                            ? 'bg-purple-200 text-purple-800'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {theme.badge}
                      </span>
                      {isSelected && <Check size={13} className="text-purple-600" strokeWidth={2.5} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
