import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { defaultState, type CalculatorState } from '../lib/calculator';

export interface QuoteStoreState {
  quote: CalculatorState;
  setField: <K extends keyof CalculatorState>(field: K, value: CalculatorState[K]) => void;
  toggleWear: () => void;
  setWearEnabled: (enabled: boolean) => void;
  setQuote: (quote: CalculatorState) => void;
  resetQuote: () => void;
}

const STORAGE_KEY = 'clear-cost-quote-store';

const cloneQuote = (quote: CalculatorState): CalculatorState => ({
  itemsPerPlate: quote.itemsPerPlate,
  totalItems: quote.totalItems,
  hours: quote.hours,
  minutes: quote.minutes,
  power: quote.power,
  energyPrice: quote.energyPrice,
  weight: quote.weight,
  filamentPrice: quote.filamentPrice,
  wearEnabled: quote.wearEnabled,
  printerPrice: quote.printerPrice,
  printerLife: quote.printerLife,
  profitMargin: quote.profitMargin,
  taxRate: quote.taxRate,
  setupFee: quote.setupFee,
});

export const useQuoteStore = create<QuoteStoreState>()(
  persist(
    (set) => ({
      quote: defaultState,
      setField: (field, value) =>
        set((state) => ({
          quote: {
            ...state.quote,
            [field]: value,
          },
        })),
      toggleWear: () =>
        set((state) => ({
          quote: {
            ...state.quote,
            wearEnabled: !state.quote.wearEnabled,
          },
        })),
      setWearEnabled: (enabled) =>
        set((state) => ({
          quote: {
            ...state.quote,
            wearEnabled: enabled,
          },
        })),
      setQuote: (quote) => set({ quote: cloneQuote(quote) }),
      resetQuote: () => set({ quote: defaultState }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        quote: state.quote,
      }),
    },
  ),
);