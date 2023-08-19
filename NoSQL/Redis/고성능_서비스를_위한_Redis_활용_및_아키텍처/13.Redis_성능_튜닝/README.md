# Redis 성능 튜닝

## 적절한 Eviction 정책

Eviction(제거) 정책은 Redis가 설정된 최대 메모리 용량에 도달했을 때 어떤 데이터를 삭제할지를 결정하는 규칙과 전략을 말합니다. Redis는 메모리 기반의 데이터베이스로 작동하기 때문에 메모리를 효율적으로 관리하는 것이 중요하며, Eviction 정책은 이를 위해 사용됩니다.
 - 메모리가 한계에 도달했을 때 어떤 조치가 일어날지 결정
 - 처음부터 메모리가 부족한 상황을 만들지 않는 것이 중요함
 - 캐시로 사용할 때는 적절한 eviction policy가 사용될 수 있음

<br/>

### Redis의 메모리 관리

Redis의 메모리 용량은 설정된 maxmemory 값에 의해 제한됩니다. 메모리가 가득 차면 Redis는 데이터를 삭제하여 새로운 데이터를 저장할 공간을 확보합니다. 여기서 Eviction 정책이 사용됩니다. 다양한 Eviction 정책이 있으며, 각 정책은 데이터를 어떤 순서로 삭제할지를 결정합니다.

```conf
# Memory 사용 한도 설정: 지정하지 않으면 32Bit에서는 3GB, 64Bit에서는 0(무제한)으로 설정
maxmemory 100mb

# maxmemory 도달한 경우 eviction 정책 설정
maxmemory-policy noeviction
```

<br/>

### maxmemory-policy 옵션

캐싱 용도로 사용하는 경우 "allkeys-lru"가 많이 사용된다.  

 - noeviction:
    - 기본 정책으로, 메모리가 가득 차면 Redis는 응답하지 않습니다. 새로운 데이터를 추가하려면 먼저 기존 데이터를 삭제해야 합니다.
    - eviction 없음으로 추가 데이터는 저장되지 않고 에러 발생(Replication 사용시 Master에 적용됨)
 - allkeys-lru (Least Recently Used):
    - 가장 오랫동안 사용되지 않은 데이터부터 삭제하는 정책입니다. 가장 최근에 사용되지 않은 데이터부터 삭제됩니다.
    - 가장 최근에 사용된 키들을 남기고 나머지를 삭제(LRU: Least Recently Used)
 - allkeys-lfu (Least Frequently Used):
    - 가장 빈번하게 사용된 키들을 남기고 나머지를 삭제(LFU: Least Frequently Used)
 - volatile-lru:
    - 유효기간이 설정된 키 중에서 LRU 정책을 적용하여 데이터를 삭제합니다.
    - LRU를 사용하되 expire field가 true로 설정된 항목들 중에서만 삭제
 - volatile-lfu (Least Frequently Used):
    - 유효기간이 설정된 키 중에서 가장 적게 사용된 데이터부터 삭제합니다.
    - LFU를 사용하되 expire field가 true로 설정된 항목들 중에서만 삭제
 - allkeys-random:
    - 무작위로 데이터를 삭제하는 정책입니다.
 - volatile-random:
    - 유효기간이 설정된 키 중에서 무작위로 데이터를 삭제합니다.
    - expire field가 true로 설정된 항목들 중에서 랜덤하게 삭제
 - volatile-ttl:
    - 유효기간이 설정된 키 중에서 유효기간이 짧은 데이터부터 삭제합니다.
    - expire field가 true로 설정된 항목들 중에서 짧은 TTL 순으로 삭제

<br/>

## 시스템 튜닝

### Redis 성능 측정(redis-benchmark)

redis-benchmark는 Redis 데이터베이스의 성능을 측정하고 평가하기 위한 공식적인 Redis 유틸리티입니다. 이 도구를 사용하여 Redis 서버의 처리량, 응답 시간, 처리 속도 등 다양한 성능 지표를 측정할 수 있습니다. redis-benchmark는 특정 시나리오에서 Redis가 얼마나 많은 요청을 처리할 수 있는지를 확인하는 데 도움을 줍니다.  
 - 읽기 요청 테스트:
    - get 명령어를 사용하여 데이터를 읽는 작업을 측정합니다.
 - 쓰기 요청 테스트:
    - set 명령어를 사용하여 데이터를 쓰는 작업을 측정합니다.
 - 랜덤 읽기와 쓰기 테스트:
    - get과 set 명령어를 조합하여 읽기와 쓰기를 랜덤하게 수행하는 작업을 측정합니다.
 - 다중 연결 테스트:
    - 동시에 여러 클라이언트로부터 요청이 오는 상황을 시뮬레이션하여 서버의 성능을 테스트합니다.
 - 파이프라인 테스트:
    - 파이프라인 기능을 사용하여 여러 개의 명령을 연속적으로 보내는 상황을 시뮬레이션합니다.
```Bash
# redis-benchmark 명령어
$ redis-benchmark [-h host] [-p port] [-c clients] [-n requests]

# SET 명령어를 100개의 클라이언트로 총 100번씩 실행하는 테스트를 수행
# -c 100: 동시에 실행할 클라이언트 수를 나타냅니다. 여기서는 100개의 클라이언트가 동시에 요청을 보내며, 데이터를 설정(SET)하는 작업을 수행합니다.
# -n 100: 총 실행할 요청의 횟수를 나타냅니다. 여기서는 각 클라이언트가 100번씩 요청을 보냅니다. 따라서 총 100 * 100 = 10,000번의 SET 요청이 발생합니다.
# -t SET: 수행할 작업 유형을 지정합니다. 여기서는 SET 명령어를 수행하는 것을 의미합니다. SET 명령어는 Redis에 데이터를 저장하는 명령어입니다.
$ redis-benchmark -c 100 -n 100 -t SET
```

<br/>

### Redis 성능에 영향을 미치는 요소들

 - 하드웨어 리소스:
    - CPU: Redis는 단일 스레드로 작동하므로 빠른 CPU가 성능에 중요한 역할을 합니다. (코어 수보다는 큰 Cache를 가진 빠른 CPU 선호)
    - 메모리: Redis는 메모리 기반 데이터베이스이므로 메모리가 충분히 확보되어야 합니다.
    - 디스크: AOF 로그와 RDB 스냅샷 저장 등 디스크 작업이 성능에 영향을 줄 수 있습니다.
 - 네트워크 지연:
    - 클라이언트와 Redis 서버 간의 네트워크 지연이 응답 시간에 영향을 미칩니다.
    - 클라이언트와 서버 간에 최소한의 네트워크 라운드트립을 유지하는 것이 중요합니다.
    - Redis의 throughput은 주로 네트워크에 의해 결정되는 경우가 많다. 운영 환경에 런치하기 전에 배포 환경의 네트워크 대역폭과 실제 throughput을 체크하는 것이 좋다.
 - 데이터 모델과 구조:
    - 데이터 크기와 타입: 데이터의 크기와 타입이 메모리 사용량과 I/O에 영향을 줍니다.
    - 데이터 구조 선택: Redis의 다양한 데이터 구조 중 적합한 구조를 선택하여 데이터의 효율적인 관리와 접근이 필요합니다.
 - 가상화 환경:
    - VM에서 실행되는 경우 개별적인 영향이 있을 수 있음
    - non-local disk, 오래된 Hypervisor의 느린 Fork 구현 등

<br/>

### 성능에 영향을 미치는 Redis 설정

 - rdbcompression yes/no: RDB 파일을 압축할지 여부로, CPU를 절약하고 싶은 경우 no 선택
 - rdbchecksum yes/no: 사용시 RDB의 안전성을 높일 수 있으나 파일 저장/로드 시에 10% 정도의 성능 저하가 발생
 - save: RDB 파일 생성시 시스템 자원이 소모되므로 성능에 영향이 있음

<br/>

## SLOWLOG로 느린 쿼리 튜닝하기

SLOWLOG는 Redis 데이터베이스에서 실행된 느린 명령어를 기록하는 메커니즘과 관련된 기능입니다. Redis의 SLOWLOG는 느린 명령어 실행을 모니터링하고 분석하는데 도움을 주며, 성능 문제 해결과 최적화에 활용될 수 있습니다.  

 - redis.conf
    - 수행 시간이 설정한 기준 시간 이상인 쿼리의 로그를 보여줌
    - 측정 기준인 수행 시간은 I/O 동작을 제외함 (네트워크 소요 시간 제외하고, Redis 프로세스 안에서만 소요되는 쓰기 시간)
```conf
# 로깅되는 기준 시간(microseconds)
slowlog-log-slower-than 10000

# 로그 최대 길이
slowlog-max-len 128
```

 - SLOWLOG 명령어
```Bash
# slowlog 개수 확인
127.0.0.1:6379> slowlog len

# slowlog 조회: 일련번호, 시간, 소요시간, 명령어, 클라이언트 IP, 클라이언트 이름
127.0.0.1:6379> slowlog get [count]

# slowlog 삭제
127.0.0.1:6379> slowlog reset
```