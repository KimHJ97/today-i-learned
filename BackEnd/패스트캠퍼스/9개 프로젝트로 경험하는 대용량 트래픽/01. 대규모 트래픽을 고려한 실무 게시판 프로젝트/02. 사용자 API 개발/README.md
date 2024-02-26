# 사용자 API 개발

## 1. 기본 상식

### Spring MVC

Spring MVC는 자바 기반의 웹 애플리케이션 개발을 위한 프레임워크로서, Model-View-Controller(MVC) 아키텍처를 기반으로 합니다. 이는 웹 애플리케이션을 개발할 때 코드를 구조화하고 관리하기 위한 방법론입니다.  

 - Model(모델): 데이터와 비즈니스 로직을 나타냅니다. 데이터의 상태를 관리하고 비즈니스 로직을 수행합니다.
 - View(뷰): 사용자 인터페이스를 나타냅니다. 데이터의 시각적 표현을 담당하며, 사용자에게 정보를 표시하고 사용자 입력을 처리합니다.
 - Controller(컨트롤러): 모델과 뷰 간의 상호 작용을 관리하고 조정합니다. 사용자의 입력을 받아 모델을 업데이트하고, 변경된 모델을 뷰에 반영합니다.

<br/>

### REST-API란

REST(API)는 Representational State Transfer의 약자로, 웹 서비스를 위한 아키텍처적인 스타일입니다. RESTful API는 이 웹 서비스 아키텍처를 기반으로 한 API를 말합니다.  

REST는 리소스(Resource)를 URI(Uniform Resource Identifier)를 통해 표현하고, 해당 리소스에 대한 행위(조회, 생성, 수정, 삭제 등)를 HTTP 메소드(GET, POST, PUT, DELETE 등)를 사용하여 수행합니다. RESTful API는 이러한 원칙에 따라 설계되어 클라이언트와 서버 간에 통신을 효율적으로 할 수 있도록 합니다.  

 - 표현을 통한 데이터 전송(Representation): 클라이언트와 서버 간에 데이터는 JSON, XML, HTML 등과 같은 표현 형식을 사용하여 전송됩니다.
 - 통일된 인터페이스(Uniform Interface): 일관된 인터페이스를 통해 클라이언트와 서버 간의 상호 작용을 단수화하고, 시스템의 아키텍처를 개선합니다.

<br/>

### JDBC란

JDBC는 자바 프로그래밍 언어를 사용하여 관계형 데이터베이스와 연결하여 상호 작용하기 위한 자바 API 입니다. JDBC를 사용하면 자바 애플리케이션에서 데이터베이스와 통신하여 데이터베이스에서 데이터를 검색, 삽입, 업데이트, 삭제할 수 있습니다.  

```java

static final String JDBC_DRIVER = "com.mysql.cj.jdbc.Driver";
static final String JDBC_URL = "jdbc:mysql://localhost:3306/test";
static final String JDBC_USERNAME = "root";
static final String JDBC_PASSWORD = "1234";

public static void main(String[] args) throw Exception {
    Connection connection = null;
    PreparedStatement preparedStatement = null;
    ResultSet resultSet = null;

    try {
        // JDBC 드라이버 로드
        Class.forName(JDBC_DRIVER);

        // 데이터베이스 연결
        connection = DriverManager.getConnection(JDBC_URL, JDBC_USERNAME, JDBC_PASSWORD);

        // SQL 쿼리 작성
        String sqlQuery = "SELECT * FROM table";

        // PreparedStatement 생성
        preparedStatement = connection.prepareStatement(sqlQuery);

        // SQL 쿼리 실행
        resultSet = prearedStatement.executeQuery();

        // 결과 처리
        while (resultSet.next()) {
            // 결과에서 필요한 데이터 추출
            int id = resultSet.getInt("id");
            String name = resultSet.getString("name");

            // 원하는 처리
            System.out.println("ID: " + id + ", Name: " + name);
        }
    } catch (ClassNotFoundException | SQLException e) {
        e.printStackTrace();
    } finally {
        // 리소스 해제
        resultSet.close();
        preparedStatement.close();
        connection.close();
    }
}
```

<br/>

### MyBatis

MyBatis는 자바 언어를 위한 오픈 소스 객체 관계 매핑(ORM) 프레임워크로서 데이터베이스에 접근하여 SQL 쿼리를 실행하고 결과를 자바 객체로 매핑하는 기능을 제공합니다. MyBatis는 SQL 자바 코드의 분리를 강조하며, 복잡한 SQL 쿼리를 쉽게 작성하고 관리할 수 있도록 도와줍니다.  

```java
@Mapper
public interface UserMapper {

    @Select("SELECT * FROM user")
    List<User> getAllUsers();

    @Select("SELECT * FROM user WHERE id = #{id}")
    User getUserById(Long id);

    @Insert("INSERT INTO user(name, email) VALUES(#{name}, #{email})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insertUser(User user);

    @Update("UPDATE user SET name = #{name}, email = #{email} WHERE id = #{id}")
    void updateUser(User user);

    @Delete("DELETE FROM user WHERE id = #{id}")
    void deleteUser(Long id);

}
```

<br/>

### Session

Spring Boot 세션(Session)은 Spring Boot 프레임워크에서 제공하는 세션 관리 기능을 의미합니다. 세션은 클라이언트와 서버 간의 상태를 유지하고 관리하기 위한 메커니즘으로, HTTP 프로토콜은 상태를 유지하지 않는 특성을 가지고 있습니다. 그러나 세션을 사용하면 클라이언트의 상태를 추적하고 필요한 정보를 유지할 수 있습니다.  

<br/>

### SHA256 암호화

SHA-256은 Secure Hash Algorithm 256-bit 버전으로, 암호학적 해시 함수의 한 종류입니다. 해시 함수는 임의의 길이의 데이터를 고정된 길이의 해시 값으로 변환하는 알고리즘입니다. SHA-256은 256비트(32바이트) 길이의 해시 값을 생성하며, 보안적으로 안전하다고 여겨지는 해시 함수 중 하나입니다.  

```java
@Log4j2
public class SHA256Util {

    public static final String ENCRYPTION_TYPE = "SHA-256";

    public static String encryptSHA256(String str) {
        String encryptedMessage = null;
        MessageDigest messageDigest;

        try {
            messageDigest = MessageDigest.getInstance(ENCRYPTION_TYPE);
            messageDigest.update(str.getBytes());
            byte[] byteData = messageDigest.digest();
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < byteDAte.length; i++) {
                sb.append(Integer.toString((byteData[i] & 0xff) + 0x100, 16).substring(1));
            }
            encryptedMessage = sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("암호화 에러: ", e);
        }

        return encryptedMessage;
    }
}
```

<br/>

### 사용자 API 목록

 - POST {url}/users/sign-up
 - POST {url}/users/sign-in
 - GET {url}/users/my-info
 - PUT {url}/users/logout
 - PATCH {url}/users/password
 - DELETE {url}/users

<br/>

## 2. 프로젝트 만들기

 - https://start.spring.io
```
★ Project
 - Gradle - Groovy

★ Language
 - Java

★ Spring Boot
 - 3.1.5

★ Project Metadata
 - Group: com.fastcampus
 - Artifact: boardserver
 - Name: boardserver
 - Description: 대규모 트래픽 게시판 프로젝트
 - Package name: com.fastcampus.boardserver
 - Packaging: Jar
 - Java: 17

★ Dependencies
 - Lombok
 - Spring Web
```

<br/>

