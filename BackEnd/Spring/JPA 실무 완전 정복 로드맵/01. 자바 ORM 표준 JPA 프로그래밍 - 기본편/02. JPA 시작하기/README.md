# JPA 시작하기

## H2 데이터베이스 설치와 실행

H2 데이터베이스는 개발이나 테스트 용도로 사용하기 좋은 가볍고 편리한 DB이다. 그리고 SQL을 실행할 수 있는 웹 화면을 제공한다.  

 - 공식 사이트: https://www.h2database.com/
 - 버전별 설치: https://www.h2database.com/html/download-archive.html

```bash
# MAC, Linux
$ chmod 755 h2.sh
$ ./h2.sh

# Windows
$ h2.bat
```

<br/>

 - `H2 DB 접속 프로세스`
```
1. H2 데이터베이스 파일 생성
본인 홈 폴더에 이동하면, ~/test.mv.db 파일이 생성된다.
연결 시험을 호출하면 오류가 발생한디. 연결을 직접 눌러주어야 한다.
데이터베이스 파일을 만들기 위해 딱 1번만 수행하고, 연결을 해제한다.

 - 설정: Generic H2 (Embedded)
 - 드라이버 클래스: org.h2.Driver
 - JDBC URL: jdbc:h2:~/test
 - 사용자명: sa

2. TCP로 연결하기

 - 설정: Generic H2 (Embedded)
 - 드라이버 클래스: org.h2.Driver
 - JDBC URL: jdbc:h2:tcp://localhost/~/test
 - 사용자명: sa

```

<br/>

## 프로젝트 만들기

 - `pom.xml`
    - Hibernate와 H2 DB 의존성을 추가해준다.
    - Hibernate 6.x 버전을 사용하는 경우 JDK17+, jakarta, H2 DB 2.1.214+ 버전을 사용해주어야 한다.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>jpa-basic</groupId>
    <artifactId>ex1-hello-jpa</artifactId>
    <version>1.0.0</version>

    <properties>c
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- JPA 하이버네이트 -->
        <dependency>
            <groupId>org.hibernate</groupId>
            <artifactId>hibernate-core</artifatId>
            <version>5.3.10.Final</version>
        </dependency>

        <!-- H2 데이터베이스 -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <version>1.4.199</version>
        </dependency>

    </dependencies>

</project>
```

<br/>

 - `persistence.xml`
    - 'resources/META-INF/persistence.xml' 파일을 만들어준다.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence version="2.2" xmlns="http://xmlns.jcp.org/xml/ns/persistence"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/persistence http://xmlns.jcp.org/xml/ns/persistence/persistence_2_2.xsd">
    <persistence-unit name="hello">
        <properties>
            <!-- 필수 속성 -->
            <property name="jakarta.persistence.jdbc.driver" value="org.h2.Driver"/>
            <property name="jakarta.persistence.jdbc.user" value="sa"/>
            <property name="jakarta.persistence.jdbc.password" value=""/>
            <property name="jakarta.persistence.jdbc.url" value="jdbc:h2:tcp://localhost/~/test"/>
            <property name="hibernate.dialect" value="org.hibernate.dialect.H2Dialect"/>

            <!-- 옵션 -->
            <property name="hibernate.show_sql" value="true"/>
            <property name="hibernate.format_sql" value="true"/>
            <property name="hibernate.use_sql_comments"  value="true"/>
            <property name="hibernate.hbm2ddl.auto" value="create" />
        </properties>
    </persistence-unit>

</persistence>
```

<br/>

## JPA 구동 방식

JPA는 'META-INF/persistence.xml' 파일의 설정 정보를 읽어서 EntityManagerFactory를 만든다.  
EntityManagerFactory를 통해 EntityManager를 만들어서 JPA 기능을 사용한다.  
 - 엔티티 매니저 팩토리는 하나만 생성해서 애플리케이션 전체에서 공유해야 한다.
 - 엔티티 매니저는 쓰레드간에 공유하면 안된다. (사용하고 버려야 한다.)
 - JPA의 모든 데이터 변경은 트랜잭션 안에서 실행해야 한다.

```java
import javax.persistence.Persistence;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;

public class JpaMain {
    public static void main(String[] args) {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("hello");
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();

        // 트랜잭션 시작
        tx.begin()

        try {
            Member member = new Member();
            member.setId(1L);
            member.setName("HelloA");

            em.persist(member);

            // 트랜잭션 종료
            tx.commit();
        } catch (Exception e) {
            tx.rollback();
        } finally { 
            em.close();
        }
        
        emf.close()
    }
}
```

 - `예제`
```java
EntityManagerFactory emf = Persistence.createEntityManagerFactory("hello");
EntityManager em = emf.createEntityManager();
EntityTransaction tx = em.getTransaction();

// 등록
tx.begin();
Member member = new Member();
member.setId(1L);
member.setName("HelloA");
em.persist(member);
tx.commit();


// 조회
tx.begin();
Member findMember = em.find(Member.class, 1L);
tx.commit();


// 수정: 조회 후 엔티티 수정
tx.begin();
findMember = em.find(Member.class, 1L);
findMember.setName("HelloB");
tx.commit(); // 트랜잭션 종료시 UPDATE 쿼리 수행


// 삭제: 조회 후 엔티티 삭제
tx.begin();
findMember = em.find(Member.class, 1L);
em.delete(findMember);


em.close();
emf.close();
```

<br/>

## JPQL 소개

실제 RDBMS의 SQL 언어를 사용하게 되면, 해당 DB에 종속적이게 된다.  
JPA는 SQL을 추상화한 JPQL이라는 객체 지향 쿼리 언어를 제공한다.  
 - SQL과 문법 유사, SELECT, FROM, WHERE, GROUP BY, HAVING, JOIN 지원
 - JPQL은 엔티티 객체를 대상으로 쿼리하고, SQL은 데이터베이스 테이블을 대상으로 쿼리한다.
 - 테이블이 아닌 객체를 대상으로 검색하는 객체 지향 쿼리
 - SQL을 추상화해서 특정 데이터베이스 SQL에 의존하지 않는다.
 - JPQL을 한마디로 정의하면 객체 지향 SQL이다.

```java
// 전체 회원 조회
List<Member> result = em.createQuery("select m from Member as m", Member.class)
        .getResultList();

for (Member member: result) {
    System.out.println("member.name = " + member.getName());
}

// 페이징 처리: limit ? offset ?
List<Member> result = em.createQuery("select m from Member as m", Member.class)
        .setFirstResult(5)
        .setMaxResults(8)
        .getResultList();
```

