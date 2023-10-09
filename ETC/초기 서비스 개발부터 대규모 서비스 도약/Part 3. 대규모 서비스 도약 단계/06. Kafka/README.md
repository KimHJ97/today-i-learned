# 메시징 플랫폼(Kafka)

## Kafka

Apache Kafka는 대규모 데이터 스트리밍 및 이벤트 처리를 위한 오픈 소스 메시지 큐 및 스트리밍 플랫폼입니다. Kafka는 LinkedIn에서 개발되었으며, 고성능, 확장 가능성, 내결함성, 유연성을 갖춘 메시징 시스템으로 널리 사용됩니다.  

Kafka는 다양한 분야에서 사용되며, 특히 대규모 데이터 수집, 로그 및 이벤트 스트리밍, 분산 시스템 간의 통합, 실시간 분석, 모니터링 및 로그 분석 등에 널리 활용됩니다. Kafka는 대용량 데이터 처리 및 이벤트 기반 아키텍처를 구축하고 관리하는 데 매우 유용한 도구 중 하나입니다.  
 - 분산 아키텍처: Kafka는 여러 대의 서버로 구성된 분산 아키텍처를 가지고 있습니다. 이는 데이터 스트림을 병렬로 처리하고 확장성을 확보하는 데 도움이 됩니다.
 - 고성능: Kafka는 대용량 데이터 스트림을 처리하기 위한 고성능 시스템입니다. 데이터를 효율적으로 저장하고 빠르게 전달할 수 있어 대규모 애플리케이션에서 사용됩니다.
 - 내결함성: Kafka는 복제 및 파티션 분산을 통해 내결함성을 제공합니다. 데이터 손실을 방지하고 고가용성을 유지할 수 있습니다.
 - 지속성: Kafka는 데이터를 영구적으로 저장하므로 데이터가 유실되지 않고 나중에 검색할 수 있습니다. 이는 데이터 간단한 스트림 처리부터 복잡한 이벤트 소싱까지 다양한 사용 사례에 적합합니다.
 - 다양한 클라이언트 지원: Kafka는 다양한 프로그래밍 언어로 작성된 클라이언트 라이브러리를 제공하므로 다양한 플랫폼에서 사용할 수 있습니다.
 - 스트림 처리: Kafka Streams와 같은 기능을 사용하여 데이터 스트림을 처리하고 실시간 분석 및 처리를 수행할 수 있습니다.

<br/>

### Kafka 탄생 배경

Kafka의 탄생 배경은 LinkedIn에서 발생한 대규모 데이터 스트리밍 및 이벤트 처리의 고난을 해결하고자 하는 필요성에서 비롯됩니다.  
 - 대용량 데이터: LinkedIn은 사용자가 생성하는 대용량 데이터를 처리해야 했습니다. 사용자의 활동 로그, 프로필 업데이트, 연결 요청, 그룹 활동 등 다양한 데이터가 지속적으로 생성되었습니다. 이런 데이터를 효율적으로 수집하고 처리해야 했습니다.
 - 데이터 플랫폼의 부재: 처음에는 LinkedIn 내에서 대용량 데이터를 처리하기 위한 적절한 플랫폼이 부재했습니다. 기존의 데이터베이스 시스템 및 메시지 큐 시스템은 이러한 요구 사항을 충족시키지 못했습니다.
 - 분산 아키텍처의 필요성: LinkedIn은 데이터의 복제와 분산 처리를 통해 내결함성 및 확장성을 확보해야 했습니다. 데이터 유실을 방지하고 고가용성을 보장하기 위해서는 분산 아키텍처가 필요했습니다.
 - 이벤트 소싱: LinkedIn은 이벤트 소싱(Event Sourcing) 패턴을 채택하여 모든 변경 사항을 이벤트로 기록하고 이를 중앙 집중식 스트리밍 플랫폼에 전달하는 방식을 선택했습니다. 이를 통해 실시간 데이터 분석 및 추적이 가능해졌습니다.
 - 스케일 아웃: LinkedIn은 사용자 수와 데이터 양이 급격히 증가하면서 스케일 아웃이 가능한 시스템이 필요했습니다. Kafka는 수평 확장이 가능하며, 새로운 브로커를 추가함으로써 쉽게 스케일 아웃할 수 있는 아키텍처를 제공합니다.
 - 비용 효율성: 기존 시스템의 비용 및 라이선스 문제도 고려해야 했습니다. Kafka는 오픈 소스로 제공되어 비용 효율적으로 사용할 수 있습니다.

<br/>

### Kafka 기본 사용처

Kafka는 대규모 데이터 스트리밍 및 이벤트 처리를 위한 효율적인 플랫폼으로 다양한 사용처에서 활용됩니다.  
Kafka는 다양한 분야에서 사용되며, 데이터 파이프라인, 로그 수집, 실시간 처리, 이벤트 소싱, 데이터 호스팅 등 다양한 데이터 관련 작업에 적용됩니다. Kafka의 효율성, 확장성 및 내결함성은 대용량 및 실시간 데이터 처리에 필요한 요구 사항을 충족시키기 위한 이상적인 도구 중 하나로 인정받고 있습니다.  

 - 메시징, 웹 사이트 고객 활동 추적, 지표 수집, 로그 수집, 데이터 스트리밍 처리, 이벤트 소싱, 분산 시스템의 커밋 로그 등
 - 로그 및 이벤트 스트리밍: Kafka는 로그 데이터, 이벤트 데이터, 트랜잭션 로그 등의 대용량 스트리밍 데이터를 수집하고 저장하는 데 사용됩니다. 이러한 데이터는 실시간으로 처리되거나 나중에 분석 및 검색을 위해 보관될 수 있습니다. 대표적인 예로는 로그 분석, 모니터링, 오류 디버깅, 보안 감시 등이 있습니다.
 - 실시간 데이터 분석: Kafka는 스트림 처리 프레임워크와 통합하여 실시간 데이터 분석 및 처리를 지원합니다. 이를 통해 실시간으로 데이터를 가공하고 분석하여 실시간 대시보드, 추천 시스템, 사이트 실시간 통계 등 다양한 실시간 애플리케이션을 구축할 수 있습니다.
 - 데이터 허브: Kafka는 데이터 허브로 사용되어 다양한 애플리케이션 및 서비스 간에 데이터를 신속하게 공유하고 연동하는 데 사용됩니다. 서로 다른 시스템 간에 데이터를 안전하게 전달하고 중앙 집중식 데이터 파이프라인을 구축할 수 있습니다.
 - 클릭 스트림 처리: 웹 및 모바일 애플리케이션의 사용자 활동을 추적하고 분석하기 위해 Kafka가 사용됩니다. 이를 통해 사용자 경험을 개선하고 개인화된 컨텐츠나 광고를 제공할 수 있습니다.
 - 이벤트 소싱: Kafka는 이벤트 소싱 패턴을 구현하기 위해 사용됩니다. 모든 시스템 변경 사항을 이벤트로 기록하고 중앙 집중식 스트림으로 전달하여 데이터의 변경 이력을 추적하고 복제합니다.
 - 실시간 대시보드: Kafka를 사용하여 실시간 대시보드를 구축할 수 있으며, 이를 통해 비즈니스 지표 및 성능 지표를 실시간으로 모니터링할 수 있습니다.
 - 클라우드 마이그레이션: 기존 온프레미스 애플리케이션 및 시스템에서 클라우드로 데이터를 이전할 때 Kafka를 사용하여 데이터 마이그레이션을 관리합니다.
 - 메시지 큐: Kafka는 전통적인 메시지 큐 시스템과 같은 용도로도 사용됩니다. 비동기 메시징, 이벤트 드리븐 아키텍처, 백그라운드 작업 처리 등에 활용됩니다.

<br/>

### Kafka 기본 용어

 - __프로듀서(Producer)__: 프로듀서는 Kafka 토픽으로 데이터를 보내는 역할을 합니다. 데이터를 생성하고 특정 토픽에 메시지를 전송합니다. (메시지 발송)
 - __컨슈머(Consumer)__: 컨슈머는 Kafka 토픽에서 데이터를 소비하는 역할을 합니다. 컨슈머는 특정 토픽에서 메시지를 읽고 처리합니다. (메시지 소비)
 - __컨슈머 그룹(Consumer Group)__: 하나의 토픽을 여러 컨슈머가 동시에 소비할 수 있습니다. 이때 컨슈머들은 컨슈머 그룹으로 구성되어 동일한 그룹 내에서 데이터를 공유하고 처리합니다.
 - __토픽(Topic)__: 토픽은 Kafka에서 데이터 스트림을 구분하는 단위입니다. 각 토픽은 특정 주제나 카테고리와 관련된 데이터를 포함하며, 프로듀서는 메시지를 특정 토픽으로 보냅니다. (메시지 수신처)
 - __파티션(Partition)__: 토픽은 하나 이상의 파티션으로 나누어질 수 있습니다. 각 파티션은 독립적으로 메시지를 저장하고 관리합니다. 이를 통해 데이터의 분산 저장 및 병렬 처리가 가능해집니다. (하나의 메시지를 여러 개의 파티션으로 나누어 저장할 수 있다.)
 - __오프셋(Offset)__: 오프셋은 파티션 내에서 메시지의 위치를 나타내는 식별자입니다. 컨슈머는 특정 파티션에서 어디까지 메시지를 처리했는지를 오프셋으로 추적합니다. (증가되는 숫자값으로 마지막 읽은 위치가 아니라 다음 읽어야 할 위치를 나타낸다.)
 - __레플리카(Replica)__: 리더 파티션의 데이터를 복제한 파티션을 레플리카라고 합니다. 레플리카는 데이터의 신뢰성을 보장하고 장애 복구 시에 사용됩니다. (고가용성과 데이터 유실 방지를 위해 메시지를 여러 개로 복제하여 열 ㅓ곳에 분산시키는 것)
 - __리더(Leader)와 팔로워(Follower)__: 각 파티션은 리더와 팔로워로 구성됩니다. 리더 파티션은 메시지를 읽고 쓰는 주체이며, 팔로워 파티션은 데이터의 복제본을 가지고 있어 장애 시에 대비합니다. (프로듀서, 컨슈머의 모든 읽기와 쓰기는 리더를 통해서만 가능, 팔로워는 리더로부터 데이터를 복제)
 - __브로커(Broker)__: 브로커는 Kafka 서버입니다. 여러 대의 브로커로 구성된 클러스터 형태로 동작하며, 메시지를 저장하고 전달하는 역할을 합니다.
 - 브로커 아이디(Broker ID): Kafka 클러스터 내에서 각 브로커는 고유한 아이디를 가집니다. 이 아이디를 사용하여 각 브로커를 식별하고 관리합니다.
 - 브로커 토픽 삭제(Broker Topic Deletion): Kafka에서 더 이상 필요하지 않은 토픽을 삭제하는 과정입니다. 이 작업은 주의 깊게 수행해야 합니다.
 - 컨트롤러(Controller): Kafka 클러스터 내에서 리더 선출 및 파티션 할당을 관리하는 역할을 하는 브로커를 컨트롤러라고 합니다.

<div align="center">
    <img src="./images/Kafka_Brokers_And_Topics.png">
</div>
<div align="center">
    <img src="./images/Kafka_Producers_And_Consumers.png">
</div>
<div align="center">
    이미지 출처 - https://access.redhat.com/documentation/en-us/red_hat_amq_streams/2.1/html/amq_streams_on_openshift_overview/kafka-concepts_str
</div>

```
◆ Kafka 브로커와 토픽
 - 브로커
서버 또는 노드라고도 하는 브로커는 메시지 저장 및 전달을 조정합니다.

 - 토픽
토픽은 데이터 저장을 위한 대상을 제공합니다. 각 토픽은 하나 이상의 파티션으로 분할됩니다.

◆ Kafka 생산자와 소비자
 - 생산자(프로듀서)
생산자는 파티션의 끝 오프셋에 기록될 메시지를 브로커 주제에 보냅니다.
메시지는 생성자가 라운드 로빈 방식으로 파티션에 기록하거나 메시지 키를 기반으로 특정 파티션에 기록됩니다.

 - 소비자
소비자는 주제를 구독하고 주제, 파티션 및 오프셋에 따라 메시지를 읽습니다.

 - 소비자 그룹
소비자 그룹은 특정 주제에서 여러 생산자가 생성한 일반적으로 대규모 데이터 스트림을 공유하는 데 사용됩니다.
소비자는 을 사용하여 그룹화되므로 group.id메시지가 구성원 전체에 분산될 수 있습니다.
그룹 내의 소비자는 동일한 파티션에서 데이터를 읽지 않지만 하나 이상의 파티션에서 데이터를 받을 수 있습니다.
```

<br/>

## Kafka 설치하기

 - docker-compose.yml
    - docker-compose up -d
```YML
version: '3'
services:
    zookeeper:
        image: confluentinc/cp-zookeeper:7.3.0
        container_name: zookeeper
        environment:
            ZOOKEEPER_CLIENT_PORT: 2181
            ZOOKEEPER_TICK_TIME: 2000
    broker:
        image: confluentinc/cp-kafka:7.3.0
        container_name: broker
        ports:
            - "9092:9092"
        depends_on:
            - zookeeper
        environment:
            KAFKA_BROKER_ID: 1
            KAFKA_ZOOKEEPER_CONNECT: 'zookeeper:2181'
            KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
            KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://broker:29092
            KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
            KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
            KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
```

 - 토픽 만들고 메시지 송신 및 수신
```Bash
# Kafka 토픽 만들기
$ docker exec broker kafka-topics --bootstrap-server broker:9092 \
    --create \
    --topic hello-topic

# 브로커의 토픽 확인하기
$ docker-compose exec broker kafka-topics --describe --topic hello-topic --bootstrap-server broker:9092

# 토픽에 메시지 보내기 (프로듀서 터미널)
$ docker exec --interactive --tty broker \
    kafka-console-producer --bootstrap-server broker:9092 \
    --topic hello-topic

# 토픽에 보낸 메시지 읽기 (컨슈머 터미널)
$ docker exec --interactive --tty broker \
    kafka-console-consumer --bootstrap-server broker:9092 \
    --topic hello-topic \
    --from-beginning

# Kafka 브로커 중지
$ docker-compose down
```

<br/>

## Spring Boot Kafka 연동

### 준비 사항

 - 카프카 브로커
 - 토픽 생성: hello-topic

<br/>

### Spring Boot 카프카 메시지 송신

 - build.gradle
    - 카프카 의존성 추가
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.kafka:spring-kafka'
}
```

 - application.yml
```YML
spring:
    kafka:
        bootstrap-servers: localhost:9092
        producer:
            key-serializer: org.apache.kafka.common.serialization.StringSerializer
            value-serializer: org.apache.kafka.common.serialization.StringSerializer

kafka:
    hello:
        topic: hello-topic
        key: hello-key
```

 - HelloProducerController
    - 메시지 전송(Producer)
```Java
@Slf4j
@RestController
@RequiredArgsConstructor
public class HelloProducerController {

    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${kafka.hello.topic}")
    private String topic;
    @Value("${kafka.hello.key}")
    private String helloKey;

    @PostMapping("/kafka/publish/message")
    public void publish(@RequestBody String message) {
        kafkaTemplate.send(topic, helloKey, message);
    }
}
```

<br/>

### Spring Boot 카프카 메시지 수신

 - build.gradle
    - 카프카 의존성 추가
```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter'
    implementation 'org.springframework.kafka:spring-kafka'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.kafka:spring-kafka-test'
}
```

 - application.yml
```YML
spring:
    kafka:
        bootstrap-servers: localhost:9092
        consumer:
            group-id: hello-group-id
            auto-offset-reset: earliest
            key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
            value-deserializer: org.apache.kafka.common.serialization.StringDeserializer

kafka:
    hello:
        topic: hello-topic
```

 - HelloConsumer
    - 메시지 수신(Consumer)
```Java
@Slf4j
@Component
public class HelloConsumer {

    @KafkaListener(
        topics = "${kafka.hello.topic}",
        groupId = "${spring.kafka.consumer.group-id}"
    )
    public void listen(@Payload String message) {
        log.info(">>> Kafka Message Consume: {}", message);
    }
}
```
