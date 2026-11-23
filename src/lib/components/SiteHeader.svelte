<script>
  import { resolve } from '$app/paths';
  /** @type {{ reference?: boolean, active?: 'work' | 'photography' | 'bio' | 'research' | 'about' }} */
  let { active = 'work', reference = true } = $props();
</script>

<header class="site-header" class:reference>
  <a class="identity" href={resolve('/')}>{reference ? 'Qizhen Chen' : 'QIZHEN CHEN'}</a>
  <nav aria-label="Main navigation">
    <a href={resolve('/')} aria-current={active === 'work' ? 'page' : undefined}>Work</a>
    {#if reference}
      <a href={resolve('/research')} aria-current={active === 'research' ? 'page' : undefined}>Research</a>
      <a href={resolve('/about')} aria-current={active === 'about' ? 'page' : undefined}>About</a>
    {:else}
    <a href={resolve('/photography')} aria-current={active === 'photography' ? 'page' : undefined}>Photography</a>
    <a href={resolve('/bio')} aria-current={active === 'bio' ? 'page' : undefined}>Bio</a>
    {/if}
  </nav>
</header>

<style>
  .reference { display: flex; flex-direction: row; justify-content: space-between; align-items: baseline; gap: 24px; padding: 40px 0 56px; }
  .reference .identity { flex-shrink: 0; white-space: nowrap; font-size: 19px; letter-spacing: 0; }
  .reference nav { display: flex; flex-wrap: nowrap; justify-content: flex-end; margin-left: auto; padding: 0; font-size: 14px; gap: 32px; }
  .reference nav a { white-space: nowrap; color: var(--fg-dim); text-decoration: underline; text-underline-offset: 5px; text-decoration-thickness: 1px; }
  .reference nav a[aria-current] { color: var(--hi-fg); background: var(--hi); }
  .reference nav a::after { display: none; }
  .reference nav a:hover { color: var(--hi-fg); background: var(--hi); }
  @media (max-width: 700px) { .reference { gap: 16px; padding: 28px 0 40px; } .reference .identity { font-size: 16px; } .reference nav { font-size: 12px; gap: 20px; } }
  @media (max-width: 400px) { .reference { gap: 12px; } .reference .identity { font-size: 14px; } .reference nav { font-size: 11px; gap: 12px; } }
</style>
