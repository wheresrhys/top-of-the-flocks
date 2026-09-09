import { test, expect } from '@playwright/test'

test('shows species name as heading', { tag: '@all' }, async ({ page }) => {
	await page.goto('/species/Robin')
	await expect(page.getByRole('heading', { name: 'Robin' })).toBeVisible()
})

test('alpha: shows bird list tab with birds', { tag: '@alpha' }, async ({ page }) => {
	await page.goto('/species/Robin')
	// Bird list is now the last tab and lazily mounted, so click it first
	await page.getByRole('button', { name: 'Bird list' }).click()
	await expect(page.getByTestId('infinite-scroll-loader')).toBeVisible()
})

test('alpha: loads more birds on scroll past loader', { tag: '@alpha' }, async ({ page }) => {
	await page.goto('/species/Robin')
	await page.getByRole('button', { name: 'Bird list' }).click()
	const loader = page.getByTestId('infinite-scroll-loader')
	await expect(loader).toBeVisible()
	await loader.scrollIntoViewIfNeeded()
	await expect(loader).not.toBeVisible({ timeout: 5000 })
})

test('beta: shows Robin with limited data', { tag: '@beta' }, async ({ page }) => {
	await page.goto('/species/Robin')
	await page.getByRole('button', { name: 'Bird list' }).click()
	await expect(page.getByTestId('infinite-scroll-loader')).not.toBeVisible()
})

test('gamma: shows not authorised message', { tag: '@gamma' }, async ({ page }) => {
	await page.goto('/species/Robin')
	await expect(
		page.getByText('Not authorised to view any encounter data for this species')
	).toBeVisible()
})
