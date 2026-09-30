import { Suspense } from 'react';

import BooksPage from './bookpage';

export default function Page() {
  return (
    <Suspense fallback={<BooksPageSkeleton />}>
      <BooksPage />
    </Suspense>
  );
}

function BooksPageSkeleton() {
  return (
    <main className="mx-auto mt-16 min-h-screen max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto h-10 w-72 animate-pulse rounded-lg bg-neutral-200" />
        <div className="mx-auto mt-3 h-5 w-80 animate-pulse rounded bg-neutral-100" />
      </div>

      <div className="mx-auto mt-10 h-14 max-w-3xl animate-pulse rounded-2xl bg-neutral-100" />

      <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse">
            <div className="aspect-[2/3] rounded-2xl bg-neutral-200" />
            <div className="mt-3 h-4 w-4/5 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-2/5 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
    </main>
  );
}
