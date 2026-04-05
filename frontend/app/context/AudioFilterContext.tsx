import { createContext, ReactNode, useContext, useState } from "react";

export interface AudioFilters {
  name: string;
  artist: string;
  includeTags: string[];
  excludeTags: string[];
  hoursAgo: number | null;
}
export const defaultFilters: AudioFilters = {
  name: "",
  artist: "",
  includeTags: [],
  excludeTags: [],
  hoursAgo: null,
};
const FilterContext = createContext<{
  filters: AudioFilters;
  setFilters: React.Dispatch<React.SetStateAction<AudioFilters>>;
  set: <K extends keyof AudioFilters>(key: K, value: AudioFilters[K]) => void;
} | null>(null);
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<AudioFilters>(defaultFilters);
  const set = <K extends keyof AudioFilters>(key: K, value: AudioFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));
  return (
    <FilterContext.Provider value={{ filters, setFilters, set }}>
      {children}
    </FilterContext.Provider>
  );
}
export function useFilterContext() {
  const context = useContext(FilterContext);
  if (context == undefined)
    throw new Error("FilterContext used outside of provider.");
  return context;
}
