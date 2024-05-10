# Logback

 - Logback은 SLF4J(Simple Logging Facade for Java) 인터페이스를 구현한 구현체이다.
 - Appender 종류
    - ConsoleAppender: 콘솔에 log를 출력
    - FileAppender: 파일 단위로 log 를 저장
    - RollingFileAppender: (설정 옵션에 따라) log를 여러 파일로 나누어 저장
    - SMTPAppender: log를 메일로 전송 하여 기록
    - DBAppender: log를 DB에 저장
 - 참고
    - https://dkswnkk.tistory.com/445
    - https://loosie.tistory.com/829
    - https://deeplify.dev/back-end/spring/logging
    - https://cjw-awdsd.tistory.com/56
    - https://loosie.tistory.com/829

<br/>

## Logging의 종류

Java 진영에서 로깅 관련 프레임워크로 log4j, logback, log4j2가 있으며, 이것들을 통합한 인터페이스로 SLF4J가 제공된다.  
logback과 log4j2는 모두 log4j를 기반으로 하여 설정이나 사용방법이 유사하다. 다만, log4j는 2015년 08월 05일 이후 지원이 종료되었다.  
 - logback
    - log4j 이후 출시된 보다 향상되고 가장 널리 사용되고 있는 Java 로깅 프레임워크
    - Spring Boot 진영에서 기본적으로 로깅 구현체로 사용된다.
 - log4j2
    - 가장 최신에 나온 로깅 프레임워크
    - logback처럼 필터링 기능과 자동 리로딩을 지원한다.
    - 멀티 쓰레드 환경에서 비동기 로거의 경우 다른 로깅 프레임워크보다 처리량이 많고, 대기시간이 훨씬 짧으며 좋은 성능을 보인다.

<br/>

## 로깅 레벨

로깅 레벨로는 5가지가 존재하며, 로그 레벨 지정시 해당 로그 레벨의 상위 우선순위 로그가 모두 출력된다.  
info를 지정하면 error, warn, info가 출력된다. trace를 지정하면 모든 로그가 출력된다.  

 - error: 에러 메시지
 - warn: 경고성 메시지
 - info: 정보성 메시지
 - debug: 디버그 목적 메시지
 - trace: 디버그 보다 상세한 메시지

```java
@Slf4j
@RestController
public class DemoController {

    @GetMapping("/demo")
    public String demo() {

        log.trace("log --> TRACE");
        log.debug("log --> DEBUG");
        log.info("log --> INFO");
        log.warn("log --> WARN");
        log.error("log --> ERROR");

        return "Hello";
    }
}
```

<br/>

## 로깅을 사용하는 이유

 - 스레드 정보, 클래스 이름 같은 부가 정보를 함께 볼 수 있고, 출력 모양을 조정할 수 있다.
 - 로그 레벨에 따라 개발서버에서는 모든 로그를 출력하고, 운영서버에서는 출력하지 않는 등 로그를 상황에 맞게 조절할 수 있다.
 - 시스템 아웃 콘솔에만 출력하는 것이 아니라, 파일이나 네트워크 등, 로그를 별도의 위치에 남길 수 있다.
 - 특히 파일로 남길 때에는 일별, 특정 용량에 따라 로그를 분할하는 것도 가능하다.
 - println을 썼을 때보다 내부 버퍼링, 멀티 스레드 등의 환경에서 훨씬 좋다

<br/>

## 스프링 부트 Logback 적용

스프링 부트는 spring-boot-starter-web 의존성을 주입받으면, spring-boot-starter-logging 의존성이 자동으로 받게 된다. 여기에서 logback이 기본적으로 포함되어 있다.  

 - `application.yml`
    - 스프링 부트에서는 기본적으로 로그에 대한 설정을 application.properties에서 설정할 수 있도록 옵션 값을 제공한다.
    - 이 방법은 스프링 부트 위에서만 가능한 추상화된 방식이다.
```yml
logging:
  level:
    root: debug
```
<br/>

 - `logback-spring.xml`
    - 스프링 부트는 기본적으로 'logback-spring.xml' 파일이 있으면 해당 설정을 기준으로 로깅 설정을 적용한다.
    - Appender를 정의하고, Appender를 사용하면 된다.
        - Appdender의 종류로는 ConsoleAppender, FileAppender, RollingFileAppender 등이 있따.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>[%d{yyyy-MM-dd HH:mm:ss}:%-3relative] %-5level ${PID:-} --- [%15.15thread] %-40.40logger{36} : %msg%n</Pattern>
        </layout>
    </appender>

    <root level="debug">
        <appender-ref ref="STDOUT" />
    </root>

</configuration>
```
<br/>

 - `콘솔 로그에 색상 입히기`
    - 공식 홈페이지: https://logback.qos.ch/manual/layouts.html#coloring
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 로그 패턴에 색상 적용 %clr(pattern){color} -->
    <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter" />

    <!-- log 변수 값 설정 -->
    <property name="CONSOLE_LOG_PATTERN"
              value="[%d{yyyy-MM-dd HH:mm:ss}:%-3relative]  %clr(%-5level) %clr(${PID:-}){magenta} %clr(---){faint} %clr([%15.15thread]){faint} %clr(%-40.40logger{36}){cyan} %clr(:){faint} %msg%n"/>

    <!-- 콘솔(STDOUT) -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>${CONSOLE_LOG_PATTERN}</Pattern>
        </layout>
    </appender>
    
    <root level="debug">
        <appender-ref ref="STDOUT" />
    </root>

</configuration>
```
<br/>

 - `콘솔과 파일에 로그 따로 기록하기`
    - 파일에 로그를 기록하기 위해서는 FileAppender를 이용한다.
    - 그 외에도 RollingFileAppender를 이용할 수 있는데, 이것은 FileAppender를 상속하여 로그 파일을 rollover한다. (특정 기준에 따라 로그 파일을 변경한다.)
        - RollingPolicy: rollover에 필요한 액션 정의
            - TimeBasedPolicy: 시간을 기준으로 rollover 설정
            - SizeAndTimeBasedRollingPolicy: 시간과 파일 크기를 고려하여 rollover 설정
        - TriggeringPolicy: rollover가 발생하는 정책 정의
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- log 기록 절대 위치 설정 -->
    <property name="LOGS_ABSOLUTE_PATH" value="./logs" />

    <property name="CONSOLE_LOG_PATTERN"
              value="[%d{yyyy-MM-dd HH:mm:ss}:%-3relative]  %clr(%-5level) %clr(${PID:-}){magenta} %clr(---){faint} %clr([%15.15thread]){faint} %clr(%-40.40logger{36}){cyan} %clr(:){faint} %msg%n"/>
    <property name="FILE_LOG_PATTERN"
              value="[%d{yyyy-MM-dd HH:mm:ss}:%-3relative] %-5level ${PID:-} --- [%15.15thread] %-40.40logger{36} : %msg%n"/>
              
    <!-- 콘솔(STDOUT) -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>${CONSOLE_LOG_PATTERN}</Pattern>
        </layout>
    </appender>

    <!-- 파일(FILE) -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- log 기록할 파일 위치 설정 -->
        <file>${LOGS_ABSOLUTE_PATH}/logback.log</file>

        <!-- log 기록 타입 인코딩 -->
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
        </encoder>

        <!-- 시간 기준 rollover 정책 -->
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- daily rollover -->
            <fileNamePattern>logFile.%d{yyyy-MM-dd}.log</fileNamePattern>
            <!-- keep 30 days' worth of history capped at 3GB total size -->
            <maxHistory>30</maxHistory>
            <totalSizeCap>3GB</totalSizeCap>
        </rollingPolicy>
    </appender>
   
    <!-- log 레벨 설정 (logging.level.root=info)-->
    <root level="info">
        <!-- 참조할 appender 설정 - STDOUT -->
        <appender-ref ref="STDOUT" />
    </root>

    <!-- log 레벨 설정 (org.springframework.web=debug)-->
    <logger name="org.springframework.web" level="debug">
        <appender-ref ref="FILE" />
    </logger>

</configuration>
```
<br/>

 - `Spring Profile에 따라 로그 기록하기`
    - local: 로컬 환경. 콘솔에 info 수준의 로그를 기록한다.
    - dev: 개발 환경. 콘솔에 debug 수준의 로그를 기록하고 로컬에서 테스트 용으로 file에 org.springframework.web 로그를 debug 수준으로 기록한다.
    - real: 배포 환경: 콘솔에 info 수준의 로그를 기록하고 file에 org.springframework.web 로그를 debug 수준으로 기록한다.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <!-- 로그 패턴에 색상 적용 %clr(pattern){color}
        https://logback.qos.ch/manual/layouts.html#coloring
    -->
    <conversionRule conversionWord="clr" converterClass="org.springframework.boot.logging.logback.ColorConverter" />

    <springProfile name="dev">
        <property resource="application-dev-log.yml" />
    </springProfile>
    <springProfile name="real1, real2">
        <property resource="application-real-log.yml" />
    </springProfile>

    <!-- log 변수 값 설정 -->
    <springProperty name="LOG_PATH" source= "log.config.path" />
    <springProperty name="LOG_FILE_NAME" source= "log.config.filename" />
    <springProperty name="LOG_MAX_HISTORY" source= "log.config.maxHistory" />
    <springProperty name="LOG_TOTAL_SIZE_CAP" source= "log.config.totalSizeCap" />

    <property name="CONSOLE_LOG_PATTERN"
              value="[%d{yyyy-MM-dd HH:mm:ss}:%-3relative]  %clr(%-5level) %clr(${PID:-}){magenta} %clr(---){faint} %clr([%15.15thread]){faint} %clr(%-40.40logger{36}){cyan} %clr(:){faint} %msg%n"/>
    <property name="FILE_LOG_PATTERN"
              value="[%d{yyyy-MM-dd HH:mm:ss}:%-3relative] %-5level ${PID:-} --- [%15.15thread] %-40.40logger{36} : %msg%n"/>

    <!-- 콘솔(STDOUT) -->
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <layout class="ch.qos.logback.classic.PatternLayout">
            <Pattern>${CONSOLE_LOG_PATTERN}</Pattern>
        </layout>
    </appender>

    <!-- 파일(FILE) -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <!-- log 기록할 파일 위치 설정 -->
        <file>${LOG_PATH}/${LOG_FILE_NAME}.log</file>

        <!-- log 기록 타입 인코딩 -->
        <encoder>
            <pattern>${FILE_LOG_PATTERN}</pattern>
        </encoder>

        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- daily rollover -->
            <fileNamePattern>${LOG_PATH}/${LOG_FILE_NAME}.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>${LOG_MAX_HISTORY}</maxHistory>
            <totalSizeCap>${LOG_TOTAL_SIZE_CAP}</totalSizeCap>
        </rollingPolicy>
    </appender>

    <!-- spring profile별 로그 설정 -->
    <!--  local 환경  -->
    <springProfile name="local">
        <root level="info">
            <appender-ref ref="STDOUT" />
        </root>
    </springProfile>

    <!-- dev 환경  -->
    <springProfile name="dev">
        <root level="debug">
            <appender-ref ref="STDOUT" />
        </root>
        <logger name="org.springframework.web" level="debug">
            <appender-ref ref="FILE" />
        </logger>
    </springProfile>

    <!-- real 환경  -->
    <springProfile name="real1, real2">
        <root level="info">
            <appender-ref ref="STDOUT" />
        </root>
        <logger name="org.springframework.web" level="debug">
            <appender-ref ref="FILE" />
        </logger>
    </springProfile>

</configuration>
```
<br/>

## 스프링 부트 Logback 적용2

 - `logback-spring.xml`
    - 스프링 실행시 기본적으로 logback-spring.xml 파일이 존재하면 해당 로그 설정을 적용한다.
    - 때문에, 해당 파일에 아무 설정이 없다면 스프링 부트를 실행할 때 나오는 로그 조차 표시되지 않는다.
    - 스프링 부트는 기본적으로 'org/springframework/boot/logging/logback/defaults.xml' 파일의 설정을 사용한다. include 지시어를 통해 해당 설정 내용을 적용할 수 있다.
    - 프로필 별로 설정 파일을 분리하고 싶은 경우 'logback-spring-{프로필}.xml' 파일을 생성한다.
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <include resource="org/springframework/boot/logging/logback/defaults.xml" />
    <include resource="logback-spring-${spring.profiles.active}.xml"/>
</configuration>
```
<br/>

 - `logback-spring-local.xml`
    - 로컬 환경에서 사용할 로그를 설정한다.
        - 단순히, 콘솔에 로그를 출력한다.
    - CONSOLE2: INFO 레벨의 로깅 어펜더를 설정한다.
    - CONSOLE3: DEBUG 레벨의 로깅 어펜더를 설정한다.
    - root 지시어 내부에 어펜더를 적용한다.
        - root에 로그 레벨은 DEBUG이지만, 어펜더에 설정한 로그 레벨이 우선순위로 적용된다.
```xml
<included>
  <!--
  ## "org/springframework/boot/logging/logback/console-appender.xml"에 정의되어 있는 appender는 다음과 같다.
  	<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
		<encoder>
			<pattern>${CONSOLE_LOG_PATTERN}</pattern>
			<charset>${CONSOLE_LOG_CHARSET}</charset>
		</encoder>
	</appender>

	그리고 저기서 사용하는 ${CONSOLE_LOG_PATTERN}과 ${CONSOLE_LOG_CHARSET}은
	logback-spring.xml에서 include한 "org/springframework/boot/logging/logback/defaults.xml"에 정의되어 있다.
  -->
  <include resource="org/springframework/boot/logging/logback/console-appender.xml" />

  <appender name="CONSOLE2" class="ch.qos.logback.core.ConsoleAppender">
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>INFO</level>
    </filter>
    <layout>
      <pattern>
        [CONSOLE2] [%-5level] %d{yyyy-MM-dd HH:mm:ss} [%thread] [%logger{0}:%line] - %msg%n
      </pattern>
    </layout>
  </appender>

  <appender name="CONSOLE3" class="ch.qos.logback.core.ConsoleAppender">
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>DEBUG</level>
    </filter>
    <layout>
      <pattern>
        [CONSOLE3] [%-5level] %d{yyyy-MM-dd HH:mm:ss} [%thread] [%logger{40}:%line] - %msg%n%n
      </pattern>
    </layout>
  </appender>

  <root level="DEBUG">
    <appender-ref ref="CONSOLE" />
    <appender-ref ref="CONSOLE2" />
    <appender-ref ref="CONSOLE3" />
  </root>

</included>
```
<br/>

### 운영 환경 로그 설정

 - `logback-variables.properties`
    - 운영 환경 로그 설정 파일에서 사용할 변수값을 properties 파일에 설정한다.
    - 로그 설정 파일에서 해당 변수를 불러와 사용할 수 있다.
```properties
LOG_DIR=logs
LOG_PATTERN=[%-5level] %d{yyyy-MM-dd HH:mm:ss} [%thread] [%logger{0}:%line] - %msg%n
```

 - `logback-spring-prod.xml`
    - REQUEST1 어펜더: RollingFileAppender를 사용하여 시간별 혹은 용량별로 다른 파일에 로그를 적용할 수 있다.
    - ERROR 어펜더: RollingFileAppender를 사용하여 파일에 로그를 저장하고, LevelFilter를 이용하여 특정 레벨에 로그만 저장하도록 한다.
```xml
<included>
  <!-- logback-variables.properties에 정의되어 있는 Key를 사용하기 위한 코드 -->
  <property resource="logback-variables.properties" />

  <appender name="REQUEST1" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_DIR}/request1.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>${LOG_DIR}/archive/request1.%d{yyyy-MM-dd}_%i.log</fileNamePattern>
      <maxFileSize>1KB</maxFileSize> <!-- 로그파일의 최대 크기 -->
      <maxHistory>30</maxHistory> <!-- 로그파일 최대 보관주기(단위 : 일) / 보관주기가 넘어가면 파일은 자동으로 삭제 -->
    </rollingPolicy>
    <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
      <pattern>[REQUEST1] ${LOG_PATTERN}</pattern>
      <outputPatternAsHeader>true</outputPatternAsHeader>
    </encoder>
  </appender>

  <appender name="REQUEST2" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_DIR}/request2.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>${LOG_DIR}/archive/request2.%d{yyyy-MM-dd}_%i.log</fileNamePattern>
      <maxFileSize>1KB</maxFileSize>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder>
      <pattern>[REQUEST2] ${LOG_PATTERN}</pattern>
      <outputPatternAsHeader>true</outputPatternAsHeader>
    </encoder>
  </appender>

  <appender name="MDC" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_DIR}/mdc.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>${LOG_DIR}/archive/mdc.%d{yyyy-MM-dd}_%i.log</fileNamePattern>
      <maxFileSize>1KB</maxFileSize>
      <maxHistory>30</maxHistory>
    </rollingPolicy>
    <encoder>
      <pattern>[MDC] %X{job}%n</pattern>
      <outputPatternAsHeader>true</outputPatternAsHeader>
    </encoder>
  </appender>

  <appender name="ERROR" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_DIR}/error.log</file>
    <filter class="ch.qos.logback.classic.filter.LevelFilter">
      <level>error</level>
      <onMatch>ACCEPT</onMatch> <!-- 레벨이 동일하면 받아들이고, -->
      <onMismatch>DENY</onMismatch> <!-- 레벨이 다르다면 거부한다. -->
    </filter>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
      <fileNamePattern>${LOG_DIR}/archive/error.%d{yyyy-MM-dd}_%i.log</fileNamePattern>
      <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
        <maxFileSize>1KB</maxFileSize>
      </timeBasedFileNamingAndTriggeringPolicy>
      <maxHistory>60</maxHistory>
    </rollingPolicy>
    <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
      <pattern>${LOG_PATTERN}</pattern>
      <outputPatternAsHeader>true</outputPatternAsHeader>
    </encoder>
  </appender>

  <appender name="QUERY" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>${LOG_DIR}/query.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
      <fileNamePattern>${LOG_DIR}/archive/query.%d{yyyy-MM-dd}_%i.log</fileNamePattern>
      <maxFileSize>1KB</maxFileSize>
      <maxHistory>60</maxHistory>
    </rollingPolicy>
    <encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
      <pattern>${LOG_PATTERN}</pattern>
      <outputPatternAsHeader>true</outputPatternAsHeader>
    </encoder>
  </appender>

  <root level="INFO">
    <appender-ref ref="REQUEST1" />
    <appender-ref ref="REQUEST2" />
    <appender-ref ref="MDC" />
    <appender-ref ref="ERROR" />
  </root>

  <!--
  - Custom하게 생성한 logger 사용법은 'QueryController1,QueryController2'를 참고하자.
  ex) LoggerFactory.getLogger("SQL_LOG");

  - additivity는 상위 Logger의 속성을 상속 여부를 정한다.
  -->
  <logger name="SQL_LOG1" level="INFO" additivity="false">
    <appender-ref ref="QUERY"/>
  </logger>

  <logger name="SQL_LOG2" level="INFO" additivity="false">
    <appender-ref ref="QUERY"/>
  </logger>

</included>
```
<br/>

 - `특정 로거 사용하기`
    - @Slf4j 어노테이션의 topic 속성으로 로거를 지정할 수 있다.
    - LoggerFactory.getLogger() 메서드로 로거를 지정할 수 있다.
```java
// QueryController1
// @Slf4j 어노테이션 topic 속성 사용
@Slf4j(topic = "SQL_LOG1")
@RestController
public class QueryController1 {

    @GetMapping("/query1")
    public String query() {

        log.trace("log --> TRACE");
        log.debug("log --> DEBUG");
        log.info("log --> INFO");
        log.warn("log --> WARN");
        log.error("log --> ERROR");

        if (true) {
            throw new RuntimeException();
        }

        return "Query";
    }
}

// QueryController2
// LoggerFactory.getLogger() 사용
@RestController
public class QueryController2 {

    public static final Logger log = LoggerFactory.getLogger("SQL_LOG2");

    @GetMapping("/query2")
    public String query() {

        log.trace("log --> TRACE");
        log.debug("log --> DEBUG");
        log.info("log --> INFO");
        log.warn("log --> WARN");
        log.error("log --> ERROR");

        if (true) {
            throw new RuntimeException();
        }

        return "Query";
    }
}
```

