/** Autoplay decorative covers only while visible and the browser tab is active.
 * @param {HTMLVideoElement} node
 */
export function visibleVideo(node) {
  let visible = false;
  let destroyed = false;
  function update() {
    if (!visible || document.hidden || destroyed) { node.pause(); return; }
    node.muted = true;
    const playback = node.play();
    playback?.then(() => { if (!visible || document.hidden || destroyed) node.pause(); }).catch(() => {});
  }
  function guardPlayback() { if (!visible || document.hidden || destroyed) node.pause(); }
  node.addEventListener('play', guardPlayback);
  node.pause();
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    update();
  }, { threshold: 0 });
  observer.observe(node);
  document.addEventListener('visibilitychange', update);
  return { destroy() { destroyed = true; observer.disconnect(); node.removeEventListener('play', guardPlayback); document.removeEventListener('visibilitychange', update); node.pause(); } };
}
