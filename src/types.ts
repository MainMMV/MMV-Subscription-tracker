export interface MonthMetrics {
  range0_5: number;
  range6_10: number;
  range11_20: number;
  refused: number;
  retail: number;
  unfinished: number;
  completedApps: number;
  bonusPoints: number;
  promotion: number;
}

export interface MonthSalaryCalculation {
  amount: number;
  bonus: number;
  overall: number;
  tax: number;
  net: number;
}

export interface MonthRecord {
  id: string;
  name: string;
  shortName: string;
  monthIndex: number;
  metrics: MonthMetrics;
}

export const DEFAULT_SAMPLE_METRICS: MonthMetrics = {
  range0_5: 12,
  range6_10: 0,
  range11_20: 0,
  refused: 14,
  retail: 21,
  unfinished: 0,
  completedApps: 131,
  bonusPoints: 53559.17,
  promotion: 67,
};

export const EMPTY_METRICS: MonthMetrics = {
  range0_5: 0,
  range6_10: 0,
  range11_20: 0,
  refused: 0,
  retail: 0,
  unfinished: 0,
  completedApps: 0,
  bonusPoints: 0,
  promotion: 0,
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function calculateSalary(metrics: MonthMetrics): MonthSalaryCalculation {
  const amount =
    (metrics.range0_5 * 20000) +
    (metrics.range6_10 * 12000) +
    (metrics.range11_20 * 5000) +
    (metrics.refused * 5000) +
    (metrics.retail * 2000) +
    (metrics.unfinished * -20000) +
    (metrics.completedApps * 12000);

  const bonus = (metrics.bonusPoints || 0) + ((metrics.promotion || 0) * 12000);
  const overall = amount + bonus;
  const tax = overall * 0.12;
  const net = overall - tax;

  return {
    amount,
    bonus,
    overall,
    tax,
    net,
  };
}

export function formatNumber(val: number, allowDecimals: boolean = false): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  
  if (allowDecimals) {
    const rounded = Math.round(val * 100) / 100;
    const parts = rounded.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return parts.join('.');
  }

  const rounded = Math.round(val);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
