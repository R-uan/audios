import { createContext, ReactNode, useContext, useMemo, useState } from "react";

export interface AudioFilters {
  name: string;
  artist: string;
  includeTags: string[];
  excludeTags: string[];
}

export const defaultFilters: AudioFilters = {
  name: "",
  artist: "",
  includeTags: [],
  excludeTags: [],
};

const FilterContext = createContext<{
  filters: AudioFilters;
  setFilters: React.Dispatch<React.SetStateAction<AudioFilters>>;
} | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<AudioFilters>(defaultFilters);
  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
