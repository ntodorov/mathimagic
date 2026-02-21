const { test, expect } = require('@playwright/test');

const APP_URL = '/';

async function startPractice(page) {
  await page.getByRole('button', { name: /start practice/i }).click();
  await expect(page.getByRole('textbox', { name: /answer for question 1/i })).toBeVisible();
}

async function finishEarlyWithOneAnswer(page) {
  await startPractice(page);
  await page.getByRole('textbox', { name: /answer for question 1/i }).fill('1');
  await page.getByRole('button', { name: /end current session/i }).click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto(APP_URL);
});

test('open app and see welcome', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /hey,/i })).toBeVisible();
  await expect(page.getByText(/ready to become a math superstar today\?/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /start practice/i })).toBeVisible();
});

test('start practice and see first question input', async ({ page }) => {
  await startPractice(page);
  const firstInput = page.getByRole('textbox', { name: /answer for question 1/i });
  await expect(firstInput).toBeVisible();
  await expect(firstInput).toBeFocused();
});

test('end session and see session history entry', async ({ page }) => {
  await finishEarlyWithOneAnswer(page);
  await expect(page.getByRole('heading', { name: /past sessions/i })).toBeVisible();
  await expect(page.getByText(/addition session/i)).toBeVisible();
  await expect(page.getByText(/answered 1 of 10/i)).toBeVisible();
});

test('review answers opens read-only review mode', async ({ page }) => {
  await finishEarlyWithOneAnswer(page);
  await page.getByRole('button', { name: /review answers/i }).click();
  await expect(page.getByText(/review mode/i)).toBeVisible();
  await expect(page.getByText(/^read-only$/i)).toBeVisible();
  await expect(page.locator('input[type="text"]')).toHaveCount(0);
});
