const { expect } = require('@playwright/test');

class BasePage {
  constructor(page) {
    this.page = page;
  }

  async clickAndWaitForURL(locator, urlPattern) {
    await expect(locator).toBeVisible({
      timeout: 15000,
    });

    await locator.click();

    await expect(this.page).toHaveURL(urlPattern, {
      timeout: 15000,
    });
  }
}

module.exports = {
  BasePage,
};