import { useT } from '../../i18n/index';

export function AboutPage() {
  const t = useT();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_90px_rgba(3,7,18,0.35)] backdrop-blur-xl sm:p-8">
        <h1 className="bg-linear-to-br from-teal-300 to-indigo-300 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-5xl">
          {t('about.title')}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{t('about.intro')}</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card title={t('about.whyHeading')} body={t('about.whyBody')} />
          <Card title={t('about.mobileHeading')} body={t('about.mobileBody')} />
          <Card title={t('about.projectHeading')} body={t('about.projectBody')} />
          <Card title={t('about.openSourceHeading')} body={t('about.openSourceBody')} />
        </div>

        <a
          href="https://github.com/el-j/clear-cost"
          target="_blank"
          rel="noreferrer noopener"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-3 text-sm font-semibold text-teal-100 transition hover:-translate-y-px hover:border-teal-300/40 hover:bg-teal-400/15"
        >
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .5C5.65.5.5 5.76.5 12.23c0 5.17 3.29 9.56 7.86 11.1.58.11.79-.26.79-.58 0-.28-.01-1.01-.01-1.98-3.2.72-3.88-1.57-3.88-1.57-.52-1.35-1.28-1.71-1.28-1.71-1.05-.74.08-.73.08-.73 1.16.08 1.78 1.23 1.78 1.23 1.03 1.8 2.69 1.28 3.34.98.1-.77.4-1.29.73-1.59-2.56-.3-5.25-1.31-5.25-5.84 0-1.29.45-2.34 1.18-3.16-.12-.3-.52-1.5.11-3.13 0 0 .96-.32 3.15 1.21a10.6 10.6 0 0 1 2.87-.4c.98 0 1.97.13 2.87.4 2.19-1.53 3.15-1.21 3.15-1.21.63 1.63.23 2.83.11 3.13.73.82 1.18 1.87 1.18 3.16 0 4.54-2.7 5.54-5.27 5.83.41.36.77 1.07.77 2.16 0 1.56-.01 2.82-.01 3.2 0 .32.21.7.8.58 4.57-1.54 7.85-5.93 7.85-11.1C23.5 5.76 18.35.5 12 .5Z" />
          </svg>
          {t('about.githubButton')}
        </a>
      </section>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-[22px] border border-white/10 bg-white/5 p-5">
      <h2 className="text-base font-semibold text-slate-50">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </article>
  );
}
