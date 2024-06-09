# 약국 길찾기 서비스

 - Handlebars를 이용한 View 구성
 - Docker 및 Docker-Compose를 이용한 클라우드 서비스 배포
 - Spring Retry를 이용한 재처리 구현
 - Base62를 이용한 Shorten URL
 - Redis를 이용한 성능 최적화

<br/>

## 참고 자료

 - 깃허브 주소: https://github.com/topics/fastcampus-pharmacy-recommendation
 - 깃허브 블로그: https://wonyong-jang.github.io/

<br/>

## 요구사항 분석

 - 약국 찾기 서비스 요구사항
    - 주소 정보를 입력하여 요청하면 위치 기준에서 가까운 약국 3곳을 추출한다.
    - 주소는 도로명 주소 또는 지번을 입력하여 요청 받는다.
        - 정확한 주소를 입력 받기 위해 Kakao 우편번호 서비스를 사용한다.
        - 주소는 정확한 상세 주소(동, 호수)를 제외한 주소 정보를 이용하여 추천한다.
    - 입력받은 주소를 위도, 경도로 변환하여 기존 약국 데이터와 비교 및 가까운 약국을 찾는다.
        - 지구는 평면이 아니기 때문에, 구면에서 두 점 사이의 최단 거리 구하는 공식이 필요하다.
        - 두 위 경도 좌표 사이의 거리를 haversine formula로 계산한다.
        - 지구는 완전한 구형이 아니므로 조금의 오차가 있을 수 있다.
    - 입력한 주소 정보에서 정해진 반경(10km) 내에 있는 약국만 추천한다.
    - 추출한 약국 데이터는 길안내 URL 및  로드뷰 URL로 제공한다.
    - 길안내 URL은 고객에게 제공되기 때문에 가독성을 위해 Shorten URL로 제공한다.
        - Base62를 통한 인코딩
        - Shorten URL의 유효 기간은 30일로 제한한다.

<br/>

## 기술 스택

 - JDK 11
 - Spring Boot 2.6.7
 - Spring Data JPA
 - Gradle
 - Handlebars
 - Lombok
 - Github
 - Docker
 - AWS EC2
 - Redis
 - MariaDB
 - Spock
 - Testcontainers

