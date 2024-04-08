# 기본 문법

## 1. JPQL vs QueryDSL

 - `QuerydslBasicTest`
    - QueryDSL을 사용하기 위해서는 JPAQueryFactory 객체를 만들어야 한다.
    - JPAQueryFactory는 EntityManager를 기반으로 생성할 수 있다.
    - JPQL: 문자(실행 시점 오류), Querydsl: 코드(컴파일 시점 오류)
    - JPQL: 파라미터 바인딩 직접, Querydsl: 파라미터 바인딩 자동 처리
```java
@SpringBootTest
@Transactional
public class QuerydslBasicTest {

    @PersistenceContext
    EntityManager em;

    @BeforeEach
    public void before() {
        Team teamA = new Team("teamA");
        Team teamB = new Team("teamB");
        em.persist(teamA);
        em.persist(teamB);

        Member member1 = new Member("member1", 10, teamA);
        Member member2 = new Member("member2", 20, teamA);
        Member member3 = new Member("member3", 30, teamB);
        Member member4 = new Member("member4", 40, teamB);
        em.persist(member1);
        em.persist(member2);
        em.persist(member3);
        em.persist(member4);
    }

    @Test
    public void startJPQL() {
        // member1 조회
        String query = "select m from Member m where m.username = :username";
        Member findMember = em.createQuery(query, Member.class)
                .setParameter("username", "member1")
                .getSingleResult();
        
        assertThat(findMember.getUsername()).isEqualTO("member1");
    }

    @Test
    public void startQuerydsl() {
        // member1 조회
        JPAQueryFactory queryFactory = new JPAQueryFactory(em);
        QMember m = new QMember("m");

        Member findMember = queryFactory
                .select(m)
                .from(m)
                .where(m.username.eq("member1"))
                .fetchOne();
        
        assertThat(findMember.getUsername()).isEqualTO("member1");
    }
}
```
<br/>

### JPAQueryFactory를 필드로

 - JPAQueryFactory를 필드로 이동시키고, @BeforeEach에서 초기화한다.
 - JPAQueryFactory는 동시성 문제를 걱정하지 않아도 된다. 동시성 문제는 JPAQueryFactory를 생성할 때 제공하는 EntityManager(em)에 달려있다. 스프링 프레임워크는 여러 쓰레드에서 동시에 같은 EntityManager에 접근해도, 트랜잭션마다 별도의 영속성 컨텍스트를 제공한다.
```java
@SpringBootTest
@Transactional
public class QuerydslBasicTest {
    @PersistenceContext
    EntityManager em;

    JPAQueryFactory queryFactory;

    @BeforeEach
    public void before() {
        queryFactory = new JPAQueryFactory(em);
        //…
    }

    @Test
    public void startQuerydsl2() {
        //member1 조회.
        QMember m = new QMember("m");

        Member findMember = queryFactory
                .select(m)
                .from(m)
                .where(m.username.eq("member1"))
                .fetchOne();

        assertThat(findMember.getUsername()).isEqualTo("member1");
    }
}
```
<br/>

## 2. 기본 Q-Type 활용

Q클래스 인스턴스를 사용하는 방법으로는 2가지가 있다.  

```java
QMember qMember = new QMember("m"); //별칭 직접 지정
QMember qMember = QMember.member; //기본 인스턴스 사용
```
<br/>

 - `기본 인스턴스를 static import와 함께 사용`
```java
import static study.querydsl.entity.QMember.*;

@Test
public void startQuerydsl3() {
    //member1 조회
    Member findMember = queryFactory
            .select(member)
            .from(member)
            .where(member.username.eq("member1"))
            .fetchOne();

    assertThat(findMember.getUsername()).isEqualTo("member1");
}
```
<br/>

 - `application.properties`
    - 아래 설정을 추가하면 실행되는 JPQL을 볼 수 있다.
```property
spring.jpa.properties.hibernate.use_sql_comments: true
```
<br/>

## 3. 검색 조건 쿼리

 - 검색 조건은 .and(), .or()를 메서드 체인으로 연결할 수 있다.
```java
@Test
public void search() {
    Member findMember = queryFactory
            .selectFrom(member)
            .where(
                member.username.eq("member1")
                .and(member.age.eq(10))
            )
            .fetchOne();

    assertThat(findMember.getUsername()).isEqualTo("member1");
}
```
<br/>

### JPQL이 제공하는 모든 검색 조건
```java
member.username.eq("member1") // username = 'member1'
member.username.ne("member1") //username != 'member1'
member.username.eq("member1").not() // username != 'member1'

member.username.isNotNull() //이름이 is not null

member.age.in(10, 20) // age in (10,20)
member.age.notIn(10, 20) // age not in (10, 20)
member.age.between(10,30) //between 10, 30

member.age.goe(30) // age >= 30
member.age.gt(30) // age > 30
member.age.loe(30) // age <= 30
member.age.lt(30) // age < 30

member.username.like("member%") //like 검색
member.username.contains("member") // like ‘%member%’ 검색
member.username.startsWith("member") //like ‘member%’ 검색
```
<br/>

### AND 조건을 파라미터로 처리

 - where()에 파라미터로 검색 조건을 여러개 추가하면 AND 조건이 자동으로 추가된다.
 - 이 경우 null 값은 무시된다.
    - 이 특징을 이용해 동적 쿼리를 깔끔하게 만들 수 있다.
```java
@Test
public void searchAndParam() {
    List<Member> result = queryFactory
            .selectFrom(member)
            .where(
                member.username.eq("member1"),
                member.age.eq(10)
            )
            .fetch();
    
    assertThat(result.size()).isEqualTo(1);
}
```
<br/>

## 4. 결과 조회

 - fetch(): 리스트 조회, 데이터 없으면 빈 리스트 반환
 - fetchOne(): 단 건 조회
    - 결과가 없으면 : null
    - 결과가 둘 이상이면 : com.querydsl.core.NonUniqueResultException
 - fetchFirst() : limit(1).fetchOne()
 - fetchResults() : 페이징 정보 포함, total count 쿼리 추가 실행
 - fetchCount() : count 쿼리로 변경해서 count 수 조회
```java
// List
List<Member> fetch = queryFactory
        .selectFrom(member)
        .fetch();

// 단 건
Member findMember1 = queryFactory
        .selectFrom(member)
        .fetchOne();

// 처음 한 건 조회
Member findMember2 = queryFactory
        .selectFrom(member)
        .fetchFirst();

// 페이징에서 사용
QueryResults<Member> results = queryFactory
        .selectFrom(member)
        .fetchResults();

results.getTotal();
List<Member> content = results.getResults();

// count 쿼리로 변경
long count = queryFactory
        .selectFrom(member)
        .fetchCount();
```
<br/>

## 5. 정렬

 - desc(), asc(): 일반 정렬
 - nullsLast(), nullsFirst(): null 데이터 순서 부여
```java
/**
 * 회원 정렬 순서
 * 1. 회원 나이 내림차순(desc)
 * 2. 회원 이름 올림차순(asc)
 * 단 2에서 회원 이름이 없으면 마지막에 출력(nulls last)
 */
@Test
public void sort() {
    em.persist(new Member(null, 100));
    em.persist(new Member("member5", 100));
    em.persist(new Member("member6", 100));

    List<Member> result = queryFactory
            .selectFrom(emmber)
            .where(member.age.eq(100))
            .orderBy(
                member.age.desc(),
                member.username.asc().nullsLast()
            )
            .fetch();
    
    Member member5 = result.get(0);
    Member member6 = result.get(1);
    Member memberNull = result.get(2);

    assertThat(member5.getUsername()).isEqualTo("member5");
    assertThat(member6.getUsername()).isEqualTo("member6");
    assertThat(memberNull.getUsername()).isNull();
}
```
<br/>

## 6. 페이징

 - offset(), limit()을 이용하여 직접 페이징 처리를 할 수 있다.
 - 페이징 정보가 필요한 경우 fetchResults() 메서드로 수행하면 된다.
```java
// 조회 건수 제한
@Test
public void paging1() {
    List<Member> result = queryFactory
            .selectFrom(member)
            .orderBy(member.username.desc())
            .offset(1) // 0부터 시작(zero index)
            .limit(2) // 최대 2건 조회
            .fetch();
    
    assertThat(result.size()).isEqualTo(2);
}

// 전제 조회수가 필요한 경우
@Test
public void paging2() {
    QueryResults<Member> queryResults = queryFactory
            .selectFrom(member)
            .orderBy(member.username.desc())
            .offset(1) // 0부터 시작(zero index)
            .limit(2) // 최대 2건 조회
            .fetchResults();
    
    assertThat(queryResults.getTotal()).isEqualTo(4);
    assertThat(queryResults.getLimit()).isEqualTo(2);
    assertThat(queryResults.getOffset()).isEqualTo(1);
    assertThat(queryResults.getResults().size()).isEqualTo(2);
}
```
<br/>

## 7. 집합

 - Tuple은 결과를 여러 개의 타입으로 반환받을 때 사용할 수 있다.
```java
@Test
public void aggregation() {
    List<Tuple> result = queryFactory
            .select(
                member.count(),
                member.age.sum(),
                member.age.avg(),
                member.age.max(),
                member.age.min()
            )
            .from(member)
            .fetch();
    
    Tuple tuple = result.get(0);
    assertThat(tuple.get(member.count())).isEqualTo(4);
    assertThat(tuple.get(member.age.sum())).isEqualTo(100);
    assertThat(tuple.get(member.age.avg())).isEqualTo(25);
    assertThat(tuple.get(member.age.max())).isEqualTo(40);
    assertThat(tuple.get(member.age.min())).isEqualTo(10);
}
```
<br/>

### GROUP BY 사용

```java
/**
 * 팀의 이름과 각 팀의 평균 연령 조회
 */
public void group() throws Exception {
    List<Tuple> result = queryFactory
            .select(team.name, member.age.avg())
            .from(member)
            .join(member.team, team)
            .groupBy(team.name)
            .fetch();
    
    Tuple teamA = result.get(0);
    Tuple teamB = result.get(1);

    assertThat(teamA.get(team.name)).isEqualTo("teamA");
    assertThat(teamA.get(member.age.avg())).isEqualTo(15);

    assertThat(teamB.get(team.name)).isEqualTo("teamB");
    assertThat(teamB.get(member.age.avg())).isEqualTo(35);
}
```
<br/>

## 8. 조인 - 기본 조인

조인의 기본 문법은 첫 번쨰 파라미터에 조인 대상을 지정하고, 두 번째 파라미터에 별칭(alias)으로 사용할 Q 타입을 지정하면 된다.  

 - join(조인 대상, 별칭으로 사용할 Q타입)
 - join(), innerJoin(): 내부 조인(inner join)
 - leftJoin(): left 외부 조인(left outer join)
 - rightJoin(): rigth 외부 조인(rigth outer join)
```java
/**
 * 팀 A에 소속된 모든 회원
 */
@Test
public void join() throws Exception {
    QMember member = QMember.member;
    QTeam team = QTeam.team;

    List<Member> result = queryFactory
            .selectFrom(member)
            .join(member.team, team)
            .where(team.name.eq("teamA"))
            .fetch();
    
    assertThat(result)
        .extracting("username")
        .containsExactly("member1", "member2");
}
```
<br/>

 - `세타 조인`
    - 연관관계가 없는 필드로 조인
    - from 절에 여러 엔티티를 선택해서 세타 조인
    - 외부 조인 불가능
```java
/**
 * 세타 조인(연관관계가 없는 필드로 조인)
 * 회원의 이름이 팀 이름과 같은 회원 조회
 */
@Test
public theta_join() throws Exception {
    em.persist(new Member("teamA"));
    em.persist(new Member("teamB"));

    List<Member> result = queryFactory
            .select(member)
            .from(member, team)
            .where(member.username.eq(team.name))
            .fetch();
    
    assertThat(result)
        .extracting("username")
        .containsExactly("teamA", "teamB");
}
```
<br/>

## 9. 조인 - ON 절

ON 절을 활용한 조인은 JPA 2.1부터 지원한다.  
 - 조인 대상 필터링
 - 연관관계 없는 엔티티 외부 조인

<br/>

### 조인 대상 필터링

```java
/**
 * 예) 회원과 팀을 조인하면서, 팀 이름이 teamA인 팀만 조인, 회원은 모두 조회
 * JPQL: SELECT m, t FROM Member m LEFT JOIN m.team t on t.name = 'teamA'
 * SQL: SELECT m.*, t.* FROM Member m LEFT JOIN Team t ON m.TEAM_ID=t.id and  t.name='teamA'
 */
@Test
public void join_on_filtering() {
    List<Tuple> result = queryFactory
            .select(member, team)
            .from(member)
            .leftJoin(member.team, team).on(team.name.eq("teamA"))
            .fetch();
    
    for (Tuple tuple: result) {
        System.out.println("tuple = " + tuple);
    }
}
/* 
    t=[Member(id=3, username=member1, age=10), Team(id=1, name=teamA)]
    t=[Member(id=4, username=member2, age=20), Team(id=1, name=teamA)]
    t=[Member(id=5, username=member3, age=30), null]
    t=[Member(id=6, username=member4, age=40), null]
*/
```
<br/>

### 연관관계 없는 엔티티 외부 조인

 - 하이버네이트 5.1부터 on 을 사용해서 서로 관계가 없는 필드로 외부 조인하는 기능이 추가되었다. 물론 내부 조인도 가능하다.
 -
```java
/**
 * 2. 연관관계 없는 엔티티 외부 조인
 * 예) 회원의 이름과 팀의 이름이 같은 대상 외부 조인
 * JPQL: SELECT m, t FROM Member m LEFT JOIN Team t on m.username = t.name
 * SQL: SELECT m.*, t.* FROM Member m LEFT JOIN Team t ON m.username = t.name
 */
@Test
public void join_on_no_relation() throws Exception {
    em.persist(new Member("teamA"));
    em.persist(new Member("teamB"));

    List<Tuple> result = queryFactory
            .select(member, team)
            .from(member)
            .leftJoin(team).on(member.username.eq(team.name))
            .fetch();

    for (Tuple tuple : result) {
        System.out.println("t=" + tuple);
    }
}
```
<br/>

## 10. 조인 - 패치 조인

패치 조인은 연관된 엔티티를 SQL 한 번에 조회하는 기능이다.  

 - `패치 조인 미적용`
```java
@PersistenceUnit
EntityManagerFactory emf;

@Test
public void fetchJoinNo() throws Exception {
    em.flush();
    em.clear();

    Member findMember = queryFactory
            .selectFrom(member)
            .where(member.username.eq("member1"))
            .fetchone();
    
    boolean loaded = emf.getPersistenceUnitUtil().isLoaded(findMember.getTeam());
    assertThat(loaded).as("페치 조인 미적용").isFalse();
}
```
<br/>

 - `패치 조인 적용`
    - 즉시로딩으로 Member, Team SQL 쿼리 조인으로 한 번에 조회
    - join(), leftJoin() 등 조인 기능 뒤에 fetchJoin() 이라고 추가하면 된다.
```java
@Test
public void fetchJoinUse() throws Exception {
    em.flush();
    em.clear();

    Member findMember = queryFactory
            .selectFrom(member)
            .join(member.team, team).fetchJoin()
            .where(member.username.eq("member1"))
            .fetchone();

    boolean loaded = emf.getPersistenceUnitUtil().isLoaded(findMember.getTeam());
    assertThat(loaded).as("페치 조인 적용").isTrue();
}
```
<br/>

## 11. 서브 쿼리

com.querydsl.jpa.JPAExpressions 사용

 - `WHERE 절에 서브쿼리`
```java
// 나이가 가장 많은 회원 조회
@Test
public void subQuery() {
    QMember memberSub = new QMember("memberSub");

    List<Member> result = queryFactory
            .selectFrom(member)
            .where(
                member.age.eq(
                    JPAExpressions
                        .select(memberSub.age.max())
                        .from(memberSub)
                )
            )
            .fetch();
    
    assertThat(result).extracting("age")
        .containsExactly(40);
}

// 나이가 평균 나이 이상인 회원 조회
@Test
public void subQueryGoe() {
    QMember memberSub = new QMember("memberSub");

    List<Member> result = queryFactory
            .selectFrom(member)
            .where(
                member.age.goe(
                    JPAExpressions
                        .select(memberSub.age.avg())
                        .from(memberSub)
                )
            )
            .fetch();

    assertThat(result).extracting("age")
        .containsExactly(30,40);
}

// 서브쿼리 여러 건 처리 IN 사용
@Test
public void subQueryIn() {
    QMember memberSub = new QMember("memberSub");

    List<Member> result = queryFactory
            .selectFrom(member)
            .where(
                member.age.in(
                    JPAExpressions
                        .select(memberSub.age)
                        .from(memberSub)
                        .where(memberSub.age.gt(10))
                )
            )
            .fetch();

    assertThat(result).extracting("age")
        .containsExactly(20, 30,40);
}
```
<br/>

 - `SELECT 절에 서브쿼리`
```java
@Test
public void selectSubQuery() {
    List<Tuple> fetch = queryFactory
            .select(
                member.username,
                JPAExpressions
                    .select(memberSub.age.avg())
                    .from(memberSub)
            )
            .from(member)
            .fetch();
    
    for (Tuple tuple: fetch) {
        System.out.println("tuple = " + tuple);
    }
}
```
<br/>

### 한계

 - __from 절의 서브쿼리 한계__
    - JPA JPQL 서브쿼리의 한계점으로 from 절의 서브쿼리(인라인 뷰)는 지원하지 않는다. 당연히 Querydsl도 지원하지 않는다. 하이버네이트 구현체를 사용하면 select 절의 서브쿼리는 지원한다. Querydsl도 하이버네이트 구현체를 사용하면 select 절의 서브쿼리를 지원한다.
 - __from 절의 서브쿼리 해결방안__
    - 1안. 서브쿼리를 join으로 변경한다. (가능한 상황도 있고, 불가능한 상황도 있다.)
    - 2안. 애플리케이션에서 쿼리를 2번 분리해서 실행한다.
    - 3안. nativeSQL을 사용한다.

<br/>

## 12. Case 문

CASE문은 SELECT절, WHERE절, ORDER BY절 에서 사용 가능하다.  

```java
// 단순한 조건
@Test
public void basicCase() {
    List<String> result = queryFactory
            .select(
                member.age
                    .when(10).then("열살")
                    .when(20).then("스무살")
                    .otherwise("기타")
            )
            .from(member)
            .fetch();
}

// 복잡한 조건
@Test
public void complexCase() {
List<String> result = queryFactory
        .select(
            new CaseBuilder()
                .when(member.age.between(0, 20).then("0~20살"))
                .when(member.age.between(21, 30).then("21~30살"))
                .otherwise("기타")
        )
        .from(member)
        .fetch();
}
```
<br/>

 - `ORDER BY절에서 CASE문 함께 사용하기 예제`
    - 0 ~ 30살이 아닌 회원을 가장 먼저 출력
    - 0 ~ 20 살 회원 출력
    - 21 ~ 30살 회원 출력
```java
NumberExpression<Integer> rankPath = new CaseBuilder()
    .when(member.age.between(0, 20)).then(2)
    .when(member.age.between(21, 30)).then(1)
    .otherwise(3);

List<Tuple> result = queryFactory
    .select(member.username, member.age, rankPath)
    .from(member)
    .orderBy(rankPath.desc())
    .fetch();

for (Tuple tuple : result) {
    String username = tuple.get(member.username);
    Integer age = tuple.get(member.age);
    Integer rank = tuple.get(rankPath);
    System.out.println("username = " + username + " age = " + age + " rank = " + rank);
}

/*
username = member4 age = 40 rank = 3
username = member1 age = 10 rank = 2
username = member2 age = 20 rank = 2
username = member3 age = 30 rank = 1
*/
```
<br/>

## 13. 상수, 문자 더하기

 - `상수`
    - Expressions.constant()를 이용하여 상수를 사용할 수 있다.
    - 최적화가 가능하면 SQL에 constant 값을 넘기지 않는다. 만약, 상수를 더하거나 연산을 하는 등 최적화가 어려운 경우에는 constant 값이 SQL에 넘어간다.
```java
@Test
public void constant() {
    List<Tuple> result = queryFactory
            .select(
                member.username,
                Expressions.constant("A")
            )
            .from(member)
            .fetch();
    
    for (Tuple tuple: result) {
        System.out.println("tuple = " + tuple);
    }
}
```
<br/>

 - `문자 더하기(CONCAT)`
    - member.age는 int 형이므로 stringValue() 함수를 이용한다.
    - 문자가 아닌 다른 타입들은 stringValue()로 문자로 변환할 수 있다. (ENUM 처리)
```java
@Test
public void concat() {
    List<String> result = queryFactory
            .select(
                member.username.concat("_".concat(member.age.stringValue()))
            )
            .from(member)
            .where(member.username.eq("member1"))
            .fetch();

    for (String s: result) {
        System.out.println("s = " + s);
    }
}
```

