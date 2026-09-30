import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-zinc-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-400',
          error ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-black',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
