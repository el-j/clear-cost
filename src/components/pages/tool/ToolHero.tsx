import { formatCurrencyByLang, type AppLang, type CalculatorResults } from '../../../lib/calculator';
import type { SavedProject } from '../../../store/projectStore';
import { Surface } from '../../ui';

type Translate = (key: string) => string;

type Props = {
  t: Translate;
  lang: AppLang;
  projectName: string;
  projectCustomer: string;
  projectStatus: 'draft' | 'quoted' | 'in-progress' | 'done';
  activeSavedProject?: SavedProject;
  results: CalculatorResults;
};

export function ToolHero({ t, lang, projectName, projectCustomer, projectStatus, activeSavedProject, results }: Props) {
  const quoteCount = Array.isArray(activeSavedProject?.quotes) ? activeSavedProject.quotes.length : 0;
  const projectStatusKey =
    projectStatus === 'in-progress' ? 'Working' : projectStatus === 'quoted' ? 'Quoted' : projectStatus === 'done' ? 'Done' : 'Draft';

  return (
    <Surface as="header" className="grid min-w-0 gap-6 p-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:p-8">
      <div className="min-w-0">
        <span className="inline-flex rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-teal-200">
          {t('tool.heroBadge')}
        </span>
        <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-slate-50 sm:text-5xl lg:text-7xl">{t('tool.heroTitle')}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">{t('tool.heroBody')}</p>

        <div className="mt-6 grid gap-4 rounded-4xl border border-white/10 bg-slate-950/65 p-5 shadow-[0_24px_90px_rgba(3,7,18,0.28)] lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-300">{t('tool.projectContext')}</div>
            <div className="mt-2 text-lg font-semibold text-slate-50">{projectName || t('projects.unnamed')}</div>
            <div className="mt-1 text-sm text-slate-400">
              {projectCustomer || t('projects.noCustomer')} · {t(`tool.projectStatus${projectStatusKey}`)}
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
              <Tag>{activeSavedProject ? `${quoteCount} ${t('projects.quotesSaved')}` : t('projects.draft')}</Tag>
              <Tag>{formatCurrencyByLang(results.grossTotal, lang)}</Tag>
              <Tag>{`${formatCurrencyByLang(results.grossPerItem, lang)} ${t('tool.perItemLabel')}`}</Tag>
            </div>
          </div>
        </div>
      </div>

        <div className="min-w-0 overflow-hidden rounded-[26px] border border-teal-400/15 bg-slate-950/80 p-5" data-testid="hero-badge">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{t('tool.priceLabel')}</div>
          <div className="mt-8 text-[clamp(2rem,7vw,3.4rem)] font-black leading-none tracking-tight text-slate-50 wrap-anywhere sm:mt-14">
          {formatCurrencyByLang(results.grossTotal, lang)}
        </div>
        <div className="mt-4 text-sm font-semibold text-teal-300">
          {formatCurrencyByLang(results.grossPerItem, lang)} {t('tool.perItemLabel')}
        </div>
      </div>
    </Surface>
  );
}

function Tag({ children }: { children: string }) {
  return <span className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-2 text-sm text-slate-300">{children}</span>;
}
