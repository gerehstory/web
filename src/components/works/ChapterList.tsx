import { sortedChapters } from '@/lib/works';
import type { Chapter } from '@/types/api';

export function ChapterList({ chapters }: { chapters?: Chapter[] }) {
  const items = sortedChapters(chapters);

  if (items.length === 0) {
    return <p className="text-sm text-zinc-500">فصلی ثبت نشده است.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {items.map(chapter => (
        <section key={`${chapter.position}-${chapter.title}`}>
          <h2 className="mb-3 text-xl font-semibold text-zinc-900">
            {chapter.position}. {chapter.title}
          </h2>
          <p className="whitespace-pre-wrap leading-8 text-zinc-700">{chapter.content}</p>
        </section>
      ))}
    </div>
  );
}
