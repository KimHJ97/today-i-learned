# 초간단 이커머스 서비스 만들기


## 초간단 이커머스 서비스 구성

 - 목표
    - 자신이 원하는 상품을 찾을 수 있도록 검색 기반의 서비스 제공
    - 자신이 원하는 상품을 탐색할 수 있도록 카테고리와 기획전 페이지 제공
    - 장바구니, 주문, 결제, 내 구매 내역 정보 제공
 - 배경
    - 원하는 상품을 찾아 구매할 수 있도록 검색 기반으로 서비스 제공
    - 카테고리나 기획전으로 상품을 분류하여 고객이 탐색할 수 있는 서비스 제공
    - 장바구니, 주문, 결제 제공
    - 구매한 내역을 확인할 수 있는 "내 구매 페이지" 등의 기능 제공
 - 주요 기능
    - 상품 검색
    - 카테고리 및 기획전 상품 목록
    - 상품 상세 페이지
    - 장바구니 페이지
    - 주문
    - 결제
    - 마이페이지
 - 설계
    - 유스 케이스
    - 시퀀스 다이어그램
    - 아키텍처
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
    - UI 템플릿: Bootstrap 4
        - Bootstrap 4: 오픈 소스, 범용적인 서비스 UI 템플릿
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

## 초간단 이커머스 서비스 만들기

 - 사이트 맵
    - 홈
    - 카테고리 상품 목록
    - 검색 결과 목록
    - 상품 상세
    - 장바구니
    - 체크아웃
    - 구매 완료
    - 내 구매 목록
 - 부트스트랩
    - 화면 레이아웃
        - https://getbootstrap.com/docs/5.0/layout/grid/
        - 그리드를 이용하여 레이아웃을 잡을 수 있다.
    - 상단 헤더
        - https://getbootstrap.com/docs/5.0/components/navbar/
        - 네비게이션 바 컴포넌트를 이용하여 헤더를 구성할 수 있다.
    - 입력 Form 구성
        - https://getbootstrap.com/docs/5.0/forms/form-control/
        - Form Control를 이용하여 입력 폼을 구성할 수 있다.
    - 다양한 버튼
        - https://getbootstrap.com/docs/5.0/components/buttons/
    - 상품 카드
        - https://getbootstrap.com/docs/5.0/components/card/
        - 카드 컴포넌트를 이용하여 상품 카드를 구성할 수 있다.
    - 목록 테이블
        - https://getbootstrap.com/docs/5.2/content/tables/

<br/>

### 소스 코드 구성

 - 레이아웃
```HTML
<!DOCTYPE html>
<html lagn="ko" xmlns:th="http://www.thymeleaf.org" xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<head>
    <meta charset="UTF-8" />
    <title>레이아웃</title>
    <meta name="viewport" content="width=device-width, maximum-scale=1.0, minimum-scale=1, user-scalable=yes,initial-scale=1.0" />

    <!-- CSS -->
    <link rel="stylesheet" href="/css/bootstrap.min.css">
    <link rel="stylesheet" href="/css/common/layout.css">
    <link rel="stylesheet" href="/css/common/base.css">

    <!-- Bootstrap core JavaScript-->
    <script src="/vendor/jquery/jquery.min.js"></script>
    <script src="/js/bootstrap.bundle.min.js" ></script>
    <script src="/js/layout/base.js"></script>

    <!-- css -->
    <th:block layout:fragment="css"></th:block>

    <!-- script -->
    <th:block layout:fragment="script"></th:block>
</head>
<body>
    <!-- header fragment 사용 -->
    <div th:replace="fragments/header::header"></div>

    <!-- content fragment 사용 -->
    <div layout:fragment="content" class="content">

    </div>

    <!-- footer fragment 사용 -->
    <div th:replace="fragments/footer::footer"></div>
</body>
</html>
```

 - 헤더 & 푸터
```HTML
<!-- 헤더 -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/extras/spring-security">

<div th:fragment="header">

    <!-- Top Area -->
    <nav class="navbar navbar-expand-lg bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">Simple eCommerce Sample</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <a class="nav-link" th:classappend="${categoryId == null ? 'active' : ''}" href="/">홈</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:classappend="${categoryId == 100 ? 'active' : ''}" href="/category/products?categoryId=100">전자기기</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:classappend="${categoryId == 200 ? 'active' : ''}"href="/category/products?categoryId=200">장난감</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:classappend="${categoryId == 300 ? 'active' : ''}"href="/category/products?categoryId=300">애완용품</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" th:classappend="${categoryId == 400 ? 'active' : ''}"href="/category/products?categoryId=400">스포츠</a>
                    </li>
                </ul>

                <!-- Search Area -->
                <form class="d-flex" role="search" method="post" action="/search">
                    <input class="form-control" type="search" placeholder="찾고 싶은 상품을 입력하세요" aria-label="Search" size="40" name="keyword">
                    <button class="btn btn-outline-success search-btn" type="submit">검색</button>
                </form>

                <button type="button" class="btn btn-info bnt-cart-view">
                    <span class="badge badge-light" th:text="${countCartProduct} ?: '0'"></span>
                </button>

                <!-- 로그인/로그아웃 Area -->
                <ul class="navbar-nav login-logout-area">
                    <li class="nav-item">
                        <a sec:authorize="isAnonymous()" class="nav-link active" aria-current="page" href="/customer/login">로그인</a>
                        <a sec:authorize="isAuthenticated()" class="nav-link active" aria-current="page" href="/logout">로그아웃</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</div>
</html>

<!-- 푸터 -->
<!DOCTYPE html>
<html lagn="ko" xmlns:th="http://www.thymeleaf.org">

<div th:fragment="footer">

    <!-- Footer 영역 -->
    <footer class="footer">
        <span class="text-muted align-middle">Simple eCommerce Sample Site</span>
    </footer>

</div>
</html>
```

<br/>

## 초간단 이커머스 어드민 데이터베이스 연동

 - 컨트롤러
    - 요청을 자바 객체로 매핑
    - 입력 유효성 검사, 입력 모델로 변환
    - 권한 검사
    - 처리 결과를 응답
 - 서비스
    - 문제를 해결하는 애플리케이션 영역
 - 레포지토리
    - 데이터 저장소와 상호 작용 영역
 - DTO, Domain, Entity
    - DTO: 데이터 전달
    - Entity: 테이블 매핑을 위한 객체
    - Domain: 문제 해결을 위한 핵심 코어 객체
    - Entity를 외부에 노출하지 말자, Entity만 쓰는 방식은 사용하지 말자
    - 각 레이어별 이동시 별도 DTO를 사용한다. (의존성이 약해지지만 구현이 많아진다.)
 - JPQL 쿼리와 Native 쿼리
    - Query Method는 단순한 이점이 있지만 조건이 많으면 가독성이 떨어진다.
    - @Query 어노테이션을 이용한 JPQL 쿼리와 Native 쿼리가 지원된다.
```Java
// JPQL
@Query("SELECT p FROM Product p WHERE p.id = :productId")
List<Product> findAllByJPQL(@Param("productId") Long productId);

// Native SQL
@Query(
    value = "SELECT * FROM recommend_products AS p WHERE p.id = :productId",
    nativeQuery = true
)
List<Product> findAllByNativeSQL(@Param("productId") Long productId);
```
 - 요청에 대한 응답
    - 요청 결과
        - 웹 페이지
        - 데이터 포맷(JSON 데이터)
    - CDN(컨텐츠 전송 네트워크)
        - 정적 파일(JS, CSS)
        - 이미지
        - 동영상
