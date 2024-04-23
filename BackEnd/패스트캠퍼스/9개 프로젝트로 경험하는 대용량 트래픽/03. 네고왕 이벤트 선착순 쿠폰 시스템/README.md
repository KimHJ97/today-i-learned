# 네고왕 이벤트 선착순 쿠폰 시스템

 - 깃허브 주소: https://github.com/prod-j/coupon-version-management

<br/>

## 요구 사항

 - 이벤트 기간내에(ex 2023-11-03일 오후 1시 ~ 2023-11-04일 오후 1시) 발급이 가능합니다.
 - 선착순 이벤트는 유저당 1번의 쿠폰 발급만 가능합니다.
 - 선착순 쿠폰의 최대 쿠폰 발급 수량을 설정할 수 있어야합니다.

<br/>

### 쿠폰 발급 기능

 - 쿠폰 발급 기능
    - 쿠폰 발급 기간 검증
    - 쿠폰 발급 수량 검증
        - 쿠폰 전체 발급 수량
        - 중복 발급 요청 검증
    - 쿠폰 발급
        - 쿠폰 발급 수량 증가
        - 쿠폰 발급 기록 저장
            - 쿠폰 ID
            - 유저 ID

<br/>

## 사용 기술 스택

 - 실습 환경
    - JDK 17
    - Spring Boot 3.x
    - IDE: ItelliJ
    - DBMS: DataGrip
    - Docker
 - 기술 분류(개발)
    - Spring Data JPA & QueryDSL
    - Spring Data Redis
    - Spring Actuator & Promethous & Grafana
 - 기술 분류(데이터)
    - MySQL 8
    - Redis 7
    - H2
 - 성능 테스트
    - Locust
