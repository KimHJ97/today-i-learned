# HikariCP Multi-DataSource 설정

## Spring Boot 설정 파일을 이용한 방법

 - `application.yml`
```YML
spring:
  datasource-oracle:
    driver-class-name: oracle.jdbc.OracleDriver
    jdbc-url: jdbc:oracle:thin:@xx.xx.xx.xx:1521:SID
    username: scott
    password: tiger
  datasource-mysql:
    driver-class-name: com.mysql.jdbc.Driver
    jdbc-url: jdbc:mysql://xx.xx.xx.xx:3306/SID
    username: root
    password: p@ssw0rd!
```

 - `DataSourceConfig`
    - @Primary로 같은 우선순위로 있는 클래스가 여러개가 있을 시 그 중 가장 우선순위로 주입할 클래스 타입을 선택할 수 있다.
    - @Qualifier는 @Autowired와 같이 쓰이며 여러개의 타입이 일치하는 bean객체가 있을 경우 @Qualifier 어노테이션의 유무를 확인한 후 조건에 만족하는 객체를 주입하게 된다.
```Java
@Autowired
private ApplicationContext applicationContext;

@Bean
@Qualifier("oracleDataSource")
@ConfigurationProperties(prefix = "spring.datasource-oracle")
public DataSource oracleDataSource() {
    return DataSourceBuilder.create()
            .type(HikariDataSource.class)
            .build();
}

@Bean
@Qualifier("mysqlDataSource")
@ConfigurationProperties(prefix = "spring.datasource-mysql")
public DataSource mysqlDataSource() {
    return DataSourceBuilder.create()
            .type(HikariDataSource.class)
            .build();
}

@Bean
@Primary
public SqlSessionFactory oracleSqlSessionFactory() throws Exception {
    SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
    factoryBean.setDataSource(oracleDataSource());
    factoryBean.setVfs(SpringBootVFS.class);
    factoryBean.setConfigLocation(applicationContext.getResource("classpath:mybatis/mybatis-config.xml"));
    factoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mybatis/oracle/**/*Mapper.xml"));
    return factoryBean.getObject();
}

@Bean
public SqlSessionFactory mysqlSqlSessionFactory() throws Exception {
    SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
    factoryBean.setDataSource(mysqlDataSource());
    factoryBean.setVfs(SpringBootVFS.class);
    factoryBean.setConfigLocation(applicationContext.getResource("classpath:mybatis/mybatis-config.xml"));
    factoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mybatis/mysql/**/*Mapper.xml"));
    return factoryBean.getObject();
}

@Bean
@Primary
public CommonDao commonDao() throws Exception {
    CommonDao commonDao = new CommonDao();
    commonDao.setSqlSessionFactory(oracleSqlSessionFactory());
    return commonDao;
}

@Bean
@Qualifier("mysqlCommonDao")
public CommonDao mysqlCommonDao() throws Exception {
    CommonDao commonDao = new CommonDao();
    commonDao.setSqlSessionFactory(mysqlSqlSessionFactory());
    return commonDao;
}

@Bean
public PlatformTransactionManager transactionManager() {
    return new DataSourceTransactionManager(oracleDataSource());
}

@Bean
public PlatformTransactionManager mysqlTransactionManager() {
    return new DataSourceTransactionManager(mysqlDataSource());
}
```

 - `Multi DataSource 사용법`
```Java
// MySQL 사용시
@Autowired
@Qualifier("mysqlCommonDao")
private CommonDao mysqlCommonDao;

// Oracle 사용시
@Autowired
private CommonDao commonDao;
```

<br/>

## Spring Boot 설정 파일을 이용한 방법2

 - `application.properties`
```properties
spring.h2.console.enabled=true

# 공통설정
spring.datasource.hikari.max-lifetime=100000
spring.datasource.hikari.maximum-pool-size=10

# 첫번째 Datasource 설정
spring.first.datasource.jdbc-url=jdbc:h2:mem:first
spring.first.datasource.driverClassName=org.h2.Driver
spring.first.datasource.username=first
spring.first.datasource.password=

# 두번째 Datasource 설정
spring.second.datasource.jdbc-url=jdbc:h2:mem:second
spring.second.datasource.driverClassName=org.h2.Driver
spring.second.datasource.username=second
spring.second.datasource.password=

# 로깅레벨
logging.level.com.zaxxer.hikari.HikariConfig=DEBUG
```

 - `CommonConfig`
```Java
@Configuration
public class CommonConfig {
    @Bean(name = "commonHikariConfig")
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public HikariConfig commonHikariConfig() {
        return new HikariConfig();
    }
}
```

 - `FirstDataSourceConfig`
```Java
@Slf4j
@Configuration
@RequiredArgsConstructor
public class FirstDataSourceConfig {

    private final CommonConfig commonConfig;

    @Bean(name = "firstDataSource")
    @ConfigurationProperties(prefix = "spring.first.datasource")
    public DataSource firstDataSource() {
        HikariDataSource firstDataSource = new HikariDataSource();

        // 공통설정 적용
        firstDataSource.setMaxLifetime(commonConfig.commonHikariConfig().getMaxLifetime());
        firstDataSource.setMaximumPoolSize(commonConfig.commonHikariConfig().getMaximumPoolSize());
        return firstDataSource;
    }

    @Bean(name = "firstJdbcTemplate")
    public JdbcTemplate firstJdbcTemplate(@Qualifier("firstDataSource") DataSource firstDataSource) {
        return new JdbcTemplate(firstDataSource);
    }

    /**
     * H2 DB 초기화 스크립트 실행을 위한
     * DataSourceInitializer 정의
     * @param datasource
     * @return dataSourceInitializer
     */
    @Bean
    public DataSourceInitializer firstDataSourceInitializer(@Qualifier("firstDataSource") DataSource datasource) {
        ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
        resourceDatabasePopulator.addScript(new ClassPathResource("first-schema.sql"));

        DataSourceInitializer dataSourceInitializer = new DataSourceInitializer();
        dataSourceInitializer.setDataSource(datasource);
        dataSourceInitializer.setDatabasePopulator(resourceDatabasePopulator);
        return dataSourceInitializer;
    }
}
```

 - `SecondDataSourceConfig`
```Java
@Slf4j
@Configuration
@RequiredArgsConstructor
public class SecondDataSourceConfig {

    private final CommonConfig commonConfig;

    @Bean(name = "secondDataSource")
    @ConfigurationProperties(prefix = "spring.second.datasource")
    public DataSource secondDataSource() {
        HikariDataSource secondDataSource = new HikariDataSource();

        // 공통설정 적용
        secondDataSource.setMaxLifetime(commonConfig.commonHikariConfig().getMaxLifetime());
        secondDataSource.setMaximumPoolSize(commonConfig.commonHikariConfig().getMaximumPoolSize());
        return secondDataSource;
    }

    @Bean(name = "secondJdbcTemplate")
    public JdbcTemplate secondJdbcTemplate(@Qualifier("secondDataSource") DataSource secondDataSource) {
        return new JdbcTemplate(secondDataSource);
    }

    /**
     * H2 DB 초기화 스크립트 실행을 위한
     * DataSourceInitializer 정의
     * @param datasource
     * @return dataSourceInitializer
     */
    @Bean
    public DataSourceInitializer secondDataSourceInitializer(@Qualifier("secondDataSource") DataSource datasource) {
        ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
        resourceDatabasePopulator.addScript(new ClassPathResource("second-schema.sql"));

        DataSourceInitializer dataSourceInitializer = new DataSourceInitializer();
        dataSourceInitializer.setDataSource(datasource);
        dataSourceInitializer.setDatabasePopulator(resourceDatabasePopulator);
        return dataSourceInitializer;
    }
}
```

<br/>

## 참고

 - Multi DataSource 설정
    - https://oingdaddy.tistory.com/378
    - https://gwlabs.tistory.com/99
