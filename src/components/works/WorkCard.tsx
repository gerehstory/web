import Link from 'next/link';
import type { Work } from '@/types/api';
import { Badge, RevisionStatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { chapterExcerpt, displayRevision, workTitle } from '@/lib/works';
import { fullName } from '@/lib/labels';
import { Heart, MessageCircle } from 'lucide-react';

export function WorkCard({ work, showStatus, href }: { work: Work; showStatus?: boolean; href?: string }) {
  const revision = displayRevision(work, showStatus);
  const to = href ?? `/works/${work.id}`;

  return (
    <Link
      href={to}
      className="group flex flex-col rounded-xl bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-zinc-900">{workTitle(work, showStatus)}</h3>
        {showStatus && <RevisionStatusBadge status={revision?.status} />}
      </div>

      <p className="mb-4 line-clamp-3 flex-1 text-sm text-zinc-600">{chapterExcerpt(revision)}</p>

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3">
        {work.type && <Badge>{work.type.name}</Badge>}
        {work.genres?.map(genre => (
          <Badge key={genre.id}>{genre.name}</Badge>
        ))}
        <span className="mr-auto text-xs text-zinc-400">{formatDate(revision?.createdAt ?? work.createdAt)}</span>
      </div>

      <div className="mt-2 flex items-center gap-8 text-xs text-zinc-500">
        <div className="flex items-center gap-1">
          {work.likes?.length ?? 0}
          <Heart size={16} />
        </div>
        <div className="flex items-center gap-1">
          <span>{work.comments?.length ?? 0}</span>
          <MessageCircle size={14} />
        </div>
        {work.user && <span className="mr-auto">{fullName(work.user)}</span>}
      </div>
    </Link>
  );
}
