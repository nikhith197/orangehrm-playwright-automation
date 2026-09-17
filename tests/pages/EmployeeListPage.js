const { expect } = require('@playwright/test');

class EmployeeListPage {
  constructor(page) {
    this.page = page;

    // Employee name search field
    this.employeeNameInput = page
      .getByRole('textbox', { name: 'Type for hints...' })
      .first();

    // Search and Reset buttons
    this.searchButton = page.getByRole('button', {
      name: 'Search',
      exact: true,
    });

    this.resetButton = page.getByRole('button', {
      name: 'Reset',
      exact: true,
    });

    // Employee table
    this.employeeTable = page.locator('.oxd-table');

    this.employeeRows = page.locator(
      '.oxd-table-body .oxd-table-row'
    );

    // Delete confirmation dialog
    this.deleteConfirmationDialog = page.getByRole('dialog');

    this.deleteConfirmationButton =
      this.deleteConfirmationDialog.getByRole('button', {
        name: /Yes,\s*Delete/i,
      });
  }

  async assertLoaded() {
    await expect(this.page).toHaveURL(
      /\/pim\/viewEmployeeList/,
      {
        timeout: 15000,
      }
    );

    await expect(this.employeeTable).toBeVisible({
      timeout: 15000,
    });
  }

  /**
   * Returns the employee row using first name + last name.
   *
   * We intentionally avoid matching the complete formatted name
   * because OrangeHRM can render spaces/values differently in the
   * employee table.
   */
  getEmployeeRow(employeeOrFullName) {
    if (typeof employeeOrFullName === 'string') {
      const fullName = employeeOrFullName.trim();

      const nameParts = fullName.split(/\s+/);

      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];

      return this.employeeRows
        .filter({
          hasText: firstName,
        })
        .filter({
          hasText: lastName,
        })
        .first();
    }

    return this.employeeRows
      .filter({
        hasText: employeeOrFullName.firstName,
      })
      .filter({
        hasText: employeeOrFullName.lastName,
      })
      .first();
  }

  async searchByName(fullName) {
    await expect(this.employeeNameInput).toBeVisible({
      timeout: 15000,
    });

    await this.employeeNameInput.fill(fullName);

    /*
     * OrangeHRM uses an autocomplete field.
     * Newly created/updated employees may not always appear
     * immediately in the suggestions.
     *
     * We therefore allow the application a short period to
     * process the entered value before executing Search.
     */
    await this.page.waitForTimeout(1000);

    await expect(this.searchButton).toBeEnabled({
      timeout: 10000,
    });

    await this.searchButton.click();

    await this.page.waitForLoadState('networkidle');

    await expect(this.employeeTable).toBeVisible({
      timeout: 15000,
    });
  }

  async assertEmployeePresent(employeeOrFullName) {
    const fullName =
      typeof employeeOrFullName === 'string'
        ? employeeOrFullName
        : `${employeeOrFullName.firstName} ${employeeOrFullName.middleName} ${employeeOrFullName.lastName}`;

    await expect(this.employeeTable).toBeVisible({
      timeout: 15000,
    });

    const row = this.getEmployeeRow(employeeOrFullName);

    await expect(
      row,
      `Employee '${fullName}' should be visible in the employee list`
    ).toBeVisible({
      timeout: 15000,
    });
  }

  async assertEmployeeAbsent(employeeOrFullName) {
    const fullName =
      typeof employeeOrFullName === 'string'
        ? employeeOrFullName
        : `${employeeOrFullName.firstName} ${employeeOrFullName.middleName} ${employeeOrFullName.lastName}`;

    const row = this.getEmployeeRow(employeeOrFullName);

    await expect(
      row,
      `Employee '${fullName}' should not exist in the employee list`
    ).toHaveCount(0, {
      timeout: 10000,
    });
  }

  async openEmployee(employeeOrFullName) {
    const row = this.getEmployeeRow(employeeOrFullName);

    await expect(row).toBeVisible({
      timeout: 15000,
    });

    /*
     * OrangeHRM employee rows contain two action buttons:
     *   0 -> Edit
     *   1 -> Delete
     */
    const editButton = row
      .locator(
        '.oxd-icon-button.oxd-table-cell-action-space'
      )
      .first();

    await expect(editButton).toBeVisible({
      timeout: 10000,
    });

    await editButton.click();

    await expect(this.page).toHaveURL(
      /\/pim\/viewPersonalDetails/,
      {
        timeout: 15000,
      }
    );
  }

  async deleteEmployee(employeeOrFullName) {
    const row = this.getEmployeeRow(employeeOrFullName);

    await expect(row).toBeVisible({
      timeout: 15000,
    });

    const actionButtons = row.locator(
      '.oxd-icon-button.oxd-table-cell-action-space'
    );

    const buttonCount = await actionButtons.count();

    if (buttonCount < 2) {
      throw new Error(
        `Expected at least 2 action buttons, but found ${buttonCount}.`
      );
    }

    // Second action button is Delete
    const deleteButton = actionButtons.nth(1);

    await expect(deleteButton).toBeVisible({
      timeout: 10000,
    });

    await deleteButton.click();

    // Verify confirmation dialog
    await expect(this.deleteConfirmationDialog).toBeVisible({
      timeout: 10000,
    });

    await expect(this.deleteConfirmationButton).toBeVisible({
      timeout: 10000,
    });

    await this.deleteConfirmationButton.click();

    // Wait until confirmation dialog disappears
    await expect(this.deleteConfirmationDialog).toBeHidden({
      timeout: 10000,
    });

    // Verify employee row is removed
    await expect(row).toHaveCount(0, {
      timeout: 15000,
    });
  }
}

module.exports = {
  EmployeeListPage,
};