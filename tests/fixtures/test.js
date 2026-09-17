const base = require('@playwright/test');

const { LoginPage } = require('../pages/LoginPage');
const { DashboardPage } = require('../pages/DashboardPage');
const { PimPage } = require('../pages/PimPage');
const { EmployeeDetailsPage } = require('../pages/EmployeeDetailsPage');
const { EmployeeListPage } = require('../pages/EmployeeListPage');
const { OrangeHRMApiClient } = require('../utils/apiClient');
const { credentials } = require('../../config');
const { Logger } = require('../utils/logger');

const test = base.test.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  pimPage: async ({ page }, use) => {
    await use(new PimPage(page));
  },

  employeeDetailsPage: async ({ page }, use) => {
    await use(new EmployeeDetailsPage(page));
  },

  employeeListPage: async ({ page }, use) => {
    await use(new EmployeeListPage(page));
  },

  apiClient: async ({ context }, use) => {
    await use(new OrangeHRMApiClient(context.request));
  },

  adminSession: async ({ loginPage, dashboardPage }, use) => {
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);
    await dashboardPage.assertLoaded();

    await use();
  },

  employeeCleanup: async ({ apiClient }, use) => {
    const employees = [];

    await use({
      track: (employee) => {
        employees.push(employee);
      },
    });

    for (const employee of employees.reverse()) {
      try {
        Logger.info(
          `Starting cleanup for employee '${employee.fullName}'`
        );

        const apiEmployee = await apiClient.findEmployeeByName(
          employee.fullName
        );

        if (!apiEmployee) {
          Logger.info(
            `Employee '${employee.fullName}' is already absent`
          );
          continue;
        }

        const employeeId =
          apiEmployee.empNumber || apiEmployee.id;

        if (!employeeId) {
          Logger.warn(
            `Could not determine employee ID for '${employee.fullName}'. Cleanup skipped.`
          );
          continue;
        }

        await apiClient.deleteEmployeeById(employeeId);

        await apiClient.assertEmployeeAbsent(
          employee.fullName
        );

        Logger.info(
          `API cleanup completed for '${employee.fullName}'`
        );
      } catch (error) {
        Logger.error(
          `Cleanup failed for employee '${employee.fullName}'`,
          {
            error: error.message,
          }
        );
      }
    }
  },
});

module.exports = {
  test,
  expect: base.expect,
};