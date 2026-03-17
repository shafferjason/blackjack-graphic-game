/**
 * Quick screenshot of hearts suit for Neon Nights pilot comparison
 */
import { chromium } from 'playwright';
import path from 'path';

const phase = process.argv[2] || 'after';
const outDir = path.resolve('preview/theme-style-pilot');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('blackjack-tutorial-seen', 'true');
    const state = JSON.parse(localStorage.getItem('blackjack-card-skin') || '{}');
    state.activeSkinId = 'neon-nights';
    if (!state.unlockedSkins) state.unlockedSkins = [];
    if (!state.unlockedSkins.includes('neon-nights')) state.unlockedSkins.push('neon-nights');
    localStorage.setItem('blackjack-card-skin', JSON.stringify(state));
  });

  // Open canvas preview with hearts selected
  await page.goto('http://localhost:5173/?preview=canvas', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Select neon-nights
  const skinBtns = await page.$$('button');
  for (const btn of skinBtns) {
    const text = await btn.textContent();
    if (text && text.toLowerCase().includes('neon')) {
      await btn.click();
      await page.waitForTimeout(500);
      break;
    }
  }

  // Select hearts suit
  for (const btn of await page.$$('button')) {
    const text = await btn.textContent();
    if (text && text.includes('hearts')) {
      await btn.click();
      await page.waitForTimeout(500);
      break;
    }
  }

  // Select Large size
  for (const btn of await page.$$('button')) {
    const text = await btn.textContent();
    if (text && text.includes('Large')) {
      await btn.click();
      await page.waitForTimeout(500);
      break;
    }
  }

  await page.screenshot({
    path: path.join(outDir, `${phase}-neon-nights-hearts.png`),
    fullPage: true,
  });

  // Also capture Full Canvas size
  for (const btn of await page.$$('button')) {
    const text = await btn.textContent();
    if (text && text.includes('Full Canvas')) {
      await btn.click();
      await page.waitForTimeout(500);
      break;
    }
  }

  await page.screenshot({
    path: path.join(outDir, `${phase}-neon-nights-hearts-full.png`),
    fullPage: true,
  });

  console.log(`✅ Hearts screenshots saved`);
  await browser.close();
}

main().catch(err => { console.error(err); process.exit(1); });
