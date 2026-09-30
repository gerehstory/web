import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 transition-colors outline-none',
          error ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-black',
          className
        )}
        {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
