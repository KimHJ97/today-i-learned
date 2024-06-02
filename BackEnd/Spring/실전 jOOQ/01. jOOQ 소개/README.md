# jOOQ 소개

jOOQ (Java Object Oriented Querying)는 Java를 위한 SQL 빌더 라이브러리입니다. SQL 쿼리를 자바 코드 내에서 타입 안전하게 작성하고 실행할 수 있게 도와줍니다. jOOQ는 SQL과 자바 객체 간의 매핑을 자동화하는 ORM(객체 관계 매핑) 프레임워크와는 다르게, SQL 자체를 직접 자바 코드 내에서 작성하는 것을 지향합니다. 이는 SQL의 강력함을 유지하면서도 타입 안전성과 코드의 가독성을 높이는 데 중점을 둡니다.  

 - __타입 안전성__: jOOQ는 SQL 쿼리를 자바 객체로 빌드하기 때문에, 컴파일 시점에 쿼리의 타입을 확인할 수 있습니다. 이는 런타임 에러를 줄이고, 더 안정적인 코드를 작성할 수 있게 합니다.
 - __SQL 친화성__: jOOQ는 SQL을 최대한 그대로 자바 코드로 표현합니다. 이는 SQL 문법과 기능을 그대로 사용할 수 있게 하여, SQL의 고급 기능들을 쉽게 활용할 수 있게 합니다.
 - __데이터베이스 독립성 및 종속성__: jOOQ는 여러 데이터베이스를 지원하면서도, 특정 데이터베이스에 특화된 기능을 사용할 수 있도록 합니다. 즉, 데이터베이스 독립적인 코드를 작성하면서도, 필요시 특정 데이터베이스의 고유 기능을 활용할 수 있습니다.
 - __자동 코드 생성__: jOOQ는 데이터베이스 스키마로부터 자바 클래스를 자동으로 생성할 수 있습니다. 이를 통해, 데이터베이스 테이블, 열, 관계 등을 자바 코드에서 직접 다룰 수 있게 됩니다.
 - __간편한 통합__: jOOQ는 Spring, Guice와 같은 DI(의존성 주입) 프레임워크와 쉽게 통합될 수 있으며, 트랜잭션 관리, 데이터베이스 연결 풀 등과의 연동도 간편합니다.

<br/>

## 1. 개요

MyBatis를 이용한 기술을 사용하는 경우 과도한 XML 작업, 반복되는 단순 작업, 놓치기 쉬운 오타 등 런타임 시점에 발생할 수 있는 에러와 반복 작업에 직면하게 된다.  
jOOQ는 SQL은 아무 문제가 없고, 작성하는 방식에 문제가 있다는 개념에서 부터 시작되었다.  

<br/>

### jOOQ 사용시 장점

 - 문법 오류를 컴파일 타임에 체크
 - 스키마 구조를 컴파일 타임에 체크
 - 모든 RDBMS의 기능들을 TypeSafe하게 사용

```java
@SpringBootTest
public class PreviewTest {
    @Autowired
    private DSLContext dsl;

    // 1. 조건문 직접 사용
    @Test
    public void test() {
        Actor_ ACTOR = Actor_.ACTOR;

        List<Actor> actors = dsl.selectFrom(ACTOR)
                .where(
                    ACTOR.LAST_NAME.like("%길동%")
                )
                .fetchInto(Actor.class);
    }

    // 2. 조건문 변수로 추출
    @Test
    public void test2() {
        Actor_ ACTOR = Actor_.ACTOR;

        Condition lastNameLike = ACTOR.LAST_NAME.like("%길동%");

        List<Actor> actors = dsl.selectFrom(ACTOR)
                .where(
                    lastNameLike
                )
                .fetchInto(Actor.class);
    }

    // 3. 조건문 함수로 추출
    @Test
    public void test3() {
        Actor_ ACTOR = Actor_.ACTOR;

        List<Actor> actors = dsl.selectFrom(ACTOR)
                .where(
                    likeIfNotEmpty(ACTOR.FIRST_NAME, "%홍%"),
                    likeIfNotEmpty(ACTOR.LAST_NAME, "%길동%")
                )
                .fetchInto(Actor.class);
    }

    private Condition LikeIfNotEmpty(TableField<? extends Record, String> tableField, String param) {
        if (StringUtils.isBlank(param)) {
            return DSL.noCondition();
        }

        return tableField.like("%" + param + "%");
    }
}
```
<br/>

## 2. jOOQ 라이센스

jOOQ는 상용 라이선스와 오픈 소스 라이선스, 두 가지 라이선스 모델을 제공합니다. 각 라이선스는 사용 목적과 환경에 따라 다른 조건을 부과합니다.  

 - MySQL, PostgreSQL과 같이 무료로 사용할 수 있는 RDBMS에 대해서는 자유롭게 사용할 수 있다.
 - Oracle, MSSQL과 같은 상업용 RDBMS에 대해서는 금액을 지불해야 한다.

<br/>

## 3. jOOQ를 사용해야 하는 이유

### 3-1. MyBatis 한계점

 - Runtime에 발생하는 휴먼에러 (Not Type-Safe)
 - Nested Object Mapping 시 발생하는 XML 작업
 - 반복되는 간단한 CRUD 구문
 - 사람이 실수하기 쉬운 Bind Value Index

```java
// Nested Object Mapping 예시
// FilmActorWithActor에 film_actor와 actor 정보를 별도의 객체로 보관하고 싶다.

/*
SELECT
    film.title,
    film.description,
    film.release_year,
    film_actor.actor_id,
    film_actor.film_id,
    film_actor.last_update,
    actor.actor_id AS actor_actor_id,
    actor.first_name AS actor_first_name,
    actor.last_name AS actor_last_name,
    actor.last_update AS actor_last_update
FROM film
    INNER JOIN film_actor
        ON file.file_id = film_actor.film_id
    INNER JOIN actor
        ON film_actor.actor_id = actor.actor_id
ORDER BY film.last_update DESC
LIMIT 10 OFFSET 10;
*/

public class FilmActorInfo {
    private final String title;
    private final String description;
    private final Year releaseYear;
    private final FilmActorWithActor filmActor;
}
```

 - `MyBatis XML`
    - 연관된 매핑 정보릃 하나하나 정의해주어야 한다.
```xml
<!-- FilmActorInfo 클래스 매핑 -->
<resultMap id="FilmActorInfoResultMap" type="com.demo.FilmActorInfo">
    <result property="title" column="title" />
    <result property="description" column="description" />
    <result property="releaseYear" column="release_year" />
    <association
        property="filmActor"
        javaType="com.demo.FilmActorWithActor"
        resultMap="filmActorWithActorResultMap" />
</resultMap>

<!-- FilmActorWithActor 클래스와 filmActorResultMap, actorResultMap 연관 관계 매핑 -->
<resultMap id="filmActorWithActorResultMap" type="com.demo.FilmActorWithActor">
    <association 
        property="filmActor" 
        javaType="com.demo.FilmActor"
        resultMap="filmActorResultMap" />
    <association 
        property="actor" 
        javaType="com.demo.Actor"
        resultMap="actorResultMap" />
</resultMap>

<!-- FilmActor 클래스와 film_actor 테이블 정보 매핑 -->
<resultMap id="filmActorResultMap" type="com.demo.FilmActor">
    <result property="actorId" column="actor_id">
    <result property="firstName" column="first_name">
    <result property="lastName" column="last_name">
    <result property="lastUpdate" column="last_update">
</resultMap>

<!-- Actor 클래스와 actor 테이블 정보 매핑 -->
<resultMap id="actorResultMap" type="com.demo.Actor">
    <result property="actorId" column="actor_actor_id">
    <result property="firstName" column="actor_first_name">
    <result property="lastName" column="actor_last_name">
    <result property="lastUpdate" column="actor_last_update">
</resultMap>
```
<br/>

### 3-2. JPA 한계점

 - __JPA 장점__
    - 패러다임의 불일치 해결
    - 조금 더 객체지향적인 개발 가능
    - 객체 상태를 통한 손쉬운 CUD 작업
 - __JPA 한계__
    - DTO Projection 장점
        - RDBMS 벤더에 의존적이지 않은 쿼리
        - Type-Safe (QueryDSL)
    - DTO Projection 단점
        - 엔티티 매니저를 통한 영속 관리
        - RDBMS 밴더별 전용 기능
        - JPA에서 지원하지 않는 RDBMS의 기능
        - JPA 내부 최적화 기능 (1차 캐시 등)
```java
// 실제 SQL에 LIMIT이 실행되지 않고, 모든 데이터 조회 후 메모리에서 LIMIT 처리 한다.
List<Film> getFilmWithActorListByPlainJpql(int offset, int limit) {
    Query query =
        super.getEntityManager().createQuery(
            """
            SELECT film
            FROM Film film
                INNER JOIN FETCH film.filmFilmActors as filmActor
                INNER JOIN FETCH filmActor.actor as actor
            """
        );

    query.setFirstResult(offset);
    query.setMaxResults(limit);
    return query.getResultList();
}


// 2. Fetch 타입이 LAZY인 경우 쿼리에서 바로 조회하지 않는다.
// 프록시를 통해 사용 시점에 쿼리를 수행한다. (N + 1 문제)
// QueryDSL을 이용한 FETCH JOIN을 사용하여 문제를 해결할 수 있다.
// 하지만, 어느 쿼리는 FETCH JOIN을 사용하고, 어느 쿼리는 LAZY 로딩을 사용하는지 구분하기 어렵다.
// 모든 메서드 구현부를 들어가 찾아보거나, 네이밍 컨벤션을 이용할 수 있지만
// 연관 관계가 많아지면 많아질수록 네이밍으로 해겨하기 어렵다.
@Entity{
    @EmbeddedId
    private FilmActorId filmActorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", /*.. */)
    private Actor actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "film_id", /*.. */)
    private Film film;
}

// 3. NamedEntityGraph
// NamedEntityGraph를 이용하여 연관관계를 미리 정의할 수 있다.
// NamedEntityGraph에 정의된 연관관계는 패치 조인을 하게 된다.
// 하지만, 요구사항이 많아질수록 NamedEntityGraph에 정의되는 내용이 많아질 수 있다.
@Entity
@NamedEntityGraph(
    name = "FilmActor.detail",
    attributeNodes = {
        @NamedAttributeNode("film"),
        @NamedAttributeNode("actor")
    }
)
public class FilmActor {
    // ..
}
```


<br/>

### 3-3. jOOQ의 장점

 - MyBatis를 사용하고 있다면, jOOQ로 100% 대체 가능
 - JPA를 통한 이점은 JPA를 이용하고, Native SQL의 이점은 jOOQ를 이용한다.

