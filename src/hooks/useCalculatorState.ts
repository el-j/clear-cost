import { defaultState, type CalculatorState } from '../lib/calculator';
import { useQuoteStore } from '../store/quoteStore';

export type CalculatorField = Exclude<keyof CalculatorState, 'wearEnabled'>;

export function useCalculatorState(initialState: CalculatorState = defaultState) {
  const state = useQuoteStore((store) => store.quote);
  const setField = useQuoteStore((store) => store.setField);
  const toggleWear = useQuoteStore((store) => store.toggleWear);
  const setWearEnabled = useQuoteStore((store) => store.setWearEnabled);
  const setQuote = useQuoteStore((store) => store.setQuote);
  const resetQuote = useQuoteStore((store) => store.resetQuote);

  const reset = () => {
    if (initialState === defaultState) {
      resetQuote();
      return;
    }

    setQuote(initialState);
  };

  return {
    state,
    setField,
    toggleWear,
    setWearEnabled,
    setQuote,
    reset,
  };
}
