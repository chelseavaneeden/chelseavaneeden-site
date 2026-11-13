/**
 * Chelsea's Google booking page (an appointment schedule), where clients pick a time and pay. It can't sit inside the
 * site: with payments switched on, Google won't take payment inside another website, so an embedded calendar sent
 * people to a new tab where they had to pick their time again (11 Nov 2026). Since 13 Nov it opens in a pop-up window
 * over the site instead (Chelsea's choice), so the site stays where it was underneath.
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

/** The pop-up window's size in screen pixels, made smaller on small screens (keeping a margin round it). */
const BOOKING_WINDOW = { width: 960, height: 860, margin: 40 };

/**
 * Opens the booking page in a pop-up window centred over the site (in the browser only). Picking a time and paying
 * both happen in that one window; closing it shows the site again. Phones open it as a new tab instead, with the
 * site still open in the tab behind. Returns null when the browser blocks it, so the link can open normally.
 */
export function openBookingWindow(href: string): Window | null {
  const { width, height, margin } = BOOKING_WINDOW;
  const w = Math.max(320, Math.min(width, window.screen.availWidth - margin * 2));
  const h = Math.max(480, Math.min(height, window.screen.availHeight - margin * 2));
  const left = Math.round(window.screenX + Math.max(0, (window.outerWidth - w) / 2));
  const top = Math.round(window.screenY + Math.max(0, (window.outerHeight - h) / 2));
  const popup = window.open(href, 'chelsea-booking', `popup=yes,width=${w},height=${h},left=${left},top=${top}`);
  if (popup) {
    // The booking page has no need to reach back into this page.
    try {
      popup.opener = null;
    } catch {
      /* already on Google's page */
    }
    popup.focus();
  }
  return popup;
}
