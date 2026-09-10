/**
 * Dialog focus behaviour.
 *
 * All four dialogs declare role="dialog" aria-modal="true", which is a promise
 * to assistive technology that the rest of the page is unavailable. Before the
 * audit nothing enforced it: Tab left the dialog, the background stayed
 * focusable, and closing dropped focus onto a display:none input — which
 * browsers reset to <body>, so a keyboard user lost their place.
 *
 * Keyboard input here is real (Playwright dispatches it through the browser),
 * so the trap is exercised the way a person exercises it rather than by
 * synthesising KeyboardEvents that a listener may or may not honour.
 */
import { createSuite } from '../lib.mjs';

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),' +
  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export async function run({ browser, baseUrl }) {
  const suite = createSuite('modal-focus');
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseUrl + '/', { waitUntil: 'load' });

  const visibleFocusables = (sel) => page.evaluate(
    ([root, q]) => [...document.querySelector(root).querySelectorAll(q)]
      .filter((el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length)
      .map((el) => el.id || el.tagName + '.' + String(el.className || '').trim().split(/\s+/)[0]),
    [sel, FOCUSABLE],
  );
  const active = () => page.evaluate(() =>
    document.activeElement === document.body
      ? 'BODY'
      : (document.activeElement.id || document.activeElement.tagName + '.' + String(document.activeElement.className || '').trim().split(/\s+/)[0]));

  /* A real click, so the trigger takes focus the way it does for a person —
     which is what closing has to restore focus to. */
  await page.click('.js-open-consult');
  await page.waitForTimeout(250);

  const opened = await page.evaluate(() => document.getElementById('investor-modal').classList.contains('is-open'));
  suite.check('opens on the consult trigger', opened);

  suite.check('focus moves into the dialog', await page.evaluate(
    () => document.getElementById('investor-modal').contains(document.activeElement)), `active=${await active()}`);

  /* Background must be inert — not merely visually covered. */
  const bg = await page.evaluate(() => ({
    header: document.querySelector('header')?.hasAttribute('inert') ?? false,
    main: document.querySelector('main')?.hasAttribute('inert') ?? false,
    footer: document.querySelector('footer')?.hasAttribute('inert') ?? false,
    toast: document.getElementById('site-toast')?.hasAttribute('inert') ?? false,
    scrollLocked: document.body.classList.contains('av-modal-open'),
  }));
  suite.check('header, main and footer are inert while open', bg.header && bg.main && bg.footer, JSON.stringify(bg));
  suite.check('body scroll is locked', bg.scrollLocked);

  /* Deliberately excluded: #site-toast is the aria-live region carrying the
     consultation form's own validation messages, which fire while a dialog is
     open. Inerting it would silence exactly the announcements the dialog
     depends on — so this asserts the exception, not an oversight. */
  suite.check('the aria-live toast is NOT inert', bg.toast === false, `toast inert=${bg.toast}`);

  suite.check('background controls cannot take focus', await page.evaluate(() => {
    const link = document.querySelector('header a');
    link.focus();
    return document.activeElement !== link;
  }));

  /* Forward wrap: Tab from the last control returns to the first. */
  const items = await visibleFocusables('#investor-modal');
  await page.evaluate(([root, q]) => {
    const list = [...document.querySelector(root).querySelectorAll(q)]
      .filter((el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    list[list.length - 1].focus();
  }, ['#investor-modal', FOCUSABLE]);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(80);
  suite.check('Tab from the last control wraps to the first',
    (await active()) === items[0], `expected ${items[0]}, got ${await active()}`);

  /* Reverse wrap. */
  await page.evaluate(([root, q]) => {
    const list = [...document.querySelector(root).querySelectorAll(q)]
      .filter((el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    list[0].focus();
  }, ['#investor-modal', FOCUSABLE]);
  await page.keyboard.press('Shift+Tab');
  await page.waitForTimeout(80);
  suite.check('Shift+Tab from the first control wraps to the last',
    (await active()) === items[items.length - 1], `expected ${items[items.length - 1]}, got ${await active()}`);

  /* Close, and land back where the user was. */
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  const after = await page.evaluate(() => ({
    closed: !document.getElementById('investor-modal').classList.contains('is-open'),
    headerInert: document.querySelector('header').hasAttribute('inert'),
    headerHidden: document.querySelector('header').getAttribute('aria-hidden'),
    scrollLocked: document.body.classList.contains('av-modal-open'),
    restored: document.activeElement === document.querySelector('.js-open-consult'),
  }));
  suite.check('Escape closes the dialog', after.closed);
  suite.check('inert is lifted on close', after.headerInert === false && after.headerHidden === null,
    `inert=${after.headerInert} aria-hidden=${after.headerHidden}`);
  suite.check('body scroll lock is released', after.scrollLocked === false);
  suite.check('focus returns to the element that opened it', after.restored, `active=${await active()}`);

  await page.close();
  return suite;
}
