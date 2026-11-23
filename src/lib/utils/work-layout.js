/** @typedef {{version: 1, columns: string[][] | null}} WorkLayout */

/** Strict write validation: exactly three columns containing every current slug once.
 * @param {unknown} value @param {string[]} slugs @returns {asserts value is WorkLayout}
 */
export function validateWorkLayout(value, slugs) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid layout.');
  const layout = /** @type {Record<string, unknown>} */ (value);
  if (Object.keys(layout).sort().join(',') !== 'columns,version' || layout.version !== 1 || !Array.isArray(layout.columns) || layout.columns.length !== 3 || !layout.columns.every(column => Array.isArray(column) && column.every(slug => typeof slug === 'string'))) throw new Error('Expected version 1 and three columns of project slugs.');
  const flat = layout.columns.flat();
  if (flat.length !== slugs.length || new Set(flat).size !== flat.length || flat.some(slug => !slugs.includes(slug))) throw new Error('Every current project must appear exactly once; unknown, missing or duplicate slugs are rejected.');
}

/** Reconcile saved columns safely when projects are later added or removed.
 * @param {{columns?: string[][] | null}} layout @param {string[]} slugs
 * @returns {string[][] | null}
 */
export function savedWorkColumns(layout, slugs) {
  if (!Array.isArray(layout.columns) || layout.columns.length !== 3) return null;
  const seen = new Set();
  const columns = layout.columns.map(column => (Array.isArray(column) ? column : []).filter(slug => {
    if (!slugs.includes(slug) || seen.has(slug)) return false;
    seen.add(slug); return true;
  }));
  columns[2].push(...slugs.filter(slug => !seen.has(slug)));
  return columns;
}

/** Desktop assignments are exact; smaller layouts preserve column-major reading order.
 * @param {string[][]} columns @param {number} count
 */
export function responsiveWorkColumns(columns, count) {
  if (count === 3) return columns;
  const order = columns.flat();
  const size = Math.ceil(order.length / count);
  return Array.from({length:count}, (_, index) => order.slice(index * size, (index + 1) * size));
}

/** Capture native CSS-column placement, sorted left-to-right then top-to-bottom.
 * @param {HTMLElement} container
 */
export function measureWorkColumns(container) {
  const entries = Array.from(container.children).map(node => ({
    slug: /** @type {HTMLElement} */ (node).dataset.projectSlug ?? node.id,
    rect: node.getBoundingClientRect()
  }));
  const lefts = [...new Set(entries.map(entry => Math.round(entry.rect.left)))].sort((a,b) => a-b);
  return lefts.map(left => entries.filter(entry => Math.abs(Math.round(entry.rect.left) - left) < 1).sort((a,b) => a.rect.top-b.rect.top).map(entry => entry.slug));
}
