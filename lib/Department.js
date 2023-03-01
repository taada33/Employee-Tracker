const mysql = require('mysql2');
const con = mysql.createConnection({ host: 'localhost', user: 'root', password: '9#7Mq`}$]:x-', database: 'employee_db' });

class Department{
    constructor(name){
        this.name = name;
    }

    add(){
        con.promise().query(`INSERT INTO department (name)
        VALUES (?)`, [this.name])
                    .then(([rows, fields]) => {
                        console.log(`\nAdded ${this.name} department  sucessfully!`);
                    })
    }
}


module.exports = Department;