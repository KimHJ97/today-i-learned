# 글로벌 서비스를 위한 Active-Active 아키텍처

## Active-Active 아키텍처

글로벌 서비스 혹은 다중 지역(Multi-Region) 서비스의 어려움이 있다. 한 지역에 서버를 두고 서비스하면 멀리 떨어진 곳에서는 Latency 문제가 있고, 여러 지역에 서버를 두면 데이터 일관성에 문제가 있다.  

<br/>

Redis Active-Active 아키텍처는 여러 개의 Redis 데이터베이스 인스턴스가 동시에 활성화되어 작동하는 아키텍처입니다. 이 아키텍처에서 각 Redis 인스턴스는 독립적인 데이터를 관리하며, 동일한 데이터의 다중 복제본을 유지합니다. Active-Active 아키텍처는 주로 가용성과 확장성을 개선하기 위해 사용됩니다.  
 - 지역적으로 분산된 글로벌 데이터베이스를 유지하면서 여러 위치에서 동일한 데이터에 대한 읽기/쓰기를 허용
 - Multi-Master 구조로 생각할 수 있음
 - 지역적으로 빠른 Latency를 확보하면서도 데이터 일관성을 유지하는 형태
 - 학술적으로 입증된 CRDT(Conflict-Free Replicated Data Types)를 활용해 자동으로 데이터 충돌을 해소
 - 여러 클러스터에 연결되어 글로벌 데이터베이스를 이루는 것을 CRDB(Conflict-Free Replicated Database)라고 지칭
 - Active-Active 아키텍처의 장점
    - 분산된 지역의 수와 상관없이 지역적으로 낮은 Latency로 읽기/쓰기 작업을 수행
    - CRDTs를 이용한 매끄러운 충돌 해결
    - CRDB의 다수 인스턴스(지역 DB)에 장애가 발생하더라도 계속 운영 가능한 비즈니스 연속성 제공

### Redis Enterprise

Redis Enterprise는 Redis Labs가 제공하는 기업용 Redis 데이터베이스 플랫폼입니다. Redis Enterprise는 오픈 소스 Redis 데이터베이스의 기능을 확장하고 엔터프라이즈 환경에서 필요한 고가용성, 확장성, 보안 및 관리 기능을 추가하여 제공합니다.  
 - Enterprise급 기능을 제공하는 유료 제품
 - Redis Labs에 의해 제공
 - on-premise와 cloud 환경 모두 지원
 - 제한 없는 선형 확장성, 향상된 고가용성, 추가 보안 기능, 기술 지원 등의 이점
 - Active-Active 아키텍처 지원

<br/>

## 데이터 충돌을 최소화하는 CRDTs

### CRDT

CRDT는 "Conflict-Free Replicated Data Type"의 약어로, 분산 환경에서 데이터 동기화를 위한 데이터 타입을 나타내는 개념입니다. CRDT는 여러 컴퓨터 노드 간의 데이터 일관성을 보장하고 데이터 충돌을 피하기 위한 방법을 제공합니다.  

<br/>

CRDT의 주요 아이디어는 여러 노드 간에 데이터 변경을 병합할 때 충돌을 피할 수 있는 특수한 데이터 타입을 사용하는 것입니다. 이를 통해 노드 간의 데이터 복제 시 데이터의 일관성을 보장하면서도 분산 환경에서 확장성을 유지할 수 있습니다.  
 - 분산 환경에서 여러 노드들 간에 복제되는 데이터 구조로 3개의 특성을 가진다.
    - 각 노드는 로컬에서 독립적으로 값을 업데이트할 수 있음
        - 각 노드는 자체적으로 데이터를 변경하고, 변경된 데이터를 다른 노드에 전파합니다. 이 때, 충돌이 발생하지 않도록 알고리즘을 사용하여 병합합니다.
    - 노드간에 발생할 수 있는 데이터 충돌은 해당 데이터 타입에 맞는 알고리즘이 해결
        - CRDT는 데이터 타입마다 다양한 병합 알고리즘을 사용합니다. 이 알고리즘은 데이터 변경이 동시에 발생한 경우에도 충돌 없이 병합할 수 있도록 설계되었습니다.
    - 동일 데이터에 대해 노드들간에 일시적으로 다른 값을 가질 수 있지만 최종적으로는 같아짐
        - CRDT에서는 시간 기반 타임스탬프를 사용하여 변경 순서를 추적합니다. 이를 통해 변경의 순서를 파악하여 데이터 병합을 수행합니다.
 - 2011년에 등장하였고 공유 문서 동시 편집 문제를 해결하려고 고안됨
 - CRDT는 주로 분산 데이터베이스나 병렬 처리 시스템에서 사용됩니다. 예를 들어, 분산 파일 시스템, 데이터베이스 복제, 실시간 협업 도구 등에서 데이터의 일관성을 유지하면서 분산된 환경에서 데이터 변경을 처리할 때 활용됩니다.

<br/>

### Redis의 충돌 해결

 - 각 CRDB 인스턴스는 각자의 데이터셋에 Vector Clock을 유지함(vector clock: 데이터 일관성 관리를 위한 버전 정보)
 - 동기화 요청이 왔을 때 해당 데이터의 Vector Clock을 비교해 Old, New, Concurrent로 분류함
 - Concurrent일 때는 아래처럼 충돌 해소 로직 수행
    - CRDT인 경우에는 바로 해결 가능 (ex: Counter)
    - non-CRDT인 경우 LWW(Last Write Wins)를 적용 (ex: String)
    - 같은 데이터에 대해 서로 다른 Command가 충돌하면 미리 정의된 규칙에 따름
 - 충돌 해결 규칙(Command 충돌 시)
    - APPEND vs DEL: update 동작인 APPEND가 적용
    - EXPIRE vs PERSIST: 긴 TTL을 가지는 PERSIST가 적용
    - SADD vs SREM: 데이터 삭제보다 업데이트 동작인 SADD 적용

<br/>

## Docker를 사용해 Active-Active 아키텍처 구성

 - 실습 절차
```
1. Docker 이미지 redislabs/redis를 이용해 3개의 노드를 띄우고 각각 클러스터를 생성
2. 3개의 노드를 네트워크로 연결
3. 3개의 클러스터를 묶어서 CRDB 생성
4. 데이터 쓰기 테스트
5. 네트워크 단절 후 데이터 쓰기
6. 네트워크 복구 후에 동기화 결과 확인
```

<br/>

### 실습

 - Redis 컨테이너 실행, 클러스터 생성, 네트워크 연결, CRDB 생성
```Bash
# Docker 네트워크 생성
$ docker network create redisnet1 --subnet=172.18.0.0/16 --gateway=172.18.0.1
$ docker network create redisnet2 --subnet=172.19.0.0/16 --gateway=172.19.0.1
$ docker network create redisnet3 --subnet=172.20.0.0/16 --gateway=172.20.0.1

# Docker 컨테이너 실행
$ docker run -d \ 
    --cap-add sys_resource \ 
    --name redis01 \ 
    -p 8443:8443 \ 
    -p 9443:9443 \ 
    -p 12000:12000 \ 
    --network=redisnet1 \ 
    --ip=172.18.0.2 \ 
    redislabs/redis

$ docker run -d --cap-add sys_resource --name redis02 -p 8443:8443 -p 9443:9443 -p 12000:12000 --network=redisnet2 --ip=172.19.0.2 redislabs/redis
$ docker run -d --cap-add sys_resource --name redis03 -p 8443:8443 -p 9443:9443 -p 12000:12000 --network=redisnet3 --ip=172.20.0.2 redislabs/redis

# Redis Cluster 생성
$ docker exec -it redis01 /opt/redislabs/bin/rladmin cluster create name cluster1.local username user@test.com password test
$ docker exec -it redis02 /opt/redislabs/bin/rladmin cluster create name cluster2.local username user@test.com password test
$ docker exec -it redis03 /opt/redislabs/bin/rladmin cluster create name cluster3.local username user@test.com password test

# 네트워크 연결
$ docker network connect redisnet1 redis02
$ docker network connect redisnet1 redis03

$ docker network connect redisnet2 redis01
$ docker network connect redisnet2 redis03

$ docker network connect redisnet3 redis01
$ docker network connect redisnet3 redis02

# CRDB 생성
$ docker exec -it redis01 /opt/redislabs/bin/crdb-cli crdb create --name mycrdb --memory-size 512mb --port 12000 --replication false --shards-count 1 --instance fqdn=cluster1.local,username=user@test.com,password=test --instance fqdn=cluster2.local,username=user@test.com,password=test --instance fqdn=cluster3.local,username=user@test.com,password=test
```

 - 데이터 쓰기 테스트
```Bash
# A 프롬프트
$ redis-cli -p 12000
127.0.0.1:12000> set A 123
OK

# B 프롬프트(다른 클러스터)
$ redis-cli -p 12001
127.0.0.1:12001> get A
"123"
127.0.0.1:12001> set name Jay
OK
```

 - 네트워크 단절 후 데이터 쓰기 작업 후 네트워크 복구 후에 동기화 결과 확인
```Bash
# 네트워크 연결 해제
$ docker network disconnect redisnet1 redis02
$ docker network disconnect redisnet1 redis03

$ docker network disconnect redisnet2 redis01
$ docker network disconnect redisnet2 redis03

$ docker network disconnect redisnet3 redis01
$ docker network disconnect redisnet3 redis02

# 각각 노드에서 쓰기 작업
127.0.0.1:12000> incr A
(integer) 124
127.0.0.1:12000> set name Peter
OK

127.0.0.1:12001> incr A
(integer) 124
127.0.0.1:12001> set name John
OK

# 네트워크 연결(장애 복구 혹은 다음 Sync 타이밍)
$ docker network connect redisnet1 redis02
$ docker network connect redisnet1 redis03

$ docker network connect redisnet2 redis01
$ docker network connect redisnet2 redis03

$ docker network connect redisnet3 redis01
$ docker network connect redisnet3 redis02

# 네트워크 복구 후에 동기화 결과 확인
127.0.0.1:12000> get name
"John"
127.0.0.1:12000> get A
"125"
```