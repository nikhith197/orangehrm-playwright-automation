const { test } = require('./fixtures/test');
const { uniqueEmployee, employeeFullName } = require('./utils/testData');

const username = process.env.APP_USERNAME || 'Admin';
const password = process.env.APP_PASSWORD || 'admin123';

test('@smoke @regression creates an employee and verifies it in UI and API', async ({
  loginPage,
  dashboardPage,
  pimPage,
  employeeDetailsPage,
  employeeListPage,
  apiClient,
}) => {
  const employee = uniqueEmployee();
  const fullName = employeeFullName(employee);

  try {
    await test.step('Login as Admin', async () => {
      await loginPage.goto();
      await loginPage.login(username, password);
      await dashboardPage.assertLoaded();
    });

    await test.step('Open PIM and create employee', async () => {
      await dashboardPage.openPIM();
      await pimPage.openAddEmployee();

      await employeeDetailsPage.fillEmployee(employee);
      await employeeDetailsPage.save();
    });

    await test.step('Open Employee List', async () => {
      await dashboardPage.openPIM();
      await pimPage.openEmployeeList();
      await employeeListPage.assertLoaded();
    });

    await test.step(`Search employee: ${fullName}`, async () => {
      await employeeListPage.searchByName(fullName);
      await employeeListPage.assertEmployeePresent(fullName);
    });

    await test.step('Verify employee through API', async () => {
      await apiClient.assertEmployeeExists(fullName);
    });
  } finally {
    // Cleanup will be handled separately after the main test flow is stable.
  }
});