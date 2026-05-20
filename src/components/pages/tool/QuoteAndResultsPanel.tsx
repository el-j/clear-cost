import type { AppLang, CalculatorResults, CalculatorState } from '../../../lib/calculator';
import { formatCurrencyByLang, formatTime, formatWeight } from '../../../lib/calculator';
import { CopyButton, Field, InputFrame, MetricRow, NumberInput, PanelHeader, SummaryRow, SummaryTile, Surface } from '../../ui';

type Translate = (key: string) => string;

type Props = {
  t: Translate;
  lang: AppLang;
  state: CalculatorState;
  results: CalculatorResults;
  effectiveWearEnabled: boolean;
  copyLabel: string;
  quoteText: string;
  onCopyQuote: (text: string) => void;
  pricingMode: 'classic' | 'target';
  targetGrossPerItem: number;
  solvedPrinterPrice: number | null;
  onSetPricingMode: (mode: 'classic' | 'target') => void;
  onSetTargetGrossPerItem: (value: number) => void;
  onSetField: (field: Exclude<keyof CalculatorState, 'wearEnabled'>, value: number) => void;
};

export function QuoteAndResultsPanel({
  t,
  lang,
  state,
  results,
  effectiveWearEnabled,
  copyLabel,
  quoteText,
  onCopyQuote,
  pricingMode,
  targetGrossPerItem,
  solvedPrinterPrice,
  onSetPricingMode,
  onSetTargetGrossPerItem,
  onSetField,
}: Props) {
  return (
    <div className="grid gap-6 min-w-0">
      <Surface as="section" className="p-6 lg:p-7" data-testid="result-panel">
        <PanelHeader title={t('tool.resultsTitle')} subtitle={t('tool.resultsSubtitle')} />

        <div className="mt-6 rounded-3xl border border-teal-400/15 bg-linear-to-b from-teal-400/12 to-teal-400/5 p-5">
          <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-teal-300">{t('tool.costPerItem')}</div>
          <div className="mt-2 text-5xl font-black tracking-tight text-slate-50">{formatCurrencyByLang(results.costPerItem, lang)}</div>
        </div>

        <div className="mt-4 grid gap-3">
          <MetricRow label={t('tool.material')} value={formatCurrencyByLang(results.materialPerItem, lang)} />
          <MetricRow label={t('tool.electricity')} value={formatCurrencyByLang(results.energyPerItem, lang)} />
          {effectiveWearEnabled ? <MetricRow label={t('tool.wearCost')} value={formatCurrencyByLang(results.wearPerItem, lang)} /> : null}
        </div>

        <div className="mt-4 grid gap-3">
          <SummaryTile label={t('tool.totalCost')} value={formatCurrencyByLang(results.orderTotalCost, lang)} tone="primary" />
          <SummaryTile label={t('tool.totalMaterial')} value={formatWeight(results.orderTotalWeight, lang)} tone="amber" />
          <SummaryTile label={t('tool.totalTime')} value={formatTime(results.orderTotalTime, lang)} tone="sky" />
        </div>
      </Surface>

      <Surface as="section" className="min-w-0 overflow-hidden p-6 lg:p-7" data-testid="quote-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <PanelHeader title={t('tool.quoteTitle')} subtitle={t('tool.quoteSubtitle')} />

          <div className="w-full lg:w-auto lg:shrink-0">
            <CopyButton onClick={() => onCopyQuote(quoteText)}>{copyLabel}</CopyButton>
          </div>
        </div>

        <div className="mt-6 grid gap-5 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid min-w-0 gap-4">
            <Field label={t('tool.profitMargin')}>
              <NumberInput
                type="number"
                min={0}
                value={state.profitMargin}
                onChange={(event) => onSetField('profitMargin', event.currentTarget.valueAsNumber || 0)}
              />
            </Field>

            <Field label={t('tool.vat')}>
              <select
                className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-slate-50 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
                value={state.taxRate}
                onChange={(event) => onSetField('taxRate', Number(event.currentTarget.value))}
              >
                <option value={19}>{t('tool.quoteVat19')}</option>
                <option value={7}>{t('tool.quoteVat7')}</option>
                <option value={0}>{t('tool.quoteVat0')}</option>
              </select>
            </Field>

            <Field label={t('tool.setupFee')} hint={lang === 'de' ? 'Einmalige Kosten fur den Auftrag.' : 'One-off costs for the job.'}>
              <InputFrame suffix="€">
                <NumberInput
                  type="number"
                  min={0}
                  step={1}
                  value={state.setupFee}
                  onChange={(event) => onSetField('setupFee', event.currentTarget.valueAsNumber || 0)}
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
                  onClick={() => onSetPricingMode('classic')}
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
                  onClick={() => onSetPricingMode('target')}
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
                      onChange={(event) => onSetTargetGrossPerItem(event.currentTarget.valueAsNumber || 0)}
                    />
                  </InputFrame>
                </Field>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  <strong className="block text-xs uppercase tracking-[0.14em] text-slate-400">{t('tool.variableValueLabel')}</strong>
                  <span className="mt-1 block font-semibold text-slate-50">
                    {t('tool.printerPrice')}: {formatCurrencyByLang(solvedPrinterPrice ?? 0, lang)}
                  </span>
                </div>

                {solvedPrinterPrice === null ? <p className="text-xs text-amber-300">{t('tool.targetImpossible')}</p> : null}

                <p className="text-xs text-slate-400">{t('tool.targetModeResetsOnEdit')}</p>
              </>
            ) : (
              <p className="text-xs text-slate-400">{t('tool.classicModeHint')}</p>
            )}
          </div>

          <div className="grid min-w-0 gap-3 rounded-3xl border border-indigo-400/15 bg-linear-to-b from-indigo-400/10 to-slate-950/60 p-5">
            <SummaryRow label={t('tool.quoteNet')} value={formatCurrencyByLang(results.netTotal, lang)} tone="primary" divider />
            <SummaryRow label={t('tool.quoteMarkup')} value={`+ ${formatCurrencyByLang(results.markupTotal, lang)}`} tone="positive" />
            <SummaryRow label={t('tool.quoteGross')} value={formatCurrencyByLang(results.grossTotal, lang)} />

            <div className="mt-1 min-w-0 rounded-[22px] border border-indigo-300/15 bg-indigo-400/10 p-5">
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
                <span className="text-lg font-semibold text-slate-200">{lang === 'de' ? 'Gesamt' : 'Grand total'}</span>
                <strong className="max-w-full text-right text-[clamp(1.8rem,6vw,2.25rem)] font-black leading-none tracking-tight text-indigo-100 wrap-anywhere">
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
  );
}
