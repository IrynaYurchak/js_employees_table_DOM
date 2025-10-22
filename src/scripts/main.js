'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const table = document.querySelector('table');

  if (!table) {
    return;
  }

  // Sort & Active Row
  const sortDirections = {};

  table.querySelectorAll('th').forEach((th) => {
    th.addEventListener('click', (e) => {
      const index = e.currentTarget.cellIndex;
      const tbody = table.querySelector('tbody');

      if (!tbody) {
        return;
      }

      const rows = Array.from(tbody.rows);
      const direction = sortDirections[index] === 'asc' ? 'desc' : 'asc';

      sortDirections[index] = direction;

      rows.sort((a, b) => {
        const valA = a.cells[index].textContent.trim();
        const valB = b.cells[index].textContent.trim();
        const numA = parseFloat(valA.replace(/[^\d.-]/g, ''));
        const numB = parseFloat(valB.replace(/[^\d.-]/g, ''));

        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }

        return valA.localeCompare(valB);
      });

      if (direction === 'desc') {
        rows.reverse();
      }
      tbody.append(...rows);
    });
  });

  table.addEventListener('click', (e) => {
    const row = e.target.closest('tbody tr');

    if (!row) {
      return;
    }

    table
      .querySelectorAll('tbody tr')
      .forEach((r) => r.classList.remove('active'));
    row.classList.add('active');
  });

  // Notification helper
  function showNotification(type, title, description) {
    document.querySelectorAll('.notification').forEach((n) => n.remove());

    const notif = document.createElement('div');

    notif.classList.add('notification', type);
    notif.setAttribute('data-qa', 'notification');

    notif.innerHTML = `
      <span class="title">${title}</span>
      <p>${description}</p>
    `;

    document.body.append(notif);

    setTimeout(() => notif.remove(), 3000);
  }

  // Form
  function createForm() {
    const body = document.querySelector('body');
    const newForm = document.createElement('form');

    newForm.classList.add('new-employee-form');

    // Name
    const labelName = document.createElement('label');

    labelName.textContent = 'Name: ';

    const inputName = document.createElement('input');

    inputName.type = 'text';
    inputName.name = 'name';
    inputName.required = true;
    inputName.setAttribute('data-qa', 'name');
    labelName.append(inputName);

    // Position
    const labelPosition = document.createElement('label');

    labelPosition.textContent = 'Position: ';

    const inputPosition = document.createElement('input');

    inputPosition.type = 'text';
    inputPosition.name = 'position';
    inputPosition.required = true;
    inputPosition.setAttribute('data-qa', 'position');
    labelPosition.append(inputPosition);

    // Office
    const labelOffice = document.createElement('label');

    labelOffice.textContent = 'Office: ';

    const selectOffice = document.createElement('select');

    selectOffice.name = 'office';
    selectOffice.required = true;
    selectOffice.setAttribute('data-qa', 'office');

    [
      'Tokyo',
      'Singapore',
      'London',
      'New York',
      'Edinburgh',
      'San Francisco',
    ].forEach((city) => {
      const option = document.createElement('option');

      option.value = city;
      option.textContent = city;
      selectOffice.append(option);
    });
    labelOffice.append(selectOffice);

    // Age
    const labelAge = document.createElement('label');

    labelAge.textContent = 'Age: ';

    const inputAge = document.createElement('input');

    inputAge.type = 'number';
    inputAge.name = 'age';
    inputAge.required = true;
    inputAge.setAttribute('data-qa', 'age');
    labelAge.append(inputAge);

    // Salary
    const labelSalary = document.createElement('label');

    labelSalary.textContent = 'Salary: ';

    const inputSalary = document.createElement('input');

    inputSalary.type = 'number';
    inputSalary.name = 'salary';
    inputSalary.required = true;
    inputSalary.setAttribute('data-qa', 'salary');
    labelSalary.append(inputSalary);

    // Button
    const button = document.createElement('button');

    button.textContent = 'Save to table';
    button.type = 'submit';
    button.setAttribute('data-qa', 'button');

    newForm.append(
      labelName,
      labelPosition,
      labelOffice,
      labelAge,
      labelSalary,
      button,
    );
    body.append(newForm);

    // Form submission
    newForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameValue = inputName.value.trim();
      const positionValue = inputPosition.value.trim();
      const officeValue = selectOffice.value;
      const ageValue = Number(inputAge.value);
      const salaryValue = Number(inputSalary.value);

      // Validation
      if (nameValue.length < 4) {
        showNotification(
          'error',
          'Invalid Name',
          'The name must contain at least 4 letters.',
        );

        return;
      }

      if (ageValue < 18 || ageValue > 90) {
        showNotification(
          'error',
          'Invalid Age',
          'Age must be between 18 and 90.',
        );

        return;
      }

      // Add new row
      const tbody = document.querySelector('table tbody');
      const newRow = document.createElement('tr');

      newRow.innerHTML = `
        <td>${nameValue}</td>
        <td>${positionValue}</td>
        <td>${officeValue}</td>
        <td>${ageValue}</td>
        <td>$${salaryValue.toLocaleString('en-US')}</td>
      `;
      tbody.append(newRow);

      // Reset form + show success
      newForm.reset();

      showNotification(
        'success',
        'Employee Added',
        `${nameValue} was successfully added to the table.`,
      );
    });
  }

  createForm();

  // edit with double-click
  table.addEventListener('dblclick', (e) => {
    const cell = e.target.closest('td');

    if (!cell) {
      return;
    }

    if (cell.querySelector('input')) {
      return;
    }

    const existingInput = table.querySelector('.cell-input');

    if (existingInput) {
      return;
    }

    const oldValue = cell.textContent.trim();
    const input = document.createElement('input');

    input.type = 'text';
    input.classList.add('cell-input');
    input.value = oldValue.replace(/[^0-9.,-]/g, '');

    cell.textContent = '';
    cell.append(input);
    input.focus();

    function saveValue() {
      const newValue = input.value.trim();

      if (newValue === '') {
        cell.textContent = oldValue;

        return;
      }

      if (cell.cellIndex === 4 && !isNaN(Number(newValue))) {
        const formatted = Number(newValue).toLocaleString('en-US');

        cell.textContent = `$${formatted}`;
      } else {
        cell.textContent = newValue;
      }
    }

    input.addEventListener('blur', saveValue);

    input.addEventListener('keypress', (ev) => {
      if (ev.key === 'Enter') {
        saveValue();
      }
    });
  });
});
