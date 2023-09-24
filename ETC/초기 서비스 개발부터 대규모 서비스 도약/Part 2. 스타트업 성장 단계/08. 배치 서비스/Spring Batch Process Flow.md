# 스프링 배치 처리 흐름

## Spring Batch Job 처리 흐름

Job을 실행하기 위해 Client에서 JobLauncher를 동작시킨다.  
JobLauncher는 Job의 이름을 통해 Job을 실행시킨다.  
Job이 실행되면, JobInstance가 생성이 되고, JobInstance는 내부적으로 Step과 함께 비즈니스 로직(배치 업무)을 처리하게 된다.  
Job이 종료되면, 최종적으로 성공(FINISHED) 또는 실패(FAILED) 결과를 갖게 된다.

```Java
@Bean
public JobLauncher jobLauncher() throws Exception {
	TaskExecutorJobLauncher jobLauncher = new TaskExecutorJobLauncher();
	jobLauncher.setJobRepository(jobRepository);
	jobLauncher.afterPropertiesSet();
	return jobLauncher;
}
```

<div align="center">
    <img src="./images/job-launcher-sequence-sync.png">
</div>

<br/>

## Spring Batch Step 처리 흐름

__Chunk 기반__

Step이 실행이 되면, 입력 소스로부터 Item 하나를 읽는다. (read)  
이후, ChunkSize 만큼 반복하고 한 번에 쓰기를 실행한다. (write)  
 - ItemProcessor는 생략이 가능하다.
 - 만약, ItemProcessor가 없다면 특정 ChunkSize만큼 Item을 읽은 후에 ItemWriter에 전달이 된다.

```Java
List items = new Arraylist();
for(int i = 0; i < commitInterval; i++){
    Object item = itemReader.read();
    if (item != null) {
        items.add(item);
    }
}
itemWriter.write(items);
```

<div align="center">
    <img src="./images/chunk-oriented-processing.png">
</div>


<br/>

__Chunk 기반(Processor)__

Step이 실행이 되면, 입력 소스로부터 Item 하나를 읽는다. (read)  
이후 Item을 Processor로 전달하여 하나씩 가공한다. (process)  
이후, ChunkSize 만큼 반복하고 한 번에 쓰기를 실행한다. (write)  

```Java
List items = new Arraylist();
for(int i = 0; i < commitInterval; i++){
    Object item = itemReader.read();
    if (item != null) {
        items.add(item);
    }
}

List processedItems = new Arraylist();
for(Object item: items){
    Object processedItem = itemProcessor.process(item);
    if (processedItem != null) {
        processedItems.add(processedItem);
    }
}

itemWriter.write(processedItems);
```

<div align="center">
    <img src="./images/chunk-oriendted_step.png">
</div>
