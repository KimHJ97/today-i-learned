# 자바 11의 주요 변경 내용

## 자바 11 특징 (2018년 9월)

자바 11은 자바 10이 출시된지 6개월 후에 출시된 LTS 버전이다.  

<br/>

## 언어적 변경 내용

자바 11에서 새로운 문법 추가는 없었고, 단지 자바 10에서 등장한 var을 람다식 매개변수에 적용이 가능하게 개선되었다.  

 - 사실 람다식 안에 매개변수 타입을 쓰지 않아도 사용이 가능하다.
 - 하지만, 타입을 명시해야 어노테이션을 붙일 수 있다.
```java
// String 타입을 명시적으로 작성해 준 람다식
Consumer<String> c1 = (String x) -> System.out.println(x);

// 자바 11 부터 람다식에 var을 사용할 수 있다.
Consumer<String> c2 = (var x) -> System.out.println(x);

// 람다식 매개변수에 어노테이션 정의
Consumer<String> c3 = (@Nullable var x) -> System.out.println(x);
```
<br/>

## 주요 API 변경 내용

 - strip(): 띄어쓰기 혹은 탭 같은 white space를 앞 뒤로 제거하는 함수
 - stripLeading(): 앞 부분의 white space만 제거
 - stripTrailing(): 뒷 부분의 white space만 제거
```java
String str = "  A BC  ";
System.out.println(str.strip()); // "A BC"
```
<br/>

 - isBlank(): 특정 문자열이 white space로만 구성되어 있다면 true
```java
String str1 = "A";
System.out.println(str1.isBlank()); // false

String str2 = "    ";
System.out.println(str2.isBlank()); // true
```
<br/>

 - lines(): 개행 문자를 기준으로 문자열을 쪼개 문자열 Stream을 반환
```java
String str = "A\nB"

str.lines()
    .forEach(System.out::println);
```
<br/>

 - repeat(): 반복 횟수를 파라미터로 받아, 주어진 문잦열을 반복해 이어붙인 문자열을 반환
```java
String str = "AB";
System.out.println(str.repeat(3)); // "ABABAB"
```
<br/>

### Collection API 업데이트

 - toArray(): 컬렉션을 배열로 쉽게 만들 수 있다.
```java
// 기존에는 배열을 직접 만들어 옮겨야 했다.
List<String> strings = List.of("A", "B", "C");

String[] strArray = new String[3];
String[] result = strings.toArray(strArray);

// toArray()
List<String> strings = List.of("A", "B", "C");
String[] result = strings.toArray(String[]::new);
```
<br/>

### Predicate 간단 기능 추가

Predicate.not()으로 주어진 조건을 반대로 전환할 수 있게 되었다.  
이것은 조절할 수 없는 메서드 조건을 반대로 적용해야 할 떄 유용하게 사용할 수 있다.  

```java
List<String> strings = List.of("A", " ", "  ");

List<String> result = strings.stream()
        .filter(Predicate.not(String::isBlank))
        .collect(Collectors.toList());
```
<br/>

### Files 클래스 기능 추가

파일 내용 전체를 문자열로 읽어 들이거나, 문자열 전체를 파일에 써야할 때 유용한 메서드가 추가되었다.  

```java
// 파일 읽기
var path = Paths.get(Paths.get(".").toAbsolutePath() + "/xxx-api/test.txt");
String str = Files.readString(path);
System.out.println(str);

// 파일 쓰기
Files.writeString(path, str);
```
<br/>

### 새로운 HTTP Client

자바를 이용해 HTTP 요청을 주고 받을 수 있는 API가 추가되었다.  

 - 기존부터 HttpUrlConnection 라는 HTTP Cleint가 있었다.
    - 자바의 초창기부터 존재했던 만큼 몇 가지 불편함이 존재한다. 때문에, 보통 외부라이브러리(Apache HttpClient, OkHttp, Jetty HttpClient)를 사용하였다.
    - HTTP/2.0, HTTP/1.1 지원이 불가능
    - 비동기 처리 불가능
    - 사용하거나 유지보수하는 것이 매우 어려움
 - 새로운 HttpClient는 자바 9에서 인큐베이팅 모듈로 등장하여, 자바 11에서 표준 모듈로 인정되었다.
    - HTTP/2.0, HTTP/1.1 지원
    - WebSocket 지원
    - CompletableFuture를 이용한 비동기 메커니즘 지원
    - 람다와 같은 새로운 언어 시스템 우호적

<br/>

#### 새로운 HTTP Client 사용하기

요청은 HttpRequest, 응답은 HttpResponse<T>, 요청을 보내 응답을 받는 클라이언트는 HttpClient를 사용한다.  
HttpClient가 자바 20부터는 AutoCloseable를 구현하고 있다. 자바 11에서는 AutoCloseable를 구현하고 있지 않다.  

 - `module-info.java`
    - 해당 기능이 자바 base 모듈에 있는 것이 아니기 떄문에, 해당 모듈을 임포트해주어야 한다.
```java
module com.api {
    // ..

   requires java.net.http;
}
```
<br/>

 - `GET 요청 예시(동기)`
    - HttpClient.send()는 HTTP 요청을 동기적으로 처리한다.
    - HttpClient 생성, HttpRequest 생성, HttpClient에 HttpRequest로 요청 처리, HttpResponse 응답 정의가 필요하다.
```java
// GET 요청
var client = HttpClient.newHttpClient();

var request = HttpRequest.newBuilder(URI.create("https://postman-echo.com/post"))
    .GET()
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
String statusCode = response.statusCode();
String body = response.body();

client.close();
```
<br/>

 - `GET 요청 예시(비동기)`
    - 비동기 요청은 HttpClient.sendAsync()를 사용한다.
    - HttpClient를 만들 때, 쓰레드 풀을 지정해 줄 수도 있다. (HttpClient.newBuilder().executor())
```java
public static void main(String[] args) {
    // HttpClient 생성
    var client = HttpClient.newHttpClient();

    // HttpRequest 생성
    var request = HttpRequest.newBuilder(URI.create("https://postman-echo.com/post"))
        .GET()
        .build();

    // HttpClient로 요청 전송(비동기)
    HttpResponse<String> response = client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenAccept((response) -> {
                // 비동기 요청으로 다른 쓰레드에서 응답이 받아진다.
                printlnWithThread(response.statusCode());
                printlnWithThread(response.body());
            });
    
    client.close();
}

private static void printlnWithThread(Object obj) {
    System.out.printf("%s %s\n", Thread.currentThread().getName(), obj);
}
```
<br/>

 - `POST 요청 예시`
```java
    public static void main(String[] args) throws Exception {
        var client = HttpClient.newHttpClient();

        var request = HttpRequest.newBuilder(URI.create("https://postman-echo.com/post"))
            .POST(HttpRequest.BodyPublishers.ofString("{\"num\": 1}"))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        printlnWithThread(response.statusCode());
        printlnWithThread(response.body());

        client.close();
    }

    private static void printlnWithThread(Object obj) {
        System.out.printf("%s %s\n", Thread.currentThread().getName(), obj);
    }
```
<br/>

#### 새로운 HTTP Client의 의미

외부 의존성을 추가하기 어려운 상황에서 사용하기 괜찮은 HTTP Client가 표준 라이브러리에 등장하였다.  
또한, 상황에 따라서 HTTP Cleint 구현체를 변경할 수 있는데 스프링 프레임워크 6.1 부터는 JdkClientHttpRequestFacotry 클래스가 추가되어 RestTempalte를 사용할 때 구현체를 Java 11의 HttpClient를 사용하도록 설정할 수도 있다.  
 - HTTP Client 비교 사이트: https://wiremock.io/post/java-http-client-comparison

<br/>

## 알아두면 좋은 추가적인 변경 내용

새로운 GC인 ZGC가 최초 공개되었다.  
ZGC는 G1GC와 유사하게 바둑판 모양으로 메모리를 관리하며, G1GC보다 훨씬 큰 애플리케이션을 대상으로 한 가비지 컬렉션이다.  

