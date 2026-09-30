'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoaderCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login, requestCode } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await requestCode(phone);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, code);
      router.push('/works');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">خوش آمدید</h1>
        <p className="mt-2 text-sm text-zinc-500">با شماره تلفن خود وارد شوید</p>
      </div>

      {step === 'phone' ? (
        <form
          onSubmit={handleRequestOtp}
          className="flex flex-col gap-4">
          <Input
            dir="rtl"
            label="شماره تلفن"
            type="tel"
            placeholder="09123456789"
            value={phone}
            error={error}
            onChange={e => setPhone(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="h-10 w-full">
            {loading ? <LoaderCircle className="animate-spin" /> : 'ادامه'}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={handleVerify}
          className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">
            کد ارسال شده به <span className="font-medium text-zinc-700">{phone}</span>
          </p>
          <Input
            label="کد تأیید"
            type="text"
            placeholder="1234"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
            autoFocus
            error={error}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full">
            {loading ? 'در حال تأیید...' : 'تأیید و ورود'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setStep('phone');
              setCode('');
              setError('');
            }}>
            تغییر شماره تلفن
          </Button>
        </form>
      )}
    </Card>
  );
}
