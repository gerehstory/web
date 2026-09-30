import type { Chapter, Revision, Work } from '@/types/api';

export function sortRevisions(revisions: Revision[] = []) {
  return [...revisions].sort((a, b) => b.version - a.version);
}

export function latestRevision(work: Work): Revision | undefined {
  return sortRevisions(work.revisions)[0] ?? work.publishedRevision ?? undefined;
}

export function publishedRevision(work: Work): Revision | undefined {
  if (work.publishedRevision) return work.publishedRevision;
  return sortRevisions(work.revisions).find(r => r.status === 'approved');
}

export function displayRevision(work: Work, preferLatest = false): Revision | undefined {
  if (preferLatest) return latestRevision(work);
  return publishedRevision(work) ?? latestRevision(work);
}

export function sortedChapters(chapters: Chapter[] = []) {
  return [...chapters].sort((a, b) => a.position - b.position);
}

export function chapterExcerpt(revision?: Revision, max = 160) {
  const text = sortedChapters(revision?.chapters)
    .map(ch => ch.content)
    .join(' ')
    .trim();
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function workTitle(work: Work, preferLatest = false) {
  return displayRevision(work, preferLatest)?.title ?? 'بدون عنوان';
}
