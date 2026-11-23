<script>
  import { resolve } from '$app/paths';
  import SiteHeader from '#lib/components/SiteHeader.svelte';
</script>
<svelte:head><title>Photography — Qizhen Chen</title><meta name="description" content="Photography by Qizhen Chen. A selection is forthcoming." /></svelte:head>
<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell">
  <SiteHeader active="photography" />
  <main id="main" class="quiet-page"><h1>Photography</h1><p>A selection of photographs is forthcoming.</p></main>
  <footer class="site-footer"><span>© {new Date().getFullYear()} Qizhen Chen</span><a href={resolve('/')}>View work ↗</a></footer>
</div>
