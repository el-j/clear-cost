import { NavLink } from 'react-router-dom';
import { useI18n, useT, type Lang } from '../../i18n/index';

const navItems = [
  { to: '/', labelKey: 'nav.tool' },
  { to: '/projects', labelKey: 'nav.projects' },
  { to: '/about', labelKey: 'nav.about' },
] as const;

export function Header() {
  const t = useT();
  const { lang, setLang } = useI18n();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Clear Cost</div>
            <p className="text-sm text-slate-400">{t('header.tagline')}</p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <span className="hidden sm:inline">{t('header.langLabel')}</span>
            <select
              className="h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-50 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10"
              value={lang}
              onChange={(event) => setLang(event.target.value as Lang)}
              aria-label={t('header.langLabel')}
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </label>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-teal-400/30 bg-teal-400/10 text-teal-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
