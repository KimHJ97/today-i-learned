# 프로젝트 환경설정

## 1. 프로젝트 생성

 - https://start.spring.io/
```
 - Project: Gradle
 - Language: Java
 - Spring Boot: 2.2.2
 - Project Metadata
    - Group: study
    - Artifact: querydsl
    - Dependencies
        - Spring Web
        - Spring Data JPA
        - H2 Database
        - Lombok
```
<br/>

 - `build.gradle`
```
plugins {
    id 'org.springframework.boot' version '2.2.2.RELEASE'
    id 'io.spring.dependency-management' version '1.0.8.RELEASE'
    id 'java'
}

group = 'study'
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
    implementation 'org.springframework.boot:spring-boot-starter-web'
    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation('org.springframework.boot:spring-boot-starter-test') {
        exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
    }
}

test {
    useJUnitPlatform()
}
```
<br/>

## 2. QueryDSL 설정

 - `build.gradle`
```gradle
plugins {
    id 'org.springframework.boot' version '2.2.2.RELEASE'
    id 'io.spring.dependency-management' version '1.0.8.RELEASE'
    //querydsl 추가
    id "com.ewerk.gradle.plugins.querydsl" version "1.0.10"
    id 'java'
}
group = 'study'
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
    implementation 'org.springframework.boot:spring-boot-starter-web'
    //querydsl 추가
    implementation 'com.querydsl:querydsl-jpa'
    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation('org.springframework.boot:spring-boot-starter-test') {
        exclude group: 'org.junit.vintage', module: 'junit-vintage-engine'
    }
}

test {
    useJUnitPlatform()
}

//querydsl 추가 시작
def querydslDir = "$buildDir/generated/querydsl"
querydsl {
    jpa = true
    querydslSourcesDir = querydslDir
}
sourceSets {
    main.java.srcDir querydslDir
}
configurations {
    querydsl.extendsFrom compileClasspath
}
compileQuerydsl {
    options.annotationProcessorPath = configurations.querydsl
}
//querydsl 추가 끝
```
<br/>

### 검증

엔티티를 만들고, Gradle Task를 실행한다. (other -> compileQuerydsl)  
build > generated > querydsl 경로의 QHello 클래스가 생성되어야 한다.  

 - `Hello 엔티티`
```java
@Entity
@Getter @Setter
public class Hello {
    @Id @GeneratedValue
    private Long id;
}
```
<br/>

 - `QuerydslApplicationTests`
```java
@SpringBootTest
@Transactional
class QuerydslApplicationTests {

    @Autowired
    EntityManager em;

    @Test
    void contextLoads() {
        Hello hello = new Hello();
        em.persist(hello);

        JPAQueryFactory query = new JPAQueryFactory(em);
        QHello qHello = QHello.hello; //Querydsl Q타입 동작 확인

        Hello result = query
                .selectFrom(qHello)
                .fetchOne();

        Assertions.assertThat(result).isEqualTo(hello);
        //lombok 동작 확인 (hello.getId())
        Assertions.assertThat(result.getId()).isEqualTo(hello.getId());
    }
}
```
<br/>

## 3. 라이브러리 살펴보기

```bash
./gradlew dependencies --configuration compileClasspath
```
<br/>

 - __Querydsl 라이브러리 살펴보기__
    - querydsl-apt: Querydsl 관련 코드 생성 기능 제공
    - querydsl-jpa: querydsl 라이브러리
 - __스프링 부트 라이브러리 살펴보기__
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
 - __테스트 라이브러리__
    - spring-boot-starter-test
        - junit: 테스트 프레임워크, 스프링 부트 2.2부터 junit5( jupiter ) 사용
            - 과거 버전은 vintage
        - mockito: 목 라이브러리
        - assertj: 테스트 코드를 좀 더 편하게 작성하게 도와주는 라이브러리
            - https://joel-costigliola.github.io/assertj/index.html
        - spring-test: 스프링 통합 테스트 지원
    - 핵심 라이브러리
        - 스프링 MVC
        - JPA, 하이버네이트
        - 스프링 데이터 JPA
        - Querydsl
    - 기타 라이브러리
        - H2 데이터베이스 클라이언트
        - 커넥션 풀: 부트 기본은 HikariCP
        - 로깅 SLF4J & LogBack
        - 테스트
<br/>

## 4. H2 데이터베이스 설치

 - https://www.h2database.com/
 - 다운로드 및 설치 
    - 스프링 부트 2.x를 사용하면 1.4.200 버전을 다운로드 받으면 된다.
    - 스프링 부트 3.x를 사용하면 2.1.214 버전 이상 사용해야 한다.
    - h2 데이터베이스 버전은 스프링 부트 버전에 맞춘다.
 - 권한 주기: chmod 755 h2.sh
 - 데이터베이스 파일 생성 방법
    - jdbc:h2:~/querydsl (최소 한번)
    - ~/querydsl.mv.db 파일 생성 확인
    - 이후 부터는 jdbc:h2:tcp://localhost/~/querydsl 이렇게 접속

<br/>

## 5. 스프링 부트 설정 - JPA, DB

 - `application.yml`
```yml
spring:
  datasource:
    url: jdbc:h2:tcp://localhost/~/querydsl
    username: sa
    password:
    driver-class-name: org.h2.Driver

  jpa:
    hibernate:
      ddl-auto: create
    properties:
      hibernate:
#       show_sql: true
        format_sql: true

logging.level:
  org.hibernate.SQL: debug
```
<br/>

### 쿼리 파라미터 로그 남기기

 - 로그에 다음을 추가하기 org.hibernate.type : SQL 실행 파라미터를 로그로 남긴다.
 - 외부 라이브러리 사용
    - https://github.com/gavlyukovskiy/spring-boot-data-source-decorator
    - 참고: 쿼리 파라미터를 로그로 남기는 외부 라이브러리는 시스템 자원을 사용하므로, 개발 단계에서는 편하게 사용해도 된다. 하지만 운영시스템에 적용하려면 꼭 성능테스트를 하고 사용하는 것이 좋다.
```
// Spring 2.x
implementation 'com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.5.8'

// Spring 3.x
implementation 'com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.9.0'
```

