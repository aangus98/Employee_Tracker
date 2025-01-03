# Employee Tracker

## Description

The **Employee Tracker** is a command-line application that allows business owners to manage their company's employee database efficiently. Built with Node.js, Inquirer, and MySQL2, it provides an intuitive interface for interacting with the database. Users can view, add, and update departments, roles, and employees.

---

## Table of Contents
1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [License](#license)
5. [Github](#github)
6. [Email](#email)

---

## Features

- View all employees, roles, and departments.
- Add new departments, roles, and employees.
- Update employee roles.
- Automatically ensures relational integrity in the database.
- Uses a modern, secure, and modular codebase.

---

## Installation

Follow these steps to install and set up the application:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/employee-tracker.git
   cd employee-tracker
2. Install Dependencies
    ```bash
    npm install
3. Set up the database
    - Log into MySQL
    ```bash
    mysql -u root -p
    ```
    - Run the schema.sql file to create the database and tables:
    ```bash
    SOURCE db/schema.sql;
4. Create a .env file in the project root:
    ```bash
    touch .env
    ```
   -Add the following environment variables to the file:
    ```bash 
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=employee_db
    ```
5. Test the connection: Run a simple connection test to ensure verything is configured properly:
    ```bash
    node src/testConnection.js

## Usage

1. Start the Application
    ```bash
    cd src
    node app.js
2. Follow the prompts to
    - View employees, roles, and departments.
    - Add new data to the database.
    - Update employee roles.
3. Exit the application by selecting the Quit option.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Github
github.com/aangus98

## Email
mrangus298@gmail.com






