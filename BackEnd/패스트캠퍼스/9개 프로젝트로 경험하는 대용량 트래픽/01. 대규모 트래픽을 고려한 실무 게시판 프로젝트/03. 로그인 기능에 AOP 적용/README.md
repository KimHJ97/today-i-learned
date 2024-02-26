# 로그인 기능에 AOP 적용

## 1. AOP 이론

### AOP

Spring AOP(Aspect-Oriented Programming)은 스프링 프레임워크에서 제공하는 모듈 중 하나로, 관점 지향 프로그래밍의 구현을 지원하는 기술입니다. AOP는 애플리케이션의 여러 모듈에서 공통적으로 발생하는 관심사(Concern)를 분리하여 관리하고, 코드의 재사용성과 유지보수성을 향상시키기 위해 사용됩니다.  

<br/>

### AOP 주요 개념과 특징

 - __Aspect(관점)__
    - AOP에서의 관점은 애플리케이션의 특정 관심사를 나타냅니다.
    - 예를 들어, 로깅, 트랜잭션 관리, 보안 등이 관점의 예시입니다.
 - __Advice(조언)__
    - Advice는 관점에서 수행할 행동을 나타냅니다.
    - 예를 들어, 메서드 실행 전에 어떤 작업을 수행하는 advice가 있을 수 있습니다.
 - __Join Point(결합 지점)__
    - Join Point는 어드바이스가 실행되는 시점을 나타냅니다.
    - 예를 들어, 메서드 호출이나 필드 접근이 결합 지점이 될 수 있습니다.
 - __Pointcut(지점)__
    - Pointcut은 어드바이스를 적용할 결합 지점의 집합을 나타냅니다.
    - 정규 표현식이나 패턴을 사용하여 결합 지점을 지정할 수 있습니다.
 - __Weaving(위빙)__
    - Weaving은 Aspect를 적용하여 애플리케이션 코드에 Aspect의 행위를 삽입하는 과정을 말합니다.

<br/>

### AOP와 DynamicProxy

Spring AOP에서 Dynamic Proxy란 AOP 구현 방식 중 하나로 프록시 객체를 동적으로 생성하여 타겟 객체를 감싸는 방식을 의미합니다. 이 방식은 AOP의 핵심 구현 방법 중 하나로 스프링 AOP에서 주로 사용됩니다.  
 - __JDK Dynamic Proxy__
    - JDK의 java.lang.reflect.Proxy 클래스를 사용하여 인터페이스 기반의 프록시를 생성합니다.
    - 이 방식은 인터페이스를 구현한 타겟 객체에 대한 프록시
 - __CGLIB Proxy__
    - CGLIB(Class Generation Library)을 사용하여 클래스 기반의 프록시를 생성합니다.
    - 이 방식은 인터페이스를 구현하지 않은 클래스에 대한 프록시를 생성할 수 있습니다.

<br/>

### AspectJ

AspectJ는 스프링 AOP보다 더 강력한 기능을 제공하는 관점 지향 프로그래밍(AOP) 프레임워크로 보다 복잡하고 정교한 관점 지향 프로그래밍을 가능하게 합니다.  
AspectJ는 어노테이션, 포인트컷 표현식, 어드바이스 등을 사용하여 관점 지향 기능을 정의하고 적용할 수 있습니다.  

```java

@Aspect
public class LoggingAspect {
    @Before("execution(* com.example.service.*.*(..))")
    public void beforeAdvice(JoinPoint joinPoint) {
        // TODO: Service 호출전
    }
}
```

<br/>

## 2. AOP 적용

 - `build.gradle`
```gradle
dependencies {
	implementation group: 'org.springframework.boot', name: 'spring-boot-starter-aop', version: '3.1.2'
}
```

<br/>

 - `어노테이션 정의`
```java
package com.fastcampus.boardserver.aop;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface LoginCheck {
    public static enum UserType {
        USER, ADMIN
    }
    UserType type();
}
```

<br/>

 - `AOP 적용`
```java
@Component
@Aspect
@Order(Ordered.LOWEST_PRECEDENCE)
@Log4j2
public class LoginCheckAspect {
    @Around("@annotation(com.fastcampus.boardserver.aop.LoginCheck) && @ annotation(loginCheck)")
    public Object adminLoginCheck(ProceedingJoinPoint proceedingJoinPoint, LoginCheck loginCheck) throws Throwable {
        HttpSession session = (HttpSession) ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest().getSession();
        String id = null;
        int idIndex = 0;

        String userType = loginCheck.type().toString();
        switch (userType) {
            case "ADMIN": {
                id = SessionUtil.getLoginAdminId(session);
                break;
            }
            case "USER": {
                id = SessionUtil.getLoginMemberId(session); 
                break;
            }
        }
        if (id == null) {
            log.debug(proceedingJoinPoint.toString()+ "accountName :" + id);
            throw new HttpStatusCodeException(HttpStatus.UNAUTHORIZED, "로그인한 id값을 확인해주세요.") {};
        }

        Object[] modifiedArgs = proceedingJoinPoint.getArgs();

        if(proceedingJoinPoint.getArgs()!=null)
            modifiedArgs[idIndex] = id;

        return proceedingJoinPoint.proceed(modifiedArgs);
    }

}
```

