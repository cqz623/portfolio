<script>
  import { projectUrl } from '#lib/utils/urls.js';
  import SiteHeader from '#lib/components/SiteHeader.svelte';
</script>

<svelte:head>
  <title>Research — Qizhen Chen</title>
  <meta name="description" content="From Representation to Decision — master's thesis research at Columbia GSAPP." />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell aligned-page-shell shell">
  <SiteHeader reference active="research" />
  <main id="main">
    <h1>Research</h1>
    <article class="research-entry" aria-labelledby="thesis-title">
      <span class="entry-number" aria-label="Entry 01">01</span>
      <div class="entry-content">
        <p class="entry-type">MASTER'S THESIS · COLUMBIA GSAPP</p>
        <h2 id="thesis-title">From Representation to Decision: Historical Evidence, Preservation Arguments, and LPC Reviews of the Metropolitan Museum of Art’s Expansions</h2>
        <p class="advisor">Advisor: Françoise Bollack</p>
        <p class="description">Examines how historical documents and architectural drawings inform preservation arguments, evolving values, and regulatory decisions through successive LPC reviews of the Metropolitan Museum of Art’s expansions. The research connects architectural knowledge representation with broader questions of information systems, spatial reasoning, and Spatial AI.</p>
      </div>
      <p class="status">Status: in progress</p>
    </article>
    <article class="research-entry" aria-labelledby="reuse-title">
      <span class="entry-number" aria-label="Entry 02">02</span>
      <div class="entry-content">
        <p class="entry-type">COLLABORATIVE RESEARCH · COLUMBIA GSAPP · SPRING 2026</p>
        <h2 id="reuse-title">Reuse and Deconstruction: Decarbonization on Columbia University’s Manhattanville Campus</h2>
        <p class="advisor">Faculty: Erica Avrami &amp; Anna Gasha</p>
        <p class="description">Combines GIS-based spatial analysis, historical building data, and embodied carbon assessment to investigate low-carbon redevelopment strategies. Drawing on a spatiotemporal database of 261 buildings from 1894 to 2026, the research evaluates building retention, demolition, adaptive reuse, and material recovery to support data-driven decisions for sustainable urban transformation.</p>
        <a class="project-link" href={projectUrl('decarbonization')}>View project →</a>
      </div>
      <p class="status">Status: completed</p>
    </article>
    <article class="research-entry" aria-labelledby="aptne-title">
      <span class="entry-number" aria-label="Entry 03">03</span>
      <div class="entry-content">
        <p class="entry-type">APTNE 2027 ANNUAL MEETING &amp; SYMPOSIUM</p>
        <h2 id="aptne-title">Should We Preserve the Scars of Water? Material Deterioration as Historical Evidence in Venice’s Arsenale</h2>
        <p class="description">Investigates water-related deterioration of historic masonry and lime plaster at Venice’s Arsenale. By mapping material conditions and correlating deterioration patterns with historical records, the research explores how spatial and temporal data can inform the interpretation of material changes and guide conservation decisions.</p>
        <a class="project-link" href={projectUrl('aptne-presentation')}>View project →</a>
      </div>
      <p class="status">Status: accepted</p>
    </article>
  </main>
</div>

<style>
  .shell { padding-bottom: 80px; }
  h1 { font-size: 24px; font-weight: 400; margin-bottom: 24px; }
  .research-entry {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) auto;
    gap: 32px;
    align-items: start;
    border-block: 1px solid #ddd;
    padding-block: 28px 40px;
  }
  .research-entry + .research-entry { border-top: 0; }
  /* Match entry 01's status width so both entries share identical columns. */
  .research-entry + .research-entry .status { min-width: 19ch; }
  .project-link { display: inline-block; margin-top: 20px; font-size: 13px; line-height: 1.8; color: var(--fg-dim); }
  .entry-number { font-size: 14px; line-height: 1.6; }
  .entry-content { min-width: 0; }
  .entry-type { font-size: 12px; line-height: 1.6; letter-spacing: .06em; color: var(--fg-dim); }
  h2 { max-width: 60ch; font-size: clamp(20px, 1.7vw, 25px); line-height: 1.5; font-weight: 400; margin-top: 14px; }
  .advisor { font-size: 14px; line-height: 1.8; margin-top: 20px; }
  .description { max-width: 76ch; font-size: 15px; line-height: 1.8; margin-top: 24px; }
  .status { font-size: 12px; line-height: 1.6; color: var(--fg-dim); text-align: right; white-space: nowrap; }
  @media (max-width: 760px) {
    .research-entry { grid-template-columns: 32px minmax(0, 1fr); gap: 24px 16px; }
    .entry-number { grid-column: 1; grid-row: 1; }
    .status { grid-column: 2; grid-row: 1; }
    .entry-content { grid-column: 1 / -1; grid-row: 2; }
  }
  @media (max-width: 600px) { .shell { padding-bottom: 50px; } }
</style>
