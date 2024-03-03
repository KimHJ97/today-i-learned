# 로깅, 예외처리 개발

## 1. 이론

### 로깅

로깅(Logging)은 애플리케이션의 동작 및 활동을 기록하고 추적하는 프로세스를 가리킵니다. 로깅은 프로그램이 실행 중에 발생하는 이벤트, 오류, 경고, 정보 및 디버깅 메시지를 기록하는 데 사용됩니다. 로그 파일은 애플리케이션의 상태를 모니터링하고 문제를 식별하며 디버깅에 도움을 줍니다.  
 - 디버깅 및 오류 식별: 로그를 통해 애플리케이션의 오류 및 문제를 파악하고 어떻게 발생했는지 추적할 수 있습니다.
 - 성능 모니터링: 로그를 통해 애플리케이션의 성능 및 응답 시간을 추적하고 병목 현상을 식별할 수 있습니다.
 - 보안: 보안 로그는 애플리케이션에 대한 불법 접근 및 보안 위반을 감지하고 방어할 수 있습니다.
 - 이력 추적: 사용자 활동 또는 데이터 변경과 같은 이력 정보를 추적하여 나중에 검토하거나 감시하고, 합법적인 작업을 증명하는 데 사용할 수 있습니다.

<br/>

### 로깅 레벨

 - TRACE: 매우 상세한 디버깅 정보
 - DEBUG: 디버그 목적의 자세한 정보
 - INFO: 애플리케이션의 상태나 중요한 이벤트 정보
 - WARN: 경고 또는 잠재적인 문제가 발생한 경우
 - ERROR: 오류 또는 예외 발생

```properties
# 루트 로거의 로깅 레벨
loggin.level.root=INFO

# 특정 패키지의 로깅 레벨 설정
logging.level.com.example=DEBUG
```

 - `MyService`
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class MyService {
    private static final Logger logger = LoggerFactory.getLogger(MyService.class);

    public void doSomething() {
        logger.debug("DEBUG 레벨 출력");
        logger.info("INFO 레벨 출력");
        logger.warn("WARN 레벨 출력");
        logger.error("ERROR 레벨 출력");
    }
}
```

<br/>

### 예외처리

예외 처리는 예상치 못한 문제 또는 오류 조건을 다루는 프로그래밍 기술 또는 절차입니다.  

예외 처리의 주요 목적은 애플리케이션의 안정성을 유지하고 예기치 않은 상황에서 애플리케이션을 비정상 종료시키지 않도록 하는 것입니다.  

이를 통해 사용자 경험을 향상시키고 디버깅 및 로깅을 통해 문제를 식별하고 해결할 수 있습니다.  

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    @ResponseBody
    public String handleCustomException(CustomException e) {
        return e.getMessage();
    }

    @ExceptionHandler(Exception.class)
    @ResponseBody
    public String handleException(Exception e) {
        return e.getMessage();
    }
}
```

<br/>

### 예외처리 전략

 - __Global Exception Handling(전역 예외 처리)__
    - Spring에서는 @ControllerAdvice 어노테이션을 사용하여 전역 예외 처리 클래스를 생성할 수 있습니다.
    - 이 클래스는 애플리케이션 전체에서 발생하는 예외를 처리하는 데 사용됩니다.
    - 전역 예외 처리 클래스에서는 예외 유형에 따른 적절한 응답을 생성하거나 로깅을 수행할 수 있습니다.
 - __특정 예외 처리__
    - 개별 컨트롤러나 서비스 메서드 내에서 발생하는 특정 예외를 처리하는 방법으로 @ExceptionHAndler 어노테이션을 사용할 수 있습니다.
    - 이를 통해 해당 예외 유형에 대한 맞춤형 처리 로직을 정의할 수 있습니다.
 - __사용자 정의 예외 클래스__
    - 애플리케이션에서 자체 예외 클래스를 정의하여 비즈니스 레이어 예외를 구분하고 관리할 수 있습니다.
    - 이러한 사용자 정의 예외 클래스를 만들면 예외 유형에 따라 별도의 처리 로직을 구현할 수 있습니다.
 - __트랜잭션 관리__
    - Spring의 선언적 트랜잭션 관리를 사용하여 예외가 발생한 경우 롤백 또는 커밋을 자동으로 관리할 수 있습니다.
    - @Transactional 어노테이션을 사용하여 트랜잭션을 설정하고 예외 발생 시 롤백 여부를 제어할 수 있습니다.

<br/>

## 2. 실습

 - `build.gradle`
    - Spring Boot의 기본 로깅을 비활성화한다.
```gradle
configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
	all {
		exclude group: 'org.springframework.boot', module: 'spring-boot-starter-logging'
	}
}

dependencies {
    // ..
    implementation 'org.springframework.boot:spring-boot-starter-log4j2'
}
```

<br/>

 - `log4j2.xml`
    - resources 폴더 하위에 'log4j2.xml' 파일을 만든다.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="INFO">
    <!-- 해당 설정파일에서 사용하는 프로퍼티-->
    <Properties>
        <Property name="logNm">Board-Server-log4j2</Property>
        <Property name="layoutPattern">%style{%d{yyyy/MM/dd HH:mm:ss,SSS}}{cyan} %highlight{[%-5p]}{FATAL=bg_red,
            ERROR=red,
            INFO=green, DEBUG=blue} [%C] %style{[%t]}{yellow}- %m%n -
        </Property>
    </Properties>

    <!-- LogEvent를 전달해주는 Appender-->
    <Appenders>
        <!-- 콘솔 로깅 정책 설정 -->
        <Console name="Console_Appender" target="SYSTEM_OUT">
            <PatternLayout pattern="${layoutPattern}"/>
        </Console>

        <!-- 파일 로깅 정책 설정 -->
        <RollingFile name="File_Appender" fileName="logs/${logNm}.log"
                     filePattern="logs/${logNm}_%d{yyyy-MM-dd}_%i.log.gz">
            <PatternLayout pattern="${layoutPattern}"/>
            <Policies>
                <SizeBasedTriggeringPolicy size="200KB"/>
                <TimeBasedTriggeringPolicy interval="1"/>
            </Policies>
            <DefaultRolloverStrategy max="10" fileIndex="min"/>
        </RollingFile>
    </Appenders>

    <!-- 실제 Logger-->
    <Loggers>
        <Root level="INFO" additivity="false">
            <AppenderRef ref="Console_Appender"/>
            <AppenderRef ref="File_Appender"/>
        </Root>
        <Logger name="org.springframework" level="DEBUG"
                additivity="false">
            <AppenderRef ref="Console_Appender"/>
            <AppenderRef ref="File_Appender"/>
        </Logger>
        <Logger name="com.fucct" level="ERROR" additivity="false">
            <AppenderRef ref="Console_Appender"/>
            <AppenderRef ref="File_Appender"/>
        </Logger>
        <Logger name="com.fucct.springlog4j2.loggertest" level="TRACE" additivity="false">
            <AppenderRef ref="Console_Appender"/>
        </Logger>
    </Loggers>
</Configuration>
```

