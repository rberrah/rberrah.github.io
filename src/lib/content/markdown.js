// @ts-nocheck
// Minimal frontmatter + step parser without external deps
// Frontmatter format: JSON between first two lines containing only "---"
// Steps marked as HTML comments: <!-- step:title="..." viz="..." --> ... <!-- /step -->

/**
 * @param {string} raw
 * @returns {{frontmatter: any, steps: {title:string, viz?:string, bodyHtml:string}[], bodyHtml:string}}
 */
export function parseChapterMarkdown(raw) {
  const fmMatch = raw.match(/^\uFEFF?---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  let frontRaw = '{}';
  let body = raw;
  if (fmMatch) {
    frontRaw = fmMatch[1].trim();
    body = raw.slice(fmMatch[0].length);
  }
  let frontmatter = {};
  try {
    frontmatter = JSON.parse(frontRaw || '{}');
  } catch (e) {
    throw new Error('Frontmatter JSON invalide : ' + e.message);
  }

  const steps = [];
  const stepRegex = /<!--\s*step:([^>]+)-->\s*([\s\S]*?)<!--\s*\/step\s*-->/g;
  let lastIndex = 0;
  let match;
  while ((match = stepRegex.exec(body)) !== null) {
    const attrs = parseAttrs(match[1]);
    const content = match[2].trim();
    steps.push({
      title: attrs.title || 'Step',
      viz: attrs.viz,
      bodyHtml: markdownToHtml(content)
    });
    lastIndex = stepRegex.lastIndex;
  }

  const remaining = body.slice(lastIndex).trim();
  const bodyHtml = markdownToHtml(remaining);

  return { frontmatter, steps, bodyHtml };
}

function parseAttrs(str) {
  const attrs = {};
  const re = /(\w+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

// Very small markdown → HTML (paragraphs + bullet lists + inline code + bold/italic)
function markdownToHtml(md) {
  if (!md) return '';
  const lines = md.split(/\r?\n/);
  const htmlParts = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('- ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push('<li>' + inline(line.trim().slice(2)) + '</li>');
    } else if (line.trim() === '') {
      flushList();
    } else {
      flushList();
      htmlParts.push('<p>' + inline(line.trim()) + '</p>');
    }
  }
  flushList();
  return htmlParts.join('\n');
}

function inline(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}
