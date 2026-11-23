<script lang="ts">
  import { onDestroy } from 'svelte';

  let { src, title, autoHeight = false }: { src: string; title: string; autoHeight?: boolean } = $props();
  let frame: HTMLIFrameElement;
  let height = $state(1400);
  let disconnect = () => {};

  function loaded() {
    disconnect();
    if (!autoHeight) return;
    // These original applications are served locally. Measure their content without
    // injecting styles or scripts into the application or changing research files.
    const doc = frame.contentDocument;
    const content = doc?.querySelector<HTMLElement>('.page') ?? doc?.body;
    if (!doc || !content) return;
    const embeddedWindow = frame.contentWindow;
    let pending = 0;
    function measure() {
      pending = 0;
      // The sandbox's .page is content-sized, unlike body.scrollHeight which can
      // retain the iframe's old viewport height and prevent it shrinking on resize.
      const next = Math.ceil(Math.max(content!.getBoundingClientRect().height, content!.scrollHeight)) + 2;
      if (Math.abs(next - height) > 2) height = Math.max(720, next);
    }
    function schedule() {
      if (!pending) pending = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(content);
    embeddedWindow?.addEventListener('resize', schedule);
    doc.addEventListener('load', schedule, true);
    schedule();
    disconnect = () => {
      observer.disconnect();
      cancelAnimationFrame(pending);
      embeddedWindow?.removeEventListener('resize', schedule);
      doc.removeEventListener('load', schedule, true);
    };
  }

  onDestroy(() => disconnect());
</script>

<iframe bind:this={frame} {src} {title} onload={loaded} style:height={autoHeight ? `${height}px` : undefined} allow="fullscreen" allowfullscreen></iframe>

<style>
  iframe { display: block; width: 100%; height: clamp(720px, 82vh, 1050px); border: 1px solid var(--rule); margin-bottom: 48px; }
</style>
