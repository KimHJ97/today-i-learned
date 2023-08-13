# Redis 설치와 실습

## Redis 설치 환경

Redis는 오픈 소스로 소스가 공개되어 있고, 직접 다운받아서 빌드할 수 있다.  
소스 코드는 C 언어로 되어있고, C 컴파일러 혹은 빌드 환경은 대부분의 OS(플랫폼)에 존재한다.  
 - 소스와 바이너리 형태로 제공됨
 - 주로 Linux에 설치하여 사용
 - 소스 빌드, 바이너리 다운로드, 패키지 관리자 등 다양한 방법으로 설치 가능
```Bash
# 소스 다운로드 및 빌드 (Linux)
$ wget https://download.redis.io/releases/redis-6.2.4.tar.gz
$ tar xzf redis-6.2.4.tar.gz
$ make redis-6.2.4

# 패키지 관리자 이용 (Mac)
$ brew install redis
```

<br/>

## Docker

도커는 경량화된 가상 환경인 컨테이너를 이용해 프로그램을 실행할 수 있는 기술입니다.  
실행 환경을 매번 새로 설정할 필요 없이 간편하게 실행 가능하고, 여러 대의 PC를 사용하는 것 처럼 테스트 환경 설정에 용이합니다.  
 - Docker 설치
    - Windows: WSL2(Windows Subsystem for Linux 2)를 활용해 작동
    - Linux: apt-get, yum과 같은 패키지 관리자 사용 가능
    - Mac: brew와 같은 패키지 관리자 사용 가능
    - Docker Desktop: Docker를 손 쉽게 사용할 수 있게 해주는 UI
    - 공식 홈페이지: https://www.docker.com

```Bash
# 도커 설치 확인
$ docker version

# 도커 저장소에서 Redis 이미지 다운로드
$ docker pull redis

# Redis 실행
$ docker run -d --name my-redis -p 6379:6379 redis

# 실행중인 컨테이너 확인
$ docker ps

# Redis 컨테이너 정지
$ docker stop my-redis
```

<br/>

## Redis 커맨드 실습

Redis를 설치하면 기본적으로 Redis를 담고 있는 redis-server와 레디스 서버에 커맨드를 실행할 수 있는 인터페이스인 redis-cli가 제공된다.  
 - redis-server: 레디스 서버
 - redis-cli: 레디스 서버에 커맨드를 실행할 수 있는 인터페이스

```Bash
# 도커 컨테이너 접속
$ docker exec -it my-redis /bin/bash

# 컨테이너 내부 쉘에서 Redis-CLI 실행
# 호스트와 포트를 지정하지 않으면 127.0.0.1:6379를 사용한다.
$ redis-cli

# Redis 커맨드 사용
127.0.0.1:6379> set key1 banana
OK

127.0.0.1:6379> get key1
"banana"

127.0.0.1:6379> get key2
(nil)

# 존재하는 키 조회
# 실제 운영 환경에서는 '*'을 통해 모든 키 값 조회는 성능에 이슈가 발생할 수 있어 주의해야 한다.
127.0.0.1:6379> keys *
127.0.0.1:6379> dbsize

# 모든 키 삭제
127.0.0.1:6379> flushall

# Redis-CLI 종료
127.0.0.1:6379> exit
```