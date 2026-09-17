const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;

    this.usernameInput = page.getByRole('textbox', {
      name: /username/i,
    });

    this.passwordInput = page.getByRole('textbox', {
      name: /password/i,
    });

    this.loginButton = page.getByRole('button', {
      name: /login/i,
    });

    this.loginError = page.locator('.oxd-alert-content-text');
  }

  async goto() {
    await this.page.goto('/', {
      waitUntil: 'domcontentloaded',
    });

    await expect(this.usernameInput).toBeVisible();
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);

    await this.loginButton.click();

    await expect(this.page).toHaveURL(/\/dashboard\/index/, {
      timeout: 30000,
    });
  }

  async assertLoginFailed() {
    await expect(this.loginError).toBeVisible({
      timeout: 10000,
    });
  }
}

module.exports = { LoginPage };
