# SSE Spring 코드

 - https://inma.tistory.com/179
 - https://hamait.tistory.com/792
 - https://velog.io/@wnguswn7/Project-SseEmitter%EB%A1%9C-%EC%95%8C%EB%A6%BC-%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0
 - https://velog.io/@black_han26/SSE-Server-Sent-Events
 - https://medium.com/tech-pentasecurity/sse%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EB%8B%A4%EC%A4%91%EC%84%9C%EB%B2%84-%ED%99%98%EA%B2%BD%EC%97%90%EC%84%9C%EC%9D%98-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EC%95%8C%EB%9E%8C-%EA%B8%B0%EB%8A%A5-feat-hazelcast-topic-73ce4797f321
 - https://dkswnkk.tistory.com/702

## Javascript

SSE API는 EventSource 인터페이스 포함되어 있다. 이벤트를 전달 받기 위해서 서버로 접속을 시작하려면 이벤트를 생성하는 서버측 스크립트 URI를 지정하여 EventSource 객체를 생성한다.  
 - https://developer.mozilla.org/en-US/docs/Web/API/EventSource
```javascript
// 동일 도메인 접속
const eventSource = new EventSource('/sse/v2');

// 다른 도메인 접속
const eventSource = new EventSource('http://localhost:8080/sse/v2', {
    withCredentials: true,
})
```

 - 메시지 이벤트 핸들러 등록
    - EventSource 생성 후 Message 이벤트에 대한 핸들러를 등록하여 서버로부터 전송된 메시지를 수신한다.
```javascript
eventSource.onmessage = event => {
    console.log(event.data);
}

// 특정 메시지에만 호출
eventSource.addEventListener('ping', event => {
    console.log(event.data);
});
```

## 서버에서 이벤트 송신(HttpServletResponse)

이벤트를 송신하는 서버는 MIME 타입으로 'text/event-stream'을 사용해 응답해야 한다. 각 이벤트는 두 개의 줄바꿈으로 끝나는 텍스트 블럭으로 전송된다.  

 - 모든 작업이 끝난 후 response를 한 번에 보내는 것이 아닌, 데이터 형식에 맞는 데이터가 write 될 때마다 해당 데이터를 클라이언트로 전송한다.
```java
@RestController
public class SseController {

    private ExecutorService taskExecutor = Executors.newSingleThreadExecutor();

    @GetMapping(value = "/sse/v1", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public void v1(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Connection", "keep-alive");
        response.setHeader("Content-Type", MediaType.TEXT_EVENT_STREAM_VALUE);
        response.flushBuffer();
        for (int i = 0; i < 10; i++) {
            response.getWriter().write("event: pingping\n\n");
            response.getWriter().flush();
            Thread.sleep(1000);
        }
    }
}
```

## 서버에서 이벤트 송신(SseEmitter)

Spring Framework 4.2부터는 SSE를 보다 쉽게 사용할 수 있는 구현체인 SseEmitter를 제공한다. 해당 구현체를 사용하면 Content-Type, 데이터 포맷을 자동으로 맞춰주기 때문에 편리하게 사용할 수 있다.  

### 간단한 사용 예시

 - `Controller`
    - 클라이언트가 구독 API를 호출하면, 서버는 SseEmitter를 생성하고 저장한다.
```java
@GetMapping(value = "/event/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter subscribe(HttpServletRequest request, HttpServletResponse response) {
    String sessionId = request.getSession().getId();
    return sessionEventNotificationService.subscribe(sessionService.getSession(sessionId));
}
```

 - `EventNotificationService`
    - SseEmitter 생성 및 구독 기능
    - SseEmitter가 제공하는 onTimeout, onCompletion, onError 등의 콜백 메서드를 적극 활용하여 SseEmitte의 이벤트를 감지하고 map에서 해당 객체를 삭제하거나 그 외의 예외 처리를 통해서 꼭 정리가 필요하다.
```java
// 구독 메서드 
public SseEmitter subscribe(Session session) {
    SseEmitter emitter = createEmitter(session);
    return emitter;
}

// SseEmitter 생성 메서드 
private SseEmitter createEmitter(Session session) {

    // 생성자 파라미터로 타임아웃을 지정할 수 있다. 
    SseEmitter emitter = new SseEmitter(session.getMaxInactiveInterval().getSeconds());
    String sessionId = session.getId();
    sseLocalRepository.put(sessionId, emitter);

    // Emitter가 타임아웃 되었을 때(지정된 시간동안 어떠한 이벤트도 전송되지 않았을 때)
    emitter.onTimeout(() -> sseLocalRepository.deleteById(sessionId));

    // Emitter가 정상적으로 연결이 종료되었을 때
    emitter.onCompletion(() -> sseLocalRepository.deleteById(sessionId));

    // 에러 발생 시
    emitter.onError((t) -> {
       sseLocalRepository.deleteById(sessionId);
    });

    return emitter;
}

// 사용자에게 알림 발송이 필요한 시점에 이 메서드를 호출한다. 
public void notify(Session session, EventCode event) {
    // 사용자에게 푸시 알림을 발송한다.
    ... 
}
```

 - `SSELocaleRepository`
    - 알림 시스템에서는 여러 클라이언트가 동시에 구독하고 데이터를 전송할 수 있으므로, 동시성을 제어하는 것이 중요하다.
    - 그에 맞게 thread-safe한 ConcurrentHashMap을 사용하면서, 안전하게 저장할 수 있다.
```java
@Component
public class SSELocalRepository {

    private final Map<String, SseEmitter> sseEmitterMap = new ConcurrentHashMap<>();

    public void put(String key, SseEmitter sseEmitter) {
        sseEmitterMap.put(key, sseEmitter);
    }

    public Optional<SseEmitter> get(String key) {
        return Optional.ofNullable(sseEmitterMap.get(key));
    }

    public void deleteById(String key) {
        sseEmitterMap.remove(key);
    }
}
```

 - `클라이언트 코드`
    - 메시지를 받는 클라이언트는 JS의 EventSource를 통해 쉽게 SSE 연결을 맺고, 데이터를 전송받을 수 있다.
```java
var eventSource = new EventSource("/html/api/events");
eventSource.addEventListener('message', eventListener);

var eventListener = function (e) {
    const data = JSON.parse(e.data);
    if (data.code == "HI") {
        alert(data.msg);
    } else if (data.code == "BYE") {
        alert(data.msg);
        location.href = "/html/login";
    } 
};
```

### 간단한 사용 예시2

 - `Controller`
```java
public class NotificationController {

    private final NotificationService notificationService;
    
    @GetMapping(value = "/subscribe/{id}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable Long id, HttpServletResponse response) {
        return notificationService.subscribe(id, response);
    }

    @PostMapping("/send-data/{id}")
    public void sendData(@PathVariable Long id) {
        notificationService.notify(id, "data");
    }
}
```

 - `NotificationService`
    - SSE 특성상 한 번 데이터를 전송항 SSE Emitter는 단방향 통신을 위한 일회성 객체로 간주되어, 한 번 사용하고 나면 폐기되고 다시 생성해야 한다. 전송 중 오류가 발생하거나, 타임아웃이 발생했을 경우에도 마찬가지이다.
```java
public class NotificationService {
        
    //타임아웃 설정
    private static final Long DEFAULT_TIMEOUT = 60L * 1000 * 60;
   	private final NotificationRepository notificationRepository;

    // 구독 생성
    public SseEmitter subscribe(Long userId,final HttpServletResponse response) {
        SseEmitter emitter = createEmitter(userId);
        response.setContentType("text/event-stream");
        response.setCharacterEncoding("UTF-8");
        sendEvent(userId, "더미데이터" + userId + "]");
        return emitter;
    }

    // SSE Emitter 생성
    private SseEmitter createEmitter(Long id) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        //생성된 SSE Emitter를 저장소에 저장
        notificationRepository.save(id, emitter);

        // Emitter가 완료될 때(모든 데이터가 성공적으로 전송된 상태) Emitter를 삭제한다.
        emitter.onCompletion(() -> notificationRepository.deleteById(id));

        // Emitter가 타임아웃 되었을 때(지정된 시간동안 어떠한 이벤트도 전송되지 않았을 때) Emitter를 삭제한다.
        emitter.onTimeout(() -> notificationRepository.deleteById(id));

        return emitter;
    }

    // 데이터 전송
    private void sendEvent(Long sendId, Object data) {
        // SseEmitter 조회
        SseEmitter emitter = notificationRepository.get(sendId);
        if (emitter != null) {
            try {
                // 데이터를 클라이언트에게 실어보낸다.
                emitter.send(SseEmitter.event().id(String.valueOf(sendId)).name("변경").data(data));
            } catch (IOException exception) {
                // 데이터 전송 중 오류가 발생하면 Emitter를 삭제하고 에러를 완료 상태로 처리
                notificationRepository.deleteById(sendId);
                emitter.completeWithError(exception);
            }
        }
    }
    
}
```

 - `NotificationRepository`
    - Emitter 저장, Emitter 조회, Emitter 제거
```java
@Repository
@RequiredArgsConstructor
public class NotificationRepository {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    //Emitters 저장
    public void save(Long id, SseEmitter emitter) {
        emitters.put(id, emitter);
    }

    //Emitter 제거
    public void deleteById(Long id) {
        emitters.remove(id);
    }

    //Emitter 조회
    public SseEmitter get(Long id) {
        return emitters.get(id);
    }
}
```

 - `주의 사항`
    - Emitter를 생성한 후 만료 시간까지 아무 데이터도 보내지 않으면, 재연결 요청 시 503 Service Unavailable 에러가 발생할 수 있다. 이러한 상황을 방지하기 위해 초기 SSE 연결 시 더미 데이터를 전송하여 안전한 연결을 유지한다.
    - thread-safe한 구조를 사용하지 않으면 ConcurrnetModificationException이 발생할 수 있다. 타임아웃 발생 시 실행할 콜백이 SseEmitter를 관리하는 다른 스레드에서 실행되기 때문이다. CopyOnWriteArrayList를 사용할 수도 있다.
    - JPA를 사용하는 동안 open-in-view 속성을 true로 설정하면 DB Connection Pool에서 동시에 많은 클라이언트가 SSE 연결을 시도할 경우 DB 커넥션 고갈이 발생할 수 있다. 이를 방지하기 위해 SSE 연결 동안에는 open-in-view 속성을 false로 설정하여 HTTP Connection이 닫힐 때마다 DB Connection도 적절히 해제되도록 한다.

