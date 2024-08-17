# SSE(Server-Sent Events)

SSE(Server-Sent Events)는 클라이언트와 서버 간의 일방향 통신을 위한 웹 표준입니다. 주로 웹 애플리케이션에서 서버에서 클라이언트로 실시간 데이터를 푸시(push)할 때 사용됩니다.  

 - 일방향 통신: SSE는 서버에서 클라이언트로 데이터를 지속적으로 보내는 방식입니다. 클라이언트는 연결을 열고 서버에서 보내는 이벤트를 수신할 수 있지만, 반대로 클라이언트에서 서버로 데이터를 보낼 수는 없습니다. 이러한 방식은 예를 들어 뉴스 피드 업데이트, 주식 가격 변동, 채팅 메시지 등 실시간으로 변하는 데이터를 제공할 때 유용합니다.
 - 텍스트 기반 프로토콜: SSE는 텍스트 기반이며, 서버가 전송하는 데이터는 텍스트 형태로 클라이언트에 전달됩니다. 서버는 각 메시지를 event:와 data:로 구분하며, 여러 줄에 걸쳐 이벤트를 전송할 수 있습니다.
 - 자동 재연결: 클라이언트가 SSE 연결을 잃을 경우, 브라우저는 자동으로 연결을 다시 시도합니다. 또한, 서버는 클라이언트가 마지막으로 받은 메시지의 ID를 기억하여 재연결 시 중단된 부분부터 데이터를 전송할 수 있습니다.
 - 브라우저 지원: 대부분의 최신 웹 브라우저는 SSE를 기본적으로 지원합니다. 그러나 Internet Explorer와 같은 구형 브라우저에서는 지원이 제한적일 수 있습니다.
 - JavaScript API: 클라이언트 측에서는 JavaScript의 EventSource 객체를 사용하여 SSE를 구현합니다. 이를 통해 클라이언트는 서버에서 보낸 데이터를 이벤트 핸들러를 통해 처리할 수 있습니다.

## 해당 개념이 필요한 이유

HTTP 프로토콜의 특징은 비연결성으로 서버가 클라이언트에게 알림을 보낼 수 없다. 이를 해결하기 위한 방식으로는 폴링, 긴 폴링, 소켓, SSE 4가지 방식이 존재한다.  
 - 폴링(Polling)
    - 클라이언트가 주기적으로 서버로 요청을 보내는 방식
    - 일정 시간마다 클라이언트가 서버로 요청을 보내 데이터 갱신이 있는지 확인하고, 갱신이 되면 응답을 받는 방식이다.
    - 구현이 단순하지만, 계속 요청을 해야한다는 점에서 리소스 낭비가 발생한다.
 - 롱 폴링(Long Polling)
    - 유지 시간을 조금 더 길게 갖는다는 점에서 폴링과 차이점이 존재한다.
    - 요청을 보내고 서버에서 변경이 일어날 때까지 대기하는 방법이다.
    - 실시간 전달이 중요한데 상태가 빈번하게 갱신되지 않을 때 적합하다.
    - 지속적으로 연결되어 있기 때문에, 다수의 클라이언트가 동시에 이벤트가 발생하면 순간적으로 부담이 급증한다.
 - 웹 소켓(Web Socket)
    - 웹 소켓은 HTTP와 같은 프로토콜의 일종으로 양방향 통신을 실현하기 위한 구조이다.
    - 최초 접속은 HTTP 요청을 이용한 핸드쉐이킹으로 이루어지며, HTTP와 같이 연결 후 끊어버리는 것이 아니라 계속적으로 Connection을 지속하므로 연결에 드는 불필요한 비용을 제거할 수 있다.
        - 최초 HTTP 요청으로 접속 후 응답으로 101(Switchinbg Protocols)를 받는다.
        - "Sec-WebSocket-Key" 헤더를 통해 받은 값에 특정 값을 붙인 후 SHA-1로 해싱하고 base64로 인코딩한 값을 "Sec-WebSocket-Accept" 헤더에 보낸다.
        - 이 값을 통해 클라이언트는 정상적인 핸드쉐이크 과정을 검증한다.
        - 클라이언트가 정상적으로 응답을 받으면 핸드쉐이크는 종료되고 이후부터 웹소켓 프로토콜을 통해 데이터 통신을 한다.
 - SSE(Server-Sent-Events)
    - SSE는 웹 소켓과 달리, Client가 서버로부터 데이터만 받을 수 있는 방식이다.
    - SSE는 별도의 프로토콜을 사용하지 않고 HTTP 프로토콜만으로 사용할 수 있어 구현이 용이하다.

## SSE 통신 과정

 - [Client] SSE Subscribe 요청
    - 클라이언트측에서 서버의 이벤트 구독을 위한 요청을 보낸다.
    - 이벤트의 미디어 타입은 'text/event-stream'이 표준으로 정해져 있다.
```
GET /connect HTTP/1.1
Accept: text/event-stream
Cache-Control: no-cache
```

 - [Server] Subscription에 대한 응답
    - Response의 미디어 타입은 'text/event-stream' 이다.
    - 이때, Transfer-Encoding 헤더의 값을 chunked로 설정하는데, 서버는 동적으로 생성된 컨텐츠를 스트리밍하기 때문에 본문의 크기를 미리 알 수 없기 때문이다.
```
HTTP/1.1 200
Content-Type: text/event-stream;charset=UTF-8
Transfer-Encoding: chunked
```

 - [Server] 이벤트 전달
    - 클라이언트에서 Subscribe를 하면, 서버는 해당 클라이언트에게 비동기적으로 데이터를 전송할 수 있다.
    - 서로 다른 이벤트는 '\\n\\n'로 구분되며, 각각의 이벤트는 한 개 이상의 'name;value'로 구성된다.
```
event: type1
data: An event of type1.

event: type2
data: An event of type2.
```

## Spring 코드

1. 클라이언트에서 SSE 연결 요청을 보낸다.  
2. 서버에서는 클라이언트와 매핑되는 SSE 통신 객체를 만든다.  
3. 서버에서 이벤트가 발생하면 해당 객체를 통해 클라이언트로 데이터를 전달한다.  

<div align="center">
    <img src="./images/SSE_1.png"><br/>
    <img src="./images/SSE_2.png">
</div>

 - 클라이언트 SSE 연결 요청
```javascript
const sse = new EventSource("http://localhost:8080/connect");
```

 - SSE 통신
    - Spring Framework 4.2부터 SSE 통신을 지원하는 SseEmitter API를 제공한다.
```java
import java.io.IOException;  
import lombok.extern.slf4j.Slf4j;  
import org.springframework.http.MediaType;  
import org.springframework.http.ResponseEntity;  
import org.springframework.web.bind.annotation.GetMapping;  
import org.springframework.web.bind.annotation.RestController;  
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;  
  
@RestController  
@Slf4j  
public class SseController {  
  
    private final SseEmitters sseEmitters;  
  
    public SseController(SseEmitters sseEmitters) {  
        this.sseEmitters = sseEmitters;  
    }  
  
    @GetMapping(value = "/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)  
    public ResponseEntity<SseEmitter> connect() {  
        SseEmitter emitter = new SseEmitter();  
        sseEmitters.add(emitter);
        try {  
            emitter.send(SseEmitter.event()  
                    .name("connect")  
                    .data("connected!"));  
        } catch (IOException e) {  
            throw new RuntimeException(e);  
        }  
        return ResponseEntity.ok(emitter);  
    }  
}
```

### 추가 옵션

 - 만료 시간 설정
    - 생성자를 통해 만료시간을 설정할 수 있다.
    - 기본 값을 서버에 따라 다르며, 스프링 내장 톰캣 사용시 30초로 설정된다.
    - 만료시간이 되면 브라우저에서 자동으로 서버에 재연결 요청을 보낸다.
```java
SseEmitter emitter = new SseEmitter(60 * 1000L);
```

 - 클라이언트 정보 저장
    - 생성된 SseEmitter 객체는 향후 이벤트가 발생했을 때, 해당 클라이언트로 이벤트를 전송하기 위해 사용되므로 서버에서 저장하고 있어야 한다.
```java
sseEmitters.add(emitter);
```

 - 주의 사항
    - Emitter를 생성하고 나서 만료 시간까지 아무런 데이터도 보내지 않으면 재연결 요청시 503 Service Unavailable 에러가 발생할 수 있다.
    - 따라서 처음 SSE 연결시 더미 데이터를 전달하는 것이 안전하다.
```java
emitter.send(SseEmitter.event()  
        .name("connect")         // 해당 이벤트의 이름 지정
        .data("connected!"));    // 503 에러 방지를 위한 더미 데이터
```

 - 클라이언트 처리
    - 이벤트 이름 설정시 클라이언트에서 해당 이름으로 이벤트를 받을 수 있다.
```javascript
const sse = new EventSource("http://localhost:8080/connect");

sse.addEventListener('connect', (e) => {
	const { data: receivedConnectData } = e;
	console.log('connect event data: ',receivedConnectData);  // "connected!"
});
```

 - 만료 처리
    - SseEmitter를 생성할 때 비동기 요청이 완료되거나 타임아웃 발생 시 실행할 콜백을 등록할 수 있다.
    - 타임아웃이 발생하면 브라우저에서 재연결 요청을 보내는데, 이때 새로운 Emitter 객체를 다시 생성하기 때문에 기존의 Emitter를 제거해주어야 한다.
    - 때문에, onCompletion 콜백에서 자기 자신을 지우도록 등록한다.
    - 해당 콜백은 SseEmitter를 관리하는 다른 쓰레드에서 실행된다. 즉, thread-safe한 자료구조를 사용하지 않으면 ConcurrentModificationException이 발생할 수 있다.
```java
@Component  
@Slf4j  
public class SseEmitters {  
  
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();  
  
    SseEmitter add(SseEmitter emitter) {  
        this.emitters.add(emitter);  
        log.info("new emitter added: {}", emitter);  
        log.info("emitter list size: {}", emitters.size());  
        emitter.onCompletion(() -> {  
            log.info("onCompletion callback");  
            this.emitters.remove(emitter);    // 만료되면 리스트에서 삭제
        });  
        emitter.onTimeout(() -> {  
            log.info("onTimeout callback");  
            emitter.complete();  
        });  
  
        return emitter;  
    }  
}
```

## 주의사항

### 503 Service Unavailable

 - 첫 SSE 응답시 아무런 이벤트도 보내지 않으면 재연결 요청시나 연결 요청 자체에서 오류가 발생한다.
 - 때문에, 첫 SSE 응답을 보낼 때에는 반드시 더미 데이터라도 넣어서 데이터를 전달한다.

### 헤더에 토큰 전달

 - SSE 연결 요청시 헤더에 JWT를 담아서 보낼필요가 잇을 때, EventSource 인터페이스는 기본적으로 헤더 전달을 지원하지 않는 문제가 있다.
 - 이떄, event-source-polyfill을 사용하면 헤더를 함께 보낼 수 있다.
    - https://www.npmjs.com/package/event-source-polyfill

### JPA 사용시 Connection 고갈 문제

 - SSE 통신을 하는 동안 HTTP Connection이 계속 열려있다. 만약, SSE 연결 응답 API에서 JPA를 사용하고 'open-in-view' 속성을 true로 설정했다면, HTTP Connection이 열려있는 동안 DB Connection도 같이 열려있게 된다.
    - 이 경우 'open-in-view' 설정을 반드시 false로 설정한다.

### ConcurrentModificationException

 - onCompletion, onTimeout 콜백은 별도의 쓰레드에서 호출된다.
 - 만약, 이 콜백을 통해 SseEmitter 객체가 담긴 컬렉션에 연산을 한다면 해당 컬렉션은 thread-safe한 자료구조를 사용해야 한다.

### Nginx 사용시 주의사항

<div align="center">
    <img src="./images/SSE_3.png">
</div>

 - Nginx는 기본적으로 Upstream으로 요청을 보낼 때 HTTP/1.0 버전을 사용한다.
 - HTTP/1.1은 지속 연결이 기본이기 때문에 헤더를 따로 설정해줄 필요는 없지만, Nginx에서 백엔드 WAS로 요청을 보낼 때는 HTTP/1.0을 사용하고 Connectiton: close 헤더를 사용하게 된다.
    - SSE는 지속 연결이 되어 있어야 동작하는데 Nginx에서 지속 연결을 닫아버려 제대로 동작하지 않는다.
    - 떄문에, 아래와 같은 옵션을 추가해야 제대로 동작한다.
```
# Nginx 설정 추가
proxy_set_header Connection '';
proxy_http_version 1.1;
```

 - 또한, Nginx의 proxy buffering 기능도 조심해야 한다.
    - SSE 통신에서 서버는 기본적으로 응답에 'Transfer-Encoding: chunked'를 사용한다. SSE는 서버에서 동적으로 생성된 컨텐츠를 스트리밍하기 때문에 본문의 크기를 미리 알 수 없다.
    - Nginx는 서버의 응답을 버퍼에 저장해두었다가 버퍼가 차거나 서버가 응답 데이터를 모두 보내면 클라이언트로 전송한다.
    - 문제는 버퍼링 기능을 활성화하면 SSE 통신 시 원하는대로 동작하지 않거나 실시간성이 떨어지게 된다. 따라서 SSE 응답에 대해서는 proxy buffering 설정을 비활성화 해주는 것이 좋다.




## 참고

 - https://tecoble.techcourse.co.kr/post/2022-10-11-server-sent-events/
