<script lang="ts">
  import PdfPreview from '#lib/components/PdfPreview.svelte';
  import { onMount, tick } from 'svelte';
  import { staticUrl } from '#lib/utils/urls.js';
  type Image = { src: string; alt: string; caption?: string; width?: number; height?: number };
  let { images, title }: { images: Image[]; title: string } = $props();
  let track = $state<HTMLDivElement>();
  let dialog = $state<HTMLDialogElement>();
  let closeControl = $state<HTMLButtonElement>();
  let active = $state(0);
  let pdfViewer = $state<{ turnPage: (direction: number) => void }>();
  let opened = $state(false);
  let previous = $state(false);
  let next = $state(false);
  const lightboxImages = $derived(images.filter(image => !image.src.toLowerCase().endsWith('.mp4')));
  const selected = $derived(lightboxImages[active]);
  const uid = $props.id();
  const behavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' as const : 'smooth' as const;

  function update() {
    if (!track) return;
    previous = track.scrollLeft > 2;
    next = track.scrollLeft < track.scrollWidth - track.clientWidth - 2;
  }
  function scroll(direction: number) {
    if (!track) return;
    track.scrollBy({ left: direction * Math.max(100, track.clientWidth * .8), behavior: behavior() });
  }
  function keys(event: KeyboardEvent) {
    if (!track || (event.target as HTMLElement)?.tagName === 'VIDEO') return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') track.scrollTo({ left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: behavior() });
    else scroll(event.key === 'ArrowRight' ? 1 : -1);
  }
  function wheelScrolling(node: HTMLDivElement) {
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const distance = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientWidth : 1);
      const canScroll = distance < 0 ? node.scrollLeft > 0 : node.scrollLeft < node.scrollWidth - node.clientWidth - 1;
      if (!canScroll) return; // Let vertical page scrolling resume at either end.
      event.preventDefault();
      node.scrollLeft += distance;
    }
    node.addEventListener('wheel', wheel, { passive: false });
    return { destroy: () => node.removeEventListener('wheel', wheel) };
  }
  async function enlarge(index: number) {
    active = lightboxImages.findIndex(image => image.src === images[index].src);
    await tick();
    if (!dialog || !closeControl) return;
    dialog.showModal();
    opened = true;
    closeControl.focus();
  }
  function change(direction: number) { active = (active + direction + lightboxImages.length) % lightboxImages.length; }
  function lightboxKeys(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault(); event.stopPropagation();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      if (selected?.src.toLowerCase().endsWith('.pdf')) pdfViewer?.turnPage(direction);
      else change(direction);
    }
  }
  $effect(() => {
    if (!opened) return;
    const old = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = old; };
  });
  onMount(() => {
    if (!track) return;
    const observer = new ResizeObserver(update);
    observer.observe(track);
    for (const child of track.children) observer.observe(child);
    update();
    return () => observer.disconnect();
  });
</script>

{#if images.length}
  <section class="project-gallery" aria-label={`${title} media gallery`}>
    <div class="strip">
      <button class="arrow left" aria-label="Previous gallery images" aria-controls={uid} disabled={!previous} onclick={() => scroll(-1)}>
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M28 16H4m11-11L4 16l11 11" /></svg>
      </button>
      <!-- A scrollable region needs its own keyboard focus; buttons remain native controls. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
      <div class="track" id={uid} bind:this={track} use:wheelScrolling tabindex="0" role="region" aria-label="Project images. Scroll horizontally or use arrow keys." onkeydown={keys} onscroll={update}>
        {#each images as image, index (image.src)}
          <figure>
            {#if image.src.toLowerCase().endsWith('.mp4')}
              <!-- No caption track was supplied with the original project video. -->
              <!-- svelte-ignore a11y_media_has_caption -->
              <video src={staticUrl(image.src)} width={image.width} height={image.height} style:aspect-ratio={image.width && image.height ? `${image.width} / ${image.height}` : undefined} controls playsinline preload="metadata" aria-label={image.alt} onloadedmetadata={update}></video>
            {:else}
            <button class="image-button" aria-label={`Enlarge image ${index + 1}: ${image.alt}`} onclick={() => enlarge(index)}>
              {#if image.src.toLowerCase().endsWith('.pdf')}
                <PdfPreview src={image.src} alt={image.alt} width={image.width} height={image.height} mode="gallery" />
              {:else}
              <img src={staticUrl(image.src)} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" onload={update} />
              {/if}
            </button>
            {/if}
            {#if image.caption}<figcaption>{image.caption}</figcaption>{/if}
          </figure>
        {/each}
      </div>
      <button class="arrow right" aria-label="Next gallery images" aria-controls={uid} disabled={!next} onclick={() => scroll(1)}>
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 16h24M17 5l11 11-11 11" /></svg>
      </button>
    </div>
    <dialog bind:this={dialog} aria-label={`${title} fullscreen image viewer`} onkeydown={lightboxKeys} onclose={() => opened = false}>
      <div class="lightbox">
        <button class="close" bind:this={closeControl} aria-label="Close fullscreen image" onclick={() => dialog?.close()}>Close ×</button>
        {#if selected}
          <figure class="enlarged">
            {#if selected.src.toLowerCase().endsWith('.pdf')}
              {#if opened}
                {#key selected.src}
                  <PdfPreview bind:this={pdfViewer} src={selected.src} alt={selected.alt} width={selected.width} height={selected.height} mode="lightbox" />
                {/key}
              {/if}
            {:else}
              <img src={staticUrl(selected.src)} alt={selected.alt} />
            {/if}
            {#if selected.caption}<figcaption>{selected.caption}</figcaption>{/if}
          </figure>
        {/if}
        <div class="lightbox-controls">
          <button class="arrow" aria-label="Previous fullscreen image" disabled={lightboxImages.length < 2} onclick={() => change(-1)}><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M28 16H4m11-11L4 16l11 11" /></svg></button>
          <span aria-live="polite">{active + 1} / {lightboxImages.length}</span>
          <button class="arrow" aria-label="Next fullscreen image" disabled={lightboxImages.length < 2} onclick={() => change(1)}><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 16h24M17 5l11 11-11 11" /></svg></button>
        </div>
      </div>
    </dialog>
  </section>
{/if}

<style>
  .project-gallery { --image-height: 320px; min-width: 0; margin-bottom: 70px; }
  .strip { display: grid; grid-template-columns: 32px minmax(0, 1fr) 32px; gap: 8px; align-items: start; }
  .track { display: flex; gap: 8px; overflow-x: auto; min-width: 0; scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: var(--hi) transparent; overscroll-behavior-x: contain; }
  figure { flex: 0 0 auto; margin: 0; min-width: 0; }
  .image-button { display: block; border: 0; padding: 0; background: none; cursor: zoom-in; height: var(--image-height); }
  .image-button img { display: block; height: var(--image-height); max-height: 360px; width: auto; max-width: none; object-fit: contain; }
  .track video { display: block; height: var(--image-height); max-height: 360px; width: auto; max-width: none; object-fit: contain; }
  figcaption { font: 11px/1.6 'Roboto Mono', monospace; color: var(--fg-dim); margin-top: 8px; inline-size: 0; min-inline-size: 100%; overflow-wrap: anywhere; }
  .arrow { width: 32px; height: 36px; display: grid; place-items: center; border: 0; padding: 0; color: var(--hi); background: none; cursor: pointer; }
  .strip > .arrow { margin-top: calc(var(--image-height) / 2 - 18px); }
  .arrow svg { width: 28px; height: 28px; fill: none; stroke: currentColor; stroke-width: 1.5; }
  .arrow:hover:not(:disabled), .close:hover { color: var(--hi-fg); background: var(--hi); }
  .arrow:disabled { opacity: .25; cursor: default; }
  button:focus-visible, .track:focus-visible { outline: 2px solid var(--hi); outline-offset: -2px; }
  dialog { position: fixed; inset: 0; width: 100vw; height: 100dvh; max-width: none; max-height: none; margin: 0; padding: 0; border: 0; color: var(--fg); background: var(--bg); }
  dialog::backdrop { background: var(--bg); }
  .lightbox { height: 100%; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; gap: 16px; padding: 20px; }
  .close { justify-self: end; border: 0; padding: 8px; background: none; color: var(--hi); font: inherit; cursor: pointer; }
  .enlarged { min-height: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; overflow: auto; }
  .enlarged img { display: block; min-height: 0; max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
  .enlarged figcaption { flex-shrink: 0; inline-size: auto; min-inline-size: 0; max-width: 70ch; text-align: center; }
  .lightbox-controls { display: flex; align-items: center; justify-content: center; gap: 24px; font-size: 12px; }
  @media (max-width: 1000px) { .project-gallery { --image-height: 260px; } }
  @media (max-width: 600px) { .project-gallery { --image-height: 200px; margin-bottom: 40px; } .strip { grid-template-columns: 24px minmax(0, 1fr) 24px; gap: 4px; } .strip > .arrow { width: 24px; } .lightbox { padding: 12px; } }
  @media (prefers-reduced-motion: reduce) { .track { scroll-behavior: auto; } }
</style>
