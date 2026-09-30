'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/lib/hooks/use-require-auth';
import { Card } from '@/components/ui/Card';

const sections = [
  { href: '/admin/requests', title: 'درخواست‌ها', description: 'بررسی و تأیید نسخه‌های در انتظار' },
  { href: '/admin/competitions', title: 'مسابقات', description: 'ایجاد، انتشار و مدیریت داوران' },
  { href: '/admin/genres', title: 'ژانرها', description: 'افزودن و ویرایش ژانرهای آثار' },
  { href: '/admin/story-types', title: 'انواع داستان', description: 'مدیریت نوع‌های داستان سایت' },
];

export default function AdminHomePage() {
  const { ready } = useRequireAuth({ admin: true });

  if (!ready) {
    return (
      <div className="mx-auto mt-20 max-w-4xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-20 max-w-4xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-zinc-900">پنل مدیریت</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(section => (
          <Link
            key={section.href}
            href={section.href}>
            <Card className="h-full transition-shadow hover:shadow-sm">
              <h2 className="text-lg font-semibold text-taupe-800">{section.title}</h2>
              <p className="mt-2 text-sm text-zinc-500">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
