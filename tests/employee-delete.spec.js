const { test } = require('./fixtures/test');
const { uniqueEmployee, employeeFullName } = require('./utils/testData');
const { createEmployee } = require('./utils/employeeActions');

test(
  'deletes an employee and verifies absence in UI and API',
  { tag: ['@regression'] },
  async ({
    adminSession,
    dashboardPage,
    pimPage,
    employeeDetailsPage,
    employeeListPage,
    apiClient,
    employeeCleanup,
  }) => {
    const employee = uniqueEmployee();
    const fullName = employeeFullName(employee);

    await createEmployee({
      dashboardPage,
      pimPage,
      employeeDetailsPage,
      employee,
      cleanup: employeeCleanup,
    });

    await dashboardPage.openPIM();
    await pimPage.openEmployeeList();
    await employeeListPage.searchByName(fullName);
    await employeeListPage.assertEmployeePresent(fullName);
    await employeeListPage.deleteEmployee(fullName);
    await employeeListPage.assertEmployeeAbsent(fullName);
    await apiClient.assertEmployeeAbsent(fullName);
  }
);
