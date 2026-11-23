<script lang="ts">
  import { dev } from '$app/env';
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import configuration from '#lib/data/work-layout.json';
  import { savedWorkColumns, responsiveWorkColumns, measureWorkColumns, validateWorkLayout } from '#lib/utils/work-layout.js';
  import type { CoverProject } from '#lib/types/work-layout.js';
  import WorkCover from './WorkCover.svelte';
  let { projects, shortTitles }: {projects:CoverProject[]; shortTitles:Map<string,string>} = $props();
  let gallery: HTMLDivElement;
  let probe = $state<HTMLDivElement>();
  let local = $state(false);
  let count = $state(3);
  let width = $state(896);
  let saved = $state<{columns:string[][] | null} | undefined>();
  let message = $state('');
  let loading = $state(false);
  let Editor = $state<typeof import('./WorkLayoutEditor.svelte').default>();
  let initial = $state<string[][]>();
  let revision = $state('');
  const slugs = $derived(projects.map(project => project.slug));
  const columns = $derived(savedWorkColumns(saved ?? configuration, slugs));
  const displayed = $derived(columns ? responsiveWorkColumns(columns,count) : null);
  const bySlug = $derived(new Map(projects.map(project => [project.slug,project])));
  const endpoint = () => `${resolve('/')}__work-layout`;

  function defaults() { if (!probe) throw new Error('Default layout is not ready yet.'); return measureWorkColumns(probe); }
  async function edit() {
    if (!dev) return;
    loading = true; message = '';
    try {
      const response = await fetch(endpoint(),{cache:'no-store'});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not open the layout editor.');
      const current = savedWorkColumns(result.layout,slugs);
      // Capture the browser's native placement before swapping to editable columns.
      const native = gallery.querySelector<HTMLDivElement>('.image-grid');
      initial = current ?? (count === 3 && native ? measureWorkColumns(native) : defaults());
      validateWorkLayout({version:1,columns:initial},slugs);
      saved = result.layout;
      revision = result.revision;
      Editor = (await import('virtual:work-layout-editor')).default;
    } catch(error) { message = (error as Error).message; }
    finally { loading = false; }
  }
  onMount(() => {
    local = dev && ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    const pending = new AbortController();
    if (dev && local) {
      // Read the canonical file directly, including refreshes ahead of Vite's file watcher.
      void fetch(endpoint(),{cache:'no-store',signal:pending.signal}).then(async response => {
        if (response.ok) {const result = await response.json();if (saved === undefined) saved = result.layout;}
      }).catch(() => {});
    }
    const update = () => {
      count = matchMedia('(max-width:600px)').matches ? 1 : matchMedia('(max-width:1000px)').matches ? 2 : 3;
      width = count === 3 ? gallery?.getBoundingClientRect().width || 896 : 896;
    };
    update();
    const observer = new ResizeObserver(update); observer.observe(gallery);
    window.addEventListener('resize',update);
    return () => { pending.abort(); observer.disconnect(); window.removeEventListener('resize',update); };
  });
</script>

<div class="work-gallery" bind:this={gallery}>
  {#if dev && local}
    {#if !Editor}<div class="owner-controls"><button onclick={edit} disabled={loading}>{loading ? 'Opening…' : 'Edit Layout'}</button></div>{/if}
    {#if message}<p class="message" role="status">{message}</p>{/if}
  {/if}
  {#if dev && Editor && initial}
    <Editor {projects} {shortTitles} initialColumns={initial} {revision} endpoint={endpoint()} getDefaults={defaults}
      onsaved={(layout) => { saved = layout; Editor = undefined; message = 'Layout saved locally. Commit and deploy separately to publish it.'; }}
      oncancel={() => { Editor = undefined; message = ''; }} />
  {:else if displayed}
    <div class="explicit-grid" style:grid-template-columns={`repeat(${count},minmax(0,1fr))`} aria-label="Project gallery">
      {#each displayed as column}
        <div class="saved-column">
          {#each column as slug (slug)}
            {@const project = bySlug.get(slug)!}
            <WorkCover {project} title={shortTitles.get(slug) ?? project.title} column eager={slugs.indexOf(slug)<6} />
          {/each}
        </div>
      {/each}
    </div>
  {:else}
    <div class="image-grid" aria-label="Project gallery">
      {#each projects as project,index (project.slug)}
        <WorkCover {project} title={shortTitles.get(project.slug) ?? project.title} eager={index<6} />
      {/each}
    </div>
  {/if}
  {#if dev && local}
    <div class="probe-clip" aria-hidden="true" inert>
      <div class="default-probe" bind:this={probe} style:width={`${width}px`}>
        {#each projects as project}<span data-project-slug={project.slug} style:aspect-ratio={project.frame.ratio}></span>{/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .work-gallery { min-width: 0; position: relative; }
  .image-grid { column-count: 3; column-gap: 14px; column-fill: balance; }
  .explicit-grid { display: grid; gap: 14px; align-items: start; }
  .saved-column { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
  .owner-controls { position: absolute; right: 0; top: -32px; }
  .owner-controls button { font: 11px 'Roboto Mono',monospace; color: var(--fg-dim); border: 0; background: var(--bg); padding: 4px 0 4px 10px; cursor: pointer; }
  .owner-controls button:hover { color: var(--hi-fg); background: var(--hi); }
  .message { font-size: 11px; margin-bottom: 12px; }
  .probe-clip { position: absolute; height: 0; width: 100%; overflow: hidden; visibility: hidden; pointer-events: none; }
  .default-probe { column-count: 3; column-gap: 14px; column-fill: balance; }
  .default-probe span { display: inline-block; width: 100%; margin-bottom: 14px; vertical-align: top; break-inside: avoid; }
  @media (max-width:1000px) { .image-grid {column-count:2;} }
  @media (max-width:600px) { .image-grid {column-count:1;} }
</style>
