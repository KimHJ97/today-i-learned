# 실습으로 배우는 선착순 이벤트 시스템

선착순 이벤트 시스템에서 발생할 수 있는 문제와 해당 문제 해결 방안을 공부한다.

 - 발생할 수 있는 문제점
    - 쿠폰이 100개보다 많이 발급
    - 이벤트 페이지 접속 불가 (평소보다 많은 트래픽)
    - 이벤트랑 전혀 상관없는 페이지들도 느려짐
 - 문제 해결
    - 트래픽이 몰렸을 때 대처 방안
    - Redis를 활용하여 쿠폰 발급 개수 보장
    - Kafka를 활용하여 다른 페이지들에 대한 영향도를 줄임

<br/>

## 작업 환경 설정

```Bash
# Docker 설치
$ brew install docker
$ brew link docker
$ docker version

# MySQL 이미지 다운로드 및 컨테이너 실행
$ docker pull mysql
$ docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=1234 --name mysql mysql
$ docker ps

# MySQL 데이터베이스 만들기
$ docker exec -it mysql bash
$ mysql -u root -p
$ create database coupon_example;
$ use coupon_example;
```