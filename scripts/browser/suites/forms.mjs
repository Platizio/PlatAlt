/**
 * The form submission state machine.
 *
 * Every form on this site once preventDefault()ed, reset, and showed a success
 * message without sending anything. The rules that replaced that behaviour are
 * in public/site-interactive.js, and all of them are invisible to a parser:
 *
 *   1. nothing is called a success unless the relay returned 2xx *and* its
 *      body did not say success:false
 *   2. nothing is sent that has not passed validation
 *   3. on failure the form is NOT reset — the user's typing is the only copy
 *      of that lead
 *
 * The relay is intercepted at the network layer rather than by replacing
 * window.fetch, so the real code path runs: the real fetch, the real headers,
 * the real response handling. Nothing reaches api.web3forms.com.
 */
import { createSuite } from '../lib.mjs';

const RELAY = '**://api.web3forms.com/**';

const FIELDS = {
  '#partner-name': 'Audit Tester',
  '#partner-email': 'audit@example.invalid',
  '#partner-phone': '+919999999999',
  '#partner-city': 'Noida',
  '#partner-arn': 'ARN-TEST',
  '#partner-business': 'Audit LLP',
  '#partner-message': 'automated audit — not a real enquiry',
};

export async function run({ browser, baseUrl }) {
  const suite = createSuite('forms');
  const page = await browser.newPage();

  /* Controlled by each test; every request is counted and captured. */
  let mode = 'success';
  const sent = [];

  await page.route(RELAY, async (route) => {
    sent.push(JSON.parse(route.request().postData() || '{}'));
    if (mode === 'network-error') return route.abort('failed');
    if (mode === 'http-500') return route.fulfill({ status: 500, body: 'upstream error' });
    if (mode === 'relay-rejects') {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify({ success: false, message: 'Invalid access key' }),
      });
    }
    return route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Email sent successfully' }),
    });
  });

  await page.goto(baseUrl + '/partner', { waitUntil: 'load' });

  const fill = async (withConsent = true) => {
    for (const [sel, value] of Object.entries(FIELDS)) await page.fill(sel, value);
    await page.setChecked('#partner-consent', withConsent);
  };
  const state = () => page.evaluate(() => ({
    thankyou: document.getElementById('thankyou-modal')?.classList.contains('is-open') ?? false,
    failure: document.getElementById('formfail-modal')?.classList.contains('is-open') ?? false,
    name: document.getElementById('partner-name').value,
    buttonEnabled: !document.querySelector('#partner-form [type=submit]').disabled,
  }));
  const dismiss = () => page.evaluate(() => {
    document.getElementById('thankyou-close')?.click();
    document.getElementById('formfail-close')?.click();
  });
  const submit = () => page.evaluate(() => document.getElementById('partner-form').requestSubmit());
  const settle = () => page.waitForTimeout(350);

  /* 1 — an empty form must not reach the relay */
  sent.length = 0;
  await submit(); await settle();
  suite.check('empty submission is blocked before the relay', sent.length === 0, `${sent.length} request(s)`);

  /* 2 — consent is required */
  await fill(false); sent.length = 0;
  await submit(); await settle();
  suite.check('missing consent is blocked before the relay', sent.length === 0, `${sent.length} request(s)`);
  await dismiss();

  /* 3 — a dropped connection is a failure, and must not eat the lead */
  await fill(); mode = 'network-error'; sent.length = 0;
  await submit(); await settle();
  let s = await state();
  suite.check('network error shows the failure modal', s.failure && !s.thankyou, `failure=${s.failure} thankyou=${s.thankyou}`);
  suite.check('network error preserves what the user typed', s.name === FIELDS['#partner-name'], `name="${s.name}"`);
  suite.check('network error re-enables the submit button', s.buttonEnabled);
  await dismiss();

  /* 4 — a 5xx is a failure */
  await fill(); mode = 'http-500'; sent.length = 0;
  await submit(); await settle();
  s = await state();
  suite.check('HTTP 500 shows the failure modal', s.failure && !s.thankyou, `failure=${s.failure} thankyou=${s.thankyou}`);
  await dismiss();

  /* 5 — the case that matters most: 200 OK, body says it failed */
  await fill(); mode = 'relay-rejects'; sent.length = 0;
  await submit(); await settle();
  s = await state();
  suite.check('HTTP 200 with success:false is a failure, not a thank-you', s.failure && !s.thankyou, `failure=${s.failure} thankyou=${s.thankyou}`);
  suite.check('a rejected submission preserves what the user typed', s.name === FIELDS['#partner-name'], `name="${s.name}"`);
  await dismiss();

  /* 6 — the happy path, and the shape of what is actually sent */
  await fill(); mode = 'success'; sent.length = 0;
  await submit(); await settle();
  s = await state();
  suite.check('success shows the thank-you modal', s.thankyou && !s.failure, `thankyou=${s.thankyou} failure=${s.failure}`);
  suite.check('success resets the form', s.name === '', `name="${s.name}"`);
  const payload = sent[0] ?? {};
  suite.check('payload carries the honeypot field', 'botcheck' in payload, Object.keys(payload).join(', '));
  suite.check('payload carries a reply-to address', payload.replyto === FIELDS['#partner-email'], `replyto=${payload.replyto}`);
  suite.check('payload names the originating form', payload.form_name === 'partner-registration', `form_name=${payload.form_name}`);
  await dismiss();

  /* 7 — re-entrancy: Enter, a double click and requestSubmit all race here */
  await fill(); mode = 'success'; sent.length = 0;
  await page.evaluate(() => {
    const f = document.getElementById('partner-form');
    f.requestSubmit(); f.requestSubmit(); f.requestSubmit();
  });
  await settle();
  suite.check('three concurrent submits send exactly one request', sent.length === 1, `${sent.length} request(s)`);
  await dismiss();

  await page.close();
  return suite;
}
