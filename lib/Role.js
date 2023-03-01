const mysql = require('mysql2');
const con = mysql.createConnection({ host: 'localhost', user: 'root', password: '9#7Mq`}$]:x-', database: 'employee_db' });

class Role{
    constructor(name, salary, department){
        this.title = name;
        this.salary = salary;
        this.department = department;
    }

    add(){
        con.promise().query(`INSERT INTO role (title, salary, department_id)
        VALUES (?, ?, ?)`, [this.title, this.salary, this.department])
                    .then(([rows, fields]) => {
                        console.log(`\nAdded ${this.title} role  sucessfully!`);
                    })
    }
}


module.exports = Role;