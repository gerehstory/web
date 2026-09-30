import { cn } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl bg-white p-6 sm:p-8', className)}>{children}</div>;
}
