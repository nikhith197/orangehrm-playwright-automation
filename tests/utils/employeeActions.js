const { employeeFullName } = require('./testData');
const { Logger } = require('./logger');

async function createEmployee({ dashboardPage, pimPage, employeeDetailsPage, employee, cleanup }) {
  Logger.info(`Creating employee '${employeeFullName(employee)}'`);
  await dashboardPage.openPIM();
  await pimPage.openAddEmployee();
  await employeeDetailsPage.fillEmployee(employee);
  await employeeDetailsPage.save();
  cleanup.track({ ...employee, fullName: employeeFullName(employee) });
}

module.exports = { createEmployee };
