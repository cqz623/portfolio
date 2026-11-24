<script>
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
