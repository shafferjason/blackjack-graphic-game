/**
 * Pilot Screenshot Script
 * Takes before/after screenshots of Neon Nights skin via canvas preview page
 * Usage: node scripts/pilot-screenshots.mjs [before|after]
 */
import { chromium } from 'playwright';
import path from 'path';

const phase = process.argv[2] || 'before';
const outDir = path.resolve('preview/theme-style-pilot');

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  // Dismiss tutorial and set skin
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('blackjack-tutorial-seen', 'true');
    const state = JSON.parse(localStorage.getItem('blackjack-card-skin') || '{}');
    state.activeSkinId = 'neon-nights';
    if (!state.unlockedSkins) state.unlockedSkins = [];
    if (!state.unlockedSkins.includes('neon-nights')) state.unlockedSkins.push('neon-nights');
    localStorage.setItem('blackjack-card-skin', JSON.stringify(state));
  });

  // Go to canvas art preview page
  await page.goto('http://localhost:5173/?preview=canvas', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Select neon-nights skin if not already selected
  const skinBtns = await page.$$('.cap-skin-btn, button');
  for (const btn of skinBtns) {
    const text = await btn.textContent();
    if (text && text.toLowerCase().includes('neon')) {
      await btn.click();
      await page.waitForTimeout(1000);
      break;
    }
  }

  // Try medium and large views
  const sizeBtns = await page.$$('button');
  for (const btn of sizeBtns) {
    const text = await btn.textContent();
    if (text && text.includes('Large')) {
      await btn.click();
      await page.waitForTimeout(500);
      break;
    }
  }

  // Take full preview screenshot
  await page.screenshot({
    path: path.join(outDir, `${phase}-neon-nights-preview.png`),
    fullPage: true,
  });

  // Also try to capture individual cards from the preview grid
  const cardSlots = await page.$$('.cap-card-slot, .card');
  for (let i = 0; i < Math.min(cardSlots.length, 8); i++) {
    try {
      await cardSlots[i].screenshot({
        path: path.join(outDir, `${phase}-neon-nights-card-${i}.png`),
      });
    } catch(e) {}
  }

  // Now also grab a gameplay screenshot with dealt cards
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Place bet and deal
  try {
    // Click the $10 chip
    const chips = await page.$$('.chip');
    if (chips.length > 0) {
      await chips[0].click({ timeout: 2000 });
      await page.waitForTimeout(300);
    }
    // Click deal
    const allBtns = await page.$$('button');
    for (const btn of allBtns) {
      const text = await btn.textContent();
      if (text && (text.includes('Deal') || text.includes('DEAL'))) {
        await btn.click({ timeout: 2000 });
        await page.waitForTimeout(2000);
        break;
      }
    }
    await page.screenshot({
      path: path.join(outDir, `${phase}-neon-nights-gameplay.png`),
    });
  } catch (e) {
    console.log('Gameplay screenshot note:', e.message);
  }

  console.log(`✅ ${phase} screenshots saved to ${outDir}`);
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
