import { useEffect, useMemo, useState } from 'react';
import { useI18n, useT } from '../../i18n/index';
import { useCalculatorState } from '../../hooks/useCalculatorState';
import { useCopyQuote } from '../../hooks/useCopyQuote';
import {
  buildQuoteText,
  calculateQuote,
  solvePrinterPriceForTargetGrossPerItem,
  type CalculatorState,
} from '../../lib/calculator';
import { useProjectStore, type ProjectStoreState } from '../../store/projectStore';
import { useQuoteStore } from '../../store/quoteStore';
import { CalculatorFormPanel } from './tool/CalculatorFormPanel';
import { ProjectSidebar } from './tool/ProjectSidebar';
import { QuoteAndResultsPanel } from './tool/QuoteAndResultsPanel';
import { ToolHero } from './tool/ToolHero';

export function ToolPage() {
  const t = useT();
  const { lang } = useI18n();
  const { state, setField, toggleWear, reset, setQuote } = useCalculatorState();
  const resetQuote = useQuoteStore((store) => store.resetQuote);
  const project = useProjectStore((store: ProjectStoreState) => store.currentProject);
  const activeProjectId = useProjectStore((store: ProjectStoreState) => store.activeProjectId);
  const projects = useProjectStore((store: ProjectStoreState) => store.projects);
  const setCurrentField = useProjectStore((store: ProjectStoreState) => store.setCurrentField);
  const saveCurrentProject = useProjectStore((store: ProjectStoreState) => store.saveCurrentProject);
  const loadProject = useProjectStore((store: ProjectStoreState) => store.loadProject);
  const setActiveQuote = useProjectStore((store: ProjectStoreState) => store.setActiveQuote);
  const newProject = useProjectStore((store: ProjectStoreState) => store.newProject);
  const saveCurrentQuote = useProjectStore((store: ProjectStoreState) => store.saveCurrentQuote);
  const { status, copy } = useCopyQuote();
  const [pricingMode, setPricingMode] = useState<'classic' | 'target'>('classic');
  const [targetGrossPerItem, setTargetGrossPerItem] = useState<number>(0);
  const solvedPrinterPrice = useMemo(() => {
    if (pricingMode !== 'target') {
      return null;
    }

    return solvePrinterPriceForTargetGrossPerItem(state, targetGrossPerItem);
  }, [pricingMode, state, targetGrossPerItem]);

  const effectiveState = useMemo(() => {
    if (pricingMode !== 'target' || solvedPrinterPrice === null) {
      return state;
    }

    return {
      ...state,
      wearEnabled: true,
      printerPrice: solvedPrinterPrice,
    };
  }, [pricingMode, solvedPrinterPrice, state]);

  const results = calculateQuote(effectiveState);
  const quoteText = useMemo(() => buildQuoteText(effectiveState, results, lang, project), [effectiveState, results, lang, project]);
  const activeSavedProject = projects.find((entry) => entry.id === activeProjectId);
  const sortedQuotes = useMemo(
    () => [...(activeSavedProject?.quotes ?? [])].sort((left, right) => right.generatedAt - left.generatedAt),
    [activeSavedProject?.quotes],
  );

  useEffect(() => {
    setTargetGrossPerItem(Number(results.grossPerItem.toFixed(2)));
  }, []);

  const copyLabel =
    status === 'copied' ? t('tool.copied') : status === 'error' ? t('tool.copyError') : t('tool.copyQuote');

  const handleSetCalculatorField = (field: Exclude<keyof CalculatorState, 'wearEnabled'>, value: number) => {
    applyCalculatorChange(() => setField(field, value));
  };

  const handleToggleWear = () => {
    applyCalculatorChange(() => toggleWear());
  };

  const applyCalculatorChange = (updater: () => void) => {
    if (pricingMode === 'target') {
      setPricingMode('classic');
    }

    updater();
  };

  const saveQuoteSnapshot = () => {
    saveCurrentQuote({
      grossPerItem: results.grossPerItem,
      grossTotal: results.grossTotal,
      netTotal: results.netTotal,
      generatedAt: Date.now(),
      lang,
      calculator: state,
      results: {
        grossPerItem: results.grossPerItem,
        grossTotal: results.grossTotal,
        netTotal: results.netTotal,
        taxAmount: results.taxAmount,
        markupTotal: results.markupTotal,
      },
    });
  };

  const startNewQuote = () => {
    reset();
    setPricingMode('classic');
    setTargetGrossPerItem(0);
  };

  const loadProjectQuote = (quoteId: string, generatedAt: number) => {
    if (!activeSavedProject) {
      return;
    }

    const snapshot = setActiveQuote(activeSavedProject.id, quoteId, generatedAt);
    if (!snapshot) {
      return;
    }

    setQuote(snapshot.calculator);
    setPricingMode('classic');
    setTargetGrossPerItem(Number(snapshot.grossPerItem.toFixed(2)));
  };

  const activateProject = (projectId: string) => {
    const snapshot = loadProject(projectId);
    if (snapshot) {
      setQuote(snapshot.calculator);
      setTargetGrossPerItem(Number(snapshot.grossPerItem.toFixed(2)));
      setPricingMode('classic');
      return;
    }

    resetQuote();
    setPricingMode('classic');
    setTargetGrossPerItem(0);
  };

  return (
    <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <ToolHero
        t={t}
        lang={lang}
        projectName={project.name}
        projectCustomer={project.customer}
        projectStatus={project.status}
        activeSavedProject={activeSavedProject}
        results={results}
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <ProjectSidebar
          t={t}
          lang={lang}
          project={project}
          activeSavedProject={activeSavedProject}
          activeProjectId={activeProjectId}
          projects={projects}
          sortedQuotes={sortedQuotes}
          results={results}
          onSetProjectField={setCurrentField}
          onSaveCurrentProject={saveCurrentProject}
          onCreateNewProject={() => {
            newProject();
            resetQuote();
            setPricingMode('classic');
            setTargetGrossPerItem(0);
          }}
          onActivateProject={activateProject}
          onLoadProjectQuote={loadProjectQuote}
          onSaveQuoteSnapshot={saveQuoteSnapshot}
          onStartNewQuote={startNewQuote}
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <div className="grid gap-6">
            <CalculatorFormPanel
              state={state}
              t={t}
              onSetField={handleSetCalculatorField}
              onToggleWear={handleToggleWear}
            />
          </div>

          <QuoteAndResultsPanel
            t={t}
            lang={lang}
            state={state}
            results={results}
            effectiveWearEnabled={effectiveState.wearEnabled}
            copyLabel={copyLabel}
            quoteText={quoteText}
            onCopyQuote={copy}
            pricingMode={pricingMode}
            targetGrossPerItem={targetGrossPerItem}
            solvedPrinterPrice={solvedPrinterPrice}
            onSetPricingMode={setPricingMode}
            onSetTargetGrossPerItem={setTargetGrossPerItem}
            onSetField={handleSetCalculatorField}
          />
        </div>
      </div>
    </main>
  );
}
