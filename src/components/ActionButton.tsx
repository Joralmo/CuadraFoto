import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ActionButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: 'default' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost';
  }
>;

export function ActionButton({
  children,
  className = '',
  size = 'default',
  type = 'button',
  variant = 'primary',
  ...props
}: ActionButtonProps) {
  const sizeClass =
    size === 'large'
      ? 'min-h-16 rounded-[1.65rem] px-6 text-base'
      : 'min-h-14 rounded-2xl px-5 text-sm';
  const variantClass =
    variant === 'secondary'
      ? 'border border-black/10 bg-white text-ink hover:bg-mist'
      : variant === 'ghost'
        ? 'bg-transparent text-ink hover:bg-white/70'
        : 'bg-ink text-white hover:bg-black';

  return (
    <button
      type={type}
      className={`inline-flex w-full items-center justify-center font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
