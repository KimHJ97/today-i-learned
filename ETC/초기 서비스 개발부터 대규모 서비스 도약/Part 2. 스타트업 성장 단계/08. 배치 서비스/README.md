# 배치 서비스

배치 서비스(batch service)는 대량의 데이터를 처리하거나 정기적인 작업을 자동화하는 데 사용되는 컴퓨터 기반의 서비스 또는 프로세스를 의미합니다. 이러한 서비스는 대개 한 번에 여러 작업을 처리하고 결과를 생성하거나 저장합니다. 배치 서비스는 일반적으로 백그라운드에서 실행되며, 사용자 상호작용 없이 실행됩니다.  

배치 서비스는 다양한 산업과 업무 부문에서 사용되며, 데이터 처리, 업무 자동화, 보고서 생성, 데이터 분석, 데이터 전송 등 다양한 용도로 활용됩니다. 이는 효율성을 향상시키고 비용을 절감하며 일정한 프로세스의 자동화를 지원하는 데 중요한 역할을 합니다.  

```
1. 대량 데이터 처리
배치 서비스는 대량의 데이터를 처리하거나 변환하는 데 주로 사용됩니다.
예를 들어, 금융 기관은 매일 수백만 건의 금융 거래를 처리하고 분석하는 데 배치 서비스를 사용할 수 있습니다.

2. 정기적 작업
일정한 주기로 실행되는 작업을 자동화하기 위해 배치 서비스를 사용합니다.
이로써 작업 일정을 준수하고 반복적인 과정을 효율적으로 처리할 수 있습니다.

3. 백업과 복원
데이터베이스 백업 및 복원은 배치 서비스를 사용하여 수행되는 일반적인 작업 중 하나입니다.
주기적으로 데이터베이스 스냅샷을 생성하고, 장애 발생 시 스냅샷을 사용하여 데이터를 복원할 수 있습니다.

4. 리포트 및 분석 생성
배치 서비스는 주기적으로 리포트, 분석 결과 또는 대시보드 업데이트를 생성하는 데 사용됩니다.
이를 통해 비즈니스 의사 결정을 지원하는 데 도움을 줍니다.

5. 일괄 작업 처리
배치 서비스는 여러 작업을 한 번에 처리하고, 결과를 모아서 제공하는 데 사용됩니다.
예를 들어, 파일 처리, 데이터 가공, 이메일 전송 등 다양한 작업을 함께 실행할 수 있습니다.

6. 자동화 및 예약 작업
배치 서비스를 사용하면 작업을 예약하고 자동화할 수 있습니다.
이로써 인간 개입 없이 정기적인 작업을 처리할 수 있습니다.

7. 오류 처리
배치 서비스는 오류 처리 및 예외 관리를 포함하여 작업의 안정성을 향상시키는 데 사용됩니다.
```

<br/>

## 배치 서비스 개념

 - __배치 서비스 기본 3 단계__
    - Read: 많은 데이터를 데이터베이스, 파일, 메시지로부터 읽기
    - Processing: 읽은 데이터를 로직에 의해 처리
    - Write: 로직으로 처리된 데이터를 수정된 형태로 출력
 - __배치 사용 예시__
    - 주기적인 은행 업무 (24:00시 정산)
    - 쇼핑몰 알림
    - 세금 고지서 일괄 처리
    - 마트의 최저가 보상 처리
    - 성적 일괄 처리
 - __배치 사용 예시 (이커머스)__
    - 기획전 전시
    - 쿠폰 발행
    - 고객의 포인트 적립, 환불
    - 등록된 상품의 이미지 처리
    - 판매자 정산
    - 상품 진열
    - 상품 검색 인덱싱
    - 홈페이지 광고나 배너
 - __배치의 특징__
    - 대량의 데이터를 모아서 처리한다.
    - 정해진 스케줄에 맞춰 동작한다.

<br/>

## 배치 시스템 종류

 - __배치 프로그램 구성 요소__
    - 배치 처리 프로그램: 일련의 작업을 모아서 일괄 처리
    - 배치 스케줄러: 정해진 시간에 이벤트를 발생, 배치가 실행되도록 트리거 역할
 - __배치 처리를 위해 사용되는 도구__
    - Cron, Crontab
        - 스케줄에 따라 명렁어 또는 프로그램을 실행해주는 데몬 프로세스
        - Unix-Cron 문자열 형식
    - Quartz, Spring Scheduler
        - Java Scheduler 라이브러리 (해당 프로그램이 실행되면 종료되지 않고, JVM 데몬으로 떠있어서 스케줄링 기능을 담당한다.)
        - Job Scheduling, Job Execution, Job Persistence, Transactions 등을 제공
    - Jenkins
        - 빌드, 배포, 자동화로 사용되며, 스케줄 기능도 제공
    - 기타 트리거를 활용한 프로그램 (작업 스케줄러 등)
    - Spring Batch
        - Spring 기반 배치 처리 표준화 라이브러리
        - 액센추어 회사가 배치 처리 전문 지식을 오픈 소스로 개발하여 2008년 3월에 스프링 배치 1.0.0 출시
        - 자바 세계 최초 배치 처리에 대한 표준 기반 접근
            - Job, Step, Tasklet
            - ItemReader, ItemProcessor, ItemWriter

<br/>

## Spring Batch

Spring Batch는 자바 기반의 오픈 소스 배치 프레임워크로, 대량의 데이터 처리와 일괄 처리 작업을 위한 기능을 제공하는 Spring 프레임워크의 하위 프로젝트입니다.  
Spring Batch는 배치 처리 애플리케이션을 개발하고 실행하는 데 필요한 다양한 기능과 패턴을 제공하여 복잡한 배치 프로세스를 관리하고 유지보수하기 쉽게 만듭니다.  

Spring Batch는 다양한 산업 및 업무 부문에서 사용되며, 데이터 마이그레이션, 보고서 생성, 결제 처리, 고객 데이터 정제, 일일 배치 작업, ETL(Extract, Transform, Load) 프로세스 등 다양한 배치 처리 작업을 자동화하고 관리하는 데 유용합니다.  
Spring Batch를 사용하면 안정적이고 효율적인 배치 처리 애플리케이션을 구축할 수 있으며, Spring 프레임워크와의 통합으로 개발 생산성을 높일 수 있습니다.  

 - 트랜잭션 관리, 청크 단위 처리, 선언적 입출력 지원, 병렬 처리, 장애 처리 및 복구(시작, 중지, 재시작, 재시도, 건너뛰기) 지원

<br/>

### Spring Batch 특징

 - __스프링 배치 아키텍처__
   - 3개의 티어로 구성된 아키텍처
   - 애플리케이션: 코어와 상호 작용
   - 코어: 잡, 스텝, 잡 런처, 잡 파라미터 등의 배치 도메인 요소
   - 인프라스트럭처: 배치 처리를 위해 필요한 공통 인프라 제공

<br/>

 - __스프링 배치 관련 용어__
   - Job
      - JobInstance
      - JobExecution
      - JobParameter
      - JobListener
   - Step
      - Tasklet 기반
      - Chunk 기반
         - ItemReader: 읽기
         - ItemProcessor: 가공
         - ItemWriter: 쓰기
```
Job
Job은 배치작업 전체의 중심 개념으로 배치작업 자체를 의미한다.
Job은 실제 프로세스가 진행되는 Step들을 최상단에서 포함하고 있으며, Job의 실행은 배치작업 전체의 실행을 의미한다.
 - 특정 Job은 각각의 JobParameters에 따라 JobInstance를 생성하며, 한번의 Job 시도마다 JobExecution을 생성한다.
 - Job은 반드시 한개 이상의 Step으로 구성된다.

JobInstance
JobInstance는 논리적 Job 실행의 개념으로 JobInstance = Job + JobParameters로 표현할 수 있다.
JobInstance는 동일한 Job이 각기 다른 JobParameter를 통해 실행 된 Job의 실행 단위이다.
 - Job과 JobParameters가 같으면 동일한 JobInstance이다. (Job 이름과 Job 파라미터로 구분된다.)
 - Job의 논리적 실행 단위
 - Job이 성공적으로 완료되면 다시 실행시킬 수 없다. (동일한 이름의 동일한 파라미터의 Job을 재실행할 수 없다.)

JobParameters
JobParameters는 하나의 Job에 존재할 수 있는 여러개의 JobInstance를 구별하기 위한 Parameter 집합이며, Job을 시작하는데 사용하는 Parameter 집합이다.
Job이 실행되는 동안에 Job을 식별하거나 Job에서 참조하는 데이터로 사용된다.
 - Job에 전달되는 파라미터

JobExecution
JobExecution은 한번의 Job 시도를 의미하는 기술적인 개념이다.
JobExecution은 주로 Job이 실행 중에 어떤 일이 일어났는지에 대한 속성들을 저장하는 저장 메커니즘 역할을 한다.
 - Job을 실행한 것을 의미하며, 실패든 성공이든 시도한 것을 나타낸다.

JobListener
Job(작업)의 실행 중에 발생하는 이벤트를 수신하고 처리하는 역할을 하는 리스너 인터페이스이다.
Job 실행 전 이벤트 로그 기록과 초기화 작업을 수행할 수 있고, Job 실행 후 실행 결과를 검토하거나 정리 작업을 수행할 수 있다.

Step
Step은 Job 내부에 구성되어 실제 배치작업 수행을 위해 작업을 정의하고 제어한다.
즉, Step에서는 입력 자원을 설정하고 어떤 방법으로 어떤 과정을 통해 처리할지 그리고 어떻게 출력 자원을 만들 것인지에 대한 모든 설정을 포함한다.
 - Tasklet 기반: 간단한 실행 처리
 - Chunk 기반: 아이템 기반 처리(ItemReader, ItemProcessor, ItemWriter)

StepExecution
Job의 JobExecution과 대응되는 단위로 Step 또한 StepExecution을 갖고 있다.
JobExecution과 마찬가지로 StepExecution은 Step을 수행하기 위한 단 한번의 Step 시도를 의미하며 매번 시도될 떄마다 생성된다.
StepExecution은 주로 Step이 실행 중에 어떤 일이 일어났는지에 대한 속성들을 저장하는 저장 메커니즘 역할을 하며 commit count, rollback count, start time, end time 등의 Step 상태정보를 저장한다.
```

<div align="ceneter">
   <img src="./images/spring-batch-reference-model.png"/>
</div>


<br/>

 - __Chunk 기반 처리(Chunk-Oriented Processing)__
   - Chunk 기반 처리는 스프링 배치에서 가장 일반적으로 사용하는 Step 유형이다.
   - Chunk 기반 처리는 data를 한번에 하나씩 읽고, 트랜잭션 범위 내에서 'Chunk'를 만든 후 한번에 쓰는 방식이다.
   - 즉, 하나의 item이 ItemReader를 통해 읽히고, Chunk 단위로 묶인 item들이 한번에 ItemWriter로 전달 되어 쓰이게 된다.
      - Chunk 단위로 Item 읽기 → 처리/변환 → 쓰기의 단계
```Java
// 코드로 보는 Chunk 기반 처리
// 구성요소: ItemReader, ItemWriter, PlatformTransactionManager, JobRepository, (ItemProcessor는 옵션)
// 중요속성: commit-interval(하나의 트랜잭션당 처리 개수), startLimit(step의 실행 제한 횟수)
List items = new Arraylist();
for(int i = 0; i < commitInterval; i++){
    Object item = itemReader.read()
 
    Object processedItem = itemProcessor.process(item);
 
    items.add(processedItem);
}
 
itemWriter.write(items);
```

<div align="ceneter">
   <img src="./images/chunk-oriendted_step.png"/>
</div>

<br/>

 - __TaskletStep__
   - 배치작업을 적용한 업무 환경에 따라 ItemReader와 ItemWriter를 활용한 구조가 맞지 않는 경우도 있을 것이다.
   - 예를들어 단순히 DB의 프로시저 호출만으로 끝나는 배치처리가 있다면 단순히 메소드 하나로 기능을 구현하고 싶어질 것이다. 이런 경우를 위해 스프링 배치에서는 TaskletStep을 제공한다.
   - Tasklet은 RepeatStatus.FINISHED를 반환하거나 에러가 발생하기 전까지 계속 실행하는 execute() 하나의 메소드를 갖는 간단한 인터페이스로 저장 프로시저, 스크립트, 또는 간단한 SQL 업데이트 문을 호출 할 수 있다.
   - 즉, Tasklet은 Step 내에서 단순한 작업을 정의하는 방법으로 Item Reader, Processor, Writer를 사용하지 않고 사용자 정의 로직을 실행하고자 할 때 유용하다.

<br/>

## Spring Batch 실전 Tip

 - API 서버를 배치 용도로 사용하지 않는다. (배치 작업을 API 서버에서 요청해서 활용하지 않는다.)
 - 스프링 배치도 분산이 필요하다. 즉, 도메인별 배치 시스템을 분리한다.
 - 배치 실행 단위는 단계별로 한다. (1개, 10개, 100개)
   - 배치 처리를 실행하면 중간에 제어하기가 어렵다. 떄문에, 대용량 벌크 작업을 하기 전에 카나리 전략으로 1개, 10개를 실행하여 안전성을 확인한 뒤에 대량의 배치 작업을 수행한다.

<br/>

## 참고

 - Spring 공식 문서: https://docs.spring.io/spring-batch/docs/current/reference/html/index-single.html
 - Egovframework: https://www.egovframe.go.kr/wiki/doku.php?id=egovframework:rte4.1

