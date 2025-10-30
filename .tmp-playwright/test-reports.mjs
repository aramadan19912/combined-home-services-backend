import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const username = process.env.PLAYWRIGHT_USERNAME;
const password = process.env.PLAYWRIGHT_PASSWORD;
const reportsUrl = 'https://preview--egypt-pos-tax-sync.lovable.app/reports';

if (!username || !password) {
  console.error('Missing PLAYWRIGHT_USERNAME or PLAYWRIGHT_PASSWORD');
  process.exit(1);
}

const outDir = '/workspace';
const screenshotPath = `${outDir}/reports_screenshot.png`;
const htmlPath = `${outDir}/reports.html`;
const consoleLogPath = `${outDir}/reports_console.json`;

const logs = [];

function addLog(type, message) {
  logs.push({ ts: new Date().toISOString(), type, message });
}

async function saveArtifacts(page) {
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await fs.writeFile(htmlPath, await page.content(), 'utf8');
  await fs.writeFile(consoleLogPath, JSON.stringify(logs, null, 2), 'utf8');
}

async function clickFirst(page, selectors) {
  for (const selector of selectors) {
    const el = await page.$(selector);
    if (el) {
      await Promise.all([
        page.waitForLoadState('networkidle').catch(() => {}),
        el.click({ timeout: 5000 }).catch(() => {}),
      ]);
      return true;
    }
  }
  return false;
}

async function findFirst(page, selectors, opts = {}) {
  for (const selector of selectors) {
    const handle = await page.$(selector);
    if (handle) return handle;
  }
  if (opts.required) throw new Error('Required selector not found');
  return null;
}

async function attemptEmailPasswordLogin(page) {
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[autocomplete="username"]',
    'input[inputmode="email"]',
  ];
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[autocomplete="current-password"]',
  ];
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Sign in")',
    'button:has-text("Log in")',
    'button:has-text("Continue")',
    'button:has-text("Next")',
    'input[type="submit"]',
    'text=/^(sign in|log in|continue|submit)$/i',
  ];

  // Sometimes there is an intermediate auth-bridge page
  if (page.url().includes('auth-bridge')) {
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  }

  let emailField = await findFirst(page, emailSelectors);
  if (!emailField) {
    // Try clicking a generic sign-in button to reveal fields
    await clickFirst(page, [
      'text=/sign in/i',
      'text=/log in/i',
      'button:has-text("Email")',
      'button:has-text("Continue with email")',
      'button:has-text("Continue")',
    ]);
    emailField = await findFirst(page, emailSelectors);
  }

  if (!emailField) {
    addLog('warn', 'Email field not found on page');
    return false;
  }

  await emailField.fill('');
  await emailField.type(username, { delay: 10 });

  // Some forms require continue before password appears
  let passwordField = await findFirst(page, passwordSelectors);
  if (!passwordField) {
    await clickFirst(page, [
      'button:has-text("Continue")',
      'text=/next/i',
    ]);
    passwordField = await findFirst(page, passwordSelectors);
  }

  if (!passwordField) {
    addLog('warn', 'Password field not found after entering email');
    return false;
  }

  await passwordField.fill('');
  await passwordField.type(password, { delay: 10 });

  // Submit form
  const submitted = await clickFirst(page, submitSelectors);
  if (!submitted) {
    // Try pressing Enter in password field
    await passwordField.press('Enter').catch(() => {});
    await page.waitForLoadState('networkidle').catch(() => {});
  }

  // Wait for redirect back to app domain
  const loginSucceeded = await page.waitForFunction(
    () => location.hostname.includes('preview--egypt-pos-tax-sync.lovable.app'),
    { timeout: 30000 }
  ).then(() => true).catch(() => false);

  return loginSucceeded;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-blink-features=AutomationControlled'] });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1366, height: 900 },
    userAgent:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    locale: 'en-US',
  });
  const page = await context.newPage();

  page.on('console', (msg) => addLog('console', { type: msg.type(), text: msg.text() }));
  page.on('pageerror', (err) => addLog('pageerror', String(err)));

  try {
    // Navigate directly to reports (will redirect to auth if needed)
    addLog('info', `Navigating to ${reportsUrl}`);
    try {
      await page.goto(reportsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
      addLog('warn', `Initial goto failed: ${String(e)}`);
      // Retry once with a lighter waitUntil
      await page.goto(reportsUrl, { waitUntil: 'commit', timeout: 60000 }).catch(() => {});
    }

    if (!(new URL(page.url())).hostname.includes('preview--egypt-pos-tax-sync.lovable.app')) {
      addLog('info', `At ${page.url()} - attempting login`);
      const success = await attemptEmailPasswordLogin(page);
      addLog('info', `Login success: ${success}`);
    }

    // Ensure we land on /reports
    if (!(new URL(page.url())).pathname.includes('/reports')) {
      addLog('info', 'Navigating to /reports after login');
      await page.goto(reportsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    }

    // Wait for some content to render
    await page.waitForSelector('main, table, h1, [role="main"]', { timeout: 20000 }).catch(() => {});

    await saveArtifacts(page);
    console.log(JSON.stringify({
      ok: true,
      url: page.url(),
      screenshotPath,
      htmlPath,
      consoleLogPath
    }));
  } catch (err) {
    addLog('error', String(err?.stack || err));
    try { await saveArtifacts(page); } catch {}
    console.log(JSON.stringify({ ok: false, error: String(err), screenshotPath, htmlPath, consoleLogPath }));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
