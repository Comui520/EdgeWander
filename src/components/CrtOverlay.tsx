/**
 * Fixed, fullscreen, non-interactive stack of CRT effects. Rendered once at
 * the root layout. Mobile styles in globals.css suppress the heaviest layer.
 */
export function CrtOverlay() {
  return (
    <>
      <div className="crt-overlay crt-overlay--fringe" aria-hidden />
      <div className="crt-overlay crt-overlay--noise" aria-hidden />
      <div className="crt-overlay crt-overlay--scanlines" aria-hidden />
      <div className="crt-overlay crt-overlay--vignette" aria-hidden />
      <div className="error-stripe error-stripe--tl" aria-hidden />
      <div className="error-stripe error-stripe--br" aria-hidden />
    </>
  );
}
