import { useI18n, useT } from '../../i18n/index';
import { formatCurrencyByLang } from '../../lib/calculator';
import { useProjectStore } from '../../store/projectStore';
import { useQuoteStore } from '../../store/quoteStore';

export function ProjectsPage() {
  const t = useT();
  const { lang } = useI18n();
  const currentProject = useProjectStore((state) => state.currentProject);
  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const projects = useProjectStore((state) => state.projects);
  const setCurrentField = useProjectStore((state) => state.setCurrentField);
  const saveCurrentProject = useProjectStore((state) => state.saveCurrentProject);
  const loadProject = useProjectStore((state) => state.loadProject);
  const duplicateProject = useProjectStore((state) => state.duplicateProject);
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const newProject = useProjectStore((state) => state.newProject);
  const setQuote = useQuoteStore((state) => state.setQuote);
  const resetQuote = useQuoteStore((state) => state.resetQuote);

  const sortedProjects = [...projects].sort((left, right) => right.updatedAt - left.updatedAt);

  return (
    <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="grid gap-6 rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_rgba(3,7,18,0.35)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_360px] lg:p-8">
        <div>
          <span className="inline-flex rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-teal-200">
            {t('projects.heroBadge')}
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-50 sm:text-5xl">{t('projects.title')}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{t('projects.intro')}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Stat label={t('projects.savedCount')} value={String(projects.length)} />
            <Stat label={t('projects.activeProject')} value={activeProjectId ? t('projects.saved') : t('projects.draft')} />
            <Stat label={t('projects.autoSaved')} value={t('projects.autoSavedValue')} />
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold text-slate-50">{t('projects.currentTitle')}</h2>
          <p className="mt-1 text-sm text-slate-400">{t('projects.currentBody')}</p>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">{t('tool.projectName')}</span>
              <input
                className="h-11 rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-slate-50 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
                value={currentProject.name}
                onChange={(event) => setCurrentField('name', event.currentTarget.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">{t('tool.customerName')}</span>
              <input
                className="h-11 rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-slate-50 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
                value={currentProject.customer}
                onChange={(event) => setCurrentField('customer', event.currentTarget.value)}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">{t('tool.projectStatus')}</span>
              <select
                className="h-11 rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-slate-50 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
                value={currentProject.status}
                onChange={(event) => setCurrentField('status', event.currentTarget.value as typeof currentProject.status)}
              >
                <option value="draft">{t('tool.projectStatusDraft')}</option>
                <option value="quoted">{t('tool.projectStatusQuoted')}</option>
                <option value="in-progress">{t('tool.projectStatusWorking')}</option>
                <option value="done">{t('tool.projectStatusDone')}</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">{t('tool.projectNote')}</span>
              <textarea
                className="min-h-28 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-50 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
                value={currentProject.note}
                onChange={(event) => setCurrentField('note', event.currentTarget.value)}
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-3 text-sm font-medium text-teal-100 transition hover:-translate-y-px hover:border-teal-300/40 hover:bg-teal-400/15"
              onClick={() => saveCurrentProject()}
            >
              {t('projects.saveCurrent')}
            </button>
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10"
              onClick={newProject}
            >
              {t('projects.newProject')}
            </button>
          </div>
        </aside>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_rgba(3,7,18,0.35)] backdrop-blur-xl lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50">{t('projects.libraryTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{t('projects.libraryBody')}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {sortedProjects.length === 0 ? (
            <div className="rounded-[22px] border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
              {t('projects.emptyState')}
            </div>
          ) : (
            sortedProjects.map((project) => (
              <article key={project.id} className="rounded-[22px] border border-white/10 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50">{project.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {project.customer || t('projects.noCustomer')} · {t(`tool.projectStatus${project.status === 'in-progress' ? 'Working' : project.status === 'quoted' ? 'Quoted' : project.status === 'done' ? 'Done' : 'Draft'}`)}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                      {t('projects.quoteCount')}: {project.quotes.length}
                    </p>
                  </div>
                  {project.id === activeProjectId ? (
                    <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200">
                      {t('projects.active')}
                    </span>
                  ) : null}
                </div>

                {project.note ? <p className="mt-3 text-sm leading-6 text-slate-300">{project.note}</p> : null}

                {project.lastQuote ? (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{t('projects.latestQuote')}</div>
                    <div className="mt-2 font-semibold text-slate-50">{formatCurrencyByLang(project.lastQuote.grossTotal, lang)}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {formatCurrencyByLang(project.lastQuote.grossPerItem, lang)} {t('tool.perItemLabel')}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
                    onClick={() => {
                      const snapshot = loadProject(project.id);
                      if (snapshot) {
                        setQuote(snapshot.calculator);
                      } else {
                        resetQuote();
                      }
                    }}
                    type="button"
                  >
                    {t('projects.load')}
                  </button>
                  <button className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200" onClick={() => duplicateProject(project.id)} type="button">
                    {t('projects.duplicate')}
                  </button>
                  <button className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100" onClick={() => deleteProject(project.id)} type="button">
                    {t('projects.delete')}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/5 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="mt-2 text-base font-semibold text-slate-50">{value}</div>
    </div>
  );
}
