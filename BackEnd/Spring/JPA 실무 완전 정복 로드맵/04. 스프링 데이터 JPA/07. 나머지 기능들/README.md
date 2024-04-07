# 나머지 기능들

## 1. Specifications(명세)

스프링 데이터 JPA는 JPA Criteria를 활용해서 명세라는 개념을 사용할 수 있도록 지원한다.  

 - __술어(predicate)__
    - 참 또는 거짓으로 평가
    - AND OR 같은 연산자로 조합해서 다양한 검색조건을 쉽게 생성(컴포지트 패턴)
    - 예) 검색 조건 하나하나
    - 스프링 데이터 JPA는 org.springframework.data.jpa.domain.Specification 클래스로 정의

<br/>

### JpaSpecificationExecutor 인터페이스

```java
public interface JpaSpecificationExecutor<T> {
    Optional<T> findOne(@Nullable Specification<T> spec);
    List<T> findAll(Specification<T> spec);
    Page<T> findAll(Specification<T> spec, Pageable pageable);
    List<T> findAll(Specification<T> spec, Sort sort);
    long count(Specification<T> spec);
}
```
<br/>

### 명세 기능 사용 방법

명세 기능을 사용하기 위해서는 JpaSpecificationExecutor 인터페이스를 상속받아야 한다.  

```java
public interface MemberRepository extends JpaRepository<Member, Long>, JpaSpecificationExecutor<Member> {
    // ..
}
```
<br/>

 - `Spec 명세 정의 코드`
    - 명세를 정의하려면 Specification 인터페이스를 구현
    - 명세를 정의할 때는 toPredicate(...) 메서드만 구현하면 되는데 JPA Criteria의 Root, CriteriaQuery, CriteriaBuilder 클래스를 파라미터 제공
```java
public class MemberSpec {
    public static Specification<Member> teamName(final String teamName) {
        return (Specification<Member>) (root, query, builder) -> {
            if (StringUtils.isEmpty(teamName)) {
                return null;
            }
            Join<Member, Team> t = root.join("team", JoinType.INNER); //회원과 조인
            return builder.equal(t.get("name"), teamName);
        };
    }

    public static Specification<Member> username(final String username) {
        return (Specification<Member>) (root, query, builder) ->
            builder.equal(root.get("username"), username);
    }
}
```
<br/>

 - `사용 코드`
    - Specification 을 구현하면 명세들을 조립할 수 있음. where() , and() , or() , not() 제공
    - findAll 을 보면 회원 이름 명세( username )와 팀 이름 명세( teamName )를 and 로 조합해서 검색 조건으로 사용
```java
@Test
public void specBasic() throws Exception {
    //given
    Team teamA = new Team("teamA");
    em.persist(teamA);

    Member m1 = new Member("m1", 0, teamA);
    Member m2 = new Member("m2", 0, teamA);
    em.persist(m1);
    em.persist(m2);
    em.flush();
    em.clear();

    //when
    Specification<Member> spec = MemberSpec.username("m1").and(MemberSpec.teamName("teamA"));
    List<Member> result = memberRepository.findAll(spec);

    //then
    Assertions.assertThat(result.size()).isEqualTo(1);
}
```

<br/>

## 2. Query By Example

 - Probe: 필드에 데이터가 있는 실제 도메인 객체
 - ExampleMatcher: 특정 필드를 일치시키는 상세한 정보 제공, 재사용 가능
 - Example: Probe와 ExampleMatcher로 구성, 쿼리를 생성하는데 사용
```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.transaction.annotation.Transactional;
import study.datajpa.entity.Member;
import study.datajpa.entity.Team;
import javax.persistence.EntityManager;
import java.util.List;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
public class QueryByExampleTest {
    @Autowired MemberRepository memberRepository;
    @Autowired EntityManager em;

    @Test
    public void basic() throws Exception {
        //given
        Team teamA = new Team("teamA");
        em.persist(teamA);
        em.persist(new Member("m1", 0, teamA));
        em.persist(new Member("m2", 0, teamA));
        em.flush();

        //when
        //Probe 생성
        Member member = new Member("m1");
        Team team = new Team("teamA"); //내부조인으로 teamA 가능
        member.setTeam(team);

        //ExampleMatcher 생성, age 프로퍼티는 무시
        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("age");

        Example<Member> example = Example.of(member, matcher);

        List<Member> result = memberRepository.findAll(example);

        //then
        assertThat(result.size()).isEqualTo(1);
    }
}
```
<br/>

### Query By Example 특징

 - __장점__
    - 동적 쿼리를 편리하게 처리
    - 도메인 객체를 그대로 사용
    - 데이터 저장소를 RDB에서 NOSQL로 변경해도 코드 변경이 없게 추상화 되어 있음
    - 스프링 데이터 JPA JpaRepository 인터페이스에 이미 포함
 - __단점__
    - 조인은 가능하지만 내부 조인(INNER JOIN)만 가능함 외부 조인(LEFT JOIN) 안됨
    - 다음과 같은 중첩 제약조건 안됨
        - firstname = ?0 or (firstname = ?1 and lastname = ?2)
    - 매칭 조건이 매우 단순함
        - 문자는 starts/contains/ends/regex
        - 다른 속성은 정확한 매칭( = )만 지원
 - __정리__
    - 실무에서 사용하기에는 매칭 조건이 너무 단순하고, LEFT 조인이 안됨
    - 실무에서는 QueryDSL을 사용하자

<br/>

## 3. Projections

Projections은 엔티티 대신에 DTO를 편리하게 조회할 때 사용된다.  

 - Repository의 반환 타입으로 Porjections를 인지한다.
 - 프로젝션 인터페이스의 Getter를 통해 해당 필드만 선택해서 조회한다.
```java
// 1. 프로젝션용 인터페이스
public interface UsernameOnly {
    String getUsername();
}

// 2. Repository
public interface MemberRepository ... {
    List<UsernameOnly> findProjectionsByUsername(String username);
}

// 테스트 코드
/* 실행 쿼리: select m.username from member m where m.username=‘m1’; */
@Test
public void projections() throws Exception {
    //given
    Team teamA = new Team("teamA");
    em.persist(teamA);

    Member m1 = new Member("m1", 0, teamA);
    Member m2 = new Member("m2", 0, teamA);
    em.persist(m1);
    em.persist(m2);
    em.flush();
    em.clear();

    //when
    List<UsernameOnly> result = memberRepository.findProjectionsByUsername("m1");

    //then
    Assertions.assertThat(result.size()).isEqualTo(1);
}
```
<br/>

### 인터페이스 기반 Open Projections

 - 스프링의 SpEL 문법 지원
 - 다만, SpEL 문법 사용 시 DB에서 엔티티의 모든 정보를 조회하고 계산을 한다.
 - 즉, JPQL SELECT절 최적화가 되지 않는다.
```java
public interface UsernameOnly {
    @Value("#{target.username + ' ' + target.age + ' ' + target.team.name}")
    String getUsername();
}
```
<br/>

### 클래스 기반 Projections

 - 인터페이스가 아닌 구체적인 DTO 형식도 가능하다.
 - 생성자의 파라미터 이름으로 매칭된다.
```java
public class UsernameOnlyDto {
    private final String username;

    public UsernameOnlyDto(String username) {
        this.username = username;
    }

    public String getUsername() {
        return username;
    }
}
```
<br/>

### 동적 Projections

 - Generic Type을 이용하면, 동적으로 프로젝션 데이터 변경이 가능하다.
```java
// Repository
<T> List<T> findProjectionsByUsername(String username, Class<T> type);

// 사용 코드
List<UsernameOnly> result = memberRepository.findProjectionsByUsername("m1", UsernameOnly.class); 
```
<br/>

### 중첩 구조 처리

```java
public interface NestedClosedProjection {

    String getUsername();
    TeamInfo getTeam();

    interface TeamInfo {
        String getName();
    }
}
```
<br/>

### Projections 특징

 - __주의__
    - 프로젝션 대상이 root 엔티티면, JPQL SELECT 절 최적화 가능
    - 프로젝션 대상이 ROOT가 아니면
        - LEFT OUTER JOIN 처리
        - 모든 필드를 SELECT해서 엔티티로 조회한 다음에 계산
 - __정리__
    - 프로젝션 대상이 root 엔티티면 유용하다.
    - 프로젝션 대상이 root 엔티티를 넘어가면 JPQL SELECT 최적화가 안된다!
    - 실무의 복잡한 쿼리를 해결하기에는 한계가 있다.
    - 실무에서는 단순할 때만 사용하고, 조금만 복잡해지면 QueryDSL을 사용하자

<br/>

## 4. 네이티브 쿼리

 - __스프링 데이터 JPA 기반 네이티브 쿼리__
    - 페이징 지원
    - 반환 타입
        - Object[]
        - Tuple
        - DTO(스프링 데이터 인터페이스 Projections 지원)
    - 제약
        - Sort 파라미터를 통한 정렬이 정상 동작하지 않을 수 있음(믿지 말고 직접 처리)
        - JPQL처럼 애플리케이션 로딩 시점에 문법 확인 불가
        - 동적 쿼리 불가

<br/>

### JPA 네이티브 SQL 지원

 - JPQL은 위치 기반 파리미터를 1부터 시작하지만 네이티브 SQL은 0부터 시작
 - 네이티브 SQL을 엔티티가 아닌 DTO로 변환은 하려면
    - DTO 대신 JPA TUPLE 조회
    - DTO 대신 MAP 조회
    - @SqlResultSetMapping -> 복잡
    - Hibernate ResultTransformer를 사용해야함 -> 복잡
    - https://vladmihalcea.com/the-best-way-to-map-a-projection-query-to-a-dto-with-jpa-and-hibernate/
    - 네이티브 SQL을 DTO로 조회할 때는 JdbcTemplate 또는 myBatis 권장
```java
public interface MemberRepository extends JpaRepository<Member, Long> {
    @Query(
        value = "select * from member where username = ?", 
        nativeQuery = true
    )
    Member findByNativeQuery(String username);
}
```
<br/>

### Projections 활용

 - 스프링 데이터 JPA 네이티브 쿼리 + 인터페이스 기반 Projections 활용
```java
@Query(
    value = "SELECT m.member_id as id, m.username, t.name as teamName " +
        "FROM member m left join team t ON m.team_id = t.team_id",
    countQuery = "SELECT count(*) from member",
    nativeQuery = true
)
Page<MemberProjection> findByNativeProjection(Pageable pageable);
```
<br/>

### 동적 네이티브 쿼리

 - 하이버네이트를 직접 활용
 - 스프링 JdbcTemplate, myBatis, jooq같은 외부 라이브러리 사용
```java
//given
String sql = "select m.username as username from member m";

List<MemberDto> result = em.createNativeQuery(sql)
    .setFirstResult(0)
    .setMaxResults(10)
    .unwrap(NativeQuery.class)
    .addScalar("username")
    .setResultTransformer(Transformers.aliasToBean(MemberDto.class))
    .getResultList();

```

