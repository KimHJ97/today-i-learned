# 회원 도메인 개발

 - `Member 엔티티`
```java
@Entity
@Getter @Setter
public class Member {

    @Id @GeneratedValue
    @Column(name = "member_id")
    private Long id;

    private String name;

    @Embedded
    private Address address;

    @JsonIgnore
    @OneToMany(mappedBy = "member")
    private List<Order> orders = new ArrayList<>();

}
```

## 1. 회원 레포지토리 개발

 - `MemberRepository`
    - @Repository: 스프링 빈으로 등록, JPA 예외를 스프링 기반 예외로 예외 변환
    - @PersistenceContext: 엔티티 메니저( EntityManager ) 주입
    - @PersistenceUnit: 엔티티 메니터 팩토리( EntityManagerFactory ) 주입
```java
@Repository
public class MemberRepository {

    @PersistenceContext
    private EntityManager em;

    public void save(Member member) {
        em.persist(member);
    }

    public Member findOne(Long id) {
        return em.find(Member.class, id);
    }

    public List<Member> findAll() {
        return em.createQuery("SELECT m FROM Member m", Member.class)
                .getResultList();
    }

    public List<Member> findByName(String name) {
        return em.createQuery("SELECT m FROM Member m WHERE m.name = :name")
                .setParameter("name", name)
                .getResultList();
    }
}
```
<br/>

## 2. 회원 서비스 개발

 - `MemberService`
    - @Transactional의 readOnly 옵션을 True로 하면, 읽기 전용 메서드로 실행된다. 즉, 영속성 컨텍스트를 플러시하지 않으므로 읽기 성능이 향상된다.
    - 클래스 위에 @Transactional을 읽기 모드로 정의하고, 변경 작업이 필요한 곳에 따로 @Transactional을 정의하여 쓰기를 사용하도록 한다.
```java
@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class MemberService {

    private final MemberRepository memberRepository;

    /*
     * 회원 가입
     */
    @Transactional
    public Long join(Member member) {
        validateDuplicateMember(member);
        memberRepository.save(member);
        return member.getId();
    }

    private void validateDuplicateMember(Member member) {
        List<Member> findMembers = memberRepository.findByName(member.getName());
        if (!findMembers.isEmpty()) {
            throw new IllegalStateException("이미 존재하는 회원입니다.");
        }
    }

    /*
     * 전체 회원 조회
     */
    public List<Member> findMembers() {
        return memberRepository.findAll();
    }

    /*
     * 단일 회원 조회
     */
    public Member findOne(Long memberId) {
        return memberRepository.findOne(memberId);
    }
}
```
<br/>

## 3. 회원 기능 테스트

 - `MemberServiceTest`
    - @RunWith(SpringRunner.class): 스프링과 테스트 통합
    - @SpringBootTest: 스프링 부트를 띄운다. (@Autowired를 사용하기 위해서 필요하다.)
```java
@RunWith(SpringRunner.class)
@SpringBootTest
@Transactional // Test에서 해당 어노테이션 사용시 기본 Rollback 된다.
public class MemberServiceTest {

    @Autowired
    MemberService memberService;

    @Autowired
    MemberRepository memberRepository;

    @Test
    public void 회원가입() throws Exception {
        // Given
        Member member = new Member();
        member.setName("kim");

        // When
        Long saveId = memberService.join(member);

        // Then
        assertEquals(member, memberRepository.findOne(saveId));
    }

    @Test(expected = IllegalStateException.class)
    public void 중복_회원_예외() throws Exception {
        // Given
        Member member1 = new Member();
        member1.setName("kim");

        Member member2 = new Member();
        member2.setName("kim");

        // When
        memberService.join(member1);
        memberService.join(member2); // 예외가 발생해야 한다.

        // Then
        fail("에외가 발생해야 한다.");
    }
}
```
<br/>

### 3-1. 테스트 케이스를 위한 설정

테스트 케이스는 격리된 환경에서 실행하고, 끝나면 데이터를 초기화하는 것이 좋다. 떄문에, 메모리 DB를 사용하는 것이 편리하다.  

추가적으로 테스트 케이스를 위한 스프링 환경과 일반적으로 애플리케이션을 실행하는 환경은 다르다. 떄문에, 설정 파일을 다르게 사용한다.  

__스프링 환경의 테스트 코드를 실행하면 '/test/resources/application.yml' 파일을 읽는다. 만약, 해당 위치에 설정 파일이 없으면 '/src/resources/application.yml' 파이을 읽게 된다.__  

스프링 부트는 datasource 설정이 없으면, 기본적으로 메모리 DB를 사용하고, driver-class도 현재 등록된 라이브러리를 보고 찾아준다. 추가적으로 ddl-auto 옵션도 create-drop 모드로 동작한다. 따라서, 데이터소스나 JPA 관련된 별도의 추가 설정을 하지 않아도 된다.  

 - `test/resources/application.yml`
```yml
spring:
#  datasource:
#    url: jdbc:h2:mem:testdb
#    username: sa
#    password:
#    driver-class-name: org.h2.Driver

#  jpa:
#    hibernate:
#      ddl-auto: create
#    properties:
#      hibernate:
#        show_sql: true
#        format_sql: true
#    open-in-view: false

logging.level:
  org.hibernate.SQL: debug
#  org.hibernate.type: trace
```
