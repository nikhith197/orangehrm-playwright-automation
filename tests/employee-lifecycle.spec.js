const { test, expect } = require('./fixtures/test');
const { uniqueEmployee, employeeFullName } = require('./utils/testData');
const { createEmployee } = require('./utils/employeeActions');

test(
  'runs the complete employee lifecycle as a business-flow smoke test',
  { tag: ['@smoke'] },
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

    const originalName = employeeFullName(employee);

    const updated = {
      ...employee,
      lastName: `${employee.lastName}_Updated`,
    };

    const updatedName = employeeFullName(updated);

    // ---------------------------------------------------------
    // 1. CREATE EMPLOYEE
    // ---------------------------------------------------------

    await test.step('Create employee', async () => {
      await createEmployee({
        dashboardPage,
        pimPage,
        employeeDetailsPage,
        employee,
        cleanup: employeeCleanup,
      });
    });

    // ---------------------------------------------------------
    // 2. API VERIFICATION - EMPLOYEE CREATED
    // ---------------------------------------------------------

    let createdEmployee;

    await test.step('Verify employee exists through API', async () => {
      createdEmployee = await apiClient.assertEmployeeExists(originalName);
    });

    const employeeId = createdEmployee.employeeId;

    if (!employeeId) {
      throw new Error(`Could not determine employeeId for '${originalName}'.`);
    }

    // ---------------------------------------------------------
    // 3. OPEN EMPLOYEE LIST
    // ---------------------------------------------------------

    await test.step('Open Employee List', async () => {
      await dashboardPage.openPIM();
      await pimPage.openEmployeeList();
      await employeeListPage.assertLoaded();
    });

    // ---------------------------------------------------------
    // 4. SEARCH CREATED EMPLOYEE
    // ---------------------------------------------------------

    await test.step(`Search employee: ${originalName}`, async () => {
      await employeeListPage.searchByName(originalName);

      await employeeListPage.assertEmployeePresent(originalName);
    });

    // ---------------------------------------------------------
    // 5. OPEN EMPLOYEE
    // ---------------------------------------------------------

    await test.step(`Open employee: ${originalName}`, async () => {
      await employeeListPage.openEmployee(originalName);

      await employeeDetailsPage.assertLoaded();
    });

    // ---------------------------------------------------------
    // 6. UPDATE EMPLOYEE
    // ---------------------------------------------------------

    await test.step(`Update employee last name to: ${updated.lastName}`, async () => {
      await employeeDetailsPage.updateLastName(updated.lastName);
    });

    // ---------------------------------------------------------
    // 7. SAVE EMPLOYEE
    // ---------------------------------------------------------

    await test.step('Save employee changes', async () => {
      await employeeDetailsPage.save();
    });

    // ---------------------------------------------------------
    // 8. VERIFY UPDATED EMPLOYEE DETAILS IN UI
    // ---------------------------------------------------------

    await test.step('Verify updated employee details in UI', async () => {
      await employeeDetailsPage.assertEmployeeDetails(updated);
    });

    // ---------------------------------------------------------
    // 9. API VERIFICATION - SAME EMPLOYEE STILL EXISTS
    // ---------------------------------------------------------

    await test.step('Verify updated employee through API', async () => {
      const updatedEmployee = await apiClient.assertEmployeeExistsByEmployeeId(
        employeeId,
        employee.firstName
      );

      expect(updatedEmployee.firstName, 'API employee first name should remain unchanged').toBe(
        employee.firstName
      );
    });

    // ---------------------------------------------------------
    // 10. RETURN TO EMPLOYEE LIST
    // ---------------------------------------------------------

    await test.step('Return to Employee List', async () => {
      await employeeDetailsPage.clickEmployeeList();

      await employeeListPage.assertLoaded();
    });

    // ---------------------------------------------------------
    // 11. SEARCH UPDATED EMPLOYEE
    // ---------------------------------------------------------

    await test.step(`Search updated employee: ${updatedName}`, async () => {
      await employeeListPage.searchByName(updatedName);

      await employeeListPage.assertEmployeePresent(updatedName);
    });

    // ---------------------------------------------------------
    // 12. DELETE EMPLOYEE
    // ---------------------------------------------------------

    await test.step(`Delete employee: ${updatedName}`, async () => {
      await employeeListPage.deleteEmployee(updatedName);
    });

    // ---------------------------------------------------------
    // 13. VERIFY EMPLOYEE DELETED FROM UI
    // ---------------------------------------------------------

    await test.step('Verify employee is deleted from UI', async () => {
      await employeeListPage.assertEmployeeAbsent(updatedName);
    });

    // ---------------------------------------------------------
    // 14. API VERIFICATION - EMPLOYEE DELETED
    // ---------------------------------------------------------

    await test.step('Verify employee is deleted through API', async () => {
      await apiClient.assertEmployeeAbsentByEmployeeId(employeeId, employee.firstName);
    });
  }
);
