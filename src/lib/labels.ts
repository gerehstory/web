import type { CompetitionStatus, RevisionStatus } from '@/types/api';

export const revisionStatusLabel: Record<RevisionStatus, string> = {
  draft: 'پیش‌نویس',
  pending: 'در انتظار تأیید',
  approved: 'تأیید شده',
  rejected: 'رد شده',
};

export const competitionStatusLabel: Record<CompetitionStatus, string> = {
  draft: 'پیش‌نویس',
  open: 'باز برای ارسال',
  first_round: 'دور اول داوری',
  second_round: 'دور دوم داوری',
  tie_break: 'داوری مجدد',
  completed: 'پایان‌یافته',
  cancelled: 'لغو شده',
  no_qualified: 'بدون اثر واجد شرایط',
};

export function fullName(user?: { firstName?: string; lastName?: string } | null) {
  if (!user) return 'ناشناس';
  return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'بدون نام';
}
