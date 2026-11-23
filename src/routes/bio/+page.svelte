<script>
  import { resolve } from '$app/paths';
  import SiteHeader from '#lib/components/SiteHeader.svelte';
</script>
<svelte:head><title>Bio — Qizhen Chen</title><meta name="description" content="Qizhen Chen — architectural design and research." /></svelte:head>
<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell">
  <SiteHeader active="bio" />
  <main id="main" class="quiet-page"><h1>Qizhen Chen</h1><p>Architectural design and research across computational design, digital fabrication, and historic preservation.</p><p class="muted">Full biography and contact information forthcoming.</p></main>
  <footer class="site-footer"><span>© {new Date().getFullYear()} Qizhen Chen</span><a href={resolve('/')}>View work ↗</a></footer>
</div>
