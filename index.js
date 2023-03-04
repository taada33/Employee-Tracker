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
            choices: ['View All Employees', 'Add An Employee', 'Update Employee Role', 'Update Employee Manager', 'View employees by manager', 'View employees by department', 'View All Roles', 'Add A Role', 'View All Departments', 'Add Department', 'View Total Budget of a Department', 'Delete department, role, or employee', 'Quit']
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
                con.promise().query('select id, title FROM role').then(([rows,fields]) => {
                    const roleTable = rows;
                    const titles = rows.map(({title}) => title);
                    con.promise().query('select id, concat(first_name, " ", last_name) AS manager FROM employee').then(([rows,fields]) => {
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
                            let roleId;
                            roleTable.forEach(obj => {
                                if(obj.title === data.roleId){
                                    roleId = obj.id;
                                }
                            });

                            if(data.managerId === "No manager"){
                                
                                const employee = new Employee(data.firstName, data.lastName, roleId, null)
                                employee.add();
                            }else{
                                let managerId;
                                rows.forEach(obj => {
                                    if(obj.manager === data.managerId){
                                        managerId = obj.id;
                                    }
                                });
                                const employee = new Employee(data.firstName, data.lastName, roleId, managerId)
                                employee.add();
                            }
                            init();
                        })
                })})
                break;

            case 'Update Employee Role':
                con.promise().query('select concat(first_name, " ", last_name) as name from employee').then(([rows,fields]) => {
                    const names = rows.map(({name}) => name);
                    con.promise().query('select id, title FROM role').then(([rows,fields]) => {
                        const titles = rows.map(({title}) => title);
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
                            let roleId;
                            rows.forEach(obj => {
                                if(obj.title === data.newRole){
                                    roleId = obj.id;
                                }
                            });
                            const employee = new Employee(data.employee.split(" ")[0], data.employee.split(" ")[1], roleId, null);
                            employee.updateRole();
                            init();
                        })
                    })
                })
                break;

            case 'Update Employee Manager':
                con.promise().query('select id, concat(first_name, " ", last_name) as name, role_id, manager_id from employee').then(([rows,fields]) => {
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
                                let managerId;
                                rows.forEach(obj => {
                                    if(obj.name === data.newManager){
                                        managerId = obj.id;
                                    }
                                });
                                const employee = new Employee(name.split(" ")[0], name.split(" ")[1], null, managerId);
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
                con.promise().query('select id, name FROM department').then(([rows,fields]) => {
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
                        let departmentId;
                        console.log(rows)
                        rows.forEach(obj => {
                            if(obj.name === data.department){
                                departmentId = obj.id;
                            }
                        });
                        console.log(departmentId)
                        const role = new Role(data.roleName,data.salary, departmentId);
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
            
            case 'View Total Budget of a Department':
                con.promise().query('select id, name from department').then(([rows,fields]) => {
                    const departments = rows.map(({name}) => name);
                    inquirer
                    .prompt([
                        {
                            type: 'list',
                            message: 'Select department to view budget',
                            name: 'department',
                            choices: departments
                        }
                    ]).then((data) => {
                        let departmentId;
                        rows.forEach(obj => {
                            if(obj.name === data.department){
                                departmentId = obj.id;
                            }
                        });
                        const department = new Department(data.department);
                        department.budget(departmentId);
                        init();
                    })
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
                        con.promise().query(`select id, name from department`)
                        .then(([rows, fields]) => {
                            const departments = rows.map(({name}) => name);
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    message: 'Choose department to delete',
                                    name: 'department',
                                    choices: departments
                                }
                            ]).then((data) => {
                                let departmentId;
                                rows.forEach(obj => {
                                    if(obj.name === data.department){
                                        departmentId = obj.id;
                                    }
                                });
                                const department = new Department(data.department);
                                department.delete(departmentId);
                                init();
                            })
                        })
                        
                    }else if(data.class === 'Role'){
                        //delete role
                        con.promise().query(`select id, title, salary, department_id from role`)
                        .then(([rows, fields]) => {
                            const roles = rows.map(({title}) => title);
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    message: 'Choose a role to delete',
                                    name: 'role',
                                    choices: roles
                                }
                            ]).then((data) => {
                                let roleObj;
                                rows.forEach(obj => {
                                    if(obj.title === data.role){
                                        roleObj = {id: obj.id, title: obj.title, salary: obj.salary, 
                                            department: obj.department};
                                    }
                                });
                                const role = new Role(roleObj.title, roleObj.salary, roleObj.department);
                                role.delete(roleObj.id);
                                init();
                            })
                        })
                    }else{
                        //delete employee
                        con.promise().query(`select id, concat(first_name, " ", last_name) as name, role_id, manager_id from employee`)
                        .then(([rows, fields]) => {
                            const employees = rows.map(({name}) => name);
                            inquirer.prompt([
                                {
                                    type: 'list',
                                    message: 'Choose an employee to delete',
                                    name: 'employee',
                                    choices: employees
                                }
                            ]).then((data) => {
                                let employeeObj;
                                rows.forEach(obj => {
                                    if(obj.name === data.employee){
                                        employeeObj = {id: obj.id, firstName: obj.name.split(" ")[0], 
                                        lastName: obj.name.split(" ")[1], roleId: obj.role_id, 
                                           managerId : obj.manager_id};
                                    }
                                });
                                const role = new Employee(employeeObj.firstName, employeeObj.lastName, employeeObj.roleId, employeeObj.managerId);
                                role.delete(employeeObj.id);
                                init();
                            })
                        })
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