<script>
  import { projectUrl } from '#lib/utils/urls.js';
  import SiteHeader from '#lib/components/SiteHeader.svelte';
  import { projects } from '#lib/data/project-catalog.js';
  const spatial = projects.filter(project => project.researchGroup === 'Spatial Computing');
  const research = projects.filter(project => project.source);
</script>
<svelte:head><title>Research — Qizhen Chen</title><meta name="description" content="Design research projects by Qizhen Chen." /></svelte:head>
<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell shell">
  <SiteHeader reference active="research" />
  <main id="main"><h1>Research</h1><p>Computational design, ecological systems, and architectural preservation.</p><section aria-labelledby="spatial-title"><h2 id="spatial-title">Spatial Computing</h2><ul>{#each spatial as project}<li><a href={projectUrl(project.slug)}>{project.title}</a><span>{project.category}</span></li>{/each}</ul></section><section aria-labelledby="design-title"><h2 id="design-title">Design Research</h2><ul>{#each research as project}<li><a href={projectUrl(project.slug)}>{project.title}</a><span>{project.category}</span></li>{/each}</ul></section></main>
</div>
<style>
  .shell { padding-bottom: 80px; }
  section { margin-top: 36px; } h2 { font-size: 15px; font-weight: 400; }
  main { max-width: 780px; } h1 { font-size: 24px; font-weight: 400; margin-bottom: 24px; }
  p { font-size: 15px; line-height: 1.7; color: var(--fg-dim); } ul { list-style: none; padding: 0; margin-top: 40px; } li { margin-bottom: 24px; } a { font-size: 14px; } a:hover { text-decoration: underline; } span { display: block; font-size: 12px; margin-top: 7px; color: var(--fg-dim); }
  @media (max-width: 600px) { .shell { padding-bottom: 50px; } }
</style>
