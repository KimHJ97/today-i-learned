# 자동 구성(Auto Configuration)

 - `build.gradle`
    - Lombok, Spring Web, H2 Database, JDBC API 의존성을 추가한다.
```gradle
plugins {
    id 'org.springframework.boot' version '3.0.2'
    id 'io.spring.dependency-management' version '1.1.0'
    id 'java'
}

group = 'hello'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-jdbc'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    compileOnly 'org.projectlombok:lombok'
    runtimeOnly 'com.h2database:h2'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    //테스트에서 lombok 사용
    testCompileOnly 'org.projectlombok:lombok'
    testAnnotationProcessor 'org.projectlombok:lombok'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

<br/>

## 예제 만들기

JdbcTemplate을 사용해서 회원 데이터를 DB에 보관하고 관리한다.  


 - `Member`
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    private String memberId;
    private String name;

}
```

<br/>

 - `DbConfig`
    - DataSource, TransactionManager, JdbcTemplate을 스프링 빈으로 직접 등록한다.
    - JdbcTransactionManager는 DataSourceTransactionManager와 같은 것으로 생각하면 된다. 추가적으로 예외 변환 기능이 보강되었다.
```java
@Slf4j
@Configuration
public class DbConfig {

    @Bean
    public DataSource dataSource() {
        log.info("dataSource 빈 등록");
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setJdbcUrl("jdbc:h2:mem:test");
        dataSource.setUsername("sa");
        dataSource.setPassword("");
        return dataSource;
    }

    @Bean
    public TransactionManager transactionManager() {
        log.info("transactionManager 빈 등록");
        return new JdbcTransactionManager(dataSource());
    }

    @Bean
    public JdbcTemplate jdbcTemplate() {
        log.info("jdbcTemplate 빈 등록");
        return new JdbcTemplate(dataSource());
    }
}
```

<br/>

 - `MemberRepository`
    - JdbcTemplate 을 사용해서 회원을 관리하는 리포지토리이다.
    - DbConfig 에서 JdbcTemplate 을 빈으로 등록했기 때문에 바로 주입받아서 사용할 수 있다.
    - initTable : 보통 리포지토리에 테이블을 생성하는 스크립트를 두지는 않는다. 여기서는 예제를 단순화 하기 위해 이곳에 사용했다
```java
@Repository
public class MemberRepository {
    public final JdbcTemplate template;

    public MemberRepository(JdbcTemplate template) {
        this.template = template;
    }

    public void initTable() {
        template.execute("create table member(member_id varchar primary key, name varchar)");
    }

    public void save(Member member) {
        template.update("insert into member(member_id, name) values(?,?)",
                member.getMemberId(),
                member.getName());
    }

    public Member find(String memberId) {
        return template.queryForObject("select member_id, name from member where member_id=?",
                BeanPropertyRowMapper.newInstance(Member.class),
                memberId);
    }

    public List<Member> findAll() {
        return template.query("select member_id, name from member",
                BeanPropertyRowMapper.newInstance(Member.class));
    }
}
```

<br/>

 - `MemberRepositoryTest`
```java
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
public class MemberRepositoryTest {

    @Autowired
    MemberRepository memberRepository;

    @Transactional
    @Test
    void memberTest() {
        // Given
        Member member = new Member("idA", "memberA");
        memberRepository.initTable();
        memberRepository.save(member);

        // When
        Member findMember = memberRepository.find(member.getMemberId());

        // Then
        Assertions.assertThat(findMember.getMemberId()).isEqualTo(member.getMemberId());
        Assertions.assertThat(findMember.getName()).isEqualTo(member.getName());
    }
}
```

<br/>

 - `DbConfigTest`
    - DbConfig의 @Configration 어노테이션을 제거하여도 JdbcTemplate, DataSource, TransactionManager 빈들이 존재한다.
    - 해당 빈들은 스프링 부트가 자동으로 등록해준다.
```java
@Slf4j
@SpringBootTest
public class DbConfigTest {

    @Autowired
    DataSource dataSource;

    @Autowired
    TransactionManager transactionManager;

    @Autowired
    JdbcTemplate jdbcTemplate;

    @Test
    void checkBean() {
        log.info("dataSource = {}", dataSource);
        log.info("transactionManager = {}", transactionManager);
        log.info("jdbcTemplate = {}", jdbcTemplate);

        assertThat(dataSource).isNotNull();
        assertThat(transactionManager).isNotNull();
        assertThat(jdbcTemplate).isNotNull();
    }
}
```

<br/>

## 스프링 부트 자동 구성

스프링 부트는 자주 사용되는 수 많은 빈들을 자동으로 등록해주는 자동 구성(Auto Configuration) 기능을 제공한다.  
스프링 부트는 spring-boot-autoconfigure 라는 프로젝트 안에서 수 많은 자동 구성을 제공한다.  
스프링 부트가 제공하는 자동 구성 문서: https://docs.spring.io/spring-boot/docs/current/reference/html/auto-configuration-classes.html  


<br/>

 - `JdbcTemplateAutoConfiguration`
    - @AutoConfiguration: 자동 구성을 사용하기 위해 해당 어노테이션으로 등록한다. after 옵션으로 DataSourceAutoConfiguration 등록 후에 적용하도록 한다.
    - ConditionalOnClass: 조건문과 유사한 기능을 제공하며, 해당 클래스가 있는 경우에만 설정이 동작한다. DataSource, JdbcTemplate이 있는 경우에 등록된다.
    - @Import: 스프링에서 자바 설정을 추가할 떄 사용한다.
```java
@AutoConfiguration(after = DataSourceAutoConfiguration.class)
@ConditionalOnClass({ DataSource.class, JdbcTemplate.class })
@ConditionalOnSingleCandidate(DataSource.class)
@EnableConfigurationProperties(JdbcProperties.class)
@Import({ DatabaseInitializationDependencyConfigurer.class, JdbcTemplateConfiguration.class,
		NamedParameterJdbcTemplateConfiguration.class })
public class JdbcTemplateAutoConfiguration {

}
```

 - `JdbcTemplateConfiguration`
    - @Configuration: 설정 파일로 등록한다.
    - @@ConditionalOnMissingBean: JdbcOperations는 JdbcTemplate의 부모 인터페이스로 해당 빈이 없을 때 동작한다. 즉, JdbcTemplate가 빈으로 등록되지 않은 경우 헤댕 설정이 등록된다. 쉽게, 개발자가 직접 빈을 등록하면 커스텀하게 등록한 설정이 사용되고, 등록된 빈이 없으면 자동으로 구성한다.
```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnMissingBean(JdbcOperations.class)
class JdbcTemplateConfiguration {

	@Bean
	@Primary
	JdbcTemplate jdbcTemplate(DataSource dataSource, JdbcProperties properties) {
		JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
		JdbcProperties.Template template = properties.getTemplate();
		jdbcTemplate.setFetchSize(template.getFetchSize());
		jdbcTemplate.setMaxRows(template.getMaxRows());
		if (template.getQueryTimeout() != null) {
			jdbcTemplate.setQueryTimeout((int) template.getQueryTimeout().getSeconds());
		}
		return jdbcTemplate;
	}

}
```

# 자동 구성 라이브러리 만들기

만들어진 외부 라이브러리를 사용하기 위해서 의존성을 추가할 뿐 만 아니라 추가적으로 사용하기 위한 빈을 등록해야 하는 것은 무척 번거로운 일이다.  
어떠한 빈을 등록해야 하는지 알아야 하고, 초기 설정이 복잡하면 상당히 귀찮은 작업이 될 수 있다.  
이러한 부분을 자동으로 처리하기 위해 스프링 부트 자동 구성을 이용할 수 있다.  

<br/>

## 자동 구성 라이브러리 만들기

스프링 부트의 @AutoConfiguration 어노테이션을 이용하여 프로젝트에 라이브러리를 추가만 하면 모든 구성이 자동으로 처리되도록 할 수 있다.  

memory-v1 프로젝트를 만들어 자동 구성이 되는 라이브러리를 만든다.  

<br/>

 - `MemoryAutoConfig`
    - @AutoConfiguration: 스프링 부트가 제공하는 자동 구성 기능을 적용할 때 사용하는 애노테이션
    - @ConditionalOnProperty: memory=on 이라는 환경 정보가 있을 때 라이브러리를 적용한다.
```java
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;

@AutoConfiguration
@ConditionalOnProperty(name = "memory", havingValue = "on")
public class MemoryAutoConfig {

    @Bean
    public MemoryController memoryController() {
        return new MemoryController(memoryFinder());
    }

    @Bean
    public MemoryFinder memoryFinder() {
        return new MemoryFinder();
    }
}
```

<br/>

 - `자동 구성 대상 지정`
    - 스프링 부트 자동 구성을 적용하려면 자동 구성 대상을 지정해주어야 한다. 이때, 폴더 위치와 파일 이름이 길기 때문에 주의해야 한다.
    - 'src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports'
    - 스프링 부트는 시작 시점에 org.springframework.boot.autoconfigure.AutoConfiguration.imports 의 정보를 읽어서 자동 구성으로 사용한다.
```
memory.MemoryAutoConfig
```

