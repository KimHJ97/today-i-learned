const mysql2 = require('mysql2/promise');
const { mysql } = require('./vars');

// 커넥션 풀 설정
const pool = mysql2.createPool({
    connectionLimit: 10,
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    databse: mysql.database,
});

// DB 상태 조회
const status = async () => {
    return await pool.query('SELECT 1');
}

// DB Query
const query = async (sql, params) => {
    const connection = await pool.getConnection(async conn => conn);
    try {
        const result = await connection.query(sql, params);
        connection.release();
        return result
    } catch (error) {
        console.error(error);
        connection.release();
        return error;
    }
}

module.exports = {
    status,
    query
};