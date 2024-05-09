# 비동기 프로그래밍

 - Async 한 통신
 - 실시간성 응답을 필요로 하지 않는 상황에서 사용
 - ex) Notification, Email 전송, Push 알림
 - Main Thread가 Task를 처리하는 게 아니라 Sub Thread에게 Task를 위임하는 행위라고 말할 수 있다.

<br/>

## 스프링 비동기 처리 코드

 - `AsyncConfig`
    - @EnableAsync 어노테이션을 정의해주어야 비동기 처리 기능이 활성화된다.
```java
@Configuration
@EnableAsync
public class AsyncConfig {
}
```
<br/>

 - `AppConfig`
    - 비동기 처리에 사용할 쓰레드를 관리하는 ThreadPoolTaskExecutor를 설정한다.
    - ThreadPoolTaskExecutor를 여러개 정의할 수 있으며, @Async 어노테이션에 사용할 쓰레드 풀을 명시할 수 있다.
    - 주요 옵션으로는 CorePoolSize, MaxPoolSize, WorkQueue, KeepAliveTime 등이 있다.
        - corePoolSize: 기본 쓰레드 수
        - maxPoolSize: 최대 쓰레드 수
        - queueCapacity: 대기열의 최대 크기
        - keepAliveTime: corePoolSize를 초과하여 생성된 쓰레드의 작업 대기 시간. 이 시간동안 작업이 없으면 쓰레드 풀에서 정리한다.
        - rejectedExecutionHandler: 대기열이 가득 찬 상태에서 새로운 작업이 거부될 때 실행되는 정책
    - 쓰레드 풀에 있는 쓰레드 수가 corePoolSize를 초과하면, 작업을 처리할 추가 쓰레드가 필요할 때 새로운 쓰레드가 생성된다. 기본 쓰레드 수와 추가 쓰레드 수를 합쳐 최대 maxPoolSize 만큼의 쓰레드가 생성될 수 있다.
```java
@Configuration
public class AppConfig {

    @Bean(name = "defaultTaskExecutor", destroyMethod = "shutdown")
    public ThreadPoolTaskExecutor defaultTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(200);
        executor.setMaxPoolSize(200);
        return executor;
    }

    @Bean(name = "messagingTaskExecutor", destroyMethod = "shutdown")
    public ThreadPoolTaskExecutor messagingTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(200);
        executor.setMaxPoolSize(200);
        return executor;
    }
}
```
<br/>

 - `EmailService`
    - 비동기로 실행될 메서드를 정의한다.
```java
@Service
@RequiredArgsConstructor
public class EmailService {

    @Async("defaultTaskExecutor")
    public void sendMail() {
        System.out.println("[sendMail] :: "
                           + Thread.currentThread().getName());
    }

    @Async("messagingTaskExecutor")
    public void sendMailWithCustomThreadPool() {
        System.out.println("[sendMailWithCustomThreadPool] :: "
                           + Thread.currentThread().getName());
    }
}
```
<br/>

## 스프링 비동기 처리 주의점

@Async가 정의된 메서드는 스프링이 만든 프록시 객체로부터 실행된다.  
즉, 프록시 객체가 내부적으로 새로운 쓰레드를 만들고 실제 메서드를 호출해준다.  

떄문에, 스프링 DI로 의존성 주입을 받지 않고 직접 new 연산자로 객체를 생성하여 메서드를 호출하면 비동기 처리가 되지 않고, 직접 정의한 메서드가 동기적으로 실행된다.  

그 외에도, 특정 클래스안에 a() 메서드가 있고, a() 내부에서 @Async가 정의된 b() 메서드를 실행한다고 가정할 떄에도 b() 메서드는 동기적을오 실행된다.  
a() 메서드는 스프링의 프록시 객체로 실행되지만, b() 메서드는 실제 this.b()로 기존에 정의된 클래스안에서 호출되는 것이다.  

```java
@Service
@RequiredArgsConstructor
public class AsyncService {

    private final EmailService emailService;

    // ✔ 비동기로 처리된다.
    public void asyncCall_1() {
        System.out.println("[asyncCall_1] :: " + Thread.currentThread().getName());
        emailService.sendMail();
        emailService.sendMailWithCustomThreadPool();
    }

    // ❌ 동기적으로 처리된다.
    public void asyncCall_2() {
        System.out.println("[asyncCall_2] :: " + Thread.currentThread().getName());
        EmailService emailService = new EmailService();
        emailService.sendMail();
        emailService.sendMailWithCustomThreadPool();
    }

    // ❌ 동기적으로 처리된다.
    public void asyncCall_3() {
        System.out.println("[asyncCall_3] :: " + Thread.currentThread().getName());
        sendMail();
    }

    @Async
    public void sendMail() {
        System.out.println("[sendMail] :: " + Thread.currentThread().getName());
    }
}
```

