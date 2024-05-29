# TestContainers

TestContainers는 테스트 자동화를 위해 도커 컨테이너를 활용하는 라이브러리입니다. Java 애플리케이션의 통합 테스트를 더 쉽게 설정하고 실행할 수 있도록 도와줍니다. TestContainers를 사용하면 데이터베이스, 메시지 브로커, 웹 브라우저와 같은 종속성을 도커 컨테이너로 실행하여 일관된 테스트 환경을 보장할 수 있습니다.  

 - 테스트를 위해 필요한 모든 종속성을 도커 컨테이너로 실행할 수 있습니다. 데이터베이스, 메시지 큐, 브라우저 등 다양한 서비스를 포함합니다.
 - 컨테이너를 재사용하여 테스트 실행 시간을 줄이고 자원을 효율적으로 사용할 수 있습니다.
 - TestContainers는 주요 테스트 프레임워크와 쉽게 통합됩니다. JUnit과 Spock과의 원활한 통합을 지원합니다.
 - 다양한 서비스와의 통합을 위한 모듈을 제공합니다. 예를 들어, PostgreSQL, MySQL, Kafka, RabbitMQ, Selenium 등 여러 모듈을 지원합니다.
 - 컨테이너 간의 네트워크 설정을 쉽게 구성하여 복잡한 테스트 시나리오를 설정할 수 있습니다.

```java
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;

import static org.junit.jupiter.api.Assertions.assertEquals;

@Testcontainers
public class SimplePostgreSQLTest {

    @Container
    public PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:latest")
            .withDatabaseName("test")
            .withUsername("user")
            .withPassword("password");

    @Test
    public void testSimple() throws Exception {
        Connection conn = DriverManager.getConnection(postgres.getJdbcUrl(), 
                                                      postgres.getUsername(), 
                                                      postgres.getPassword());

        ResultSet resultSet = conn.createStatement().executeQuery("SELECT 1");
        resultSet.next();
        int result = resultSet.getInt(1);
        assertEquals(1, result);
    }
}

```
<br/>

## DB 테스트 코드 작성시

Spring JPA 환경에서 DB 작업에 대해 테스트 코드를 작성할 때 크게 4가지로 DB 환경을 구성할 수 있다.  

 - 1. 운영환경과 유사한 스펙의 DB(개발 환경 DB) 사용하기 
 - 2. 인메모리 DB(ex H2) 사용하기  
 - 3. Docker 이용하기 
 - 4. TestContainers를 이용하기
 - TestContainers는 운영환경과 유사한 DB 스펙으로 독립적인 환경에서 테스트 코드를 작성하여 테스트가 가능하다. 
 - TestContainers는 Java 언어만으로 docker container를 활용한 테스트 환경 구성 
 - 도커를 이용하여 테스트할 때 컨테이너를 직접 관리해야 하는 번거로움을 해결 해주며, 운영환경과 유사한 스펙으로 테스트 가능 
 - 즉, 테스트 코드가 실행 될 때 자동으로 도커 컨테이너를 실행하여 테스트 하고, 테스트가 끝나면 자동으로 컨테이너를 종료 및 정리

<br/>

## 예제 코드

 - `build.gradle`
```groovy
dependencies {
    // ..

	// testcontainers
	testImplementation 'org.testcontainers:spock:1.17.1'
	testImplementation 'org.testcontainers:mariadb:1.17.1'
}
```
<br/>

 - `AbstractIntegrationContainerBaseTest`
```groovy
import org.springframework.boot.test.context.SpringBootTest
import org.testcontainers.containers.GenericContainer
import spock.lang.Specification

@SpringBootTest
abstract class AbstractIntegrationContainerBaseTest extends Specification {

    static final GenericContainer MY_REDIS_CONTAINER

    static {
        MY_REDIS_CONTAINER = new GenericContainer<>("redis:6")
            .withExposedPorts(6379)

        MY_REDIS_CONTAINER.start()

        System.setProperty("spring.redis.host", MY_REDIS_CONTAINER.getHost())
        System.setProperty("spring.redis.port", MY_REDIS_CONTAINER.getMappedPort(6379).toString())
    }
}
```
<br/>

 - `PharmacyRepositoryTest`
  - 테스트 환경에서 하나의 컨테이너 DB가 생성되기 떄문에, 각 테스트 이후에 초기화를 해주어야 한다.
```groovy
import com.example.project.AbstractIntegrationContainerBaseTest
import com.example.project.pharmacy.entity.Pharmacy
import org.springframework.beans.factory.annotation.Autowired

class PharmacyRepositoryTest extends AbstractIntegrationContainerBaseTest {

    @Autowired
    private PharmacyRepository pharmacyRepository

    def setup() {
        pharmacyRepository.deleteAll()
    }

    def "PharmacyRepository save"() {
        given:
        String address = "서울 특별시 성북구 종암동"
        String name = "은혜 약국"
        double latitude = 36.11
        double longitude = 128.11

        def pharmacy = Pharmacy.builder()
                .pharmacyAddress(address)
                .pharmacyName(name)
                .latitude(latitude)
                .longitude(longitude)
                .build()

        when:
        def result = pharmacyRepository.save(pharmacy)

        then:
        result.getPharmacyAddress() == address
        result.getPharmacyName() == name
        result.getLatitude() == latitude
        result.getLongitude() == longitude
    }

    def "PharmacyRepository saveAll"() {
        given:
        String address = "서울 특별시 성북구 종암동"
        String name = "은혜 약국"
        double latitude = 36.11
        double longitude = 128.11

        def pharmacy = Pharmacy.builder()
                .pharmacyAddress(address)
                .pharmacyName(name)
                .latitude(latitude)
                .longitude(longitude)
                .build()

        when:
        pharmacyRepository.saveAll(Arrays.asList(pharmacy))
        def result = pharmacyRepository.findAll()

        then:
        result.size() == 1
    }
}
```
<br/>

 - `src/test/resources/application.yml`
```yml
spring:
  datasource:
    driver-class-name: org.testcontainers.jdbc.ContainerDatabaseDriver
    url: jdbc:tc:mariadb:10:///
  jpa:
    hibernate:
      ddl-auto: create
    show-sql: true

kakao:
  rest:
    api:
      key: ${KAKAO_REST_API_KEY}
```

<br/>

### 카카오 API 주소검색 테스트 코드

 - `KakaoAddressSearchServiceTest`
```groovy
import com.example.project.AbstractIntegrationContainerBaseTest
import org.springframework.beans.factory.annotation.Autowired

class KakaoAddressSearchServiceTest extends AbstractIntegrationContainerBaseTest {

    @Autowired
    private KakaoAddressSearchService kakaoAddressSearchService

    def "address 파라미터 값이 null이면, requestAddressSearch 메소드는 null을 리턴한다."() {
        given:
        String address = null

        when:
        def result = kakaoAddressSearchService.requestAddressSearch(address)

        then:
        result == null
    }

    def "주소값이 valid하다면, requestAddressSearch 메소드는 정상적으로 document를 반환한다."() {
        given:
        def address = "서울 성북구 종암로 10길"

        when:
        def result = kakaoAddressSearchService.requestAddressSearch(address)

        then:
        result.documentList.size() > 0
        result.metaDto.totalCount > 0
        result.documentList.get(0).addressName != null
    }
}
```

