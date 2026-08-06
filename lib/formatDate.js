
export function formatDate(input) {
  if (!input) return '—';

  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) return '—';

  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}