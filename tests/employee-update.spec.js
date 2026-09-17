const { test, expect } = require('./fixtures/test');

const {
  uniqueEmployee,
  employeeFullName
} = require('./utils/testData');

const username = process.env.APP_USERNAME || 'Admin';
const password = process.env.APP_PASSWORD || 'admin123';

test(
  '@regression updates an employee and verifies the persisted value through API',
  async ({
    loginPage,
    dashboardPage,
    pimPage,
    employeeDetailsPage,
    employeeListPage,
    apiClient,
    employeeCleanup
  }) => {
    const employee = uniqueEmployee();

    const originalName = employeeFullName(employee);

    const updatedEmployee = {
      ...employee,
      lastName: 'PUpdated'
    };

    const updatedName = employeeFullName(updatedEmployee);

    // Register the original employee for cleanup.
    // Cleanup can locate the employee by the original name.
    employeeCleanup.track({
      ...employee,
      fullName: originalName
    });

    await test.step('Login as Admin', async () => {
      await loginPage.goto();

      await loginPage.login(username, password);

      await dashboardPage.assertLoaded();
    });

    await test.step('Create employee', async () => {
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

    await test.step(`Search employee: ${originalName}`, async () => {
      await employeeListPage.searchByName(originalName);

      await employeeListPage.assertEmployeePresent(employee);
    });

    await test.step('Open employee for editing', async () => {
      await employeeListPage.openEmployee(employee);

      await employeeDetailsPage.assertLoaded();
    });

    await test.step('Update employee last name', async () => {
      await employeeDetailsPage.updateLastName(
        updatedEmployee.lastName
      );

      await expect(employeeDetailsPage.lastName).toHaveValue(
        updatedEmployee.lastName
      );

      await employeeDetailsPage.save();
    });

    await test.step('Verify updated employee through API', async () => {
      const apiEmployee =
        await apiClient.assertEmployeeExists(updatedName);

      expect(apiEmployee.lastName).toBe(
        updatedEmployee.lastName
      );
    });

    await test.step('Navigate back to Employee List', async () => {
      await dashboardPage.openPIM();

      await pimPage.openEmployeeList();

      await employeeListPage.assertLoaded();
    });

    await test.step(`Search updated employee: ${updatedName}`, async () => {
      await employeeListPage.searchByName(updatedName);

      await employeeListPage.assertEmployeePresent(
        updatedEmployee
      );
    });
  }
);