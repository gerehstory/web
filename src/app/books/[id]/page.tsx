'use client';

import type { BookResponse } from '@/types/api';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_URL = 'https://server.cheshmehdis.com/api/v1/product';

export default function BookPage() {
  const { id } = useParams<{ id: string }>();

  const [book, setBook] = useState<BookResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function fetchBook() {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch book');
        }

        const data: BookResponse = await response.json();

        setBook(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error(error);
        setBook(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchBook();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="mb-8 h-4 w-24 rounded bg-neutral-200" />

          <div className="grid gap-10 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr]">
            <div className="aspect-2/3 rounded-3xl bg-neutral-200" />

            <div className="py-4">
              <div className="h-10 w-3/4 rounded bg-neutral-200" />
              <div className="mt-4 h-5 w-1/3 rounded bg-neutral-100" />

              <div className="mt-8 space-y-3">
                <div className="h-4 w-full rounded bg-neutral-100" />
                <div className="h-4 w-5/6 rounded bg-neutral-100" />
                <div className="h-4 w-4/6 rounded bg-neutral-100" />
              </div>

              <div className="mt-10 h-12 w-40 rounded-xl bg-neutral-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!book?.items) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-xl">
            کتاب
          </div>

          <h1 className="mt-5 text-lg font-semibold text-neutral-900">کتاب پیدا نشد</h1>

          <p className="mt-2 text-sm text-neutral-500">این کتاب وجود ندارد یا در حال حاضر در دسترس نیست.</p>

          <Link
            href="/books"
            className="mt-6 inline-flex rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800">
            بازگشت به کتاب‌ها
          </Link>
        </div>
      </main>
    );
  }

  const item = book.items;

  return (
    <main className="mx-auto mt-16 min-h-screen max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-950">
          <span aria-hidden>←</span>
          بازگشت به کتاب‌ها
        </Link>

        <section className="mt-8">
          <div className="grid gap-10 md:grid-cols-[280px_1fr] md:gap-12 lg:grid-cols-[340px_1fr] lg:gap-16">
            <div>
              <div className="relative aspect-2/3 overflow-hidden rounded-3xl bg-neutral-100 shadow-sm">
                {item.intro_image ? (
                  <Image
                    src={item.intro_image}
                    alt={item.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 70vw, 340px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                    بدون تصویر
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col py-2">
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
                {item.name}
              </h1>

              {item.author && <p className="mt-4 text-base text-neutral-600">{item.author}</p>}

              <div className="mt-8 h-px bg-neutral-200" />

              <div className="mt-8">
                <h2 className="text-sm font-semibold text-neutral-950">درباره کتاب</h2>

                {item.description ? (
                  <p className="mt-4 text-sm leading-8 whitespace-pre-line text-neutral-600">{item.description}</p>
                ) : (
                  <p className="mt-4 text-sm text-neutral-400">توضیحی برای این کتاب ثبت نشده است.</p>
                )}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {item.author && (
                  <div className="rounded-2xl border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-400">نویسنده</p>
                    <p className="mt-2 truncate text-sm font-medium text-neutral-900">{item.author}</p>
                  </div>
                )}

                {item.get_brand && (
                  <div className="rounded-2xl border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-400">ناشر</p>
                    <p className="mt-2 truncate text-sm font-medium text-neutral-900">{item.get_brand.name}</p>
                  </div>
                )}

                {item.translator && (
                  <div className="rounded-2xl border border-neutral-200 p-4">
                    <p className="text-xs text-neutral-400">مترجم</p>
                    <p className="mt-2 truncate text-sm font-medium text-neutral-900">{item.translator}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-neutral-200 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-500">منابع دیگر</p>

              <h2 className="mt-1 text-xl font-semibold text-neutral-950">این کتاب را جای دیگری هم پیدا کنید</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={`https://cheshmehdis.com/product/${encodeURIComponent(item.slug)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl bg-neutral-950 p-5 text-white transition hover:bg-neutral-800">
              <p className="text-sm font-semibold">جستجو در نشر چشمه</p>

              <p className="mt-1 text-xs text-neutral-400">مشاهده این کتاب در سایت نشر چشمه</p>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
