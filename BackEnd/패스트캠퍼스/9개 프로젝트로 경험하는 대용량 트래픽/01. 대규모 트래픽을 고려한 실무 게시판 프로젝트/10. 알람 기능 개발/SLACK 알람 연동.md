# Slack 알람 연동

 - https://api.slack.com/apps

<br/>

## Slack 관련 작업

 - __OAuth & Permissions__
    - OAuth Tokens for Your Workspace: 워크스페이스 접근 토큰
        - Install to Workspace 허용
    - Scopes: 권한 스코프
        - chat: write
        - channels: read

<br/>

## 애플리케이션 관련 작업

 - `build.gradle`
    - Slack API를 사용하기 위한 의존성들을 추가한다.
```gradle
dependencies {
    // ..
	implementation("com.slack.api:bolt:1.18.0")
	implementation("com.slack.api:bolt-servlet:1.18.0")
	implementation("com.slack.api:bolt-jetty:1.18.0")
}
```

<br/>

 - `application.properties`
    - Slack 관련 설정 값을 정의한다.
```properties
# SLACK
slack.token=토큰 값
```

<br/>

 - `SnsController`
```java
@Log4j2
@RestController
public class SnsController {

    private final AWSConfig awsConfig;
    private final SnsService snsService;
    private final SlackService slackService;

    public SnsController(AWSConfig awsConfig, SnsService snsService, SlackService slackService) {
        this.awsConfig = awsConfig;
        this.snsService = snsService;
        this.slackService = slackService;
    }

    // ..

    // slack
    @GetMapping("/slack/error")
    public void error(){
        log.info("슬랙 error 채널 테스트");
        slackService.sendSlackMessage("슬랙 에러 테스트", "error");
    }
}
```

<br/>

 - `SlackService`
```java
@Service
@Log4j2
public class SlackService {
    @Value(value = "${slack.token}")
    String slackToken;

    public void sendSlackMessage(String message, String channel){

        String channelAddress = "";

        if(channel.equals("error")){
            channelAddress = SlackConstant.MONITOR_CHANNEL;
        } else if(channel.equals("warnning")){
            channelAddress = SlackConstant.WARNING_CHANNEL;
        }

        try{
            MethodsClient methods = Slack.getInstance().methods(slackToken);

            ChatPostMessageRequest request = ChatPostMessageRequest.builder()
                    .channel(channelAddress)
                    .text(message)
                    .build();

            methods.chatPostMessage(request);

            log.info("Slack " + channel + " 에 메시지 보냄");
        } catch (SlackApiException | IOException e) {
            log.error(e.getMessage());
        }
    }
}
```
