<script>
  import { staticUrl } from '#lib/utils/urls.js';
  import SiteHeader from '#lib/components/SiteHeader.svelte';
</script>
<svelte:head><title>About — Qizhen Chen</title><meta name="description" content="Qizhen Chen — architectural design and research." /></svelte:head>
<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell aligned-page-shell shell">
  <SiteHeader reference active="about" />
  <main id="main" class="quiet-page">
    <img class="portrait" src={staticUrl('/images/about/portrait.png')} alt="Portrait of Qizhen Chen" width="1105" height="1423" />
    <div class="biography">
      <h1>Qizhen Chen</h1>
      <p>Architectural design and research across computational design, digital fabrication, and historic preservation.</p>
      <section class="education" aria-labelledby="education-heading">
        <h2 id="education-heading">EDUCATION</h2>
        <p class="institution">Columbia University</p>
        <p class="school">Graduate School of Architecture,<br />Planning and <span class="school-name">Preservation (GSAPP)</span></p>
        <p class="degrees">M.S. in Historic Preservation<br />M.S. in Advanced Architectural Design</p>
      </section>
    </div>
  </main>
</div>
<style>
  .shell { padding-bottom: 80px; }
  .quiet-page {
    padding-top: 0;
    max-width: none;
    display: grid;
    grid-template-columns: minmax(280px, 30fr) minmax(0, 70fr);
    column-gap: clamp(32px, 4vw, 48px);
    align-items: start;
  }
  .biography { min-width: 0; }
  .quiet-page h1 { font-size: 48px; line-height: 1.2; }
  .quiet-page p { font-size: 16px; line-height: 1.8; }
  .education { max-width: 600px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #ddd; }
  .education h2 { font-size: 12px; font-weight: 400; line-height: 1.6; letter-spacing: .12em; color: #666; margin-bottom: 14px; }
  .education .institution { font-weight: 500; margin-bottom: 4px; }
  .education .school { max-width: 100%; font-size: 14px; line-height: 1.65; color: #555; }
  .school-name { white-space: nowrap; }
  .education .degrees { margin-top: 12px; font-weight: 400; line-height: 1.65; }
  .portrait { display: block; width: 100%; max-width: 320px; height: auto; justify-self: start; }
  @media (max-width: 760px) {
    .quiet-page { grid-template-columns: minmax(0, 1fr); row-gap: 40px; }
    .quiet-page h1 { font-size: clamp(32px, 6vw, 44px); }
  }
  @media (max-width: 600px) { .shell { padding-bottom: 50px; } }
</style>
