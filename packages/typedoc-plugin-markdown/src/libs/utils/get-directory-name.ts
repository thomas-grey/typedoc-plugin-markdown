export function getDirectoryName(text: string) {
  return text.replace(/[\s_-]+/g, '-').toLowerCase();
}
