<script lang="ts">
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const allowed = matchMedia('(min-width: 900px) and (pointer: fine) and (hover: hover)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const touch = matchMedia('(any-pointer: coarse)');
    const agents = Array.from({ length: 10 }, (_, i) => {
      const angle = i * Math.PI * 2 / 10;
      const radius = i % 2 === 0 ? 42 : 62;
      return { x: 0, y: 0, vx: 0, vy: 0, offsetX: Math.cos(angle) * radius, offsetY: Math.sin(angle) * radius };
    });
    let boxes: { left: number; right: number; top: number; bottom: number }[] = [];
    let frame = 0, measured = 0, last = 0, lastMove = 0, scale = 1;
    let x = 0, y = 0, inside = false, focused = document.hasFocus();
    const enabled = () => allowed.matches && !reduced.matches && !touch.matches && !document.hidden && focused;
    const clear = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
    function stop() { cancelAnimationFrame(frame); frame = 0; clear(); }
    function measure() {
      if (!enabled()) return;
      boxes = Array.from(document.querySelectorAll('main img, main li a, main h1, main h2, main p')).map(node => {
        const r = node.getBoundingClientRect();
        return { left: r.left + scrollX, right: r.right + scrollX, top: r.top + scrollY, bottom: r.bottom + scrollY };
      }).filter(r => r.right > r.left && r.bottom > r.top);
    }
    function queueMeasure() { clearTimeout(measured); measured = window.setTimeout(measure, 120); }
    function resize() {
      stop();
      if (!enabled()) return;
      scale = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * scale);
      canvas.height = Math.round(innerHeight * scale);
      measure();
      start();
    }
    function start() {
      if (!frame && inside && enabled()) { last = performance.now(); frame = requestAnimationFrame(draw); }
    }
    function draw(now: number) {
      frame = 0;
      if (!enabled() || !inside || now - lastMove > 5000) { clear(); return; }
      frame = requestAnimationFrame(draw);
      if (now - last < 1000 / 30) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx!.setTransform(scale, 0, 0, scale, 0, 0);
      ctx!.clearRect(0, 0, innerWidth, innerHeight);
      ctx!.fillStyle = getColor;
      for (let i = 0; i < agents.length; i++) {
        const a = agents[i];
        // Staggered arrival points keep ten arrows loosely grouped around the pointer.
        let fx = (x + a.offsetX - a.x) * 14 - a.vx * 7;
        let fy = (y + a.offsetY - a.y) * 14 - a.vy * 7;
        for (let j = 0; j < agents.length; j++) {
          if (i === j) continue;
          const dx = a.x - agents[j].x, dy = a.y - agents[j].y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < 24) {
            fx += dx / distance * (24 - distance) * 24;
            fy += dy / distance * (24 - distance) * 24;
          }
        }
        a.vx += fx * dt; a.vy += fy * dt;
        const speed = Math.hypot(a.vx, a.vy);
        if (speed > 380) { a.vx *= 380 / speed; a.vy *= 380 / speed; }
        a.x += a.vx * dt; a.y += a.vy * dt;
        // Resolve overlaps against cached document-space text/image boundaries.
        for (const b of boxes) {
          const px = a.x + scrollX, py = a.y + scrollY;
          if (px < b.left - 5 || px > b.right + 5 || py < b.top - 5 || py > b.bottom + 5) continue;
          const left = px - b.left + 5, right = b.right + 5 - px;
          const top = py - b.top + 5, bottom = b.bottom + 5 - py;
          const depth = Math.min(left, right, top, bottom);
          const side = depth === left ? 0 : depth === right ? 1 : depth === top ? 2 : 3;
          if (side === 0) { a.x = b.left - scrollX - 6; a.vx = -Math.abs(a.vx) * .3; }
          else if (side === 1) { a.x = b.right - scrollX + 6; a.vx = Math.abs(a.vx) * .3; }
          else if (side === 2) { a.y = b.top - scrollY - 6; a.vy = -Math.abs(a.vy) * .3; }
          else { a.y = b.bottom - scrollY + 6; a.vy = Math.abs(a.vy) * .3; }
        }
        a.x = Math.max(7, Math.min(innerWidth - 7, a.x));
        a.y = Math.max(7, Math.min(innerHeight - 7, a.y));
        ctx!.save(); ctx!.translate(a.x, a.y);
        ctx!.rotate(Math.atan2(y - a.y, x - a.x));
        ctx!.beginPath(); ctx!.moveTo(7, 0); ctx!.lineTo(-5, 4);
        ctx!.lineTo(-2, 0); ctx!.lineTo(-5, -4); ctx!.closePath(); ctx!.fill(); ctx!.restore();
      }
    }
    const getColor = getComputedStyle(document.documentElement).getPropertyValue('--hi').trim();
    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || !enabled()) return;
      x = event.clientX; y = event.clientY; lastMove = performance.now();
      if (!inside) agents.forEach(a => { a.x = x + a.offsetX; a.y = y + a.offsetY; a.vx = a.vy = 0; });
      inside = true; start();
    }
    function leave() { inside = false; stop(); }
    function blur() { focused = false; leave(); }
    function focus() { focused = true; resize(); }
    const observer = new ResizeObserver(queueMeasure);
    observer.observe(document.body);
    const changes = new MutationObserver(queueMeasure);
    changes.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', queueMeasure, { passive: true });
    window.addEventListener('blur', blur); window.addEventListener('focus', focus);
    document.addEventListener('pointerleave', leave);
    document.addEventListener('visibilitychange', resize);
    for (const media of [allowed, reduced, touch]) media.addEventListener('change', resize);
    resize();
    return () => {
      stop(); clearTimeout(measured); observer.disconnect(); changes.disconnect();
      window.removeEventListener('pointermove', move); window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', queueMeasure); window.removeEventListener('blur', blur); window.removeEventListener('focus', focus);
      document.removeEventListener('pointerleave', leave); document.removeEventListener('visibilitychange', resize);
      for (const media of [allowed, reduced, touch]) media.removeEventListener('change', resize);
    };
  });
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
  canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20; }
  @media (max-width: 899px), (pointer: coarse), (any-pointer: coarse), (prefers-reduced-motion: reduce) { canvas { display: none; } }
</style>
