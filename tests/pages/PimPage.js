const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class PimPage extends BasePage {
  constructor(page) {
    super(page);

    this.addEmployeeLink = page.getByRole('link', {
      name: 'Add Employee',
    });

    this.employeeListLink = page.getByRole('link', {
      name: 'Employee List',
    });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(/\/pim\//);
  }

  async openAddEmployee() {
    await this.clickAndWaitForURL(this.addEmployeeLink, /\/pim\/addEmployee/, 'Add Employee');
  }

  async openEmployeeList() {
    await this.clickAndWaitForURL(
      this.employeeListLink,
      /\/pim\/viewEmployeeList/,
      'Employee List'
    );
  }
}

module.exports = { PimPage };
