import type { PropsWithChildren } from 'react';

type SectionCardProps = PropsWithChildren<{
  bodyClassName?: string;
  className?: string;
  eyebrow: string;
  title: string;
  description: string;
}>;

export function SectionCard({
  bodyClassName = '',
  className = '',
  eyebrow,
  title,
  description,
  children
}: SectionCardProps) {
  return (
    <section
      className={`rounded-[2rem] border border-black/10 bg-white/80 p-4 shadow-soft backdrop-blur sm:p-5 ${className}`}
    >
      <div className="mb-4 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/45">
          {eyebrow}
        </p>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <p className="text-sm leading-6 text-black/65">{description}</p>
        </div>
      </div>

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
