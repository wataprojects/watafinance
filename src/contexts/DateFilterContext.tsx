import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const STORAGE_KEY_MONTH = 'monyro_filter_month';
const STORAGE_KEY_YEAR = 'monyro_filter_year';

interface DateFilterContextType {
  filterMonth: string;
  filterYear: string;
  setFilterMonth: (month: string) => void;
  setFilterYear: (year: string) => void;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const DateFilterProvider = ({ children }: { children: ReactNode }) => {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();

  const getInitialMonth = (): string => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_MONTH);
      if (stored) return stored;
    }
    return currentMonth;
  };

  const getInitialYear = (): string => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_YEAR);
      if (stored) return stored;
    }
    return currentYear;
  };

  const [filterMonth, setFilterMonthState] = useState(getInitialMonth);
  const [filterYear, setFilterYearState] = useState(getInitialYear);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MONTH, filterMonth);
    }
  }, [filterMonth]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_YEAR, filterYear);
    }
  }, [filterYear]);

  const setFilterMonth = (month: string) => {
    setFilterMonthState(month);
  };

  const setFilterYear = (year: string) => {
    setFilterYearState(year);
  };

  return (
    <DateFilterContext.Provider value={{ filterMonth, filterYear, setFilterMonth, setFilterYear }}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within DateFilterProvider');
  }
  return context;
};
