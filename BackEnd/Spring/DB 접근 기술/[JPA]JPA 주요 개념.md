# JPA 주요 개념

 - https://incheol-jung.gitbook.io/docs/study/jpa
 - https://github.com/cheese10yun/TIL/blob/master/Spring/jpa/%EC%9E%90%EB%B0%94ORM%ED%91%9C%EC%A4%80JPA%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%B0%8D.md

---

JPA는 Java Persistence API의 약자로, Java EE와 Java SE 환경에서 데이터를 영구적으로 저장하고 관리하기 위한 API입니다. JPA는 객체-관계 매핑(Object-Relational Mapping, ORM) 기술의 한 종류로, 객체 지향 프로그래밍 언어인 자바의 객체와 관계형 데이터베이스의 테이블 간의 매핑을 쉽게 다룰 수 있도록 도와줍니다.  
 - JPA는 자바 진영의 ORM 기술 표준이다.
 - ORM은 객체와 관계형 데이터베이스를 매핑한다는 뜻이다. ORM 프레임워크는 객체와 테이블을 매핑해서 패러다임의 불일치 문제를 개발자 대신 해결해준다.
 - ORM 표준 프레임워크는 단순히 SQL을 개발자 대신 생성해서 데이터베이스에 전달해주는 것 뿐만아니라 앞서 이야기한 다양한 패러다임 의 불일치 문제를 해결해 준다.

<br/>

## 1. EntityManagerFactory와 EntityManager

엔티티 매니저 팩토리는 JPA 설정 정보를 읽어 기반 객체를 만들고, 데이터베이스 커넥션 풀을 생성하는 작업을 하여 비용이 크다. 때문에, 한 개만 만들어서 애플리케이션 전체에서 공유하도록 설계한다.  
엔티티 매니저는 엔티티를 저장, 수정, 삭제, 조회 등 엔티티와 관련된 모든 일을 처리한다.  


 - `META-INF/persistence.xml`
    - 엔티티 매니저 팩토리는 기본적으로 META-INF/persistence.xml 에 설정한 JPA 설정 정보를 통해 생성한다.
    - persistence.xml 파일에는 데이터 베이스 연걸 정보와 JPA 설정 정보가 있다.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://xmlns.jcp.org/xml/ns/persistence"
             version="2.1">
    <persistence-unit name="jpabook">
        <properties>
            <!-- 필수 속성 -->
            <property name="javax.persistence.jdbc.driver" value="org.h2.Driver"/>
            <property name="javax.persistence.jdbc.user" value="sa"/>
            <property name="javax.persistence.jdbc.password" value=""/>
            <property name="javax.persistence.jdbc.url" value="jdbc:h2:tcp://localhost/~/test"/>
            <property name="hibernate.dialect" value="org.hibernate.dialect.H2Dialect"/>

            <!-- SQL show -->
            <property name="hibernate.show_sql" value="true"/>
            
            <!-- SQL 정렬 -->
            <property name="hibernate.format_sql" value="true"/>
            
            <!-- SQL에 관한 주석 처리 -->
            <property name="hibernate.use_sql_comments" value="true"/>
            
            <!-- application 실행 시 ddl 전략 -->
            <property name="hibernate.hbm2ddl.auto" value="create"/>
        </properties>
    </persistence-unit>
</persistence>
```

<br/>

 - `예제 코드`
```java
// persistence.xml 정보를 바탕으로 엔티티 매니저를 생성한다.
EntityManagerFactory emf = Persistence.createEntityManagerFactory("jpabook");

// 엔티티 매니저 팩토리로 엔티티 매니저 생성
EntityManager em = emf.createEntityManager();

// [트랜잭션] - 획득
EntityTransaction tx = em.getTransaction();

try {
    tx.begin(); // [트랜잭션] - 시작
    logic(em) // 비즈니스 로직 실행
    tx.commit(); // [트랜잭션] - 커밋
} catch (Exception e) {
    tx.rollback(); // [트랜잭션] - 롤백
} finally {
    em.close(); // [엔티티 매니저 종료]
}

emf.close(); // [엔티티 매니저 팩토리 종료]
```

<br/>

## 2. 영속성 컨텍스트

영속성 컨텍스트란 엔티티를 영구 저장하는 환경으로 EntityManager를 통해 엔티티를 저장하거나 조회하면 EntityManager는 영속성 컨텍스트에 엔티티를 보관하고 관리한다.

<br/>

### 2-1. 엔티티의 생명주기

 - __비영속__
    - 엔티티 객체를 직접 생성한 경우 순수한 객체 상태로 영속성 컨텍스트와 데이터베이스와 관련이 없다.
```java
// 객체를 생성한 상태(비영속)
Member member= new Member();
member.setId("member1");
member.setUsername("회원1");
```

<br/>

 - __영속(managed): 영속성 켄텍스트에 저장된 상태__
    - EntityManager를 통해 엔티티 영속성 컨텍스트에 저장한 경우 해당 엔티티는 영속성 컨텍스트가 관리하는 영속 상태가 된다.
    - 즉, 영속 상태는 영속성 컨텍스트에 의해 관리되는 상태를 말한다.
    - find(), JPQL 등을 사용해 조회한 엔티티도 영속성 상태이다.
```java
// 객체를 저장한 상태 (영속)
em.persist(member);
```

<br/>

 - __준영속(detached): 영속성 컨텍스트에 저장되었다가 분리된 상태__
    - 영속성 컨텍스트가 관리하던 영속 상태의 엔티티를 영속성 컨텍스트가 관리하지 않으면 준영속 상태가 된다.
    - 특정 엔티티를 준영속 상태로 만들러면 em.detach()를 호출하면 된다. em.close()를 호출해서 영속성 컨텍스트를 닫거나 em.clear()를 호출해서 영속성 컨텍스트를 초기화해도 영속성 컨텍스트가 관리하던 영속 상태의 엔티티는 준영속 상태가 된다.
```java
// 객체를 삭제한 상태(삭제)
em.detach(member);
```

<br/>

 - __삭제(removed): 삭제된 상태__
    - 엔티티를 영속성 컨텍스트와 데이터베스에서 삭제한다.
```java
// 객체를 삭제한 상태 (삭제)
em.remove(member);
```

<br/>

### 2-2. 영속성 컨텍스트의 특징

 - __영속성 컨텍스트와 식별자(PK) 값__
    - 영속성 컨텍스트는 엔티티를 식별자 값으로 구분한다. 따라서 영속성 상태는 식별자 값이 반드시 있어야 한다. 만약, 식별자 값이 없으면 예외가 발생한다.
 - __영속성 컨텍스트와 데이터베이스 저장__
    - 영속성 컨텍스트에 엔티티를 저장하면 즉시 SQL 쿼리를 수행하여 데이터베이스에 저장되지 않는다.
    - JPA는 보통 트랜잭션을 커밋하는 순간 영속성 컨텍스트에 새로 저장된 엔티티를 데이터 베이스에 반영한다.
 - __영속성 컨텍스트의 기능__
    - 1차 캐시
    - 동일성 보장
    - 트랜잭션을 지원하는 쓰기 지연
    - 변경 감지
    - 지연 로딩

<br/>

#### 엔티티 조회

영속성 컨텍스트 내부에 캐시를 가지고 있는데 이것을 1차 캐시라 한다.  
영속성 상태의 엔티티는 모두 이곳에 저장된다. 쉡게 이야기하면 영속성 컨텍스트 내부에 Map 이 하나 있는데 키는 @Id로 매핑한 식별자고 값은 엔티티 인스턴스다.  
 - 영속 엔티티는 동일성이 보장된다.
 - 처음 조회시 DB에서 데이터를 조회하고 1차 캐시에 저장 후 영속 상태의 엔티티를 반환한다. 이후 조회시에 1차 캐시에 저장된 엔티티를 반환한다. 이렇게 반환된 엔티티 인스턴스는 같은 인스턴스이다.
```java
// 1. DB에서 조회 후 1차 캐시에 저장된다.
Member a = em.find(Member.class, "member1");
// 2. 1차 캐시에서 조회
Member b = em.find(Member.class, "member1");

println(a == b) // 동일성 비교
```

<br/>

#### 엔티티 등록

엔티티 매니저는 트랜잭션을 커밋하기 직전까지 데이터베이스에 엔티티를 저장하지 않고 내부 쿼리 저장서에 INSERT SQL을 차곡차곡 모아둔다. 그리고 트랜잭션을 커밋할 때 모아둔 쿼리를 데이이터베이스에 보내데 이것을 트랜잭션을 지원하는 쓰기 지연 이라고 한다.  

 - `예제 코드`
    - 회원 A를 영속화했다. 영속성 컨텍스트는 1차 캐시에 회원 엔티티를 저장하면서 동시에 회원엔티티 정보로 등록 쿼리를 만든다. 그리고 만들어진 등록 쿼리를 쓰기 지연 SQL 저장소에 보관한다.
    - 회원 B를 영속화 했다. 마찬가지로 회원 엔티티 정보로 등록 쿼리를 생성해서 쓰기지연 SQL 저장소에 보관한다. 현재 쓰기 지연 SQL 저장소에는 등록 쿼리가 2건 저장되었다.
    - 마지막으로 트랜잭션을 커밋했다. 트랜잭션을 커밋하면 엔티티 매니저는 우선 영속성 컨텍스트를 플러시한다.
    - 플러시는 영속성 컨텍스트의 변경 내용들을 데이터베이스에 동기화하는 작업인데 지연 SQL 저장소에 모인 쿼리를 데이터베이스에 보낸다. 이렇게 영속성 컨텍스트의 변경 내용을 데이터베이스에 동기화한 후에 실제 데이터베이스 트랜잭션을 커밋한다.
```java
EntityManager em = emf.createEntityManager();
EntityTransaction transaction = em.getTransaction();
// 엔티티 매니저는 데이터 변경 시 트랜잭션을 시작해야 한다
transaction.begin(); // [트랜잭션] 시작

// 1. 회원 A 영속화
em.persist(memberA);

// 2. 회원 B 영속화
em.persist(memberB);
// 여기까지는 INSERT SQL을 데이터베이스에 보내지 않는다

// 커밋하는 순간 데이터베이스에 INSERT SQL을 보낸다.
transaction.commit(); // [트랜잭션] 커밋
```

<br/>

#### 엔티티 수정

 - `예제 코드`
    - JPA로 엔티티를 수정할 때는 단순히 엔티티를 조회해서 데이터만 변경하면 된다.
    - JPA는 엔티티를 영속성 컨텍스트에 보관할 때 최초 상태를 복사해서 저장해두는데 이것을 스냅샷이라고 한다. 그리고 플러시 시점에 스냅샷과 엔티티를 비교해서 변경된 엔티티를 찾는다.
        - 트랜잭션을 커밋하면 엔티티 매니저 내부에서 먼저 플러시가 호출된다.
        - 엔티티와 스냅샷을 비교해서 변경된 엔티티를 찾는다.
        - 변경된 엔티티가 있으면 수정 쿼리를 생성해서 쓰기 지연 SQL 저장소에 보낸다.
        - 쓰기 지연 저장소의 SQL을 데이터베이스에 보낸다.
        - 데이터베이스 트랜잭션을 커밋한다.
    - __변경 감지 영속성 컨텍스트가 관리하는 영속 상태의 엔티티에만 적용 된다. 비영속, 준영속 처럼 영속성 컨텍스트의 관리를 받지 못하는 엔티티는 값을 변경해도 데이터베이스에 반영되지 않는다.__
```java
EntityManager em = emf.createEntityManager();
EntityTransaction transaction = em.getTransaction();
transaction.begin(); // [트랜잭션] 시작

//  영속성 엔티티 조회
Member memberA = em.find(Member.class, "memberA");

// 영속성 엔티티 데이터 수정
memberA.setUsername("hi");
memberA.setAge(10);

transaction.commit(); // [트랜잭션] 커밋
```

<br/>

#### 엔티티 삭제

엔티티를 삭제하려면 먼저 삭제 대상 엔티티를 조회해아 한다.

 - `예제 코드`
    - em.remove()에 삭제 대상 엔티티를 넘겨주면 엔티티를 삭제한다. 물론 엔티티를 즉시 삭제하는 것이 아니라 엔티티 등록과 비슷하게 삭제 쿼리를 쓰기 지연 SQL 저장소에 등록한다. 이후 트랜잭션을 커밋해서 플러시를 호출하면 실제 데이터베이스에 삭제 쿼리를 전달한다.
```java
Member memberA = em.find(Member.class, "memberA"); // 삭제 대상 엔티티 조회
em.remove(memberA); // 엔티티 삭제
```

<br/>

### 2-3. 플러시

플러시는 속성 컨텍스트의 변경 내용을 데이터베이스에 반영하는 것이다.  
영속성 컨텍스트를 플러시하는 방법으로는 3가지가 존재한다.  

<br/>

 - `flush() 메서드 직접 호출`
    - 엔티티 매니저의 flush() 메서드를 직접 호출해서 영속성 컨텍스트를 강제로 플러시한다.
    - 테스트나 다른 프레임워크와 JPA를 함께 사용할 때를 제외하고 거의 사용하지 않는다.
 - `트랜잭션 커밋시 플러시 자동 호출`
    - JPA는 트랜잭션을 커밋할 때 플러시를 자동적으로 호출한다.
 - `JPQL 쿼리 실행 시 플러시 자동 호출`
    - JPQL이나 Criteria 같은 객체지향 쿼리를 호출할 때 플러시가 실행된다.
    - 만약, em.persist()를 호출해서 엔티티를 영속 상태로 만들었다. 이때, JPQL을 실행하여 SQL로 데이터베이스에 해당 데이터를 조회하면 아직 영속 상태로 INSERT SQL이 데이터베이스에 플러시 되지 않은 상태로 조회가 되지 않을 것이다. JPA는 이러한 문제를 예방하기 위해 JPQL을 실행할 때 플러시를 자동으로 호출하도록 하였다.
```java
em.persist(memberA);
em.persist(memberB);
em.persist(memberC);

// 중간에 JPQL 실행
query = em.createQuery("select m from Member m", Member.class);
List<Member> members = query.getResultList();
```

<br/>

### 2-4. 준영속

영속성 컨텍스트가 관리하는 영속 상태의 엔티티가 영속성 컨텍스트에서 분리된 것을 준영속 상태라고 한다.  
준영속 상태의 엔티티는 영속성 컨텍스트가 제공하는 기능을 사용할 수 없다.  
영속 상태의 엔티티를 준영속 상태로 만드는 방법은 3가지가 존재한다.  
 - __비영속성에 가까움__: 영속성 컨텍스트가 관리하지 않음으로 1차 캐시, 쓰기 지연, 변경 감지, 지연로딩을 포함한 영속성 컨텍스트가 제공하는 어떠한 기능도 동작하지 않는다.
 - __식별자 값을 가지고 있음__: 비영속 상태는 식별자 값이 없을 수도 있지만 준영속 상태는 이미 한 번 영속 상태 였음으로 반드시 식별자 값을 가지고 있다.
 - __병합(merge)__: 준영속 상태의 엔티티를 다시 영속 상태로 변경하라면 병합을 사용하면 된다. merge() 메서드는 준영속 상태의 엔티티를 받아서 그 정보로 새로운 영속 상태의 엔티티를 반환한다.

<br/>

 - `detach(Entity)`
    - 특정 엔티티만 준영속 상태로 전환한다.
    - detach() 메서드를 호출하면 해당 엔티티는 1차 캐시로부터 쓰기 지연 SQL 저장소까지 해당 엔티티를 관리하기 위한 모든 정보가 제거된다. (쓰기 지연 SQL 저장소의 INSERT SQL도 제거된다.)
    - 영속 상태였다가 더는 영속성 컨텍스트가 관리하지 않는 상태를 준영속 상태라 한다.
```java
Member member = new Member();
member.setId("memberA");
member.setUsername("회원A");

// 회원 엔티티 영속 상태
em.persist(member);

// 회원 엔티티를 영속성 컨텍스트에서 분리, 준영속 상태
em.detach(member);

transaction.commit() // 트랜잭션 커밋
```

<br/>

 - `clear()`
    - 영속성 컨텍스트를 초기화해서 해당 영속성 컨텍스트의 모든 엔티티를 준영속 상태로 만든다.
```java
// 엔티티 조회, 영속 상태
Member member = em.find(MEmber.class, "memberA");

em.clear(); // 영속성 컨텍스트 초기화

// 준영속 상태
member.setUsername("changeName");
```

<br/>

 - `close()`
    - 영속성 컨텍스트를 종료하면 해당 영속성 컨텍스트가 관리하던 영속 상태의 엔티티가 모두 준영속 상태가 된다.
```java
em.close();
```

<br/>

 - `merge()`
    - 준영속 상태의 엔티티를 다시 영속 상태로 변경하라면 병합을 사용하면 된다. merge() 메서드는 준영속 상태의 엔티티를 받아서 그 정보로 새로운 영속 상태의 엔티티를 반환한다.
```java
Member mergeMeber = em.merge(Member);
```

<br/>

## 3. 엔티티 매핑

 - __@Entity__
    - 엔티티 매니저에 의해 관리될 클래스에 정의한다. 즉, 테이블과 매핑할 클래스는 @Entity 어노테이션이 필수이다.
    - 기본 생성자는 필수로 만들어야 한다.
        - default, public, protected 중에 하나를 만들어야 한다.
        - Java Reflection 기능을 통해 값들을 바인딩해야 하기 때문에 기본 생성자가 필수이다.
 - __@Table__
    - 테이블 정보를 정의한다.
    - 생략하면 클래스 이름 그대로 테이블을 사용한다.
    - 생략했을 경우 엔티티 클래스 이름 변경이 테이블 이름 변경까지 가져올 수 있다.
 - __@Id__
    - 기본 키(PK) 컬럼 정보를 정의한다.
 - __@Column__
    - 컬럼 정보를 정의한다.

<br/>

### 3-1. 기본 키 매핑

기본 키 매핑 방식으로는 직접 할당하는 방법과 자동 생성하는 방법이 존재한다.  
 - 직접 할당 : em.persist()를 호출하기 전에 애플리케이션에서 직접 식별자 값을 할당한다. 만약 식별자 값이 없으면 예외가 발생한다.
 - SEQUENCE: 데이터베이스 시숸스에서 식별자 값을 회득한후 영속성 컨텍스트에 저장한다.
 - TABLE: 데이터베이스 시퀀스 생성용 테이블에서 식별자 값을 획득한 후 영속성 컨텍스트에 저장한다.
 - IDENTITY: 데이터베이스에 엔티티를 저장해서 식별자 값을 획득한 후 영속성 컨텍스트에 저장한다.

<br/>

 - `직접 할당 전략`
    - 직접 할당 전략은 엔티티를 저장하기 전에 애플리케이션에서 기본 키를 직접 할당하는 방법이다.
```java
Board board = new Board();
board.setId("1");
em.persist(board);
```

<br/>

 - `자동 생성`
    - 자동 생성 방식으로는 대리키 사용 방식, IDENTITY, SEQUENCE, TABLE 전략이 존재한다.
    - __IDENTITY 전략__
        - 기본 키 생성을 데이터베이스에 위임한다.
        - 데이터베이스에 INSERT 한 후에 기본 키 값을 조회할 수 있다.
        - IDENTITY 식별자 생성 전략은 엔티티를 데이터베이스에 저장해야 식별자를 구할 수 있다. 때문에, em.persist()를 호출하는 즉시 INSERT SQL이 데이터베이스에 전달된다. 즉, 해당 전략은 트랜잭션을 지원하는 쓰기 지연이 동작하지 않는다.
    - __SEQUENCE 전략__
        - 데이터베이스 시퀀스를 사용해서 기본 키를 할당한다.
        - 해당 전략은 시퀀스를 지원하는 데이터베이스에서 사용할 수 있다.(Oracle, H2 등)
        - SEQUENCE 전략은 em.persist()를 호출할 때 데이터베이스 시퀀스를 사용해서 식별자를 조회한다. 그리고 조회한 식별자를 엔티티에 할당한 후에 엔티티를 영속성 컨텍스트에 저장한다. 이후 트랜잭션을 커밋해서 플러시가 일어나면 엔티티를 데이터베이스에 저장한다.
    - __TABLE 전략__
        - 키 생성 전용 테이블을 만들고, 여기에 이름과 값으로 사용할 컬럼을 만들어서 데이터베이스 시퀀스를 흉내내는 전략
    - __AUTO 전략__
        - 데이터베이스 방언에 따라 IDENTITY, SEQUENCE, TABLE 전략 중 하나를 자동으로 선택한다.
        - Oracle을 선택하면 SEQUENCE, MySQL을 선택하면 IDENTITY가 사용된다.
```java
@Entity
class Board {
    @Id
    @GeneratedValue(strategy = GerationType.IDENTITY)
    private Loing id;
    ...
}

public void identityStrategy(EntityManager em){
    Barod baord = new Board();
    em.persist(board); // em.persist() 호출 시 DB에 반영
    System.out.pirntln(board.getId());
}

public void sequenceStrategy(EntityManager em){
    Barod baord = new Board();
    em.persist(board); // em.persist() 호출 시 DB에 시퀀스 조회
    System.out.pirntln(board.getId());

    // 트랜잭션 종료시 DB에 반영
}
```

<br/>

### 3-2. 필드와 컬럼 매핑

 - __@Column__
    - @Column은 객체 필드를 테이블 컬럼에 매핑한다.
    - name: 컬럼명 지정
    - length: 문자 길이 제한, String 타입에만 사용
    - nullable: 컬럼 값 NULL 여부
    - percision: BigDecimal인 경우 사용
    - scale: BigDecimal인 경우 사용
    - unique: 유니크 키 사용 여부
    - updatable: 컬럼 수정시 DB에 반영 여부, false인 경우 DB에 반영되지 않는다.
 - __@Enumerated__
    - 자바의 ENUM 타입을 매핑한다.
    - EnumType.ORDINAL: ENUM의 순서 값을 데이터베이스에 저장한다.
    - EnumType.STRING: ENUM 이름을 데이터베이스에 저장한다.
    - 주의: EnumType.ORDINAL은 정의된 순서대로 데이터베이스에 저장할 수 있어 데이터 크기가 작은 장점이 있지만, 이미 지정된 ENUM의 순서를 변경할 수 없다. 또한, 사람이 인식하기 어려울 수 있어 String 타입으로 관리하는 것이 좋을 수 있다.
 - __@Temporal__
    - 날짜 타입을 매핑한다.
    - 자바의 Date 타입에는 년월일 시분초가 있지만, 데이터베이스에는 date(날짜), time(시간), timestamp(날짜와 시간) 세 가지 타입이 별도로 존재한다. 기본적으로 Date 타입은 timestamp로 정의된다.
 - __@Lob__
    - BLOB, CLOB 타입을 매핑한다.
    - CLOB: String, char[] 등
    - BLOB: byte[], java.sql.BLOG 등
 - __@Transient__
    - 해당 필드는 JPA 영속 상태에서 제외된다. 즉, Dirty Checking, CRUD SQ 자동 생성 등 관리 대상에서 제외되어 변경 사항 감지나 데이터베이스와 매핑하여 동기화되지 않는다.
    - 데이터베이스 컬럼으로 관리될 필요는 없으나, 메모리 상에 저장되어 있는 플래그 값을 통해 변경 여부를 저장해 두면 관계가 있는 로직에서 쉽게 분기 처리를 할 때 사용될 수 있다.
 - __Access__
    - JPA가 엔티티에 접근하는 방식을 지정한다.
    - 기본적으로 @Id 어노테이션 위치에 따라 액세스 타입 방식이 사용된다. @Id가 필드 위에 있으면 AccessType.FIELD, @Id가 Getter 메서드 위에 있으면 AccessType.PROPERTY를 사용한 것과 같다.
    - __필드 접근__
        - AccessType.FIELD로 지정한다.
        - 필드에 직접 접근한다. 필드 접근 권한이 private 이어도 접근할 수 있다.
    - __프로퍼티 접근__ 
        - AccessType.PROPERTY로 지정한다.
        - 접근자 Getter를 사용한다.
```java
@Entity
@Table(name = "board")
public class Board {
    
    @Id(strategy = GenerationType.IDENTITY)
    private Long id;

    private String writer;

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Lob
    private String contents;

    @Transient
    @Setter
    private boolean isModified;

    @Enumerated(EnumType.STRING)
    private BoardStatus status;

    @Temporal(TemporalType.DATE)
    private Date date;

    @Temporal(TemporalType.TIME)
    private Date time;

    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;

}
```

<br/>

## 4. 연관 관계 매핑 기초

객체는 참조(주소)를 사용해서 관계를 맺고, 테이블은 외래 키를 사용해서 관계를 맺는다.  

 - 회원(Member) 객체는 Member.team 필드로 팀 객체와 연관 관계를 맺는다. (Member -> Team 단방향)
 - 회원은 Member.team 필드를 통해 팀을 알 수 있지만, 반대로 팀은 회원을 알 수 없다.
```java
@Entity
class Member {
    @Id
    @Column(name = "memberId")
    private String id;

    private String username;

    @ManyToOne
    @JoinColumn(name = "teamId")
    private Team team;
}

@Entity
class Team {
    @Id
    @Column(name = "teamId")
    private String id;

    private String name;
}
```

<br/>

### 4-1. 연관 관계 사용

 - `저장`
```java
// 팀 1 저장
Team team1 = new Team("team1", "팀1");
em.persist(team);

// 회원1 저장
Member member1 = new Member("member1", "회원1");
member1.setTeam(team1); // 연관관계 설정 member1 -> team1
em.persist(member1)


// 회원2 저장
Member member1 = new Member("member2", "회원2");
member2.setTeam(team1); // 연관관계 설정 member2 -> team2
em.persist(member2)   
```

<br/>

 - `조회`
    - 연관관계가 있는 엔티티를 조회하는 방법은 크게 2가지이다.
    - 객체 그래프 탐색: 객체를 통해 연관된 엔티티를 조회하하는 것
    - 객체지향 쿼리 JPQL을 사용
```java
// 객체 그래프 탐색 방식
Member member = em.find(Member.class, "member1");
Team team = member.getTeam(); // 객체 그래프 탐색
```

<br/>

 - `수정`
```java
private statid void update(){
    // 새로운 팀 2
    Team team2 = new Team("team2", "팀2")
    em.persist(team2);

    // 회원1에 새로운 팀2 설정
    Member member = em.find(Member.class, "member1");
    member.setTeam(team2);
}
```

<br/>

 - `연관 관계 제거`
```java
private statid void deleteRelration(){
    Member member = em.find(Member.class, "member1");
    member1.setTeam(null); // 연관관계 제거
}

/* SQL 문은 다음과 같다
UPDATE
SET
    teamId = null, ....
WHERE
    id = 'member1'
*/
```

<br/>

 - `연관된 엔티티 삭제`
    - 연관된 엔티티를 삭제하려면 기존에 있던 연관 관계를 먼저 제거하고 삭제하여야 한다.
    - 그렇지 않으면, 외래 키 제약 조건으로 인해 데이터베이스에서 에러를 발생한다.
```java
member1.setTeam(null); // 회원1 연관관계 제거
member2.setTeam(null); // 회원2 연관관계 제거
em.remove(team); // 팀 제거
```

<br/>

### 4-2. 양방향 연관 관계

일대다(1:N) 관계를 매핑하기 위해서 @OneToMany 어노테이션을 사용하며, mappedBy 속성으로 매핑 필드의 이름을 지정한다.

```java
@Entity
class Member {
    @Id
    @Column(name = "memberId")
    private String id;

    private String username;

    @ManyToOne // Member는 하나의 Team 안에 속한다.
    @JoinColumn(name = "teamId")
    private Team team;
}

@Entity
class Team {
    @Id
    @Column(name = "teamId")
    private String id;

    private String name;

    @OneToMany(mappedBy = "team") // 하나의 Team 안에는 여러 개의 Member가 존재한다.
    private List<Member> members = new ArrayList<>();
}

public void biDirection(){
    Team team = em.find(Team.class, "team1");
    List<members> = team.getMembers(); // 팀 -> 회원 객체 그래프 탐색

    for (Member member : members){
        print(member.getUsername());
    }
}
```

<br/>

### 4-3. 연관 관계의 주인

테이블은 외래 키(FK) 하나로 두 테이블의 연관 관계를 관리한다.  
하지만, 엔티티를 양방향 연관 관계로 설정하면 객체의 참조는 둘인데 외래 키는 하나이다. 때문에, 두 엔티티 중 어떤 관계를 사용해서 외래 키를 관리해야 할지 고민을 해야 한다. 즉, __두 객체 연관 관계 중 하나를 정해서 테이블의 외래키를 관리해야하는데 이 것을 연관 관계의 주인이라고 한다.__  

 - __양방향 매핑의 규칙__
    - 양방향 연관 관계 매핑 시 두 연관 관계 중 하나를 연관 관계의 주인으로 설정해야 한다.
    - 연관 관계의 주인만 데이터베이스 연관 관계와 매핑되고 외래키를 관리(등록, 수정, 삭제)할 수 있다.
    - 반면에, 주인이 아닌 쪽은 읽기만 할 수 있다.
    - __주인은 mappedBy 속성을 사용하지 않고, 주인이 아니면 mappedBy 속성을 사용해서 속성의 값으로 연관 관계의 주인을 지정한다.__
    - __연관 관계의 주인은 외래 키 관리자를 선택하는 것이다. 회원 테이블에 있는 teamId 외래 키를 관리할 관리자를 선택해야 하는데, Member 테이블에 외래 키가 있어 Member에서 하는 것이 좋다.__
```java
class Member {

    // ..

    @ManyToOne
    @JoinColumn(name = "teamId")
    prviate Team team;
    
}
class Team {

    // ..

    @OneToMany
    @OneToMany(mappedBy = "team")
    private List<Member> members = new ArrayList<Member>();

}
```

<br/>

 - __양방향 연관 관계 저장__
    - Member는 양방향 연관 관계의 주인이다. 때문에, 외래 키(FK)를 관리한다.
    - Team은 양방향 연관 관계의 주인이 아니다. 때문에, 입력 값이 외래 키에 영향을 주지 않는다. 즉, 데이터 베이스에 저장할 때 무시된다.
```java
// Team에서 Member를 저장할 때
team.getMembers().add(member1);
team.getMembers().add(member2);

// Member에서 Team을 저장할 때
member1.setTeam(team);
member2.setTeam(team);
```

<br/>

### 4-4. 순수한 객체까지 고려한 양방향 연관 관계

객체 관점에서는 양방향에 모두 값을 입력해주는 것이 가장 안전하다.  

 - `순수 객체 사용`
    - JPA를 사용하지 않는 순수한 객체에서 Member.team에만 연관 관계를 설정하고, 반대 방향은 연관 관계를 설정하지 않았다.
    - Team에서 Member는 0이 된다.
```java
public void test1(){
    // 팀1
    Team team = new Team("team1", "팀1");
    Member member1 = new Member("member1", "회원1");
    Member member2 = new Member("member2", "회원2");

    member1.setTeam(Team1); // 연관관계 설정 member1 - > team1;
    member2.setTeam(Team1); // 연관관계 설정 member2 - > team1;

    List<Member> members = team.getMembers();

    print(member.sizle) // 0 출력
}
```

<br/>

 - `양방향 모두 관계 설정`
    - 객체까지 고려한다면 주인이 아닌 곳에도 값을 입력해주어야 한다.
```java
// 양방향 모두 관계를 설정
public void test2(){
    
    // 팀1
    Team team = new Team("team1", "팀1");
    Member member1 = new Member("member1", "회원1");
    Member member2 = new Member("member2", "회원2");

    member1.setTeam(Team1); // 연관관계 설정 member1 - > team1;
    team1.getMembers().add(members1) //연관관계 설정 team1 -> member1;


    member2.setTeam(Team1); // 연관관계 설정 member2 - > team1;
    team1.getMembers().add(members2) //연관관계 설정 team1 -> member2;

    List<Member> members = team.getMembers();

    print(member.sizle) // 2 출력
}
```

<br/>

 - `연관 관계 편의 메서드`
    - 양방향 연관 관계는 결국 양쪽 모두 신경써야 한다.
    - member.setTeam()과 team.getMembers().add()를 각각 호출하는 경우 실수로 둘 중 하나만 호출하여 양방향이 꺠질 수 있다.
    - 때문에, 양방향 관계에서 두 코드는 하나인 것처럼 사용하는 것이 안전하다.
```java
class Member {
    private Team team;

    public void setTeam(Team team){
        // 기존 팀과 관계 제거
        if(this.team != null){
            this.team.getMembers().remove(this);
        }
        this.team = team;
        team.getMembers().add(this);
    }
    
}

// 양방향 리팩토링 전체 코드
public void test순수한객체_양방향(){
    
    // 팀1
    Team team = new Team("team1", "팀1");
    em.persist(team1);

    
    Member member1 = new Member("member1", "회원1");
    member1.setTeam(team1); // 양방향 설정
    em.persist(member1);

    Member member2 = new Member("member1", "회원1");
    member2.setTeam(team1); // 양방향 설정
    em.persist(member2);
}
```

<br/>

## 5. 다양한 연관 관계 매핑

### 5-1. 연관 관계 정의 규칙

 - 방향: 단방향, 양방향
 - 연관 관계의 주인: 양방향일 때, 연관 관계에서 관리 주체
 - 다중성: 다대일(N:1), 일대다(1:N), 일대일(1:1), 다대다(N:M)

<br/>

### 5-2. 단방향, 양방향

데이터베이스 테이블은 외래 키(FK) 하나로 양 쪽 테이블 조인이 가능합니다. 따라서 데이터베이스는 단방향과 양방향을 나눌 필요가 없습니다.  
그러나 객체는 참조용 필드가 있는 객체만 다른 객체로 참조하는 것이 가능합니다. 때문에, 두 객체 사이에 하나의 객체만 참조용 필드를 갖고 참조하면 단방향 관계, 두 객체 모두가 각각 참조용 필드를 갖고 참조하면 양방향 관계라고 합니다.  
더 정확히 이야기하면 양방향 관계는 없고 두 객체가 단방향 참조를 각각 가져서 양방향 관계처럼 사용하는 것이 됩니다. JPA를 사용하여 데이터베이스와 패러다임을 맞추기 위해서 객체는 단방향 연관 관계를 가질지, 양방향 연관 관계를 가질지 선택해야 합니다.  

선택은 비즈니스 로직에서 두 객체가 참조가 필요한지 여부를 고민해보아야 합니다.  
 - Board.getPost(): Board에서 Post를 참조해야 하는 경우 단방향 참조를 한다.
 - Post.getBoard(): Post에서 Board를 참조해야 하는 경우 단방향 참조를 한다.
 - 즉, 비즈니스 로직에 맞게 선택하였을 때 두 객체가 서로 단방향 참조를 했다면 양방향 연관 관계가 된다.

<br/>

### 5-3. 연관 관계의 주인

데이터베이스는 외래 키(FK) 하나로 두 테이블이 연관 관계를 맺는다. 즉, 테이블의 연관 관계를 관리하는 포인트는 외래 키 하나이다.  
반면에, 엔티티를 양방향으로 매핑하면 서로를 참조해야 한다. 따라서, 객체의 연관 관계를 관리하는 포인트는 2곳이다.  

외래 키를 가진 테이블과 매핑한 엔티티가 외래 키를 관리하는 게 효율적이므로 보통 해당 클래스를 연관 관계의 주인으로 선택한다.  
주인이 아닌 방향은 외래키(FK)를 변경할 수 없고, 읽기만 가능하다. 연관 관계의 주인은 mappedBy 속성을 사용하지 않으며, 연관 관계의 주인이 아니면 mappedBy 속성을 사용하고 연관 관계의 주인 필드 이름을 값으로 입력한다.  

<br/>

### 5-4. 다중성

### 5-4-1.다대일(N:1)

객체 양방향 관계에서 연관 관계의 주인은 항상 다쪽이다. 예를 들어, 회원(N)과 팀(1)이 있다면 회원쪽이 연관 관계의 주인이다.  
데이터베이스는 항상 다(N)쪽이 외래 키를 갖습니다. 게시판(Board)과 게시글(Post)이 있을 떄, 게시판에는 여러 개의 게시글이 있다. 게시판(1)과 게시글(N)으로 게시글에는 게시판의 외래 키(FK)가 존재한다. 즉, 게시글이 연관 관계의 주인이 된다.  

★ 양방향은 외래 키(FK)가 있는 쪽이 연관 관계의 주인이다.  
★ 양방향 연관 관계는 항상 서로를 참조해야 한다.  

 - `다대일(N:1) 단방향`
    - 단방향은 게시글(Post)에서 게시판(Board)에 대해 @ManyToOne으로 다대일(N:1) 참조를 걸어준다.
    - 게시판(Board)에서 게시글(Post)에는 참조를 걸지 않아 단방향이다.
```java
@Entity
public class Post {
    @Id @GeneratedValue
    @Column(name = "POST_ID")
    private Long id;

    @Column(name = "TITLE")
    private String title;

    @ManyToOne
    @JoinColumn(name = "BOARD_ID")
    private Board board;

}

@Entity
public class Board {
    @Id @GeneratedValue
    private Long id;

    private String title;

}
```

 - `다대일(N:1) 양방향`
    - 다대일 관계를 양방향으로 만들기 위해서는 참조 엔티티의 @OneToMany를 추가하고, 연관 관계의 주인을 mappedBy로 지정해준다.
```java
@Entity
public class Post {
    @Id @GeneratedValue
    @Column(name = "POST_ID")
    private Long id;

    @Column(name = "TITLE")
    private String title;

    @ManyToOne
    @JoinColumn(name = "BOARD_ID")
    private Board board;

}

@Entity
public class Board {
    @Id @GeneratedValue
    private Long id;
    private String title;

    @OneToMany(mappedBy = "board")
    List<Post> posts = new ArrayList<>();

}
```

<br/>

### 5-4-2. 일대다(1:N)

일대다 관계는 엔티티를 하나 이상 참조할 수 있도록 자바 컬렉션인 List, Set, Map 중에 하나를 사용해야 한다.  
일대다 관계는 다대일 관계의 반대이다. 하지만, 보통 다대일의 기준은 연관 관계의 주인을 다(N) 쪽에 둔 것이고, 일대다의 기준은 연관 관계의 주인을 일(1) 쪽에 둔 것이 될 수 있다.  

 - `일대다(1:N) 단방향`
    - @OneToMany에서 mappedBy가 없어진다. 양방향이 아니다.
    - 대신에, @JoinColumn을 이용해서 조인한다.
    - 주인이 되는 게시판(Board)이 아니라, 참조 필드인 게시글(Post)이 외래 키(FK)를 관리하는 특이한 모습이 나타난다.
```java
@Entity
public class Post {
    @Id @GeneratedValue
    @Column(name = "POST_ID")
    private Long id;

    @Column(name = "TITLE")
    private String title;

}

@Entity
public class Board {
    @Id @GeneratedValue
    private Long id;
    private String title;

    @OneToMany
    @JoinColumn(name = "POST_ID") //일대다 단방향을 @JoinColumn필수
    List<Post> posts = new ArrayList<>();

}
```

<br/>

 - `일대다 단방향 매핑의 단점`
    - 일대다 단방향 매핑의 단점은 매핑한 객체가 관리하는 외래 키가 다른 테이블에 있다는 점이다. 대상 테이블에 외래 키가 있으면 엔티티의 저장된 연관 관계 처리를 INSERT SQL 한 번에 끝낼 수 있지만, 다른 테이블에 외래 키가 있으면 연관 관계 처리를 위한 UPDATE SQL을 추가로 실행해야 한다.
```java
// Team을 INSERT할 때, Member도 UPDATE 된다.
// Member 엔티티는 Team 엔티티를 모른다. 그리고 연관 관계에 대한 정보는 Team 엔티티의 member가 관리한다.
// 따라서, member 엔티티를 저장할 때 Member 테이블의 TeamId 외래 키에 아무 값도 저장되지 않는다.
// 대신, Team 엔티티를 저장할 때 Teaem.members의 참조 값을 확인해서 회원 테이블에 있는 teamId 외래 키를 업데이트한다.
public void testSave() {
    Member member1 = new Member("member1");
    Member member2 = new Member("member2");

    Team team1 = new Team("team1");
    team.getMembers.add(team1);
    team.getMembers.add(team2);

    em.persist(member1); // INSERT member 1
    em.persist(member2); // INSERT member 2
    em.persist(team); // INSERT team, UPDATE member1 fk, UPDATE member2 fk
}

public void testSave2() {
    Post post = new Post();
    post.setTitle("가입인사");

    em.persist(post); // INSERT post

    Board board = new Board();
    board.setTitle("자유게시판");
    board.getPosts().add(post);

    em.persist(board); // INSERT board, UPDATE post
}
```

<br/>

#### 일대다(1:N) 연관 관계 정리

__일대다 단방향 매핑보다는 다대일 양방향 관계 매핑을 사용한다.__  
__위와 같은 문제로, 일대다(1:N) 단방향 연관 관계 매핑이 필요한 경우에는 다대일(N:1) 양방향 연관 관계로 매핑하는 것이 추후 유지보수에 훨씬 수월하여 해당 방식을 채택하는 것이 좋다.__  

일대다 당방향 매핑을 사용하면 엔티티를 매핑한 테이블이 아닌 다른 테이블의 외래 키를 관리해야한다. 이것은 성능의 문제도 있지만 관리도 부담스럽다. 문제를 해겨하는 좋은 방법은 일대다 단방향매핑 대신에 다대일 양방향 매핑을 사용하는 것이다. 다대일 양방향 매핑은 관리해야하는 외래 키가 본인 테이블에 있다. 따라서 일대다 단방행 매핑 같은 문제가 발생하지 않는다. 두 매핑의 에이블 모양은 완전히 같으므로 엔티티만 약간 수정하면 된다. __상황에 따라 다르겠지만 일대다 단방향 매핑보다는 다대일 양방향 매핑을 권장한다.__  

<br/>

#### 일대다 양방향 (1:N, N:1)

일대다 양방향은 @JoinColumn(updatable = false, insertable = false) 어노테이션을 이용하여 가능하지만, 공식적으로 존재하는 것은 아니다.  

일대다 양방향 매핑은 존재 하지 않는다. 대신 다대일 양향향 매핑을 사용해야한다. 더 정확히 말하자면 양방향 매핑에수 @OneToMany는 연관관계의 주인이될 수없다. 왜냐하면 관계형 데이터베이스 특성상 일대다, 다대일, 관계는 항상 다쪽에 외래 키가 있다. 따라서 @OneToMany, @ManyToOne 둘 중에 연관관계의 주인은 항상 다 쪽인 @ManyToOne을 사용 한곳이다. 이런 이유로 @ManyToOne에는 mappedBy 속성이 없다.  

<br/>

### 5-4-3. 일대일(1:1)

테이블은 주 테이블이든 대상 테이블이든 외래 키 하나만 있으면 양쪽으로 조회할 수 있다. 그리고 일대일 관계는 반대쪽도 일대일 관계이다. 따라서, 일대일 관계는 주 테이블이나 대상 테이블 중 누가 외래 키를 가질 지 선택해야 한다.  

<br/>

#### 주 테이블에 외래 키

주 객체에 대상 객체를 참조하는 것처럼 주 테이블에 외래 키를 두고 대상 테이블을 참조한다. 해당 방법은 주 테이블의 외래 키(FK)를 가지고 있어 주 테이블만 확인해도 대상 테이블과 연관 관계가 있는지 알 수 있다.  

 - `단방향`
    - 일대일 관계로 객체 매핑에 @OneToOne을 사용한다.
```java
@Entity
class Member {
    @Id
    @GenratedValue
    @Column(name "MEMBER_ID")
    private Long id;

    private String username;

    @OneToOne
    @JoinColumn(name = "LOCKER_ID")
    private Locker locker;
}

@Entity
class Locker {
    @Id
    @GenratedValue
    @Column(name "LOCKER_ID")
    private Long id;

    private String name;
}
```

 - `양방향`
    - 양방향이므로 연관 관계의 주인을 지정해야 한다.
    - Member 테이블의 외래 키(FK)를 가지고 있으므로 Member 엔티티에 있는 Member.locker가 연관 관계의 주인이다.
```java
@Entity
class Member {
    @Id
    @GenratedValue
    @Column(name "MEMBER_ID")
    private Long id;

    private String username;

    @OneToOne
    @JoinColumn(name = "LOCKER_ID")
    private Locker locker;
}

@Entity
class Locker {
    @Id
    @GenratedValue
    @Column(name "LOCKER_ID")
    private Long id;

    private String name;

    @OneToOne(mappedBy = "locker")
    private Member member;
}
```

<br/>

#### 대상 테이블에 외래 키

대상 테이블에 외래 키를 두는 것으로 해당 방법은 테이블 연관 관계를 일대일에서 일대다로 변경할 떄 테이블 구조를 그대로 유지할 수 있다.  

 - `단방향`
    - 일대일 관계중 대상 테이블에 외래 키가 있는 단방향 관계는 JPA에서 지원하지 않는다.
    - 이때는 단방향 관계를 Locker에서 Member 방향으로 수정하거나, 양방향 관계를 만들고 Locker를 연관 관계의 주인으로 설정해야 한다.

<br/>

 - `양방향`
    - 일대일 매핑에서 대상 테이블에 외래 키를 두고 싶으면 해당 방식으로 양방향으로 매핑한다.
    - 주 엔티티 Member 엔티티 대신에 대상 엔티티 Locker를 연관 관계의 주인으로 만들어 Locker 테이블에 외래 키를 관리하도록 한다.
```java
@Entity
class Member {
    @Id
    @GenratedValue
    @Column(name "MEMBER_ID")
    private Long id;

    private String username;

    @OneToOne(mappedBy = "member")
    private Locker locker;
}

@Entity
class Locker {
    @Id
    @GenratedValue
    @Column(name "LOCKER_ID")
    private Long id;

    private String name;

    @OneToOne
    @JoinColumn(name = "MEMBER_ID")
    private Member member;
}
```

<br/>

### 5-4-4. 다대다(N:N)

관계형 데이터베이스는 정규화된 테이블 2개로 다대다 관계를 표현할 수 없다. 그래서 보통 다대다 관계를 일대다, 다대다 관계로 풀어내는 연결 테이블을 사용한다.  

<br/>

 - `단방향`
    - 회원과 상품을 @ManyToMany로 매핑한다.
    - @JoinTable name 속성: 연결 테이블을 지정한다. (MEMBER_PRODUCT 테이블)
    - @JoinTable joinColumn 속성: 현재 방향인 회원과 매핑할 조인 컬럼 정보를 지정한다. (MEMBER_ID 컬럼)
    - @JoinTable inverseJoinColumns 속성: 반대 방향인 상품과 매핑할 조인 컬럼 정보를 지정한다. (PRODUCT_ID 컬럼)
```java
@Entity
class Member {
    @Id @GenratedValue @Column(name "MEMBER_ID")
    private Long id;

    private String username;

    @ManyToMany
    @JoinTable(
        name = "MEMBER_PRODUCT",
        joinColumn = @JoinColumn(name = "MEMBER_ID"),
        inverseJoinColumns = @JoinColumn(name = "PRODUCT_ID"),
    )
}

@Entity
class Product {
    @Id @GenratedValue
    private Long id;
    private String name;
}
```

```java
// 다대다 관계 저장 코드
public void save(){
    Product productA = new Product();
    productA.setId("ProductA");
    productA.setNAme("상품A");
    em.persist();

    Member member1 = new Member();
    member1.setId("member1");
    member1.setUsername("회원1");
    member1.getProducts.add(productA); // 연관관계 지정
    em.persist();
}

/* 
# 다대다 관계 저장 SQL
INSERT INTO PRODUCT ...
INSERT INTO MEMBER ...
INSERT INTO MEMBER_PRODUCT ...
*/

// 객체 탐색
public void find(){
    Member member = em.find(Member.class, "member1");
    List<Product> products = member.getProducts(); // 객체 그래프 탐색
    for (Product product : products){
        print(product.getName());
    }
}
```

<br/>

 - `양방향`
    - 역방향도 @ManyToMany를 사용한다. 그리고 양쪽 중 원 하는 곳에 mappedBy로 연관 관계의 주인을 지정한다.
```java
// 역방향에 추가
@Entity
class Product {
    @Id @GenratedValue
    private Long id;
    private String name;

    @ManyToMany(mappedBy = "products") // 역방향 추가
    private List<Member> members;
}
```

<br/>

#### 다대다 매핑의 한계와 극복

@ManyToMany를 사용하면 연결 테이블을 자동으로 처리해주므로 도메인 모델이 단순해지고 여러 가지로 편리하다. 하지만 이 매핑을 실무에서 사용하기에는 한계가 있다. 예를 들어 회원 상품을 주문하면 연결 테이블에 다순히 주문한 회원 아이디와 상품 아이디만 담고 끝나지 않는다. 보통 연결 테이블에 주문 수량 칼럼이나 주문한 날짜 같은 컬럼이 더 필요하다.  

그렇다면 결국 연결 테이블을 매핑하는 연결 엔티티를 만들고 이곳에서 추가한 컬럼들을 매핑해야한다. 그리고 엔티티의 간의 관계도 테이블 관계처럼 다대다에서 일대다. 다대일 관계로 풀어야하다.  

```java
@Entity
class Member {
    @Id @GenratedValue @Column(name "MEMBER_ID")
    private Long id;

    private String username;

    // 역방향
    @OneToMany(mappedBy = "member")
    private List<MemberProduct> memberProducts;
}

@Entity
class Product {
    @Id @GenratedValue
    private Long id;
    private String name;
}

@Entity
@IdClass(MemberProductId.class)
class MemberProduct {
    
    @Id
    @ManyToOne
    @JoinColumn(name = "MEMBER_ID")
    private Member member; // MemberProductId.member와 연결

    @Id
    @ManyToOne
    @JoinColumn(name = "PRODUCT_ID")
    private Product product; // MemberProductId.member와 연결
}

class MemberProductId implemnts Serializable {
    
    private String member; // MemberProduct.member 와 연결
    private String product; // MemberProduct.product 와 연결

    //hashCode and equals
}
```

<br/>

#### 복합 기본 키

회원 상품 엔티티는 기본 키가 MEMBER_ID, PRODUCT_ID로 복합 키를 사용한다. JPA에서 복합 키를 사용하려면 별도의 식별자 클래스를 만들어야 한다. 그리고 엔티티에 @IdClass를 사용해서 식별자 클래스를 지정하면 된다.  
 - 복합 키는 별도의 실별자 클래스로 만들어야 한다.
 - Serializable을 구현해야 한다.
 - equals와 hashCode 메소드를 구현 해야한다
 - 기본 생성자가 있어야 한다
 - 실별자 클래스는 public 이여야 한다
 - @IdClass를 사용하는 방법 외에 @EmbeddedId를 사용 하는 방법도 있다.

<br/>

#### 식별 관계

회원 상품은 회원과 상품의 기본 키를 받아서 자신의 기본 키로 사용한다. 이렇게 부모 테이블의 기본 키를 바인딩해서 자신의 기본키 + 외래 키로 사용하는 것을 데이터베이스 용어로 식별 관계라 한다.  

종합하면, 회원 상품은 회원의 기본 키를 받아서 자신의 기본키로 사용함과 동시에 회원의 관계를 위한 외래 키로 사용한다. 그리고 상품의 기본 키로 받아서 자신의 기본 키로 사용함과 동시에 상품과의 관계를 위한 외래 키로 사용한다. 또한, MemberProductId 식별자 클래스로 두 기본 키를 묶어서 복합 기본 키로 사용한다.  

```java
// 저장 하는 코드
public void save(){
    // 회원 저장
    Member member1 = new Member();
    member.setId("member1");
    member.setUsername("회원1");
    em.persist(member1);

    // 상품 저장
    Product productA = new Product();
    productA.setId("productA");
    productA.setName("productA");
    em.persist(productA);
    
    // 회원상품 저장
    MemberProduct memberProduct = new MemberProduct();
    memberProduct.setMember(member1); // 주문 회원 - 완관괸계 설정
    memberProduct.setProduct(productA) // 주문 상품 - 연관관계 설정
    memberproduct.setOrderAmount(2); //  주문 수량
    em.persist(memberProduct)
}

// 조회 하는 코드
public void find(){
    
    //기본 키 값 설정
    MemberProductId memberProductId = new MemberProductId();
    memberProductId.setMember(member1);
    memberProductId.setProduct(productA);

    MemberProduct memberProduct = em.find(MemberProduct.class, memberProductId);
    
    Member member = memberProduct.getMember();
    Product product = memberProduct.getProduct();
}
```

<br/>

#### 다대다 새로운 기본 키 사용

추천하는 기본 키 생성 전략은 데이터베이스에서 자동으로 생성해주는 대리 키를 Long 값으로 사용하는 것이다. 이것의 장점은 간편하고 반영구적으로 쓸 수 있으며 비즈니스에 의존하지 않는다. 또한, ORM 매핑시에 복합 키를 만들지 않아도 된다.  

 - `엔티티`
```java
@Entity
class Order {
    @Id @GenratedValue @Column(name = "ORDER_ID")
    private Long id;

    @ManyToOne
    @JointColumn(name = "MEMBER_ID")
    private Member member;

    @ManyToOne
    @JointColumn(name = "PRODUCT_ID")
    private Product product;
    
    pviate int orderAmount;
}

@Entity
class Member {
    @Id @Column(name = "MEMBER_ID")
    private Long id;
    private String username;

    @OneToMany(mappedBy = "member")
    private List<Order> orders = new ArrayList<>();    
}

@Entity
class Product {
    @Id @Column(name = "PRODUCT_ID")
    private Long id;
}
```

 - `사용 코드`
```java
// 저장 하는 코드
public void save(){    
    // 회원 저장
    Member member1 = new Member();
    member1.setId("member1");
    member1.setUsername("회원1");
    em.persist(member1);

    // 상품 저장
    Product productA = new Product();
    productA.setId("productA");
    productA.setName("상품");
    em.persist(productA);

    // 주문 저장
    Order order = new Order(); 
    order.setMember(member1); // 주문 회원 - 연관관계 설정
    order.setProduct(productA); // 주문 상품 - 연관관계 설정
    order.setOderAmount(2); // 주문 수량
    em.persist(order);
}

// 조회 하는 코드
public void find(){
    Loing OrderId = 1L;
    Order order = en,find(Order.classm orderId);
    
    Member meber = order.getMember();
    Product product = order.getPRoduct();
}
```

<br/>

#### 다대다 연관 관계 정리

다대다 관계를 일대다 다대일 관계로 풀어내기 위한 연결 테이블을 만들 때 식별자 를 어떻게 구성할지 선택해야한다.
 - 식별 관계 : 받아온 식별자 기본 키 + 외래 키로 사용한다.
 - 비식별 관계: 받아온 식별자 외래 키로만 사용하고 새로운 식별자를 추가한다.

<br/>

## 6. 고급 매핑

 - 상속 관계 매핑 : 객체의 상속 관계를 데이터베이스에 어떻게 매핑하는지를 다룬다.
 - @MappedSuperclass: 등록일, 수정일 같이 여러 엔티티에서 공통으로 사용하는 매핑 정보만 상속 받고 싶으면 기능을 사용 하면된다.
 - 복합 키와 식별 관계 매핑: 데이터베이스의 식별자가 하나 이상일 때 매핑하는 방법을 다룬다. 그리고 데이터베이스 설계에서 이야기하는 식별 관계와 비식별관계에 대해서 다룬다
 - 조인 테이블: 테이블은 외래 키 하나로 연관관계를 맺을 수 있지만 연관관계를 관리하는 연결 테이블을 두는 방법도 있다. 여기서는 연결 테이블을 매핑하는 방법을 다룬다
 - 엔티티 하나에 여러 테이블을 매핑하기: 보통 엔티티 하나에 테이블 하나를 매핑하지만 엔티티 하나에 여러 테이블을 매핑하는 방법도 이다. 여기서는 이 매핑방법을 다룬다.

### 6-1. 상속 관계 매핑

관계형 데이터베이스는 객체지향 언어에서 다루는 상속이라는 개념이 없다. 대신에 슈퍼타입 서브타입 관계라는 모델링 기법이 객체의 상속 관계와 가장 유사하다. ORM에서 이야기하는 상속 관계 매핑은 객체상의 구조와 데이터베이스의 슈퍼 타입 서브 타입 관계를 매핑하는 것이다.  
 - 각각의 테이블로 변환: 모두 테이블로 만들고 조회할 때 조인을 사용한다. JPA에서는 조인 전략이라 한다.
 - 통합 테이블 변환: 테이블 하나만 사용해서 통합한다. JPA에서는 단일 테이블 전략이라고 한다
 - 서브타입 테이블로 변환: 서브 타입마다 하나의 테이블을 만든다. JPA에서는 구현 클래스 테이블 전략이라고 한다.

<br/>

### 조인 전략

조인 전략은 모두 테이블로 만들고 자식 테이블이 부모 테이블의 기본 키를 받아서 기본 키(PK) + 외래 키(FK)로 사용하는 전략이다. 따라서 조회할 떄는 조인을 자주 사용한다. 이 전략을 사용할 떄 주의할 점으로는 객체는 타입으로 구분할 수 있지만, 테이블은 타입의 개념이 없다. 때문에, 타입을 구분하는 컬럼을 추가해야 하는데 여기서 DTYPE 컬럼을 구분 컬럼으로 사용한다.  
 - __장점__
    - 테이블이 정규화된다.
    - 외래 키 참조 무결성 제약 조건을 활용할 수 있다.
 - __단점__
    - 조회할 떄 조인이 많이 사용되므로 성능이 저하될 수 있다.
    - 조회 쿼리가 복잡하다.
    - 데이터 등록할 INSERT SQL을 두 번 실행한다.
 - __특징__
    - JPA 표준 명세는 구분 컬럼을 사용하도록 한다. 하지만 하이버네이트를 포함한 몇몇 구현체는 구분 컬럼 없이 동작한다.
```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED) // 상속 매핑은 부모 클래스에 선언해야 한다. 
@DiscriminatorColumn(name = "DTYPE") // 부모 클래스에 구분 컬럼을 지정한다. 
public abstract class Item {

	@Id @GeneratedValue
	@Column(name = "ITEM_ID")
	private Long id;

	private String name; //이름
	private int price; //가격
	...
}

@Entity
@DiscriminatorValue("A") // 엔티티를 저장할 때 구분 컬럼에 입력할 값을 지정한다. 
public class Album extends Item {
  private String artist;
	...
}

@Entity
@DiscriminatorValue("M")
@PrimaryKeyJoinColumn(name = "MOVIE_ID") // 자식 테이블의 기본 키 컬럼명을 변경 (기본 값은 부모 테이블의 ID 컬럼명)
public class Movie extends Item {
  private String director; //감독
  private String actor; //배우
	...
}
```

<br/>

### 단일 테이블 전략

단일 테이블 전략은 이름 그대로 테이블 하나만 사용한다. 그리고 구분 컬럼으로 어떤 자식 데이터가 저장되어 있는지 구분한다.  
 - __장점__
    - 조인이 필요없으므로 일반적으로 조회 성능이 빠르다.
    - 조회 쿼리가 단순하다.
 - __단점__
    - 자식 엔티티가 매핑한 컬럼은 모두 NULL을 허용해야 한다.
    - 단일 테이블에 모든 것을 저장하므로 테이블이 커질 수 있다. 때문에, 상황에 따라서 조회 성능이 느려질 수도 있다.
 - __특징__
    - 구분 컬럼을 꼭 사용해야 한다.
```java
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "DTYPE") 
public abstract class Item {

	@Id @GeneratedValue
	@Column(name = "ITEM_ID")
	private Long id;

	private String name; //이름
	private int price; //가격
	...
}

@Entity
@DiscriminatorValue("A") 
public class Album extends Item {
	...
}

@Entity
@DiscriminatorValue("M") 
public class Movie extends Item {
	...
}
```

<br/>

### 구현 클래스 전략

구현 테이블 전략은 자식 엔티티마다 테이블을 만든다. 그리고 자식 테이블에 각각 필요한 컬럼이 모두 있다.  
 - __장점__
    - 서브 타입을 구분해서 처리할 때 효과적이다.
    - NOT NULL 제약조건을 사용할 수 있다.
 - __단점__
    - 여러 자식 테이블을 함께 조회할 때 성능이 느리다.
    - 자식 테이블을 통합해서 쿼리하기 어렵다.
 - __특징__
    - 구분 컬럼을 사용하지 않는다.
```java
@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public abstract class Item {

	@Id @GeneratedValue
	@Column(name = "ITEM_ID")
	private Long id;

	private String name; //이름
	private int price; //가격
	...
}
```

<br/>

### MappedSuperclass

부모 클래스는 테이블과 매핑하지 않고 부모 클래스를 상속 받은 자식 클래스에게 매핑 정보만 제공하고 싶으면 @MappedSuperclas를 사용하면 된다.  
 - 객체의 입장에서 공통 매핑 정보가 필요할 때 사용한다.
 - id, name은 객체의 입장에서 볼 때 계속 나온다.
 - 이렇게 공통 매핑 정보가 필요할 때, 부모 클래스에 선언하고 속성만 상속 받아서 사용하고 싶을 때 @MappedSuperclass를 사용한다.
 - __특징__
    - 직접 생성해서 사용할 일이 없어 추상 클래스로 만드는 것이 권장된다.
    - 테이블과 관계가 없고, 단순히 엔티티가 공통으로 사용하는 매핑 정보를 모으는 역할을 한다.
    - 주로 등록일, 수정일, 등록자, 수정자 같은 전체 엔티티에서 공통으로 적용하는 정보를 모을 때 사용한다.


<div align="center">
    <img src="./images/mapped_super_class.png">
</div>
<br/>

 - `코드로 이해하기`
    - 생성자, 생성시간, 수정자, 수정시간을 모든 엔티티에 공통으로 가져가야 하는 상황에서 아래와 같이 BaseEntity를 정의해서 활용할 수 있다.
```java
@Getter
@Setter
@MappedSuperclass
public abstract class BaseEntity {​
    private String createdBy;
    private LocalDateTime createdDate;
    private String lastModifiedBy;
    private LocalDateTime lastModifiedDate;
}

@Entity
public class Member extends BaseEntity{
    ..
}
```

<br/>

 - `BaseEntity 재정의하기`
    - 부모 엔티티로부터 물려받은 매핑 정보를 재정의 하려면 @AttributeOverrides, @AttributeOverride를 사용하고, 연관 관계를 재 정의하려면 @AssociationOverrides, @AssociationOverride를 사용한다.
```java
@MappedSuperclass
public abstract class BaseEntity {
    @Id @GeneratedValue
    @Column(name = "ID")
    private long id;

    @Column(name = "NAME")
    private String name;
}

@Entity
@AttributeOverrides({
        @AttributeOverride(name = "ID", column = @Column(name = "MEMBER_ID")),
        @AttributeOverride(name = "NAME", column = @Column(name = "MEMBER_NAME"))
})
public class Member extends BaseEntity {
    @Column(name = "EMAIL")
    private String email;
}
```

<br/>

