import Link from 'next/link';
import type { Competition } from '@/types/api';
import { CompetitionStatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export function CompetitionCard({ competition, href }: { competition: Competition; href?: string }) {
  return (
    <Link
      href={href ?? `/competitions/${competition.id}`}
      className="block rounded-xl bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-zinc-900">{competition.name}</h3>
        <CompetitionStatusBadge status={competition.status} />
      </div>
      <p className="line-clamp-3 text-sm text-zinc-600">{competition.description}</p>
      <p className="mt-3 text-xs text-zinc-400">مهلت ارسال: {formatDate(competition.applicationDeadline)}</p>
    </Link>
  );
}
