<script lang="ts">
  import { projectUrl, staticUrl } from '#lib/utils/urls.js';
  import { visibleVideo } from '#lib/utils/visible-video.js';
  import PdfPreview from './PdfPreview.svelte';
  import type { CoverProject } from '#lib/types/work-layout.js';
  let { project, title = project.title, eager = false, column = false, editing = false }: {
    project: CoverProject; title?: string; eager?: boolean; column?: boolean; editing?: boolean;
  } = $props();
</script>

<a class="thumbnail" class:column class:editing style:aspect-ratio={project.frame.ratio} id={editing ? undefined : project.slug} href={editing ? undefined : projectUrl(project.slug)} tabindex={editing ? -1 : undefined} aria-label={editing ? undefined : `View ${title}`}>
  {#if project.cover?.src.toLowerCase().endsWith('.mp4')}
    <video use:visibleVideo class="video-cover" style:object-position={project.frame.position} src={staticUrl(project.cover.src)} width={project.cover.width} height={project.cover.height} autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1"></video>
  {:else if project.cover?.src.toLowerCase().endsWith('.pdf')}
    <PdfPreview src={project.cover.src} alt={project.cover.alt} width={project.cover.width} height={project.cover.height} mode="cover" position={project.frame.position} />
  {:else if project.cover}
    <img style:object-position={project.frame.position} src={staticUrl(project.cover.src)} alt={project.cover.alt} width={project.cover.width} height={project.cover.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
  {:else}
    <span class="placeholder"><span>{title}</span><span>{project.interactive ? 'Interactive simulation ↗' : 'Image forthcoming'}</span></span>
  {/if}
</a>

<style>
  .thumbnail { position: relative; display: inline-block; width: 100%; margin-bottom: 14px; vertical-align: top; break-inside: avoid; border-radius: 12px; overflow: hidden; background: var(--rule); }
  .thumbnail.column { display: block; margin-bottom: 0; }
  .thumbnail.editing { pointer-events: none; }
  .thumbnail img, .thumbnail video { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; transition: opacity 150ms ease; }
  .thumbnail :global(.pdf-preview) { transition: opacity 150ms ease; }
  .thumbnail:hover :global(.pdf-preview) { opacity: .85; }
  .video-cover { pointer-events: none; }
  .thumbnail:hover img, .thumbnail:hover video { opacity: .85; }
  .placeholder { display: flex; height: 100%; flex-direction: column; align-items: center; justify-content: center; gap: 7px; padding: 15px; text-align: center; font-size: 11px; line-height: 1.4; color: var(--fg-dim); }
  .placeholder span:last-child { font-size: 10px; }
</style>
