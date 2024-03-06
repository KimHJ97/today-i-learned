# 스프링 Batch 병렬화 방식

 - https://velog.io/@byeongju/Spring-Batch-%EB%B3%91%EB%A0%AC%ED%99%94
 - https://hyunwook.dev/87
 - https://devfunny.tistory.com/831

<br/>

## 스프링 배치 쓰레드 모델

스프링 배치는 기본적으로 단일 쓰레드 방식으로 작업을 처리한다.  
성능 향상과 대규모 데이터 작업을 위한 비동기 처리 및 Scale Out 기능을 제공한다.  

 - __AsyncItemProcessor / AsyncItemWriter__
    - ItemProcessor에게 별도의 쓰레드가 할당되어 작업을 처리하는 방식
 - __Multi-threaded Step__
    - Step 내 Chunk 구조인 ItemReader, ItemProcessor, ItemWriter 마다 여러 쓰레드가 할당되어 실행하는 방법
 - __Remote Chunking__
    - 분산 환경처럼 Step 처리가 여러 프로세스로 분할되어 외부의 다른 서버로 전송되어 처리하는 방식
 - __Parallel Steps__
    - Step마다 쓰레드가 할당되어 여러 개의 Step을 병렬로 실행하는 방법
 - __Partitioning__
    - Master/Slave 방식으로 Master가 데이터를 파티셔닝 한 다음 각 파티션에게 쓰레드를 할당하여 Slave가 독립적으로 작동하는 방식

<br/>

## 1. Multi-threaded Step(다중 쓰레드 스텝)

하나의 Chunk를 하나의 쓰레드가 담당하는 방식이다.  
만약, Chunk Size에 따라 3개의 Chunk가 존재한다면, 3개의 Batch 작업이 병렬로 이루어진다.  

```java
@Bean
public TaskExecutor taskExecutor(){
    return new SimpleAsyncTaskExecutor("spring_batch");
}

@Bean
public Step sampleStep(TaskExecutor taskExecutor) {
	return this.stepBuilderFactory.get("sampleStep")
				.<String, String>chunk(10)
				.reader(itemReader())
				.writer(itemWriter())
				.taskExecutor(taskExecutor)
				.throttleLimit(20)
				.build();
}
```

<br/>

### Multi-threaded Step 주의점

- TaskExecutor의 스레드 개수만 늘린다고 되는 것이 아니라, throttleLimit 값도 함께 증가시켜줘야합니다. 기본 값은 4입니다.
- __throttleLimit 값은 DB Connection Pool Size를 넘지 않아야 합니다.__ 예를 들어, 20개의 Chunk를 20개의 스레드가 병렬로 실행하는 상황에서 Pool Size가 10이라면 병목이 발생합니다.
- Thread Safe한 ItemReader와 ItemWriter를 사용해야 합니다. 사용하려는 ItemReader가 Thread-safe하지 않다면 SynchronizedItemStreamReader로 감싸거나 직접 동기화를 제어하는 객체를 만들고 내부에서 해당 Reader를 사용하면 됩니다.

<br/>

### Multi-threaded Step 단점

Multi-Threaded Step을 사용하면, 실패 지점부터의 재시도를 사용할 수 없다.  

만약, 10개의 쓰레드가 1000개의 데이터를 100개의 Chunk로 나누어 병렬로 동작한다고 가정한다. 5번째 쓰레드가 실패했을 경우에 1~4번의 쓰레드가 성공했다는 보장이 없다. 순차적으로 동작하는 것이 아니다.  

때문에, 실패의 확률이 큰 Job에서는 사용하지 않는 것이 좋다. 하나라도 실패하여 재시도를 하는 경우 처음부터 다시 Job을 실행해야하는 상황이 발생할 수 있다.  

<br/>

## 2. Parallel Steps(병렬 스텝)

Multi-Threaded Step이 하나의 step을 병렬로 처리했다면, Parallel Step은 여러 Step을 병렬로 처리합니다. 더 정확하게 이야기하자면 여러 Step을 가질 수 있는 Flow를 병렬로 처리합니다.  

병렬적으로 수행되어도 되는 Step이 있다면 Parallel Steps를 통해 성능을 올릴 수 있다.  

```java
@Bean
public Job job() {
    // 두 개의 서브 플로우와 단일 스텝으로 이루어져 있다.
    return jobBuilderFactory.get("job")
        .start(splitFlow()) // Flow로 정의된 flow1()과 flow2()가 병렬로 수행하고,
        .next(step4()) // 이후에 step4()가 수행된다.
        .build()        //builds FlowJobBuilder instance
        .build();       //builds Job instance
}

@Bean
public Flow splitFlow() {
    // FlowBuilder를 사용하여 "splitFlow"라는 작업 흐름을 만든다.
    // flow1()과 flow2()가 병렬로 실행한다.
    return new FlowBuilder<SimpleFlow>("splitFlow")
        .split(taskExecutor())
        .add(flow1(), flow2())
        .build();
}

@Bean
public Flow flow1() {
    // flow1()은 step1()과 step2()를 수행한다.
    return new FlowBuilder<SimpleFlow>("flow1")
        .start(step1())
        .next(step2())
        .build();
}

@Bean
public Flow flow2() {
    // flow2()는 step3()를 수행한다.
    return new FlowBuilder<SimpleFlow>("flow2")
        .start(step3())
        .build();
}

@Bean
public TaskExecutor taskExecutor(){
    return new SimpleAsyncTaskExecutor("spring_batch");
}
```

<br/>

## 3. AsyncItemProcessor & AsyncItemWriter

기본적으로 AsyncItemProcessor와 AsyncItemWriter는 함께 사용되어야 합니다.  

AsyncItemProcessor & AsyncItemWriter을 사용하기 위해서는 spring-batch-integration 의존성을 주입 해야합니다.  

Multi-Threaded Step와 달리 ItemProcessor만 병렬로 동작합니다. 따라서, ItemReader가 병렬이 아니기 때문에, Job이 실패하고 재실행 했을 때, 실패 지점부터 재시작 가능합니다.  

 - AsyncItemProcessor
    - AsyncItemProcessor는 ItemProcessor를 래핑하는 데코레이터입니다. 실질적인 Process 작업은 새로운 스레드가 ItemProcessor를 실행하고 AsyncItemProcessor 디스패처의 책임을 지닙니다. 그리고 AsyncItemProcessor는 Future 타입을 반환합니다.
 - AsyncItemWriter
    - AsyncItemWriter도 ItemWriter의 데코레이터입니다. AsyncItemProcessor에서 전달된 Future 결과 값을 ItemProcessor에게 위임합니다.

```java
@Bean
public AsyncItemProcessor processor(ItemProcessor itemProcessor, TaskExecutor taskExecutor) {
    AsyncItemProcessor asyncItemProcessor = new AsyncItemProcessor();
    asyncItemProcessor.setTaskExecutor(taskExecutor); // 스레드풀 지정
    asyncItemProcessor.setDelegate(itemProcessor);
    return asyncItemProcessor;
}

@Bean
public AsyncItemWriter writer(ItemWriter itemWriter) {
    AsyncItemWriter asyncItemWriter = new AsyncItemWriter();
    asyncItemWriter.setDelegate(itemWriter);
    return asyncItemWriter;
}
```

