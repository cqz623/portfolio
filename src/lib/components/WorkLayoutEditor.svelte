<script lang="ts">
  import { untrack, onMount } from 'svelte';
  import { beforeNavigate } from '$app/navigation';
  import { flip } from 'svelte/animate';
  import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME, type DndEvent } from 'svelte-dnd-action';
  import { validateWorkLayout, type WorkLayout } from '#lib/utils/work-layout.js';
  import type { CoverProject } from '#lib/types/work-layout.js';
  import WorkCover from './WorkCover.svelte';
  type Item = {id:string; slug:string; isDndShadowItem?: boolean};
  let { projects, shortTitles, initialColumns, revision, endpoint, getDefaults, onsaved, oncancel }: {
    projects:CoverProject[]; shortTitles:Map<string,string>; initialColumns:string[][]; revision:string; endpoint:string;
    getDefaults:()=>string[][]; onsaved:(layout:WorkLayout)=>void; oncancel:()=>void;
  } = $props();
  const original = untrack(() => JSON.stringify(initialColumns));
  let columns = $state<Item[][]>(untrack(() => initialColumns.map(column => column.map(slug => ({id:slug,slug})))));
  let saving = $state(false);
  let message = $state('');
  let reduced = $state(false);
  const bySlug = $derived(new Map(projects.map(project => [project.slug,project])));
  const snapshot = $derived(columns.map(column => column.map(item => item.slug)));
  const dirty = $derived(JSON.stringify(snapshot) !== original);
  const dragging = $derived(columns.some(column => column.some(item => item[SHADOW_ITEM_MARKER_PROPERTY_NAME])));
  const duration = $derived(reduced ? 0 : 150);
  beforeNavigate(({cancel}) => {
    if (dirty && !saving && !confirm('Discard unsaved layout changes?')) cancel();
  });
  onMount(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    reduced = media.matches;
    const update = () => reduced = media.matches;
    media.addEventListener('change',update);
    const leave = (event:BeforeUnloadEvent) => { if (dirty && !saving) {event.preventDefault();event.returnValue='';} };
    window.addEventListener('beforeunload',leave);
    return () => {media.removeEventListener('change',update);window.removeEventListener('beforeunload',leave);};
  });
  function change(index:number,event:CustomEvent<DndEvent<Item>>) { columns[index] = event.detail.items; message = ''; }
  function cancel() { if (!dirty || confirm('Discard unsaved layout changes?')) oncancel(); }
  function reset() { columns = getDefaults().map(column => column.map(slug => ({id:slug,slug}))); message = 'Default restored in the editor. Save Layout to keep it.'; }
  async function save() {
    const layout = {version:1,columns:snapshot};
    try {
      validateWorkLayout(layout,projects.map(project => project.slug));
      saving = true; message = '';
      const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({layout,revision})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not save layout.');
      onsaved(result.layout);
    } catch(error) { message = (error as Error).message; }
    finally { saving = false; }
  }
  function preview(element?:HTMLElement) {
    if (element) { element.style.opacity = '.8'; element.style.boxShadow = '0 6px 22px rgba(0,0,0,.12)'; }
  }
</script>

<div class="editor-controls">
  <button onclick={save} disabled={saving || dragging}>{saving ? 'Saving…' : 'Save Layout'}</button>
  <button onclick={cancel} disabled={saving}>Cancel</button>
  <button onclick={reset} disabled={saving || dragging}>Reset to Default</button>
</div>
<p class="instructions">Drag covers within or between desktop columns. Keyboard: Space to pick up, arrows to move, Tab to change column, Space to drop. On small screens the three groups wrap or stack.</p>
{#if message}<p class="message" role="status">{message}</p>{/if}
<div class="editor-grid">
  {#each columns as items,index}
    <section class="editor-column">
      <h3>Column {index+1}</h3>
      <div class="drop-zone" aria-label={`Desktop column ${index+1}`} use:dndzone={{items,type:'work-covers',flipDurationMs:duration,morphDisabled:true,delayTouchStart:180,dropTargetStyle:{},transformDraggedElement:preview,dragDisabled:saving}}
        onconsider={(event) => change(index,event)} onfinalize={(event) => change(index,event)}>
        {#each items as item (item.id)}
          {@const project = bySlug.get(item.slug)!}
          <div class="edit-card" class:insertion={item[SHADOW_ITEM_MARKER_PROPERTY_NAME]} data-project-slug={item.slug} aria-label={shortTitles.get(item.slug) ?? project.title} animate:flip={{duration}}>
            <WorkCover {project} title={shortTitles.get(item.slug) ?? project.title} column editing />
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .editor-controls { display:flex; flex-wrap:wrap; gap:8px 16px; margin-bottom:10px; }
  button { font:12px 'Roboto Mono',monospace; border:0; border-bottom:1px solid currentColor; padding:4px 0; background:none; color:var(--fg); cursor:pointer; }
  button:hover:not(:disabled) {background:var(--hi);color:var(--hi-fg);}
  button:disabled {opacity:.4;cursor:default;}
  .instructions,.message {font-size:11px;line-height:1.6;margin-bottom:12px;color:var(--fg-dim);}
  .editor-grid {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;align-items:start;}
  h3 {font-size:10px;font-weight:400;color:var(--fg-dim);margin:0 0 8px;}
  .drop-zone {display:flex;flex-direction:column;gap:14px;min-height:100px;padding-bottom:40px;}
  .edit-card {border-radius:12px;cursor:grab;position:relative;}
  .edit-card:focus-visible {outline:2px solid var(--hi);outline-offset:3px;}
  .insertion {visibility:visible !important;outline:2px dashed var(--hi);}
  .insertion :global(.thumbnail) {opacity:.2;}
  .insertion::before {content:'';position:absolute;top:-8px;left:0;right:0;height:2px;background:var(--hi);}
  @media(max-width:1000px){.editor-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
  @media(max-width:600px){.editor-grid{grid-template-columns:1fr;}}
</style>
