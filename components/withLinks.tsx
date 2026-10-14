// Turns `[text](url)` in content text into an external link.
export function withLinks(text: string) {
  return text.split(/(\[[^\]]+\]\([^)]+\))/).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return m ? <a key={i} href={m[2]} target="_blank" rel="noopener">{m[1]}</a> : part;
  });
}
