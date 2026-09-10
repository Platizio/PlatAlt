# Browser checks

`npm run audit:browser` — the checks that need a rendered page. Run after `npm run build`.

```bash
npm run verify                                   # build + audit + audit:browser
npm run audit:browser
npm run audit:browser -- --only=forms,modal-focus
npm run audit:browser -- --pages=8               # sample N routes for contrast
npm run audit:browser -- --update-baseline       # rewrite the contrast baseline
```

`npm run audit` parses `dist/` and catches everything a parser can see. These four
cannot be seen that way, and each was verified by hand exactly once during the site
audit — which is the kind of verification that does not survive the next refactor.

| suite | why it needs a browser |
| --- | --- |
| `contrast` | The ratio depends on the *effective* background — often inherited through several transparent ancestors — on opacity, and on the size and weight the text actually renders at, which decides whether 4.5:1 or 3:1 applies. |
| `forms` | The submission rules are a state machine over `fetch`, not markup: a 2xx whose body says `success:false` is a failure, and a failed send must not reset the form. |
| `modal-focus` | `aria-modal="true"` is a promise. Whether Tab actually stays inside the dialog, whether the background is `inert`, and where focus lands on close are all runtime behaviour. |
| `viewport` | Whether a page scrolls sideways depends on rendered text metrics, on which responsive variant won, and on whether a decorative absolute element landed inside a clipping ancestor. None of that is in the markup. |

## How it runs

`dist/` is served from an in-process Node server on an ephemeral port — no `astro preview`
subprocess to orphan on Windows, and no port race with a dev server someone left running.

The browser is driven through `playwright-core` against **Chrome or Edge already on the
machine**. That is deliberate: the full `playwright` package downloads ~150 MB of browsers
on every `npm install`, which is a lot to carry for a site this size. If neither is present,
it falls back to a bundled Chromium, so `npx playwright install chromium` also works.

**Nothing reaches the network.** The Web3Forms relay is intercepted in-browser with
`page.route`, so the real `fetch` runs, real headers are sent, real responses are handled —
and no submission ever leaves the machine. Interception at the network layer rather than
monkeypatching `window.fetch` is what keeps the production code path under test.

Keyboard input in the modal suite is real: Playwright dispatches it through the browser, so
the focus trap is exercised the way a person exercises it rather than by synthesising
`KeyboardEvent`s a listener may or may not honour.

## The viewport sweep

`viewport` loads all 75 routes at 320, 360, 375, 390, 414 and 768px and fails if
anything exceeds the width. Nine page/width combinations were over when it was
written: a 60px display word with a 48px indent on a 320px screen, two `md:`
rows that assumed more than 768px, a three-level breadcrumb that would not wrap,
five bottom-bar items that needed 345px, and an icon name — `liquidity` — that
is not in Material Symbols, so the ligature never formed and the font painted
the word itself 216px wide.

There is **no baseline file**, unlike contrast. Contrast started with 40
pre-existing pairings and needed a burn-down list; this reached zero in one
pass, so a baseline would only be somewhere for a regression to hide.

A failure names the innermost culprit — the element that escapes while its own
parent stays inside — rather than the widened `<body>` or the `w-full` header
stretched by it. The culprit is the element whose classes need changing; the
symptom is not.

## The contrast baseline

`contrast-baseline.json` records the **40 colour pairings that were already failing** when
this check was first written — mostly dark-theme utility classes rendering on light cards,
which is invisible to static analysis and was missed by hand-sampling two pages.

It is a burn-down list, not an exemption list:

- anything **not** in it fails the run immediately, so no new failure can slip in;
- an entry that **stops occurring** is reported as stale, so the list cannot rot in the
  other direction once something is fixed.

Fix a pairing, then `--update-baseline` and commit the smaller file.

## Adding a check

A suite is a module under `suites/` exporting `run({ browser, baseUrl, routes })` that
returns a `createSuite(name)` reporter. Register it in `index.mjs`. `lib.mjs` has the
server, the browser launcher, and the route list read from `dist/` so it cannot drift.

**Verify a new check by breaking the thing it guards and confirming it fails.** All three
suites here were mutation-tested that way — a colour changed to an unreadable one, the
`success:false` branch deleted, the Tab handler short-circuited. Each was caught. A check
that has never failed is not yet a check.
