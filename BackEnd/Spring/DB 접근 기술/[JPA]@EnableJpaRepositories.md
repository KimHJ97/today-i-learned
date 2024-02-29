# @EnableJpaRepositories 어노테이션

 - https://parkadd.tistory.com/106
 - https://velog.io/@ahnilhuman2/EnableJpaRepositories-%EC%82%AC%EC%9A%A9%EB%B2%95
 - https://yeonseo.github.io/posts/Data-JPA/

<br/>

## @EnableJpaRepositories

@EnableJpaRepositories는 스프링 프레임워크에서 JPA를 사용하기 위한 설정을 자동으로 처리해주는 애노테이션입니다. 이 애노테이션은 스프링 부트에서 자동으로 설정되므로, 보통 스프링 부트를 사용하는 경우에는 따로 설정할 필요가 없습니다.  

@EnableJpaRepositories는 JPA를 사용하는 데 필요한 여러 설정을 자동으로 처리해주기 때문에, 스프링에서 JPA를 사용할 때 매우 유용한 애노테이션입니다.  

 - __EntityManagerFactory 빈 등록__
    - EntityManagerFactory는 JPA를 사용하는 데 필요한 인터페이스로, 데이터베이스와 연결하는 역할을 합니다. @EnableJpaRepositories는 EntityManagerFactory를 빈으로 등록하여 사용할 수 있도록 해줍니다.
 - __TransactionManager 빈 등록__
    - JPA에서는 트랜잭션을 지원하기 위해 TransactionManager를 사용합니다. @EnableJpaRepositories는 TransactionManager를 빈으로 등록하여 사용할 수 있도록 해줍니다.
 - __JPA Repository 인터페이스 스캔__
    - @EnableJpaRepositories는 JPA Repository 인터페이스를 스캔하여 빈으로 등록할 수 있도록 해줍니다. 이렇게 등록된 빈은 @Autowired 애노테이션을 사용하여 주입할 수 있습니다.

<br/>

## 예제 코드

@EnableJpaRepositories는 JPA Repository들을 활성화하기 위한 애노테이션입니다.  
Spring에서는 @Configuration 클래스에서 @EnableJpaRepositories 애노테이션을 사용 해야합니다.  
 - SpringBoot 에서는 @EnableJpaRepositories가 자동설정이 돼서 생략해도 됩니다.

```java
@Configuration
@EnableJpaRepositories(basePackages = "com.example.repositories")
public class JpaConfig {
    // JPA 설정 및 관련 빈들을 정의할 수 있음
}
```

