# 스프링 데이터 JPA가 제공하는 QueryDSL 기능

스프링 데이터 JPA가 QueryDSL을 위한 기능을 몇가지 제공한다.  
하지만, 제약이 커서 복잡한 실무 환경에서는 사용하기에는 어렵다.  

<br/>

## 1. 인터페이스 지원 - QuerydslPredicateExecutor

 - `QuerydslPredicateExecutor 인터페이스`
    - 공식 문서: https://docs.spring.io/spring-data/jpa/docs/2.2.3.RELEASE/reference/html/#core.extensions.querydsl
```java
public interface QuerydslPredicateExecutor<T> {
    Optional<T> findById(Predicate predicate); 
    Iterable<T> findAll(Predicate predicate); 
    long count(Predicate predicate); 
    boolean exists(Predicate predicate); 
    // … more functionality omitted.
}
```
<br/>

### 예제 코드

 - `MemberRepository`
    - QuerydslPredicateExecutor를 상속받는다.
```java
interface MemberRepository extends JpaRepository<User, Long>, QuerydslPredicateExecutor<User> {
    // ..
}
```
<br/>

 - `테스트 코드`
```java
@Test
public void querydslPredicateExecutorTest() {
    // Given
    // ..

    QMember member = QMember.member;
    Iterable result = memberRepository.findAll(
        member.age.between(10, 40)
        .and(member.username.eq("member1"))
    );
}
```
<br/>

### 한계점

 - 조인X (묵시적 조인은 가능하지만 left join이 불가능하다.)
 - 클라이언트가 Querydsl에 의존해야 한다. 서비스 클래스가 Querydsl이라는 구현 기술에 의존해야 한다.
 - 복잡한 실무환경에서 사용하기에는 한계가 명확하다.

<br/>

## 2. QueryDSL Web 지원

 - 공식 문서: https://docs.spring.io/spring-data/jpa/docs/2.2.3.RELEASE/reference/html/#core.web.type-safe

```java
// @QuerydslPredicate 어노테이션으로 엔티티 클래스를 정의하면, 
// 넘어오는 파라미터를 QueryDSL 조건으로 바인딩해준다.
// ?firstname=Dave&lastname=Matthews
// QUser.user.firstname.eq("Dave").and(QUser.user.lastname.eq("Matthews"))

@Controller
class UserController {

    @Autowired UserRepository repository;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    String index(Model model, @QuerydslPredicate(root = User.class) Predicate predicate,    
            Pageable pageable, @RequestParam MultiValueMap<String, String> parameters) {

        model.addAttribute("users", repository.findAll(predicate, pageable));

        return "index";
    }
}

interface UserRepository extends CrudRepository<User, String>,
                                 QuerydslPredicateExecutor<User>,
                                 QuerydslBinderCustomizer<QUser> {               

    @Override
    default void customize(QuerydslBindings bindings, QUser user) {

        bindings.bind(user.username).first((path, value) -> path.contains(value))    
        bindings.bind(String.class)
        .first((StringPath path, String value) -> path.containsIgnoreCase(value)); 
        bindings.excluding(user.password);                                           
    }
}
```

### 한계점

 - 단순한 조건만 가능
 - 조건을 커스텀하는 기능이 복잡하고 명시적이지 않음
 - 컨트롤러가 Querydsl에 의존
 - 복잡한 실무환경에서 사용하기에는 한계가 명확

<br/>

## 3. 레포지토리 지원 - QuerydslRepositorySupport

 - `MemberRepositoryImpl`
    - QuerydslRepositorySupport를 상속받는다.
        - 
    - from() 메서드부터 시작된다.
        - 기존의 QueryDSL 3.x에서는 from() 절부터 시작하여 마지막에 select() 메서드를 실행한다.
        - QueryDSL 4.x부터 QueryFactory를 제공하여 SQL 형식으로 실행한다.
```java
public class MemberRepositoryImpl extends QuerydslRepositorySupport implements MemberRepositoryCustom {

    // ..

    PUBLIC MemberRepositoryImpl() {
        super(Member.class);
    }

    @Override
    public List<MemberTeamDto> search(MemberSearchCondition condition) {
        EntityManager entityManager = getEntityManager();

        List<MemberTeamDto> result = from(member)
                .leftJoin(member.team, team)
                .where(
                    usernameEq(condition.getUsername()),
                    teamNameEq(condition.getTeamName()),
                    ageGoe(condition.getAgeGoe()),
                    ageLoe(condition.getAgeLoe())
                )
                .select(
                    new QMemberTeamDto(
                        member.id,
                        member.username,
                        member.age,
                        team.id,
                        team.name
                    )
                )
    }

    @Override
    public Page<MemberTeamDto> searchPageSimple(MemberSearchCondition condition, Pageable pageable) {
        JPQLQuery<MemberTeamDto> jpaQuery = from(member)
                .leftJoin(member.team, team)
                .where(
                    usernameEq(condition.getUsername()),
                    teamNameEq(condition.getTeamName()),
                    ageGoe(condition.getAgeGoe()),
                    ageLoe(condition.getAgeLoe())
                )
                .select(
                    new QMemberTeamDto(
                        member.id,
                        member.username,
                        member.age,
                        team.id,
                        team.name
                    )
                );

        JPQLQuery<MemberTeamDto> query = getQuerydsl().applyPagination(pageable, jpaQuery);
        QueryResults<MemberTeamDto> results = query.fetchResults();

        List<MemberTeamDto> content = results.getResults();
        long total = results.getTotal();

        return new PageImpl<>(content, pageable, total);
    }
}
```
<br/>

### 장점과 한계

 - __장점__
    - getQuerydsl().applyPagination() 스프링 데이터가 제공하는 페이징을 Querydsl로 편리하게 변환 가능(단! Sort는 오류발생)
    - from() 으로 시작 가능(최근에는 QueryFactory를 사용해서 select() 로 시작하는 것이 더 명시적)
    - EntityManager 제공
 - __한계__
    - Querydsl 3.x 버전을 대상으로 만듬
    - Querydsl 4.x에 나온 JPAQueryFactory로 시작할 수 없음
        - select로 시작할 수 없음 (from으로 시작해야함)
    - QueryFactory 를 제공하지 않음
    - 스프링 데이터 Sort 기능이 정상 동작하지 않음

<br/>

## 4. QueryDSL 지원 클래스 직접 만들기

### 장점

 - 스프링 데이터가 제공하는 페이징을 편리하게 변환
 - 페이징과 카운트 쿼리 분리 가능
 - 스프링 데이터 Sort 지원
 - select(), selectFrom() 으로 시작 가능
 - EntityManager, QueryFactory 제공

<br/>

### 구현

 - `repository/support/Querydsl4RepositorySupport`
    - select()와 selectFrom()은 QueryFactory의 메서드를 추상화해서 제공한다.
    - applyPagination()는 Function을 파라미터로 받는데, fetch()를 수행하지 않은 JPAQuery를 받고, 내부적으로 apply()로 수행한다.
        - 내부적으로 applyPagination()를 수행해주어 페이징 관련하여 추가적으로 실행된다.
```java
/**
 * Querydsl 4.x 버전에 맞춘 Querydsl 지원 라이브러리
 *
 * @author Younghan Kim
 * @see org.springframework.data.jpa.repository.support.QuerydslRepositorySupport
 */
@Repository
public abstract class Querydsl4RepositorySupport {

    private final Class domainClass;
    private Querydsl querydsl;
    private EntityManager entityManager;
    private JPAQueryFactory queryFactory;

    // 생성자
    public Querydsl4RepositorySupport(Class<?> domainClass) {
        Assert.notNull(domainClass, "Domain class must not be null!");
        this.domainClass = domainClass;
    }

    @Autowired
    public void setEntityManager(EntityManager entityManager) {
        Assert.notNull(entityManager, "EntityManager must not be null!");
        JpaEntityInformation entityInformation = JpaEntityInformationSupport.getEntityInformation(domainClass, entityManager);
        SimpleEntityPathResolver resolver = SimpleEntityPathResolver.INSTANCE;
        EntityPath path = resolver.createPath(entityInformation.getJavaType());
        this.entityManager = entityManager;
        this.querydsl = new Querydsl(entityManager, new PathBuilder<>(path.getType(), path.getMetadata()));
        this.queryFactory = new JPAQueryFactory(entityManager);
    }

    @PostConstruct
    public void validate() {
        Assert.notNull(entityManager, "EntityManager must not be null!");
        Assert.notNull(querydsl, "Querydsl must not be null!");
        Assert.notNull(queryFactory, "QueryFactory must not be null!");
    }

    protected JPAQueryFactory getQueryFactory() {
        return queryFactory;
    }

    protected Querydsl getQuerydsl() {
        return querydsl;
    }

    protected EntityManager getEntityManager() {
        return entityManager;
    }

    protected <T> JPAQuery<T> select(Expression<T> expr) {
        return getQueryFactory().select(expr);
    }

    protected <T> JPAQuery<T> selectFrom(EntityPath<T> from) {
        return getQueryFactory().selectFrom(from);
    }

    protected <T> Page<T> applyPagination(Pageable pageable, Function<JPAQueryFactory, JPAQuery> contentQuery) {
        JPAQuery jpaQuery = contentQuery.apply(getQueryFactory());
        List<T> content = getQuerydsl().applyPagination(pageable, jpaQuery).fetch();
        return PageableExecutionUtils.getPage(content, pageable, jpaQuery::fetchCount);
    }

    protected <T> Page<T> applyPagination(Pageable pageable, 
            Function<JPAQueryFactory, JPAQuery> contentQuery, Function<JPAQueryFactory, JPAQuery> countQuery) {
        JPAQuery jpaContentQuery = contentQuery.apply(getQueryFactory());
        List<T> content = getQuerydsl().applyPagination(pageable, jpaContentQuery).fetch();
        JPAQuery countResult = countQuery.apply(getQueryFactory());
        return PageableExecutionUtils.getPage(content, pageable, countResult::fetchCount);
    }
}
```
<br/>

 - `MemberTestRepository`
    - Querydsl4RepositorySupport 상속받은 구현체를 만든다.
```java
@Repository
public class MemberTestRepository extends Querydsl4RepositorySupport {

    public MemberTestRepository() {
        super(Member.class);
    }

    public List<Member> basicSelect() {
        return select(member)
                .from(member)
                .fetch();
    }

    public List<Member> basicSelectFrom() {
        return selectFrom(member)
                .fetch();
    }

    // 기존의 스프링 데이터 QueryDSL을 이용한 예시
    public Page<Member> searchPageByApplyPage(MemberSearchCondition condition, Pageable pageable) {
        JPAQuery<Member> query = selectFrom(member)
                .leftJoin(member.team, team)
                .where(
                    usernameEq(condition.getUsername()),
                    teamNameEq(condition.getTeamName()),
                    ageGoe(condition.getAgeGoe()),
                    ageLoe(condition.getAgeLoe())
                );

        List<Member> content = getQuerydsl().applyPagination(pageable, query)
        .fetch();

        return PageableExecutionUtils.getPage(content, pageable, query::fetchCount);
    }

    public Page<Member> applyPagination(MemberSearchCondition condition, 
    Pageable pageable) {
        return applyPagination(pageable, contentQuery -> contentQuery
                .selectFrom(member)
                .leftJoin(member.team, team)
                .where(
                    usernameEq(condition.getUsername()),
                    teamNameEq(condition.getTeamName()),
                    ageGoe(condition.getAgeGoe()),
                    ageLoe(condition.getAgeLoe())
                )
            );
    }

    public Page<Member> applyPagination2(MemberSearchCondition condition, Pageable pageable) {
        return applyPagination(pageable, contentQuery -> contentQuery
                .selectFrom(member)
                .leftJoin(member.team, team)
                .where(
                    usernameEq(condition.getUsername()),
                    teamNameEq(condition.getTeamName()),
                    ageGoe(condition.getAgeGoe()),
                    ageLoe(condition.getAgeLoe())
                ),
                countQuery -> countQuery
                .selectFrom(member)
                .leftJoin(member.team, team)
                .where(
                    usernameEq(condition.getUsername()),
                    teamNameEq(condition.getTeamName()),
                    ageGoe(condition.getAgeGoe()),
                    ageLoe(condition.getAgeLoe())
                )
        );
    }

    private BooleanExpression usernameEq(String username) {
        return isEmpty(username) ? null : member.username.eq(username);
    }
    private BooleanExpression teamNameEq(String teamName) {
        return isEmpty(teamName) ? null : team.name.eq(teamName);
    }
    private BooleanExpression ageGoe(Integer ageGoe) {
        return ageGoe == null ? null : member.age.goe(ageGoe);
    }
    private BooleanExpression ageLoe(Integer ageLoe) {
        return ageLoe == null ? null : member.age.loe(ageLoe);
    }
}
```

