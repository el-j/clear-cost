import { describe, expect, it } from 'vitest';
import {
  buildQuoteText,
  calculateQuote,
  defaultState,
  formatCurrency,
  formatTime,
  formatWeight,
  solvePrinterPriceForTargetGrossPerItem,
} from './calculator';

describe('calculator helpers', () => {
  it('formats values in German locale', () => {
    expect(formatCurrency(12.5)).toMatch(/12,50\s€/);
    expect(formatWeight(1550)).toBe('1,55 kg');
    expect(formatTime(10.5)).toBe('10h 30m');
  });

  it('calculates the pricing model from the default state', () => {
    const results = calculateQuote(defaultState);

    expect(results.orderTotalCost).toBeCloseTo(28.19375, 5);
    expect(results.grossTotal).toBeCloseTo(79.001125, 6);
    expect(results.grossPerItem).toBeCloseTo(1.5800225, 6);
  });

  it('builds a customer quote from live values', () => {
    const results = calculateQuote(defaultState);
    const quote = buildQuoteText(defaultState, results);

    expect(quote).toContain('Menge: 50 Stück');
    expect(quote).toMatch(/Gesamtpreis: 79,00\s€/);
    expect(quote).toContain('inkl. 19% MwSt.');
  });

  it('solves printer price for a target end price per item', () => {
    const targetGrossPerItem = 2.4;
    const requiredPrinterPrice = solvePrinterPriceForTargetGrossPerItem(defaultState, targetGrossPerItem);

    expect(requiredPrinterPrice).not.toBeNull();

    const stateWithSolvedWear = {
      ...defaultState,
      wearEnabled: true,
      printerPrice: requiredPrinterPrice ?? 0,
    };
    const results = calculateQuote(stateWithSolvedWear);

    expect(results.grossPerItem).toBeCloseTo(targetGrossPerItem, 6);
  });

  it('returns null when target is below base non-wear floor', () => {
    const impossibleTarget = 0.2;
    const requiredPrinterPrice = solvePrinterPriceForTargetGrossPerItem(defaultState, impossibleTarget);

    expect(requiredPrinterPrice).toBeNull();
  });
});
