# 운영 이슈 테스트

## Chaos Monkey 소개

Chaos Monkey는 Netflix에서 개발한 개발 도구 중 하나로 시스템 내구성과 복원력을 테스트하기 위해 사용되는 개념입니다. Netflix는 웹 기반 스트리밍 서비스를 운영하면서 많은 부하와 사용자 요청을 처리해야 하는데, 이에 따라 운영 환경에서의 시스템 내구성과 복원력이 중요한 문제가 되었습니다.  
Chaos Monkey는 시스템 내의 서버 인스턴스들을 무작위로 종료시키거나 다양한 네트워크 문제를 시뮬레이션하여 시스템의 강건성과 복구 능력을 테스트합니다. 이를 통해 시스템이 예기치 않은 장애 상황에서도 계속 작동할 수 있는 능력을 확보하고, 장애 상황에서 빠른 복구가 가능하도록 시스템을 설계하고 개선할 수 있습니다.
 - 프로덕션 환경, 특히 분산 시스템 환경에서 불확실성을 파악하고 해결 방안을 모색하는데 사용하는 툴
 - 네트워크 지연, 서버 장애, 디스크 오작동, 메모리 누수 등
 - 공격 대상(Watcher): @RestController, @Controller, @Service, @Repository, @Component
 - 공격 유형(Assaults): 응답 지연(Latency Assault), 예외 발생(Exception Assault), 애플리케이션 종료(AppKiller Assault), 메모리 누수(Memory Assault)

<br/>

## CM4SB 설치

 - pom.xml 의존성 추가
    - chaos-monkey-spring-boot
        - 스프링 부트용 카오스 멍키
    - spring-boot-starter-actuator
        - 스프링 부트 운영 툴로 런타임 중에 카오스 멍키 설정을 변경할 수 있다.
        - 그 밖에도 헬스 체크, 로그 레벨 변경, 매트릭스 데이터 조회 등 다양한 운영 툴로 사용이 가능하다.
```XML
<dependency>
    <groupId>de.codecentric</groupId>
    <artifactId>chaos-monkey-spring-boot</artifactId>
    <version>2.1.1</version>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

 - application.properties
    - 카오스 멍키를 사용하기 위해서는 'chaos-monkey'라는 프로필로 실행하여야 한다.
```properties
# 카오스 멍키 활성화
spring.profiles.active=chaos-monkey

# 스프링 부트 Actuator 엔드 포인트 활성화
management.endpoint.chaosmonkey.enabled=true
management.endpoints.web.exposure.include=health,info,chaosmonkey
```

<br/>

## CM4SB 응답 지연

스프링 부트의 특정 어노테이션이 명시된 클래스에 모든 메서드들에 대해서 응답 지연을 설정할 수 있다.  
또한, 특정 클래스의 특정 메서드에만 지연되도록 설정할 수도 있다.  
 - 공식 문서: https://codecentric.github.io/chaos-monkey-spring-boot/latest/
 - 응답 지연 이슈 재현 방법
```
1. Repository Watcher 활성화
chaos.monkey.watcher.repository=true

2. 카오스 멍키 활성화
http post localhost:8080/actuator/chaosmonkey/enable

3. 카오스 멍키 활성화 확인
http localhost:8080/actuator/chaosmonkey/status

4. 카오스 멍키 와처 확인
http localhost:8080/actuator/chaosmonkey/watchers

5. 카오스 멍키 지연 공격 설정
http POST localhost:8080/actuator/chaosmonkey/assaults level=3 latencyRangeStart=2000 latencyRangeEnd=5000 latencyActive=true

6. 카오스 멍키 공격 설정 확인
http localhost:8080/actuator/chaosmonkey/assaults

7. 테스트
JMeter 확인
```

<br/>

## CM4SB 에러 발생

특정 클래스의 특정 메서드에 대해서 응답 지연되도록 설정할 수 있다.  
그 외에도 특정 메서드에 대해서 에러 발생하도록 설정할 수도 있다.  
 - 공식 문서: https://codecentric.github.io/chaos-monkey-spring-boot/latest/#_exception_assault
 - 에러 발생 재현 방법
```
1. Repository Watcher 활성화
chaos.monkey.watcher.repository=true

2. 카오스 멍키 활성화
http post localhost:8080/actuator/chaosmonkey/enable

3. 카오스 멍키 에러 발생 설정
http POST localhost:8080/actuator/chaosmonkey/assaults level=3 latencyActive=false exceptionsActive=true exception.type=java.lang.RuntimeException
```