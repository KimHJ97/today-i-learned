# 확장 기능

## 1. 사용자 정의 레포지토리 구현

스프링 데이터 JPA 레포지토리는 인터페이스만 정의하고 구현체는 스프링이 자동으로 생성해준다.  
하지만, 다양한 이유로 인터페이스의 메서드를 직접 구현하고 싶은 경우가 발생할 수 있다.  
 - JPA 직접 사용(EntityManager)
 - 스프링 JDBC Template 사용
 - MyBatis, QueryDSL 사용
 - 데이터베이스 커넥션 직접 사용

<br/>

### 사용자 정의 레포지토리 구현 방법

 - __구현 흐름__
    - 주의점으로는 사용자 정의 구현 클래스의 이름은 Impl로 끝나야 한다.
    - 스프링 데이터 JPA가 인식해서 스프링 빈으로 등록한다.
```
1. 사용자 정의 인터페이스를 만든다.
2. 만든 인터페이스를 구현한 클래스를 만든다.
3. Repository 인터페이스에서 사용자 정의 인터페이스를 상속받는다.
```
<br/>

 - __Impl 이름 변경(XML)__
```xml
<repositories base-package="study.datajpa.repository" repository-impl-postfix="Impl" />
```
<br/>

 - __Impl 이름 변경(Java)__
```java
@EnableJpaRepositories(
    basePackages = "study.datajpa.repository",
    repositoryImplementationPostfix = "Impl"
)
```
<br/>

### 구현 예시

 - `MemberRepository`
```java
// 1. 사용자 정의 인터페이스
public interface MemberRepositorySupport {
    List<Member> findMembers();
}

// 2. 사용자 정의 인터페이스 구현 클래스
@RequiredArgsConstructor
public class MemberRepositorySupportImpl implements MemberRepositorySupport {

    private final EntityManager em;

    @Override
    public List<Member> findMembers() {
        return em.createQuery("select m from Member m")
                .getResultList();
    }
}

// 3. 사용자 정의 인터페이스 상속
public interface MemberRepository extends JpaRepository<Member, Long>, MemberRepositorySupport {
    // ..
}

// 4. 사용자 정의 메서드 호출 코드
List<Member> result = memberRepository.findMembers();
```
<br/>

## 2. Auditing

Auditing은 엔티티를 생성 및 변경할 떄 변경사항을 감시하여 자동으로 변경해주는 기능이다.  
 - 등록일, 수정일, 등록자, 수정자
<br/>

### 2-1. 순수 JPA 사용

 - `엔티티 코드`
    - @PrePersist: 등록전에 수행된다.
    - @PreUpdate: 수정전에 수행된다.
    - 주요 어노테이션: @PrePersist, @PostPersist, @PreUpdate, @PostUpdate
```java
// 1. 베이스 엔티티 정의
@MappedSuperclass
@Getter
public class JpaBaseEntity {
    @Column(updatable = false)
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;

    @PrePersist
    public void prePersist() {
    LocalDateTime now = LocalDateTime.now();
        createdDate = now;
        updatedDate = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedDate = LocalDateTime.now();
    }
}

// 2. 엔티티에 베이스 엔티티 상속
public class Member extends JpaBaseEntity {
    // ..
}
```
<br/>

 - `테스트 코드`
```java
@Test
public void jpaEventBaseEntity() throws Exception {
    //given
    Member member = new Member("member1");
    memberRepository.save(member); //@PrePersist
    Thread.sleep(100);
    member.setUsername("member2");
    em.flush(); //@PreUpdate
    em.clear();

    //when
    Member findMember = memberRepository.findById(member.getId()).get();

    //then
    System.out.println("findMember.createdDate = " +
    findMember.getCreatedDate());
    System.out.println("findMember.updatedDate = " +
    findMember.getUpdatedDate());
}
```
<br/>

### 2-2. 스프링 데이터 JPA 사용

스프링 데이터 JPA에서 Auditing 기능을 사용하기 위해서는 @EnableJpaAuditing 어노테이션을 정의하여 활성화해야 한다. 또한, @EntityListeners(AuditingEntityListener.class)를 필요한 엔티티에 정의하여 감시를 한다.  

 - @EnableJpaAuditing 스프링 부트 설정 클래스에 적용해야함
 - @EntityListeners(AuditingEntityListener.class) 엔티티에 적용
 - 사용 어노테이션: @CreatedDate, @LastModifiedDate, @CreatedBy, @LastModifiedBy

<br/>

```java
// 1. 베이스 엔티티 정의
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
public class BaseEntity {
    // 등록일
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    // 수정일
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    // 등록자
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    // 수정자
    @LastModifiedBy
    private String lastModifiedBy;
}

// 2. Auditing 활성화
@EnableJpaAuditing
@SpringBootApplication
public class DataJpaApplication {
    public static void main(String[] args) {
        SpringApplication.run(DataJpaApplication.class, args);
    }

    // @CreatedBy, @LastModifiedBy 정보 처리
    // 실무에서는 세션 혹은 시큐리티 인증 객체를 통해서 ID를 가져온다.
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.of(UUID.randomUUID().toString());
    }
}
```
<br/>

 - `베이스 엔티티 분리`
    - 등록일, 수정일은 대부분 필요하지만, 등록자와 수정자가 필요없을 수 있다.
    - Base 타입을 분리하고, 원하는 타입을 선택해서 사용하는 방식을 이용한다.
```java
// 등록일, 수정일 베이스 엔티티
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
@Getter
public class BaseTimeEntity {
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
}

// 등록일, 수정일, 등록자, 수정자 베이스 엔티티
@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass
@Getter
public class BaseEntity extends BaseTimeEntity {
    @CreatedBy
    @Column(updatable = false)
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;
}
```
<br/>

#### 전체 적용

엔티티에서 Auditing을 적용하기 위해서는 적용하는 엔티티마다 @EntityListeners(AuditingEntityListener.class)를 정의해야한다.  
모든 엔티티에 리스너를 등록하기는 번거로울 수 있다.  
META-INF의 orm.xml 파일의 옵션을 정의하면, JPA 스팩에서 모든 기능에 Auditing을 모두 실행하도록 할 수 있다.  

 - `META-INF/orm.xml`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<entity-mappings 
    xmlns="http://xmlns.jcp.org/xml/ns/persistence/orm"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence/orm 
        http://xmlns.jcp.org/xml/ns/persistence/orm_2_2.xsd"
    version="2.2">
 <persistence-unit-metadata>
    <persistence-unit-defaults>
        <entity-listeners>
            <entity-listener 
                class="org.springframework.data.jpa.domain.support.AuditingEntityListener"/>
        </entity-listeners>
    </persistence-unit-defaults>
 </persistence-unit-metadata>
 
</entity-mappings>
```
<br/>

## 3. Web 확장 - 도메인 클래스 컨버터

도메인 클래스 컨버터는 HTTP 파라미터로 넘어온 엔티티의 아이디로 엔티티 객체를 찾아서 바인딩해주는 기능을 말한다.  
엔티티의 ID로 요청이 들어올 떄 ID를 받아서 엔티티를 조회할 수 있지만, 엔티티 클래스로 타입을 정의하면 객체를 찾아서 바인딩해준다.  
 - 도메인 클래스 컨버터도 레포지토리를 사용해서 엔티티를 찾는다.
 - ※ 주의점: 도메인 클래스 컨버터로 엔티티를 파라미터로 받으면, 해당 엔티티는 단순 조회용으로만 사용해야 한다. (트랜잭션이 없는 범위에서 엔티티 조회시, 엔티티를 변경해도 DB에 반영되지 않는다.)

```java
// 도메인 클래스 컨버터 사용 전
@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;

    @GetMapping("/members/{id}")
    public String findMember(@PathVariable("id") Long id) {
        Member member = memberRepository.findById(id).get();
        return member.getUsername();
    }
}

// 도메인 클래스 컨버터 사용 후
@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;

    @GetMapping("/members/{id}")
    public String findMember(@PathVariable("id") Member member) {
        return member.getUsername();
    }
}
```
<br/>

## 4. Web 확장 - 페이징과 정렬

스프링 데이터가 제공하는 페이징과 정렬 기능을 스프링 MVC에서 편리하게 사용할 수 있다.  

 - `예제 코드`
    - 파라미터로 Pageable을 받을 수 있다.
    - 요청 파라미터: '/members?page=0&size=3&sort=id,desc&sort=username,desc'
        - page: 현재 페이지, 0부터 시작한다.
        - size: 한 페이지에 노출할 데이터 건수
        - sort: 정렬 조건을 정의한다.
```java
@GetMapping("/members")
public Page<Member> list(Pageable pageable) {
    Page<Member> page = memberRepository.findAll(pageable);
    return page;
}
```
<br/>

### 4-1. 페이지 사이즈 지정

 - `글로벌 설정`
    - 외부 설정 파일(application.yml)에 정의한다.
```property
spring.data.web.pageable.default-page-size=20 /# 기본 페이지 사이즈/
spring.data.web.pageable.max-page-size=2000 /# 최대 페이지 사이즈/
```
<br/>

 - `개별 설정`
    - @PageableDefault 어노테이션을 사용한다.
```java
@RequestMapping(value = "/members_page", method = RequestMethod.GET)
public String list(
    @PageableDefault(
        size = 12, 
        sort = "username", 
        direction = Sort.Direction.DESC) Pageable pageable
) {

    // ...
}
```
<br/>

### 4-2. 접두사

만약, 페이징 정보가 두개 이상이면 접두사로 구분할 수 있다.  
 - @Qualifier 에 접두사명 추가 "{접두사명}_xxx"
 - 예제: /members?member_page=0&order_page=1
```java
public String list(
    @Qualifier("member") Pageable memberPageable,
    @Qualifier("order") Pageable orderPageable
) {
    // ..
}
```
<br/>

### 4-3. Page 내용을 DTO로 변환하기

```java
// 1. 예제용 DTO
@Data
public class MemberDto {
    private Long id;
    private String username;
    public MemberDto(Member m) {
        this.id = m.getId();
        this.username = m.getUsername();
    }
}

// 2-1. Page -> DTO 변환
@GetMapping("/members")
public Page<MemberDto> list(Pageable pageable) {
    Page<Member> page = memberRepository.findAll(pageable);
    Page<MemberDto> pageDto = page.map(MemberDto::new);
    return pageDto;
}

// 2-2. Page -> DTO 변환 최적화
@GetMapping("/members")
public Page<MemberDto> list(Pageable pageable) {
    return memberRepository.findAll(pageable).map(MemberDto::new);
}
```
<br/>

### 4-4. Page를 1부터 시작하기

스프링 데이터 JPA는 기본적으로 Page를 0부터 시작한다.  

 - 1안. Pageable, Page를 파리미터와 응답 값으로 사용히지 않고, 직접 클래스를 만들어서 처리한다. 그리고 직접 PageRequest(Pageable 구현체)를 생성해서 리포지토리에 넘긴다. 물론 응답값도 Page 대신에 직접 만들어서 제공해야 한다.
 - 2안. spring.data.web.pageable.one-indexed-parameters 를 true 로 설정한다. 그런데 이 방법은 web에서 page 파라미터를 -1 처리 할 뿐이다. 따라서 응답값인 Page 에 모두 0 페이지 인덱스를 사용하는 한계가 있다.
