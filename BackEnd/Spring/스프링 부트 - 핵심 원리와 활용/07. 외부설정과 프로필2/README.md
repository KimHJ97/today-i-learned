# 외부설정과 프로필

## 외부 설정 사용 - Environment

 - `application.properties`
    - 설정 데이터에 DataSource 관련 설정에 사용할 값들을 정의한다.
    - properties는 관례상 카멜 케이스대신 '-'를 이용한 케밥 케이스가 권장된다.
```properties
my.datasource.url=local.db.com
my.datasource.username=username
my.datasource.password=password
my.datasource.etc.max-connection=1
my.datasource.etc.timeout=3500ms
my.datasource.etc.options=CACHE,ADMIN
```

<br/>

 - `MyDataSource`
```java
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.util.List;

@Slf4j
public class MyDataSource {

    private String url;
    private String username;
    private String password;
    private int maxConnection;
    private Duration timeout;
    private List<String> options;

    public MyDataSource(String url, String username, String password, int maxConnection, Duration timeout, List<String> options) {
        this.url = url;
        this.username = username;
        this.password = password;
        this.maxConnection = maxConnection;
        this.timeout = timeout;
        this.options = options;
    }

    @PostConstruct
    public void init() {
        log.info("url={}", url);
        log.info("username={}", username);
        log.info("password={}", password);
        log.info("maxConnection={}", maxConnection);
        log.info("timeout={}", timeout);
        log.info("options={}", options);
    }
}
```

<br/>

 - `MyDataSourceEnvConfig`
    - 스프링에서 제공하는 Environment를 이용하여 설정 데이터(application.properties)의 값들을 가져온다.
    - 이후에 가져온 값으로 MyDataSource를 빈으로 등록해준다.
    - Environment 를 사용하면 외부 설정의 종류와 관계없이 코드 안에서 일관성 있게 외부 설정을 조회할 수 있다. Environment.getProperty(key, Type) 를 호출할 때 타입 정보를 주면 해당 타입으로 변환해준다. (스프링 내부 변환기가 작동한다.)
```java
import hello.datasource.MyDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.time.Duration;
import java.util.List;

@Slf4j
@Configuration
public class MyDataSourceEnvConfig {

    private final Environment env;

    public MyDataSourceEnvConfig(Environment env) {
        this.env = env;
    }

    @Bean
    public MyDataSource myDataSource() {
        String url = env.getProperty("my.datasource.url");
        String username = env.getProperty("my.datasource.username");
        String password = env.getProperty("my.datasource.password");
        int maxConnection = env.getProperty("my.datasource.etc.max-connection", Integer.class);
        Duration timeout = env.getProperty("my.datasource.etc.timeout", Duration.class);
        List<String> options = env.getProperty("my.datasource.etc.options", List.class);

        return new MyDataSource(url, username, password, maxConnection, timeout, options);
    }
}
```

<br/>

 - `ExternalReadApplication`
    - 설정 정보를 빈으로 등록하기 위해 @Import 어노테이션을 사용한다.
```java
@Import(MyDataSourceEnvConfig.class)
@SpringBootApplication(scanBasePackages = "hello.datasource")
public class ExternalReadApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExternalReadApplication.class, args);
    }
}
```

<br/>

## 외부설정 사용 - @Value

@Value 를 사용하면 외부 설정값을 편리하게 주입받을 수 있다. @Value는 내부적으로 Environment를 사용하여 설정값을 주입한다.  

@Value 어노테이션 안에 속성으로 "${}"를 사용해서 외부 설정 키값을 주어 원하는 값을 주입받을 수 있다. @Value는 필드 및 파라미터에 사용할 수 있다.  

만약 키를 찾지 못한 경우 @Value("${my.datasource.etc.max-connection:1}") 처럼 기본 값을 설정할 수 있다.  


 - `MyDataSourceValueConfig`
```java
import hello.datasource.MyDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Slf4j
@Configuration
public class MyDataSourceValueConfig {

    // @Value 필드 주입
    @Value("${my.datasource.url}")
    private String url;
    @Value("${my.datasource.username}")
    private String username;
    @Value("${my.datasource.password}")
    private String password;
    @Value("${my.datasource.etc.max-connection}")
    private int maxConnection;
    @Value("${my.datasource.etc.timeout}")
    private Duration timeout;
    @Value("${my.datasource.etc.options}")
    private List<String> options;

    @Bean
    public MyDataSource myDataSource1() {
        return new MyDataSource(url, username, password, maxConnection, timeout, options);
    }

    // @Value 파라미터 주입
    @Bean
    public MyDataSource myDataSource2(
            @Value("${my.datasource.url}") String url,
            @Value("${my.datasource.username}") String username,
            @Value("${my.datasource.password}") String password,
            @Value("${my.datasource.etc.max-connection}") int maxConnection,
            @Value("${my.datasource.etc.timeout}") Duration timeout,
            @Value("${my.datasource.etc.options}") List<String> options) {

        return new MyDataSource(url, username, password, maxConnection, timeout, options);
    }

}
```

<br/>

 - `ExternalReadApplication`
```java
@Import(MyDataSourceValueConfig.class)
@SpringBootApplication(scanBasePackages = "hello.datasource")
public class ExternalReadApplication {..}
```

<br/>

# 외부설정 사용 - @ConfigurationProperties

스프링은 외부 설정의 묶음 정보를 객체로 변환하는 기능을 제공하는데, 이것을 타입 안전한 설정 속성(Type-safe Configuration Properties)이라고 한다.  

객체를 사용하면 타입을 사용할 수 있는데, 이때 실수로 잘못된 타입이 들어오는 문제를 방지할 수 있고, 객체를 통해서 활용할 수 있는 부분들이 많아진다.  

 - `MyDataSourcePropertiesV1`
    - 외부 설정을 주입받을 객체를 생성한다. 그리고 각 필드를 외부 설정의 키 값에 맞추어 준비한다. @ConfigurationProperties 어노테이션을 정의하면, 외부 설정을 주입받는 객체로 활용된다.
    - 기본 주입 방식은 자바빈 프로퍼티 방식으로 Getter와 Setter가 필요하다.
    - 스프링은 properties 파일의 케밥 케이스를 자바에서 낙타 표기법으로 자동으로 변환해준다.
```java
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Data
@ConfigurationProperties("my.datasource")
public class MyDataSourcePropertiesV1 {

    private String url;
    private String username;
    private String password;
    private Etc etc;

    @Data
    public static class Etc {
        private int maxConnection;
        private Duration timeout;
        private List<String> options = new ArrayList<>();
    }

}
```

<br/>

 - `MyDataSourceConfigV1`
    - @EnableConfigurationProperties 어노테이션에 사용할 @ConfigurationProperties를 지정해준다. 이렇게 하면 해당 클래스는 스프링 빈으로 등록되고, 필요한 곳에서 주입받아서 사용할 수 있다.
    - @EnableConfigurationProperties로 낮개의 외부설정 클래스를 빈으로 등록하는 방식 대신에, @ConfigurationPropertiesScan으로 범위를 지정할 수도 있다.
```java
@Slf4j
@EnableConfigurationProperties(MyDataSourcePropertiesV1.class)
public class MyDataSourceConfigV1 {

    private final MyDataSourcePropertiesV1 properties;

    public MyDataSourceConfigV1(MyDataSourcePropertiesV1 properties) {
        this.properties = properties;
    }

    @Bean
    public MyDataSource dataSource() {
        return new MyDataSource(
                properties.getUrl(),
                properties.getUsername(),
                properties.getPassword(),
                properties.getEtc().getMaxConnection(),
                properties.getEtc().getTimeout(),
                properties.getEtc().getOptions());
    }
}
```

<br/>

 - `ExternalReadApplication`
```java
@Import(MyDataSourceConfigV1.class)
@SpringBootApplication(scanBasePackages = "hello.datasource")
public class ExternalReadApplication {..}
```

<br/>


## 외부설정 사용 - @ConfigurationProperties 생성자

@ConfigurationProperties는 기본적으로 자바 빈 규약을 사용하여 Getter와 Setter 메서드가 필요하다. 하지만, Setter를 가지고 있으면 누군가 실수로 값을 변경하는 문제가 발생할 수 있다.  

외부 설정 값은 초기에만 설정되고, 이후에는 변경되서는 안된다. 이러한 경우 Setter 대신에 생성자를 사용하는 방식으로 중간에 데이터를 변경하는 실수를 방지할 수 있다.  

@ConfigurationProperties는 Getter, Setter를 사용하는 자바빈 프로퍼티 방식이 아니라 생성자를 통해서 객체를 만드는 기능도 지원한다.  

<br/>

 - `MyDataSourcePropertiesV2`
    - @DefaultValue 어노테이션은 해당 값을 찾을 수 없는 경우 기본값을 지정할 수 있다.
    - 스프링 부트 3.0 이전에는 생성자 바인딩 시에 @ConstructorBinding 애노테이션을 필수로 사용해야 했지만, 3.0 부터는 생성자가 하나일 때는 생략할 수 있게 되었다. 만약, 생성자가 둘 이상인 경우에는 사용할 생성자에 @ConstructorBinding 어노테이션을 적용해야 한다.
```java
import lombok.Data;
import lombok.Getter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.ConstructorBinding;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Getter
@ConfigurationProperties("my.datasource")
public class MyDataSourcePropertiesV2 {

    private String url;
    private String username;
    private String password;
    private Etc etc;

    public MyDataSourcePropertiesV2(String url, String username, String password, @DefaultValue Etc etc) {
        this.url = url;
        this.username = username;
        this.password = password;
        this.etc = etc;
    }

    @Getter
    public static class Etc {
        private int maxConnection;
        private Duration timeout;
        private List<String> options;

        public Etc(int maxConnection, Duration timeout, @DefaultValue("DEFAULT") List<String> options) {
            this.maxConnection = maxConnection;
            this.timeout = timeout;
            this.options = options;
        }
    }

}
```

<br/>

 - `MyDataSourceConfigV2`
```java
@Slf4j
@EnableConfigurationProperties(MyDataSourcePropertiesV2.class)
public class MyDataSourceConfigV2 {

    private final MyDataSourcePropertiesV2 properties;

    public MyDataSourceConfigV2(MyDataSourcePropertiesV2 properties) {
        this.properties = properties;
    }

    @Bean
    public MyDataSource dataSource() {
        return new MyDataSource(
                properties.getUrl(),
                properties.getUsername(),
                properties.getPassword(),
                properties.getEtc().getMaxConnection(),
                properties.getEtc().getTimeout(),
                properties.getEtc().getOptions());
    }
}
```

<br/>

 - `ExternalReadApplication`
```java
@Import(MyDataSourceConfigV2.class)
@SpringBootApplication(scanBasePackages = "hello.datasource")
public class ExternalReadApplication {..}
```

<br/>

## 외부설정 사용 - @ConfigurationProperties 검증

@ConfigurationProperties 를 통해서 숫자가 들어가야 하는 부분에 문자가 입력되는 문제와 같은 타입이 맞지 않는 데이터를 입력하는 문제는 예방할 수 있다. 하지만, 숫자의 범위라던가, 문자의 길이 같은 부분은 검증이 어렵다.  

예를 들어, 최대 커넥션 갯수는 1 ~ 999 범위를 가져야하는데 0이 주입되면 문제가 발생할 수 있다. 그 외에도 이메일을 외부 설정에 입력했는데, 이메일 형식이 맞지 않는 경우가 있을 수 있다.  

이러한 경우 개발자가 직접 하나하나 검증 코드를 작성해도 되지만, 자바에서는 자바 빈 검증기라는 훌륭한 표준 검증기를 제공한다. @ConfigurationProperties는 자바 객체로 스프링이 자바 빈 검증기를 사용할 수 있도록 지원하고 있다.  

<br/>

 - `build.gradle`
    - 자바 빈 검증기를 사용하기 위해서는 'spring-boot-starter-validation' 의존성이 필요하다.
```gradle
implementation 'org.springframework.boot:spring-boot-starter-validation'
```

<br/>

 - `MyDataSourcePropertiesV3`
    - @NotEmpty url , username , password 는 항상 값이 있어야 한다. 필수 값이 된다.
    - @Min(1) @Max(999) maxConnection : 최소 1 , 최대 999 의 값을 허용한다.
    - @DurationMin(seconds = 1) @DurationMax(seconds = 60) : 최소 1, 최대 60초를 허용한다.
    - ※ 패키지 이름에 jakarta.validation 으로 시작하는 것은 자바 표준 검증기에서 지원하는 기능이다.
    - ※ 패키지 이름에 org.hibernate.validator 로 시작하는 것은 자바 표준 검증기에서 아직 표준화 된 기능은 아니고, 하이버네이트 검증기라는 표준 검증기의 구현체에서 직접 제공하는 기능이다. 대부분 하이버네이트 검증기를 많이사용하므로 문제가 되지는 않는다.
```java
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import org.hibernate.validator.constraints.time.DurationMax;
import org.hibernate.validator.constraints.time.DurationMin;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;
import java.util.List;

@Getter
@ConfigurationProperties("my.datasource")
@Validated
public class MyDataSourcePropertiesV3 {

    @NotEmpty
    private String url;
    @NotEmpty
    private String user;
        this.etc = etc;name;
    @NotEmpty
    private String password;
    private Etc etc;

    public MyDataSourcePropertiesV3(String url, String username, String password, Etc etc) {
        this.url = url;
        this.username = username;
        this.password = password
    }

    @Getter
    public static class Etc {
        @Min(1)
        @Max(999)
        private int maxConnection;
        @DurationMin(seconds = 1)
        @DurationMax(seconds = 60)
        private Duration timeout;
        private List<String> options;

        public Etc(int maxConnection, Duration timeout, @DefaultValue("DEFAULT") List<String> options) {
            this.maxConnection = maxConnection;
            this.timeout = timeout;
            this.options = options;
        }
    }

}
```

<br/>

 - `MyDataSourceConfigV3`
```java
@Slf4j
@EnableConfigurationProperties(MyDataSourcePropertiesV3.class)
public class MyDataSourceConfigV3 {

    private final MyDataSourcePropertiesV3 properties;

    public MyDataSourceConfigV3(MyDataSourcePropertiesV3 properties) {
        this.properties = properties;
    }

    @Bean
    public MyDataSource dataSource() {
        return new MyDataSource(
                properties.getUrl(),
                properties.getUsername(),
                properties.getPassword(),
                properties.getEtc().getMaxConnection(),
                properties.getEtc().getTimeout(),
                properties.getEtc().getOptions());
    }
}
```

<br/>

 - `ExternalReadApplication`
```java
@Import(MyDataSourceConfigV3.class)
@SpringBootApplication(scanBasePackages = "hello.datasource")
public class ExternalReadApplication {..}
```

<br/>

 - `정리`
    - ConfigurationProperties 덕분에 타입 안전하고, 또 매우 편리하게 외부 설정을 사용할 수 있다. 그리고 검증기 덕분에 쉽고 편리하게 설정 정보를 검증할 수 있다.
    - 외부 설정을 객체로 편리하게 변환해서 사용할 수 있다.
    - 외부 설정의 계층을 객체로 편리하게 표현할 수 있다.
    - 외부 설정을 타입 안전하게 사용할 수 있다.
    - 검증기를 적용할 수 있다.

