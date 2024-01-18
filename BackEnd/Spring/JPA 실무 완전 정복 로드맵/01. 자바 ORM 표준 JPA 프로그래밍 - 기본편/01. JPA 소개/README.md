# JPA 소개

객체 지향 프로그래밍은 추상화, 캡슐화, 정보은닉, 상속, 다형성 등 시스템의 복잡성을 제어할 수 있는 다양한 장치들을 제공한다.  

<br/>

 - `JPA`
    - Java Persistence API
    - 자바 진영의 ORM 기술 표준
    - JPA는 인터페이스의 모음
        - JPA 2.1 표준 명세를 구현한 3가지 구현체
        - 하이버네이트, EclipseLink, DataNucleus

<br/>

 - `ORM`
    - Object-relational mapping(객체 관계 매핑)
    - 객체는 객체대로 설계
    - 관계형 데이터베이스는 관계형 데이터베이스대로 설계
    - ORM 프레임워크가 중간에서 매핑
    - 대중적인 언어에는 대부분 ORM 기술이 존재

<br/>

## JPA 버전

- JPA 1.0(JSR 220) 2006년 : 초기 버전. 복합 키와 연관관계 기능이 부족
- JPA 2.0(JSR 317) 2009년 : 대부분의 ORM 기능을 포함, JPA Criteria 추가
- JPA 2.1(JSR 338) 2013년 : 스토어드 프로시저 접근, 컨버터(Converter), 엔티티 그래프 기능이 추가

<br/>

## JPA를 사용하는 이유

 - `SQL 중심적인 개발에서 객체 중심으로 개발`
 - `데이터 접근 추상화와 벤더 독립성`
 - `표준`

<br/>

 - `생산성`
```java
// 저장
jpa.persist(member)

// 조회
Member member = jpa.find(memberId)

// 수정
member.setName(“변경할 이름”)

// 삭제
jpa.remove(member)
```

<br/>

 - `유지보수`
    - 필드 변경시 모든 SQL 수정
```java
public class Member {
 private String memberId;
 private String name;
 private String tel;
 ...
}
```

 - `패러다임의 불일치 해결`
```
1.JPA와 상속
2.JPA와 연관관계
3.JPA와 객체 그래프 탐색
4.JPA와 비교하기
```

<br/>

- `성능`
    - 1차 캐시와 동일성(identity) 보장
    - 트랜잭션을 지원하는 쓰기 지연(transactional write-behind)
    - 지연 로딩(Lazy Loading)
```java
// 1차 캐시와 동일성 보장
    // 1. 같은 트랜잭션 안에서는 같은 엔티티를 반환 - 약간의 조회 성능 향상
    // 2. DB Isolation Level이 Read Commit이어도 애플리케이션에서 Repeatable Read 보장
String memberId = "100";
Member m1 = jpa.find(Member.class, memberId); //SQL
Member m2 = jpa.find(Member.class, memberId); //캐시
println(m1 == m2) //true

// 트랜잭션을 지원하는 쓰기 지연 - INSERT
    // 1. 트랜잭션을 커밋할 때까지 INSERT SQL을 모음
    // 2. JDBC BATCH SQL 기능을 사용해서 한번에 SQL 전송
transaction.begin(); // [트랜잭션] 시작
em.persist(memberA);
em.persist(memberB);
em.persist(memberC);
//여기까지 INSERT SQL을 데이터베이스에 보내지 않는다.
//커밋하는 순간 데이터베이스에 INSERT SQL을 모아서 보낸다.
transaction.commit(); // [트랜잭션] 커밋

// 트랜잭션을 지원하는 쓰기 지연 - UPDATE
    // 1. UPDATE, DELETE로 인한 로우(ROW)락 시간 최소화
    // 2. 트랜잭션 커밋 시 UPDATE, DELETE SQL 실행하고, 바로 커밋
transaction.begin(); // [트랜잭션] 시작
changeMember(memberA); 
deleteMember(memberB); 
비즈니스_로직_수행(); //비즈니스 로직 수행 동안 DB 로우 락이 걸리지 않는다. 
//커밋하는 순간 데이터베이스에 UPDATE, DELETE SQL을 보낸다.
transaction.commit(); // [트랜잭션] 커밋

// 지연 로딩과 즉시 로딩
    // • 지연 로딩: 객체가 실제 사용될 때 로딩
    // • 즉시 로딩: JOIN SQL로 한번에 연관된 객체까지 미리 조회
Member member = memberDAO.find(memberId);
Team team = member.getTeam();
String teamName = team.getName();
```

