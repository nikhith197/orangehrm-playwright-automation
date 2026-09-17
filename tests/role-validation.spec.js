const { test } = require('./fixtures/test');
const { credentials, essCredentials } = require('../config');
const { Logger } = require('./utils/logger');

test.describe('Role-based access validation', () => {
  test(
    'validates administrator access to Admin and PIM modules',
    { tag: ['@smoke'] },
    async ({ loginPage, dashboardPage }) => {
      await loginPage.goto();
      await loginPage.login(credentials.username, credentials.password);
      await dashboardPage.assertLoaded();
      await dashboardPage.assertAdminRoleAccess();
    }
  );

  test(
    'validates restricted access for an ESS/non-admin user',
    { tag: ['@regression'] },
    async ({ loginPage, dashboardPage }) => {
      test.skip(
        !essCredentials.username || !essCredentials.password,
        'ESS_USERNAME and ESS_PASSWORD are required for the negative role test.'
      );

      Logger.info(`Authenticating restricted user '${essCredentials.username}'`);
      await loginPage.goto();
      await loginPage.login(essCredentials.username, essCredentials.password);
      await dashboardPage.assertLoaded();
      await dashboardPage.assertRestrictedRoleAccess();
    }
  );
});
