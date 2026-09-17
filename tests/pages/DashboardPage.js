const { expect } = require('@playwright/test');

class DashboardPage {
  constructor(page) {
    this.page = page;

    this.dashboardHeading = page
      .locator('.oxd-topbar-header-breadcrumb-module')
      .filter({ hasText: 'Dashboard' });

    this.pimMenu = page.getByRole('link', {
      name: 'PIM'
    });

    this.adminMenu = page.getByRole('link', {
      name: 'Admin'
    });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard\//);

    await expect(this.dashboardHeading).toBeVisible({
      timeout: 15000
    });
  }

  async openPIM() {
    await this.pimMenu.click();

    await expect(this.page).toHaveURL(/\/pim\//, {
      timeout: 15000
    });
  }

  async openAdmin() {
    await this.adminMenu.click();

    await expect(this.page).toHaveURL(/\/admin\//, {
      timeout: 15000
    });
  }

  async assertAdminRoleAccess() {
    await expect(this.adminMenu).toBeVisible({
      timeout: 10000
    });

    await expect(this.pimMenu).toBeVisible({
      timeout: 10000
    });
  }
}

module.exports = { DashboardPage };