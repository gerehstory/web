import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
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
      <textarea
        id={inputId}
        className={cn(
          'min-h-24 resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors outline-none placeholder:text-zinc-400 focus:border-taupe-500 focus:ring-2 focus:ring-taupe-500/20',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
