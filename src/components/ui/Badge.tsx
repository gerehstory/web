import { cn } from '@/lib/utils';
import type { CompetitionStatus, RevisionStatus } from '@/types/api';
import { competitionStatusLabel, revisionStatusLabel } from '@/lib/labels';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700',
  success: 'bg-taupe-100 text-taupe-800',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};

const revisionVariant: Record<RevisionStatus, BadgeVariant> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const competitionVariant: Record<CompetitionStatus, BadgeVariant> = {
  draft: 'default',
  open: 'success',
  first_round: 'warning',
  second_round: 'warning',
  tie_break: 'warning',
  completed: 'success',
  cancelled: 'danger',
  no_qualified: 'default',
};

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}>
      {children}
    </span>
  );
}

export function RevisionStatusBadge({ status }: { status?: RevisionStatus }) {
  if (!status) return null;
  return <Badge variant={revisionVariant[status]}>{revisionStatusLabel[status]}</Badge>;
}

export function CompetitionStatusBadge({ status }: { status: CompetitionStatus }) {
  return <Badge variant={competitionVariant[status]}>{competitionStatusLabel[status]}</Badge>;
}
