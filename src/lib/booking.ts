/**
 * Chelsea's Google booking page (an appointment schedule). The inline view on the site needs Google's embed
 * address with gv=true; a calendar.app.google short link can't be shown on the page, so it opens in a new tab.
 */
export function bookingEmbedUrl(url: string): string | undefined {
  try {
    const u = new URL(url);
    if (u.hostname !== 'calendar.google.com' || !u.pathname.includes('/appointments/schedules/')) return undefined;
    u.searchParams.set('gv', 'true');
    return u.toString();
  } catch {
    return undefined;
  }
}
