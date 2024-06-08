# JPA 기초 개념

 - JPA란 자바 어플리케이션에서 관계형 데이터베이스 사용하는 방식을 정의한 인터페이스
 - Spring Data JPA는 Spring에서 제공하는 모듈 중 하나로, 개발자가 JPA를 더  쉽고 편하게 사용할 수 있도록 도와준다. 
 - JPA의 모든 데이터 변경은 트랜잭션 안에서 실행된다.

<br/>

## 영속성 컨텍스트

영속성 컨텍스트는 entity를 저장하고 관리하는 저장소이며, 어플리케이션과 데이터베이스 사이에 entity를 보관하는 가상의 데이터베이스 같은 역할을 한다.  

 - __1차 캐시__
    - 영속성 컨텍스트 내부에는 1차 캐시를 가지고 있다.
    - 한 트랜잭션 내에 1차 캐시에 이미 있는 값을 조회하는 경우 DB를 조회하지 않고 1차 캐시에 있는 내용을 그대로 가져온다.
    - 단, 1차 캐시는 애플리케이션 전체 공유가 아닌 한 트랜잭션 내에서만 공유한다.
 - __쓰기 지연 SQL 저장소__
    - persist() 메서드 수행 시 DB에 SQL을 바로 수행하지 않고, 1차 캐시에 넣고 쓰기 지연 SQL 저장소에 쿼리를 만들어 저장한다.
    - 이후, Commit 하는 순간 Flush 되면서 DB에 반영된다.
    - Flush란 영속성 컨텍스트의 변경 내용을 DB에 반영하며, 1차 캐시를 지우지는 않는다.
 - __더티 체킹__
    - 더티 체킹은 엔티티 상태 변경 검사를 의미한다.
    - JPA에서 트랜잭션이 끝나는 시점에 변화가 있는 모든 엔티티 객체를 데이터베이스에 자동으로 반영해준다.
    - JPA는 Commit 하는 순간 내부적으로 Flush가 호출되고, 이때 엔티티와 스냅샷을 비교한다.
    - 1차 캐시에는 처음 들어온 상태인 엔티티 스냅샷을 넣어두고, Commit 하는 순간 변경된 값이 있는지 비교하여 변경된 값이 있으면 UPDATE 쿼리를 쓰기 지연 SQL에 넣어둔다.

<br/>

## JPA Auditing

JPA (Java Persistence API) Auditing은 데이터베이스 엔터티(Entity)에서 생성 및 수정과 같은 변경 사항을 자동으로 추적하고 기록하는 기능을 제공합니다. 이를 통해 애플리케이션에서 엔터티가 언제 생성되었고, 누가 생성했는지, 언제 수정되었고, 누가 수정했는지 등의 정보를 자동으로 관리할 수 있습니다. JPA Auditing은 스프링 데이터 JPA(Spring Data JPA)에서 쉽게 사용할 수 있도록 지원됩니다.  

JPA Auditing 기능은 데이터베이스 엔터티의 생성 및 수정 정보를 자동으로 기록하는 강력한 도구입니다. 이를 통해 개발자는 코드에서 수작업으로 타임스탬프를 관리할 필요 없이, 엔터티의 변경 이력을 쉽게 추적할 수 있습니다. JPA Auditing을 활성화하려면 엔터티 클래스에 어노테이션을 추가하고, AuditorAware를 구현하여 현재 사용자를 제공하는 설정을 해야 합니다.  

 - 생성 시각 (Created Date): 엔터티가 처음 생성된 날짜와 시간을 자동으로 기록합니다.
 - 수정 시각 (Last Modified Date): 엔터티가 마지막으로 수정된 날짜와 시간을 자동으로 기록합니다.
 - 생성자 (Created By): 엔터티를 처음 생성한 사용자의 정보를 기록합니다.
 - 수정자 (Last Modified By): 엔터티를 마지막으로 수정한 사용자의 정보를 기록합니다.

<br/>

 - `JpaConfig`
   - JpaAuditing 기능을 활성화한다.
```java
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
```
<br/>

 - `AuditorAwareImpl`
   - 사용자 정보를 제공하기 위해 AuditorAware 인터페이스를 구현한다.
   - Spring Security와 통합하여 현재 인증된 사용자 정보를 제공한다.
```java
public class AuditorAwareImpl implements AuditorAware<Long> {

   @Override
   public Optional<Long> getCurrentAuditor() {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

      if(null == authentication || !authentication.isAuthenticated()) {
         return null;
      }

      //사용자 환경에 맞게 로그인한 사용자의 정보를 불러온다. 
      CustomUserDetails userDetails = (CustomUserDetails)authentication.getPrincipal();

      return Optional.of(userDetails.getId());
   }

}
```
<br/>

 - `BaseTimeEntity`
```java
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.Column;
import javax.persistence.EntityListeners;
import javax.persistence.MappedSuperclass;
import java.time.LocalDateTime;

@Getter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseTimeEntity {

    //등록일
    @CreatedDate
    @Column(updatable = false)
    protected LocalDateTime createDate;

    //수정일
    @LastModifiedDate
    protected LocalDateTime lastModifedDate;

    //등록자
    @CreatedBy
    @Column(updatable = false)
    protected Long createBy;

    //수정자
    @LastModifiedBy
    protected Long lastModifedBy;

}
```
<br/>

 - `SampleBoard`
   - BaseTimeEntity를 상속받으면, 자동으로 등록 및 수정시 시간 정보와 사용자 정보가 등록된다.
```java
@Getter
@Builder
@NoArgsConstructor
@Table(name="board")
@Entity
public class SampleBoard extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String content;

}
```
<br/>

 - ``
```groovy
class PharmacyRepositoryTest extends AbstractIntegrationContainerBaseTest {
    
    def "BaseTimeEntity 등록"() {
        given:
        LocalDateTime now = LocalDateTime.now()
        String address = "서울 특별시 성북구 종암동"
        String name = "은혜 약국"

        def pharmacy = Pharmacy.builder()
                .pharmacyAddress(address)
                .pharmacyName(name)
                .build()

        when:
        pharmacyRepository.save(pharmacy)
        def result = pharmacyRepository.findAll()

        then:
        result.get(0).getCreatedDate().isAfter(now)
        result.get(0).getModifiedDate().isAfter(now)
    }

}
```

