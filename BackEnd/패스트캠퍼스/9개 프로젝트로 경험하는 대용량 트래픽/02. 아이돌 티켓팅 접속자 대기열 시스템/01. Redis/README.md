# Redis

Redis는 고성능의 키-값 저장소로, 메모리 기반의 데이터 구조 서버입니다. Redis는 Remote Dictionary Server의 약자입니다. 다양한 데이터 구조를 지원하고, 매우 빠른 성능을 자랑합니다.  
 - __메모리 기반 저장__: Redis는 데이터를 메모리에 저장하기 때문에 매우 빠른 읽기 및 쓰기 속도를 제공합니다. 디스크 기반 저장소보다 속도가 월등히 빠릅니다.
 - 데이터 구조 지원: Redis는 문자열, 리스트, 집합, 정렬된 집합, 해시, 비트맵, 하이퍼로그로그 등 다양한 데이터 구조를 지원합니다.
 - __영속성__: Redis는 메모리 기반 저장소이지만, 데이터를 디스크에 영속적으로 저장할 수 있는 옵션을 제공합니다. RDB (Redis Database) 스냅샷과 AOF (Append-Only File) 방식을 통해 데이터를 영구 저장할 수 있습니다.
 - __고가용성 및 분산성__: Redis는 복제 기능을 통해 고가용성을 제공하며, Redis Cluster를 통해 데이터 분산 및 수평 확장이 가능합니다.
 - __Lua 스크립팅__: Redis는 Lua 스크립트를 실행할 수 있어, 복잡한 연산을 서버에서 직접 수행할 수 있습니다.
 - __Pub/Sub__: Redis는 게시/구독 모델을 지원하여 실시간 메시지 전송 시스템으로도 사용될 수 있습니다.

## 1. Reids 특징

### 1-1. 영속성 보장

Redis에서 데이터의 영속성을 보장하기 위해 두 가지 주요 방법인 RDB와 AOF를 제공합니다.  

 - RDB: 주기적으로 전체 데이터베이스의 스냅샷을 디스크에 저장. 주로 백업 목적으로 사용되며, 복구가 빠르지만 스냅샷 사이의 데이터는 손실될 수 있음.
 - AOF: 모든 쓰기 명령을 로그 파일에 기록. 데이터 손실이 거의 없고, 가독성이 좋지만 파일 크기 증가 및 복구 속도가 느릴 수 있음.

<br/>

#### RDB (Redis Database)

RDB는 Redis의 메모리 데이터를 특정 시점(Snapshot)에서 디스크에 저장하는 방식입니다. 주기적으로 데이터베이스의 스냅샷을 만들어서 디스크에 저장하는 방식입니다.  
 - __스냅샷 방식__: 주기적으로 전체 데이터베이스의 상태를 디스크에 저장합니다.
 - 성능: RDB는 스냅샷을 만드는 동안에는 Redis의 메모리 사용량이 늘어나고 I/O 작업이 증가할 수 있지만, 스냅샷을 만드는 간격 사이에는 성능에 큰 영향을 미치지 않습니다.
 - __복구 속도__: 데이터베이스가 큰 경우 RDB 파일을 사용하여 Redis 인스턴스를 빠르게 재시작할 수 있습니다.
 - __데이터 손실__: 마지막 스냅샷 이후의 데이터는 손실될 수 있습니다. 예를 들어, 스냅샷 간격이 10분인 경우, 10분 동안의 데이터는 복구되지 않을 수 있습니다.
 - __저장 형식__: RDB 파일은 바이너리 형식으로 저장되어 크기가 작고, 빠른 로딩 속도를 제공합니다.
```
# RDB 스냅샷 설정 (기본 값 예시)
save 900 1  # 900초(15분)마다 최소 1개의 변경이 발생하면 스냅샷 생성
save 300 10 # 300초(5분)마다 최소 10개의 변경이 발생하면 스냅샷 생성
save 60 10000 # 60초마다 최소 10000개의 변경이 발생하면 스냅샷 생성

# 스냅샷 파일 경로
dir /var/lib/redis
# 스냅샷 파일 이름
dbfilename dump.rdb
```
<br/>

#### AOF (Append-Only File)

AOF는 모든 쓰기 연산을 하나의 로그 파일에 순차적으로 기록하는 방식입니다. 각 명령이 실행될 때마다 해당 명령을 파일에 추가합니다.  
 - __저장 방식__: 각 쓰기 명령을 바로 로그 파일에 기록하므로, RDB보다 더 자주 데이터를 디스크에 기록합니다.
 - __복구 속도__: AOF 파일은 명령어의 집합이므로, 복구 시에는 모든 명령을 재실행해야 하므로 RDB보다 느릴 수 있습니다.
 - __데이터 손실 방지__: AOF는 더 빈번하게 데이터를 기록하므로, 데이터 손실이 적습니다. fsync 옵션에 따라 데이터 손실 가능성을 최소화할 수 있습니다.
 - __파일 크기 증가__: 지속적인 쓰기 작업으로 AOF 파일 크기가 커질 수 있으며, 이로 인해 성능에 영향을 줄 수 있습니다. Redis는 이를 해결하기 위해 AOF 파일 압축(리라이팅)을 지원합니다.
 - __가독성__: AOF 파일은 텍스트 형식으로 저장되므로 사람이 읽을 수 있습니다.
```
# AOF 활성화
appendonly yes

# fsync 설정 (성능과 데이터 보존 사이의 트레이드오프)
appendfsync always # 모든 쓰기 연산 후 fsync 실행 (느리지만 안전)
appendfsync everysec # 매초 fsync 실행 (기본 설정)
appendfsync no # fsync를 호출하지 않음 (가장 빠르지만 데이터 손실 가능성 있음)

# AOF 파일 경로
dir /var/lib/redis
# AOF 파일 이름
appendfilename "appendonly.aof"
```
<br/>

### 1-2. Single Thread

Redis는 기본적으로 싱글 스레드(single-threaded)로 동작합니다. 모든 명령은 순차적으로 처리되며, 이는 원자성(atomicity)을 보장하는 데 중요한 역할을 합니다.  
 - 단순성: 싱글 스레드 아키텍처는 설계와 구현이 간단합니다. 동기화 문제를 피할 수 있어 코드의 복잡성을 줄입니다.
 - 경합 최소화: 여러 클라이언트 요청이 동시에 도착해도, 모든 명령이 순차적으로 처리되기 때문에 데이터 경합과 관련된 문제가 발생하지 않습니다. 이는 특히 데이터 일관성 측면에서 유리합니다.
 - 예측 가능한 성능: 모든 명령이 순차적으로 처리되기 때문에, Redis의 성능은 매우 예측 가능하고 안정적입니다.

<br/>

### 1-3. 멀티코어 활용

Redis는 기본적으로 싱글 스레드이지만, 멀티코어 시스템에서 더 나은 성능을 얻기 위해 여러 인스턴스를 실행할 수 있습니다. 각 인스턴스는 별도의 CPU 코어에서 실행되며, 이를 통해 병렬 처리를 어느 정도 구현할 수 있습니다.  

또한, Redis 6.0부터는 일부 I/O 작업을 별도의 스레드에서 처리할 수 있는 멀티스레딩 기능이 도입되었습니다. 이는 주로 네트워크 I/O 처리를 병렬화하여, 네트워크 처리 성능을 향상시키기 위한 것입니다. 그러나, 데이터 조작 명령은 여전히 단일 스레드에서 처리됩니다.  

 - 멀티스레딩 설정 (Redis 6.0 이상)
```
# redis.conf 파일에서 아래와 같이 설정
# 멀티스레딩 활성화 (기본적으로 비활성화)
io-threads-do-reads yes

# 사용할 I/O 스레드 수 지정 (기본값은 1, 최대 128)
io-threads 4
```
<br/>

### 1-4. 데이터 타입

Redis는 다양한 데이터 타입을 제공하여 다양한 사용 사례에 적합한 데이터를 효율적으로 저장하고 처리할 수 있습니다. 각 데이터 타입은 고유의 특성과 기능을 가지고 있어, 애플리케이션의 요구사항에 따라 적절한 데이터를 선택하여 사용할 수 있습니다.  

 - __문자열 (String)__: Redis에서 가장 기본적인 데이터 타입으로, 단일 키에 최대 512MB 크기의 문자열 값을 저장할 수 있습니다.
 - 사용 사례: 캐시 데이터 저장, 세션 정보 저장, 간단한 카운터 구현
```bash
SET mykey "Hello, Redis!"
GET mykey
INCR mycounter
```
<br/>

 - __리스트 (List)__: 리스트는 순서가 있는 문자열의 컬렉션으로, 요소는 삽입된 순서대로 유지됩니다. 좌우측 삽입/삭제가 가능합니다.
 - 사용 사례: 작업 대기열(Queue), 최근 항목 목록, 채팅 애플리케이션의 메시지 저장
```bash
LPUSH mylist "world"
LPUSH mylist "hello"
LRANGE mylist 0 -1  # ["hello", "world"]
```
<br/>

 - __집합 (Set)__: 집합은 유일한 문자열의 무순서 컬렉션입니다. 동일한 값이 중복으로 저장되지 않습니다.
 - 사용 사례: 유일한 사용자 ID 저장, 태그 저장 및 조회, 교집합, 합집합, 차집합 등의 집합 연산
```bash
SADD myset "apple"
SADD myset "banana"
SADD myset "apple"  # 이미 존재하는 요소 추가 시 무시됨
SMEMBERS myset
```
<br/>

 - __정렬된 집합 (Sorted Set)__: 정렬된 집합은 각 요소에 점수(score)가 부여된 유일한 문자열의 컬렉션입니다. 요소는 점수에 따라 정렬됩니다.
 - 사용 사례: 리더보드 구현, 시간 기반의 로그 저장, 우선순위 큐
```bash
ZADD myzset 1 "one"
ZADD myzset 2 "two"
ZADD myzset 1 "uno"
ZRANGE myzset 0 -1  # ["one", "uno", "two"]
```
<br/>

 - __해시(Hash)__: 해시는 필드와 값으로 구성된 작은 오브젝트를 저장하는 데 사용됩니다. 각 해시 키는 여러 필드-값 쌍을 가질 수 있습니다.
 - 사용 사례: 사용자 프로필 저장, 구성 설정 저장, 객체 속성 저장
```bash
HSET myhash field1 "value1"
HSET myhash field2 "value2"
HGET myhash field1
HGETALL myhash
```
<br/>

 - __비트맵 (Bitmap)__: 비트맵은 비트 단위로 값을 조작할 수 있는 문자열입니다. 비트 연산을 통해 비트를 설정하거나, 해제할 수 있습니다.
 - 사용자 활동 트래킹, 비트 필터 구현, 효율적인 비트 연산
```bash
PFADD myhll "a" "b" "c"
PFCOUNT myhll
```
<br/>

 - __스트림 (Stream)__: 스트림은 로그와 유사한 구조로, 시간 순서대로 정렬된 엔트리의 시퀀스입니다. 각 엔트리는 여러 필드와 값을 가질 수 있습니다.
 - 사용 사례: 실시간 이벤트 스토어, 메시지 브로커, 데이터 피드
```bash
XADD mystream * field1 value1 field2 value2
XRANGE mystream - +
XREAD COUNT 2 STREAMS mystream 0
```
<br/>

### 1-5. 활용 사례

Redis는 성능과 유연성 덕분에 다양한 분야에서 활용되고 있습니다. 캐싱, 실시간 분석, 메시지 큐, 리더보드 관리, 분산 잠금, 데이터 스트림 처리, 지리적 데이터 처리 등 여러 가지 활용 사례가 있으며, 각 경우에서 Redis는 높은 성능과 신뢰성을 제공합니다. 이러한 다양한 활용 사례는 Redis가 단순한 키-값 저장소를 넘어서, 복잡한 데이터 처리 요구를 해결하는 데 매우 유용한 도구임을 보여줍니다.  

 - __1. 캐싱__
    - Redis는 매우 빠른 읽기와 쓰기 속도를 제공하므로, 자주 조회되거나 변경되는 데이터를 캐싱하는 데 이상적입니다. 이를 통해 데이터베이스의 부하를 줄이고, 애플리케이션의 응답 시간을 크게 개선할 수 있습니다.
    - 웹 페이지 캐싱: 웹 페이지 또는 API 응답을 Redis에 저장하여, 동일한 요청에 대해 빠르게 응답할 수 있습니다.
    - 세션 관리: 사용자 세션 정보를 Redis에 저장하여, 빠르게 조회하고 업데이트할 수 있습니다.
 - __2. 실시간 분석__
    - Redis의 고성능 데이터 구조를 활용하여, 실시간으로 데이터를 수집하고 분석할 수 있습니다. 이는 실시간 대시보드, 모니터링 시스템 등에 유용합니다.
    - 실시간 통계: 웹사이트 방문자 수, 페이지 조회 수 등을 실시간으로 집계하고 분석할 수 있습니다.
    - 로그 분석: 서버 로그 데이터를 Redis에 저장하여, 실시간으로 분석하고 경고를 생성할 수 있습니다.
 - __3. 메시지 큐__
    - Redis는 Pub/Sub 기능을 제공하여, 메시지 큐로서 사용할 수 있습니다. 이를 통해, 여러 애플리케이션 간에 실시간으로 메시지를 주고받을 수 있습니다.
    - 채팅 시스템: 채팅 메시지를 Redis의 Pub/Sub를 통해 실시간으로 전달할 수 있습니다.
    - 이벤트 알림: 특정 이벤트 발생 시, 관련 애플리케이션에 실시간으로 알림을 보낼 수 있습니다.
 - __4. 리더보드 및 순위표__
    - Redis의 정렬된 집합(sorted set)을 사용하면, 점수 기반의 리더보드나 순위표를 쉽게 구현할 수 있습니다.
    - 게임 리더보드: 게임에서 플레이어의 점수를 저장하고, 실시간으로 순위를 업데이트할 수 있습니다.
    - 소셜 미디어: 게시물이나 사용자 활동에 기반한 순위를 생성하고 관리할 수 있습니다.
 - __5. 분산 잠금__
    - 분산 시스템에서 Redis를 이용하여 분산 잠금을 구현할 수 있습니다. 이를 통해, 여러 인스턴스 간의 자원 경합을 방지하고, 데이터 일관성을 유지할 수 있습니다.
    - 분산 트랜잭션: 여러 서버에서 동시에 수행되는 트랜잭션을 조정하여 데이터 일관성을 유지할 수 있습니다.
    - 리소스 관리: 특정 리소스에 대한 액세스를 제한하여, 중복 처리를 방지할 수 있습니다.
 - __6. 데이터 스트림 처리__
    - Redis Streams를 사용하여, 데이터 스트림을 처리하고 관리할 수 있습니다. 이는 이벤트 소싱(event sourcing) 패턴에 유용합니다.
    - 로그 및 이벤트 수집: 로그 데이터 또는 이벤트를 스트림으로 수집하고, 실시간으로 처리할 수 있습니다.
    - 데이터 파이프라인: 데이터가 생성되는 순서대로 처리하고, 다양한 분석 작업에 사용할 수 있습니다.
 - __7. Geospatial 데이터 처리__
    - Redis는 지리적 위치 정보를 저장하고, 이를 기반으로 한 다양한 연산을 지원합니다.
    - 위치 기반 서비스: 사용자의 위치 정보를 저장하고, 특정 범위 내의 사용자나 장소를 검색할 수 있습니다.
    - 물류 및 배달: 배달 경로 최적화, 근처 배달원 찾기 등의 기능을 구현할 수 있습니다.

<br/>

## 2. Redis 설치 및 사용 예시

### 2-1. Redis 설치

```bash
# Redis 이미지 설치
docker pull redis:6.2

# Redis 이미지 컨테이너화
docker run --rm -it -d -p 6379:6379 redis:6.2

# 실행중인 컨테이너 확인
docker ps

# Redis 접속
docker exec -it {container id} bash
redis-cli

# Redis-CLI 접속
docker exec -it {container id} redis-cli
```
<br/>

### 2-2. Redis CLI를 통한 접속

```bash
# Redis CLI 접속
docker exec -it {container id} redis-cli

# 핑 확인
redis-cli> ping

# 모니터링
redis-cli> monitor

# 벤치마킹 성능 테스트
redis-cli> redis-benchmark
```
<br/>

### 2-3. 데이터 타입

 - `키 관련 명령어`
```bash
# 키의 삭제 시간 지정
EXPIRE {KEY} {SECOND}

# 키의 남은 시간 확인
TTL {KEY}

# 키 삭제: 동기 삭제
DEL {KEY}

# 키 삭제: 비동기 삭제
UNLINK {KEY}

# 키의 메모리 적재량 확인
MEMORY USAGE {KEY}
```
<br/>

 - `Strings 관련 명렁어`
    - SET, SETNX, GET, MGET, INC, DEC
    - INC, DEC를 이용하지 않고, GET과 SET를 이용하여 카운터를 사용하면 동시성 이슈가 발생할 수 있다.
```bash
# 문자열 저장
SET {KEY} {VALUE}

# 문자열 조회
GET {KEY}
MGET {KEY1} {KEY2}

# 원자적 증가 및 감소
INCR counter
INCRBY counter 2
DEC counter
```
<br/>

 - `Lists 관련 명령어`
    - LPUSH, RPUSH, LPOP, RPOP, LLEN, LRANGE
```bash
# 데이터 적재
LPUSH {KEY} {VALUE}
RPUSH {KEY} {VALUE}

# 데이터 추출
LPOP {KEY}
RPOP {KEY}

# 전체 데이터 조회
LRANGE {KEY} 0 -1
```
<br/>

 - `Sets 관련 명령어`
    - SADD, SREM, SISMEMBER, SMEMBERS, SINTER, SCARD
```bash
# 데이터 적재
SADD {KEY} {VALUE}

# 전체 데이터 조회
SMEMBERS {KEY}

# 전체 데이터 갯수 조회
SCARD {KEY}
```
<br/>

 - `Sorted Set 관련 명령어`
    - SADD, ZREM, ZRANGE, ZCARD, ZRANK, ZREVRANK, ZINCRBY
```bash
# 데이터 적재
ZADD {KEY} {SCORE} {VALUE}

# 오름차순으로 조회
ZRANGE {KEY} 0 -1 WITHSCORES

# 점수 기반 상위 3개 조회
ZRANGE {KEY} 0 +INF BYSCORE LIMIT 0 3 WITHSCORES

# 점수 기반 하위 3개 조회
ZRANGE {KEY} +INF 0 BYSCORE REV LIMIT 0 3 WITHSCORES
```
<br/>

 - `Hashes 관련 명령어`
    - HSET, HGET, HMGET, HGETALL, HDEL, HINCRBY
```bash
# 데이터 저장
HSET {KEY} {FIELD} {VALUE}

# 해당 키의 필드 조회
HGET {KEY} {FIELD}

# 해당 키의 전체 필드 조회
HGETALL {KEY}
```
<br/>

  - `Geospatial 관련 명령어`
    - GEOADD, GEOSEARCH, GEODIST, GEOPOS
```bash
# 위치 정보 저장
GEOADD {KEY} {latitude} {longitude} {VALUE}

# 위치 기반 조회
GEOSEARCH {KEY} FROMLONLAT {latitude} {longitude} BYRADIUS 5 km ASC
```
<BR/>

 - `Bitmap`
    - SETBIT, GETBIT, BITCOUNT
```bash
SETBIT mykey 7 1
GETBIT mykey 7
BITCOUNT mykey
```

