# 서비스 성능 관리하기(Pinpoint)

## APM

APM은 "Application Performance Monitoring" 또는 "Application Performance Management"의 약자로, 애플리케이션의 성능과 작동 상태를 지속적으로 모니터링하고 분석하는 소프트웨어 도구 및 서비스를 가리키는 용어입니다. APM은 개발자와 IT 운영 팀에게 애플리케이션의 성능 문제를 식별하고 해결하는 데 도움을 주며, 사용자 경험을 향상시키고 비용을 절감하는 데 기여합니다.  

APM은 모든 종류의 애플리케이션 환경에 적용될 수 있으며, 클라우드 환경, 마이크로서비스, 서버리스 애플리케이션 등과 함께 사용됩니다. APM은 애플리케이션의 성능 문제를 조기에 감지하고 식별하여 고객 경험을 향상시키며, 시스템 가용성을 높이고 IT 작업 효율성을 향상시키는 데 중요한 역할을 합니다.  
 - 성능 모니터링: 애플리케이션의 성능 지표를 실시간으로 수집하고 모니터링합니다. 이러한 지표에는 응답 시간, 지연, CPU 및 메모리 사용률, 네트워크 트래픽 등이 포함됩니다.
 - 트랜잭션 추적: 애플리케이션 내의 각 트랜잭션과 요청을 추적하고 시간을 기준으로 어떻게 처리되는지 확인합니다. 이를 통해 병목 현상을 식별하고 개선할 수 있습니다.
 - 오류 및 이상 감지: 애플리케이션에서 발생하는 오류와 이상을 감지하고 기록합니다. 개발자는 이 정보를 통해 버그를 찾고 수정할 수 있습니다.
 - 서비스 의존성 맵: 애플리케이션의 다른 서비스 및 구성 요소 간의 의존성을 시각화하고 모니터링합니다. 이를 통해 복잡한 마이크로서비스 아키텍처에서 문제를 해결하는 데 도움이 됩니다.
 - 성능 통계 및 보고서: 성능 데이터를 수집하고 요약하여 보고서를 생성합니다. 이 보고서를 통해 애플리케이션의 성능 향상을 모니터링하고 추적할 수 있습니다.
 - 알림 및 경고: 정의된 임계값을 초과하는 경우 알림을 생성하여 문제를 신속하게 대응할 수 있도록 도와줍니다.
 - APM 도구들: Pinpoint, Datadog, New Relic, Google Cloud Console, Grafana, Splunk 등

<br/>

## Pinpoint

Pinpoint는 애플리케이션의 성능을 모니터링하고 분석하여 사용자 경험을 최적화하고 애플리케이션의 안정성을 유지하는 데 도움을 주는 강력한 도구입니다.  
 - 2015년 1월 9일에 네이버에서 오픈 소스로 공개
 - 분산 시스템의 성능 분석 및 문제 진단 및 해결에 사용하는 APM
 - 연결된 분산 시스템들의 트랜잭션 추적과 분석

<br/>

### Pinpoint의 특징

 - 연결된 분산 시스템을 맵 형태의 시각적 정보 제공
 - 실시간으로 애플리케이션 및 서비스 모니터링
 - 각각의 트랜잭션을 코드 레벨 콜 스택 분석 기능 제공
 - 애플리케이션 서버의 코드 변경 없는 APM Agents 제공
 - 애플리케이션 서버의 성능에 최소한의 영향도 (리소스의 약 3% 사용)

<br/>

### Pinpoint의 기능

 - Server Map
    - 분산 시스템의 연결된 상황과 트랜잭션을 시각화
    - 각요청의 현재 성공, 실패 지표 제공
    - 각 요청에 대한 요청 수 제공
    - 각 요청의 응답 시간 제공
    - 각 요청과 응답 평균 지표 제공
 - Realtime Active Thread Chart
    - 전체 쓰레드 정보 제공
    - 활성 쓰레드를 실시간 모니터링 제공
 - Request/Response Scatter Chart
    - 요청과 응답에 대한 Scatter Chart 제공
    - 요청 Scatter를 드래그, 상세 정보 확인
 - CallStack
    - 모든 트랜잭션에 대한 코드 수준의 가시성 정보 제공
    - 코드 수준의 병목 현상과 장애 지점을 식별
 - Inspector
    - 애플리케이션의 상세 정보 제공
        - CPU 사용률
        - Memory/Garbage Collection
        - TPS
        - JVM arguments

<br/>

### Pinpoint 아키텍처

 - Pinpoint Agent
    - 애플리케이션의 성능 관련 지표 수집 및 전달
 - Pinpoint Collector
    - Agent에서 받은 정보를 HBase에 적재
 - Pinpoint Web UI
    - 수집된 정보 제공(성능, 모니터링, 지표)

<br/>

## Pinpoint 설치

 - 공식 문서: https://pinpoint-apm.gitbook.io/pinpoint/
 - Docker 가이드: https://github.com/pinpoint-apm/pinpoint-docker

<br/>

### Docker로 최신 버전 설치하기

 - 최신 버전 설치
```Bash
$ git clone https://github.com/pinpoint-apm/pinpoint-docker.git
$ cd pinpoint-docker
$ docker-compose pull && docker-compose up -d
```

 - 이전 버전 설치
```Bash
$ git clone https://github.com/pinpoint-apm/pinpoint-docker.git
$ cd pinpoint-docker
$ git checkout {tag}
$ docker-compose -f docker-compose.yml -f docker-compose-metric.yml build
```

<br/>

### Pinpoint 사용

 - Web/API에 Pinpoint Agent 추가
    - https://pinpoint-apm.github.io/pinpoint/installation.html#5-pinpoint-agent
    - 1. Agent 파일 내려받기
        - 공식 사이트를 통해 Pinpoint Agent를 다운받는다.
    - 2. Java APP 실행시 Pinpoint Agent 붙이기 (명령줄, IDE 등 활용)
        - pinpoint.agentId: Pinpoint Agent가 실행 중인 앱의 식별자
        - pinpoint.applicationName: 실행 중인 앱의 그룹(단일 서비스)
```
◆ Agent Donwload
https://github.com/pinpoint-apm/pinpoint/releases/download/v2.5.0/pinpoint-agent-2.5.0.tar.gz 

◆ JVM Argument Info
-javaagent:${pinpointPath}/pinpoint-bootstrap-2.5.0.jar
-Dpinpoint.applicationName=
-Dpinpoint.agentId=

◆ 명령줄 실행 예시
java -jar -javaagent:${pinpointPath}/pinpoint-bootstrap.jar -Dpinpoint.agentId=hello-api -Dpinpoint.applicationName=hello-api hello-api-0.0.1-SNAPSHOT.jar
```

<br/>

## 서비스에 Pinpoint 적용하기

 - __준비사항__
    - Pinpoint 서버
    - 샘플 API 프로젝트

<br/>

 - __적용 시나리오__
    - Pinpoint Agent를 설치한다.
    - 샘플 API 프로젝트에 설치한 Agent를 최상위 디렉토리에 위치시킨다.
    - 실행 스크립트의 VM Options에 Pinpoint Agent 옵션을 추가한다.

<br/>

 - __샘플 API 프로젝트 폴더 구조__
    - 실행 옵션: -javaagent:./pinpoint-agent-2.5.0/pinpoint-bootstrap-2.5.0.jar -Dpinpoint.applicationName=hello-sample-api -Dpinpoint.agentId=hello-sample-api
```
hello-sample-api
 ├ .github: Git 관련 설정 폴더
 ├ .gradle: Gradle 관련 설정 폴더
 ├ .idea: Idea 관련 설정 폴더
 ├ build: 빌드 결과물 폴더
 ├ client: IntelliJ HTTP Client 기능용 폴더
 ├ gradle: 프로젝트 Gradle 명령 실행 폴더
 ├ pinpoint-agent-2.5.0: Pinpoint Agent 폴더
 ├ src: 소스 코드 폴더
 ├ .gitignore: 깃 이그노어 파일
 ├ build.gradle: 그래들 설정 파일
 ├ ..
```
