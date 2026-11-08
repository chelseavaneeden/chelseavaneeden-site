/**
 * Never one word alone on the last line (Chelsea, 8 Nov: "never, ever on the website").
 *
 * Runs on every finished page (src/middleware.ts), so it covers all wording, including whatever is typed in the
 * CMS. In each piece of text it joins the last three words with non-breaking spaces, so if the text wraps, at
 * least three words move to the new line together. Text of three words joins its last two. One or two words are
 * left alone. The joined words must stay short enough to fit a phone screen: big headings only join two words,
 * and if the end of a sentence is very long it joins fewer (CSS text-wrap: balance / pretty in typography.css
 * also shapes the lines in modern browsers).
 *
 * It only changes the spaces between words inside text. Tags, attributes, scripts, styles, code and form
 * fields are never touched, and the page is edited in place rather than rebuilt, so nothing else can change.
 */
import { COMMENT_NODE, DOCTYPE_NODE, ELEMENT_NODE, TEXT_NODE, parse, type Node } from 'ultrahtml';

/** Never looked inside: no visible wrapping text, or text that must stay exactly as written. */
const SKIP = new Set(['head', 'script', 'style', 'template', 'noscript', 'pre', 'code', 'kbd', 'samp', 'textarea', 'select', 'option', 'svg', 'math', 'iframe', 'video', 'audio', 'canvas', 'object', 'picture', 'img', 'input']);
/** Text-level tags: their words flow on the same lines as the text around them. */
const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'data', 'del', 'dfn', 'em', 'i', 'ins', 'label', 'mark', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var']);
/** Line breaks: the text either side is wrapped separately. */
const BREAKS = new Set(['br', 'wbr']);
/** Tailwind classes that take an element out of the line it sits in (it wraps its own text). */
const OWN_BOX = /^(?:[\w-]+:)*(?:block|inline-block|inline-flex|inline-grid|flex|grid|table|flow-root|list-item)$/;
const FLEX_OR_GRID = /^(?:[\w-]+:)*(?:inline-)?(?:flex|grid)$/;
const BIG_HEADING = /^(?:[\w-]+:)*type-(?:display-xl|display-l|display-stretch|h1|h2)$/;

/** Longest end of a sentence that may be held together, in characters (spaces included). */
const MAX_TAIL = 26;
const MAX_TAIL_BIG = 14;

type Piece = { start: number; end: number; text: string } | { atom: true };
type Edit = { start: number; end: number; text: string };

const classes = (node: Node): string[] => String(node.attributes?.class ?? '').split(/\s+/).filter(Boolean);
const ownBox = (node: Node) => node.name === 'button' || classes(node).some((c) => OWN_BOX.test(c));
const flexOrGrid = (node: Node) => classes(node).some((c) => FLEX_OR_GRID.test(c));
// Judged by the text style, not the tag: an h2 on the legal pages is small (type-longform), a type-h2 is big.
const bigHeading = (node: Node) => node.name === 'h1' || classes(node).some((c) => BIG_HEADING.test(c));
/** How many characters a run of raw HTML text shows (an entity like &amp; is one). */
const visibleLength = (raw: string) => raw.replace(/&#?\w+;/g, 'x').length;

export function noOrphans(html: string): string {
  const edits: Edit[] = [];

  /** Where a text node sits in the page: from the end of what comes before it to the start of what follows. */
  const textRange = (parent: Node, index: number) => {
    const siblings: Node[] = parent.children;
    const before = siblings[index - 1];
    const after = siblings[index + 1];
    const start = before?.loc ? before.loc[1].end : parent.loc ? parent.loc[0].end : 0;
    const end = after?.loc ? after.loc[0].start : parent.loc ? parent.loc[1].start : html.length;
    return { start, end };
  };

  /** Holds the last words of one line-wrapping run of text together. */
  const finish = (pieces: Piece[], big: boolean) => {
    if (!pieces.length) return;
    // The run as one string (a picture or button counts as one word), remembering where each piece came from.
    let joined = '';
    const spans: { from: number; piece: Piece }[] = [];
    for (const piece of pieces) {
      spans.push({ from: joined.length, piece });
      joined += 'atom' in piece ? '\u0001' : piece.text;
    }
    const gaps = [...joined.matchAll(/[ \t\n\r\f]+/g)]
      .map((m) => ({ from: m.index!, to: m.index! + m[0].length }))
      .filter((g) => g.from > 0 && g.to < joined.length && joined.slice(0, g.from).trim() && joined.slice(g.to).trim());
    const words = gaps.length + 1;
    if (words < 3) return;

    const limit = big ? MAX_TAIL_BIG : MAX_TAIL;
    let hold = big || words === 3 ? 1 : 2;
    while (hold > 0 && visibleLength(joined.slice(gaps[gaps.length - hold].from).trim()) > limit) hold--;

    for (const gap of gaps.slice(gaps.length - hold)) {
      let first = true;
      for (const { from, piece } of spans) {
        if ('atom' in piece) continue;
        const a = Math.max(gap.from, from);
        const b = Math.min(gap.to, from + piece.text.length);
        if (a >= b) continue;
        edits.push({ start: piece.start + (a - from), end: piece.start + (b - from), text: first ? '&nbsp;' : '' });
        first = false;
      }
    }
  };

  /** Adds an inline element's text to the current run; boxes inside it are handled on their own. */
  const collect = (parent: Node, pieces: Piece[][], big: boolean) => {
    parent.children.forEach((child: Node, index: number) => {
      const run = pieces[pieces.length - 1];
      if (child.type === TEXT_NODE) {
        const { start, end } = textRange(parent, index);
        // Only edit text whose place in the page is certain.
        if (html.slice(start, end) === child.value) run.push({ start, end, text: child.value });
        else run.push({ atom: true });
      } else if (child.type === ELEMENT_NODE) {
        if (BREAKS.has(child.name)) pieces.push([]);
        else if (SKIP.has(child.name)) run.push({ atom: true });
        else if (INLINE.has(child.name) && !ownBox(child)) collect(child, pieces, big || bigHeading(child));
        else if (ownBox(child) && (INLINE.has(child.name) || child.name === 'button')) {
          run.push({ atom: true });
          visit(child, big);
        } else {
          // A block inside a text element (unusual): the text either side wraps separately.
          pieces.push([]);
          visit(child, big);
          pieces.push([]);
        }
      }
    });
  };

  /** Finds the runs of text inside an element and holds the end of each together. */
  const visit = (node: Node, big: boolean) => {
    if (node.type === ELEMENT_NODE && SKIP.has(node.name)) return;
    const isBig = big || (node.type === ELEMENT_NODE && bigHeading(node));
    const flex = node.type === ELEMENT_NODE && flexOrGrid(node);
    let pieces: Piece[][] = [[]];
    const flush = () => {
      pieces.forEach((run) => finish(run, isBig));
      pieces = [[]];
    };
    node.children?.forEach((child: Node, index: number) => {
      if (child.type === COMMENT_NODE || child.type === DOCTYPE_NODE) return;
      if (child.type === TEXT_NODE) {
        // In a flex or grid box, each loose bit of text is its own item.
        const { start, end } = textRange(node, index);
        if (html.slice(start, end) !== child.value) return flush();
        pieces[pieces.length - 1].push({ start, end, text: child.value });
        if (flex) flush();
        return;
      }
      if (child.type !== ELEMENT_NODE) return;
      if (BREAKS.has(child.name)) {
        pieces.push([]);
      } else if (flex) {
        flush();
        visit(child, isBig);
      } else if (SKIP.has(child.name)) {
        pieces[pieces.length - 1].push({ atom: true });
      } else if (INLINE.has(child.name) && !ownBox(child)) {
        collect(child, pieces, isBig || bigHeading(child));
      } else if (ownBox(child) && (INLINE.has(child.name) || child.name === 'button')) {
        pieces[pieces.length - 1].push({ atom: true });
        visit(child, isBig);
      } else {
        flush();
        visit(child, isBig);
      }
    });
    flush();
  };

  visit(parse(html), false);
  if (!edits.length) return html;
  edits.sort((x, y) => y.start - x.start);
  let out = html;
  for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}
