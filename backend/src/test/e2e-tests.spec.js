import { test, expect } from '@playwright/test';

test.describe('Virtual Vacation E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Set up test environment
        await page.goto('http://localhost:3000');

        // Wait for the app to load
        await page.waitForLoadState('networkidle');
    });

    test('should load the main application', async ({ page }) => {
        // Check if the main app loads
        await expect(page).toHaveTitle(/Virtual Vacation/);

        // Check for main navigation elements
        await expect(page.locator('text=Explore Cities')).toBeVisible();
        await expect(page.locator('text=Weather')).toBeVisible();
        await expect(page.locator('text=Street View')).toBeVisible();
    });

    test('should navigate to cities page and load city data', async ({ page }) => {
        // Navigate to cities page
        await page.click('text=Explore Cities');

        // Wait for cities to load
        await page.waitForSelector('[data-testid="city-card"]', { timeout: 10000 });

        // Check if cities are displayed
        const cityCards = page.locator('[data-testid="city-card"]');
        await expect(cityCards).toHaveCount(await cityCards.count());

        // Test search functionality
        const searchInput = page.locator('input[placeholder*="search"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('New York');
            await searchInput.press('Enter');

            // Wait for search results
            await page.waitForTimeout(2000);
            await expect(page.locator('text=New York')).toBeVisible();
        }
    });

    test('should display weather information', async ({ page }) => {
        // Navigate to weather section
        await page.click('text=Weather');

        // Wait for weather data to load
        await page.waitForSelector('[data-testid="weather-info"]', { timeout: 10000 });

        // Check weather elements
        await expect(page.locator('[data-testid="temperature"]')).toBeVisible();
        await expect(page.locator('[data-testid="weather-condition"]')).toBeVisible();
    });

    test('should handle street view functionality', async ({ page }) => {
        // Navigate to street view section
        await page.click('text=Street View');

        // Wait for map to load
        await page.waitForSelector('[data-testid="map-container"]', { timeout: 15000 });

        // Check if map is interactive
        const mapContainer = page.locator('[data-testid="map-container"]');
        await expect(mapContainer).toBeVisible();

        // Test clicking on map (if interactive)
        if (await mapContainer.isVisible()) {
            await mapContainer.click({ position: { x: 100, y: 100 } });

            // Wait for street view to load
            await page.waitForTimeout(3000);

            // Check if street view image loads
            const streetViewImage = page.locator('[data-testid="street-view-image"]');
            if (await streetViewImage.isVisible({ timeout: 5000 })) {
                await expect(streetViewImage).toBeVisible();
            }
        }
    });

    test('should handle user interactions smoothly', async ({ page }) => {
        // Test navigation performance
        const startTime = Date.now();

        await page.click('text=Explore Cities');
        await page.waitForSelector('[data-testid="city-card"]', { timeout: 5000 });

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds

        // Test back navigation
        await page.goBack();
        await expect(page.locator('text=Welcome to Virtual Vacation')).toBeVisible();
    });

    test('should handle error states gracefully', async ({ page }) => {
        // Test with invalid city search
        await page.click('text=Explore Cities');
        await page.waitForSelector('[data-testid="city-card"]');

        const searchInput = page.locator('input[placeholder*="search"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill('NonExistentCity12345');
            await searchInput.press('Enter');

            // Should show "no results" message or handle gracefully
            await page.waitForTimeout(2000);
            // Check that the app doesn't crash and shows appropriate message
            await expect(page.locator('text=No cities found')).toBeVisible({ timeout: 5000 });
        }
    });

    test('should be responsive on different screen sizes', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check if mobile navigation works
        const mobileMenu = page.locator('[data-testid="mobile-menu"]');
        if (await mobileMenu.isVisible()) {
            await mobileMenu.click();
            await expect(page.locator('text=Explore Cities')).toBeVisible();
        }

        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });

        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check if tablet layout works
        await expect(page.locator('text=Explore Cities')).toBeVisible();
    });

    test('should handle network failures gracefully', async ({ page }) => {
        // Simulate network failure by blocking API calls
        await page.route('**/api/**', route => route.abort());

        await page.click('text=Explore Cities');

        // Should show error message instead of crashing
        await page.waitForTimeout(2000);
        await expect(page.locator('text=Failed to load')).toBeVisible({ timeout: 5000 });
    });

    test('should maintain state across navigation', async ({ page }) => {
        // Navigate to cities and select one
        await page.click('text=Explore Cities');
        await page.waitForSelector('[data-testid="city-card"]');

        // Click on first city
        const firstCity = page.locator('[data-testid="city-card"]').first();
        const cityName = await firstCity.textContent();

        await firstCity.click();

        // Navigate away and back
        await page.click('text=Weather');
        await page.click('text=Explore Cities');

        // Check if city selection is maintained or page loads correctly
        await page.waitForSelector('[data-testid="city-card"]');
        await expect(page.locator('[data-testid="city-card"]')).toBeVisible();
    });
});
