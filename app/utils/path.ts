export function normalize(filepath: string): string {
  return filepath.replace(/\\/g, '/').replace(/\/+/g, '/');
}

export function isAbsolute(filepath: string): boolean {
  return filepath.startsWith('/');
}

export function dirname(filepath: string): string {
  const normalized = normalize(filepath);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === -1 ? '.' : normalized.slice(0, lastSlash) || '/';
}

export function basename(filepath: string, ext?: string): string {
  const normalized = normalize(filepath);
  const lastSlash = normalized.lastIndexOf('/');
  let base = lastSlash === -1 ? normalized : normalized.slice(lastSlash + 1);
  if (ext && base.endsWith(ext)) {
    base = base.slice(0, -ext.length);
  }
  return base;
}

export function relative(from: string, to: string): string {
  const fromParts = normalize(from).split('/').filter(Boolean);
  const toParts = normalize(to).split('/').filter(Boolean);

  let i = 0;
  while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
    i++;
  }

  const up = fromParts.length - i;
  const down = toParts.slice(i);

  const result = [];
  for (let j = 0; j < up; j++) {
    result.push('..');
  }
  result.push(...down);

  return result.join('/') || '.';
}
