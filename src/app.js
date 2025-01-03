import dotenv from 'dotenv';
import inquirer from 'inquirer';
import mysql from 'mysql2/promise';

// Load environment variables from .env file
dotenv.config();

// Database configuration using .env variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const menuOptions = [
    'View all employees',
    'Add employee',
    'Update employee role',
    'View all roles',
    'Add role',
    'View all departments',
    'Add department',
    'Quit'
];

const init = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: menuOptions,
        },
    ]);

    switch (action) {
        case 'View all employees':
            await viewAllEmployees();
            break;
        case 'Add employee':
            await addEmployee();
            break;
        case 'Update employee role':
            await updateEmployeeRole();
            break;
        case 'View all roles':
            await viewAllRoles();
            break;
        case 'Add role':
            await addRole();
            break;
        case 'View all departments':
            await viewAllDepartments();
            break;
        case 'Add department':
            await addDepartment();
            break;
        case 'Quit':
            console.log('Goodbye!');
            process.exit();
    }

    init(); // Return to the main menu
};

const viewAllEmployees = async () => {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
        SELECT 
            employee.id,
            employee.first_name,
            employee.last_name,
            role.title,
            department.name AS department,
            role.salary,
            CONCAT(manager.first_name, ' ', manager.last_name) AS manager
        FROM 
            employee
        LEFT JOIN 
            role ON employee.role_id = role.id
        LEFT JOIN 
            department ON role.department_id = department.id
        LEFT JOIN 
            employee AS manager ON employee.manager_id = manager.id;
    `);
    console.table(rows);
    await connection.end();
};

// Function to add a department
const addDepartment = async () => {
    const { name } = await inquirer.prompt([
        { type: 'input', name: 'name', message: 'Enter the department name:' },
    ]);

    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('INSERT INTO department (name) VALUES (?)', [name]);
    console.log(`Added department: ${name}`);
    await connection.end();
};

// Function to view all departments
const viewAllDepartments = async () => {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM department');
    console.table(rows);
    await connection.end();
};

// Function to add a role
const addRole = async () => {
    const connection = await mysql.createConnection(dbConfig);
    const [departments] = await connection.execute('SELECT * FROM department');

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

    await connection.execute(
        'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
        [title, salary, departmentId]
    );
    console.log(`Added role: ${title}`);
    await connection.end();
};

// Function to view all roles
const viewAllRoles = async () => {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
        SELECT 
            role.id, 
            role.title, 
            role.salary, 
            department.name AS department
        FROM 
            role
        LEFT JOIN 
            department ON role.department_id = department.id;
    `);
    console.table(rows);
    await connection.end();
};

// Function to add an employee
const addEmployee = async () => {
    const connection = await mysql.createConnection(dbConfig);
    const [roles] = await connection.execute('SELECT * FROM role');
    const [employees] = await connection.execute('SELECT * FROM employee');

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
        { type: 'input', name: 'firstName', message: 'Enter the first name:' },
        { type: 'input', name: 'lastName', message: 'Enter the last name:' },
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
            choices: [{ name: 'None', value: null }].concat(
                employees.map(emp => ({
                    name: `${emp.first_name} ${emp.last_name}`,
                    value: emp.id
                }))
            )
        }
    ]);

    await connection.execute(
        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
        [firstName, lastName, roleId, managerId]
    );
    console.log(`Added employee: ${firstName} ${lastName}`);
    await connection.end();
};

// Function to update an employee's role
const updateEmployeeRole = async () => {
    const connection = await mysql.createConnection(dbConfig);
    const [employees] = await connection.execute('SELECT * FROM employee');
    const [roles] = await connection.execute('SELECT * FROM role');

    const { employeeId, roleId } = await inquirer.prompt([
        {
            type: 'list',
            name: 'employeeId',
            message: 'Select the employee to update:',
            choices: employees.map(emp => ({
                name: `${emp.first_name} ${emp.last_name}`,
                value: emp.id
            }))
        },
        {
            type: 'list',
            name: 'roleId',
            message: 'Select the new role:',
            choices: roles.map(role => ({ name: role.title, value: role.id }))
        }
    ]);

    await connection.execute(
        'UPDATE employee SET role_id = ? WHERE id = ?',
        [roleId, employeeId]
    );
    console.log('Updated employee role.');
    await connection.end();
};

// Start the application
init();

