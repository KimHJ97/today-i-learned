# MyBatis 초기 설정

## MyBatis-Spring 연동 설정

트랜잭션 관리를 해주는 MyBatis-Spring 연동 모듈을 기준으로 설명한다.  

 - 공식 문서: https://mybatis.org/spring/ko/index.html
    - MyBatis-Spring 3.0, Spring Framework 6.0+, Spring Batch 5.0+, JDK 17+
    - MyBatis-Srping 2.1, Spring Framework 5.x, Spring Batch 4.x, JDK 8+

<br/>

### 기본 설정

 - `의존 라이브러리 추가`
```XML
<!-- Spring Framework -->
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.6</version>
</dependency>
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>3.0.2</version>
</dependency>

<!-- Spring Boot -->
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.2</version>
</dependency>
```
```gradle
// Spring Framework
implementation 'org.mybatis:mybatis:3.5.6'
implementation 'org.mybatis:mybatis-spring:3.0.2'

// Spring Boot
implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:3.0.2'
```

 - `MyBatisConfig`
    - DataSource 설정, SqlSessionFactory 설정, SqlSessionTemplate 설정, PlatformTransactionManager 설정
        - SqlSessionFactoryBean으로 SqlSessionFactory를 생성한다. 이떄, DataSource, ConfigLocation, MapperLocation 등 설정한다.
        - SqlSessionFactory로 SqlSessionTemplate 생성
        - @EnableTransactionManagement: @Transactional 어노테이션을 찾아 트랜잭션 범위를 활성화하는 기능
```Java
@Configuration
@EnableTransactionManagement
@MapperScan("com.example.web.**.*Mapper")
public class SqlSessionConfig {

    @Bean
    public DataSource dataSource() {
        BasicDataSource dataSource= new BasicDataSource();
        dataSource.setDriverClassName("oracle.jdbc.OracleDriver");
        dataSource.setUrl("jdbc:oracle:thin:@localhost:1521:xe");
        dataSource.setUsername("scott");
        dataSource.setPassword("tiger");
        return dataSource;
    }

    @Bean 
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();

        sqlSessionFactoryBean.setDataSource(dataSource);
        sqlSessionFactoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mappers/*Mapper.xml"));

        return sqlSessionFactoryBean.getObject();
    }
    
    @Bean  
    public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean  
    public SqlSessionTemplate batchSqlSessionTemplate(SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory, ExecutorType.BATCH);
    }

   @Bean
   public PlatformTransactionManager sqlSessionTxManager(DataSource dataSource) {
      DataSourceTransactionManager tx = new DataSourceTransactionManager(dataSource);
      return tx;
   }
}
```
```XML
<!-- DataSource 설정 -->
<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="driverClassName" value="oracle.jdbc.OracleDriver"></property>
    <property name="url" value="jdbc:oracle:thin:@localhost:1521:xe"></property>
    <property name="username" value="scott"></property>
    <property name="password" value="tiger"></property>
</bean>

<!-- SqlSessionFactory 설정 -->
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" value="dataSource"></property>
    <property name="configLocation" value="classpath:mybatis/mybatis-config.xml"></property>
    <property name="mapperLocations" value="classpath:mappers/**/*Mapper.xml"></property>
</bean>

<!-- SqlSessionTemplate 설정 -->
<bean id="sqlSession" class="org.mybatis.spring.SqlSessionTemplate">
    <constructor-arg ref="sqlSessionFactory" />
</bean>

<!-- 매퍼 스캔 -->
<mybatis-spring:scan base-package="com.example.web.**.*Mapper"/>

<!-- 트랜잭션 활성화 -->
<tx:annotation-driven></tx:annotation-driven>

<!-- 트랜잭션 매니저 설정 -->
<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <property name="dataSource" ref="dataSource"/>
</bean>
```

 - `DB CRUD 사용`
```Java
// MapperScan 사용시
@Repository
public interface TestMapper {
    TestVO findById(Long id);
}
```
```Java
// MapperScan 사용안하는 경우 SqlSessionTemplate를 직접 DI 받아서 사용
@Repository
public class TestDAO {

    @Autowired
    private SqlSessionTemplate sqlSessionTemplate;

    public TestVO findById(Long id) {
        return sqlSessionTemplate.selectOne("네임스페이스 + findById", id);
    }
}
```

## 참고

 - MyBatis-Spring 설정
    - https://pabeba.tistory.com/197
    - https://yangbongsoo.gitbook.io/study/mybatis
 - Multi DataSource 설정
    - https://devssul.tistory.com/4
    - https://gwlabs.tistory.com/99
    - https://zzang9ha.tistory.com/439
    - https://oingdaddy.tistory.com/378
