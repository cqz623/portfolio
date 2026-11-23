<script>
  import { projectUrl } from '#lib/utils/urls.js';
  import galleryFiles, { dimensions } from 'virtual:project-gallery-files';
  import { workCoverFrame } from '#lib/utils/work-cover-frame.js';
  import { projectWithDiscoveredCover } from '#lib/utils/project-gallery.js';
  import { projects } from '#lib/data/project-catalog.js';
  import WorkGallery from '#lib/components/WorkGallery.svelte';
  import SiteHeader from '#lib/components/SiteHeader.svelte';

  const categories = [
    { title: 'Research / Spatial Computing', slugs: ['spatial-barrier-game', 'population-flood-sandbox'] },
    { title: 'Computational & Experimental Design', slugs: ['cloud-pavilion', 'floating-purifier', 'material-experimentation'] },
    { title: 'Historic Preservation & Adaptive Reuse', slugs: ['deep-eye', 'downsville-covered-bridge', 'theory-in-practice'] },
    { title: 'Architecture & Urban Design', slugs: ['reviving-spaces', 'light-and-shadow-lane', 'layered-walkway', 'mercury-store', 'sustainability', 'theatre'] },
    { title: 'Scholarly Work and Presentations', slugs: ['decarbonization', 'funeral-home', 'xu-tiantian', 'aptne-presentation'] }
  ];
  const groups = categories.map(category => ({
    title: category.title,
    projects: category.slugs.flatMap(slug => projects.filter(project => project.slug === slug))
  }));
  const orderedProjects = groups.flatMap(group => group.projects).map(project => {
    const cover = projectWithDiscoveredCover(project, galleryFiles, dimensions).cover;
    return {
      ...project,
      cover,
      frame: workCoverFrame(cover, project.thumbnail)
    };
  });
  const shortTitles = new Map([
    ['floating-purifier', 'Floating Purifier']
  ]);
</script>

<svelte:head>
  <title>Work — Qizhen Chen</title>
  <meta name="description" content="Architectural projects by Qizhen Chen: computational and experimental design, historic preservation, adaptive reuse, architecture, and urban design." />
</svelte:head>

<a class="skip-link" href="#work">Skip to work</a>
<div class="site-shell work-shell">
  <SiteHeader reference />
  <main id="work" class="work-layout">
    <h1 class="sr-only">Work</h1>
    <aside class="project-index" aria-label="Project index">
      {#each groups as group}
        <section>
          <h2>{group.title}</h2>
          <ul>
            {#each group.projects as project (project.slug)}
              <li><a href={projectUrl(project.slug)}>{shortTitles.get(project.slug) ?? project.title}</a></li>
            {/each}
          </ul>
        </section>
      {/each}
    </aside>
    <WorkGallery projects={orderedProjects} {shortTitles} />
  </main>
</div>

<style>
  .work-shell { --page-width: 1380px; padding: 0 40px 80px; }
  .work-layout { display: grid; grid-template-columns: minmax(0, 28fr) minmax(0, 72fr); gap: 56px; align-items: start; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .project-index { padding-top: 0; }
  .project-index section + section { margin-top: 34px; }
  h2 { font-size: 15px; line-height: 1.55; font-style: italic; font-weight: 400; color: var(--fg-dim); }
  ul { list-style: none; padding: 0; margin: 10px 0 0; }
  li + li { margin-top: 6px; }
  li a { font-size: 13px; line-height: 1.55; color: var(--fg-dim); }
  li a:hover { color: var(--hi-fg); background: var(--hi); }
  @media (max-width: 1000px) { .work-shell { padding-inline: 0; } .work-layout { grid-template-columns: minmax(190px, 28fr) minmax(0, 72fr); gap: 24px; } }
  @media (max-width: 600px) { .work-shell { padding-bottom: 50px; } .work-layout { grid-template-columns: 1fr; gap: 40px; } .project-index section + section { margin-top: 26px; } }
</style>
