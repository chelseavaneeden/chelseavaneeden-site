const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Lets content editors emphasise words with *asterisks* (rendered as <em>), which the
 * design system styles per theme (e.g. serif italics), highlight words with ==double equals==
 * (rendered as <mark>, a mustard-yellow marker), and start a new line where they pressed Enter.
 * Everything else is escaped.
 */
export function emphasis(text: string): string {
  return escapeHtml(text.trim())
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(/\s*\n\s*/g, '<br />');
}
