<script>
  import PdfPreview from '#lib/components/PdfPreview.svelte';
  import ProjectGallery from '#lib/components/ProjectGallery.svelte';
  import galleryFiles, { dimensions } from 'virtual:project-gallery-files';
  import { projectImageLayout } from '#lib/utils/project-gallery.js';
  import { resolve } from '$app/paths';
  import { projectUrl, staticUrl } from '#lib/utils/urls.js';
  import InteractiveEmbed from '#lib/components/InteractiveEmbed.svelte';
  import SiteHeader from '#lib/components/SiteHeader.svelte';
  import { projects } from '#lib/data/project-catalog.js';
  /** @type {{ data: import('./$types').PageData }} */
  let { data } = $props();
  const project = $derived(data.project);
  const imageLayout = $derived(projectImageLayout(project, galleryFiles, dimensions));
  const largeImages = $derived(imageLayout.large);
  const gallery = $derived(imageLayout.gallery);
  const next = $derived(projects[(projects.findIndex(p => p.slug === project.slug) + 1) % projects.length]);
</script>

<svelte:head>
  <title>{project.title} — Qizhen Chen</title>
  <meta name="description" content={project.description ?? `${project.title} by Qizhen Chen. Project information forthcoming.`} />
</svelte:head>
<a class="skip-link" href="#project">Skip to project</a>
<div class="site-shell">
  <SiteHeader />
  <main id="project">
    <div class="project-heading"><h1>{project.title}</h1><div class="meta"><span>{project.category}</span><span>{project.year ?? 'Year forthcoming'}</span></div></div>
    {#if largeImages.length}
      <section class="large-images" aria-label="Large project images">
        {#each largeImages as image (image.src)}
          <figure>
            {#if image.src.toLowerCase().endsWith('.mp4')}
              <!-- Original video supplied without a caption track; no captions are invented. -->
              <!-- svelte-ignore a11y_media_has_caption -->
              <video src={staticUrl(image.src)} width={image.width} height={image.height} style:max-width={image.width ? `${image.width}px` : '100%'} controls playsinline preload="metadata" aria-label={`${project.title} — project video`}></video>
            {:else if image.src.toLowerCase().endsWith('.pdf')}
              <PdfPreview src={image.src} alt={image.alt} width={image.width} height={image.height} />
            {:else}
            <img src={staticUrl(image.src)} alt={image.alt} width={image.width} height={image.height} style:max-width={image.width ? `${image.width}px` : '100%'} loading="lazy" decoding="async" />
            {/if}
            {#if image.caption}<figcaption>{image.caption}</figcaption>{/if}
          </figure>
        {/each}
      </section>
    {/if}
    {#if project.interactive}
      <div class="interactive-intro"><p class="overview-description">{project.description}</p></div>
      <div class="interactive-links">
        <a href={staticUrl(project.interactive.path)} target="_blank" rel="noopener noreferrer">Open Fullscreen ↗</a>
        <a href={project.interactive.sourceUrl} target="_blank" rel="noopener noreferrer">View Source on GitHub ↗</a>
      </div>
      <InteractiveEmbed src={staticUrl(project.interactive.path)} title={`${project.title} — interactive application`} autoHeight={project.interactive.autoHeight ?? false} />
    {/if}
    {#if !project.interactive}
    <div class="project-copy"><h2>Overview</h2><p class="overview-description">{project.description ?? 'Project introduction forthcoming.'}</p></div>
    {/if}
    {#key project.slug}
      <ProjectGallery images={gallery} title={project.title} />
    {/key}
    <div class="project-navigation"><a href={`${resolve('/')}#${project.slug}`}>← All work</a><a href={projectUrl(next.slug)}>Next: {next.title} ↗</a></div>
  </main>
  <footer class="site-footer"><span>© {new Date().getFullYear()} Qizhen Chen</span><a href={resolve('/bio')}>Bio ↗</a></footer>
</div>

<style>
  .interactive-intro { max-width: 900px; margin-bottom: 24px; }
  .overview-description { font-size: 16px; line-height: 1.8; }
  .interactive-links { display: flex; flex-wrap: wrap; gap: 16px 32px; margin-bottom: 24px; font-size: 13px; }
  .interactive-links a { text-decoration: underline; text-underline-offset: 4px; }
  .project-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 40px; padding: 5px 0 35px; }
  h1 { font-size: clamp(23px, 2.7vw, 42px); line-height: 1.2; font-weight: 400; letter-spacing: 0; max-width: 850px; }
  .meta { display: flex; flex-direction: column; gap: 8px; color: var(--fg-dim); font-size: 12px; line-height: 1.5; min-width: 180px; padding-top: 5px; }
  img, video { display: block; width: 100%; height: auto; }
  .large-images img, .large-images video { margin-inline: auto; }
  .large-images { display: grid; gap: 40px; margin: 0; }
  .large-images figure { margin: 0; }
  .large-images figcaption { font-size: 12px; color: var(--fg-dim); margin-top: 12px; }
  .project-copy { display: grid; grid-template-columns: 1fr 2fr; gap: 40px; padding: 65px 0 85px; }
  h2 { font-size: 12px; color: var(--fg-dim); font-weight: 400; padding-top: 5px; }
  .project-copy p { max-width: 780px; }
  .project-navigation { display: flex; justify-content: space-between; gap: 30px; font-size: 13px; padding-top: 20px; }
  .project-navigation a:hover { text-decoration: underline; text-underline-offset: 4px; }
  .project-navigation a:last-child { text-align: right; }
  @media (max-width: 700px) { .project-heading { flex-direction: column; gap: 20px; padding-bottom: 28px; } .meta { flex-direction: row; flex-wrap: wrap; gap: 10px 24px; } .project-copy { grid-template-columns: 1fr; gap: 20px; padding: 35px 0 50px; } }
</style>
