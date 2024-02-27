# 게시판 API 개발

## 1. 기본 상식

### Rest API 규칙

REST(Representational State Transfer) API는 웹 기반의 서비스에서 리소스를 관리하고 상태를 전달하기 위한 표준화된 방법을 제공하는 아키텍처 스타일입니다.  

 - __명명 규칙__
    - 리소스는 명사로 표현하며, 복수형으로 사용합니다.
    - ex) /users, /products
 - __리소스에 대한 행위__
    - HTTP 메소드로 표현합니다.
    - ex) GET /users (리소스 조회)
    - ex) POST /users (리소스 생성)
 - __URI__
    - 각 리소스는 고유한 URI를 가져야 합니다.
    - URI는 리소스의 계층 구조를 나타내며, 명확하고 직관적으로 이해할 수 있어야 합니다.
 - __Stateless 통신__
    - 각 요청은 모든 필요한 정보를 포함하고 있어야 하며, 서버는 클라이언트의 상태를 저장하지 않습니다.
 - __Representation을 통한 통신__
    - 클라이언트와 서버 간의 통신은 리소스 표현을 통해 이루어집니다.
    - JSON, XML 등이 사용될 수 있습니다.
 - __헤더(Headers) 활용__
    - 헤더를 사용하여 메타데이터를 전달하거나, 캐싱, 인증, 인가 등의 정보를 처리합니다.
 - __HTTP 상태 코드 활용__
    - 적절한 HTTP 상태 코드를 반환하여 요청의 결과를 표현합니다.
    - ex) 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Internal Server Error 등

<br/>

### DTO와 공통 Response

 - __DTO(Data Transfer Object)__
    - DTO는 서비스 간 데이터 전달을 위한 객체로, 클라이언트와 서버 간의 데이터 전송에 사용됩니다. 주로 비즈니스 로직을 포함하지 않고, 데이터만을 보유하고 있는 POJO(Plain Old Java Object)로 구성됩니다.
```java
public class UserDTO {
    private Long id;
    private String username;
    private String email;
}
```

<br/>

 - __공통 Response 클래스__
    - 공통 Response 클래스는 API 응답의 일관된 형식을 정의하여 클라이언트에게 통일된 응답을 제공합니다.
    - 이를 통해 클라이언트는 일관된 구조로 응답을 처리할 수 있습니다.
```java
public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;
}
```

<br/>

### Log4j2와 로깅 전략

Log4j2는 Apache Logging Services Project의 한 부분으로, 강력하고 유연한 로깅 시스템으로 널리 사용되는 로깅 프레임워크입니다.  
로깅 레벨 설정은 로그의 중요도를 나타내며, Log4j2에서 TRACE, DEBUG, INFO, WARN, ERROR 등 다양한 레벨을 제공합니다. 로그 레벨은 각 로그 이벤트에 대해 출력할지 여부를 결정합니다.  

<br/>

### 예외처리 전략 탐구 및 개발

Spring Boot에서 예외 처리 전략은 애플리케이션에서 발생하는 예외를 효과적으로 처리하고 클라이언트에게 적절한 응답을 제공하는 것에 중점을 둡니다.  

 - __Controller Advice를 사용한 전역 예외 처리__
    - Spirng Framework에서 @ControllerAdvice 어노테이션을 사용하여 예외를 전역적으로 처리할 수 있는 컴포넌트를 생성할 수 있습니다.
    - 이를 통해 모든 컨트롤러에서 발생하는 예외를 한 곳에서 처리할 수 있습니다.
 - __@ExceptionHandler를 사용한 컨트로러별 예외 처리__
    - 각 컨트롤러에서 @ExceptionHandler 어노테이션을 사용하여 해당 컨트롤러에서 발생하는 예외를 처리할 수 있습니다.

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        ErrorResponse errorResponse = new ErrorResponse("Internal Server Error");
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```


