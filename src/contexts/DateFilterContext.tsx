import { createContext, useContext, useState, ReactNode } from 'react';

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
  
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);

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
