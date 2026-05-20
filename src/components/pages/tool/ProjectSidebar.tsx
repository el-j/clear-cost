import type { AppLang, CalculatorResults, ProjectState } from '../../../lib/calculator';
import { formatCurrencyByLang, formatQuoteDate } from '../../../lib/calculator';
import type { SavedProject } from '../../../store/projectStore';
import { Surface } from '../../ui';

type Translate = (key: string) => string;

type Props = {
  t: Translate;
  lang: AppLang;
  project: ProjectState;
  activeSavedProject?: SavedProject;
  activeProjectId: string | null;
  projects: SavedProject[];
  sortedQuotes: SavedProject['quotes'];
  results: CalculatorResults;
  onSetProjectField: <K extends keyof ProjectState>(field: K, value: ProjectState[K]) => void;
  onSaveCurrentProject: () => void;
  onCreateNewProject: () => void;
  onActivateProject: (projectId: string) => void;
  onLoadProjectQuote: (quoteId: string, generatedAt: number) => void;
  onSaveQuoteSnapshot: () => void;
  onStartNewQuote: () => void;
};

export function ProjectSidebar({
  t,
  lang,
  project,
  activeSavedProject,
  activeProjectId,
  projects,
  sortedQuotes,
  results,
  onSetProjectField,
  onSaveCurrentProject,
  onCreateNewProject,
  onActivateProject,
  onLoadProjectQuote,
  onSaveQuoteSnapshot,
  onStartNewQuote,
}: Props) {
  const isQuoteActive = (quoteId: string, generatedAt: number) => {
    if (!activeSavedProject) {
      return false;
    }

    if (activeSavedProject.activeQuoteGeneratedAt !== undefined) {
      return activeSavedProject.activeQuoteId === quoteId && activeSavedProject.activeQuoteGeneratedAt === generatedAt;
    }

    return activeSavedProject.activeQuoteId === quoteId;
  };

  return (
    <Surface as="aside" className="h-fit p-5 xl:sticky xl:top-24">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">{t('tool.sidebarProjectBadge')}</div>
      <h2 className="mt-2 text-xl font-semibold text-slate-50">{project.name || t('projects.unnamed')}</h2>
      <p className="mt-1 text-sm text-slate-400">{project.customer || t('projects.noCustomer')}</p>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{t('tool.projectName')}</span>
          <input
            value={project.name}
            onChange={(event) => onSetProjectField('name', event.currentTarget.value)}
            className="h-10 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{t('tool.customerName')}</span>
          <input
            value={project.customer}
            onChange={(event) => onSetProjectField('customer', event.currentTarget.value)}
            className="h-10 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-slate-100 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{t('tool.projectStatus')}</span>
          <select
            value={project.status}
            onChange={(event) => onSetProjectField('status', event.currentTarget.value as typeof project.status)}
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
          onClick={onSaveCurrentProject}
          className="rounded-xl border border-teal-400/20 bg-teal-400/10 px-3 py-2 text-sm font-medium text-teal-100 transition hover:border-teal-300/40"
        >
          {t('tool.sidebarSaveProject')}
        </button>
        <button
          type="button"
          onClick={onCreateNewProject}
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
            sortedQuotes.map((quote, index) => (
              <button
                key={`${quote.id}-${index}`}
                type="button"
                onClick={() => onLoadProjectQuote(quote.id, quote.generatedAt)}
                className={`grid gap-1 rounded-xl border px-3 py-2 text-left transition ${
                  isQuoteActive(quote.id, quote.generatedAt)
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
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">{t('projects.emptyState')}</div>
          ) : (
            [...projects]
              .sort((left, right) => right.updatedAt - left.updatedAt)
              .map((savedProject) => (
                <button
                  key={savedProject.id}
                  type="button"
                  onClick={() => onActivateProject(savedProject.id)}
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

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="grid gap-2">
          <button
            type="button"
            className="rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-3 text-sm font-medium text-teal-100 transition hover:-translate-y-px hover:border-teal-300/40 hover:bg-teal-400/15"
            onClick={onSaveQuoteSnapshot}
          >
            {t('tool.saveQuote')}
          </button>
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10"
            onClick={onStartNewQuote}
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
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
          {t('projects.latestQuote')}: {formatCurrencyByLang(results.grossTotal, lang)}
        </div>
      </div>
    </Surface>
  );
}
