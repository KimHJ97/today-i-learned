# AWS SNS 연동

## Amazon 관련 작업

```
★ Amazon SNS 관련
1. Amazon SNS 대시보드 이동
2. 주제(Topic) 생성
 - 유형: 표준
 - 이름: board-server
3. 생성된 주제의 ARN 확인

★ IAM 관련
4. IAM 대시보드 이동
5. 사용자의 액세스 키 확인(시크릿 키는 생성할 떄 만들어진다.)
```

<br/>

## 애플리케이션 관련 작업

 - `build.gradle`
    - AWS SDK를 사용하기 위한 의존성들을 추가한다.
```gradle
dependencies {
    // ..
	implementation 'software.amazon.awssdk:sns'
	implementation platform('software.amazon.awssdk:bom:2.5.29')

    // ..
    compileOnly group: 'org.springframework.cloud', name: 'spring-cloud-aws-messaging', version: '2.2.1.RELEASE'
	compileOnly group: 'org.springframework.cloud', name: 'spring-cloud-aws-autoconfigure', version: '2.2.1.RELEASE'
}
```

<br/>

 - `application.properties`
    - AWS 관련 설정 값을 정의한다.
```properties
# aws sns
sns.topic.arn=arn:aws:sns:ap-northeast-2:고유값:board-server
aws.accessKey=액세스키
aws.secretKey=시크릿키
aws.region=ap-northeast-2
cloud.aws.region.static=ap-northeast-2
cloud.aws.stack.auto=false
```

<br/>

 - `AWSConfig`
```java
@Getter
@Configuration
public class AWSConfig {

    @Value("${sns.topic.arn}")
    private String snsTopicARN;

    @Value("${aws.accessKey}")
    private String awsAccessKey;

    @Value("${aws.secretKey}")
    private String awsSecretKey;

    @Value("${aws.region}")
    private String awsRegion;

}
```

<br/>

 - `SnsController`
```java
@Log4j2
@RestController
public class SnsController {

    private final AWSConfig awsConfig;
    private final SnsService snsService;

    public SnsController(AWSConfig awsConfig, SnsService snsService) {
        this.awsConfig = awsConfig;
        this.snsService = snsService;
    }

    // 토픽 생성
    @PostMapping("/create-topic")
    public ResponseEntity<String> createTopic(@RequestParam final String topicName) {
        final CreateTopicRequest createTopicRequest = CreateTopicRequest.builder()
                .name(topicName)
                .build();
        SnsClient snsClient = snsService.getSnsClient();
        final CreateTopicResponse createTopicResponse = snsClient.createTopic(createTopicRequest);

        if (!createTopicResponse.sdkHttpResponse().isSuccessful()) {
            throw getResponseStatusException(createTopicResponse);
        }
        log.info("topic name = " + createTopicResponse.topicArn());
        log.info("topic list = " + snsClient.listTopics());
        snsClient.close();
        return new ResponseEntity<>("TOPIC CREATING SUCCESS", HttpStatus.OK);
    }

    // 구독
    @PostMapping("/subscribe")
    public ResponseEntity<String> subscribe(@RequestParam final String endpoint, @RequestParam final String topicArn) {
        final SubscribeRequest subscribeRequest = SubscribeRequest.builder()
                .protocol("https")
                .topicArn(topicArn)
                .endpoint(endpoint)
                .build();
        SnsClient snsClient = snsService.getSnsClient();
        final SubscribeResponse subscribeResponse = snsClient.subscribe(subscribeRequest);

        if (!subscribeResponse.sdkHttpResponse().isSuccessful()) {
            throw getResponseStatusException(subscribeResponse);
        }
        log.info("topicARN to subscribe = " + subscribeResponse.subscriptionArn());
        log.info("subscription list = " + snsClient.listSubscriptions());
        snsClient.close();
        return new ResponseEntity<>("TOPIC SUBSCRIBE SUCCESS", HttpStatus.OK);
    }

    // 발행
    @PostMapping("/publish")
    public String publish(@RequestParam String topicArn, @RequestBody Map<String, Object> message) {
        SnsClient snsClient = snsService.getSnsClient();
        final PublishRequest publishRequest = PublishRequest.builder()
                .topicArn(topicArn)
                .subject("HTTP ENDPOINT TEST MESSAGE")
                .message(message.toString())
                .build();
        PublishResponse publishResponse = snsClient.publish(publishRequest);
        log.info("message status:" + publishResponse.sdkHttpResponse().statusCode());
        snsClient.close();

        return "sent MSG ID = " + publishResponse.messageId();

    }

    private ResponseStatusException getResponseStatusException(SnsResponse response) {
        return new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, response.sdkHttpResponse().statusText().get()
        );
    }
}
```

 - `SnsService`
```java
@Service
public class SnsService {

    AWSConfig awsConfig;

    public SnsService(AWSConfig awsConfig) {
        this.awsConfig = awsConfig;
    }

    public AwsCredentialsProvider getAwsCredentials(String accessKeyID, String secretAccessKey) {
        AwsBasicCredentials awsBasicCredentials = AwsBasicCredentials.create(accessKeyID, secretAccessKey);
        return () -> awsBasicCredentials;
    }

    public SnsClient getSnsClient() {
        return SnsClient.builder()
                .credentialsProvider(
                        getAwsCredentials(awsConfig.getAwsAccessKey(), awsConfig.getAwsSecretKey())
                ).region(Region.of(awsConfig.getAwsRegion()))
                .build();
    }

}
```