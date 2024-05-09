# Feign Client

 - 공식 문서: https://docs.spring.io/spring-cloud-openfeign/docs/current/reference/html/
 - Feign Interceptor: 외부로 요청이 나가기 전에 공통적으로 처리해야하는 부분이 있으면 Interceptor를 재정의하여 처리가 가능하다.
 - Feign Logger: Request/Response 등 운영을 하기 위한 적절한 로그를 남길 수 있다.
 - Feign ErrorDecoder: 요청에 대해 정상 응답이 아닌 경우 핸들링이 가능하다.

<br/>

## 스프링 Feign Client 코드

 - `build.gradle`
    - Spring Boot와 Spring Cloud 호환성을 확인해야 한다.
    - Spring Boot 2.6.x ~ 2.7.x 사용시 Spring Cloud 2021.0.3을 사용한다.
```gradle
ext {
	/**
	 * Spring Boot and springCloudVersion must be compatible.
	 * 2.6.x, 2.7.x (Starting with 2021.0.3) = 2021.0.x
	 * ref : https://spring.io/projects/spring-cloud
	 */
	// Feign
	set('springCloudVersion', '2021.0.3')

	set('commonsLangVersion', '3.12.0')
}

dependencyManagement {
	imports {
		mavenBom "org.springframework.cloud:spring-cloud-dependencies:${springCloudVersion}"
	}
}

dependencies {
    // ..

    implementation 'org.springframework.cloud:spring-cloud-starter-openfeign'

    implementation "org.apache.commons:commons-lang3:${commonsLangVersion}"
}
```
<br/>

 - `applicatioin.yml`
    - HTTP Client 사용시 ConnectionTimeout과 ReadTimeout 시간을 설정한다.
```yaml
feign:
  url:
    prefix: http://localhost:8080/target_server # DemoFeignClient에서 사용할 url prefix 값
  client:
    config:
      default:
        connectTimeout: 1000
        readTimeout: 3000
        loggerLevel: NONE
      demo-client: # DemoFeignClient에서 사용할 Client 설정 값
        connectTimeout: 1000
        readTimeout: 10000
        loggerLevel: HEADERS # 여기서 설정한 값은 FeignCustomLogger -> Logger.Level logLevel 변수에 할당됨
```
<br/>

### FeignClient 설정 파일

 - `DemoFeignInterceptor`
    - RequestInterceptor를 상속받고, apply() 메서드를 구현한다.
    - Inteceptor 에서는 HTTP 요청전에 처리할 로직을 정의할 수 있다.
    - 예제에서는 GET 요청일 때 QueryParam을 출력하고, POST 요청일 때 Body 값을 출력한다.
```java
@RequiredArgsConstructor(staticName = "of")
public final class DemoFeignInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) { // 필요에 따라 template 필드 값을 활용하자!

        // get 요청일 경우
        if (template.method() == HttpMethod.GET.name()) {
            System.out.println("[GET] [DemoFeignInterceptor] queries : " + template.queries());
            // ex) [GET] [DemoFeignInterceptor] queries : {name=[CustomName], age=[1]}
            return;
        }

        // post 요청일 경우
        String encodedRequestBody = StringUtils.toEncodedString(template.body(), UTF_8);
        System.out.println("[POST] [DemoFeignInterceptor] requestBody : " + encodedRequestBody);
        // ex) [POST] [DemoFeignInterceptor] requestBody : {"name":"customName","age":1}

        // Do Something
        // ex) requestBody 값 수정 등등

        // 새로운 requestBody 값으로 설정
        template.body(encodedRequestBody);
    }
}
```
<br/>

 - `FeignCustomLogger`
    - Logger를 상속받고, log(), logRequest(), logAndRebufferResponse() 메서드를 구현한다.
    - Request와 Response에 대한 로그를 남길 수 있다.
```java
@Slf4j
@RequiredArgsConstructor
public class FeignCustomLogger extends Logger {
    private static final int DEFAULT_SLOW_API_TIME = 3_000;
    private static final String SLOW_API_NOTICE = "Slow API";

    @Override
    protected void log(String configKey, String format, Object... args) {
        // log를 어떤 형식으로 남길지 정해준다.
        System.out.println(String.format(methodTag(configKey) + format, args));
    }

    @Override
    protected void logRequest(String configKey, Logger.Level logLevel, Request request) {
        /**
         * [값]
         * configKey = DemoFeignClient#callGet(String,String,Long)
         * logLevel = BASIC # "feign.client.config.demo-client.loggerLevel" 참고
         *
         * [동작 순서]
         * `logRequest` 메소드 진입 -> 외부 요청 -> `logAndRebufferResponse` 메소드 진입
         *
         * [참고]
         * request에 대한 정보는
         * `logAndRebufferResponse` 메소드 파라미터인 response에도 있다.
         * 그러므로 request에 대한 정보를 [logRequest, logAndRebufferResponse] 중 어디에서 남길지 정하면 된다.
         * 만약 `logAndRebufferResponse`에서 남긴다면 `logRequest`는 삭제해버리자.
         */
        System.out.println(request);
    }

    @Override
    protected Response logAndRebufferResponse(String configKey, Logger.Level logLevel,
                                              Response response, long elapsedTime) throws IOException {
        /**
         * [참고]
         * - `logAndRebufferResponse` 메소드내에선 Request, Response에 대한 정보를 log로 남길 수 있다.
         * - 매소드내 코드는 "feign.Logger#logAndRebufferResponse(java.lang.String, feign.Logger.Level, feign.Response, long)"에서 가져왔다.
         *
         * [사용 예]
         * 예상 요청 처리 시간보다 오래 걸렸다면 "Slow API"라는 log를 출력시킬 수 있다.
         * ex) [DemoFeignClient#callGet] <--- HTTP/1.1 200 (115ms)
         *     [DemoFeignClient#callGet] connection: keep-alive
         *     [DemoFeignClient#callGet] content-type: application/json
         *     [DemoFeignClient#callGet] date: Sun, 24 Jul 2022 01:26:05 GMT
         *     [DemoFeignClient#callGet] keep-alive: timeout=60
         *     [DemoFeignClient#callGet] transfer-encoding: chunked
         *     [DemoFeignClient#callGet] {"name":"customName","age":1,"header":"CustomHeader"}
         *     [DemoFeignClient#callGet] [Slow API] elapsedTime : 3001
         *     [DemoFeignClient#callGet] <--- END HTTP (53-byte body)
         */

        String protocolVersion = resolveProtocolVersion(response.protocolVersion());
        String reason = response.reason() != null
                        && logLevel.compareTo(Level.NONE) > 0 ? " " + response.reason() : "";
        int status = response.status();
        log(configKey, "<--- %s %s%s (%sms)", protocolVersion, status, reason, elapsedTime);
        if (logLevel.ordinal() >= Level.HEADERS.ordinal()) {

            for (String field : response.headers().keySet()) {
                if (shouldLogResponseHeader(field)) {
                    for (String value : valuesOrEmpty(response.headers(), field)) {
                        log(configKey, "%s: %s", field, value);
                    }
                }
            }

            int bodyLength = 0;
            if (response.body() != null && !(status == 204 || status == 205)) {
                // HTTP 204 No Content "...response MUST NOT include a message-body"
                // HTTP 205 Reset Content "...response MUST NOT include an entity"
                if (logLevel.ordinal() >= Level.FULL.ordinal()) {
                    log(configKey, ""); // CRLF
                }
                byte[] bodyData = Util.toByteArray(response.body().asInputStream());
                bodyLength = bodyData.length;
                if (logLevel.ordinal() >= Level.HEADERS.ordinal() && bodyLength > 0) {
                    log(configKey, "%s", decodeOrDefault(bodyData, UTF_8, "Binary data"));
                }
                if (elapsedTime > DEFAULT_SLOW_API_TIME) {
                    log(configKey, "[%s] elapsedTime : %s", SLOW_API_NOTICE, elapsedTime);
                }
                log(configKey, "<--- END HTTP (%s-byte body)", bodyLength);
                return response.toBuilder().body(bodyData).build();
            } else {
                log(configKey, "<--- END HTTP (%s-byte body)", bodyLength);
            }
        }
        return response;
    }
}
```
<br/>

 - `DemoFeignErrorDecoder`
    - ErrorDecoder를 상속받고 decode() 메서드를 구현한다.
    - 정상 응답이 아닌 경우 핸들링이 가능하다.
    - 예제에서는 HTTP Client 요청 결과로 404 NOT FOUND 상태로 응답이 왔을 때 상황을 처리하였다.
```java
public final class DemoFeignErrorDecoder implements ErrorDecoder {
    private final ErrorDecoder errorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        final HttpStatus httpStatus = HttpStatus.resolve(response.status());

        /**
         * [참고]
         * 외부 컴포넌트와 통신 시
         * 정의해놓은 예외 코드 일 경우엔 적절하게 핸들링하여 처리한다.
         */
        if (httpStatus == HttpStatus.NOT_FOUND) {
            System.out.println("[DemoFeignErrorDecoder] Http Status = " + httpStatus);
            throw new RuntimeException(String.format("[RuntimeException] Http Status is %s", httpStatus));
        }

        return errorDecoder.decode(methodKey, response);
    }

}
```
<br/>

 - `DemoFeignConfig`
    - 특정 FeignClient에서 사용할 설정 파일을 정의한다.
    - Interceptor와 ErrorDecoder를 빈으로 주입하였다.
```java
@Configuration
public class DemoFeignConfig {

    @Bean
    public DemoFeignInterceptor feignInterceptor() {
        return DemoFeignInterceptor.of();
    }

    @Bean
    public DemoFeignErrorDecoder DemoErrorDecoder() {
        return new DemoFeignErrorDecoder();
    }

}
```
<br/>

 - `FeignConfig`
    - 전역으로 필요한 FeignClient의 설정을 정의한다.
```java
@Configuration
public class FeignConfig {

    @Bean
    public Logger feignLogger() {
        return new FeignCustomLogger();
    }
}
```
<br/>

 - `DemoFeignClient`
    - DemoFeignConfig을 설정 파일로 참조한다. 정의한 Interceptor와 ErrorDecoder가 적용된다. 또한, 전역 설정인 FeignConfig의 설정도 적용된다.
    - Feign Client로 HTTP Client를 사용하는 방법은 선언적으로 스프링의 어노테이션을 이용해 정의하면 된다.
        - GET 요청인 경우 @GetMapping, POST 요청인 경우 @PostMapping
        - 요청 파라미터가 필요한 경우 @RequeestHeader, @RequestParam, @RequestBody 등을 사용할 수 있다.
```java
@FeignClient(
        name = "demo-client", // application.yaml에 설정해 놓은 값을 참조
        url = "${feign.url.prefix}", // application.yaml에 설정해 놓은 값을 참조 (= http://localhost:8080/target_server)
        configuration = DemoFeignConfig.class)
public interface DemoFeignClient {

    @GetMapping("/get") // "${feign.url.prefix}/get"으로 요청
    ResponseEntity<BaseResponseInfo> callGet(@RequestHeader(CUSTOM_HEADER_NAME) String customHeader,
                                             @RequestParam("name") String name,
                                             @RequestParam("age") Long age);

    @PostMapping("/post") // "${feign.url.prefix}/post"로 요청
    ResponseEntity<BaseResponseInfo> callPost(@RequestHeader(CUSTOM_HEADER_NAME) String customHeader,
                                              @RequestBody BaseRequestInfo baseRequestInfo);

    @GetMapping("/errorDecoder")
    ResponseEntity<BaseResponseInfo> callErrorDecoder();
}
```

