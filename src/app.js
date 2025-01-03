// File: app.js
const inquirer = require('inquirer');
const mysql = require('mysql2/promise');
const cTable = require('console.table');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'company_db'
};

async function mainMenu() {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database.');

    const choices = [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit'
    ];

    let exit = false;
    while (!exit) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices
            }
        ]);

        switch (action) {
            case 'View all departments':
                await viewDepartments(connection);
                break;
            case 'View all roles':
                await viewRoles(connection);
                break;
            case 'View all employees':
                await viewEmployees(connection);
                break;
            case 'Add a department':
                await addDepartment(connection);
                break;
            case 'Add a role':
                await addRole(connection);
                break;
            case 'Add an employee':
                await addEmployee(connection);
                break;
            case 'Update an employee role':
                await updateEmployeeRole(connection);
                break;
            case 'Exit':
                exit = true;
                break;
        }
    }

    await connection.end();
    console.log('Goodbye!');
}

async function viewDepartments(connection) {
    const [rows] = await connection.execute('SELECT * FROM departments');
    console.table(rows);
}

async function viewRoles(connection) {
    const [rows] = await connection.execute(`
        SELECT roles.id, roles.title, departments.name AS department, roles.salary 
        FROM roles 
        JOIN departments ON roles.department_id = departments.id
    `);
    console.table(rows);
}

async function viewEmployees(connection) {
    const [rows] = await connection.execute(`
        SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, 
        CONCAT(managers.first_name, ' ', managers.last_name) AS manager 
        FROM employees 
        LEFT JOIN roles ON employees.role_id = roles.id 
        LEFT JOIN departments ON roles.department_id = departments.id 
        LEFT JOIN employees AS managers ON employees.manager_id = managers.id
    `);
    console.table(rows);
}

async function addDepartment(connection) {
    const { name } = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter the department name:' }
    ]);
    await connection.execute('INSERT INTO departments (name) VALUES (?)', [name]);
    console.log(`Added department: ${name}`);
}

async function addRole(connection) {
    const [departments] = await connection.execute('SELECT * FROM departments');
    const { title, salary, departmentId } = await inquirer.prompt([
        { type: 'input', name: 'title', message: 'Enter the role title:' },
        { type: 'input', name: 'salary', message: 'Enter the role salary:' },
        {
            type: 'list',
            name: 'departmentId',
            message: 'Select the department:',
            choices: departments.map(dept => ({ name: dept.name, value: dept.id }))
        }
    ]);
    await connection.execute('INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)', [title, salary, departmentId]);
    console.log(`Added role: ${title}`);
}

async function addEmployee(connection) {
    const [roles] = await connection.execute('SELECT * FROM roles');
    const [employees] = await connection.execute('SELECT * FROM employees');
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: 'Enter the employee\'s first name:' },
        { type: 'input', name: 'lastName', message: 'Enter the employee\'s last name:' },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the role:',
            choices: roles.map(role => ({ name: role.title, value: role.id }))
        },
        {
            type: 'list',
            name: 'managerId',
            message: 'Select the manager:',
            choices: [{ name: 'None', value: null }].concat(employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })))
        }
    ]);
    await connection.execute('INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', [firstName, lastName, roleId, managerId]);
    console.log(`Added employee: ${firstName} ${lastName}`);
}

async function updateEmployeeRole(connection) {
    const [employees] = await connection.execute('SELECT * FROM employees');
    const [roles] = await connection.execute('SELECT * FROM roles');
    const { employeeId, roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to update:',
            choices: employees.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }))
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the new role:',
            choices: roles.map(role => ({ name: role.title, value: role.id }))
        }
    ]);
    await connection.execute('UPDATE employees SET role_id = ? WHERE id = ?', [roleId, employeeId]);
    console.log('Updated employee role.');
}

mainMenu();
