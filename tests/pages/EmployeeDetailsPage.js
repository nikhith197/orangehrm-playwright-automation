const { expect } = require('@playwright/test');

class EmployeeDetailsPage {
  constructor(page) {
    this.page = page;

    
    // Personal Details fields
    

    this.firstName = page.locator(
      'input[name="firstName"]'
    );

    this.middleName = page.locator(
      'input[name="middleName"]'
    );

    this.lastName = page.locator(
      'input[name="lastName"]'
    );

    
    // Personal Details form
    

    this.personalDetailsForm = page
      .locator('form')
      .filter({
        has: page.locator('input[name="firstName"]'),
      });

    // Save button belonging specifically to
    // the Personal Details form.
    this.saveButton = this.personalDetailsForm.getByRole(
      'button',
      {
        name: 'Save',
        exact: true,
      }
    );

   

    this.employeeListLink = page.getByRole('link', {
      name: 'Employee List',
    });
  }

  

  async assertLoaded() {
    await expect(this.firstName).toBeVisible({
      timeout: 15000,
    });

    await expect(this.lastName).toBeVisible({
      timeout: 15000,
    });
  }

  
  // Create employee
  

  async fillEmployee(data) {
    await this.assertLoaded();

    await this.firstName.fill(data.firstName);

    await this.middleName.fill(data.middleName);

    await this.lastName.fill(data.lastName);
  }

 
  // Update last name
  

  async updateLastName(lastName) {
    await this.assertLoaded();

    await expect(this.lastName).toBeVisible({
      timeout: 10000,
    });

    await expect(this.lastName).toBeEditable({
      timeout: 10000,
    });

    
    await this.lastName.click();

    
    await this.lastName.press('Control+A');

    
    await this.lastName.pressSequentially(lastName);

   
    await this.lastName.press('Tab');

    
    await expect(
      this.lastName,
      'Last name should contain the updated value before saving'
    ).toHaveValue(lastName, {
      timeout: 5000,
    });
  }

  
  async save() {
   
    await expect(this.personalDetailsForm).toBeVisible({
      timeout: 10000,
    });

    await expect(this.saveButton).toBeVisible({
      timeout: 10000,
    });

    await expect(this.saveButton).toBeEnabled({
      timeout: 10000,
    });

    
    await this.saveButton.click();

    
    await this.page.waitForLoadState('networkidle');

    await this.page.waitForTimeout(1000);

    /*
     * Confirm the Personal Details form is still available.
     */
    await expect(this.firstName).toBeVisible({
      timeout: 15000,
    });
  }

  
  async assertEmployeeDetails(data) {
    await expect(this.firstName).toHaveValue(
      data.firstName
    );

    await expect(this.middleName).toHaveValue(
      data.middleName
    );

    await expect(this.lastName).toHaveValue(
      data.lastName
    );
  }

  
  async clickEmployeeList() {
    await expect(this.employeeListLink).toBeVisible({
      timeout: 10000,
    });

    await this.employeeListLink.click();

    await expect(this.page).toHaveURL(
      /\/pim\/viewEmployeeList/,
      {
        timeout: 15000,
      }
    );
  }
}

module.exports = {
  EmployeeDetailsPage,
};