# ORM

## ORM 설명

ORM(객체 관계 매핑)은 객체 지향 프로그래밍에서 데이터베이스와의 상호 작용을 추상화하는 기술입니다. ORM은 데이터베이스의 테이블을 객체로 매핑하여, 객체 지향 프로그래밍 언어에서 사용할 수 있는 방식으로 데이터를 다룰 수 있게 해줍니다.  
 - 객체와 관계형 데이터베이스의 데이터를 자동으로 변형 및 연결하는 작업

### ORM 추상화 계층

 - __저수준(데이터 베이스 드라이버)__
    - 데이터베이스 드라이버는 데이터베이스 연결(+연결 풀링)을 처리한다. 이 수준에서는 원시 SQL 문자열을 작성하여 데이터 베이스에 전달하고 데이터 베이스에서 응답을 받는다.  
    - mysql: MySQL을 위한 데이터베이스 드라이버
    - pg: PostgreSQL를 위한 데이터베이스 드라이버
    - sqlite3: SQLite를 위한 데이터베이스 드라이버
```javascript
const { Client } = require('pg');
const connection = require('./connection.json');
const client = new Client(connection);

client.connect();

const query = `
SELECT
    ingredient.*, item.name AS item_name, item.type AS item_type
FROM 
    ingredient
    LEFT JOIN item ON item.id = ingredient.item_id
WHERE
    ingredient.dish_id = $1
`;

client
    .query(query, [1])
    .then(res => {
        console.log('Ingredients:');
        for (let row of res.rows) {
            console.log(`${row.item_name}: ${row.quantity} ${row.unit}`);
        }
        client.end();
    });
```
<br/>

 - __중간수준(쿼리 빌더)__
    - 이것은 단순한 데이터베이스 드라이버 모듈과 완전한 ORM을 사용하는 것의 중간 수준으로, 주요 모듈로는 Knex가 있다.
    - Knex 모듈은 몇 가지 다른 SQL 언어에 대한 쿼리를 생성할 수 있따.
```javascript
const knex = require('knex');
const connection = require('./connection.json');
const client = knex({
    client: 'pg',
    connection
});

client
    .select({
        '*',
        client.ref('item.name').as('item_name'),
        client.ref('item.type').as('item_type'),
    })
    .from('ingredient')
    .leftJoin('item', 'item.id', 'ingredient.item_id')
    .where('dish_id', '=', 1)
    .debug()
    .then(rows => {
        console.log('Ingredients:');
        for (let row of rows) {
            console.log(`${row.item_name}: ${row.quantity} ${row.unit}`);
        }

        client.destroy();
    });
```
<br/>

 - __고수준(ORM)__
    - 최고 수준의 추상화로 ORM으로 작업할 때 일반적으로 더 많은 설정을 사전에 수행해야 한다.
    - typeorm, sequelize, prisma 등

 