import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defaultState } from '../lib/calculator';
import { useCalculatorState } from './useCalculatorState';

describe('useCalculatorState', () => {
  it('updates fields and toggles wear mode', () => {
    const { result } = renderHook(() => useCalculatorState());

    expect(result.current.state).toEqual(defaultState);

    act(() => {
      result.current.setField('profitMargin', 25);
      result.current.toggleWear();
    });

    expect(result.current.state.profitMargin).toBe(25);
    expect(result.current.state.wearEnabled).toBe(true);

    act(() => {
      result.current.setWearEnabled(false);
    });

    expect(result.current.state.wearEnabled).toBe(false);
  });
});
