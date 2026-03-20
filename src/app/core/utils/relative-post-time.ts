const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

const IT_MONTH_SHORT = [
  'Gen',
  'Feb',
  'Mar',
  'Apr',
  'Mag',
  'Giu',
  'Lug',
  'Ago',
  'Set',
  'Ott',
  'Nov',
  'Dic',
] as const;

function formatCalendarDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatMonthDayIt(d: Date): string {
  return `${IT_MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
}

/**
 * Post header time:
 * - ultime 24h: Xm oppure Xh
 * - dopo 1 week ma prima di 1 month: "Lug 19"
 * - altrimenti: dd/mm/yyyy
 */
export function formatPostRelativeTime(isoOrTimestamp: string): string {
  const then = new Date(isoOrTimestamp).getTime();
  if (Number.isNaN(then)) {
    return '';
  }

  const diffMs = Math.max(0, Date.now() - then);
  const postDate = new Date(isoOrTimestamp);

  if (diffMs < MS_PER_DAY) {
    const minutes = diffMs / (60 * 1000);
    const hours = minutes / 60;

    if (minutes < 1) {
      return '1m';
    }
    if (hours < 1) {
      return `${Math.floor(minutes)}m`;
    }
    return `${Math.floor(hours)}h`;
  }

  if (diffMs > 7 * MS_PER_DAY && diffMs < 30 * MS_PER_DAY) {
    return formatMonthDayIt(postDate);
  }

  return formatCalendarDate(postDate);
}
