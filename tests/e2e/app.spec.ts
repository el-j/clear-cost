import { expect, test } from '@playwright/test';

test('calculator updates the quote and supports copy flow', async ({ page }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:4173',
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: /3D-print quotes|3D-Druck-Angebote/i })).toBeVisible();
  await expect(page.getByTestId('hero-badge')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Cost overview|Kostenübersicht/i })).toBeVisible();

  await page.getByLabel(/Language|Sprache/i).selectOption('de');
  await expect(page.getByRole('heading', { name: /3D-Druck-Angebote|3D-print quotes/i })).toBeVisible();

  await page.getByRole('link', { name: /Über|About/i }).click();
  await expect(page.getByRole('heading', { name: /Über Clear Cost|About Clear Cost/i })).toBeVisible();
  await page.getByRole('link', { name: /Werkzeug|Tool/i }).click();
  await expect(page.getByRole('heading', { name: /3D-Druck-Angebote|3D-print quotes/i })).toBeVisible();

  await page.getByRole('link', { name: /^Projekte$|^Projects$/i }).first().click();
  await expect(page.getByRole('heading', { name: /Projektverwaltung|Project management/i })).toBeVisible();
  await page.getByLabel(/Projektname|Project name/i).fill('Workshop order');
  await page.getByLabel(/Kunde|Customer/i).fill('ACME GmbH');
  await page.getByLabel(/Projektnotiz|Project note/i).fill('Batch run for the fair');
  await page.getByRole('button', { name: /Aktuelles Projekt speichern|Save current project/i }).click();
  await expect(page.getByRole('heading', { name: /Workshop order/i })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: /Workshop order/i })).toBeVisible();
  await expect(page.getByLabel(/Projektname|Project name/i)).toHaveValue('Workshop order');

  await page.getByRole('link', { name: /Werkzeug|Tool/i }).first().click();
  await expect(page.getByRole('heading', { name: /3D-Druck-Angebote|3D-print quotes/i })).toBeVisible();

  await page.getByLabel(/Gewinnmarge|Profit margin/i).fill('50');
  await page.getByRole('button', { name: /Verschleiß berücksichtigen|Include wear cost/i }).click();
  await page.getByLabel(/Kaufpreis Drucker|Printer purchase price/i).fill('900');
  await page.getByLabel(/Erwartete Lebensdauer|Expected lifetime/i).fill('1000');

  await expect(page.getByTestId('result-panel')).toContainText(/Verschleiß|Wear/);

  await page.getByRole('button', { name: /Text für Kunde kopieren|Copy customer text/i }).click();
  await expect(page.getByRole('button', { name: /Kopiert!|Copied!/ })).toBeVisible();
});
