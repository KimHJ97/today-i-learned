# Redis

 - 메모리 기반 데이터 저장소
 - Single Thread
 - 초당 5만 ~ 25만 요청 실행 가능
 - 키-값 형식으로 데이터저장

<br/>

## Redis 구조

 - Stand Alone
    - Redis Master 서버 1대로만 동작
 - Master-Replica
    - Master와 Replica(Slave) 서버 구성
 - Sentinel
    - Master와 Replica(Slave) 서버 구성과 Sentinel 서버를 추가적으로 구성
    - Sentinel이 Master를 감시하여 에러 발생시 Replica를 Master로 전환한다. 에러로 종료된 Master를 재실행하더라도 다시 Master로 변경되지 않고 Slave로 동작한다.
 - Cluster
    - 복수개의 Master와 복수개의 Replica(Slave) 서버를 구성
    - Sentinel을 따로 띄우지 않는다.
    - 데이터 샤딩이 가능하다.

<br/>

## Redis 설치 및 구성

### Redis Stand Alone 구성

 - maxmemory를 CLI에서 직접 설정하는 방법은 재실행되면 초기화된다. 때문에, '/etc/redis/redis.conf'에 정의해주는 것이 좋다.
```bash
apt-get update
apt-get install redis-server
service redis status

# Redis 설치 위치
cd /etc/redis

# Redis 설정 파일
vi /etc/redis/redis.conf

# Redis CLI 접속
redis-cli

# Max Memory 설정
config set maxmemory 500mb
config get maxmemory
```
<br/>

### Redis Master-Replica 구성

 - Master와 Slave 간에 포트가 개방되어야 한다.
```bash
# Master 서버
apt-get install redis-server

# Replica 서버
apt-get install redis-server
redis-cli
replicaof {host} {port}
```
<br/>

### Redis Sentinel 구성

 - Master, Replica 서버에 Sentinel을 설치하고, 그 외 다른 서버에 Sentinel을 설치하여 3개의 Sentiel이 구성되도록 한다.
 - 3개의 서버 모두 Sentinel 포트인 26379을 개방해주어야 한다.
```bash
# Master 서버
apt-get install redis-server
apt-get install redis-sentinel

# Sentinel 설정 파일
# bind 부분 현재 호스트 주소로 변경
# sentinel monitor mymaster -> Master IP와 PORT, Sentinel 다수표 결정
vi /etc/redissentinel.conf
service sentinel restart

# Replica 서버
apt-get install redis-server
apt-get install redis-sentinel
replicaof {host} {port}
vi /etc/redissentinel.conf # bind, sentinel monitor 변경
service sentinel restart

# Sentinel 서버
apt-get install redis-sentinel
vi /etc/redissentinel.conf # bind, sentinel monitor 변경
service sentinel restart
```
<br/>

## Redis 활용 예시

### 가격 정보 데이터

 - 가격을 순위로 사용 -> 저가순, 고가순 정렬
 - zrange: 스코어 순서대로 출력
 - zrem: 특정 키 제거
 - zrangebyscore: 특정 구간에 스코어에 해당하는 키 출력
 - zscore: 키에 해당하는 점수 출력
```bash
zadd product 12000 p00001
zadd product 13000 p00002
zadd product 13500 p00003
zadd product 8500 p00004
zadd product 100000 p00005

# 0 ~ 2번 순위 출력
zrange product 0 2

# 0 ~ 2번 순위 출력 + 점수 포함
zrange product 0 2 withscores

# 특정 키(제품) 제거
zrem product p0004

# 가격이 50,000 ~ 120,000 상품 조회
zrangebyscore product  50000 120000

# p0003 제품의 가격 조회(점수 조회)
zscore product p0003

# 가격 순위 출력
zrank product p0001
```

