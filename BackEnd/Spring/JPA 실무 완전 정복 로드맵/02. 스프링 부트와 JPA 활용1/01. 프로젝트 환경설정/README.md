# 프로젝트 환경설정

## 1. 프로젝트 생성

 - https://start.spring.io/
```
Project: Gradle - Groovy
Language: Java
Spring Boot: 2.4.1
Project Metadata:
 - Group:jpabook
 - Artifact: jpashop

Dependencies
 - Spring Web Starter
 - Thymeleaf
 - Spring Data JPA
 - Lombok
 - H2 Database
```
<br/>

### 1-1. Lombok 적용

```
1. Lombok 플러그인 설치
 - Preferences -> Plugins -> Lombok 검색 및 실행

2. Lombok 적용
 - Preferences -> Annotation Processors -> Enable annotation processing 체크
```
<br/>

## 2. 라이브러리 살펴보기

 - `Gradle 명령어로 의존 관계 확인`
```sh
./gradlew dependencies
./gradlew dependencies —configuration compileClasspath
```
<br/>

### 2-1. 스프링 부트 라이브러리

 - spring-boot-starter-web
    - spring-boot-starter-tomcat: 톰캣 (웹서버)
    - spring-webmvc: 스프링 웹 MVC
 - spring-boot-starter-thymeleaf: 타임리프 템플릿 엔진(View)
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

### 2-2. 테스트 라이브러리

 - spring-boot-starter-test
    - junit: 테스트 프레임워크
    - mockito: 목 라이브러리
    - assertj: 테스트 코드를 좀 더 편하게 작성하게 도와주는 라이브러리
    - spring-test: 스프링 통합 테스트 지원

<br/>

### 2-3. 핵심 및 기타 라이브러리

 - 핵심 라이브러리
    - 스프링 MVC
    - 스프링 ORM
    - JPA, 하이버네이트
    - 스프링 데이터 JPA
 - 기타 라이브러리
    - H2 데이터베이스 클라이언트
    - 커넥션 풀: 부트 기본은 HikariCP
    - WEB(thymeleaf)
    - 로깅 SLF4J & LogBack
    - 테스트

<br/>

## 3. View 환경 설정

 - Thmeleaf: https://www.thymeleaf.org/
 - 스프링 튜토리얼: https://spring.io/guides
    - https://spring.io/guides/gs/serving-web-content

<br/>

### 3-1. 예제 화면

 - `HelloController`
    - 뷰 매핑: resources:templates/ +{ViewName}+ .html
```java
@Controller
public class HelloController {

    @GetMapping("hello")
    public String hello(Model model) {
        model.addAttribute("data", "hello!!!");
        return "hello";
    }
}
```
<br/>

 - `resources/templates/hello.html`
```html
<!DOCTYPE HTML>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>Hello</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
</head>
<body>
<p th:text="'안녕하세요. ' + ${data}" >안녕하세요. 손님</p>
</body>
</html>
```
<br/>

## 4. H2 데이터베이스 설치

H2 데이터베이스는 개발이나 테스트 용도로 가볍고 편리한 DB, 웹 화면 제공한다.  
 - 공식 사이트: https://www.h2database.com/
 - 스프링 부트 2.x를 사용하면 1.4.200 버전을 다운로드 받으면 된다.
 - 스프링 부트 3.x를 사용하면 2.1.214 버전 이상 사용해야 한다.
```
# 데이터베이스 파일 생성 방법

jdbc:h2:~/jpashop (최소 한번)
~/jpashop.mv.db 파일 생성 확인
이후 부터는 jdbc:h2:tcp://localhost/~/jpashop 이렇게 접속
```
<br/>

## 5. JPA와 DB 설정

spring.jpa.hibernate.ddl-auto: create 옵션은 애플리케이션 실행 시점에 테이블을 drop 하고, 다시 생성한다.  
show_sql : 옵션은 System.out 에 하이버네이트 실행 SQL을 남긴다.  
org.hibernate.SQL : 옵션은 logger를 통해 하이버네이트 실행 SQL을 남긴다.  


 - `application.yml`
```yml
spring:
  datasource:
    url: jdbc:h2:tcp://localhost/~/jpashop
    username: sa
    password:
    driver-class-name: org.h2.Driver

  jpa:
    hibernate:
      ddl-auto: create
    properties:
      hibernate:
#        show_sql: true
        format_sql: true

logging.level:
  org.hibernate.SQL: debug
# org.hibernate.type: trace #스프링 부트 2.x, hibernate5
# org.hibernate.orm.jdbc.bind: trace #스프링 부트 3.x, hibernate6
```
<br/>

### 5-1. 동작 확인

회원 엔티티와 관련된 JPA 클래스들을 생성하여 확인한다.  

 - `Member 엔티티`
```java
@Getter @Setter
@Entity
public class Member {
    @Id @GeneratedValue
    private Long id;
    private String username;
}
```
<br/>

 - `MemberRepository`
```java
@Repository
public class MemberRepository {

    @PersistenceContext
    EntityManager em;

    public Long save(Member member) {
        em.persist(member);
        return member.getId();
    }

    public Member find(Long id) {
        return em.find(Member.class, id);
    }
}
```
<br/>

 - `MemberRepositoryTest`
    - 스프링 부트 2.2.x 부터는 JUnit 5가 설치된다. 때문에, JUnit 4 문법으로 사용할려면 build.gradle에 JUnit 4 설정을 추가해준다.
```java
import jpabook.jpashop.domain.Member;
import jpabook.jpashop.repository.MemberRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.transaction.annotation.Transactional;
import javax.persistence.EntityManager;

@RunWith(SpringRunner.class)
@SpringBootTest
public class MemberRepositoryTest {

    @Autowired
    Member Repository memberRepository;

    @Test
    @Transactional
    //@Rollback(false): 롤백하고 싶지 않은 경우
    public void testMember() {
        // Given
        Member member = new Member();
        member.setUsername("memberA");
        Long savedId = memberRepository.save(member);

        // When
        Member findMember = memberRepository.find(savedId);

        // Then
        Assertions.assertThat(findMember.getId()).isEqualTo(member.getId());
        Assertions.assertThat(findMember.getUsername()).isEqualTo(member.getUsername());
        Assertions.assertThat(findMember).isEqualTo(member); //JPA 엔티티 동일성 보장
    }
}
```
<br/>

### 5-2. 참고

스프링 부트를 이용하면 대부분 설정이 자동화된다.  
persistence.xml이나 LocalContainerEntityManagerFactoryBean을 설정할 필요가 없다.  
그 외에 추가적인 설정이나 옵션은 스프링 부트 메뉴얼을 참고할 수 있다.  

