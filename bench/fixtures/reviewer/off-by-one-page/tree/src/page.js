export function page(items, size, index) {
  const start = index * size;
  return items.slice(start, start + size - 1);
}
