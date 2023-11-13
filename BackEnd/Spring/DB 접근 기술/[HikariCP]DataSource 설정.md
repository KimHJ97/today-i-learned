# HikariCP DataSource 설정

 - 공식 문서: https://github.com/brettwooldridge/HikariCP

## XML을 이용한 방법

 - datasource-context.xml
```XML
<bean id="hikariConfig" class="com.zaxxer.hikari.HikariConfig">
    <property name="driverClassName" value="oracle.jdbc.driver.OracleDriver"/>
    <property name="jdbcUrl" value="jdbc:oracle:thin:@localhost:1521:xe"/>
    <property name="username" value="scott"/>
    <property name="password" value="tiger"/>
</bean>

<bean id="dataSource" class="com.zaxxer.hikari.HikariDataSource" destroy-method="close">
    <constructor-arg ref="hikariConfig" />
</bean>
```

<br/>

## Java Config를 이용한 방법

 - DataSourceConfig
```Java
@Bean(destroyMethod = "close")
public DataSource dataSource(){
    HikariConfig hikariConfig = new HikariConfig();
    hikariConfig.setDriverClassName("oracle.jdbc.driver.OracleDriver");
    hikariConfig.setJdbcUrl("jdbc:oracle:thin:@localhost:1521:xe");
    hikariConfig.setUsername("scott");
    hikariConfig.setPassword("tiger");
    hikariConfig.setMaximumPoolSize(5);
    hikariConfig.setConnectionTestQuery("SELECT 1 FROM DUAL");
    hikariConfig.setPoolName("springHikariCP");

    HikariDataSource dataSource = new HikariDataSource(hikariConfig);
    return dataSource;
}
```

<br/>

## Spring Boot 설정 파일을 이용한 방법

 - application.yml
```YML
spring:
  datasource:
    hikari:
      driver-class-name: oracle.jdbc.driver.OracleDriver
      jdbc-url: jdbc:oracle:thin:@localhost:1521:xe
      username: scott
      password: tiger
      connection-test-query: SELECT 1 FROM DUAL
      pool-name: Hikari Connection Pool  # Pool Name Alias
      maximum-pool-size: 20
```

 - DataSourceConfig
```Java
@Configuration
@PropertySource("classpath:/application.yml", factory = YamlPropertySourceFactory.class)
public class DataSourceConfig {

    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public HikariConfig hikariConfig() {
        return new HikariConfig();
    }

    @Bean
    public DataSource dataSource() {
        return new HikariDataSource(hikariConfig());
    }

}
```


<br/>

## 참고

 - HikariCP 설정
    - https://adjh54.tistory.com/73
    - https://oingdaddy.tistory.com/13
