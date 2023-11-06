# MyBatis 1:N 관계 쿼리

MyBatis에서 1:N 관계 테이블을 조회하는 경우가 있다.  
예를 들어, 게시글과 게시글에 첨부된 파일 목록을 한 번에 조회하는 경우가 있을 수 있다.  
이러한 경우 게시글 하나를 조회하고, 해당 게시글의 첨부 파일을 List로 조회하여 2번의 DB 접근으로 데이터를 만들거나, ResultMap을 이용하여 자동으로 게시글의 첨부 파일까지 조회하여 객체로 반환받을 수 있다.  

<br/>

## 메소드 2번 호출

게시글을 조회하고, 해당 게시글에 연관된 파일 List를 조회한다.  

 - DTO
```Java
class Post {
    private Long id;
    private String title;
    private String content;
    private List<PostFile> files;
}

class PostFile {
    private Long postId;
    private String filePath;
    private String fileName;
}
```

 - XML
```XML
<select id="findPostById" parameterType="HashMap" resultType="Post">
    SELECT id, title,content
    FROM post
    WHERE id = #{id}
</select>

<select id="findPostFileById" parameterType="HashMap" resultType="">
    SELECT postId, filePath, fileName
    FROM postfile
    WHERE postId = #{postId}
</select>
```

 - 게시글과 파일 합치기
```Java
public Post searchPost(Long id) {
    Post post = postMapper.findById(id);
    post.setFiles(postFileMapper.findPostFileById(id));
    return post;
}
```

<br/>

## ResultMap (Nested Select)

ResultMap을 정의하여 한 번에 메소드 호출을 통해 게시글과 연관 파일 List를 조회한다.  
해당 방식은 1 + N 문제가 발생하게 된다.  

 - DTO
```Java
class Post {
    private Long id;
    private String title;
    private String content;
    private List<PostFile> files;
}

class PostFile {
    private Long postId;
    private Long fileId;
    private String filePath;
    private String fileName;
}
```

 - XML
    - ResultMap으로 컬럼과 변수 매칭 정보를 명시해주고, collection으로 List를 만들어준다.
    - result
        - property: 변수 매칭
        - column: 컬럼 매칭
    - collection
        - property: 컬렉션 변수 매칭
        - column: 컬럼 매칭 (collection 쿼리의 바인드 변수로 전달된다.)
        - javaType: 컬렉션 타입 지정
        - ofType: 객체 타입 지정
        - select: SELECT 쿼리
    - collection으로 파라미터를 2개 이상 넘기고 싶은 경우 아래와 같이 정의한다.
        - collection 쿼리의 parameterType을 "java.util.Map"으로 지정한다.
        - column은 {속성명=값,속성명2=값} 형식으로 넘긴다. (column="{boardId=boardId,writer=writer}")
```XML
<resultMap id="postResultMap" type="Post">
    <result property="id" column="id">
    <result property="title" column="title">
    <result property="content" column="content">
    <collection property="files" column="id" javaType="java.util.ArrayList" ofType="PostFile" select="findPostFileById">
</resultMap>

<select id="findPostById" parameterType="java.util.Map" resultMap="postResultMap">
    SELECT id, title,content
    FROM post
    WHERE id = #{id}
</select>

<select id="findPostFileById" parameterType="java.util.Map" resultType="PostFile">
    SELECT fileId, postId, filePath, fileName
    FROM postfile
    WHERE postId = #{postId}
</select>
```

<br/>

## ResultMap (Nested Result)

N + 1 문제를 해결하기 위해서는 Nested Result 방식을 이용할 수 있다.  
JOIN을 이용하여 Select 쿼리를 만들어 한 번에 쿼리만 수행하도록 하고, ResultMap으로 결과를 매핑시킨다.  

 - XML
    - association: has one 관계로 객체를 받을 때 사용한다.
    - collection: has many 관계로 컬렉션을 받을 때 사용한다.
```XML
<!-- ResultMap1 -->
<resultMap id="postResultMap" type="Post">
    <id property="id" column="id"/>
    <result property="title" column="title">
    <result property="content" column="content">
    <collection property="files" column="id" javaType="java.util.ArrayList" ofType="PostFile">
   		<id property="fileId" column="fileId"/>
        <result property = "postId" column="postId"/>
      	<result property = "filePath" column="filePath"/>
      	<result property = "fileName" column="fileName" />
  </collection>
</resultMap>

<!-- ResultMap2 -->
<resultMap id="postResultMap" type="Post">
    <id property="id" column="id"/>
    <result property="title" column="title">
    <result property="content" column="content">
    <collection property="files" resultMap="postFileResultMap"></collection>
</resultMap>
<resultMap id="postFileResultMap" type="PostFile">
    <id property="fileId" column="fileId"/>
    <result property = "postId" column="postId"/>
    <result property = "filePath" column="filePath"/>
    <result property = "fileName" column="fileName" />
</resultMap>

<!-- ResultMap3: PostDTO안에 Post와 List<PostFile>이 있는 구조 -->
<resultMap id="postResultMap" type="PostDTO">
    <association property="post" column="id" select="postResultMap"></association>
    <collection property="files" resultMap="postFileResultMap"></collection>
</resultMap>
<resultMap id="postResultMap" type="Post">
    <id property="id" column="id"/>
    <result property="title" column="title">
    <result property="content" column="content">
</resultMap>
<resultMap id="postFileResultMap" type="PostFile">
    <id property="fileId" column="fileId"/>
    <result property = "postId" column="postId"/>
    <result property = "filePath" column="filePath"/>
    <result property = "fileName" column="fileName" />
</resultMap>

<!-- Select SQL -->
<select id="findPostById" parameterType="java.util.Map" resultMap="postResultMap">
    SELECT A.id
         , A.title
         , A.content
         , B.fileId
         , B.postId
         , B.filePath
         , B.fileName
    FROM post A
        LEFT JOIN postFile B ON A.id = B.postId
    WHERE id = #{id}
</select>
```

<br/>

## 참고

 - https://gojoo.tistory.com/95
 - https://noritersand.github.io/mybatis/mybatis-1-n-%EA%B4%80%EA%B3%84-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%B2%98%EB%A6%AC-data-concatenation/
 - https://velog.io/@bahar-j/Mybatis-1N-%EA%B4%80%EA%B3%84-%ED%85%8C%EC%9D%B4%EB%B8%94%EC%97%90%EC%84%9C-Select
 - https://deveric.tistory.com/74
 - https://lotuus.tistory.com/71
