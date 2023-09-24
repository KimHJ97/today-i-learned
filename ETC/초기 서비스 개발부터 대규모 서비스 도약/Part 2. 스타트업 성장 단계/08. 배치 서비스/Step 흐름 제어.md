# Step 흐름 제어

Job 내부에는 여러 Step 들이 존재할 수 있고, 각 Step 사이의 흐름을 관리할 필요가 있다.  
Step 내의 next 설정과 Desision 설정으로 Job을 수행하다 한 Step의 처리결과에 따라 다른 Step을 선택하여 수행할 수 있고, 특정 Step의 실패가 Job 전체의 실패로 이어지지 않도록 구성할 수 있다.  

<br/>

## Step 흐름 처리(Controlling Step Flow)

Step은 각 스텝과의 순서를 지정할 수 있다.  
 - stepA 실행 > 성공 > stepB 실행 > 성공 > stepC 실행
 - 만약, 'stepA'의 실행이 실패하게 되면 전체 Job의 실행은 실패하게 되며 'stepC'는 실행되지 않는다.
```Java
@Bean
public Job job(JobRepository jobRepository) {
    return new JobBuilder("job", jobRepository)
            .start(stepA())
            .next(stepB())
            .next(stepC())
            .build();
}
```

<div align="center">
    <img src="./images/sequential-flow.png">
</div>

<br/>

### Step Conditional Flow

Step은 종료(ExitStatus)를 패턴 매칭하여 다른 스텝으로 분기가 가능하다.  
 - '*' : 0 또는 그 이상의 문자.
 - '?' : 하나의 문자.
```Java
@Bean
public Job job(JobRepository jobRepository) {
	return new JobBuilder("job", jobRepository)
				.start(stepA())
				.on("*").to(stepB())
				.from(stepA()).on("FAILED").to(stepC())
				.end()
				.build();
}
```

<div align="center">
    <img src="./images/conditional-flow.png">
</div>
