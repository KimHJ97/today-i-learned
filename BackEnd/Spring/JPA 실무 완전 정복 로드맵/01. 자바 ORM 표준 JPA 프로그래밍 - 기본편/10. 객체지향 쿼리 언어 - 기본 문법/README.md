# 객체지향 쿼리 언어

JPA는 다양한 쿼리 방법을 지원한다.  
 - JPQL
 - JPA Criteria
 - QueryDSL
 - 네이티브 SQL
 - JDBC API 직접 사용, MyBatis, SpringJdbcTemplate 함께 사용

<br/>

## 1. 다양한 쿼리 방법

### 1-1. JPQL

JPQL은 Java Persistence Query Language의 약자로, 자바 플랫폼에서 영속성을 제공하는 기술인 JPA(Java Persistence API)에서 사용되는 쿼리 언어입니다. JPQL은 데이터베이스의 특정 SQL 문법에 종속되지 않으며, 엔티티 객체를 대상으로 쿼리를 작성할 수 있도록 합니다.  

JPQL은 객체지향 쿼리 언어로써, 엔티티 객체와 그들의 관계를 기반으로 쿼리를 작성할 수 있습니다. 따라서 데이터베이스의 구체적인 스키마나 테이블 구조에 의존하지 않고, 엔티티 클래스와 그들의 관계에 따라 데이터를 조회하고 조작할 수 있습니다. JPQL을 사용하면 애플리케이션의 유연성과 이식성이 향상되며, 객체지향적인 설계와 관리가 용이해집니다.  

쉽게, __JPQL은 테이블이 아닌 객체를 대상으로 검색하는 객체 지향 쿼리로 SQL을 추상화해서 특정 데이터베이스 SQL에 의존하지 않는다. (객체 지향 SQL)__  
 - JPA는 SQL을 추상화한 JPQL이라는 객체 지향 쿼리 언어 제공
 - SQL과 문법 유사, SELECT, FROM, WHERE, GROUP BY, HAVING, JOIN 지원
 - JPQL은 엔티티 객체를 대상으로 쿼리
 - SQL은 데이터베이스 테이블을 대상으로 쿼리
```java
// 이름의 "hello"가 존재하는 회원 검색
String jpql = "SELECT m FROM Member m WHERE m.name LIKE '%hello%'";
List<Member> result = em.createQuery(jpql, Member.class).getResultList();

// 나이가 18세 이상인 회원 검색
String jpql2 = "SELECT m FROM Member m WHERE m.age > 18";
List<Member> result = em.createQuery(jpql2, Member.class).getResultList();
```

단순히 JPQL만을 사용하면 동적 쿼리를 만들 때 해야할 처리가 너무나도 많게 된다.  
떄문에, 이런 문제를 해결하기 위해 JPA에서는 기본적으로 Criteria라는 JPQL 쿼리 빌더 기능을 제공한다.  
<br/>

### 1-2. Criteria

Criteria는 Java Persistence API (JPA)에서 제공하는 쿼리 작성 방법 중 하나입니다. Criteria 쿼리는 JPQL(Java Persistence Query Language)과는 달리 정적으로 타입 세이프한 방식으로 쿼리를 작성할 수 있습니다.  

Criteria API를 사용하면 쿼리를 문자열로 작성하는 대신, 자바 코드를 사용하여 동적으로 쿼리를 작성할 수 있습니다. 이는 IDE의 자동완성 및 코드 검증을 통해 오타나 문법 오류를 사전에 확인할 수 있는 장점이 있습니다.  

Criteria API는 Fluent 인터페이스를 사용하여 쿼리 작성을 지원하며, 객체지향적인 방식으로 쿼리를 작성할 수 있어 유지보수성과 가독성이 높아집니다. 또한, 동적으로 쿼리를 조합하거나 필요에 따라 쿼리를 변경하는 것이 용이합니다.  

전통적인 JPQL과 마찬가지로 Criteria API도 엔티티와 관계를 기반으로 쿼리를 작성할 수 있으며, 데이터베이스에 대한 종속성을 줄여줍니다. 이러한 특징으로 인해 Criteria API는 복잡한 쿼리 작성 및 유연한 동적 쿼리 생성에 유용하게 사용됩니다.  
 - 문자가 아닌 자바 코드로 JPQL을 작성할 수 있다.
 - JPQL 빌더 역할
 - __너무 복잡하고 실용성이 없다. 떄문에, Criteria 대신에 QueryDSL이나 jOOQ 사용이 권장된다.__

```java
//Criteria 사용 준비
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Member> query = cb.createQuery(Member.class); 

//루트 클래스 (조회를 시작할 클래스)
Root<Member> m = query.from(Member.class); 

//쿼리 생성 
CriteriaQuery<Member> cq = query
            .select(m)
            .where(
                cb.equal(m.get("username"), “kim”)
            );
List<Member> resultList = em.createQuery(cq).getResultList();
```
<br/>

### 1-3. QueryDSL

QueryDSL은 Java와 같은 객체지향 프로그래밍 언어를 사용하여 타입 안전한 쿼리를 작성할 수 있도록 도와주는 오픈소스 프레임워크입니다. 특히, 관계형 데이터베이스에 대한 동적 쿼리를 작성할 때 매우 유용합니다.  

QueryDSL은 SQL과 같은 데이터베이스 쿼리 언어를 문자열이 아닌 자바 코드로 작성할 수 있도록 지원합니다. 이는 컴파일 타임에 오류를 확인할 수 있으며, IDE의 자동완성과 코드 어시스트 기능을 활용하여 쿼리 작성이 더욱 편리해집니다.  

QueryDSL은 자바 코드로 쿼리를 작성하기 때문에, 복잡한 쿼리를 작성하거나 동적으로 쿼리를 조립해야 하는 경우에 특히 유용합니다. 또한, JPQL이나 Criteria API보다 가독성이 뛰어나며, 객체지향적인 쿼리 작성이 가능하여 개발자들이 쿼리를 더 직관적으로 이해할 수 있습니다.  
 - JPQL 빌더 역할
 - 컴파일 시점에 문법 오류를 찾을 수 있다.
 - 동적 쿼리 작성이 편리하다.
 - __단순하고 문법이 쉬워, 실무 사용 권장된다.__

```java
JPAFactoryQuery query = new JPAQueryFactory(em);
QMember m = QMember.member;

List<Member> list = query
        .selectFrom(m)
        .where(m.age.gt(18))
        .orderBy(m.name.desc())
        .fetch();
```
<br/>

### 1-4. Native Query

JPA는 SQL을 직접 사용하는 기능을 제공한다.  
JPQL로 해결할 수 없는 특정 데이터베이스에 의존적인 기능을 사용할 때 SQL을 직접 사용해야하는 경우가 발생한다.  
 - Oracle DB: CONNECT BY
 - 특정 DB만 사용하는 SQL 힌트 등

```java
Stromg sql = "SELECT id, age, teamId, name FROM Member WHERE name = 'kim%'";
List<Member> resultList = em.createNativeQuery(sql, Member.class).getResultList();
```
<br/>

## 2. JPQL 기본 문법과 기능

JPQL은 객체지향 쿼리 언어다.따라서 테이블을 대상으로 쿼리하는 것이 아니라 엔티티 객체를 대상으로 쿼리한다. JPQL은 SQL을 추상화해서 특정 데이터베이스 SQL에 의존하지 않는다.  
 - JPQL은 결국 SQL로 변환되어 실행된다.

<br/>

### 2-1. JPQL 문법

 - 엔티티와 속성은 대소문자를 구분한다. (Member, name, age 등)
 - JPQL 키워드는 대소문자를 구분하지 않는다. (SELECT, FROM, where, group by 등)
 - 테이블명이 아닌 엔티티 이름을 사용한다.
 - 별칭은 필수이다. (as는 생략 가능)
```
select m from Member as m where m.age > 18
SELECT m FROM Member m WHERE m.age > 18

select COUNT(m), SUM(m.age), AVG(m.age), MAX(m.age), MIN(m.age) from Member m
```
<br/>

### 2-2. TypeQuery와 Query

TypeQuery는 반환 타입이 명확할 때 사용하고, Query는 반환 타입이 명확하지 않을 때 사용한다.  

```java
// createQuery() 메서드 수행시, 타입 정보를 넘기면 해당 반환 타입으로 반환된다.
TypedQuery<Member> query1 = em.createQuery("SELECT m FROM Member m", Member.class);
TypedQuery<String> query2 = em.createQuery("SELECT m.username FROM Member m", String.class);

// createQuery() 메서드 수행시, 타입 정보가 명확하지 않으면 Query 객체로 반환받는다.
Query query3 = em.createQuery("SELECT m.username, m.age from Member m");
```
<br/>

### 2-3. 결과 조회 API

결과가 하나 이상인 컬렉션일 떄는 getResultList() 메서드를 사용하고, 결과가 단일 객체 하나인 경우에는 getSingleResult() 메서드를 사용한다.  
 - query.getResultList(): 결과가 하나 이상일 때, 리스트 반환
    - 결과가 없으면 빈 리스트 반환
 - query.getSingleResult(): 결과가 정확히 하나, 단일 객체 반환
    - 결과가 없으면: javax.persistence.NoResultException
    - 둘 이상이면: javax.persistence.NonUniqueResultException
```java
TypedQuery<Member> query = em.createQuery("select m from Member m where m.id = 10", Member.class);
Member result = query.getSingleResult();
```

<br/>

### 2-4. 파라미터 바인딩

파라미터 바인딩은 이름 기준 바인딩과 위치 기준 바인딩 2가지 방식이 있다.  
 - __되도록 이름 기준 바인딩을 사용하는 것이 권장__

```java
String username = "김철수";

// 이름 기준 바인딩
String jpql = "SELECT m FROM Member m where m.username=:username";
TypedQuery<Member> query = em.createQuery(jpql, Member.class);
query.setParameter("username", username);

// 위치 기준 바인딩
String jpql2 = "SELECT m FROM Member m where m.username=?1";
TypedQuery<Member> query2 = em.createQuery(jpql2, Member.class);
query2.setParameter(1, username);

// 메서드 체이닝
Member result = em.createQuery("SELECT m FROM Member m where m.username=:username", Member.class)
        .setParameter("username", username)
        .getSingleResult();
```
<br/>

## 3. 프로젝션

프로젝션은 SELECT 절에 조회할 대상을 지정하는 것을 말한다.  
 - 프로젝션 대상: 엔티티, 임베디드 타입, 스칼라 타입(숫자, 문자등 기본 데이터 타
입)

```
SELECT m FROM Member m -> 엔티티 프로젝션
SELECT m.team FROM Member m -> 엔티티 프로젝션
SELECT m.address FROM Member m -> 임베디드 타입 프로젝션
SELECT m.username, m.age FROM Member m -> 스칼라 타입 프로젝션
DISTINCT로 중복 제거
```
<br/>

### 3-1. 프로젝션 예제

 - `엔티티 프로젝션`
    - 엔티티 프로젝션은 영속성 컨텍스트에 관리된다.
    - 즉, 객체의 상태를 바꾸면 DB에 반영된다.
```java
List<Member> result = em.createQuery("select m from Member m", Member.class)
        .getResultList();

Member findMember = result.get(0);
findMember.setAge(20);
tx.commit();
```
<br/>

 - `임베디드 타입 프로젝션`
```java
List<Member> result = em.createQuery("select o.address from Order o", Address.class)
        .getResultList();
```
<br/>

 - `스칼라 타입 프로젝션`
    - 스칼라 타입 프로젝션은 필요한 데이터만을 명시하여 가져오는 것
```java
List result = em.createQuery("select m.username, m.age from Member m")
        .getResultList();
```
<br/>

### 3-2. 프로젝션 - 여러 값 조회

 - `Query 타입으로 조회`
    - 타입이 명확하지 않는 경우 Query 타입으로 받을 수 있다.
```java
// Query 타입으로 조회
List resultList = em.createQuery("select m.username, m.age from Member m")
        .getResultList();

Object object = resultList.get(0);
Object[] result = (Object[]) object;
String username = String.valueOf(result[0]);
int username = Integer.parseInt(result[1]);

// Object[] 타입으로 조회
List<Object[]> resultList = em.createQuery("select m.username, m.age from Member m")
        .getResultList();

Object[] result = resultList.get(0);
String username = String.valueOf(result[0]);
int username = Integer.parseInt(result[1]);
```
<br/>

 - `new 명령어로 조회`
    - 단순 값을 DTO로 바로 조회할 수 있다.
    - JPQL 내부에 패키지명을 포함한 전체 클래스명을 입력해야 한다.
    - DTO 클래스에는 순서와 타입이 일치하는 생성자가 필요하다.
```java
public class MemberDTO {
    private String username;
    private int age;

    // 생성자, Getter, Setter
}

List<MemberDTO> resultList = em.createQuery("select new jpql.MemberDTO(m.username, m.age) from Member m", MemberDTO.class)
```
<br/>

## 4. 페이징

JPA는 페이징 방식을 API로 추상화해두었다.  
 - setFirstResult(int startPosition) : 조회 시작 위치(0부터 시작)
 - setMaxResults(int maxResult) : 조회할 데이터 수
```java
 //페이징 쿼리
String jpql = "select m from Member m order by m.name desc";
List<Member> resultList = em.createQuery(jpql, Member.class)
        .setFirstResult(10)
        .setMaxResults(20)
        .getResultList();

/*
// MySQL 방언
SELECT
    M.ID AS ID,
    M.AGE AS AGE,
    M.TEAM_ID AS TEAM_ID,
    M.NAME AS NAME 
FROM
    MEMBER M 
ORDER BY
    M.NAME DESC
LIMIT ?, ?

// Oracle 방언
SELECT *
FROM (
    SELECT ROW_.*, ROWNUM ROWNUM_ 
    FROM (
        SELECT
            M.ID AS ID,
            M.AGE AS AGE,
            M.TEAM_ID AS TEAM_ID,
            M.NAME AS NAME 
        FROM MEMBER M 
        ORDER BY M.NAME 
        ) ROW_ 
    WHERE ROWNUM <= ?
    ) 
WHERE ROWNUM_ > ?
*/
```
<br/>

## 5. 조인

```sql
-- 내부 조인
SELECT m FROM Member m [INNER] JOIN m.team t

-- 외부 조인
SELECT m FROM Member m LEFT [OUTER] JOIN m.team t

-- 세타 조인:
select count(m) from Member m, Team t where m.username = t.name
```
<br/>

### 5-1. JOIN ON 절

JPA 2.1부터 ON 절을 활용한 조인이 지원되었다.  
 - 조인 대상 필터링
 - 연관관계 없는 엔티티 외부 조인(Hibernate 5.1+)
```sql
-- 1. 조인 대상 필터링
-- 회원과 팀을 조인하면서, 팀 이름이 A인 팀만 조인
SELECT m, t FROM Member m LEFT JOIN m.team t ON t.name = 'A'

SELECT m.*, t.* 
FROM Member m 
    LEFT JOIN Team t ON 
        m.TEAM_ID = t.id 
        AND t.name = 'A'

-- 2. 연관관계 없는 엔티티 외부 조인
-- 회원의 이름과 팀의 이름이 같은 대상 외부 조인
SELECT m, t FROM Member m LEFT JOIN Team t on m.username = t.name

SELECT m.*, t.*
FROM Member m
    LEFT JOIN Team t ON m.username = t.name
```
<br/>

## 6. 서브 쿼리

```sql
-- 나이가 평균보다 많은 회원
select m 
from Member m
where m.age > (
        select avg(m2.age)
        from Member m2
    ) 

-- 한 건이라도 주문한 고객
select m 
from Member m
where (
        select count(o)
        from Order o
        where m = o.member
    ) > 0
```
<br/>

### 6-1. 서브 쿼리 지원 함수

 - [NOT] EXISTS (subquery): 서브쿼리에 결과가 존재하면 참
    - {ALL | ANY | SOME} (subquery)
    - ALL 모두 만족하면 참
    - ANY, SOME: 같은 의미, 조건을 하나라도 만족하면 참
 - [NOT] IN (subquery): 서브쿼리의 결과 중 하나라도 같은 것이 있으면 참

<br/>

### 6-2. 서브 쿼리 예제

```sql
-- 팀A 소속인 회원
select m
from Member m
where exists (
        select t 
        from m.team t 
        where t.name = '팀A'
    )

-- 전체 상품 각각의 재고보다 주문량이 많은 주문들
select o
from Order o 
where o.orderAmount > ALL (
        select p.stockAmount 
        from Product p
    )

-- 어떤 팀이든 팀에 소속된 회원
select m
from Member m 
where m.team = ANY (
        select t
        from Team t
    )
```
<br/>

### 6-3. JPA 서브 쿼리 한계

JPA는 WHERE, HAVING 절에서만 서브 쿼리 사용 가능하다.  
즉, FROM절에 사용하는 Inline View 서브 쿼리는 불가능하다.  
 - SELECT 절도 가능(하이버네이트에서 지원)
 - FROM 절의 서브 쿼리는 JPQL에서 불가능하여 대부분 조인으로 풀어서 해결한다.

<br/>

### 6-4. 하이버네이트 6 변경 사항

Hibernate6 부터는 FROM 절의 서브쿼리를 지원한다.  

 - 참고 링크: https://in.relation.to/2022/06/24/hibernate-orm-61-features/
 - 블로그 글: https://goodteacher.tistory.com/641

<br/>

## 7. JPQL 타입 표현과 기타식

### 7-1. JPQL 타입 표현

 - 문자: ‘HELLO’, ‘She’’s’
 - 숫자: 10L(Long), 10D(Double), 10F(Float)
 - Boolean: TRUE, FALSE
 - ENUM: jpabook.MemberType.Admin (패키지명 포함)
 - 엔티티 타입: TYPE(m) = Member (상속 관계에서 사용)
```java
// ENUM 타입 사용 예시(풀 패키지 경로 명시)
String query = "SELECT m.username, 'HELLO', true" +
                "FROM Member m" +
                "WHERE m.type = 패키지.MemberType.ADMIN";

// 상속 관계 엔티티에서 사용 예시
String query2 = "SELECT i FROM Item i WHERE type(i) = Book";
```

<br/>

### 7-2. JPQL 기타

SQL 문법과 같다.  

```
 - EXISTS, IN
 - AND, OR, NOT
 - =, >, >=, <, <=, <>
 - BETWEEN, LIKE, IS NULL, IS NOT NULL
```
<br/>

## 8. 조건식

 - `기본 CASE 식`
    - 기본 CASE 식은 WHEN 절에 조건을 명시할 수 있다.
    - if/else 문처럼 사용할 수 있다.
```sql
select
    case when m.age <= 10 then '학생요금'
         when m.age >= 60 then '경로요금'
         else '일반요금'
    end
from Member m
```
<br/>

 - `단순 CASE 식`
    - 단순 CASE 식은 특정 컬럼이 특정 값에 일치하는지 명시할 수 있다.
    - switch/case 문처럼 사용할 수 있다.
```sql
select
    case t.name 
        when '팀A' then '인센티브110%'
        when '팀B' then '인센티브120%'
        else '인센티브105%'
    end
from Team t
```
<br/>

 - `기타 조건 함수`
    - COALESCE: 하나씩 조회해서 NULL이 아니면 반환, IFNULL 처럼 사용할 수 있다.
    - NULLIF: 두 값이 같으면 NULL 반환, 다르면 첫 번쨰 값 반환
```sql
-- 사용자 이름이 없으면 이름 없는 회원을 반환
select coalesce(m.username,'이름 없는 회원') from Member m

-- 사용자 이름이 ‘관리자’면 null을 반환하고 나머지는 본인의 이름을 반환
select NULLIF(m.username, '관리자') from Member m
```
<br/>

## 9. JPQL 함수

### 9-1. JPQL 기본 함수

아래 함수들은 JPQL에서 제공하는 표준 함수로 데이터베이스에 관계없이 사용할 수 있다.  
DB에서 제공하는 함수나 DB에 사용자가 정의한 함수를 사용하기 위해서는 방언에 등록하여야 한다. 기본적으로 DB에서 제공하는 함수는 방언에 등록되어 있다.  

 - CONCAT: 문자열 더하기
 - SUBSTRING: 문자열 자르기
 - TRIM: 앞뒤 공백 자르기
 - LOWER, UPPER: 소문자, 대문자 변환
 - LENGTH: 문자열 길이 반환
 - LOCATE: 해당 문자열의 시작 위치 반환
 - ABS, SQRT, MOD
 - SIZE, INDEX(JPA 용도): 컬렉션의 크기

<br/>

### 9-2. 사용자 정의 함수

하이버네이트는 사용전에 방언을 추가해야 한다.  


 - `H2Dialect 함수 등록`
    - H2Dialect을 상속받고, 생성자에 등록할 사용자 정의 함수를 정의해준다.
```java
public class MyH2Dialect extends H2Dialect {
    public MyH2Dialect() {
        registerFunction("group_concat", new StandardSQLFunction("group_concat", StandardBasicTypes.STRING));
    }
}
```
<br/>

 - `Hibernate 방언 등록`
    - 새롭게 구현한 MyH2Dialect를 Hibernate 방언 옵션으로 변경해준다.
    - 기본적으로 H2Dialect를 상속받고 있어 기본 제공 함수는 정의되어 있고, 생성자에 새롭게 정의한 함수를 추가적으로 사용할 수 있다.
```xml
<persistence-unit name="hello">
    <properties>
        ..
        <property name="hibernate.dialect" value="패키지.MyH2Dialect">
    </properties>
</persistence-unit>
```
<br/>

 - `사용자 정의 함수 사용`
    - JPA 표준으로 사용자 정의 함수를 사용할 떄 FUNCTION 키워드안에 함수명과 파라미터를 정의해주어야 한다.
    - Hibernate 구현체에서는 함수명을 직접 사용하는 것이 가능하다.
```java
String query = "SELECT FUNCTION('group_concat', m.username) FROM Member m";
String query = "SELECT group_concat(m.username) FROM Member m";
List<String> result = em.createQuery(query, String.class)
        .getResultList();
```

