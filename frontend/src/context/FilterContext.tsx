import React, { createContext, useContext, useState, useCallback } from 'react';
import type { FilterState } from '../types';

interface FilterContextType {
  filters: FilterState;
  setPlatform: (platform: string) => void;
  setContentType: (contentType: string) => void;
  setDateRange: (startDate: string, endDate: string) => void;
  setEngagementLevel: (level: string) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const initialFilters: FilterState = {
  platform: 'All',
  contentType: 'All',
  startDate: '',
  endDate: '',
  engagementLevel: 'All',
  search: '',
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const setPlatform = useCallback((platform: string) => {
    setFilters(prev => ({ ...prev, platform }));
  }, []);

  const setContentType = useCallback((contentType: string) => {
    setFilters(prev => ({ ...prev, contentType }));
  }, []);

  const setDateRange = useCallback((startDate: string, endDate: string) => {
    setFilters(prev => ({ ...prev, startDate, endDate }));
  }, []);

  const setEngagementLevel = useCallback((engagementLevel: string) => {
    setFilters(prev => ({ ...prev, engagementLevel }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setPlatform,
        setContentType,
        setDateRange,
        setEngagementLevel,
        setSearch,
        resetFilters,
        refreshTrigger,
        triggerRefresh,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
