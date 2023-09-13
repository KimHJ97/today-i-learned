# 초간단 이커머스 서비스 어드민 만들기

 - 템플릿 엔진(Thymeleaf) 간단 사용법
 - 데이터베이스 연동(JPA)

## 초간단 이커머스 어드민 구성

 - 강의 목표
    - 이커머스 운영에 필요한 기능 파악
    - 기본적인 CRUD 형태 구성
 - 배경
    - 이커머스 서비스를 운영을 목적으로 상품, 주문, 결제, 배송, 고객 등의 다양한 관리 기능 필요
    - 어디서든 운영자가 사용하기 위해서는 웹을 기반으로하는 이커머스 서비스 관리 도구 필요
 - 목표
    - 이커머스 도메인 관련 CRUD 구성
    - 도메인 분석에 맞춰 운영자에게 필요한 기능 제공
 - 주요 기능
    - 상품 관리: 상품 조회, 상품 등록, 상품 수정, 상품 삭제
    - 고객 관리: 고객 조회
    - 주문 관리: 주문 조회
 - 설계
    - 유스 케이스(Use Cases)
    - 시퀀스 다이어그램(Sequence Diagram)
    - 아키텍처(Architecture)
 - 시스템 구성도
    - 이커머스 어드민 서비스는 단일 서비스 구조
    - 단일 시스템으로 서비스 구성
    - 이커머스 데이터베이스와 연동
 - 기술 스택
    - 구현에 필요한 기술 구성
    - 구현 실습하기 위해서는 기술 선택 기준은 가장 범용적인 기술 사용
    - 학습 곡선이 낮도록 선택
    - 범용적인 Frontend 기술과 Backend 기술을 선정
 - 프론트엔드(Frontend)
    - 템플릿 엔진: Thymeleaf Template
        - Spring Boot에서 공식적으로 제공하는 템플릿 엔진
    - UI 템플릿: Bootstrap 4 + SB Admin2
        - Bootstrap 4: 오픈 소스, 범용적인 서비스 UI 템플릿
        - SB Admin2: 관리자 사이트에 필요한 컴포넌트와 템플릿 제공
    - 자바스크립트 라이브러리: jQuery 
        - 쉽게 사용 가능한 Javascript Library
 - 백엔드(Backend)
    - Language: Java 11
        - 범용적인 애플리케이션 개발 언어
    - Framework: Spring Boot 2.7.x
        - 범용적인 자바 애플리케이션 플랫폼
        - 톰캣 서버가 내장되어 별도 서버가 필요하지 않음
    - Database: MySQL 8.x
        - 범용적인 데이터 관리 솔루션

<br/>

## 초간단 이커머스 어드민 구현하기

 - application-local.yml
    - Automatic Restart: 클래스 패스의 변경이 있을 경우 자동으로 재시작
    - Live Reload: 정적 파일 수정시 새로 고침 없어도 적용
    - Property Defaults: 캐싱 기능을 중지
```
# 정적 파일 갱신 - properties
spring.devtools.livereload.enabled=true
spring.thymeleaf.cache = false

# 정적 파일 갱신 - yml
spring:
  devtools:
    livereload:
      enabled: true
  thymeleaf:
    cache: false
```

 - Thymeleaf 기본 문법
    - 'th:text': 기본적인 출력
    - 'th:each': 자바의 each 처럼 반복
    - 'th:if', 'th:unless': 주어진 조건에 부합하면 th:if 실행, 그렇지 않으면 th:unless
    - 'th:switch', 'th:case': 조건에 따라 처리
    - 'th:href': a태그처럼 링크를 처리하는 문법
    - 'th:checked': 체크박스 처리에 사용되는 checked 속성 변경
```HTML
<!-- th:text 코드 샘플 -->
<!-- 문자열 출력 -->
<span th:text="${message}"></span>
<!-- 문자열 결합 출력 -->
<span th:text="|${message} 추가 문자열|"></span>

<!-- th:each 코드 샘플 -->
<div th:each="productName: ${productNames}">
    <span th:text="${productName}"></span>
</div>

<!-- th:if 및 th:unless 코드 샘플 -->
<span th:if="${isMember}" th:text="회원"></span>
<span th:unless="${isExpired}" th:text="유효기간"></span>

<!-- th:switch 및 th:case 코드 샘플 -->
<div th:switch="${status.even}">
    <span th:case=true th:text="|${status.index}, ${productName} 짝수|"></span>
    <span th:case=false th:text="|${status.index}, ${productName} 홀수|"></span>
</div>

<!-- th:href 코드 샘플 -->
<!-- 내부 페이지 -->
<a th:href="@{/hello}">Hello Thymeleaf 내부페이지</a>
<!-- 직접 URL -->
<a th:href="@{http://www.google.co.kr}">구글 사이트</a>
<!-- 변수로 전달 전달 -->
<a th:href="@{${homePageUrl}}">쿠팡 사이트</a>
<!-- 파라미터 전달 -->
<a th:href="@{${subwayUrl}(menuItemIdx=1454)}">서브웨이 메뉴 사이트</a>

<!-- th:checked 코드 샘플 -->
<input type="radio" id="member" name="member-radio" th:checked="${isMember}" valu
e="member">
<label for="member">회원</label><br>
<input type="radio" id="nonmember" name="member-radio" th:checked="${!isMember}"
value="nonmember">
<label for="nonmember">비회원</label><br>
```

 - Thymeleaf 레이아웃 문법
    - 화면을 여러 맥락에 따라 나눌 수 있다. 그 중에서 반복되는 화면 영역을 별도로 분리하여 여러 다른 페이지에 적용할 수 있다.
        - 헤더, 푸터, 메뉴, 상단 검색창, 기타 공통 영역 등
    - 'th:replace': 'th:fragemet' 로 선언된 HTML 태그를 다른 HTML로 교체하는 것
    - 'th:block': 'layout:fragment' 속성에 선언된 이름의 내용을 가져와 채우는 것
    - 'th:fragment'
```HTML
<!-- 헤더 -->
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<div th:fragment="headerFragment">
    <h1>Header입니다.</h1>
    <hr>
</div>
</html>

<!-- 푸터 -->
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<div th:fragment="footerFragment">
    <hr>
    <h1>Footer입니다.</h1>
</div>
</html>

<!-- 공통 영역을 포함한 레이아웃 -->
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org" xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<head>
    <meta charset="UTF-8">
    <title>Thymeleaf 레이아웃 샘플</title>
</head>
<body>
    <!-- 헤더 적용 -->
    <div th:replace="fragments/header::headerFragment"></div>

    <!-- 컨텐츠 영역 -->
    <div layout:fragment="content"></div>

    <!-- 푸터 적용 -->
    <div th:replace="fragments/footer::footerFragment"></div>
</body>
</html>

<!-- 컨텐츠를 만들면서 공통 영역 적용 -->
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org" xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout" layout:decorate="~{layouts/hello-layout-after}">

<div layout:fragment="content">
    Thymeleaf 레이아웃용 컨텐츠 입니다. <br>
    공통으로 사용되는 헤더, 푸터, 메뉴 등을 분리 가능합니다. <br>
</div>

</html>
```

<br/>

## 초간단 이커머스 어드민 데이터베이스 연동

 - 자바에서 데이터베이스 직접 연동
    - 데이터베이스 드라이버 설치(JDBC)
    - 문자열로 쿼리 작성
    - 데이터베이스에 문자열 쿼리 전송
    - 쿼리 결과를 자바 객체로 변환
 - 직접 연동시 문제점
    - 데이터베이스에 특화된 쿼리 작성
    - 쿼리 문자열 연결의 보안 이슈 - SQL Injection
    - 반복적인 Object - Data 변환 작업
    - 반복적인 CRUD 작업
    - 객체와 데이터베이스 간의 차이
 - 문제점을 해결하기 위한 자바 기술
    - SQL Mapper
        - iBatis, MyBatis
    - ORM (Object Relation Mapping)
        - JPA(Hibernate)
 - JPA(Java Persistence API)
    - 자바 ORM 기술의 표준 명세, 자바 구현체 - Hibernate
    - 장점
        - 객체 지향 프로그래밍
        - 특정 데이터베이스에 특화되지 않음
        - 반복적인 작업을 공통화 -> 생산성 향상
    - 단점
        - SQL과 달리 별도의 학습 곡선
        - 복잡한 쿼리를 처리하기 어려움 (통계)
        - 성능 저하
 - JPA 특징
    - 엔티티: 테이브과 매핑
    - 엔티티 매니저 팩토리: 엔티티 매니저 관리
    - 엔티티 매니저: 엔티티 관리
        - 엔티티에 대한 CRUD
    - 영속성 컨텍스트
        - 1차 캐시
        - 동일성 보장
        - 쓰기 지연
        - 변경 감지
 - JPA에서 쿼리 사용
    - JPQL(Java Persistence Query Language)
        - 객체 지향 쿼리 언어
    - Creteria
        - JPQL을 자바 코드로 작성하도록 도와주는 빌더 클래스 API
        - Criteria의 가장 큰 단점은 너무 코드가 복잡하고 어렵다.
        - 어떤 JPQL이 생성될지 파악하기 쉽지 않다.
    - QueryDSL
        - 쉽고 간결하고 모양도 쿼리와 비슷하게 개발할 수 있는 프로젝트
        - 데이터를 조회하는데 특화, 학습 곡선이 있다.
 - 요약
    - 데이터베이스 연동: JPA
    - JPA를 쉽게 사용할 수 있도록: Spring Data JPA
    - 쿼리를 좀 더 편하게: QueryDSL
 - Spring Boot에서 DB 설정
    - 데이터베이스 연결 설정
    - JPA 설정
        - Database Dialect(사투리, 방언) 설정
        - Hibernate 설정
 - DB 연동 방법
    - 데이터베이스 테이블 생성
    - 엔티티 생성
    - 엔티티의 CRUD를 지원하는 Repository 구현
    - Service나 Controller에서 Repository를 사용
 - DB 연동에 필요한 어노테이션
    - 엔티티 관련 어노테이션
        - @Entity: 엔티티 선언
        - @Table: 엔티티와 매핑할 테이블 매핑
        - @Id: 기본키 지정
        - @GeneratedValue: 키 값을 생성하는 전략
        - @Column: 필드와 DB 컬럼 매핑
        - @Enumerated: 자바의 Enum 타입과 매핑
        - @Temporal: 날짜 매핑
        - @CreationTimestamp: 입력시 날짜 자동 저장
        - @UpdateTimestamp: 수정시 날짜 자동 저장
 - DB 연동에 사용하는 Repository
    - JPA에서 제공하는 Repository 인터페이스를 상속
    - 일반 쿼리: CrudRepository
    - 특화 작업: JpaRepository, PagingAndSortingRepository
 - Spring Data JPA에서 쿼리하는 방법
    - @Query 어노테이션 사용
        - JPQL 사용
        - Native Query 사용
    - Query Method 기법 사용
    - Creteria
    - 옵셔널 방법
        - QueryDSL

<br/>

## 초간단 이커머스 어드민 실습

 - 프로젝트 만들기
    - Spring Initializr: https://start.spring.io/
```
 - Project: Gradle - Groovy
 - Language: Java
 - Spring Boot: 2.7.6
 - Project Metadata
    - Group: com.fastcampus.ecommerce
    - Artifact: hello-ecommerce-admin
    - Name: hello-ecommerce-admin
    - Description: Demo project for Srping Boot
    - Package name: com.fastcampus.hello-ecommerce-admin
    - Packaging: Jar
    - Java: 11
 - Dependencies
    - Spring Boot DevTools
    - Lombok
    - Spring Configuration Processor
    - Thymeleaf
    - Spring Web
    - Spring Data JPA
    - MySQL Driver
```

<br/>

 - 기본 어드민 레이아웃 화면 만들기
    - Bootstrap 템플릿을 이용한다.
    - SB Admin 2: https://startbootstrap.com/theme/sb-admin-2

<br/>

 - CRUD 예제
    - 엔티티 클래스
    - Repository 클래스
    - Service 클래스
    - Controller 클래스
        - Service를 통해 엔티티 클래스를 조회하고, 화면 단에서 사용하도록 DTO로 변환한다.
```Java
// Customer 엔티티
@Entity
@Table(name = "customers", schema = "ecommerce")
@Getter
@Setter
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long customerId;
    @Column(name = "name")
    private String customerName;
    @Column(name = "age")
    private int age;
    @Column(name = "phone_number")
    private String phoneNumber;
    @Column(name = "address")
    private String address;
    @Enumerated(EnumType.STRING)
    @Column(name = "grade")
    private CustomerGrade grade;
    @Column(name = "is_deleted")
    private boolean isDeleted;
    @CreatedDate
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
    @Column(name = "created_by")
    private String createdBy;
    @LastModifiedDate
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
    @Column(name = "updated_by")
    private String updatedBy;
}

// Repository
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findTop100ByIsDeletedIsFalse();
}

// Service
@Service
@Transactional
@AllArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;

    public List<Customer> findTop100ByActiveCustomer() {
        return customerRepository.findTop100ByIsDeletedIsFalse();
    }

    public Optional<Customer> findById(Long customerId) {
        return customerRepository.findById(customerId);
    }
}

// Controller
@Slf4j
@Controller
@AllArgsConstructor
public class CustomerController {
    private final CustomerService customerService;
    private static final String ATTRIBUTE_KEY_CUSTOMERS = "customers";
    private static final String MENU_KEY = "customers";

    @GetMapping(value = {"/customers", "/customers/"})
    public String index(Model model) {
        List<Customer> customers = customerService.findTop100ByActiveCustomer();
        List<CustomerDTO> customerDTOs = customers.stream()
                .map(customer -> CustomerDTO.of(
                        customer.getCustomerId(),
                        customer.getCustomerName(),
                        customer.getPhoneNumber(),
                        customer.getAddress(),
                        customer.getGrade(),
                        customer.getCreatedAt(),
                        customer.getUpdatedAt()
                ))
                .collect(Collectors.toList());
        model.addAttribute(ATTRIBUTE_KEY_CUSTOMERS, customerDTOs);
        model.addAttribute("menuId", MENU_KEY);
        return "/customers/customers";
    }

    @GetMapping("/customers/customer-detail")
    public String detail(@RequestParam Long customerId, Model model) {
        Customer customer = customerService.findById(customerId).orElseThrow(() -> new NotFoundCustomerException("고객 정보를 찾을 수 없습니다." + customerId));
        model.addAttribute("customer", customer);
        model.addAttribute("menuId", MENU_KEY);
        return "/customers/customer-detail";
    }
}
```

