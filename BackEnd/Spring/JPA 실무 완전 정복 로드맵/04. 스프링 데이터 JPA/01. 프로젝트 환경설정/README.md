# 프로젝트 환경설정

## 프로젝트 생성

 - __Spring 프로젝트 만들기__
    - https://start.spring.io
```
 - Project: Gradle
 - Language: Java
 - Spring Boot: 2.2.1
 - Project Metadata:
    - Group: study
    - Artifact: data-jpa
 - Dependencies:
    - Spring Web
    - Spring Data JPA
    - H2 Database
    - Lombok
```
<br/>

 - __IntelliJ 설정__
```
 - Build > Gradle
    - Build and run using: IntelliJ IDEA
    - Run tests using: IntelliJ IDEA

 - Compiler > Annotation Processors
    - Enable annotation processing 체크
```
<br/>

## 라이브러리 살펴보기

 - Gradle 의존 관계 보기
```sh
./gradlew dependencies --configuration compileClasspath
```

### 스프링 부트 라이브러리

 - spring-boot-starter-web
    - spring-boot-starter-tomcat: 톰캣 (웹서버)
    - spring-webmvc: 스프링 웹 MVC
 - spring-boot-starter-data-jpa
    - spring-boot-starter-aop
    - spring-boot-starter-jdbc
        - HikariCP 커넥션 풀 (부트 2.0 기본)
    - hibernate + JPA: 하이버네이트 + JPA
    - spring-data-jpa: 스프링 데이터 JPA
 - spring-boot-starter(공통): 스프링 부트 + 스프링 코어 + 로깅
    - spring-boot
        - spring-core
    - spring-boot-starter-logging
        - logback, slf4j

<br/>

### 테스트 라이브러리

 - spring-boot-starter-test
    - junit: 테스트 프레임워크, 스프링 부트 2.2부터 junit5( jupiter ) 사용
        - 과거 버전은 vintage
    - mockito: 목 라이브러리
    - assertj: 테스트 코드를 좀 더 편하게 작성하게 도와주는 라이브러리
        - https://joel-costigliola.github.io/assertj/index.html
    - spring-test: 스프링 통합 테스트 지원
 - 핵심 라이브러리
    - 스프링 MVC
    - 스프링 ORM
    - JPA, 하이버네이트
    - 스프링 데이터 JPA
 - 기타 라이브러리
    - H2 데이터베이스 클라이언트
    - 커넥션 풀: 부트 기본은 HikariCP
    - 로깅 SLF4J & LogBack
    - 테스트

<br/>

## 스프링 데이터 JPA와 DB 설정, 동작 확인

 - `application.yml`
```yml
spring:
  datasource:
    url: jdbc:h2:tcp://localhost/~/datajpa
    username: sa
    password:
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create
    properties:
      hibernate:
        # show_sql: true
        format_sql: true
logging.level:
  org.hibernate.SQL: debug
  # org.hibernate.type: trace
```
<br/>

 - `Member 엔티티 및 레포지토리`
```java
/* Member */
@Entity
@Getter @Setter
public class Member {
    @Id @GeneratedValue
    private Long id;
    private String username;

    protected Member() {
    }

    public Member(String username) {
        this.username = username;
    }
}

/* MemberJpaRepository: JPA 기반 레포지토리 */
@Repository
public class MemberJpaRepository {
    @PersistenceContext
    private EntityManager em;

    public Member save(Member member) {
        em.persist(member);
        return member;
    }

    public Member find(Long id) {
        return em.find(Member.class, id);
    }
}

/* MemberRepository: 스프링 데이터 JPA 기반 레포지토리 */
public interface MemberRepository extends JpaRepository<Member, Long> {
}
```
<br/>

 - ``
    - 스프링 테스트는 기본적으로 트랜잭션이 종료될 때 롤백을 한다. 즉, 롤백이 되면서 JPA 영속성 컨텍스트에 플러시하지 않고, DB에 아무 처리가 되지 않는다.
    - @Rollback(false) 어노테이션을 정의하면 롤백을 하지 않고 실제로 커밋할 수 있다. 때문에, 실제 DB에 데이터가 쌓인다. (실무에서는 사용 X)
```java
/* MemberJpaRepositoryTest: JPA 기반 테스트 */
@SpringBootTest
@Transactional
@Rollback(false) // 롤백하지 않도록 처리
public class MemberJpaRepositoryTest {

    @Autowired
    MemberJpaRepository memberJpaRepository;

    @Test
    void testMember() {
        Member member = new Member("memberA");
        Member savedMember = memberJpaRepository.save(member);

        Member findMember = memberJpaRepository.find(savedMember.getId());

        assertThat(findMember.getId()).isEqualTo(member.getId());
        assertThat(findMember.getUsername()).isEqualTo(member.getUsername());
        assertThat(findMember).isEqualTo(member); // JPA 엔티티 동일성 보장
    }
}

/* MemberRepositoryTest: 스프링 데이터 JPA 기반 테스트 */
@SpringBootTest
@Transactional
@Rollback(false)
public class MemberRepositoryTest {

    @Autowired
    MemberRepository memberRepository;

    @Test
    void testMember() {
        Member member = new Member("memberA");
        Member savedMember = memberRepository.save(member);

        Member findMember = memberRepository.findById(savedMember.getId()).get();

        assertThat(findMember.getId()).isEqualTo(member.getId());
        assertThat(findMember.getUsername()).isEqualTo(member.getUsername());
        assertThat(findMember).isEqualTo(member); // JPA 엔티티 동일성 보장
    }
}
```
<br/>

### 쿼리 파라미터 로그 남기기

 - 외부 라이브러리: https://github.com/gavlyukovskiy/spring-boot-data-source-decorator
    - 쿼리 파라미터를 로그로 남기는 외부 라이브러리는 시스템 자원을 사용하여, 개발 단계에서는 편하게 사용해도 되지만, 운영시스템에서는 성능 테스트를 하고 사용할지 고려해야 한다.
```
# Spring Boot 2.x
implementation 'com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.5.7'

# Spring Boot 3.x: 1.9 버전 이상
implementation 'com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.9.0'
```

