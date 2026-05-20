import { beforeEach, describe, expect, it } from 'vitest';
import { defaultState, type CalculatorState } from '../lib/calculator';
import { defaultProjectState, useProjectStore, type QuoteSnapshot, type SavedProject } from './projectStore';

function buildCalculator(overrides: Partial<CalculatorState>): CalculatorState {
  return {
    ...defaultState,
    ...overrides,
  };
}

function buildQuote(id: string, generatedAt: number, overrides: Partial<CalculatorState>): QuoteSnapshot {
  return {
    id,
    generatedAt,
    grossPerItem: generatedAt,
    grossTotal: generatedAt * 10,
    netTotal: generatedAt * 8,
    lang: 'en',
    calculator: buildCalculator(overrides),
    results: {
      grossPerItem: generatedAt,
      grossTotal: generatedAt * 10,
      netTotal: generatedAt * 8,
      taxAmount: 0,
      markupTotal: 0,
    },
  };
}

function buildProject(quotes: QuoteSnapshot[]): SavedProject {
  return {
    ...defaultProjectState,
    id: 'project-1',
    createdAt: 1,
    updatedAt: 1,
    quotes,
    activeQuoteId: quotes[0]?.id,
    activeQuoteGeneratedAt: quotes[0]?.generatedAt,
    lastQuote: quotes[0],
  };
}

describe('projectStore quote activation', () => {
  beforeEach(() => {
    localStorage.clear();
    useProjectStore.setState({
      currentProject: defaultProjectState,
      activeProjectId: null,
      projects: [],
    });
  });

  it('activates the exact quote when ids are duplicated but generatedAt differs', () => {
    const first = buildQuote('duplicate-id', 1716200000000, { totalItems: 10 });
    const second = buildQuote('duplicate-id', 1716200001234, { totalItems: 77 });

    useProjectStore.setState({
      currentProject: defaultProjectState,
      activeProjectId: 'project-1',
      projects: [buildProject([first, second])],
    });

    const selected = useProjectStore.getState().setActiveQuote('project-1', 'duplicate-id', second.generatedAt);

    expect(selected?.generatedAt).toBe(second.generatedAt);
    expect(selected?.calculator.totalItems).toBe(77);

    const savedProject = useProjectStore.getState().projects[0];
    expect(savedProject.activeQuoteId).toBe('duplicate-id');
    expect(savedProject.activeQuoteGeneratedAt).toBe(second.generatedAt);
    expect(savedProject.lastQuote?.generatedAt).toBe(second.generatedAt);
  });
});
