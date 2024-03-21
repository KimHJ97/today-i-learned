# MyBatis Java API와 SQL Builder

 - MyBatis Java API: https://mybatis.org/mybatis-3/java-api.html
 - Mapper: https://mybatis.org/mybatis-3/sqlmap-xml.html
 - Dynamic SQL: https://mybatis.org/mybatis-3/dynamic-sql.html
 - MyBatis SQLBuilder 클래스: https://mybatis.org/mybatis-3/ko/statement-builders.html

<br/>

## SQLBuilder 를래스

SQL Builder 클래스를 이용하여 Java 환경에서 SQL을 만들 수 있다.  
SQL을 정의하는 클래스를 만들고, Mapper에서 해당 클래스의 함수와 연결시켜 사용한다.  
@InsertProvider, @UpdateProvider, @DeleteProvider, @SelectProvider 어노테이션과 함께 사용한다.  
그 외에도 Java 내부적으로 동적 SQL, Bulk Insert 등도 이용할 수 있다.  

 - `PostMapperSql`
```java
public class PostMapperSql {

    // 조회 SQL
    public String selectPostAll() {
        return new SQL()
            .SELECT("id, title, content, writer, createdAt")
            .FROM("post")
            .toString()
    }

    // 등록 SQL
    public String insertPost() {
        return new SQL()
            .INSERT_INTO("post")
            .VALUES("title", "#{title}")
            .VALUES("content", "#{content}")
            .VALUES("writer", "#{writer}")
            .VALUES("createdAt", "NOW()")
            .toString();
    }

    public String insertPost2() {
        return new SQL() {{
            INSERT_INTO("post");
            VALUES("title", "#{title}");
            VALUES("content", "#{content}");
            VALUES("writer", "#{writer}");
            VALUES("createdAt", "NOW()");
        }}.toString();
    }

    // 삭제 SQL
    public String deletePost() {
        return new SQL()
            .DELETE_FROM("post")
            .WHERE("id = #{id}")
            .toString();
    }
}
```
<br/>

 - `PostMapper`
    - @XxxProvider 어노테이션을 통해 수행할 SQL이 정의된 메서드와 연동한다.
    - 파라미터가 2개 이상인 경우 @Param 어노테이션을 정의하고, SQL 부분에서 해당 매개변수명을 통해 접근한다.
```java
@Mapper
public interface PostMapper {

   @SelectProvider(type = PostMapperSql.class, method = "selectPostAll")
   int findPosts();

   @InsertProvider(type = PostMapperSql.class, method = "insertPost")
   int savePost(PostSaveRequest request);

   @DeleteProvider(type = PostMapperSql.class, method = "deletePost")
   int deletePost(Long id);
}
```
<br/>

### SQLBuilder 클래스 예제

SQL 클래스는 생성된 명령문에 LIMIT, OFFSET, OFFSET n ROWS 및 FETCH FIRST n ROWS ONLY 절을 그대로 기록한다는 점에 유의해야 합니다. 대상 데이터베이스가 해당 키워드를 지원하지 않는 경우 런타임 오류가 발생할 수 있습니다.  

```java
/* SELECT */
public String selectPerson() {
  return new SQL()
    .SELECT("P.ID", "A.USERNAME", "A.PASSWORD", "P.FULL_NAME", "D.DEPARTMENT_NAME", "C.COMPANY_NAME")
    .FROM("PERSON P", "ACCOUNT A")
    .INNER_JOIN("DEPARTMENT D on D.ID = P.DEPARTMENT_ID", "COMPANY C on D.COMPANY_ID = C.ID")
    .WHERE("P.ID = A.ID", "P.FULL_NAME like #{name}")
    .ORDER_BY("P.ID", "P.FULL_NAME")
    .toString();
}

/* INSERT */
public String insertPerson() {
  return new SQL()
    .INSERT_INTO("PERSON")
    .INTO_COLUMNS("ID", "FULL_NAME")
    .INTO_VALUES("#{id}", "#{fullName}")
    .toString();
}

/* UPDATE */
public String updatePerson() {
  return new SQL()
    .UPDATE("PERSON")
    .SET("FULL_NAME = #{fullName}", "DATE_OF_BIRTH = #{dateOfBirth}")
    .WHERE("ID = #{id}")
    .toString();
}

/* Bulk Insert */
public String insertPersons() {
  // INSERT INTO PERSON (ID, FULL_NAME)
  //     VALUES (#{mainPerson.id}, #{mainPerson.fullName}) , (#{subPerson.id}, #{subPerson.fullName})
  return new SQL()
    .INSERT_INTO("PERSON")
    .INTO_COLUMNS("ID", "FULL_NAME")
    .INTO_VALUES("#{mainPerson.id}", "#{mainPerson.fullName}")
    .ADD_ROW()
    .INTO_VALUES("#{subPerson.id}", "#{subPerson.fullName}")
    .toString();
}

/* LIMIT .. OFFSET */
public String selectPersonsWithOffsetLimit() {
  // SELECT id, name FROM PERSON
  // LIMIT #{limit} OFFSET #{offset}
  return new SQL()
    .SELECT("id", "name")
    .FROM("PERSON")
    .LIMIT("#{limit}")
    .OFFSET("#{offset}")
    .toString();
}

/* OFFSET ROWS .. FETCH FIRST */
public String selectPersonsWithFetchFirstSql() {
  // SELECT id, name FROM PERSON
  // OFFSET #{offset} ROWS FETCH FIRST #{limit} ROWS ONLY
  return new SQL()
    .SELECT("id", "name")
    .FROM("PERSON")
    .OFFSET_ROWS("#{offset}")
    .FETCH_FIRST_ROWS_ONLY("#{limit}")
    .toString();
}
```

## Mapper 어노테이션

초기 MyBatis는 XML 기반 프레임워크로 SQL 문을 XML로 정의하였다.  
MyBatis 3+ 부터는 Java 기반 구성 API 기능을 제공하여 어노테이션 내부에 SQL을 정의하여 사용할 수 있게 되었다.  
 - @Insert, @Update, @Delete, @Select 어노테이션을 사용하여 SQL을 정의할 수 있다.
 - @Options: 매핑된 SQL에 대해서 추가적인 설정을 할 수 있다. (useGeneratedKeys, timeout 등)
 - @ResultMap, @ResultType: SQL 수행 후 결과에 대한 컨버터 타입

```java
// SELECT SQL
@Select("SELECT * FROM post")
Post findPosts();

// INSERT SQL
@INSERT("INSERT INTO post(title, content, writer, createdAt) VALUES (#{title}, #{content}, #{writer}, NOW())")
@Options(useGeneratedKeys = true, keyProperty = "id")
int savePost(PostSaveRequest request);

@DeleteProvider(type = PostMapperSql.class, method = "deletePost")
int deletePost(Long id);

// SELECT SQL: Results 예시
@Results(id = "userResult", value = {
    @Result(property = "id", column = "uid", id = true),
    @Result(property = "firstName", column = "first_name"),
    @Result(property = "lastName", column = "last_name")
})
@Select("SELECT * FROM users WHERE id = #{id}")
User getUserById(Integer id);

@Results(id = "companyResults")
@ConstructorArgs({
    @Arg(column = "cid", javaType = Integer.class, id = true),
    @Arg(column = "name", javaType = String.class)
})
@Select("SELECT * FROM company WHERE id = #{id}")
Company getCompanyById(Integer id);
```
<br/>

### 동적 SQL

기존 XML에서 제공하는 스크립트를 사용하기 위해서는 SQL문에 script를 명시해주어야 한다.  

```java
@Mapper
public interface PostMapper {

   @SelectProvider("""
    <script>
        SELECT title, content, writer, createdAt
        FROM post
        WHERE 1=1
        <if test='id != null and id != ""'>
            id = #{id}
        </if>
    </script>
    """)
   int findPostById(Long id);

}
```
