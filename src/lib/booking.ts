/**
 * Chelsea's Google booking page (an appointment schedule), where clients pick a time and pay. It opens as Google's own
 * full page, not inside the site: with payments switched on, Google can't take payment inside another website, so an
 * embedded calendar sent people to a new tab where they had to pick their time again (Chelsea, 11 Nov 2026).
 * gv=true is Google's embed view, so it's taken off the link.
 */
export function bookingPageLink(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete('gv');
    return u.toString();
  } catch {
    return url;
  }
}
