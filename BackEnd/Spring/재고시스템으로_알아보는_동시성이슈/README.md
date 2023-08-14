# 재고시스템으로 알아보는 동시성이슈 해결방법

동시성(Concurrency) 이슈란 컴퓨터 과학에서 한 시스템 내에서 여러 작업이 동시에 실행되는 상황에서 발생하는 문제들을 가리키는 개념입니다.  
동시성은 다수의 작업이 동시에 진행되는 것처럼 보이는 것을 의미하지만, 실제로는 프로세서의 물리적인 한계와 작업들의 실행 순서에 따라 다양한 문제들이 발생할 수 있습니다.  

 - 동시성 이슈 해결 방안
    - synchronized 사용
    - Database Lock
        - Pessimistic Lock
        - Optimistic Lock
        - Named Lock
    - Redis Distributed Lock

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
$ create database stock_example;
$ use stock_example;
```