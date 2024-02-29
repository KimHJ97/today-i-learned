# MyBatis와 JPA 동시에 사용하기

 - 키워드
    - Multiple DataSource 설정
    - JPA와 MyBatis 연동
    - JPA MyBatis 동시 연동
 - JPA와 MyBatis 설명
    - https://www.elancer.co.kr/blog/view?seq=231
 - JPA&MyBatis 동시 연동
    - https://jydlove.tistory.com/49
    - https://jforj.tistory.com/91
    - https://dev-jj.tistory.com/entry/Spring-multiple-Datasource-%EC%84%A4%EC%A0%95%EA%B3%BC-JPA%EC%99%80-Mybatis-%EC%97%B0%EB%8F%99-%EA%B7%B8%EB%A6%AC%EA%B3%A0-Querydsl-%EC%84%A4%EC%A0%95%EA%B9%8C%EC%A7%80-h2-mysql-mssql-rds
    - https://blog.jiniworld.me/55
    - https://dncjf64.tistory.com/334
    - https://rangerang.tistory.com/70
    - https://blog.jiniworld.me/55#google_vignette
 - 작동 메커니즘(EntityManagerFactory & EntityManager)
    - https://stackoverflow.com/questions/48416927/spring-boot-required-a-bean-named-entitymanagerfactory-that-could-not-be-foun
    - https://velog.io/@gudonghee2000/JPA-%EC%84%A4%EC%A0%95%EA%B3%BC-%EB%8F%99%EC%9E%91%EC%9B%90%EB%A6%AC
    - https://bnzn2426.tistory.com/m/143
 - JPA @Transactional readonly
    - https://hungseong.tistory.com/74
    - https://willseungh0.tistory.com/75
    - https://velog.io/@jhbae0420/TransactionalreadOnly-true%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EC%9D%B4%EC%9C%A0%EC%99%80-%EC%A3%BC%EC%9D%98%ED%95%A0%EC%A0%90


<br/>

## 1. MyBatis와 JPA를 함께 사용하는 이유

JPA를 이용해서 복잡한 쿼리를 나타내는 것에는 한계가 있다.  
간단한 쿼리의 경우 @Query 어노테이션을 이용하여 정의할 수 있지만, 통계와 같은 복잡한 쿼리를 작성하기 위해서는 SQL을 직접 작성해야하는 경우가 발생하게 된다.  
때문에, 간단한 CRUD나 기본적인 기능은 JPA를 이용하고 복잡한 쿼리를 조회할 때는 MyBatis를 이용할 수 있다.  

<br/>

## 2. 설정 프로세스

 - DataBase 정보
    - 데이터 베이스 접속 정보를 외부 설정 값으로 설정한다.
 - DataSource 설정
    - LazyConnectionDataSourceProxy: 커넥션을 지연해서 얻을 필요가 있는 경우 설정한다.
    - AbstractRoutingDataSource: 데이터베이스를 마스터와 슬레이브처럼 라우팅할 필요가 있는 경우 설정한다.
 - MyBatis 설정(, SqlSessionTemplate)
    - SqlSessionFactory: MyBatis 설정 정보를 읽어 기반 객체를 만들고, 데이터 소스를 통해 커넥션을 관리하는 SqlSessionFactory를 만든다.
    - SqlSessionTemplate: 실제 MyBatis의 등록/수정/삭제/조회 기능을 제공하고, 트랜잭션과 공통 예외를 반환해주는 SqlSessionTemplate을 만든다.
 - JPA 설정()
    - EntityManagerFactory: JPA 설정 정보를 읽어 기반 객체를 만들고, JPA 구현체에 따라서 데이터베이스 커넥션 풀을 생성하는 엔티티 매니저 팩토리를 설정한다.
    - EntityManager: 실제 엔티티에 대해서 데이터베이스에 등록/수정/삭제/조회 기능을 제공하는 엔티티 매니저를 설정한다.
 - TransactionManager 설정
    - JpaTransactionManager:  JPA와 MyBatis를 동시에 같은 트랜잭션 내에서 사용하는 경우 JpaTransactionManager을 이용한다.

<br/>

## 3. 설정

### 3-1. 설정시 주의 사항

만약, DataSource를 1개만 사용하는 경우 application.yml에 있는 정보를 사용하지만, EntityManager가 분리되었을 때는 Bean에 설정되는 정확한 값을 입력해주어야 한다. 즉, EntityManagerFactory를 직접 생성하여 옵션 값을 지정해주어야 한다. 또한, 기본적으로 entityManagerFactory 라는 이름의 빈을 찾기 때문에, @EnableJpaRepositories 어노테이션의 entityManagerFactoryRef 옵션에 설정한 EntityManagerFactory 빈의 이름을 지정해주어야 한다.  

MyBatis와 JPA를 동시에 사용하는 경우 TransactionManager의 구현체로 JpaTransactionManager를 사용한다. 해당 구현체는 JPA를 위해 주로 사용하지만, 트랜잭션이 사용하고 있는 DataSource에 직접 접근 가능하여 일반적인 JDBC를 바로 사용할 수 있다. 또한, MyBatis는 트랜잭션 관리를 Spring Transaction에 위임한다. 즉, JpaTransactionManager를 사용하면 JPA와 MyBatis를 같은 트랜잭션안에서 사용할 수 있다.  

<br/>

### 3-2. 설정 예제 코드

 - `application.yml`
    - 데이터베이스 접속 관련 정보를 설정한다.
    - Hibernate 설정 정보를 설정한다.
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

properties:
  hibernate-mysql:
    ddl-auto: none
    dialect: org.hibernate.dialect.MySQLInnoDBDialect
    show_sql: true
    format_sql: true
```

<br/>

 - `JpaProperties`
    - application.yml에 설정한 환경 변수를 상수로 사용하기 위한 클래스
```java
@Setter
@Configuration
@ConfigurationProperties(prefix = "properties.hibernate-mysql")
public class JpaProperties {
  private String ddlAuto;
  private String dialect;
  private String showSql;
  private String formatSql;
}
```

<br/>

 - `MySqlConfig`
    - MyBatis와 JPA 관련 설정을 한다.
    - MyBatis는 SqlSessionFactory와 SqlSessionTemplate을 설정한다.
        - SqlSessionFactory에는 데이터베이스 연결 정보, SQL 매핑 구성, MyBatis 옵션을 설정한다.
        - SqlSessionTemplate는 SqlSessionFactory를 통해 생성하며, 실제 MyBatis 예외 처리와 세션 생명 주기들을 관리해준다.
    - JPA는 EntityManagerFactory를 설정하고, @EnableJpaRepositories 어노테이션의 옵션으로 해당 엔티티 매니저 팩토리를 통해 엔티티 매니저를 설정하도록 한다.
        - EntityManagerFactory에는 데이터베이스 연결 정보, JPA 옵션들을 설정한다.
        - EntityManager는 EntityManagerFactory를 통해 생성하며, 실제 엔티티에 관한 DB 접근 기술을 제공한다.
    - TransactionManager는 JpaTransactionManager 구현체를 사용한다. 
```java
@Configuration
@EnableTransactionManagement
@PropertySource("classpath:/application.yml")
@EnableJpaRepositories(
   basePackages = {"com.example.repository.mysql"},
   entityManagerFactoryRef = "mysqlEntityManagerFactory",
   transactionManagerRef = "mysqlTransactionManager" 
)
@MapperScan(
   basePackages = {"com.example.**.mapper"},
   sqlSessionFactoryRef="mysqlSqlSessionFactory"
)
public class MySqlConfig {

   @Autowired
   private JpaProperties jpaProperties;

   /**
    * SqlSessionFactory 설정
    * 데이터베이스와의 연결을 설정하고 MyBatis를 통해 SQL 세션을 생성하는 역할을 한다.
    * 이를 통해 데이터베이스 연결 정보, SQL 매핑 구성, MyBatis 옵션들을 설정한다.
    * @param dataSource
    * @param ctx
    * @return
    * @throws Exception
    */
   @Bean
   public SqlSessionFactory mysqlSqlSessionFactory(
         @Qualifier("mysqlRoutingLazyDataSource") DataSource dataSource,
         ApplicationContext ctx) throws Exception {

      SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();

      factoryBean.setDataSource(dataSource);

      PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
      factoryBean.setMapperLocations(resolver.getResources("classpath:mappers/**/*.xml"));
      factoryBean.setTypeAliasesPackage("com.example");
      factoryBean.setVfs(SpringBootVFS.class);
      factoryBean.getObject().getConfiguration().setCacheEnabled(false);
      factoryBean.getObject().getConfiguration().setJdbcTypeForNull(JdbcType.VARCHAR);
      factoryBean.getObject().getConfiguration().setLocalCacheScope(LocalCacheScope.STATEMENT);
      factoryBean.getObject().getConfiguration().setCallSettersOnNulls(true);

      return factoryBean.getObject();
   }

   /**
    * SqlSessionTemplate 설정
    * SqlSession 인터페이스의 구현체로 MyBatis 예외처리나 세션의 생명주기를 관리한다.
    * @param sqlSessionFactory
    * @return
    */
   @Bean
   public SqlSessionTemplate mysqlSqlSessionTemplate(@Qualifier("mysqlSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
      return new SqlSessionTemplate(sqlSessionFactory);
   }

   /**
    * SqlSessionTemplate 설정(Batch 용도)
    * SqlSession 인터페이스의 구현체로 MyBatis 예외처리나 세션의 생명주기를 관리한다.
    * @param sqlSessionFactory
    * @return
    */
   @Bean
   public SqlSessionTemplate mysqlBatchSqlSessionTemplate(@Qualifier("mysqlSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
      return new SqlSessionTemplate(sqlSessionFactory, ExecutorType.BATCH);
   }

   /**
    * LocalContainerEntityManagerFactoryBean 설정
    * EntityManger를 생성하는 팩토리
    * @param builder
    * @param dataSource
    * @return
    */
   @Bean
   public EntityManagerFactory mysqlEntityManagerFactory(
         @Qualifier("mysqlRoutingLazyDataSource") DataSource dataSource) {

      JpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
      LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
      factory.setDataSource(dataSource);
      factory.setPackagesToScan("com.example.domain.mysql");
      factory.setPersistenceUnitName("mysqlEntityManager");
      factory.setJpaVendorAdapter(vendorAdapter);
      factory.setJpaPropertyMap(
         Map.of(
            "hibernate.hbm2ddl.auto", jpaProperties.getDdlAuto(),
            "hibernate.dialect", jpaProperties.getDialect(),
            "hibernate.show_sql", jpaProperties.getShowSql(),
            "hibernate.format_sql", jpaProperties.getFormatSql()
         )
      );
      factory.afterPropertiesSet();

      return factory.getObject();
   }

   /**
    * JpaTransactionManager 설정
    * EntityManagerFactory를 전달받아 JPA에서 트랜잭션을 관리
    * JPA와 MyBatis를 동시에 같은 트랜잭션 내에서 사용하는 경우 JpaTransactionManager을 이용한다.
    * ex) @Transactional(transactionManager = "mysqlTransactionManager")
    * @param mfBean
    * @return
    */
   @Bean
   public PlatformTransactionManager mysqlTransactionManager(@Qualifier("mysqlEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
      JpaTransactionManager transactionManager = new JpaTransactionManager();
      transactionManager.setEntityManagerFactory(entityManagerFactory);
      return transactionManager;
   }

}
```

<br/>

 - `QueryDslConfig`
```java
@Configuration
public class QueryDslConfig {

    @PersistenceContext(unitName = "mysqlEntityManagerFactory")
    private EntityManager entityManager;

    @Bean
    public JPAQueryFactory mysqlJpaQueryFactory() {
        return new JPAQueryFactory(entityManager);
    }

}
```
