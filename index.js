const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');
const con = mysql.createConnection({ host: 'localhost', user: 'root', password: '9#7Mq`}$]:x-', database: 'employee_db' });

const Employee = require('./lib/Employee');
const Department = require('./lib/Department');
const Role = require('./lib/Role');


function init(){
    inquirer
    .prompt([
        {
            type: 'list',
            // message: "What would you like to do?",
            name: 'mainMenu',
            choices: ['View All Employees', 'Add An Employee', 'Update Employee Role', 'Update Employee Manager', 'View employees by manager', 'View employees by department', 'View All Roles', 'Add A Role', 'View All Departments', 'Add Department', 'Delete department, role, or employee', 'Quit']
        }
    ]).then((data) => {
        switch(data.mainMenu){

            case 'View All Employees':
                con.promise().query(`SELECT A.id, A.first_name, A.last_name, role.title, department.name AS department, 
                role.salary, concat(b.first_name, " ", b.last_name) AS manager 
                FROM employee A
                LEFT JOIN role on A.role_id = role.id
                LEFT JOIN department on role.department_id = department.id
                LEFT JOIN employee B on B.id = A.manager_id;`)
                    .then(([rows, fields]) => {
                        console.log('\n')
                        console.table(rows);
                        init();
                    });
                break;

            case 'Add An Employee':
                con.promise().query('select title FROM role').then(([rows,fields]) => {
                    const titles = rows.map(({title}) => title);
                    con.promise().query('select concat(first_name, " ", last_name) AS manager FROM employee').then(([rows,fields]) => {
                        const names = rows.map(({manager}) => manager);
                        names.push('No manager');
                        inquirer.prompt([
                            {
                                type: 'input',
                                name: 'firstName',
                                message: "Enter new employee's  first name:"
                            },
                            {
                                type: 'input',
                                name: 'lastName',
                                message: "Enter new employee's last name:"
                            },
                            {
                                type: 'list',
                                message: "Select new employee's role:",
                                name: 'roleId',
                                choices: titles
                            },
                            {
                                type: 'list',
                                message: "Choose new employee's manager:",
                                name: 'managerId',
                                choices: names
                            }
                        ]).then((data) => {
                            if(data.managerId === "No manager"){
                                const employee = new Employee(data.firstName, data.lastName, titles.indexOf(data.roleId) + 1, null)
                                employee.add();
                            }else{
                                const employee = new Employee(data.firstName, data.lastName, titles.indexOf(data.roleId) + 1, names.indexOf(data.managerId) + 1)
                                employee.add();
                            }
                            init();
                        })
                })})
                break;

            case 'Update Employee Role':
                con.promise().query('select title FROM role').then(([rows,fields]) => {
                    const titles = rows.map(({title}) => title);
                    con.promise().query('select concat(first_name, " ", last_name) as name from employee').then(([rows,fields]) => {
                        const names = rows.map(({name}) => name);
                        inquirer.prompt([
                            {
                                type: 'list',
                                message: 'Select employee to update:',
                                name: 'employee',
                                choices: names
                            },
                            {
                                type: 'list',
                                message: "Choose employee's new role:",
                                name: 'newRole',
                                choices: titles
                            }
                        ]).then((data) => {
                            const employee = new Employee(data.employee.split(" ")[0], data.employee.split(" ")[1], titles.indexOf(data.newRole) + 1, null);
                            employee.updateRole();
                            init();
                        })
                    })
                })
                
                break;

            case 'Update Employee Manager':
                con.promise().query('select concat(first_name, " ", last_name) as name from employee').then(([rows,fields]) => {
                        const names = rows.map(({name}) => name);
                        inquirer.prompt([
                            {
                                type: 'list',
                                message: 'Select employee to update:',
                                name: 'employee',
                                choices: names
                            },
                            
                        ]).then((data) => {
                            const name = data.employee;
                            const managers = [...names];
                            managers.splice(managers.indexOf(data.employee), 1);
                            managers.push('No manager')
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    message: "Choose employee's new manager:",
                                    name: 'newManager',
                                    choices: managers
                                }
                            ]).then((data) => {
                                const employee = new Employee(name.split(" ")[0], name.split(" ")[1], null, names.indexOf(data.newManager) + 1);
                                employee.updateManager();
                                init();
                            })
                        })
                })
                break;

            case 'View employees by manager':
                //view employees by manager
                con.promise().query('select DISTINCT A.id, concat(A.first_name, " ", A.last_name) AS manager FROM employee A, employee B WHERE A.id = B.manager_id').then(([rows,fields]) => {
                    const managers = rows.map(({manager}) => manager);
                    inquirer.prompt([
                        {
                            type: 'list',
                            message: 'Select employees by manager:',
                            name: 'manager',
                            choices: managers
                        }
                    ]).then((data) => {
                        let managerId;
                        rows.forEach(obj => {
                            if(obj.manager === data.manager){
                                managerId = obj.id;
                            }
                        });
                        con.promise().query(`SELECT A.id, A.first_name, A.last_name, role.title, department.name AS department, 
                        role.salary, concat(b.first_name, " ", b.last_name) AS manager 
                        FROM employee A
                        LEFT JOIN role on A.role_id = role.id
                        LEFT JOIN department on role.department_id = department.id
                        LEFT JOIN employee B on B.id = A.manager_id WHERE A.manager_id = ?`, managerId).then(([rows, fields]) =>{
                            console.log('\n')
                            console.table(rows);
                            init();
                        })
                        
                    })
                })
                break;

            case 'View employees by department':
                //view employees by department
                con.promise().query('select * FROM department').then(([rows,fields]) => {
                    const departments = rows.map(({name}) => name);
                    inquirer.prompt([
                        {
                            type: 'list',
                            message: 'Select employees by department:',
                            name: 'name',
                            choices: departments
                        }
                    ]).then((data) => {
                        let departmentId;
                        rows.forEach(obj => {
                            if(obj.name === data.name){
                                departmentId = obj.id;
                            }
                        });
                        con.promise().query(`SELECT A.id, A.first_name, A.last_name, role.title, department.name AS department, 
                        role.salary, concat(b.first_name, " ", b.last_name) AS manager 
                        FROM employee A
                        LEFT JOIN role on A.role_id = role.id
                        LEFT JOIN department on role.department_id = department.id
                        LEFT JOIN employee B on B.id = A.manager_id WHERE role.department_id = ?`, departmentId).then(([rows, fields]) =>{
                            console.log('\n')
                            console.table(rows);
                            init();
                        })
                        
                    })
                })
                break;

            case 'View All Roles':
                con.promise().query(`SELECT role.id, title, department.name AS department, salary FROM role
                LEFT JOIN department on role.department_id = department.id`)
                    .then(([rows, fields]) => {
                        console.log('\n')
                        console.table(rows);
                        init();
                    })
                break;

            case 'Add A Role':
                con.promise().query('select name FROM department').then(([rows,fields]) => {
                    const departments = rows.map(({name}) => name);
                    inquirer
                        .prompt([
                            {
                                type: 'input',
                                message: 'What is the name of the role?',
                                name: 'roleName'
                            },
                            {
                                type: 'input',
                                message: 'What is the salary of the role?',
                                name: 'salary'
                            },
                            {
                                type: 'list',
                                message: 'Which department does the role belong to?',
                                name: 'department',
                                choices: departments
                            }
                    ]).then((data) => {
                        const role = new Role(data.roleName,data.salary, departments.indexOf(data.department) + 1);
                        role.add();
                        init();
                    })
                })
                break;

            case 'View All Departments':
                con.promise().query(`SELECT * FROM department`)
                    .then(([rows, fields]) => {
                        console.log('\n')
                        console.table(rows);
                        init();
                    })
                break;

            case 'Add Department':
                inquirer
                    .prompt([
                        {
                            type: 'input',
                            message: 'What is the name of the department?',
                            name: 'departmentName'
                        }
                ]).then((data) => {
                    const department = new Department(data.departmentName);
                    department.add();
                    init();
                })
                break;
            
            case 'Delete department, role, or employee':
                //delete department, role or employee
                inquirer
                .prompt([
                    {
                        type: 'list',
                        message: 'What would you like to delete?',
                        name: 'class',
                        choices: ['Department', 'Role', 'Employee']
                    }
                ]).then((data) => {
                    if(data.class === 'Department'){
                        //delete department
                    }else if(data.class === 'Role'){
                        //delete role
                    }else{
                        //delete employee
                    }
                })
                break;

            default:
                inquirer.prompt().ui().close();
                break;
        }
    })
}

init();