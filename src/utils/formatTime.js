export function formatRelativeTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;

  const now = new Date();
  const diffMs = now - date;
  const absMs = Math.abs(diffMs);

  const diffSeconds = Math.floor(absMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Future times -> "อีก ..."
  if (diffMs < 0) {
    if (diffSeconds < 60) return `อีก ${diffSeconds} วิน.`;
    if (diffMinutes < 60) return `อีก ${diffMinutes} นาที`;
    if (diffHours < 24) return `อีก ${diffHours} ชม.`;
    if (diffDays < 30) return `อีก ${diffDays} วัน`;
    if (diffMonths < 12) return `อีก ${diffMonths} เดือน`;
    return `อีก ${diffYears} ปี`;
  }

  // Past times (short Thai) e.g. '1 ชม.'
  if (diffSeconds < 10) return 'เมื่อสักครู่';
  if (diffSeconds < 60) return `${diffSeconds} วิน.`;
  if (diffMinutes < 60) return `${diffMinutes} นาที`;
  if (diffHours < 24) return `${diffHours} ชม.`;
  if (diffDays < 30) return `${diffDays} วัน`;
  if (diffMonths < 12) return `${diffMonths} เดือน`;
  return `เลยมา ${diffYears} ปี`;
}
