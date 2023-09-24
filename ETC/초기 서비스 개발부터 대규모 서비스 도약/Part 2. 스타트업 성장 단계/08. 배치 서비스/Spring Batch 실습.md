# Spring Batch 실습

## Spring Batch Meta Tables 만들기

Spring Batch는 배치 작업의 실행 상태와 이력을 추적하고 관리하기 위해 메타 데이터를 저장하는 데 사용되는 메타 테이블을 제공합니다. 이러한 메타 테이블은 Spring Batch의 핵심 구성 요소 중 하나로, 배치 작업의 관리와 복구를 지원합니다.  

메타 데이터 테이블은 Spring Batch가 배치 작업을 추적하고 관리하는 데 필요한 정보를 저장하는 데 사용됩니다. 예를 들어, 배치 작업이 실패하면 이력을 통해 실패 원인을 파악하고 재시작할 수 있으며, 실행 시간과 처리 통계 정보를 추출하여 성능을 모니터링할 수 있습니다. 또한 Job 파라미터와 컨텍스트 정보를 저장하여 Job과 Step 실행에 필요한 데이터를 유지합니다.  
 - https://docs.spring.io/spring-batch/docs/3.0.x/reference/html/metaDataSchema.html
 - BATCH_JOB_INSTANCE: 이 테이블은 Job의 인스턴스를 나타냅니다. 각 Job은 고유한 인스턴스를 가질 수 있으며, 같은 Job을 여러 번 실행해도 각 실행은 별도의 인스턴스로 기록됩니다. Job의 이름과 Job 파라미터를 기반으로 생성됩니다.
 - BATCH_JOB_EXECUTION: 이 테이블은 Job 실행의 기본 정보를 저장합니다. 각 Job 실행은 새로운 레코드로 기록되며, 실행 시간, 상태, Job 파라미터 등의 정보를 포함합니다.
 - BATCH_JOB_EXECUTION_PARAMS: 이 테이블은 Job 실행에 전달된 파라미터를 저장합니다. Job 파라미터는 Job 실행 중에 사용되는 매개 변수로, 이 테이블에 저장됩니다.
 - BATCH_STEP_EXECUTION: 이 테이블은 각 Step의 실행 정보를 저장합니다. Step 실행은 Step 이름과 관련된 Job 실행과 연결됩니다. 실행 상태, 시작 시간, 종료 시간, 커밋 카운트, 읽기/쓰기/처리 카운트 등의 정보를 포함합니다.
 - BATCH_STEP_EXECUTION_CONTEXT: 이 테이블은 Step 실행과 관련된 컨텍스트 데이터를 저장합니다. Step 실행 중에 생성된 컨텍스트 정보를 저장하고 검색하는 데 사용됩니다.
 - BATCH_JOB_EXECUTION_CONTEXT: 이 테이블은 Job 실행과 관련된 컨텍스트 데이터를 저장합니다. Job 실행 중에 생성된 컨텍스트 정보를 저장하고 검색하는 데 사용됩니다.
 - BATCH_JOB_SEQ: Job 실행 및 Job 파라미터와 관련된 시퀀스 번호를 저장하는 테이블입니다.

<br/>

## 프로젝트 만들기

 - __build.gradle__
    - Spring Batch 관련 의존성을 추가한다.
```gradle
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-batch'
	implementation 'org.springframework.boot:spring-boot-starter-jdbc'
	compileOnly 'org.projectlombok:lombok'
	runtimeOnly 'com.h2database:h2'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	testImplementation 'org.springframework.batch:spring-batch-test'
}
```

<br/>

 - __Batch 설정 추가__
    - @EnableBatchProcessing 어노테이션을 정의하여 Spring Batch를 활성화한다.
    - __주의점: Spring Boot 실행시 특정 Job을 지정하지 않으면, 전체 Job이 실행이 된다.__
    - __특정 Job 실행: '--spring.batch.job.names=[잡이름]'__
```Java
@EnableBatchProcessing
@SpringBootApplication
public class HelloSpringBatchApplication {
	public static void main(String[] args) {
        SpringApplication.run(HelloSpringBatchApplication.class, args);
	}
}

// 만약, Job이 종료되면 프로그램을 중단하게 하려면 아래 처럼 설정한다.
@EnableBatchProcessing
@SpringBootApplication
public class HelloSpringBatchApplication {
	public static void main(String[] args) {
		System.exit(
				SpringApplication.exit(
						SpringApplication.run(HelloSpringBatchApplication.class, args)
				)
		);
	}
}
```

<br/>

 - __Batch 정의__
    - JobBuilderFactory: Job을 만들기 위한 Factory 클래스
    - StepBuilderFactory: Step을 만들기 위한 Factory 클래스
```Java
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class HelloBatchJobConfiguration {
    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private static final String JOB_NAME = "helloJob";
    private static final String STEP_1_NAME = "helloStep";
    private static final String MESSAGE = "Hello, Spring Batch!!!";

    // Job 정의
    @Bean
    public Job helloJob() {
        return this.jobBuilderFactory.get(JOB_NAME).start(helloStep()).build();
    }

    // Step 정의
    @Bean
    public Step helloStep() {
        return this.stepBuilderFactory.get(STEP_1_NAME).tasklet((contribution, chunkContext) -> {
            log.info("This is HelloStep, {}", MESSAGE);
            return RepeatStatus.FINISHED;
        }).build();
    }
}
```

```Java
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class HiBatchJobConfiguration {
    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private static final String JOB_NAME = "hiJob";
    private static final String STEP_1_NAME = "hiStep";
    private static final String MESSAGE = "Hi, Spring Batch !!!";

    @Bean
    public Job hiJob() {
        return this.jobBuilderFactory.get(JOB_NAME).start(hiStep()).build();
    }

    @Bean
    public Step hiStep() {
        return this.stepBuilderFactory.get(STEP_1_NAME).tasklet((contribution, chunkContext) -> {
            log.info("This is HiStep, {}", MESSAGE);
            return RepeatStatus.FINISHED;
        }).build();
    }
}
```

<br/>

## Spring Batch - File 처리

콤마로 구분된 CSV 파일에서 데이터를 읽고, 가공하여 CSV 파일에 쓰는 작업을 한다.  

 - __sample-product.csv__
```
1,짜파게티,5000
2,진라면,2000
3,신라면,2500
4,진짬뽕,3000
5,너구리,1500
```

<br/>

 - __Product__
```Java
@Data
public class Product {
    private Long id;
    private String name;
    private BigDecimal price;
}
```

<br/>

 - __ProductFieldSetMapper__
```Java
/**
 * 파일의 라인을 Product의 어떤 필드와 매핑하는지 전략
 */
public class ProductFieldSetMapper implements FieldSetMapper<Product> {
    @Override
    public Product mapFieldSet(FieldSet fieldSet) throws BindException {
        Product product = new Product();
        product.setId(fieldSet.readLong(0));
        product.setName(fieldSet.readString(1));
        product.setPrice(fieldSet.readBigDecimal(2));
        return product;
    }
}
```

<br/>

 - __FileBatchJobConfiguration__
    - Reader, Processor, Writer를 정의하고, Step에 등록한다.
    - Job: 'incrementer(new RunIdIncrementer())'로 Job의 파라미터를 자동 증가시켜 고유한 Job 인스턴스를 생성하여 동일한 Job을 여러 번 실행할 수 있도록 한다.
    - Step: ChunkSize와 Reader, Processor, Writer를 등록한다.
    - Reader(읽기): 파일 데이터를 읽기 위해 FlatFileItemReader 인터페이스를 이용한다. DelimitedLineTokenizer를 이용하여 콤마를 기준으로 필드 값을 나누어 읽는다. 읽은 필드 값들을 Java Object로 매핑하기 위해 FieldSetMapper 구현체를 주입한다.
    - Processor(가공): Reader를 통해 읽은 파일 데이터를 Input으로 전달받고, price 필드 값을 변경한다. 이후 Output으로 Writer에 전달한다.
    - Writer(쓰기): Processor로 가공된 Output 값을 전달받는다. 이떄, ChunkSize 단위인 List로 여러 개의 값을 한 번에 받아서 처리한다. 파일에 데이터를 쓰기 위해 FlatFileItemWriter 인터페이스를 이용한다.
```Java
@Slf4j
@Configuration
@RequiredArgsConstructor
public class FileBatchJobConfiguration {
    public static final int CHUNK_SIZE = 2;
    public static final int ADD_PRICE = 1000;
    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private static final String JOB_NAME = "fileJob";
    private static final String STEP_NAME = "fileStep";

    private Resource inputFileResource = new FileSystemResource("input/sample-product.csv");
    private Resource outputFileResource = new FileSystemResource("output/output-product.csv");

    // Job 정의
    @Bean
    public Job fileJob() {
        return this.jobBuilderFactory.get(JOB_NAME)
                .incrementer(new RunIdIncrementer())
                .start(fileStep())
                .build();
    }

    // Step 정의
    @Bean
    public Step fileStep() {
        return this.stepBuilderFactory.get(STEP_NAME)
                .<Product, Product>chunk(CHUNK_SIZE)
                .reader(fileItemReader())
                .processor(fileItemProcessor())
                .writer(fileItemWriter())
                .build();
    }

    // Reader 정의
    @Bean
    public FlatFileItemReader fileItemReader() {
        // 아이템 리더 생성
        FlatFileItemReader<Product> productItemReader = new FlatFileItemReader<>();
        productItemReader.setResource(this.inputFileResource);

        // 파일의 라인을 어떻게 가져올 것인가? (기본은 콤마)
        DefaultLineMapper<Product> lineMapper = new DefaultLineMapper<>();
        lineMapper.setLineTokenizer(new DelimitedLineTokenizer());
        lineMapper.setFieldSetMapper(new ProductFieldSetMapper());

        productItemReader.setLineMapper(lineMapper);
        return productItemReader;
    }

    // Processor 정의
    @Bean
    public ItemProcessor<Product, Product> fileItemProcessor() {
        // In: Product --> Out: Product
        return product -> {
            BigDecimal updatedPrice = product.getPrice().add(new BigDecimal(ADD_PRICE));
            log.info("[ItemProcessor] Updated product price - {}", updatedPrice);
            product.setPrice(updatedPrice);
            return product;
        };
    }

    // Writer 정의
    @Bean
    public FlatFileItemWriter<Product> fileItemWriter() {
        FlatFileItemWriter flatFileItemWriter = new FlatFileItemWriter();
        flatFileItemWriter.setResource(outputFileResource);
        flatFileItemWriter.setAppendAllowed(true);

        DelimitedLineAggregator<Product> lineAggregator = new DelimitedLineAggregator<>();
        lineAggregator.setFieldExtractor(new BeanWrapperFieldExtractor<>() {
            {
                setNames(new String[]{"id", "name", "price"});
            }
        });
        flatFileItemWriter.setLineAggregator(lineAggregator);

        return flatFileItemWriter;
    }
}
```

<br/>

## Spring Batch - DB 처리

 - __Customer__
```Java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    private Long id;
    private String name;
    private int age;
}
```

<br/>

 - __JobCompletionNotificationListener__
    - beforeJob(): Job 실행 전에 실행되는 함수
    - afterJob(): Job 실행 후에 실행되는 함수
```Java
@Slf4j
@Component
@RequiredArgsConstructor
public class JobCompletionNotificationListener {

    private final JdbcTemplate jdbcTemplate;

    @BeforeJob
    public void beforeJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.STARTED) {
            log.info("============================================");
            log.info("                JOB STARTED                 ");
            log.info("============================================");

            jdbcTemplate.query("SELECT id, name, age FROM customers",
                    (rs, row) -> new Customer(
                            rs.getLong(1),
                            rs.getString(2),
                            rs.getInt(3))
            ).forEach(customer -> log.info(">>> Found " + customer));
            log.info("============================================");
        }
    }

    @AfterJob
    public void afterJob(JobExecution jobExecution) {
        if(jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("============================================");
            log.info("                JOB FINISHED                ");
            log.info("============================================");

            jdbcTemplate.query("SELECT id, name, age FROM customers",
                    (rs, row) -> new Customer(
                            rs.getLong(1),
                            rs.getString(2),
                            rs.getInt(3))
            ).forEach(customer -> log.info(">>> Found " + customer));
            log.info("============================================");
        }
    }
}
```

<br/>

 - __CustomerItemProcessor__
    - ItemProcessor를 클래스로 따로 분리하여 만든다. (람다식으로 함수에서 구현할 수도 있다.)
```Java
@Slf4j
public class CustomerItemProcessor implements ItemProcessor<Customer, Customer> {

    public static final int ADD_NEW_AGE = 10;

    @Override
    public Customer process(Customer customer) throws Exception {
        int newAge = customer.getAge() + ADD_NEW_AGE;
        final Customer transformedCustomer = new Customer(customer.getId(), customer.getName(), newAge);

        log.info("Change customer.age(" + customer.getAge() + ") to " + newAge);
        return transformedCustomer;
    }
}
```

<br/>

 - __JdbcBatchJobConfiguration__
    - Reader, Processor, Writer를 정의하고, Step에 등록한다. 추가적으로 Job의 실행 전과 후에 콜백되는 JobListener를 등록한다.
    - Job: Step을 실행한다.
    - Step: ChunkSize와 Reader, Processor, Writer를 등록한다.
    - Reader(읽기): DB 데이터를 읽기 위해 JdbcCursorItemReader를 이용한다. 읽어들인 DB 로우를 Java Object로 매핑하기 위해 BeanPropertyRowMapper를 이용한다.
    - Processor(가공): Reader를 통해 읽은 DB 데이터를 Input으로 전달받고, 나이(age) 필드 값을 변경한다. 이후 Output으로 Writer에 전달한다.
    - Writer(쓰기): Processor로 가공된 Output 값을 전달받는다. 이떄, ChunkSize 단위인 List로 여러 개의 값을 한 번에 받아서 처리한다. DB에 데이터를 쓰기 위해 JdbcCursorItemReader를 이용한다.
```Java
@Slf4j
@Configuration
@RequiredArgsConstructor
public class JdbcBatchJobConfiguration {

    private final JobBuilderFactory jobBuilderFactory;
    private final StepBuilderFactory stepBuilderFactory;
    private final DataSource dataSource;
    private final JobCompletionNotificationListener jobCompletionNotificationListener;

    private static final String JOB_NAME = "jdbcJob";
    private static final String STEP_NAME = "jdbcStep";
    private static final int CHUNK_SIZE = 1;

    // Job 정의
    @Bean
    public Job jdbcJob() {
        return this.jobBuilderFactory.get(JOB_NAME)
                .listener(jobCompletionNotificationListener)
                .start(jdbcStep())
                .build();
    }

    // Step 정의
    @Bean
    public Step jdbcStep() {
        return this.stepBuilderFactory.get(STEP_NAME)
                .<Customer, Customer>chunk(CHUNK_SIZE)
                .reader(jdbcCursorItemReader())
                .processor(jdbcItemProcessor())
                .writer(jdbcItemWriter(dataSource))
                .build();
    }

    // Reader 정의
    @Bean
    public JdbcCursorItemReader<Customer> jdbcCursorItemReader() {
        return new JdbcCursorItemReaderBuilder<Customer>()
                .fetchSize(CHUNK_SIZE)
                .dataSource(dataSource)
                .rowMapper(new BeanPropertyRowMapper<>(Customer.class))
                .sql("SELECT id, name, age FROM customers")
                .name("jdbcCursorItemReader")
                .build();
    }

    // Processor 정의
    @Bean
    public CustomerItemProcessor jdbcItemProcessor() {
        return new CustomerItemProcessor();
    }

    // Writer 정의
    @Bean
    public JdbcBatchItemWriter<Customer> jdbcItemWriter(DataSource dataSource) {
        return new JdbcBatchItemWriterBuilder<Customer>()
                .itemSqlParameterSourceProvider(new BeanPropertyItemSqlParameterSourceProvider<>())
                .sql("UPDATE customers SET name = :name, age = :age WHERE id = :id")
                .dataSource(dataSource)
                .build();
    }
}
```
