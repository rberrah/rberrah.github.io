import yaml from 'js-yaml';

/**
 * Parse the YAML front matter used by PMx chapter Markdown files.
 * This deliberately supports the repository's bounded "---" convention only.
 * It preserves the body byte-for-byte (apart from an optional UTF-8 BOM before
 * the opening delimiter), so scientific review hashes remain stable.
 * @param {string} source
 * @returns {{data: Record<string, any>, content: string}}
 */
export default function matter(source) {
  const raw = String(source ?? '');
  const text = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const delimiter = /^---[ \t]*\r?$/gm;
  const opener = delimiter.exec(text);
  if (!opener || opener.index !== 0) return { data: {}, content: raw };
  const closer = delimiter.exec(text);
  if (!closer) throw new Error('Unclosed YAML front matter');

  const firstBreak = text.indexOf('\n', opener.index + opener[0].length);
  const header = text.slice(firstBreak + 1, closer.index);
  const parsed = yaml.load(header) ?? {};
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Chapter front matter must be a YAML mapping');
  }
  let contentStart = closer.index + closer[0].length;
  // gray-matter consumed the line ending that terminates the closing delimiter,
  // while preserving any following blank line. Match that historical boundary so
  // existing scientific review hashes remain byte-stable.
  if (text.startsWith('\r\n', contentStart)) contentStart += 2;
  else if (text[contentStart] === '\n') contentStart += 1;
  const content = text.slice(contentStart);
  return { data: parsed, content };
}
