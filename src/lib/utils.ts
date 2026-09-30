export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string) {
  return new Date(date).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

export function isJudgingActive(status: string) {
  return status === 'first_round' || status === 'second_round' || status === 'tie_break';
}
