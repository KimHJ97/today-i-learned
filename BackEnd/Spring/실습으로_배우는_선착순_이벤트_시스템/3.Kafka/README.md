# Kafka를 활용하여 문제 해결하기

## 작업 환경 세팅

Kafka를 사용하기 위해서 Docker Compose를 통해 Kafka를 실행한다.

 - Docker Compose
```yml
version: '2'
services:
  zookeeper:
    image: wurstmeister/zookeeper
    container_name: zookeeper
    ports:
      - "2181:2181"
  kafka:
    image: wurstmeister/kafka:2.12-2.5.0
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_HOST_NAME: 127.0.0.1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

 - Docker Compose 실행
    - Docker Compose로 설정된 카프카를 실행한다.
```Bash
# 카프카 실행
$ docker-compose up -d

# 카프카 종료
$ docker-compose down
```

<br/>

## Kafka 알아보기

아파치 카프카(Apache Kafka)는 대용량의 데이터 스트림을 처리하고 분배하기 위한 분산 메시징 시스템입니다.
 - 분산 이벤트 스트리밍 플랫폼
 - 이벤트 스트리밍이란 소스에서 목적지까지 이벤트를 실시간으로 스트리밍 하는 것

<br/>

__카프카의 기본 구조__

쉽게, 토픽을 큐 저장공간으로 생각할 수 있고  
토픽에 데이터를 삽입할 수 있는 기능을 가진 것이 프로듀서  
토픽에 삽입된 데이터를 가져갈 수 있는 것이 컨슈머로 볼 수 있다.  
 - 프로듀서(Producer):
    - 데이터를 생성하고 카프카 토픽으로 보내는 역할을 수행합니다.
    - 특정 토픽에 데이터를 보내려면 해당 토픽의 이름과 데이터를 지정합니다.
    - 여러 클라이언트 언어로 작성된 프로듀서 애플리케이션을 사용할 수 있습니다.
 - 토픽(Topic):
    - 데이터가 저장되는 주제 또는 카테고리를 나타냅니다.
    - 프로듀서가 데이터를 특정 토픽으로 보내고, 컨슈머는 해당 토픽에서 데이터를 읽습니다.
    - 토픽은 하나 이상의 파티션으로 나눠져 관리됩니다.
 - 컨슈머(Consumer):
    - 토픽으로부터 데이터를 가져와서 처리하는 역할을 수행합니다.
    - 여러 컨슈머 그룹으로 나누어 여러 애플리케이션에서 동시에 데이터를 처리할 수 있습니다.
 - 브로커(Broker):
    - 카프카 클러스터의 각 노드를 뜻합니다.
    - 데이터를 저장하고 관리하며, 프로듀서에서 받은 데이터를 컨슈머에게 전달합니다.
    - 카프카의 분산 아키텍처에서 중요한 역할을 수행합니다.
 - 컨슈머 그룹(Consumer Group):
    - 같은 토픽을 구독하는 하나 이상의 컨슈머들을 그룹화한 것입니다.
    - 컨슈머 그룹 내의 각 컨슈머는 서로 다른 파티션의 데이터를 병렬로 처리할 수 있습니다.
    - 여러 컨슈머 그룹을 구성하여 다양한 데이터 파이프라인을 구축할 수 있습니다.
 - ZooKeeper:
    - 카프카 클러스터의 메타데이터와 브로커 상태 관리를 위한 분산 코디네이터입니다.
    - 최근 버전의 카프카에서는 ZooKeeper 대신 내장된 분산 코디네이터를 사용하는 것이 권장됩니다.

<br/>

 - 카프카 토픽 사용해보기
    - 토픽을 생성하고, 프로듀서와 컨슈머를 실행한다.
    - 프로듀서에 데이터를 입력하면, 컨슈머에서 입력된 데이터를 읽을 수 있다.
```Bash
# 토픽 생성
$ docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --create --topic testTopic

# 프로듀서 실행
$ docker exec -it kafka kafka-console-producer.sh --topic testTopic --broker-list 0.0.0.0:9092

# 컨슈머 실행
$ docker exec -it kafka kafka-console-consumer.sh --topic testTopic --bootstrap-server localhost:9092
```

<br/>

## Producer 사용하기

Producer를 사용하여 쿠폰을 생성할 유저의 아이디를 토픽에 넣고, 컨슈머를 사용하여 유저의 아이디를 가져와서 쿠폰을 생성하도록 한다.  

 - 토픽 생성
```Bash
# 토픽 생성
$ docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --create --topic coupon_create

# 컨슈머 실행
$ docker exec -it kafka kafka-console-consumer.sh --topic coupon_create --bootstrap-server localhost:9092 --key-deserializer "org.apache.kafka.common.serialization.StringDeserializer" --value-deserializer "org.apache.kafka.common.serialization.LongDeserializer"
```

 - build.grdale
    - 카프카 관련 의존성 추가
```
dependencies {
    implementation 'org.springframework.kafka:spring-kafka'
    ..
}
```

 - KafkaProducerConfig
    - Spring에서는 손 쉽게 설정값을 설정할 수 있도록 ProducerFactory 인터페이스를 제공한다.
```Java
@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, Long> producerFactory() {
        Map<String, Object> config = new HashMap<>();

        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, LongSerializer.class);

        return new DefaultKafkaProducerFactory<>(config);
    }

    @Bean
    public KafkaTemplate<String, Long> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
```

 - CouponCreateProducer
```Java
@Component
public class CouponCreateProducer {

    private final KafkaTemplate<String, Long> kafkaTemplate;

    public CouponCreateProducer(KafkaTemplate<String, Long> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void create(Long userId) {
        kafkaTemplate.send("coupon_create", userId);
    }
}
```

<br/>

## Consumer 사용하기

 - Consumer 모듈 프로젝트 만들기
```
coupon-system 하위에 새로운 모듈 생성
 - [프로젝트 우클릭 > New > Module..]
    - Project: Gradle Project
    - Spring Boot: 3.0.9
    - Project Metadata
        - Group: com.example
        - Artifact: consumer
        - Name: consumer
        - Description: Demo project for Spring Boot
        - Package name: com.example.consumer
        - Packaging: Jar
        - Java: 17
    - Dependencies
        - Spring for Apache Kafka
        - MySQL Driver
        - Spring Data JPA
```

 - application.yml
```yml
spring:
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://127.0.0.1:3306/coupon_example
    username: root
    password: 1234
```

 - KafkaConsumerConfig
    - 컨슈머 작업을 하기위한 설정을 한다.
    - 토픽으로부터 메시지를 전달받기 위한 카프카 리스너를 만든다.
```Java
@Configuration
public class KafkaConsumerConfig {

    @Bean
    public ConsumerFactory<String, Long> consumerFactory() {
        Map<String, Object> config = new HashMap<>();

        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        config.put(ConsumerConfig.GROUP_ID_CONFIG, "group_1");
        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, LongDeserializer.class);

        return new DefaultKafkaConsumerFactory<>(config);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Long> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Long> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());

        return factory;
    }
}
```

 - CouponCreatedConsumer
    - 토픽에 메시지가 전달되면 메시지를 읽고, 쿠폰 발급을 진행한다.
```Java
@Component
public class CouponCreatedConsumer {

    private final CouponRepository couponRepository;

    public CouponCreatedConsumer(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @KafkaListener(topics = "coupon_create", groupId = "group_1")
    public void listener(Long userId) {
        couponRepository.save(new Coupon(userId));
    }
}
```

 - Coupon 엔티티 클래스와 Repository 생성
    - api 모듈에 사용되던 클래스 내용과 동일
```Java
// Coupon 엔티티 클래스
@Entity
public class Coupon {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    public Coupon() {
    }

    public Coupon(Long userId) {
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }
}

// CouponRepository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
}
```

<br/>

## Kafka 테스트 수행하기

토픽에 메시지 전달이 될 때 수행되는 컨슈머 모듈은 프로세스로 띄어져있어야 한다.  
api 모듈에서 쿠폰 발급 테스트를 수행한다.  
이때, 쿠폰 발급 결과를 비교하는 assertThat은 쿠폰 발급이 실시간이 아닌, 메시지큐에 전달되고 하나씩 처리되므로 테스트 종료 전에 발급이 안될 수도 있다.  
때문에, Thread.sleep()으로 적당한 시간을 대기하고 쿠폰 발급 갯수를 비교한다.  
 - 테스트를 수행하기전에 데이터를 정리해주어야 한다.
    - consumer 모듈을 재실행한다.
        - ddl-auto 옵션을 "create"로 하여 애플리케이션이 실행될 때 테이블은 재생성된다. (MySQL 테이블 데이터 정리)
    - Redis 쿠폰 갯수를 초기화한다.
        - docker exec로 redis-cli에 접속하고, flushall 명령어로 데이터를 초기화한다.
    - 이후, ApplyServiceTest 테스트의 여러명응모 테스트를 수행한다.

<br/>

 - ApplyServiceTest
    - ApplyService.apply()
        - Redis의 INCR을 통해 쿠폰 발급 갯수를 가져온다. 100개 이하인 경우 메시지 큐에 담는다. (프로듀서 수행)
        - couponCountRepository.increment(), couponCreateProducer.create(userId)
        - "coupon_create"이라는 토픽에 메시지를 보낸다.
    - CouponCreatedConsumer.listener()
        - "coupon_create" 토픽에 메시지가 담기면 컨슈머를 수행한다.
        - 메시지를 읽어 쿠폰을 발급한다.
```Java
@SpringBootTest
class ApplyServiceTest {
    ..

    @Test
    public void 여러명응모() throws InterruptedException {
        int threadCount = 1000;
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        CountDownLatch latch = new CountDownLatch(threadCount);

        for (int i = 0; i < threadCount; i++) {
            long userId = i;
            executorService.submit(() -> {
                try {
                    applyService.apply(userId);
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();

        Thread.sleep(10000);

        // then
        long count = couponRepository.count();
        assertThat(count).isEqualTo(100);
    }
}
```