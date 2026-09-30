'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { User } from 'lucide-react';

const links = [
  { href: '/works', label: 'آثار' },
  { href: '/competitions', label: 'مسابقات' },
  { href: '/books', label: 'کتاب‌ها' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, logout, loading } = useAuth();

  if (pathname === '/login') return null;

  return (
    <div className="fixed top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <header className="container">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-lg font-bold text-taupe-800">
              گرهـ
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith(link.href)
                      ? 'bg-taupe-100 text-taupe-800'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  )}>
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-taupe-100 text-taupe-800'
                      : 'text-zinc-600 hover:bg-zinc-100'
                  )}>
                  مدیریت
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!loading && isAuthenticated && (
              <>
                <Link
                  href="/works/me"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 sm:inline-flex">
                  آثار من
                </Link>
                <Link
                  href="/works/new"
                  className="hidden rounded-lg bg-taupe-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-taupe-700 sm:inline-flex">
                  اثر جدید
                </Link>
                <Link
                  href="/profile"
                  className="flex text-sm font-medium text-zinc-600 hover:text-taupe-800">
                  <User />
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}>
                  خروج
                </Button>
              </>
            )}
            {!loading && !isAuthenticated && (
              <Link
                href="/login"
                className="rounded-lg bg-taupe-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-taupe-700">
                ورود
              </Link>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
