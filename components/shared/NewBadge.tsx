'use client';

type NewBadgeProps = {
  className?: string;
  variant?: 'default' | 'small';
};

export default function NewBadge({
  className = '',
  variant = 'default',
}: NewBadgeProps) {
  const baseClasses =
    'absolute z-20 bg-black text-white font-semibold flex items-center justify-center';
  const variantClasses =
    variant === 'small'
      ? 'text-[10px] px-1.5 py-0.5 rounded-sm top-1 left-1'
      : 'text-xs px-2 py-1 rounded top-2 left-2';

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>NY</div>
  );
}
