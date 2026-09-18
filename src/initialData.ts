import { MonthMetrics, EMPTY_METRICS, DEFAULT_SAMPLE_METRICS, MONTH_NAMES, MonthRecord } from './types';

// Pre-seeded statistics directly from the provided financial sheets
export const HISTORICAL_MONTH_METRICS: Record<number, Record<number, Partial<MonthMetrics>>> = {
  // 2024 (Sep - Dec)
  2024: {
    8: { // September (monthIndex 8)
      range0_5: 16,
      range6_10: 13,
      range11_20: 12,
      refused: 15,
      completedApps: 0,
      retail: 6, // 1 bank card + 5 cash
      unfinished: 13.5, // 27 * 10k fine = 270k
      bonusPoints: 225000, // exact rate differences & combined bonus
      promotion: 0,
    },
    9: { // October (monthIndex 9)
      range0_5: 43,
      range6_10: 22,
      range11_20: 20,
      refused: 41,
      completedApps: 0,
      retail: 7, // 2 bank card + 5 cash
      unfinished: 13, // 13 * 20k fine = 260k
      bonusPoints: 302000,
      promotion: 0,
    },
    10: { // November (monthIndex 10)
      range0_5: 63,
      range6_10: 23,
      range11_20: 11,
      refused: 71,
      completedApps: 0,
      retail: 0,
      unfinished: 2, // 2 * 20k fine = 40k
      bonusPoints: 0,
      promotion: 0,
    },
    11: { // December (monthIndex 11)
      range0_5: 77,
      range6_10: 23,
      range11_20: 25,
      refused: 59,
      completedApps: 24, // Seller 24
      retail: 0,
      unfinished: 6, // 6 * 20k fine = 120k
      bonusPoints: 0,
      promotion: 0,
    },
  },

  // 2025 (Full Year: Jan - Dec)
  2025: {
    0: { // January (monthIndex 0)
      range0_5: 28,
      range6_10: 15,
      range11_20: 13,
      refused: 20,
      completedApps: 118,
      retail: 24, // 8 bank card + 16 cash
      unfinished: 2, // fine 40k
      bonusPoints: 52000, // 45k combined + 7k solfy
      promotion: 0,
    },
    1: { // February (monthIndex 1)
      range0_5: 27,
      range6_10: 10,
      range11_20: 8,
      refused: 11,
      completedApps: 102,
      retail: 19, // 8 bank card + 11 cash
      unfinished: 2, // fine 40k
      bonusPoints: 9000, // 9k combined
      promotion: 0,
    },
    2: { // March (monthIndex 2)
      range0_5: 23,
      range6_10: 11,
      range11_20: 6,
      refused: 33,
      completedApps: 77,
      retail: 23, // 12 bank card + 11 cash
      unfinished: 1, // fine 20k
      bonusPoints: 0,
      promotion: 0,
    },
    3: { // April (monthIndex 3)
      range0_5: 33,
      range6_10: 19,
      range11_20: 19,
      refused: 41,
      completedApps: 61,
      retail: 10, // 3 bank card + 7 cash
      unfinished: 1, // fine 20k
      bonusPoints: 10000, // 10k combined
      promotion: 0,
    },
    4: { // May (monthIndex 4)
      range0_5: 20,
      range6_10: 6,
      range11_20: 10,
      refused: 36,
      completedApps: 76,
      retail: 0,
      unfinished: 0,
      bonusPoints: 0,
      promotion: 0,
    },
    5: { // June (monthIndex 5)
      range0_5: 32,
      range6_10: 21,
      range11_20: 11,
      refused: 64,
      completedApps: 124,
      retail: 20, // 8 bank card + 12 cash
      unfinished: 0,
      bonusPoints: 20000, // 20k combined
      promotion: 0,
    },
    6: { // July (monthIndex 6)
      range0_5: 0,
      range6_10: 3,
      range11_20: 1,
      refused: 3,
      completedApps: 6,
      retail: 0,
      unfinished: 0,
      bonusPoints: 0,
      promotion: 0,
    },
    7: { // August (monthIndex 7)
      range0_5: 41,
      range6_10: 14,
      range11_20: 8,
      refused: 53,
      completedApps: 153,
      retail: 0,
      unfinished: 0,
      bonusPoints: 0,
      promotion: 0,
    },
    8: { // September (monthIndex 8)
      range0_5: 40,
      range6_10: 16,
      range11_20: 7,
      refused: 60,
      completedApps: 110,
      retail: 0,
      unfinished: 0,
      bonusPoints: 0,
      promotion: 0,
    },
    9: { // October (monthIndex 9)
      range0_5: 26,
      range6_10: 16,
      range11_20: 6,
      refused: 58,
      completedApps: 94,
      retail: 0,
      unfinished: 0,
      bonusPoints: 0,
      promotion: 0,
    },
    10: { // November (monthIndex 10)
      range0_5: 23,
      range6_10: 3,
      range11_20: 7,
      refused: 22,
      completedApps: 129,
      retail: 0,
      unfinished: 0,
      bonusPoints: 0,
      promotion: 0,
    },
    11: { // December (monthIndex 11)
      range0_5: 8,
      range6_10: 5,
      range11_20: 0,
      refused: 17,
      completedApps: 117,
      retail: 0,
      unfinished: 0,
      bonusPoints: 0,
      promotion: 0,
    },
  },

  // 2026
  2026: {
    0: { // January
      ...EMPTY_METRICS,
    },
    1: { // February (monthIndex 1) from sheet
      range0_5: 6,
      range6_10: 6,
      range11_20: 8,
      refused: 84,
      completedApps: 135,
      retail: 50,
      unfinished: 0,
      bonusPoints: 0,
      promotion: 0,
    },
    3: { // April (monthIndex 3)
      range0_5: 8,
      range6_10: 10,
      range11_20: 2,
      refused: 0,
      completedApps: 133,
      retail: 30,
      unfinished: 0,
      bonusPoints: 27.72,
      promotion: 0,
    },
    4: { // May (monthIndex 4)
      range0_5: 12,
      range6_10: 4,
      range11_20: 1,
      refused: 0,
      completedApps: 203,
      retail: 41,
      unfinished: 0,
      bonusPoints: 26.56,
      promotion: 48,
    },
    5: { // June (monthIndex 5)
      range0_5: 23,
      range6_10: 11,
      range11_20: 1,
      refused: 0,
      completedApps: 164,
      retail: 18,
      unfinished: 0,
      bonusPoints: 30.09,
      promotion: 0,
    },
    6: { // July (monthIndex 6)
      range0_5: 10,
      range6_10: 4,
      range11_20: 4,
      refused: 0,
      completedApps: 203,
      retail: 21,
      unfinished: 0,
      bonusPoints: 29.24,
      promotion: 0,
    },
    7: { // August (monthIndex 7) - moved previously created sample stats here
      ...DEFAULT_SAMPLE_METRICS,
    },
  },
};

export function getInitialYearData(): Record<number, MonthRecord[]> {
  const years = [2027, 2026, 2025, 2024, 2023];
  const initial: Record<number, MonthRecord[]> = {};

  years.forEach((yr) => {
    initial[yr] = MONTH_NAMES.map((name, index) => {
      const customMetrics = HISTORICAL_MONTH_METRICS[yr]?.[index];
      return {
        id: `${yr}-${index}`,
        name,
        shortName: name.slice(0, 3),
        monthIndex: index,
        metrics: customMetrics ? { ...EMPTY_METRICS, ...customMetrics } : { ...EMPTY_METRICS },
      };
    });
  });

  return initial;
}
