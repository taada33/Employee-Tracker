const inquirer = require('inquirer');
const cTable = require('console.table');
const mysql = require('mysql2');
const con = mysql.createConnection({ host: 'localhost', user: 'root', password: '9#7Mq`}$]:x-', database: 'employee_db' });


function init(){
    
    inquirer
    .prompt([
        {
            type: 'list',
            name: 'mainMenu',
            choices: ['View All Employees', 'Add An Employee', 'Update Employee Role', 'View All Roles', 'Add A Role', 'View All Departments', 'Add Department', 'Quit']
        }
    ]).then((data) => {
        switch(data.mainMenu){
            case 'View All Employees':
                con.promise().query(`SELECT A.id, A.first_name, A.last_name, role.title, department.name AS department, 
                role.salary,  concat(b.first_name, " ", b.last_name) AS manager 
                FROM employee A, employee B, role, department
                WHERE A.role_id = role.id AND role.department_id = department.id AND A.manager_id = B.id
                ORDER BY ID; `)
                    .then(([rows, fields]) => {
                        console.log('\n')
                        console.table(rows);
                        init();
                    })
                break;
            case 'Add An Employee':
                console.log('case 2');
                init();
                break;
            case 'Update Employee Role':
                console.log('case 3');
                init();
                break;
            case 'View All Roles':
                console.log('case 4');
                init();
                break;
            case 'Add A Role':
                console.log('case 5');
                init();
                break;
            case 'View All Departments':
                console.log('case 6');
                init();
                break;
            case 'Add Department':
                console.log('case 6');
                init();
                break;
            default:
                console.log('case 7')
                break;
        }
    })
}

init();


