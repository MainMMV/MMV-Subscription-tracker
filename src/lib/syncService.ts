import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { MonthRecord, EMPTY_METRICS, MONTH_NAMES } from '../types';
import { getInitialYearData } from '../initialData';

/**
 * Syncs year data in Firestore under /years/{yearId}
 */
export function subscribeYearData(
  year: number,
  onData: (months: MonthRecord[]) => void,
  onError?: (err: unknown) => void
) {
  const docRef = doc(db, 'years', String(year));

  return onSnapshot(
    docRef,
    async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.months)) {
          onData(data.months as MonthRecord[]);
          return;
        }
      }

      // If document does not exist yet in Firestore, seed from initial data
      const initialMap = getInitialYearData();
      const defaultMonths = initialMap[year] || MONTH_NAMES.map((name, index) => ({
        id: `${year}-${index}`,
        name,
        shortName: name.slice(0, 3),
        monthIndex: index,
        metrics: { ...EMPTY_METRICS },
      }));

      try {
        await setDoc(docRef, {
          year,
          months: defaultMonths,
          updatedAt: new Date().toISOString(),
        });
        onData(defaultMonths);
      } catch (err) {
        if (onError) onError(err);
        onData(defaultMonths);
      }
    },
    (err) => {
      console.warn('Firestore subscription notice:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Saves updated months for a year to Firestore
 */
export async function saveYearDataToFirestore(year: number, months: MonthRecord[]): Promise<void> {
  try {
    const docRef = doc(db, 'years', String(year));
    await setDoc(
      docRef,
      {
        year,
        months,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving to Firestore:', err);
  }
}

/**
 * Available years sync in Firestore under /settings/app
 */
export function subscribeAvailableYears(
  defaultYears: number[],
  onData: (years: number[]) => void
) {
  const docRef = doc(db, 'settings', 'app');

  return onSnapshot(
    docRef,
    async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.availableYears) && data.availableYears.length > 0) {
          const sorted = Array.from(new Set([...data.availableYears, ...defaultYears])).sort((a, b) => b - a);
          onData(sorted);
          return;
        }
      }

      // If not exists, initialize
      try {
        await setDoc(docRef, {
          availableYears: defaultYears,
          updatedAt: new Date().toISOString(),
        });
        onData(defaultYears);
      } catch (err) {
        console.warn('Settings initialize notice:', err);
        onData(defaultYears);
      }
    },
    (err) => {
      console.warn('Firestore settings subscription notice:', err);
      onData(defaultYears);
    }
  );
}

export async function saveAvailableYearsToFirestore(years: number[]): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'app');
    await setDoc(
      docRef,
      {
        availableYears: years,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error saving available years to Firestore:', err);
  }
}
