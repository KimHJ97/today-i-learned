# Spring Retry

 - 공식 깃허브: https://github.com/spring-projects/spring-retry

<br/>

## Spring Retry 소개

Spring Retry는 실패한 작업을 재시도할 수 있도록 지원하는 라이브러리로, 특히 네트워크 문제나 일시적인 장애로 인해 작업이 실패할 경우 이를 자동으로 다시 시도하게 함으로써 애플리케이션의 안정성과 복원력을 높여줍니다. Spring Retry는 재시도 횟수, 재시도 간격, 백오프(backoff) 정책 등을 세부적으로 설정할 수 있습니다.  

Spring Retry는 재시도를 통해 일시적인 장애나 오류 상황에서 애플리케이션의 안정성을 향상시키는 유용한 도구입니다. 재시도 정책과 백오프 정책을 통해 재시도 동작을 세밀하게 제어할 수 있으며, 애노테이션을 사용하여 간단하게 재시도를 설정할 수 있습니다. 회로 차단기를 통해 연속적인 실패를 관리하고, 시스템이 더 큰 장애를 겪지 않도록 보호할 수도 있습니다.  

 - __재시도 정책 (Retry Policy)__: 작업 실패 시 재시도 횟수와 조건을 정의합니다.
 - __백오프 정책 (Backoff Policy)__: 재시도 간격을 제어합니다. 지수 백오프(Exponential Backoff)와 같은 다양한 정책을 사용할 수 있습니다.
 - __회로 차단기 (Circuit Breaker)__: 연속적인 실패를 감지하여 일정 시간 동안 재시도를 멈추는 기능입니다.
 - __재시도 템플릿 (Retry Template)__: 재시도를 쉽게 구현할 수 있는 템플릿 클래스입니다.
 - __애노테이션 지원__: 간단한 어노테이션으로 메소드 수준에서 재시도를 설정할 수 있습니다.

<br/>

### 간단 예시

 - `pom.xml`
    - Spring Retry를 사용하기 위해서는 의존성을 추가해야 한다.
```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry-annotations</artifactId>
</dependency>
```
<br/>

 - `AppConfig`
    - Spring Retry를 사용하기 위해서는 활성화 옵션을 정의해주어야 한다.
```java
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.annotation.EnableRetry;

@Configuration
@EnableRetry
public class AppConfig {
}
```
<br/>

 - `RetryTemplate을 이용한 방법`
    - @EnableRetry 활성화가 되지 않아도 사용할 수 있다.
```java
import org.springframework.retry.RetryCallback;
import org.springframework.retry.RetryContext;
import org.springframework.retry.support.RetryTemplate;

public class RetryExample {
    public static void main(String[] args) {
        RetryTemplate retryTemplate = new RetryTemplate();

        String result = retryTemplate.execute(new RetryCallback<String, RuntimeException>() {
            @Override
            public String doWithRetry(RetryContext context) {
                // 재시도할 코드 작성
                System.out.println("Retrying operation...");
                if (true) {
                    throw new RuntimeException("Operation failed");
                }
                return "Success";
            }
        });

        System.out.println(result);
    }
}
```
<br/>

 - `@Retryable 어노테이션을 이용한 방법`
    - @EnableRetry 활성화가 되어야 한다.
```java
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
public class RetryableService {

    @Retryable(
      value = { RuntimeException.class }, 
      maxAttempts = 5, 
      backoff = @Backoff(delay = 2000, multiplier = 2))
    public void retryableMethod() {
        System.out.println("Attempting operation...");
        if (true) {
            throw new RuntimeException("Operation failed");
        }
        System.out.println("Operation succeeded");
    }
}
```
<br/>

 - `회로 차단기 사용`
    - 회로 차단기는 연속된 실패를 감지하여 일정 시간 동안 재시도를 멈추는 기능이다.
```java
import org.springframework.retry.annotation.CircuitBreaker;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
public class CircuitBreakerService {

    @Retryable(
      value = { RuntimeException.class }, 
      maxAttempts = 5, 
      backoff = @Backoff(delay = 2000))
    @CircuitBreaker(
      maxAttempts = 3, 
      openTimeout = 5000L, 
      resetTimeout = 20000L)
    public void circuitBreakerMethod() {
        System.out.println("Attempting operation...");
        if (true) {
            throw new RuntimeException("Operation failed");
        }
        System.out.println("Operation succeeded");
    }
}
```
<br/>

### @Recover

@Recover 어노테이션은 Spring Retry에서 재시도 횟수를 모두 소진한 후에 호출되는 복구 메소드를 정의하는 데 사용됩니다. 이 어노테이션을 통해 실패 후의 처리를 커스터마이즈할 수 있습니다. @Recover 메소드는 일반적으로 실패한 작업의 결과를 처리하거나, 오류를 로깅하고 대체 동작을 수행하는 데 사용됩니다.  

 - `RetryableService`
    - __@Recover 어노테이션은 재시도할 메소드와 같은 클래스 내에 정의__ 되며, __실패한 메소드와 동일한 반환 타입__ 을 가져야 합니다. 또한, __첫 번째 파라미터로 예외 타입을 받아야 하며, 이 예외 타입은 재시도할 때 발생하는 예외와 일치__ 해야 합니다.
    - retryable 메소드와 recover 메소드 반환 타입을 맞춰주지 않으면 Cannot locate recovery method 에러가 발생한다.
```java
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

@Service
public class RetryableService {

    @Retryable(
      value = { CustomException.class }, 
      maxAttempts = 3, 
      backoff = @Backoff(delay = 2000))
    public String retryableMethod(String param) throws CustomException {
        System.out.println("Attempting operation...");
        if (true) {
            throw new CustomException("Operation failed");
        }
        return "Success";
    }

    @Recover
    public String recover(CustomException e, String param) {
        System.out.println("Recovering from failure...");
        return "Recovered from failure with param: " + param;
    }
}
```
<br/>

### RetryTemplate 알아보기

 - `RetryTemplateConfig`
    - 재시도가 필요한 코드를 retryTemplate.execute() 내부에서 실행한다.
```java
@Configuration
public class RetryTemplateConfig {

    @Bean
    public RetryTemplate retryTemplate() {
        FixedBackOffPolicy backOffPolicy = new FixedBackOffPolicy();
        backOffPolicy.setBackOffPeriod(1000L); //지정한 시간만큼 대기후 재시도 한다.
        // ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
        // backOffPolicy.setInitialInterval(100L); //millisecond
        // backOffPolicy.setMultiplier(2); //interval * N 만큼 대기후 재시도 한다.

        SimpleRetryPolicy retryPolicy = new SimpleRetryPolicy(); // 고정된 횟수만큼 재 시도 하는데 사용   
        retryPolicy.setMaxAttempts(2); //retry max count

        RetryTemplate retryTemplate = new RetryTemplate();
        retryTemplate.setBackOffPolicy(backOffPolicy);
        retryTemplate.setRetryPolicy(retryPolicy);
        return retryTemplate;
    }
}

// RetryTemplate 샘플 코드
@Service
public class SomeClass {
    
    @Autowired
    private RetryTemplate retryTemplate;   

    public String apply() {
        String result = retryTemplate.execute(context -> someFunction());
        return result;
    }
}
```
<br/>

 - `Recovery Callback`
    - 재시도가 전부 실패하면 RetryOperations는 RecoveryCallback을 호출한다.
    - 이 기능을 사용하려면 execute 메소드를 호출할 때 RecoveryCallback 객체를 전달해주어야 한다.
    - 모든 재시도가 실패하고 더 이상 재시도할 수 없는 경우, RecoveryCallback 메소드를 호출한다. RecoveryCallback의 recover 메소드에서는 재시도가 전부 실패한 경우에 대한 대체 로직을 수행한다.
```java
// 익명 클래스 
String result = retryTemplate.execute(new RetryCallback<String, Throwable>() {
            @Override
            public String doWithRetry(RetryContext context) throws Throwable {
                return "retry logic";
            }
        }, new RecoveryCallback<String>() {
            @Override
            public String recover(RetryContext context) throws Exception {
                return "recovery logic";
            }
        });

// 람다식 
String result = retryTemplate.execute(
                (RetryCallback<String, Throwable>) 
                        context -> "retry logic", 
                context -> "recovery logic");
```
<br/>

 - `Backoff Policies`
    - __BackOffPolicy는 재시도 간의 일정 시간 간격을 두고 retry 제어하는데 사용된다.__
    - 오류가 발생하여 재시도할 떄 잠깐 기다리고 재시도하는 것으로 해결되는 경우가 있다.
    - BackoffPolicy 인터페이스의 backOff 메소드를 원하는 방식으로 구현하면 된다.
        - FixedBackOffPolicy: 고정된 시간 간격을 사용한다.
        - ExponentialBackOffPolicy: 점진적으로 시간 간격이 늘어난다.
```java
public interface BackOffPolicy {

	BackOffContext start(RetryContext context);

	void backOff(BackOffContext backOffContext) throws BackOffInterruptedException;
}

// 사용 샘플
ExponentialBackOffPolicy backOffPolicy = new ExponentialBackOffPolicy();
backOffPolicy.setInitialInterval(100L); // millisecond
backOffPolicy.setMultiplier(2); //interval * N 만큼 대기후 재시도 한다.
```
<br/>

 - `Retry Policies`
    - RetryTemplate는 RetryPolicy의 open 메서드로 RetryContext 객체를 생성하고, RetryCallback의 doWithRetry 메서드 인자로 생성된 RetryContext 객체를 전달한다.
    - RetryTemplate은 콜백이 실패한 경우 RetryPolicy에게 상태를 업데이트 하도록 요청한다.
    - 그리고, RetryPolicy의 canRetry 메소드를 호출하여, 재시도가 가능한지 여부를 묻는다. 만약 재시도가 불가능한경우 RetryTemplate은 마지막 콜백 실행시 발생한 예외를 던진다. 단, RecoveryCallback이 있는 경우 RecoveryCallback 메소드를 호출한다.
    - __모든 예외를 재시도하는 것은 비효율적일 수 있다. 재시도 가능할 것 같은 예외에 대해서만 재시도 하는 것이 좋다.__
```java
// Set the max attempts including the initial attempt before retrying
// and retry on all exceptions (this is the default):
SimpleRetryPolicy policy = new SimpleRetryPolicy(5, Collections.singletonMap(Exception.class, true));

// Use the policy...
RetryTemplate template = new RetryTemplate();
template.setRetryPolicy(policy);
template.execute(new RetryCallback<Foo>() {
    public Foo doWithRetry(RetryContext context) {
        // business logic here
    }
});
```
<br/>

## 예제 코드

 - `의존성 추가`
```groovy
// spring retry
implementation 'org.springframework.retry:spring-retry'

// mockWebServer
testImplementation('com.squareup.okhttp3:okhttp:4.10.0')
testImplementation('com.squareup.okhttp3:mockwebserver:4.10.0')
```
<br/>

 - `KakaoAddressSearchService`
```java
public class KakaoAddressSearchService {

    @Retryable(
            value = {RuntimeException.class},
            maxAttempts = 2,
            backoff = @Backoff(delay = 2000)
    )
    public KakaoApiResponseDto requestAddressSearch(String address) {

        if(ObjectUtils.isEmpty(address)) return null;

        return restTemplate.exchange(uri, HttpMethod.GET, httpEntity, KakaoApiResponseDto.class).getBody();
    }

    @Recover
    public KakaoApiResponseDto recover(RuntimeException e, String address) {
        log.error("All the retries failed. address: {}, error: {}", address, e.getMessage());
        return null;
    }
}
```

 - `RetryConfig`
```java
@EnableRetry
@Configuration
public class RetryConfig {
}
```

 - `테스트 코드`
```groovy
import org.springframework.boot.test.mock.mockito.MockBean
import spock.lang.Specification

import com.example.project.AbstractIntegrationContainerBaseTest
import com.example.project.api.dto.DocumentDto
import com.example.project.api.dto.KakaoApiResponseDto
import com.example.project.api.dto.MetaDto
import com.fasterxml.jackson.databind.ObjectMapper
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.spockframework.spring.SpringBean
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType


class KakaoAddressSearchServiceRetryTest extends AbstractIntegrationContainerBaseTest {

    @Autowired
    private KakaoAddressSearchService kakaoAddressSearchService

    @SpringBean
    private KakaoUriBuilderService kakaoUriBuilderService = Mock()

    private MockWebServer mockWebServer

    private ObjectMapper mapper = new ObjectMapper()

    private String inputAddress = "서울 성북구 종암로 10길"

    def setup() {
        mockWebServer = new MockWebServer()
        mockWebServer.start()
        println mockWebServer.port
        println mockWebServer.url("/")
    }

    def cleanup() {
        mockWebServer.shutdown()
    }

    def "requestAddressSearch retry success"() {
        given:
        def metaDto = new MetaDto(1)
        def documentDto = DocumentDto.builder()
                .addressName(inputAddress)
                .build()
        def expectedResponse = new KakaoApiResponseDto(metaDto, Arrays.asList(documentDto))
        def uri = mockWebServer.url("/").uri()

        when:
        mockWebServer.enqueue(new MockResponse().setResponseCode(504))
        mockWebServer.enqueue(new MockResponse().setResponseCode(200)
                .addHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .setBody(mapper.writeValueAsString(expectedResponse)))

        def kakaoApiResult = kakaoAddressSearchService.requestAddressSearch(inputAddress)

        then:
        2 * kakaoUriBuilderService.buildUriByAddressSearch(inputAddress) >> uri
        kakaoApiResult.getDocumentList().size() == 1
        kakaoApiResult.getMetaDto().totalCount == 1
        kakaoApiResult.getDocumentList().get(0).getAddressName() == inputAddress

    }


    def "requestAddressSearch retry fail "() {
        given:
        def uri = mockWebServer.url("/").uri()

        when:
        mockWebServer.enqueue(new MockResponse().setResponseCode(504))
        mockWebServer.enqueue(new MockResponse().setResponseCode(504))

        def result = kakaoAddressSearchService.requestAddressSearch(inputAddress)

        then:
        2 * kakaoUriBuilderService.buildUriByAddressSearch(inputAddress) >> uri
        result == null
    }
}
```

