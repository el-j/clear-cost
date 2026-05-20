import type { ComponentPropsWithoutRef, ReactNode } from 'react';

const surfaceStyles =
  'rounded-[28px] border border-white/10 bg-slate-950/70 shadow-[0_24px_90px_rgba(3,7,18,0.35)] backdrop-blur-xl';

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'aside' | 'header';
} & ComponentPropsWithoutRef<'div'>;

export function Surface({ children, className = '', as: Component = 'div', ...rest }: SurfaceProps) {
  return (
    <Component {...rest} className={`${surfaceStyles} ${className}`.trim()}>
      {children}
    </Component>
  );
}

type PanelHeaderProps = {
  title: string;
  subtitle: string;
};

export function PanelHeader({ title, subtitle }: PanelHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{subtitle}</p>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  tone: 'blue' | 'slate';
  children: ReactNode;
};

const sectionToneStyles: Record<SectionCardProps['tone'], string> = {
  blue: 'border-blue-400/15 bg-linear-to-b from-blue-500/15 to-blue-500/5',
  slate: 'border-white/10 bg-linear-to-b from-white/5 to-slate-950/40',
};

export function SectionCard({ title, tone, children }: SectionCardProps) {
  return (
    <section className={`rounded-[22px] border p-5 ${sectionToneStyles[tone]}`}>
      <div className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-300">{title}</div>
      {children}
    </section>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, hint, children, className = '' }: FieldProps) {
  return (
    <label className={`grid gap-2 ${className}`.trim()}>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

type InputFrameProps = {
  children: ReactNode;
  suffix?: string;
};

export function InputFrame({ children, suffix }: InputFrameProps) {
  return (
    <div className="relative">
      {children}
      {suffix ? (
        <span className="pointer-events-none absolute right-0 top-0 grid h-11 w-12 place-items-center rounded-r-2xl text-sm text-slate-400">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

type NumberInputProps = ComponentPropsWithoutRef<'input'>;

export function NumberInput(props: NumberInputProps) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 text-slate-50 outline-none transition focus:border-teal-400/70 focus:ring-4 focus:ring-teal-400/10 ${props.className ?? ''}`.trim()}
    />
  );
}

type MetricRowProps = {
  label: string;
  value: string;
};

export function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-950/30 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <strong className="text-sm text-slate-50">{value}</strong>
    </div>
  );
}

type SummaryTileProps = {
  label: string;
  value: string;
  tone: 'primary' | 'amber' | 'sky';
};

const summaryToneStyles: Record<SummaryTileProps['tone'], string> = {
  primary: 'border-teal-400/20 bg-teal-400/10',
  amber: 'border-amber-400/20 bg-amber-400/10',
  sky: 'border-sky-400/20 bg-sky-400/10',
};

export function SummaryTile({ label, value, tone }: SummaryTileProps) {
  return (
    <div className={`grid gap-2 rounded-2xl border p-4 ${summaryToneStyles[tone]}`}>
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <strong className="text-base font-semibold text-slate-50">{value}</strong>
    </div>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  tone?: 'primary' | 'positive' | 'muted';
  divider?: boolean;
};

const summaryRowStyles: Record<NonNullable<SummaryRowProps['tone']>, string> = {
  primary: 'border-teal-400/20 bg-teal-400/10',
  positive: 'border-teal-400/15 bg-teal-400/5',
  muted: 'border-white/5 bg-slate-950/25',
};

export function SummaryRow({ label, value, tone = 'muted', divider = false }: SummaryRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 ${summaryRowStyles[tone]} ${
        divider ? 'ring-1 ring-white/10' : ''
      }`}
    >
      <span className="text-sm text-slate-400">{label}</span>
      <strong className="text-sm text-slate-50">{value}</strong>
    </div>
  );
}

type ToggleButtonProps = {
  active: boolean;
  onClick: () => void;
  label: string;
};

export function ToggleButton({ active, onClick, label }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-left text-slate-50 transition hover:-translate-y-px hover:border-teal-400/30"
      aria-expanded={active}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-teal-400/15 text-teal-200' : 'bg-white/8 text-slate-300'}`}>
        {active ? 'An' : 'Aus'}
      </span>
    </button>
  );
}

type CopyButtonProps = {
  children: ReactNode;
  onClick: () => void;
};

export function CopyButton({ children, onClick }: CopyButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm font-medium text-slate-50 transition hover:-translate-y-px hover:border-violet-300/40 hover:bg-violet-400/15"
    >
      {children}
    </button>
  );
}
