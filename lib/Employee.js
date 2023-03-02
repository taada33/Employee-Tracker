const mysql = require('mysql2');
const con = mysql.createConnection({ host: 'localhost', user: 'root', password: '9#7Mq`}$]:x-', database: 'employee_db' });

class Employee{
    constructor(firstName, lastName, roleId, managerId){
        this.firstName = firstName;
        this.lastName = lastName;
        this.roleId = roleId;
        this.managerId = managerId;
    }

    add(){
        con.promise().query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES ( ?, ?, ?, ?)`, [this.firstName, this.lastName, this.roleId, this.managerId])
                    .then(([rows, fields]) => {
                        console.log(`Added employee ${this.firstName} ${this.lastName} sucessfully!`);
                    })
    }

    updateRole(){
        con.promise().query(`SELECT id FROM employee WHERE first_name = ? AND last_name = ?`, [this.firstName, this.lastName])
            .then(([rows, fields]) => {
                con.promise().query(`update employee set role_id = ? where id = ?`, [this.roleId, rows[0].id])
                    .then(([rows, fields]) => {
                        console.log(`\nUpdated employee ${this.firstName} ${this.lastName}'s role sucessfully!`);
                    })
            })
    }

    updateManager(){
        con.promise().query(`SELECT id FROM employee WHERE first_name = ? AND last_name = ?`, [this.firstName, this.lastName])
            .then(([rows, fields]) => {
                con.promise().query(`update employee set manager_id = ? where id = ?`, [this.managerId, rows[0].id])
                    .then(([rows, fields]) => {
                        console.log(`\nUpdated employee ${this.firstName} ${this.lastName}'s manager sucessfully!`);
                    })
            })
    }
}


module.exports = Employee;