/**
 * Converts a picked DOM element into clean, structured text instead of raw
 * outerHTML — no tags, no classes/ids/attributes, no layout-only wrapper
 * divs. Block-level elements that carry real prose structure (paragraphs,
 * headings, lists, tables, blockquotes) become lightweight Markdown so that
 * content that was visually grouped stays grouped in the copied text;
 * generic structural containers (div/section/etc., typically just layout
 * wrappers) are collapsed to a single line break rather than a blank-line
 * gap, keeping tightly-packed content (e.g. a job title next to a company
 * name) close together instead of scattered apart.
 */

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'IFRAME', 'CANVAS', 'SVG']);

// Class-name tokens that conventionally mark an element as an interactive
// control (button, share link, "apply now" link, ...) rather than prose —
// this is a structural/CSS-convention check, not a match on visible text, so
// it holds regardless of the page's language.
const CONTROL_CLASS_PATTERN = /\bbtn\b|button|\bcta\b/i;

// Generic/layout containers: collapsed to a single line break, not a blank-line gap.
const TIGHT_BLOCK_TAGS = new Set([
  'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE',
  'FIGURE', 'FIGCAPTION', 'FORM', 'UL', 'OL', 'THEAD', 'TBODY', 'TFOOT',
]);

/** Converts the element's rendered content into clean text/Markdown. */
export function elementToCleanText(root: Element): string {
  const raw = renderNode(root);
  return raw
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * True for elements that are interactive chrome (buttons, share/apply
 * links, icon controls, ...) rather than page content. Detected structurally
 * — tag, role, or a "btn"/"button"/"cta" class token — never by matching the
 * element's visible text, so this behaves the same on a French or English
 * page.
 */
function isControlElement(el: Element): boolean {
  if (el.tagName === 'BUTTON') return true;
  if (el.getAttribute('role') === 'button') return true;
  const cls = el.getAttribute('class');
  return !!cls && CONTROL_CLASS_PATTERN.test(cls);
}

function isHidden(el: Element): boolean {
  if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') return true;
  const style = (el as HTMLElement).style;
  if (style && (style.display === 'none' || style.visibility === 'hidden')) return true;
  try {
    const computed = getComputedStyle(el);
    return computed.display === 'none' || computed.visibility === 'hidden';
  } catch {
    return false;
  }
}

function renderNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return collapseWhitespace(node.textContent ?? '');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.tagName;
  if (SKIP_TAGS.has(tag) || isHidden(el) || isControlElement(el)) return '';

  switch (tag) {
    case 'BR':
      return '\n';
    case 'HR':
      return '\n\n---\n\n';
    case 'IMG':
      return '';
    case 'TABLE':
      return renderTable(el as HTMLTableElement);
    case 'STRONG':
    case 'B':
      return wrapNonEmpty(renderChildren(el), '**', '**');
    case 'EM':
    case 'I':
      return wrapNonEmpty(renderChildren(el), '*', '*');
    case 'CODE':
      return wrapNonEmpty(renderChildren(el), '`', '`');
    case 'A': {
      const href = el.getAttribute('href');
      const text = renderChildren(el).trim();
      return href && text ? `[${text}](${href})` : text;
    }
    case 'LI': {
      const marker = el.parentElement?.tagName === 'OL' ? `${liIndex(el)}. ` : '- ';
      return `\n${marker}${renderChildren(el).trim()}`;
    }
    case 'P':
      return `\n\n${renderChildren(el).trim()}\n\n`;
    case 'BLOCKQUOTE': {
      const quoted = renderChildren(el)
        .trim()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
      return `\n\n${quoted}\n\n`;
    }
    case 'PRE':
      return `\n\n\`\`\`\n${(el.textContent ?? '').trim()}\n\`\`\`\n\n`;
    default:
      if (/^H[1-6]$/.test(tag)) {
        const level = Number(tag[1]);
        return `\n\n${'#'.repeat(level)} ${renderChildren(el).trim()}\n\n`;
      }
      if (TIGHT_BLOCK_TAGS.has(tag)) return `\n${renderChildren(el)}\n`;
      return renderChildren(el);
  }
}

function renderChildren(el: Element): string {
  return Array.from(el.childNodes).map(renderNode).join('');
}

function wrapNonEmpty(text: string, open: string, close: string): string {
  return text.trim() ? `${open}${text.trim()}${close}` : '';
}

function liIndex(el: Element): number {
  const items = Array.from(el.parentElement?.children ?? []).filter((c) => c.tagName === 'LI');
  return items.indexOf(el) + 1;
}

function renderTable(table: HTMLTableElement): string {
  const rows = Array.from(table.rows);
  if (rows.length === 0) return '';

  const rowTexts = rows.map((row) =>
    Array.from(row.cells)
      .map((cell) => renderChildren(cell).trim().replace(/\|/g, '\\|') || ' ')
      .join(' | '),
  );

  const lines = [`| ${rowTexts[0]} |`];
  const hasHeader = Array.from(rows[0].cells).some((cell) => cell.tagName === 'TH');
  if (hasHeader) {
    lines.push(`| ${Array.from({ length: rows[0].cells.length }, () => '---').join(' | ')} |`);
  }
  for (let i = 1; i < rowTexts.length; i++) lines.push(`| ${rowTexts[i]} |`);

  return `\n\n${lines.join('\n')}\n\n`;
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ');
}
