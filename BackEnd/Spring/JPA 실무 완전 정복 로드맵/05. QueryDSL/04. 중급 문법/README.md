# 중급 문법

## 1. 프로젝션과 결과 반환 - 기본

프로젝션은 SELECT 절에 가져올 대상을 지정하는 것을 말한다.  

 - 프로젝션 대상이 하나면 타입을 명확하게 지정할 수 있다.
 - 프로젝션 대상이 둘 이상이면 튜플이나 DTO로 조회한다.
```java
// 프로젝션 대상이 하나인 경우
@Test
public void simpleProjection() {
    List<String> result = queryFactory
            .select(member.username)
            .from(member)
            .fetch();
    
    for (String s: result) {
        System.out.println("s = " + s);
    }
}
```
<br/>

### 튜플 조회

튜플은 QueryDSL에서 제공하는 클래스이다.  
떄문에, Repository 계층에서 사용하는 것은 괜찮지만 Service 계층까지 넘어가는 것은 좋지 않다.  

```java
@Test
public void tupleProjection() {
    List<Tuple> result = queryFactory
            .select(member.username, member.age)
            .from(member)
            .fetch();
    
    for (Tuple tuple: result) {
        String username = tuple.get(member.username);
        Integer age = tuple.get(member.age);
        System.out.println("username = " + username);
        System.out.println("age = " + age);
    }
}
```
<br/>

## 2. 프로젝션과 결과 반환 - DTO 조회

 - `MemberDto`
    - 프로젝션용 DTO
```java
@Data
@NoArgsConstrcutor
@AllArgsConstrcutor
public class MemberDto {
    private String username;
    private int age;
}
```
<br/>

### 순수 JPA에서 DTO 조회 코드

 - 순수 JPA에서 DTO를 조회할 때는 new 명령어를 사용해야 한다.
 - DTO의 패키지 이름을 전부 적어주어야 한다.
 - 생성자 방식만 지원한다.
```java
@Test
public void findDtoByJPQL() {
    List<MemberDto> result = em.createQuery("select new 패키지.MemberDto(m.username, m.age) from Member m", MemberDto.class)
            .getResultList();

    for (MemberDto memberDto: result) {
        System.out.println("memberDto = " + memberDto);
    }
}
```
<br/>

### QueryDSL 빈 생성

QueryDSL은 3가지 방식을 지원한다.  
 - 프로퍼티 접근(Setter)
 - 필드 직접 접근
 - 생성자 사용

<br/>

#### 프로퍼티 접근(Setter)

Dto 클래스의 Setter 메서드로 프로퍼티를 접근한다.

 - 기본 생성자와 Setter 메서드가 필요하다.
 - Projections.bean() 메서드를 사용한다.
```java
@Test
public void findDtoBySetter() {
    List<MemberDto> result = queryFactory
            .select(
                Projections.bean(
                    MemberDto.class,
                    member.username,
                    member.age
                )
            )
            .from(member)
            .fetch();
}
```
<br/>

#### 필드 직접 접근

 - Getter와 Setter가 필요없이 필드에 바로 접근한다.
 - Projections.fields() 메서드를 사용한다.
```java
@Test
public void findDtoByField() {
    List<MemberDto> result = queryFactory
            .select(
                Projections.fields(
                    MemberDto.class,
                    member.username,
                    member.age
                )
            )
            .from(member)
            .fetch();
}
```
<br/>

#### 생성자 사용

 - 생성자를 이용한다.
```java
@Test
public void findDtoByConstructor() {
    List<MemberDto> result = queryFactory
            .select(
                Projections.constructor(
                    MemberDto.class,
                    member.username,
                    member.age
                )
            )
            .from(member)
            .fetch();
}
```
<br/>

#### 별칭이 다른 경우

 - 
```java
// 예제용 Dto
@Data
public class UserDto {
    private String name;
    private int age;
}

// Member 엔티티에서는 username을 사용한다. -> AS로 별칭 부여
// JPAExpressions으로 서브 쿼리를 수행하고, ExpressionUtils로 별칭을 부여한다.
@Test
public void findUserDtoByField() {
    QMember memberSub = new QMember("memberSub");

    List<MemberDto> result = queryFactory
            .select(
                Projections.fields(
                    UserDto.class,
                    member.username.as("name"),
                    // ExpressionUtils.as(member.username, "name"),
                    ExpressionUtils.as(
                        JPAExpressions
                            .select(memberSub.age.max())
                            .from(memberSub), 
                            "age"
                    )
                )
            )
            .from(member)
            .fetch();
}
```
<br/>

## 3. 프로젝션과 결과 반환 - @QueryProjection

 - `MemberDto`
    - 프로젝션용 DTO
    - DTO 안에 @QueryProjection이 있으면, compileQuerydsl TASK 수행시 DTO도 Q 클래스가 생성된다.
    - 이 방법은 컴파일러로 타입을 체크할 수 있으므로 가장 안전한 방법이다. 다만 DTO에 QueryDSL 어노테이션을 유지해야 하는 점과 DTO까지 Q 파일을 생성해야 하는 단점이 있다.
```java
@Data
@NoArgsConstrcutor
public class MemberDto {
    private String username;
    private int age;

    @QueryProjection
    public MemberDto(String username, int age) {
        this.username = username;
        this.age = age;
    }
}
```
<br/>

 - `@QueryProjection 사용 예시`
```java
@Test
public void findDtoByQueryProjection() {
    List<MemberDto> result = queryFactory
            .select(new QMemberDto(member.username, member.age))
            .from(member)
            .fetch();

    for (MemberDto memberDto: result) {
        System.out.println("memberDto = " + memberDto);
    }
}
```
<br/>

## 4. 동적 쿼리 - BooleanBuilder 사용

QueryDSL로 동적 쿼리를 사용하는 방법으로 2가지가 있다.  
 - BooleanBuilder
 - Where 다중 파라미터 사용

<br/>

### BooleanBuilder

```java
@Test
public void dynamicQuery_BooleanBuilder() {
    String username = "member1";
    Integer age = 10;

    List<Member> result = searchMember1(username, age);
    assertThat(result.size()).isEqualTo(1);
}

private List<Member> searchMember1(String usernameCond, Integer ageCond) {
    BooleanBuilder builder = new BooleanBuilder();

    if (usernameCond != null) {
        builder.and(member.username.eq(usernameCond));
    }

    if (ageCond != null) {
        builder.and(member.age.eq(ageCond));
    }

    return queryFactory
            .selectFrom(member)
            .where(builder)
            .fetch();
}
```
<br/>

### Where 다중 파라미터 사용

 - where() 메서드에는 여러 개의 파라미터를 넘길 수 있다.
 - 이떄, null 값은 무시된다. 이러한 특징으로 동적 쿼리를 만들 수 있다.
 - 메서드로 만들어, 해당 메서드 내부에서 NULL 검증을 하고 값이 있으면 BooleanExpression을 만든다. 메서드로 만들면 다른 쿼리에서도 재활용할 수 있다.
 - 쿼리 자체의 가독성도 높아진다.
```java
@Test
public void dynamicQuery_WhereParam() {
    String username = "member1";
    Integer age = 10;

    List<Member> result = searchMember2(username, age);
    assertThat(result.size()).isEqualTo(1);
}

private List<Member> searchMember2(String usernameCond, Integer ageCond) {
    return queryFactory
            .selectFrom(member)
            .where(usernameEq(usernameCond), ageEq(ageCond))
            .fetch();
}

private BooleanExpression usernameEq(String usernameCond) {
    return usernameCond != null ? member.username.eq(usernameCond) : null;
}

private BooleanExpression usernameEq(Integer ageCond) {
    return ageCond != null ? member.age.eq(ageCond) : null;
}

// 조합 기능: null 체크는 주의해서 처리
private BooleanExpression allEq(String usernameCond, Integer ageCond) {
    return usernameEq(usernameCond).and(ageEq(ageCond));
}
```
<br/>

## 5. 수정, 삭제 벌크 연산

쿼리 한 번으로 대량의 데이터를 수정한다.  
떄문에, Bulk 연산은 영속성 컨텍스트를 무시하고 DB에 바로 수행한다.  
 - 영속성 컨텍스트와 DB의 상태가 다를 수 있어 주의해야 한다.
 - 해결하기 위해서는 Bulk 연산 수행 후에 em.flush()와 em.clear() 메서드를 호출해준다. (영속성 컨텍스트 초기화)
```java
// 수정
@Test
public void bulkUpdate() {
    // Bulk 연산 수행
    long count = queryFactory
            .update(member)
            .set(member.username, "비회원")
            .where(member.age.lt(28))
            .execute();
    
    // 영속성 컨텍스트에 존재하는 경우 영속성 컨텍스트에서 조회한다.
    List<Member> result = queryFactory
            .selectFrom(member)
            .fetch();

}

// 더하기 연산
@Test
public void bulkAdd() {
    long count = queryFactory
            .update(member)
            .set(member.age, member.age.add(1))
            .execute();
}

// 삭제
@Test
public void bulkDelete() {
    long count = queryFactory
            .delete(member)
            .where(member.age.gt(18))
            .execute();
}
```
<br/>

## 6. SQL Function 호출하기

SQL Function은 JPA와 같이 Dialect에 등록된 내용만 호출할 수 있다.  
 - Dialect에 등록되지 않은 함수를 사용하기 위해서는 Dialect를 상속받은 클래스를 만들고, 등록해야 한다.
 - LOWER() 같은 ANSI 표준 함수들은 QueryDSL이 상당 부분 내장하고 있다.

```java
@Test
public void sqlFunction() {
    List<String> result = queryFactory
            .select(
                Expressions.stringTemplate(
                    "function('replace', {0}, {1}, {2})", 
                    member.username,
                    "member",
                    "M"
                )
            )
            .from(member)
            .fetch();
    
    for (String s: result) {
        System.out.println("s = " + s);
    }
}

@Test
public void sqlFunction2() {
    List<String> result = queryFactory
            .select(member.username)
            .from(member)
/*
            .where(
                member.username.eq(
                    Expressions.stringTemplate(
                        "function('lower', {0})",
                        member.username
                    )
                )
            )
*/
            .where(
                member.username.eq(member.username.lower())
            )
            .fetch();

    for (String s: result) {
        System.out.println("s = " + s);
    }
}
```

