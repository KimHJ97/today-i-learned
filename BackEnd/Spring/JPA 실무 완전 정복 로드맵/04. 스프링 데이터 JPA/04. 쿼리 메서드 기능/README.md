# 쿼리 메서드 기능

## 1. 메소드 이름으로 쿼리 생성

스프링 데이터 JPA는 메서드 이름 규칙으로 쿼리를 자동으로 만들어주는 기능을 제공한다.  

 - `이름과 나이를 기준으로 회원 조회`
```java
// 순수 JPA 레포지토리
public List<Member> findByUsernameAndAgeGreaterThan(String username, int age) {
    return em.createQuery("select m from Member m where m.username = :username and m.age > :age")
        .setParameter("username", username)
        .setParameter("age", age)
        .getResultList();
}

// 스프링 데이터 JPA 레포지토리
public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByUsernameAndAgeGreaterThan(String username, int age);
}
```
<br/>

 - __스프링 데이터 JPA가 제공하는 쿼리 메서드 기능__
    - 공식 문서: https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html#jpa.query-methods.query-creation
```
조회: find…By, read…By, query…By, get…By
COUNT: count…By 반환타입 long
EXISTS: exists…By 반환타입 boolean
삭제: delete…By, remove…By 반환타입 long
DISTINCT: findDistinct, findMemberDistinctBy
LIMIT: findFirst3, findFirst, findTop, findTop3
```
<br/>

## 2. JPA NamedQuery

엔티티 클래스 내부에 @NamedQuery 어노테이션으로 특정 이름의 쿼리를 지정할 수 있다.  
스프링 데이터 JPA에서 제공하는 JpaRepository 상속받은 인터페이스에서 메소드 위에 @Query(name = "이름")을 지정하여 해당 네임드 쿼리를 수행하도록 할 수 있다.  
 - @Query 어노테이션이 없어도, 해당 엔티티 클래스에 메서드명과 동일한 네임드 쿼리가 존재하면 네임드 쿼리가 수행된다.
 - @Query 어노테이션이 없고, 해당 메서드명의 네임드 쿼리가 없는 경우 JPA의 쿼리 메서드로 실행한다. 즉, 네임드 쿼리가 1순위이고 쿼리 메서드가 2순위이다.

```java
/* Member 엔티티 */
@Entity
@NamedQuery(
    name="Member.findByUsername",
    query="select m from Member m where m.username = :username"
)
public class Member {
 ...
}

/* JPA를 직접 사용해서 Named 쿼리 호출 */
public class MemberRepository {
    public List<Member> findByUsername(String username) {
        List<Member> resultList = em.createNamedQuery("Member.findByUsername", Member.class)
                .setParameter("username", username)
                .getResultList();
    }
} 

/* 스프링 데이터 JPA로 NamedQuery 사용 */
public interface MemberRepository extends JpaRepository<Member, Long> {
    @Query(name = "Member.findByUsername")
    List<Member> findByUsername(@Param("username") String username);
} 
```
<br/>

## 3. @Query

스프링 데이터 JPA는 레포지토리에 JPQL 쿼리를 작성하여 사용할 수 있는 기능을 제공한다.  
 - @org.springframework.data.jpa.repository.Query 어노테이션을 사용
 - JPA Named Query와 동일하게 실행 시점에 문법 오류를 발견할 수 있다.

```java
public interface MemberRepository extends JpaRepository<Member, Long> {
    @Query("select m from Member m where m.username= :username and m.age = :age")
    List<Member> findUser(@Param("username") String username, @Param("age") int age);
}
```
<br/>

### @Query: 값, DTO 조회하기

```java
// 단순 값 하나 조회
@Query("select m.username from Member m")
List<String> findUsernameList();

// DTO로 직접 조회
// DTO로 조회시 new 키워드를 사용한다. DTO에 해당 생성자가 필요하다.
@Query("select new study.datajpa.dto.MemberDto(m.id, m.username, t.name) " +
         "from Member m join m.team t")
List<MemberDto> findMemberDto();

/* MemberDto */
@Data
public class MemberDto {
    private Long id;
    private String username;
    private String teamName;
    public MemberDto(Long id, String username, String teamName) {
        this.id = id;
        this.username = username;
        this.teamName = teamName;
    }
}
```
<br/>

## 4. 파라미터 바인딩

파라미터 바인딩에는 위치 기반과 이름 기반 2가지가 존재한다.  
코드 가독성과 유지보수를 위해 이름 기반 파라미터 바인딩을 사용하는 것이 권장된다.  

```sql
select m from Member m where m.username = ?0 -- 위치 기반
select m from Member m where m.username = :name -- 이름 기반
```
<br/>

 - `파라미터 바인딩`
```java
import org.springframework.data.repository.query.Param;

public interface MemberRepository extends JpaRepository<Member, Long> {
    @Query("select m from Member m where m.username = :name")
    Member findMembers(@Param("name") String username); 
}
```
<br/>

 - `컬렉션 파라미터 바인딩`
```java
@Query("select m from Member m where m.username in :names")
List<Member> findByNames(@Param("names") List<String> names);
```
<br/>

## 5. 반환 타입

스프링 데이터 JPA는 유연한 반환 타입을 지원한다.  

```
void, Primitives, Wrapper types, T
Iterator<T>, Collection<T>, List<T>, Optional<T>, Option<T>
Stream<T>, Streamable<T>, Future<T>, CompletableFuture<T>
ListenableFuture, Slice, Page<T>, GeoResult<T>, GeoResults<T>, GeoPage<T>
Flux<T>, Mono<T>, Single<T>, Maybe<T>, Flowable<T>
```
<br/>


 - 반환 타입 List
    - 만약, 조회 결과가 없는 경우 빈 컬렉션을 반환한다.
 - 반환 타입 단건
    - 만약, 조회 결과가 없는 경우 null을 반환한다.
    - 결과가 2건 이상인 경우 javax.persistence.NonUniqueResultException 예외가 발생한다.
 - 참고
    - 단건으로 지정한 메서드 호출시 스프링 데이터 JPA는 내부적으로 JPQL의 Query.getSingleResult() 메서드를 호출한다.
    - 해당 메서드는 조회 결과가 없는 경우 javax.persistence.NoResultException 예외를 발생시키는데, 스프링 데이터 JPA는 예외 발생 시 Null을 반환하도록 되어있다.
```java
public interface MemberRepository extends JpaRepository<Member, Long> {

    // ..

    List<Member> findByUsername(String name); //컬렉션
    Member findByUsername(String name); //단건
    Optional<Member> findByUsername(String name); //단건 Optional
}
```
<br/>

## 6. 순수 JPA 페이징과 정렬

 - `MemberJpaRepository`
```java
@Repository
public class MemberJpaRepository {

    @PersistenceContext
    private EntityManager em;

    // ..

    public List<Member> findByPage(int age, int offset, int limit) {
        return em.createQuery("select m from Member m where m.age = :age order by m.username desc")
            .setParameter("age", age)
            .setFirstResult(offset)
            .setMaxResults(limit)
            .getResultList();
    }

    public long totalCount(int age) {
        return em.createQuery("select count(m) from Member m where m.age = :age", 
    Long.class)
            .setParameter("age", age)
            .getSingleResult();
    }
}
```
<br/>

 - `MemberJpaRepositoryTest`
```java
@Test
public void paging() throws Exception {
    // Given
    memberJpaRepository.save(new Member("member1", 10));
    memberJpaRepository.save(new Member("member2", 10));
    memberJpaRepository.save(new Member("member3", 10));
    memberJpaRepository.save(new Member("member4", 10));
    memberJpaRepository.save(new Member("member5", 10));

    int age = 10;
    int offset = 0;
    int limit = 3;

    // When
    List<Member> members = memberJpaRepository.findByPage(age, offset, limit);
    long totalCount = memberJpaRepository.totalCount(age);

    // Then
    assertThat(members.size()).isEqualTo(3);
    assertThat(totalCount).isEqualTo(5);
}
```
<br/>

## 7. 스프링 데이터 JPA 페이징과 정렬

스프링 데이터 JPA는 페이징과 정렬을 표준화시켜 기능을 제공한다.  
파라미터로 페이징 여부가 지정되고, 반환 타입으로 TotalCount를 구하기 위한 COUNT 쿼리가 수행되는지 결정된다.  

 - __페이징과 정렬 파라미터__
    - org.springframework.data.domain.Sort: 정렬 기능
    - org.springframework.data.domain.Pageable: 페이징 기능 (내부에 Sort 포함)
 - __특별한 반환 타입__
    - org.springframework.data.domain.Page: 추가 count 쿼리 결과를 포함하는 페이징
    - org.springframework.data.domain.Slice: 추가 count 쿼리 없이 다음 페이지만 확인 가능(내부적으로 limit + 1조회)
    - List(자바 컬렉션): 추가 count 쿼리 없이 결과만 반환

```java
Page<Member> findByUsername(String name, Pageable pageable); //count 쿼리 사용
Slice<Member> findByUsername(String name, Pageable pageable); //count 쿼리 사용 안함
List<Member> findByUsername(String name, Pageable pageable); //count 쿼리 사용 안함
List<Member> findByUsername(String name, Sort sort);
```
<br/>

### 페이징 예시

 - `MemberRepository`
```java
public interface MemberRepository extends Repository<Member, Long> {
    Page<Member> findByAge(int age, Pageable pageable);

    // COUNT 쿼리 분리: COUNT 쿼리에서는 JOIN이 필요없다.
    @Query(
        value = "select m from Member m", 
        countQuery = "select count(m.username) from Member m"
    )
    Page<Member> findMemberAllCountBy(Pageable pageable);
}
```
<br/>

 - `MemberRepositoryTest`
    - 파라미터로 Pageable을 넘기면, 페이징 쿼리를 수행한다. Pageable에는 page, size, Sort 정보를 넘긴다.
    - 반환 타입을 Page로 받으면, 내부적으로 COUNT(*) 쿼리를 호출하여 TotalCount에 대한 정보를 갖고 있다.
    - Page의 getContent() 함수를 호출하면 조회한 내용을 얻을 수 있다.
```java
@Test
public void paging() throws Exception {
    // Given
    memberJpaRepository.save(new Member("member1", 10));
    memberJpaRepository.save(new Member("member2", 10));
    memberJpaRepository.save(new Member("member3", 10));
    memberJpaRepository.save(new Member("member4", 10));
    memberJpaRepository.save(new Member("member5", 10));

    int age = 10;
    PageRequest pageRequest = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "username"));

    // When
    Page<Member> page = memberJpaRepository.findByPage(age, pageRequest);

    // Then
    List<Member> content = page.getContent();
    long totalElements = page.getTotalElements();

    for (Member member: content) {
        System.out.println("member = " + member);
    }

    assertThat(content.size()).isEqualTo(3); //조회된 데이터 수
    assertThat(page.getTotalElements()).isEqualTo(5); //전체 데이터 수
    assertThat(page.getNumber()).isEqualTo(0); //페이지 번호
    assertThat(page.getTotalPages()).isEqualTo(2); //전체 페이지 번호
    assertThat(page.isFirst()).isTrue(); //첫번째 항목인가?
    assertThat(page.hasNext()).isTrue(); //다음 페이지가 있는가?
}
```
<br/>

### Page와 Slice 인터페이스

 - `Slice 인터페이스`
```java
public interface Slice<T> extends Streamable<T> {
    int getNumber(); //현재 페이지
    int getSize(); //페이지 크기
    int getNumberOfElements(); //현재 페이지에 나올 데이터 수
    List<T> getContent(); //조회된 데이터
    boolean hasContent(); //조회된 데이터 존재 여부
    Sort getSort(); //정렬 정보
    boolean isFirst(); //현재 페이지가 첫 페이지 인지 여부
    boolean isLast(); //현재 페이지가 마지막 페이지 인지 여부
    boolean hasNext(); //다음 페이지 여부
    boolean hasPrevious(); //이전 페이지 여부
    Pageable getPageable(); //페이지 요청 정보
    Pageable nextPageable(); //다음 페이지 객체
    Pageable previousPageable();//이전 페이지 객체
    <U> Slice<U> map(Function<? super T, ? extends U> converter); //변환기
}
```
<br/>

 - `Page 인터페이스`
    - Slice에서 제공되는 메서드 모두 사용가능하며, COUNT() 쿼리가 수행되어 전체 행의 갯수를 조회하는 TotalCount 관련 메서드가 추가되었다.
```java
public interface Page<T> extends Slice<T> {
    int getTotalPages(); //전체 페이지 수
    long getTotalElements(); //전체 데이터 수
    <U> Page<U> map(Function<? super T, ? extends U> converter); //변환기
}
```
<br/>

## 8. 벌크성 수정 쿼리

 - `JPA를 사용한 벌크성 수정 쿼리`
    - 회원의 나이를 한 번에 바꾸기
```java
public int bulkAgePlus(int age) {
    return em.createQuery(
            "update Member m set m.age = m.age + 1" +
            "where m.age >= :age"
        )
        .setParameter("age", age)
        .executeUpdate();
}

// 테스트 코드
@Test
public void bulkUpdate() throws Exception {
    //given
    memberJpaRepository.save(new Member("member1", 10));
    memberJpaRepository.save(new Member("member2", 19));
    memberJpaRepository.save(new Member("member3", 20));
    memberJpaRepository.save(new Member("member4", 21));
    memberJpaRepository.save(new Member("member5", 40));

    //when
    int resultCount = memberJpaRepository.bulkAgePlus(20);

    //then
    assertThat(resultCount).isEqualTo(3);
}
```
<br/>

 - `스프링 데이터 JPA를 사용한 벌크성 수정 쿼리`
    - @Modifying 어노테이션을 적용하여야 벌크성 수정이 발생한다.
    - 만약, 어노테이션이 없으면 org.hibernate.hql.internal.QueryExecutionRequestException 예외 발생
    - __주의사항__: 벌크 연산은 영속성 컨텍스트를 무시하고 실행한다. 떄문에, 영속성 컨텍스트에 있는 엔티티의 상태와 DB에 엔티티 상태가 다를 수 있다.
        - 1안. 영속성 컨텍스트에 엔티티가 없는 상태에서 벌크 연산을 먼저 실행
        - 2안. 부득이하게 영속성 컨텍스트에 엔티티가 있으면 벌크 연산 직후 영속성 컨텍스트를 초기화한다. (em.flush(), em.clear())
        - 3안. @Modifying(clearAutomatically = true) 옵션을 정의하면, 해당 쿼리가 수행되고 clear()가 자동으로 수행된다.
```java
@Modifying
@Query("update Member m set m.age = m.age + 1 where m.age >= :age")
int bulkAgePlus(@Param("age") int age);

// 테스트 코드
@Test
public void bulkUpdate() throws Exception {
    //given
    memberRepository.save(new Member("member1", 10));
    memberRepository.save(new Member("member2", 19));
    memberRepository.save(new Member("member3", 20));
    memberRepository.save(new Member("member4", 21));
    memberRepository.save(new Member("member5", 40));

    //when
    int resultCount = memberRepository.bulkAgePlus(20);

    //then
    assertThat(resultCount).isEqualTo(3);
}
```
