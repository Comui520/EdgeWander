/**
 * Fixed, fullscreen, non-interactive stack of CRT effects. Rendered once at
 * the root layout. Mobile styles in globals.css suppress the heaviest layer.
 *
 * Layer order (bottom → top):
 *   fringe   · subtle red/blue edges from a failing convergence yoke
 *   burnin   · faint amber ghost at the top, green at the bottom-right
 *   noise    · fractal noise, shuddering 2-step
 *   scanlines· the classic CRT grid (hidden on phones)
 *   vignette · soft darkening toward corners, not a hard crush
 */
export function CrtOverlay() {
  return (
    <>
      <div className="crt-overlay crt-overlay--fringe" aria-hidden />
      <div className="crt-overlay crt-overlay--burnin" aria-hidden />
      <div className="crt-overlay crt-overlay--noise" aria-hidden />
      <div className="crt-overlay crt-overlay--scanlines" aria-hidden />
      <div className="crt-overlay crt-overlay--vignette" aria-hidden />
      <div className="error-stripe error-stripe--tl" aria-hidden />
      <div className="error-stripe error-stripe--br" aria-hidden />
    </>
  );
}
