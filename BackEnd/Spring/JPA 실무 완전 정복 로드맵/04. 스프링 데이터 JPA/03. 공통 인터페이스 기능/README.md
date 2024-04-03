# 공통 인터페이스 기능

## 1. 순수 JPA 기반 레포지토리 만들기

 - `MemberJpaRepository`
```java
import org.springframework.stereotype.Repository;
import study.datajpa.entity.Member;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.List;
import java.util.Optional;
@Repository
public class MemberJpaRepository {

    @PersistenceContext
    private EntityManager em;

    public Member save(Member member) {
        em.persist(member);
        return member;
    }

    public void delete(Member member) {
        em.remove(member);
    }

    public List<Member> findAll() {
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
    }

    public Optional<Member> findById(Long id) {
        Member member = em.find(Member.class, id);
        return Optional.ofNullable(member);
    }

    public long count() {
        return em.createQuery("select count(m) from Member m", Long.class)
                .getSingleResult();
    }

    public Member find(Long id) {
        return em.find(Member.class, id);
    }
}
```
<br/>

 - `TeamRepository`
```java
@Repository
public class TeamRepository {

    @PersistenceContext
    private EntityManager em;

    public Team save(Team team) {
        em.persist(team);
        return team;
    }

    public void delete(Team team) {
        em.remove(team);
    }

    public List<Team> findAll() {
        return em.createQuery("select t from Team t", Team.class)
                .getResultList();
    }

    public Optional<Team> findById(Long id) {
        Team team = em.find(Team.class, id);
        return Optional.ofNullable(team);
    }

    public long count() {
        return em.createQuery("select count(t) from Team t", Long.class)
                .getSingleResult();
    }
}
```
<br/>

### 순수 JPA 기반 레포지토리 테스트

 - `MemberJpaRepositoryTest`
```java
@SpringBootTest
@Transactional
public class MemberJpaRepositoryTest {

    @Autowired
    MemberJpaRepository memberJpaRepository;

    @Test
    public void testMember() {
        Member member = new Member("memberA");
        Member savedMember = memberJpaRepository.save(member);
        Member findMember = memberJpaRepository.find(savedMember.getId());

        assertThat(findMember.getId()).isEqualTo(member.getId());
        assertThat(findMember.getUsername()).isEqualTo(member.getUsername());
        assertThat(findMember).isEqualTo(member); //JPA 엔티티 동일성 보장
    }

    @Test
    public void basicCRUD() {
        Member member1 = new Member("member1");
        Member member2 = new Member("member2");
        memberJpaRepository.save(member1);
        memberJpaRepository.save(member2);

        //단건 조회 검증
        Member findMember1 = memberJpaRepository.findById(member1.getId()).get();
        Member findMember2 = memberJpaRepository.findById(member2.getId()).get();
        assertThat(findMember1).isEqualTo(member1);
        assertThat(findMember2).isEqualTo(member2);

        //리스트 조회 검증
        List<Member> all = memberJpaRepository.findAll();
        assertThat(all.size()).isEqualTo(2);

        //카운트 검증
        long count = memberJpaRepository.count();
        assertThat(count).isEqualTo(2);

        //삭제 검증
        memberJpaRepository.delete(member1);
        memberJpaRepository.delete(member2);
        long deletedCount = memberJpaRepository.count();
        assertThat(deletedCount).isEqualTo(0);
    }
}
```
<br/>

## 2. 공통 인터페이스 설정

 - `AppConfig`
    - 스프링 부트 사용시 @SpringBootApplication 위치를 지정(해당 패키지와 하위 패키지 인식)
    - 만약, 위치가 달라지면 @EnableJpaRepositories 어노테이션으로 정의
```java
@Configuration
@EnableJpaRepositories(basePackages = "jpabook.jpashop.repository")
public class AppConfig {
    // ..
}
```
<br/>

## 3. 공통 인터페이스 적용

스프링 데이터 JPA가 제공하는 공통 인터페이스인 JpaRepository를 상속받으면, 스프링이 해당 인터페이스를 보고 구현체를 만들어준다. 또한, @Repository 어노테이션 생략도 가능하다.  
 - 구현 클래스를 스프링이 만들어준다.
 - @Repository 어노테이션 생략 가능
 - JPA 예외를 스프링 예외로 변환
```java
/* MemberRepository */
public interface MemberRepository extends JpaRepository<Member, Long> {
}

/* TeamRepository */
public interface TeamRepository extends JpaRepository<Team, Long> {
}
```
<br/>

## 4. 공통 인터페이스 분석

 - `JpaRepository`
    - JpaRepository는 PagingAndSortingRepository를 상속받는다.
    - JpaRepository는 org.springframework.data.jpa.repository 패키지에 존재한다.
    - PagingAndSortingRepository는 org.springframework.data.repository 패키지에 존재한다. RDBMS, MongoDB 등 많은 곳에서 공통적으로 사용하기 위해서 해당 패키지에 존재한다.
    - PagingAndSortingRepository는 CrudRepository를 상속받는데, CrudRepository도 org.springframework.data.repository 패키지에 존재한다.
```java
public interface JpaRepository<T, ID extends Serializable> extends PagingAndSortingRepository<T, ID> {
    // ...
}
```

<div align="center">
    <img src="./images/Repository_Architect.PNG">
</div>
<br/>

 - __주요 메서드__
    - __save(S)__: 새로운 엔티티는 저장하고 이미 있는 엔티티는 병합한다.
    - __delete(T)__: 엔티티 하나를 삭제한다. 내부에서 EntityManager.remove() 호출
    - __findById(ID)__: 엔티티 하나를 조회한다. 내부에서 EntityManager.find() 호출
    - __getOne(ID)__: 엔티티를 프록시로 조회한다. 내부에서 EntityManager.getReference() 호출
    - __findAll(…)__: 모든 엔티티를 조회한다. 정렬(Sort)이나 페이징(Pageable) 조건을 파라미터로 제공할 수 있다.

