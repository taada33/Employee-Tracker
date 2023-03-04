const mysql = require('mysql2');
const con = mysql.createConnection({ host: 'localhost', user: 'root', password: '9#7Mq`}$]:x-', database: 'employee_db' });

class Department{
    //use for add()
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

    delete(id){
        con.promise().query('delete from department where id = ?',  id)
        .then(([rows, fields]) => {
            console.log(`\n${this.name} department deleted!`);
        })
    }

    budget(id){
        con.promise().query('select SUM(salary) as budget from role where department_id = ?', id)
        .then(([rows,fields]) => {
            const departments = rows.map(({budget}) => budget);
            let departmentBudget = [{name: this.name, budget: departments[0]}];
            console.log('\n');
            console.table(departmentBudget);
        })
    }
}


module.exports = Department;