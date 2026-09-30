'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUser } from '@/lib/api/users';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const [initializedId, setInitializedId] = useState<number | null>(null);
  if (user && initializedId !== user.id) {
    setInitializedId(user.id);
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
    setPhone(user.phone ?? '');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await updateUser(user.id, { firstName, lastName, phone });
      await refreshUser();
      setSuccess('پروفایل با موفقیت به‌روزرسانی شد');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-zinc-500">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto mt-20 max-w-2xl px-4 py-10">
      <Card>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-zinc-900">پروفایل من</h1>
          <Badge variant={user.role === 'admin' ? 'success' : 'default'}>{user.role}</Badge>
        </div>

        <form
          onSubmit={handleSave}
          className="flex flex-col gap-4">
          <Input
            label="نام"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
          <Input
            label="نام خانوادگی"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
          <Input
            label="شماره تلفن"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />

          <div className="text-sm text-zinc-500">
            <p>عضو شده در: {formatDateTime(user.createdAt)}</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-taupe-700 text-sm">{success}</p>}

          <Button
            type="submit"
            disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
