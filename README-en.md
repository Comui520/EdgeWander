# EdgeWander

> A time machine for the forgotten internet — wander back into a random corner of the 1996-2010 web.

English · [中文](./README.md)

**[screenshot of the home page — showing the CRT grain, the control-strip nav, the big WANDER button]**

---

## What is this?

EdgeWander is a small, aesthetic web toy. You press a single button and it throws you into a random corner of the early internet — a GeoCities homepage, a 2001 forum thread, someone's long-silent LiveJournal, a 1999 Chinese portal. Every destination is a real capture pulled from the Internet Archive's Wayback Machine.

The whole site is dressed up to match: scanlines, phosphor burn-in, flickering pixel fonts, a DIP-switch for language, a tiny crosshair cursor. It feels less like a website and more like a broken piece of hardware still glowing in the corner of a room.

---

## The idea

Most of the pages this site sends you to were made by teenagers, amateurs, and strangers who are probably no longer online. They used blinking GIFs, visitor counters, webrings, guestbooks. Then the web got "professional" and all of that got paved over.

EdgeWander is half museum, half shrine: press the button, visit a ghost.

Two features lean into that feeling:

### Leave your name

**[screenshot of the "leave your name" modal]**

A guestbook. Click the rust-colored button on the home page, type your name (and a line, if you want), submit. Everyone who has ever done this is stored forever.

### Hall of Fame

**[screenshot of the Hall of Fame — names floating as stars in a dark sky]**

Every signature floats as a star in a dark phosphor sky. They drift, they occasionally glitch out from "bad signal," and they stabilize again. The more people sign, the denser the night.

---

## Details worth pointing out

- **Bilingual, no reload.** A tiny DIP-switch toggle in the top right flips every string on the site between English and 中文 — body copy, buttons, error messages, loading phases, modal, footer. **[close-up of the language switch + a before/after of the toggle]**

- **Real visitor counter.** Upstash Redis `INCR` backs a 7-digit pixel flap counter at the top of the home page. No analytics, no tracking — just one integer that ticks up when someone new shows up.

- **The time machine is actually a race.** Pressing WANDER fires six parallel CDX queries to the Internet Archive against random nostalgic domains. First one to come back wins, the rest are aborted. A cold CDX call from mainland China can take 15-50 seconds for a single domain — racing six hides the long tail and usually lands a result in 12-18 seconds.

- **Zero images, anywhere.** Every retro effect — scanlines, noise, beveled metal, the DIP switch, the cursor reticle, the manufacturer's nameplate in the footer — is CSS, SVG, and DOM. No textures, no pre-rendered sprites. First-load JS is about 140KB.

- **Custom cursor.** A pixel crosshair with a phosphor trail follows the mouse. Over interactive elements it turns green and snaps into a tighter "lock" state; mouse-down collapses it into a red shutter. Respects `prefers-reduced-motion` and quietly disables itself on touch.

**[screenshot or GIF of the pixel cursor hovering over a button — showing the green LOCK state]**

---

## Try it

Live site: **[your Vercel deployment URL]**

Or run it locally — works without any env vars thanks to an in-memory Redis fallback. See [SETUP.md](./SETUP.md) for the full Upstash + Vercel walkthrough.

```bash
git clone https://github.com/comui520/edgewander.git
cd edgewander
npm install
npm run dev
```

Then open http://localhost:3000.

---

## Built with

| Layer          | What it is                                                          |
| -------------- | ------------------------------------------------------------------- |
| Framework      | Next.js 14 (App Router)                                             |
| Runtime        | Edge Runtime for all API routes                                     |
| Language       | TypeScript                                                          |
| Styling        | Tailwind CSS + hand-written CSS for the CRT effects                 |
| Motion         | Framer Motion                                                       |
| Fonts          | Press Start 2P · VT323 (self-hosted via `next/font`)                |
| Database       | Upstash Redis (with a transparent in-memory fallback for local dev) |
| Archive source | Internet Archive CDX Server API                                     |
| Deploy         | Vercel                                                              |

Every retro visual effect is pure CSS/SVG — no image assets. The whole aesthetic is about 500 lines of CSS in [`src/app/globals.css`](./src/app/globals.css).

---

## License

This project is released under a **source-available, non-commercial** license.

- ✅ You may clone, read, fork, self-host, modify, and share.
- ✅ You may use it for personal, educational, or artistic purposes.
- ❌ You may not sell it, use it in a commercial product, or host it behind paid access.

See [LICENSE](./LICENSE) for full terms. If you want to build something commercial on top of it, open an issue first and we'll talk.

---

## Credits

Made by **[comui520](https://github.com/comui520)** together with Claude. The real heroes are the Internet Archive and the countless anonymous people whose 1999 homepages are still accidentally findable today. Long may their visitor counters tick.
