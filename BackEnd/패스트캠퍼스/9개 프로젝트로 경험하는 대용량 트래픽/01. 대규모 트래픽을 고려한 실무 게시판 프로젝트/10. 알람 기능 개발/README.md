# 알람 기능 개발

## 1. 이론

### 알람

알람은 Spring Boot 애플리케이션 내에서 이벤트, 경고 또는 에러와 같은 중요한 상황을 감지하고 이를 관리자 또는 개발자에게 알리는 기능을 가리킵니다. 알람은 애플리케이션의 신속한 대응과 문제 해결을 돕는 데 중요한 역할을 합니다.  

 - 장애 감지와 대응
 - 서비스 가용성 유지
 - 성능 모니터링
 - 비용 절감
 - 사용자 경험 향상
 - 예방적 조치

<br/>

### AWS SNS 연동

Amazon Simple Notification Service(Amazon SNS)은 Amazon Web Services(AWS)의 클라우드 기반 메시징 서비스입니다. Amazon SNS를 사용하면 애플리케이션, 서비스 또는 시스템 간에 다양한 종류의 메시지를 안전하게 전송하고 관리할 수 있습니다.  

 - 푸시 알람
 - 다중 프로토콜 지원(HTTP, HTTPS, SMS, 이메일, SQS, Lambda 등)
 - 이벤트 기반 아키텍처
 - 확장성과 신뢰성
 - 미리 알림 및 모니터링

<br/>

### AWS SNS 예제 코드

aws.accessKeyId, aws.secretKey, aws.sns.topicArn은 각각 AWS 계정의 액세스 키, 비밀 키, SNS Topic의 ARN을 나타냅니다. 이러한 값들은 application.properties 또는 application.yml에 설정되어야 합니다.  

 - 공식 문서: https://docs.aws.amazon.com/ko_kr/sdk-for-java/latest/developer-guide/examples-simple-notification-service.html

<br/>

 - `application.properties`
```properties

aws.accessKeyId=계정 액세스 키
aws.secretKey=비밀키
aws.sns.topicArn=토픽 ARN
```

<br/>

 - `SnsService`
```java
@Service
public class SnsService {

    @Value("${aws.accessKeyId}")
    private String awsAccessKey;

    @Value("${aws.secretKey}")
    private String awsSecretKey;

    @Value("${aws.sns.topicArn}")
    private String awsTopicArn;

    public void publishMessage(String message) {
        // AWS SNS 클라이언트 생성
        SnsClient snsClient = SnsClient.builder()
                .region(Region.US_EAST_1) // AWS 지역 설정
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
        
        // SNS 메시지 발행 요청 생성
        PublishRequest publishRequest = PublishRequest.builder()
                .topicArn(snsTopicArn)
                .message(message)
                .build();
        
        // SNS 메시지 발행
        PublishResponse publishResponse = snsClient.publish(publishRequest);

        // 발행 결과 출력
        System.out.println(publishResponse.messageId() + " Message sent. Status is " + publishResponse.sdkHttpResponse().statusCode());
    }
}
```

<br/>

### SLACK 알람 연동

메신저 플랫폼인 Slack은 다양한 형태의 알람 및 통지 기능을 제공하며, 이를 통해 사용자들이 팀 간 소통, 협업, 작업 관리를 용이하게 할 수 있습니다.  

 - 메시지 알람
 - 이벤트 알람
 - 스케줄 및 일정 알람
 - 앱 및 서비스 통합 알람
 - 사용자 정의 알람

<br/>

### SLACK 알람 예시 코드

slack.webhook.url은 Slack Incoming Webhooks URL을 나타냅니다.  

 - `application.properties`
```properties
slack.webhook.url=https://hooks.slack.com/services/your/webhook/url
```

<br/>

 - `SlackNotificationService`
```java
@Service
public class SlackNotificationService {

    @Value("${slack.webhook.url}")
    private String slackWebhookUrl;

    public void sendSlackNotification(String message) {
        // Slack으로 전송할 메시지 구성
        String payload = "{\"text\": \"" + message + "\"}";
        
        // HTTP 요청 헤더 구성
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // HTTP 요청 엔티티 생성
        HttpEntity<String> entity = new HttpEntity<>(payload, headers);

        // Slack Webhook에 POST 요청
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.postForObject(slackWebhookUrl, entity, String.class);
    }
}
```

