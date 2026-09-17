function uniqueEmployee() {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  return {
    firstName: `Nikhith${suffix.slice(-5)}`,
    middleName: 'Reddy',
    lastName: 'P',
    employeeId: `NK${suffix.slice(-7)}`,
    username: `qa_${suffix}`,
  };
}

function employeeFullName(employee) {
  return `${employee.firstName} ${employee.middleName} ${employee.lastName}`;
}

module.exports = {
  uniqueEmployee,
  employeeFullName,
};