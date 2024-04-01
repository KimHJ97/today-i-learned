# 다음으로

## 1. 스프링 데이터 JPA 소개

스프링 데이터 JPA는 JPA를 사용할 때 반복되는 코드를 자동화해준다.  

스프링 데이터 JPA는 JpaRepository라는 인터페이스를 상속받는 것만으로 기본적인 CRUD 기능을 사용할 수 있다. 또한, findByName 처럼 일반화하기 어려운 기능도 메서드 이름으로 JPQL 쿼리를 만들어준다. 즉, __개발자는 인터페이스만 만들면 구현체는 스프링 데이터 JPA가 애플리케이션 실행 시점에 주입해준다.__  

 - `MemberRepository`
```java
/* EntityManager 직접 사용 */
@Repository
@RequiredArgsConstructor
public class MemberRepository {

    private final EntityManager em;

    public void save(Member member) {
        em.persist(member);
    }

    public Member findOne(Long id) {
        return em.find(Member.class, id);
    }

    public List<Member> findAll() {
        return em.createQuery("select m from Member m", Member.class)
                .getResultList();
    }

    public List<Member> findByName(String name) {
        return em.createQuery("select m from Member m where m.name = :name", Member.class)
                .setParameter("name", name)
                .getResultList();
    }
}

/* Spring Data JPA 사용 */
public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByName(String name);
}
```
<br/>

## 2. QueryDSL 소개

실무에서는 조건에 따라서 실행되는 쿼리가 달라지는 동적 쿼리를 많이 사용한다.  
QueryDSL은 SQL(JPQL)과 모양이 유사하면서 자바 코드로 동적 쿼리를 편리하게 생성할 수 있다. 실무에서는 복잡한 동적 쿼리를 많이 사용하게 되는데, 이떄 QueryDSL를 사용하면 높은 개발 생산성을 얻으면서 동시에 쿼리 오류를 컴파일 시점에 빠르게 잡을 수 있다.  
 - 직관적인 문법
 - 컴파일 시점에 빠른 문법 오류 발견
 - 코드 자동완성
 - 코드 재사용
 - JPQL new 명령어와는 비교가 안될 정도로 깔끔한 DTO 조회 지원

<br/>

 - `build.gradle`
    - 스프링 부트의 버전과 IDE 환경마다 QueryDSL를 사용하기 위한 설정이 조금씩 상이하다.
```gradle
//querydsl 추가
buildscript {
    dependencies {
        classpath("gradle.plugin.com.ewerk.gradle.plugins:querydsl-plugin:1.0.10")
    }
}

plugins {
    id 'org.springframework.boot' version '2.1.9.RELEASE'
    id 'java'
}

apply plugin: 'io.spring.dependency-management'
apply plugin: "com.ewerk.gradle.plugins.querydsl"

group = 'jpabook'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '1.8'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-devtools'
    implementation 'com.fasterxml.jackson.datatype:jackson-datatype-hibernate5'
    
    implementation 'com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.5.6'

    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    //querydsl 추가
    implementation 'com.querydsl:querydsl-jpa'
    //querydsl 추가
    implementation 'com.querydsl:querydsl-apt'
}

//querydsl 추가
//def querydslDir = 'src/main/generated'
def querydslDir = "$buildDir/generated/querydsl"

querydsl {
    library = "com.querydsl:querydsl-apt"
    jpa = true
    querydslSourcesDir = querydslDir
}

sourceSets {
    main {
        java {
            srcDirs = ['src/main/java', querydslDir]
        }
    }
}

compileQuerydsl{
    options.annotationProcessorPath = configurations.querydsl
}

configurations {
    querydsl.extendsFrom compileClasspath
}
```
<br/>

 - `QueryDSL 동적 쿼리 예시`
```java
public List<Order> findAll(OrderSearch orderSearch) {

    QOrder order = QOrder.order;
    QMember member = QMember.member;

    return query
        .select(order)
        .from(order)
        .join(order.member, member)
        .where(
            statusEq(orderSearch.getOrderStatus()),
            nameLike(orderSearch.getMemberName())
        )
        .limit(1000)
        .fetch();
    }

    private BooleanExpression statusEq(OrderStatus statusCond) {
        if (statusCond == null) {
            return null;
        }
        return order.status.eq(statusCond);
    }

    private BooleanExpression nameLike(String nameCond) {
        if (!StringUtils.hasText(nameCond)) {
            return null;
        }
        return member.name.like(nameCond);
    }
```

