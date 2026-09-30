'use client';

import type { FormEvent } from 'react';
import type { Book, BooksResponse } from '@/types/api';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = 'https://server.cheshmehdis.com/api/v1/search';
export default function BooksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') ?? '';
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const [search, setSearch] = useState(query);
  const [books, setBooks] = useState<BooksResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBooks() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}?page=${currentPage}&q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }

        const data: BooksResponse = await response.json();

        setBooks(data);
        setTotalResults(data.total);

        // Use the API's last_page if available.
        setTotalPages(data.items.to ?? 1);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error(error);

        setBooks(null);
        setTotalResults(0);
        setTotalPages(1);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchBooks();

    return () => controller.abort();
  }, [query, currentPage]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      router.push('/books');
      return;
    }

    router.push(`/books?q=${encodeURIComponent(value)}&page=1`);
  };

  const goToPage = (page: number) => {
    if (!query || page < 1 || page > totalPages) {
      return;
    }

    router.push(`/books?q=${encodeURIComponent(query)}&page=${page}`);
  };

  const hasResults = Boolean(books?.items?.data?.length);

  const visiblePages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    if (totalPages <= 5) {
      return index + 1;
    }

    if (currentPage <= 3) {
      return index + 1;
    }

    if (currentPage >= totalPages - 2) {
      return totalPages - 4 + index;
    }

    return currentPage - 2 + index;
  });

  return (
    <main className="mx-auto mt-16 min-h-screen max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
          کتاب مورد نظرتان را پیدا کنید
        </h1>

        <p className="mt-3 text-sm leading-6 text-neutral-500">در میان کتاب‌های نشر چشمه جستجو کنید.</p>
      </div>

      <section className="mx-auto mt-10 max-w-3xl">
        <form onSubmit={handleSearch}>
          <div className="flex h-14 items-center rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm transition focus-within:border-neutral-400 focus-within:shadow-md">
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="جستجو در کتاب‌های نشر چشمه..."
              className="min-w-0 flex-1 bg-transparent px-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />

            <button
              type="submit"
              className="h-11 rounded-xl bg-neutral-950 px-6 text-sm font-medium text-white transition hover:bg-neutral-800">
              جستجو
            </button>
          </div>
        </form>
      </section>

      {query && (
        <section className="mt-16">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-950">نتایج جستجو برای «{query}»</h2>

            {totalResults > 0 && (
              <p className="mt-1 text-sm text-neutral-500">{totalResults.toLocaleString('fa-IR')} نتیجه</p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse">
                  <div className="aspect-2/3 rounded-2xl bg-neutral-200" />
                  <div className="mt-3 h-4 w-4/5 rounded bg-neutral-200" />
                  <div className="mt-2 h-3 w-2/5 rounded bg-neutral-100" />
                </div>
              ))}
            </div>
          ) : hasResults ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {books?.items.data.map((book: Book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="mt-14 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40">
                    قبلی
                  </button>

                  <div className="flex items-center gap-1">
                    {visiblePages.map(page => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`h-9 min-w-9 rounded-xl px-3 text-sm ${
                          page === currentPage
                            ? 'bg-neutral-950 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}>
                        {page.toLocaleString('fa-IR')}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                    className="rounded-xl border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40">
                    بعدی
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-neutral-200 py-20 text-center">
              <h3 className="text-base font-semibold text-neutral-900">نتیجه‌ای پیدا نشد</h3>

              <p className="mt-2 text-sm text-neutral-500">عبارت دیگری را امتحان کنید.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

const BLUR_DATA_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="12"><rect width="8" height="12" fill="#e5e5e5"/></svg>'
)}`;

function BookCard({ book }: { book: Book }) {
  const [imageError, setImageError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-neutral-100">
        {book.intro_image && !imageError ? (
          <Image
            src={book.intro_image}
            alt={book.name}
            fill
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            onLoad={() => setLoaded(true)}
            onError={() => setImageError(true)}
            className={`bg-neutral-200 object-cover transition duration-1000 group-hover:scale-105 ${
              loaded ? 'opacity-100 blur-none' : 'opacity-0 blur-3xl delay-1000'
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">بدون تصویر</div>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm leading-6 font-medium text-neutral-900">{book.name}</h3>

      {book.author && <p className="mt-1 truncate text-xs text-neutral-500">{book.author}</p>}
    </Link>
  );
}
