const httpStatus = require('http-status');
const mysql = require('../../config/database');
const sql = require('../../sql/hello/hello.sql');

const printHello = () => {
    console.log('Hello!!');
}

const printHelloAsync = async () => {
    const result = await mysql.query(sql.selectHello, []);
    console.log(result);
    console.log('Hello Async!!');
}

module.exports = {
    printHello,
    printHelloAsync
};