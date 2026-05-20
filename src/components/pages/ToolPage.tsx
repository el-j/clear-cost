import { useEffect, useMemo, useState } from 'react';
import { useI18n, useT } from '../../i18n/index';
import { useCalculatorState } from '../../hooks/useCalculatorState';
import { useCopyQuote } from '../../hooks/useCopyQuote';
import {
  buildQuoteText,
  calculateQuote,
  formatCurrencyByLang,
  formatTime,
  formatWeight,
  solvePrinterPriceForTargetGrossPerItem,
} from '../../lib/calculator';
import {
  CopyButton,
  Field,
  InputFrame,
  MetricRow,
  NumberInput,
  PanelHeader,
  SectionCard,
  SummaryRow,
  SummaryTile,
  Surface,
  ToggleButton,
} from '../ui';
import { useProjectStore, type ProjectStoreState } from '../../store/projectStore';
import { useQuoteStore } from '../../store/quoteStore';

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

  const loadProjectQuote = (quoteId: string) => {
    if (!activeSavedProject) {
      return;
    }

    const snapshot = setActiveQuote(activeSavedProject.id, quoteId);
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
      <Surface as="header" className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:p-8">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-teal-200">
            {t('tool.heroBadge')}
          </span>
          <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-slate-50 sm:text-5xl lg:text-7xl">
            {t('tool.heroTitle')}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">{t('tool.heroBody')}</p>

          <div className="mt-6 grid gap-4 rounded-4xl border border-white/10 bg-slate-950/65 p-5 shadow-[0_24px_90px_rgba(3,7,18,0.28)] lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">{t('tool.projectContext')}</div>
              <div className="mt-2 text-lg font-semibold text-slate-50">{project.name || t('projects.unnamed')}</div>
              <div className="mt-1 text-sm text-slate-400">
                {project.customer || t('projects.noCustomer')} · {t(`tool.projectStatus${project.status === 'in-progress' ? 'Working' : project.status === 'quoted' ? 'Quoted' : project.status === 'done' ? 'Done' : 'Draft'}`)}
              </div>
              <div className="mt-2 text-sm text-slate-400">
                {activeSavedProject?.lastQuote ? (
                  <>
                    {t('projects.latestQuote')}: {formatCurrencyByLang(activeSavedProject.lastQuote.grossTotal, lang)}
                  </>
                ) : (
                  t('projects.noLatestQuote')
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Tag>
                  {activeSavedProject
                    ? `${activeSavedProject.quotes?.length ?? 0} ${t('projects.quotesSaved')}`
                    : t('projects.draft')}
                </Tag>
                <Tag>{formatCurrencyByLang(results.grossTotal, lang)}</Tag>
                <Tag>{`${formatCurrencyByLang(results.grossPerItem, lang)} ${t('tool.perItemLabel')}`}</Tag>
              </div>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                className="rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-3 text-sm font-medium text-teal-100 transition hover:-translate-y-px hover:border-teal-300/40 hover:bg-teal-400/15"
                onClick={saveQuoteSnapshot}
              >
                {t('tool.saveQuote')}
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10"
                onClick={startNewQuote}
              >
                {t('tool.newQuote')}
              </button>
              <a
                href="#/projects"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-slate-200 transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10"
              >
                {t('tool.manageProjects')}
              </a>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-teal-400/15 bg-slate-950/80 p-5" data-testid="hero-badge">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{t('tool.priceLabel')}</div>
          <div className="mt-20 text-4xl font-black tracking-tight text-slate-50 sm:text-5xl lg:text-[3.4rem]">
            {formatCurrencyByLang(results.grossTotal, lang)}
          </div>
          <div className="mt-4 text-sm font-semibold text-teal-300">
            {formatCurrencyByLang(results.grossPerItem, lang)} {t('tool.perItemLabel')}
          </div>
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Surface as="aside" className="h-fit p-5 xl:sticky xl:top-24">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">{t('tool.sidebarProjectBadge')}</div>
          <h2 className="mt-2 text-xl font-semibold text-slate-50">{project.name || t('projects.unnamed')}</h2>
          <p className="mt-1 text-sm text-slate-400">{project.customer || t('projects.noCustomer')}</p>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{t('tool.projectName')}</span>
              <input
                value={project.name}
                onChange={(event) => setCurrentField('name', event.currentTarget.value)}
                className="h-10 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{t('tool.customerName')}</span>
              <input
                value={project.customer}
                onChange={(event) => setCurrentField('customer', event.currentTarget.value)}
                className="h-10 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{t('tool.projectStatus')}</span>
              <select
                value={project.status}
                onChange={(event) => setCurrentField('status', event.currentTarget.value as typeof project.status)}
                className="h-10 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
              >
                <option value="draft">{t('tool.projectStatusDraft')}</option>
                <option value="quoted">{t('tool.projectStatusQuoted')}</option>
                <option value="in-progress">{t('tool.projectStatusWorking')}</option>
                <option value="done">{t('tool.projectStatusDone')}</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => saveCurrentProject()}
              className="rounded-xl border border-teal-400/20 bg-teal-400/10 px-3 py-2 text-sm font-medium text-teal-100 transition hover:border-teal-300/40"
            >
              {t('tool.sidebarSaveProject')}
            </button>
            <button
              type="button"
              onClick={() => {
                newProject();
                resetQuote();
                setPricingMode('classic');
                setTargetGrossPerItem(0);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20"
            >
              {t('tool.sidebarNewProject')}
            </button>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">{t('tool.sidebarQuotesTitle')}</h3>
              <span className="text-xs text-slate-400">{sortedQuotes.length}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{t('tool.sidebarQuotesHint')}</p>

            <div className="mt-3 grid max-h-80 gap-2 overflow-auto pr-1">
              {sortedQuotes.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
                  {t('tool.sidebarNoQuotes')}
                </div>
              ) : (
                sortedQuotes.map((quote) => (
                  <button
                    key={quote.id}
                    type="button"
                    onClick={() => loadProjectQuote(quote.id)}
                    className={`grid gap-1 rounded-xl border px-3 py-2 text-left transition ${
                      activeSavedProject?.activeQuoteId === quote.id
                        ? 'border-teal-400/30 bg-teal-400/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xs font-semibold text-slate-200">{formatCurrencyByLang(quote.grossTotal, lang)}</span>
                    <span className="text-xs text-slate-400">
                      {formatCurrencyByLang(quote.grossPerItem, lang)} {t('tool.perItemLabel')}
                    </span>
                    <span className="text-[11px] text-slate-500">{formatQuoteDate(quote.generatedAt, lang)}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">{t('tool.sidebarProjectsTitle')}</h3>
            <div className="mt-3 grid max-h-64 gap-2 overflow-auto pr-1">
              {projects.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
                  {t('projects.emptyState')}
                </div>
              ) : (
                [...projects]
                  .sort((left, right) => right.updatedAt - left.updatedAt)
                  .map((savedProject) => (
                    <button
                      key={savedProject.id}
                      type="button"
                      onClick={() => activateProject(savedProject.id)}
                      className={`rounded-xl border px-3 py-2 text-left transition ${
                        activeProjectId === savedProject.id
                          ? 'border-teal-400/30 bg-teal-400/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-sm font-semibold text-slate-100">{savedProject.name || t('projects.unnamed')}</div>
                      <div className="mt-1 text-xs text-slate-400">{savedProject.customer || t('projects.noCustomer')}</div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </Surface>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="grid gap-6">
          <Surface as="section" className="p-6 lg:p-7">
            <PanelHeader title={t('tool.calculatorTitle')} subtitle={t('tool.calculatorBody')} />

            <form className="mt-6 grid gap-4" onSubmit={(event) => event.preventDefault()}>
              <SectionCard title={t('tool.sectionQuantities')} tone="blue">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t('tool.itemsPerPlate')}>
                    <InputFrame suffix="St.">
                      <NumberInput
                        type="number"
                        min={1}
                        value={state.itemsPerPlate}
                        onChange={(event) =>
                          applyCalculatorChange(() => setField('itemsPerPlate', event.currentTarget.valueAsNumber || 1))
                        }
                      />
                    </InputFrame>
                  </Field>

                  <Field label={t('tool.totalItems')}>
                    <InputFrame suffix="St.">
                      <NumberInput
                        type="number"
                        min={1}
                        value={state.totalItems}
                        onChange={(event) =>
                          applyCalculatorChange(() => setField('totalItems', event.currentTarget.valueAsNumber || 1))
                        }
                      />
                    </InputFrame>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title={t('tool.sectionTime')} tone="slate">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t('tool.hours')}>
                    <NumberInput
                      type="number"
                      min={0}
                      value={state.hours}
                      onChange={(event) => applyCalculatorChange(() => setField('hours', event.currentTarget.valueAsNumber || 0))}
                    />
                  </Field>

                  <Field label={t('tool.minutes')}>
                    <NumberInput
                      type="number"
                      min={0}
                      max={59}
                      value={state.minutes}
                      onChange={(event) =>
                        applyCalculatorChange(() => setField('minutes', event.currentTarget.valueAsNumber || 0))
                      }
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title={t('tool.sectionEnergy')} tone="slate">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t('tool.power')}>
                    <InputFrame suffix="W">
                      <NumberInput
                        type="number"
                        min={0}
                        value={state.power}
                        onChange={(event) => applyCalculatorChange(() => setField('power', event.currentTarget.valueAsNumber || 0))}
                      />
                    </InputFrame>
                  </Field>

                  <Field label={t('tool.energyPrice')}>
                    <InputFrame suffix="€">
                      <NumberInput
                        type="number"
                        min={0}
                        step={0.01}
                        value={state.energyPrice}
                        onChange={(event) =>
                          applyCalculatorChange(() => setField('energyPrice', event.currentTarget.valueAsNumber || 0))
                        }
                      />
                    </InputFrame>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title={t('tool.sectionMaterial')} tone="slate">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label={t('tool.weight')}>
                    <InputFrame suffix="g">
                      <NumberInput
                        type="number"
                        min={0}
                        value={state.weight}
                        onChange={(event) => applyCalculatorChange(() => setField('weight', event.currentTarget.valueAsNumber || 0))}
                      />
                    </InputFrame>
                  </Field>

                  <Field label={t('tool.filamentPrice')}>
                    <InputFrame suffix="€">
                      <NumberInput
                        type="number"
                        min={0}
                        step={0.5}
                        value={state.filamentPrice}
                        onChange={(event) =>
                          applyCalculatorChange(() => setField('filamentPrice', event.currentTarget.valueAsNumber || 0))
                        }
                      />
                    </InputFrame>
                  </Field>
                </div>
              </SectionCard>

              <SectionCard title={t('tool.sectionWear')} tone="slate">
                <ToggleButton
                  active={state.wearEnabled}
                  onClick={() => applyCalculatorChange(() => toggleWear())}
                  label={t('tool.wearEnabled')}
                />

                {state.wearEnabled ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label={t('tool.printerPrice')}>
                      <InputFrame suffix="€">
                        <NumberInput
                          type="number"
                          min={0}
                          value={state.printerPrice}
                          onChange={(event) =>
                            applyCalculatorChange(() => setField('printerPrice', event.currentTarget.valueAsNumber || 0))
                          }
                        />
                      </InputFrame>
                    </Field>

                    <Field label={t('tool.printerLife')}>
                      <InputFrame suffix="h">
                        <NumberInput
                          type="number"
                          min={1}
                          value={state.printerLife}
                          onChange={(event) =>
                            applyCalculatorChange(() => setField('printerLife', event.currentTarget.valueAsNumber || 1))
                          }
                        />
                      </InputFrame>
                    </Field>
                  </div>
                ) : null}
              </SectionCard>

            </form>
          </Surface>
        </div>

        <div className="grid gap-6">
          <Surface as="section" className="p-6 lg:p-7" data-testid="result-panel">
            <PanelHeader title={t('tool.resultsTitle')} subtitle={t('tool.resultsSubtitle')} />

            <div className="mt-6 rounded-3xl border border-teal-400/15 bg-linear-to-b from-teal-400/12 to-teal-400/5 p-5">
              <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-300">{t('tool.costPerItem')}</div>
              <div className="mt-2 text-5xl font-black tracking-tight text-slate-50">
                {formatCurrencyByLang(results.costPerItem, lang)}
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <MetricRow label={t('tool.material')} value={formatCurrencyByLang(results.materialPerItem, lang)} />
              <MetricRow label={t('tool.electricity')} value={formatCurrencyByLang(results.energyPerItem, lang)} />
              {effectiveState.wearEnabled ? <MetricRow label={t('tool.wearCost')} value={formatCurrencyByLang(results.wearPerItem, lang)} /> : null}
            </div>

            <div className="mt-4 grid gap-3">
              <SummaryTile label={t('tool.totalCost')} value={formatCurrencyByLang(results.orderTotalCost, lang)} tone="primary" />
              <SummaryTile label={t('tool.totalMaterial')} value={formatWeight(results.orderTotalWeight, lang)} tone="amber" />
              <SummaryTile label={t('tool.totalTime')} value={formatTime(results.orderTotalTime, lang)} tone="sky" />
            </div>
          </Surface>

          <Surface as="section" className="p-6 lg:p-7" data-testid="quote-panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <PanelHeader title={t('tool.quoteTitle')} subtitle={t('tool.quoteSubtitle')} />

              <CopyButton onClick={() => copy(quoteText)}>{copyLabel}</CopyButton>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="grid gap-4">
                <Field label={t('tool.profitMargin')}>
                  <NumberInput
                    type="number"
                    min={0}
                    value={state.profitMargin}
                    onChange={(event) =>
                      applyCalculatorChange(() => setField('profitMargin', event.currentTarget.valueAsNumber || 0))
                    }
                  />
                </Field>

                <Field label={t('tool.vat')}>
                  <select
                    className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-slate-50 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
                    value={state.taxRate}
                    onChange={(event) => applyCalculatorChange(() => setField('taxRate', Number(event.currentTarget.value)))}
                  >
                    <option value={19}>{t('tool.quoteVat19')}</option>
                    <option value={7}>{t('tool.quoteVat7')}</option>
                    <option value={0}>{t('tool.quoteVat0')}</option>
                  </select>
                </Field>

                <Field label={t('tool.setupFee')} hint={lang === 'de' ? 'Einmalige Kosten für den Auftrag.' : 'One-off costs for the job.'}>
                  <InputFrame suffix="€">
                    <NumberInput
                      type="number"
                      min={0}
                      step={1}
                      value={state.setupFee}
                      onChange={(event) =>
                        applyCalculatorChange(() => setField('setupFee', event.currentTarget.valueAsNumber || 0))
                      }
                    />
                  </InputFrame>
                </Field>

                <Field label={t('tool.pricingMode')}>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        pricingMode === 'classic'
                          ? 'border-teal-400/30 bg-teal-400/10 text-teal-100'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => setPricingMode('classic')}
                    >
                      {t('tool.pricingModeClassic')}
                    </button>
                    <button
                      type="button"
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        pricingMode === 'target'
                          ? 'border-teal-400/30 bg-teal-400/10 text-teal-100'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => setPricingMode('target')}
                    >
                      {t('tool.pricingModeTarget')}
                    </button>
                  </div>
                </Field>

                {pricingMode === 'target' ? (
                  <>
                    <p className="text-xs text-teal-300">{t('tool.fixedValueHint')}</p>

                    <Field label={t('tool.targetGrossPerItem')}>
                      <InputFrame suffix="€">
                        <NumberInput
                          type="number"
                          min={0}
                          step={0.01}
                          value={targetGrossPerItem}
                          onChange={(event) => setTargetGrossPerItem(event.currentTarget.valueAsNumber || 0)}
                        />
                      </InputFrame>
                    </Field>

                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                      <strong className="block text-xs uppercase tracking-[0.14em] text-slate-400">{t('tool.variableValueLabel')}</strong>
                      <span className="mt-1 block font-semibold text-slate-50">
                        {t('tool.printerPrice')}: {formatCurrencyByLang(solvedPrinterPrice ?? 0, lang)}
                      </span>
                    </div>

                    {solvedPrinterPrice === null ? (
                      <p className="text-xs text-amber-300">{t('tool.targetImpossible')}</p>
                    ) : null}

                    <p className="text-xs text-slate-400">{t('tool.targetModeResetsOnEdit')}</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">{t('tool.classicModeHint')}</p>
                )}
              </div>

              <div className="grid gap-3 rounded-3xl border border-indigo-400/15 bg-linear-to-b from-indigo-400/10 to-slate-950/60 p-5">
                <SummaryRow label={t('tool.quoteNet')} value={formatCurrencyByLang(results.netTotal, lang)} tone="primary" divider />
                <SummaryRow label={t('tool.quoteMarkup')} value={`+ ${formatCurrencyByLang(results.markupTotal, lang)}`} tone="positive" />
                <SummaryRow label={t('tool.quoteGross')} value={formatCurrencyByLang(results.grossTotal, lang)} />

                <div className="mt-1 rounded-[22px] border border-indigo-300/15 bg-indigo-400/10 p-5">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-lg font-semibold text-slate-200">{lang === 'de' ? 'Gesamt' : 'Grand total'}</span>
                    <strong className="text-4xl font-black tracking-tight text-indigo-100">
                      {formatCurrencyByLang(results.grossTotal, lang)}
                    </strong>
                  </div>
                  <p className="mt-2 text-sm font-medium text-indigo-200/80">
                    {formatCurrencyByLang(results.grossPerItem, lang)} {t('tool.perItemLabel')}
                  </p>
                </div>
              </div>
            </div>
          </Surface>
        </div>
      </div>
      </div>
    </main>
  );
}

function formatQuoteDate(timestamp: number, lang: 'en' | 'de') {
  return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(timestamp));
}

function Tag({ children }: { children: string }) {
  return <span className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-slate-300">{children}</span>;
}
