const { expect } = require('@playwright/test');
const { apiTimeout } = require('../../config');
const { Logger } = require('./logger');

class OrangeHRMApiClient {
  constructor(request) {
    this.request = request;
  }

  async findEmployees(searchTerm) {
    const response = await this.request.get('/web/index.php/api/v2/pim/employees', {
      params: {
        limit: 50,
        offset: 0,
        nameOrId: searchTerm,
      },
      timeout: apiTimeout,
    });

    expect(
      response.ok(),
      `Employee API search should succeed. Status: ${response.status()}`
    ).toBeTruthy();

    const body = await response.json();

    return body?.data || [];
  }

  async findEmployeeByName(fullName) {
    const normalizedName = fullName.replace(/\s+/g, ' ').trim().toLowerCase();

    const nameParts = normalizedName.split(/\s+/);

    const firstName = nameParts[0];

    const rows = await this.findEmployees(firstName);

    Logger.info(`API search '${firstName}' returned ${rows.length} employee(s)`);

    for (const employee of rows) {
      Logger.info(`API employee result: ${this.getFullName(employee)}`, {
        empNumber: employee.empNumber,
        employeeId: employee.employeeId,
      });
    }

    const exactMatch = rows.find((employee) => {
      const employeeName = this.getFullName(employee).replace(/\s+/g, ' ').trim().toLowerCase();

      return employeeName === normalizedName;
    });

    if (exactMatch) {
      return exactMatch;
    }

    const lastName = nameParts[nameParts.length - 1];

    return rows.find((employee) => {
      const employeeFirstName = String(employee.firstName || '')
        .trim()
        .toLowerCase();

      const employeeLastName = String(employee.lastName || '')
        .trim()
        .toLowerCase();

      return employeeFirstName === firstName && employeeLastName === lastName;
    });
  }

  async findEmployeeByEmployeeId(employeeId, searchTerm) {
    if (!searchTerm) {
      throw new Error(`A searchTerm is required to find employeeId '${employeeId}'.`);
    }

    const rows = await this.findEmployees(searchTerm);

    return rows.find((employee) => String(employee.employeeId) === String(employeeId));
  }

  async assertEmployeeExists(fullName) {
    let employee;

    for (let attempt = 1; attempt <= 5; attempt++) {
      employee = await this.findEmployeeByName(fullName);

      if (employee) {
        Logger.info(`API verified employee exists: ${fullName}`);

        return employee;
      }

      if (attempt < 5) {
        Logger.info(`Employee '${fullName}' not yet visible through API. Retry ${attempt}/4`);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    expect(employee, `Employee '${fullName}' should exist in the API`).toBeTruthy();

    return employee;
  }

  async assertEmployeeExistsByEmployeeId(employeeId, searchTerm) {
    let employee;

    for (let attempt = 1; attempt <= 5; attempt++) {
      employee = await this.findEmployeeByEmployeeId(employeeId, searchTerm);

      if (employee) {
        Logger.info(`API verified employee with employeeId ${employeeId}`);

        return employee;
      }

      if (attempt < 5) {
        Logger.info(`Employee ID '${employeeId}' not yet visible through API. Retry ${attempt}/4`);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    expect(
      employee,
      `Employee with employeeId '${employeeId}' should exist in the API`
    ).toBeTruthy();

    return employee;
  }

  async assertEmployeeAbsent(fullName) {
    let employee;

    for (let attempt = 1; attempt <= 5; attempt++) {
      employee = await this.findEmployeeByName(fullName);

      if (!employee) {
        Logger.info(`API verified employee is absent: ${fullName}`);

        return;
      }

      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    expect(employee, `Employee '${fullName}' should not exist in the API`).toBeFalsy();
  }

  async assertEmployeeAbsentByEmployeeId(employeeId, searchTerm) {
    let employee;

    for (let attempt = 1; attempt <= 5; attempt++) {
      employee = await this.findEmployeeByEmployeeId(employeeId, searchTerm);

      if (!employee) {
        Logger.info(`API verified employee with employeeId ${employeeId} is absent`);

        return;
      }

      Logger.info(`Employee ID '${employeeId}' is still present. Retry ${attempt}/4`);

      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    expect(
      employee,
      `Employee with employeeId '${employeeId}' should not exist in the API`
    ).toBeFalsy();
  }

  async deleteEmployeeById(employeeId) {
    if (!employeeId) {
      Logger.warn('No employee ID supplied. API cleanup skipped.');

      return false;
    }

    const response = await this.request.delete(
      `/web/index.php/api/v2/pim/employees/${employeeId}`,
      {
        timeout: apiTimeout,
      }
    );

    if (response.status() === 405) {
      Logger.warn(`API cleanup endpoint returned 405 for employee ${employeeId}.`);

      return false;
    }

    expect(
      [200, 204, 404],
      `API cleanup should return 200, 204 or 404. Actual status: ${response.status()}`
    ).toContain(response.status());

    Logger.info(`API cleanup requested for employee id ${employeeId}`, {
      status: response.status(),
    });

    return true;
  }

  async deleteEmployeeByName(fullName) {
    const employee = await this.findEmployeeByName(fullName);

    if (!employee) {
      Logger.info(`Employee '${fullName}' already absent. API cleanup not required.`);

      return false;
    }

    return this.deleteEmployeeById(employee.empNumber || employee.id);
  }

  getFullName(employee) {
    return [employee.firstName, employee.middleName, employee.lastName]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = {
  OrangeHRMApiClient,
};
