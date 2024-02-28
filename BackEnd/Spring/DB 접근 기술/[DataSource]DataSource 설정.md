# 데이터 소스 설정

## 1. 데이터 소스 설정

 - https://oingdaddy.tistory.com/378
 - https://escapefromcoding.tistory.com/711

### HikariCP DataSource

HikariCP는 Java 어플리케이션에서 사용되는 고성능 JDBC 커넥션 풀 라이브러리입니다. HikariCP는 가볍고 빠르며, 대규모 및 고트래픽 애플리케이션에서도 우수한 성능을 제공합니다.  

HikariCP는 현대적인 Java 어플리케이션에서 데이터베이스 연결 관리에 대한 최적의 선택 중 하나입니다. 데이터베이스 액세스의 성능과 확장성을 고려하는 경우, HikariCP는 많은 개발자들에게 권장되는 커넥션 풀 라이브러리입니다.  

 - `HikariDataSource 예시`
    - HikariDataSource는 DataSource를 구현한 클래스입니다.
```java
@Configuration
public class DataSourceConfig {

    @Value("${jdbc.url}")
    private String url;
    @Value("${jdbc.username}")
    private String username;
    @Value("${jdbc.password}")
    private String password;
    @Value("${jdbc.driverClassName}")
    private String driverClassName;

    @Bean
    public DataSource datasource() {
        //HikariConfig 생성(DB 정보)
        HikariConfig configuration = new HikariConfig();
        configuration.setDriverClassName(driverClassName);
        configuration.setJdbcUrl(url);
        configuration.setUsername(username);
        configuration.setPassword(password);

        //HikariDataSource 생성(DB 연동)
        return new HikariDataSource(configuration);
    }

}
```

### 예제 코드

 - `직접 설정하기`
    - DatasourceBuilder에서 직접 driverClassName, url, username, password를 지정해서 생성합니다.
```java
    @Bean
    public DataSource datasource() {
        return DataSourceBuilder.create()
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .url("jdbc:mysql://localhost:3306/master")
                .username("root")
                .password("root")
                .build();
    }
```

<br/>

 - `외부 설정 값에서 가져오기`
```java
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource")
    DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }
```

<br/>

 - `다중 DB 데이터 소스 설정`
```java
    @Bean
    @Qualifier("oracleDataSource")
    @ConfigurationProperties(prefix = "spring.datasource-oracle")
    DataSource dataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }

    @Bean
    @Qualifier("mysqlDataSource")
    @ConfigurationProperties(prefix = "spring.datasource-mysql")
    DataSource dataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .build();
    }
```

<br/>

## 2. 데이터 소스 동적 라우팅

 - https://kerobero.tistory.com/39
 - https://warpgate3.tistory.com/entry/Spring-Routing-Datasource#google_vignette
 - https://huisam.tistory.com/entry/routingDataSource


### AbstractRoutingDataSource 인터페이스

AbstractRoutingDataSource는 스프링 프레임워크에서 데이터베이스 라우팅을 지원하는 인터페이스입니다. 이 인터페이스는 여러 데이터베이스를 동적으로 선택하여 사용할 수 있도록 합니다. 주로 마스터-슬레이브 구조나 데이터베이스 샤딩(sharding)과 같은 환경에서 사용됩니다.  

 - 데이터베이스 선택: 요청에 따라 적절한 데이터베이스를 선택합니다. 예를 들어, 쓰기 연산은 마스터 데이터베이스에, 읽기 연산은 슬레이브 데이터베이스에 연결할 수 있습니다.
 - 라우팅 전략 구현: 어떤 데이터베이스를 선택할지를 결정하는 라우팅 전략을 구현합니다. 이는 주로 애플리케이션의 요구 사항과 데이터베이스 구조에 따라 달라집니다.
 - 데이터베이스 연결 관리: 여러 데이터베이스와의 연결을 효율적으로 관리하고, 필요에 따라 새로운 연결을 생성하거나 기존 연결을 재사용합니다.

<br/>

#### AbstractRoutingDataSource 옵션

AbstractRoutingDataSource 인터페이스는 Spring Framework에서 데이터 소스 라우팅을 지원하는 추상화된 클래스입니다. 이 인터페이스는 여러 개의 데이터 소스 중에서 실제 사용할 데이터 소스를 결정하는 라우팅 로직을 구현하기 위해 사용됩니다. 이 인터페이스의 두 가지 중요한 메서드인 setTargetDataSources()와 setDefaultTargetDataSource()는 이 라우팅 로직을 설정하는 데 사용됩니다.  

 - __setTargetDataSources(Map<Object, Object> targetDataSources)__
    - 이 메서드는 여러 개의 데이터 소스를 지정할 때 사용됩니다. targetDataSources 맵을 통해 키-값 쌍으로 데이터 소스를 지정합니다. 키는 데이터 소스의 식별자이고, 값은 실제 사용될 데이터 소스입니다.
    - 예를 들어, 특정 애플리케이션에서는 마스터 데이터베이스와 여러 개의 슬레이브 데이터베이스를 사용할 수 있습니다. targetDataSources 맵에는 "master"와 "slave1", "slave2" 등의 키를 가지고 각각의 데이터베이스 연결을 값으로 가질 수 있습니다.
 - __setDefaultTargetDataSource(Object defaultTargetDataSource)__
    - 이 메서드는 기본(default) 데이터 소스를 설정하는 데 사용됩니다. 기본 데이터 소스는 라우팅 로직에 따라 선택된 데이터 소스가 없을 때 사용됩니다.
    - 대개 이 메서드를 사용하여 마스터 데이터베이스를 기본 데이터 소스로 설정합니다.
    - 기본 데이터 소스를 설정하지 않으면, 라우팅 로직에 따라 명시적으로 선택된 데이터 소스가 없을 때 예외가 발생할 수 있습니다.

<br/>

### 예제 코드

 - `Maven`
```xml
<!-- Spring JDBC -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>${spring.version}</version>
</dependency>
```

<br/>

 - `applicationContext.xml`
```xml
<bean id="routingDataSource" class="org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource">
    <property name="targetDataSources">
        <map>
            <!-- Master DataSource -->
            <entry key="masterDataSource" value-ref="masterDataSource"/>
            <!-- Slave DataSource -->
            <entry key="slaveDataSource" value-ref="slaveDataSource"/>
        </map>
    </property>
    <!-- Default DataSource -->
    <property name="defaultTargetDataSource" ref="masterDataSource"/>
</bean>

<bean id="masterDataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="driverClassName" value="your.driver.ClassName"/>
    <property name="url" value="jdbc:mysql://localhost:3306/master"/>
    <property name="username" value="yourUsername"/>
    <property name="password" value="yourPassword"/>
</bean>

<bean id="slaveDataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="driverClassName" value="your.driver.ClassName"/>
    <property name="url" value="jdbc:mysql://localhost:3306/slave"/>
    <property name="username" value="yourUsername"/>
    <property name="password" value="yourPassword"/>
</bean>
```

<br/>

 - ``
```java
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class MyRoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        // 여기에서 라우팅 로직을 구현합니다.
        // 예를 들어, 현재 스레드에 사용자의 정보를 기반으로 마스터/슬레이브를 선택하도록 구현할 수 있습니다.
        // 실제로는 여러 방법으로 라우팅 로직을 구현할 수 있습니다.
        return determineDataSourceKeyBasedOnSomeLogic();
    }

    private String determineDataSourceKeyBasedOnSomeLogic() {
        // 여기에서 실제로 어떤 데이터베이스를 선택할지 로직을 구현합니다.
        // 예를 들어, 현재 사용자의 정보나 요청한 작업 유형 등을 기준으로 선택할 수 있습니다.
        // 간단한 예로 마스터/슬레이브를 번갈아가며 선택하는 방법을 사용할 수 있습니다.
        return "masterDataSource"; // 또는 "slaveDataSource"
    }
}
```

<br/>

 - `DataSourceConfig`
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        MyRoutingDataSource routingDataSource = new MyRoutingDataSource();
        routingDataSource.setTargetDataSources(getTargetDataSources());
        routingDataSource.setDefaultTargetDataSource(getDefaultDataSource());
        return routingDataSource;
    }

    private Map<Object, Object> getTargetDataSources() {
        Map<Object, Object> targetDataSources = new HashMap<>();
        targetDataSources.put("masterDataSource", masterDataSource());
        targetDataSources.put("slaveDataSource", slaveDataSource());
        return targetDataSources;
    }

    private DataSource masterDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("your.driver.ClassName");
        dataSource.setUrl("jdbc:mysql://localhost:3306/master");
        dataSource.setUsername("yourUsername");
        dataSource.setPassword("yourPassword");
        return dataSource;
    }

    private DataSource slaveDataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("your.driver.ClassName");
        dataSource.setUrl("jdbc:mysql://localhost:3306/slave");
        dataSource.setUsername("yourUsername");
        dataSource.setPassword("yourPassword");
        return dataSource;
    }

    private DataSource getDefaultDataSource() {
        return masterDataSource();
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
}
```

<br/>

## 3. 커넥션 점유 시간 단축시키기

 - https://sup2is.github.io/2021/07/08/lazy-connection-datasource-proxy.html
 - https://velog.io/@yyong3519/LazyConnectionDataSourceProxy%EB%9E%80
 - https://keydo.tistory.com/29
 - https://tjdrnr05571.tistory.com/15

<br/>

### Master&Slave 분기시 문제점

Spring은 기본적으로 트랜잭션을 시작할 때, 쿼리가 실행되기도 전에 DataSource를 정해놓는다.
따라서 AOP에서 Master와 Slave 데이터 소스를 분기를 하는 경우 DataSource를 정하는 로직이 가능하게 하기 위해서는 DataSource 연결을 늦추도록 구현해야 한다.  

 - `DataSource 분기 예시`
```java
    @SetDataSource(dataSourceType = DataSourceType.SLAVE)
    UserDTO selectUserById(String id);

    @SetDataSource(dataSourceType = DataSourceType.MASTER)
    void deleteUser(String id);
```

<br/>

 - `LazyConnectionDataSourceProxy 예시`
    - routingDataSource를 LazyConnectionDataSourceProxy로 감싸면 TransactionManager 식별 -> LazyConnectionDataSourceProxy에서 Connection Proxy 객체 획득 -> Transaction 동기화(Synchronization) -> 실제 쿼리 호출시에 RoutingDataSource.getConnection()/determineCurrentLookupKey() 호출 과 같이 트랜잭션 매니저의 로직이 변경됩니다.
```java
    @Bean
    public DataSource lazyRoutingDataSource(
        @Qualifier(value = "routingDataSource") DataSource routingDataSource) {
        return new LazyConnectionDataSourceProxy(routingDataSource);
    }

    @Bean
    public PlatformTransactionManager transactionManager(
        @Qualifier(value = "lazyRoutingDataSource") DataSource lazyRoutingDataSource) {
        DataSourceTransactionManager transactionManager = new DataSourceTransactionManager();
        transactionManager.setDataSource(lazyRoutingDataSource);
        return transactionManager;
    }
```

<br/>

### LazyConnectionDataSourceProxy 클래스

LazyConnectionDataSourceProxy 클래스는 Spring Framework에서 제공하는 데이터 소스 프록시 클래스 중 하나입니다. 이 클래스는 데이터베이스 커넥션을 실제로 필요한 시점까지 생성하지 않고, 연결이 필요한 경우에만 커넥션을 생성합니다. 이를 통해 애플리케이션의 성능을 향상시키고 리소스를 절약할 수 있습니다.  

이 클래스는 주로 애플리케이션이 시작될 때 모든 리소스를 즉시 로드하는 것을 피하고, 필요한 경우에만 데이터베이스 연결을 수립하여 성능을 최적화하는 데 사용됩니다.  

 - __게으른(Lazy) 연결 생성__: LazyConnectionDataSourceProxy는 실제로 데이터베이스에 연결되는 시점까지 커넥션을 생성하지 않습니다. 대신, 첫 번째 데이터베이스 작업이 수행될 때까지 커넥션을 만들지 않습니다. 이는 애플리케이션이 시작될 때 모든 리소스를 즉시 할당하는 것을 피하고, 필요한 경우에만 리소스를 사용할 수 있도록 합니다.
 - __실제 데이터 소스 대리__: LazyConnectionDataSourceProxy는 실제 데이터 소스에 대한 프록시 역할을 합니다. 애플리케이션 코드는 이 프록시를 통해 데이터베이스와 상호 작용하며, 프록시는 실제 데이터 소스에 요청을 위임합니다.
 - __스레드 안전성__: LazyConnectionDataSourceProxy는 여러 스레드에서 안전하게 사용할 수 있습니다. 스레드 간에 커넥션을 공유하고, 각 스레드에서 필요할 때마다 게으르게 생성됩니다.
 - __프록시 설정__: Spring의 설정을 통해 LazyConnectionDataSourceProxy를 사용할 수 있습니다. 데이터 소스 빈을 프록시로 감싸고, 프록시를 통해 데이터베이스 연결을 지연시킬 수 있습니다.

<br/>

### 예제 코드

 - `DataSourceConfig`
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration
@EnableTransactionManagement
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("your.driver.ClassName");
        dataSource.setUrl("jdbc:mysql://localhost:3306/your_database");
        dataSource.setUsername("yourUsername");
        dataSource.setPassword("yourPassword");

        // LazyConnectionDataSourceProxy를 사용하여 프록시 생성
        return new LazyConnectionDataSourceProxy(dataSource);
    }

    @Bean
    public PlatformTransactionManager transactionManager() {
        return new DataSourceTransactionManager(dataSource());
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    // 이후에 서비스 클래스에서 JdbcTemplate를 주입하여 데이터베이스 작업을 수행할 수 있음
}

```
