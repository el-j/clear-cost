import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { calculateQuote, defaultState, type AppLang, type CalculatorResults, type CalculatorState, type ProjectState } from '../lib/calculator';

export interface QuoteSnapshot {
  id: string;
  grossPerItem: number;
  grossTotal: number;
  netTotal: number;
  generatedAt: number;
  lang: AppLang;
  calculator: CalculatorState;
  results: Pick<CalculatorResults, 'grossPerItem' | 'grossTotal' | 'netTotal' | 'taxAmount' | 'markupTotal'>;
}

export interface SavedProject extends ProjectState {
  id: string;
  createdAt: number;
  updatedAt: number;
  quotes: QuoteSnapshot[];
  lastQuote?: QuoteSnapshot;
  activeQuoteId?: string;
  activeQuoteGeneratedAt?: number;
}

export interface ProjectStoreState {
  currentProject: ProjectState;
  activeProjectId: string | null;
  projects: SavedProject[];
  setCurrentField: <K extends keyof ProjectState>(field: K, value: ProjectState[K]) => void;
  setCurrentProject: (project: ProjectState) => void;
  resetCurrentProject: () => void;
  saveCurrentProject: () => string;
  saveCurrentQuote: (quote: Omit<QuoteSnapshot, 'id'>) => string;
  loadProject: (id: string) => QuoteSnapshot | undefined;
  setActiveQuote: (projectId: string, quoteId: string, generatedAt?: number) => QuoteSnapshot | undefined;
  duplicateProject: (id: string) => void;
  deleteProject: (id: string) => void;
  newProject: () => void;
}

const STORAGE_KEY = 'clear-cost-project-store';
const STORAGE_VERSION = 2;

export const defaultProjectState: ProjectState = {
  name: 'Prototype quote',
  customer: '',
  status: 'draft',
  note: '',
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const cloneProject = (project: ProjectState): ProjectState => ({
  name: project.name,
  customer: project.customer,
  status: project.status,
  note: project.note,
});

const createQuoteId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `quote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createSavedProject = (project: ProjectState, quote?: QuoteSnapshot): SavedProject => {
  const now = Date.now();

  return {
    id: createId(),
    ...cloneProject(project),
    createdAt: now,
    updatedAt: now,
    quotes: quote ? [quote] : [],
    lastQuote: quote,
    activeQuoteId: quote?.id,
    activeQuoteGeneratedAt: quote?.generatedAt,
  };
};

const normalizeQuoteSnapshot = (quote: Omit<QuoteSnapshot, 'id'> & Partial<QuoteSnapshot>): QuoteSnapshot => {
  const calculator = quote.calculator ?? defaultState;
  const fallbackResults = calculateQuote(calculator);

  return {
    id: quote.id ?? createQuoteId(),
    grossPerItem: quote.grossPerItem ?? fallbackResults.grossPerItem,
    grossTotal: quote.grossTotal ?? fallbackResults.grossTotal,
    netTotal: quote.netTotal ?? fallbackResults.netTotal,
    generatedAt: quote.generatedAt ?? Date.now(),
    lang: quote.lang ?? 'de',
    calculator,
    results:
      quote.results ?? {
        grossPerItem: fallbackResults.grossPerItem,
        grossTotal: fallbackResults.grossTotal,
        netTotal: fallbackResults.netTotal,
        taxAmount: fallbackResults.taxAmount,
        markupTotal: fallbackResults.markupTotal,
      },
  };
};

const ensureUniqueQuoteIds = (quotes: QuoteSnapshot[]): QuoteSnapshot[] => {
  const seen = new Set<string>();

  return quotes.map((quote, index) => {
    if (!seen.has(quote.id)) {
      seen.add(quote.id);
      return quote;
    }

    const nextId = `${quote.id}-${quote.generatedAt}-${index}`;
    seen.add(nextId);
    return {
      ...quote,
      id: nextId,
    };
  });
};

const normalizeSavedProject = (project: ProjectState & Partial<SavedProject>): SavedProject => {
  const quotes = ensureUniqueQuoteIds((project.quotes ?? []).map((quote) => normalizeQuoteSnapshot(quote)));
  const latestQuoteFromList = quotes.length > 0 ? quotes[quotes.length - 1] : undefined;
  const normalizedLastQuote = project.lastQuote ? normalizeQuoteSnapshot(project.lastQuote) : latestQuoteFromList;

  return {
    id: project.id ?? createId(),
    ...cloneProject(project),
    createdAt: project.createdAt ?? Date.now(),
    updatedAt: project.updatedAt ?? project.createdAt ?? Date.now(),
    quotes,
    lastQuote: normalizedLastQuote,
    activeQuoteId: project.activeQuoteId ?? normalizedLastQuote?.id,
    activeQuoteGeneratedAt: project.activeQuoteGeneratedAt ?? normalizedLastQuote?.generatedAt,
  };
};

const upsertProject = (
  projects: SavedProject[],
  currentProject: ProjectState,
  activeProjectId: string | null,
  quote?: Omit<QuoteSnapshot, 'id'>,
): { projects: SavedProject[]; activeProjectId: string } => {
  const now = Date.now();
  const normalizedQuote = quote ? normalizeQuoteSnapshot(quote) : undefined;

  if (activeProjectId) {
    return {
      projects: projects.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              ...cloneProject(currentProject),
              updatedAt: now,
              quotes: normalizedQuote ? [...project.quotes, normalizedQuote] : project.quotes,
              lastQuote: normalizedQuote ?? project.lastQuote,
              activeQuoteId: normalizedQuote?.id ?? project.activeQuoteId,
              activeQuoteGeneratedAt: normalizedQuote?.generatedAt ?? project.activeQuoteGeneratedAt,
            }
          : project,
      ),
      activeProjectId,
    };
  }

  const savedProject = createSavedProject(currentProject, normalizedQuote);
  return {
    projects: [savedProject, ...projects],
    activeProjectId: savedProject.id,
  };
};

const initialState = {
  currentProject: defaultProjectState,
  activeProjectId: null,
  projects: [] as SavedProject[],
};

export const useProjectStore = create<ProjectStoreState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setCurrentField: (field, value) =>
        set((state) => ({
          currentProject: {
            ...state.currentProject,
            [field]: value,
          },
        })),
      setCurrentProject: (project) => set({ currentProject: cloneProject(project) }),
      resetCurrentProject: () => set({ currentProject: defaultProjectState, activeProjectId: null }),
      saveCurrentProject: () => {
        const { currentProject, projects, activeProjectId } = get();
        const next = upsertProject(projects, currentProject, activeProjectId);
        set(next);
        return next.activeProjectId;
      },
      saveCurrentQuote: (quote) => {
        const { currentProject, projects, activeProjectId } = get();
        const next = upsertProject(projects, currentProject, activeProjectId, quote);
        set(next);
        return next.activeProjectId;
      },
      loadProject: (id) => {
        const project = get().projects.find((entry) => entry.id === id);
        if (!project) return undefined;

        const activeQuote =
          project.quotes.find(
            (quote) =>
              quote.id === project.activeQuoteId &&
              (project.activeQuoteGeneratedAt === undefined || quote.generatedAt === project.activeQuoteGeneratedAt),
          ) ??
          project.quotes.find((quote) => quote.id === project.activeQuoteId) ??
          project.lastQuote;
        set({
          currentProject: cloneProject(project),
          activeProjectId: project.id,
        });

        return activeQuote;
      },
      setActiveQuote: (projectId, quoteId, generatedAt) => {
        const project = get().projects.find((entry) => entry.id === projectId);
        if (!project) return undefined;

        const activeQuote =
          project.quotes.find(
            (quote) => quote.id === quoteId && (generatedAt === undefined || quote.generatedAt === generatedAt),
          ) ?? project.quotes.find((quote) => quote.id === quoteId);
        if (!activeQuote) return undefined;

        set((state) => ({
          projects: state.projects.map((entry) =>
            entry.id === projectId
              ? {
                  ...entry,
                  activeQuoteId: activeQuote.id,
                  activeQuoteGeneratedAt: activeQuote.generatedAt,
                  lastQuote: activeQuote,
                  updatedAt: Date.now(),
                }
              : entry,
          ),
          activeProjectId: projectId,
          currentProject: cloneProject(project),
        }));

        return activeQuote;
      },
      duplicateProject: (id) => {
        const project = get().projects.find((entry) => entry.id === id);
        if (!project) return;

        const duplicate = createSavedProject(project, project.lastQuote);
        duplicate.quotes = [...project.quotes];
        set((state) => ({
          projects: [duplicate, ...state.projects],
        }));
      },
      deleteProject: (id) =>
        set((state) => {
          const nextProjects = state.projects.filter((project) => project.id !== id);
          const nextActiveProjectId = state.activeProjectId === id ? null : state.activeProjectId;
          const nextCurrentProject = state.activeProjectId === id ? defaultProjectState : state.currentProject;

          return {
            projects: nextProjects,
            activeProjectId: nextActiveProjectId,
            currentProject: nextCurrentProject,
          };
        }),
      newProject: () => set({ currentProject: defaultProjectState, activeProjectId: null }),
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = persistedState as Partial<ProjectStoreState> & {
          projects?: Array<ProjectState & Partial<SavedProject>>;
        };

        return {
          ...state,
          projects: (state.projects ?? []).map((project) => normalizeSavedProject(project)),
        };
      },
      partialize: (state) => ({
        currentProject: state.currentProject,
        activeProjectId: state.activeProjectId,
        projects: state.projects,
      }),
    },
  ),
);
