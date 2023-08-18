# Pub/Sub을 이용해 손 쉽게 채팅방 기능 구현하기

## Pub/Sub 패턴

Publish/Subscribe (Pub/Sub) 패턴은 소프트웨어 아키텍처 디자인 패턴 중 하나로, 다양한 컴포넌트나 시스템 간의 비동기적인 통신을 위해 사용되는 패턴입니다. 이 패턴은 발행(Publish)과 구독(Subscribe) 단계로 나누어지며, 이를 통해 컴포넌트는 직접적인 의존성 없이 정보를 교환할 수 있습니다.  

<br/>

이 패턴에서 발행자(Publisher)는 특정 주제(토픽)에 관련된 데이터를 생성하고 해당 주제에 대한 메시지를 전송합니다. 구독자(Subscriber)는 원하는 주제에 대한 구독을 등록하고, 발행자가 해당 주제에 대한 메시지를 전송하면 이를 받아 처리할 수 있습니다. 구독자는 발행자와 직접적인 상호작용을 하지 않으며, 발행자 역시 구독자들을 알 필요 없이 메시지를 발행할 수 있습니다. 이를 통해 느슨한 결합(Loose Coupling)을 갖는 시스템을 구성할 수 있습니다.
 - 메시징 모델 중의 하나로 발행(Publish)과 구독(Subcribe) 역할로 개념화한 형태
 - 발행자와 구독자는 서로에 대한 정보 없이 특정 주제(토픽 or 채널)를 매개로 송수신
 - 느슨한 결합: 발행자와 구독자 간의 직접적인 의존성이 없으므로, 각 컴포넌트를 독립적으로 개발하고 유지보수할 수 있습니다.
 - 확장성: 시스템이 커질 때도 발행자와 구독자의 수를 유연하게 확장할 수 있습니다. 새로운 발행자와 구독자를 추가해도 시스템의 전체적인 아키텍처를 수정할 필요가 없습니다.
 - 비동기 통신: 발행자와 구독자 간의 통신이 비동기적으로 이루어지므로, 시스템의 유연성과 응답성이 향상될 수 있습니다.
 - 이벤트 중심 아키텍처: 이 패턴은 이벤트 중심 아키텍처를 지원하며, 상황에 맞게 이벤트를 처리하고 반응할 수 있는 구조를 제공합니다.
 - Kafka, RabbitMQ, ActiveMQ 등

<br/>

### Redis의 Pub/Sub 특징

 - 메시지가 큐에 저장되지 않음
    - 현재 구독중인 Subcribe에게만 메시지가 전송됨
 - Kafka의 컨슈머 그룹같은 분산 처리 개념이 없음
    - 카프카에서는 토픽에 메시지를 발행하면, 해당 토픽을 컨슘하는 그룹이 있고, 그 그룹에 속한 서버 하나가 메시지를 처리하면 나머지 서버들은 동일한 메시지를 처리하지 않는다.
    - 하지만, 레디스 Pub/Sub는 모든 Subscribe에게 메시지를 전송하게 되어있다.
 - 메시지 발행 시 push 방식으로 subscriber들에게 전송
    - 카프카는 메시지 발행시 폴링 방식
    - 레디스는 push 방식으로 Publish에서 발행시 바로 Subscribe에게 메시지가 전달된다.
 - Subscribe가 늘어날수록 성능 저하가 발생
    - 발행된 메시지가 모든 Subscribe에 전송된다.

<br/>

### Redis의 Pub/Sub 유즈케이스

 - 실시간으로 빠르게 전송되어야 하는 메시지
 - 메시지 유실을 감내할 수 있는 케이스
 - 최대 1회 전송(at-most-once) 패턴이 적합한 경우
 - Subscriber들이 다양한 채널을 유동적으로 바꾸면서 한시적으로 구독하는 경우

<br/>

---
## Redis Pub-Sub을 이용한 채팅방 구현

 - 채팅방 기능의 요구사항
    - 채팅 클라이언트와 채팅 서버가 존재하고 통신 방식을 정해야 함 (프로토콜)
    - 채팅 서버는 채팅방 관리 로직을 작성해야 함
    - 클라이언트: 채팅방 입장, 메시지 전송, 메시지 수신
    - 채팅 서버: 채팅방 생성, 채팅방 접속자 관리, 채팅방 메시지 수신/전송
 - 채팅방 기능을 Publish/Subscribe 구조를 이용해 구현
    - 클라이언트
        - 채팅방 입장: 채널 구독
        - 메시지 전송: 채널에 Publish
        - 메시지 수신: 채널 구독에 따른 Listener 구현
    - 채팅 서버
        - 채팅방 생성: 채널 사용으로 대체
        - 채팅방 접속자 관리: 필요 없음 (클라이언트 메시지 전송시 Publish 되면 구독된 클라이언트에게 모두 자동으로 보내진다.)
        - 채팅방 메시지 수신/전송: 필요 없음 (수신과 전송도 Redis Pub/Sub의 메시징 기능)

<br/>

### 소스 코드

 - build.gradle
   - Redis 의존성 추가
```
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-redis'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

 - application.yml
   - Redis 접속 정보 설정
```YML
spring:
  redis:
    host: localhost
    port: 6379
```

 - RedisConfig
   - RedisMessageListenerContainer: Redis에서 발행된 메시지를 리스닝하고 처리하는 기능을 제공하는 클래스
```Java
@Configuration
public class RedisConfig {

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory();
    }

    @Bean
    RedisMessageListenerContainer redisContainer() {
        final RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory());
        return container;
    }
}
```

 - ChatService
   - MessageListener: Redis Pub/Sub 메시지를 처리하는데 사용되는 인터페이스입니다. 이 인터페이스는 Redis 채널로부터 수신한 메시지를 처리하는 메서드를 정의하고 있습니다.
   - onMessage(Message message, byte[] pattern): Subcribe에 수신된 메시지가 있으면 자동으로 비동기 호출이 된다.
   - enterCharRoom(String chatRoomName): CLI 프로젝트로 클라이언트가 접속하면 container에 메시지 리스너를 등록하고, Scanner의 nextLine() 함수로 메시지 입력을 기다리게 한다. "q"를 입력시 while문이 종료되고, container에서 해당 클라이언트의 리스너를 제거한다.
      - container.addMessageListener(..): 메시지 리스너를 등록한다. (MessageListener를 구현한 클래스)
      - in.nextLine(): 값이 입력될 떄까지 블로킹 된다.
      - container.removeMessageListener(this): 메시지 리스너를 제거한다.
```Java
@Service
public class ChatService implements MessageListener {

    @Autowired
    private RedisMessageListenerContainer container;

    @Autowired
    RedisTemplate<String, String> redisTemplate;

    public void enterCharRoom(String chatRoomName) {
        container.addMessageListener(this, new ChannelTopic(chatRoomName));

        Scanner in = new Scanner(System.in);
        while(in.hasNextLine()) {
            String line = in.nextLine();
            if(line.equals("q")) {
                System.out.println("Quit..");
                break;
            }

            redisTemplate.convertAndSend(chatRoomName, line);
        }

        container.removeMessageListener(this);
    }


    @Override
    public void onMessage(Message message, byte[] pattern) {
        System.out.println("Message: " + message.toString());
    }
}
```

 - PubSubChatApplication
   - Main 클래스로 CommandLineRunner 인터페이스를 상속받고 run() 메서드를 구현한다.
   - CLI 프로젝트로 "chat1" 채팅방에 접속하게 된다.
      - 해당 프로젝트를 실행시 하나의 클라이언트가 되고, 여러 개의 명령 프롬프트로 실행함으로 여러 사람과 채팅이 가능하다.
```Java
@SpringBootApplication
public class PubSubChatApplication implements CommandLineRunner {

	@Autowired
	private ChatService chatService;


	public static void main(String[] args) {
		SpringApplication.run(PubSubChatApplication.class, args);
	}


	@Override
	public void run(String... args) {
		System.out.println("Application started..");

		chatService.enterCharRoom("chat1");
	}
}
```

<br/>

## 실무 활용 예시

 - 서비스에 접속 중인 유저들에게 알림 기능 (정보성 메시지)
 - 서버들간에 메시지