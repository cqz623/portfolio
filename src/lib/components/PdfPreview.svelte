<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { staticUrl } from '#lib/utils/urls.js';
  import { pdfLibrary, pdfDocumentOptions } from '#lib/utils/pdf-preview.js';
  let { src, alt, width, height, mode = 'large', position = '50% 50%' }: {
    src: string; alt: string; width?: number; height?: number;
    mode?: 'cover' | 'large' | 'gallery' | 'lightbox'; position?: string;
  } = $props();
  let viewer: HTMLSpanElement;
  let host: HTMLSpanElement;
  let canvas: HTMLCanvasElement;
  let ready = $state(false);
  let failed = $state(false);
  let pageRatio = $state<number>();
  let currentPage = $state(1);
  let totalPages = $state(0);
  let renderedPage = $state(0);
  let requestRender: (() => void) | undefined;
  const interactive = $derived(mode === 'large' || mode === 'lightbox');
  const ratio = $derived(pageRatio ?? (width && height ? width / height : 5 / 4));

  /** Also used by the enclosing lightbox when focus is on its Close control. */
  export function turnPage(direction: number) {
    if (!interactive || !totalPages) return;
    const target = Math.max(1, Math.min(totalPages, currentPage + direction));
    if (target === currentPage) return;
    currentPage = target;
    ready = false;
    failed = false;
    requestRender?.();
  }
  function keys(event: KeyboardEvent) {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault(); event.stopPropagation();
    turnPage(event.key === 'ArrowRight' ? 1 : -1);
  }

  onMount(() => {
    let destroyed = false;
    let visible = false;
    let loading: import('pdfjs-dist').PDFDocumentLoadingTask | undefined;
    let pdf: import('pdfjs-dist').PDFDocumentProxy | undefined;
    let page: import('pdfjs-dist').PDFPageProxy | undefined;
    let task: import('pdfjs-dist').RenderTask | undefined;
    let busy = false;
    let again = false;
    let generation = 0;
    let lastPixels = 0;
    let timer: ReturnType<typeof setTimeout>;
    const active = () => visible || (interactive && viewer.contains(document.activeElement));
    async function render() {
      if (destroyed || !active()) return;
      if (busy) { again = true; return; }
      busy = true;
      const version = generation;
      const target = currentPage;
      const obsolete = () => destroyed || !active() || version !== generation;
      try {
        if (!pdf) {
          const library = await pdfLibrary();
          if (obsolete()) return;
          loading = library.getDocument(pdfDocumentOptions(src));
          pdf = await loading.promise;
          if (destroyed) return;
          totalPages = pdf.numPages;
        }
        if (obsolete()) return;
        if (page?.pageNumber !== target) {
          page?.cleanup();
          page = await pdf.getPage(target);
        }
        if (obsolete()) return;
        const viewport = page.getViewport({ scale: 1 });
        pageRatio = viewport.width / viewport.height;
        // Each page may have a different MediaBox or rotation. Measure after layout updates.
        await tick();
        if (obsolete()) return;
        const rect = host.getBoundingClientRect();
        const fit = mode === 'cover' ? Math.max : Math.min;
        const cssScale = fit(rect.width / viewport.width, rect.height / viewport.height);
        const scale = Math.min(cssScale * Math.min(devicePixelRatio || 1, 2), 4096 / Math.max(viewport.width, viewport.height), Math.sqrt(12000000 / (viewport.width * viewport.height)));
        const pixels = Math.max(1, Math.round(viewport.width * scale));
        if (ready && renderedPage === target && Math.abs(pixels - lastPixels) < Math.max(2, lastPixels * .1)) return;
        const sized = page.getViewport({ scale });
        canvas.width = Math.max(1, Math.ceil(sized.width));
        canvas.height = Math.max(1, Math.ceil(sized.height));
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        task = page.render({ canvas, canvasContext: context, viewport: sized });
        await task.promise;
        if (!obsolete()) { renderedPage = target; ready = true; failed = false; lastPixels = pixels; }
      } catch (error) {
        if (!obsolete() && (error as Error).name !== 'RenderingCancelledException') { ready = false; failed = true; }
      } finally {
        task = undefined;
        busy = false;
        if (again && !destroyed) { again = false; void render(); }
      }
    }
    requestRender = () => {
      generation++;
      task?.cancel();
      void render();
    };
    const visibility = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      if (active()) void render();
      else { generation++; task?.cancel(); }
    });
    visibility.observe(viewer);
    const resize = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => { requestRender?.(); }, 120);
    });
    resize.observe(host);
    return () => {
      destroyed = true;
      requestRender = undefined;
      clearTimeout(timer);
      visibility.disconnect(); resize.disconnect();
      task?.cancel();
      void loading?.destroy().catch(() => {});
      canvas.width = canvas.height = 0;
    };
  });
</script>

<!-- Only expanded documents receive keyboard focus; cover/gallery previews remain passive. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<span bind:this={viewer} class="pdf-viewer {mode}" style:--pdf-ratio={ratio} role={interactive ? 'group' : undefined} aria-label={interactive ? `${alt} — PDF document` : undefined} tabindex={interactive ? 0 : undefined} onkeydown={interactive ? keys : undefined}>
  <span class="pdf-preview {mode}" data-pdf-src={staticUrl(src)} bind:this={host} style:aspect-ratio={ratio} role="img" aria-label={`${alt} — PDF page ${currentPage}${totalPages ? ` of ${totalPages}` : ''}`} aria-busy={!ready && !failed}>
    <canvas bind:this={canvas} class:ready data-page={renderedPage} style:object-position={position} aria-hidden="true"></canvas>
    {#if !ready}<span class="status" role="status">{failed ? 'PDF preview unavailable' : 'Loading PDF…'}</span>{/if}
  </span>
  {#if interactive}
    <span class="pdf-footer">
      {#if totalPages > 1}
        <span class="page-controls" role="group" aria-label="PDF page navigation">
          <button aria-label="Previous PDF page" disabled={currentPage <= 1} onclick={() => turnPage(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4m7-7-7 7 7 7" /></svg></button>
          <span class="page-indicator" aria-live="polite" aria-atomic="true">{currentPage} / {totalPages}</span>
          <button aria-label="Next PDF page" disabled={currentPage >= totalPages} onclick={() => turnPage(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" /></svg></button>
        </span>
      {/if}
      <a href={staticUrl(src)} target="_blank" rel="noopener noreferrer">Open original PDF ↗</a>
    </span>
  {/if}
</span>

<style>
  .pdf-viewer { display: block; width: 100%; }
  .pdf-preview { display: block; position: relative; width: 100%; overflow: hidden; }
  canvas { display: block; width: 100%; height: 100%; object-fit: contain; opacity: 0; }
  canvas.ready { opacity: 1; }
  .pdf-viewer.cover, .pdf-preview.cover { position: absolute; inset: 0; width: 100%; height: 100%; }
  .cover canvas { object-fit: cover; }
  .pdf-viewer.gallery { width: max-content; }
  .pdf-preview.gallery { height: var(--image-height); width: calc(var(--image-height) * var(--pdf-ratio)); }
  .pdf-viewer.lightbox { width: min(100%, calc((100dvh - 200px) * var(--pdf-ratio))); flex-shrink: 0; }
  .status { position: absolute; inset: 0; display: grid; place-items: center; font: inherit; font-size: 11px; color: var(--fg-dim); }
  .pdf-footer, .page-controls { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 8px; }
  .pdf-footer { margin-top: 8px; gap: 8px 20px; font: 11px/1.6 'Roboto Mono', monospace; color: var(--fg-dim); }
  .page-controls button { display: grid; place-items: center; width: 28px; height: 28px; padding: 0; border: 0; background: transparent; color: var(--fg); cursor: pointer; }
  .page-controls svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 1.5; }
  .page-controls button:hover:not(:disabled) { color: var(--hi-fg); background: var(--hi); }
  .page-controls button:disabled { opacity: .3; cursor: default; }
  .page-indicator { min-width: 7ch; text-align: center; }
  .pdf-footer a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
  .pdf-viewer:focus-visible, .page-controls button:focus-visible { outline: 2px solid var(--hi); outline-offset: 2px; }
</style>
