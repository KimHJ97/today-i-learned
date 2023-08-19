# 클러스터 구성 실습

## 클러스터 설정 파일 이해하기

 - Redis Cluster 설정
    - cluster-enabled yes
        - 클러스터 모드로 실행할 지 여부를 결정
    - cluster-config-file filename
        - 해당 노드의 클러스터를 유지하기 위한 설정을 저장하는 파일로 사용자가 수정하지 않음
    - cluster-node-timeout milliseconds
        - 특정 노드가 정상이 아닌 것으로 판단하는 기준 시간으로 이 시간동안 감지되지 않는 Master는 Replica에 의해 Failover가 이루어짐
    - cluster-replica-validity-factory factory
        - Master와 통신한지 오래된 Replica가 Failover를 수행하지 않게 하기 위한 설정
        - (cluster-node-timeout * factor)만큼 Master와 통신이 없었던 Replica는 Failover 대상에서 제외된다.
    - cluster-migration-barrier count
        - 한 Master가 유지해야 하는 최소 Replica의 개수
        - 이 개수를 충족하는 선에서 일부 Replica는 Replica를 가지지 않은 Master의 Replica로 migrate될 수 있다.
    - cluster-require-full-coverage yes
        - 일부 Hash Slot이 커버되지 않을 때 Write 요청을 받지 않을지 여부
        - no로 설정하게 되면 일부 노드에 장애가 생겨 해당 Hash Slot이 정상 작동하지 않더라도 나머지 Hash Slot에 대해서는 작동하도록 할 수 있다.
    - cluster-allow-reads-when-down yes
        - 클러스터가 정상 상태가 아닐 떄도 read 요청은 받도록 할지 여부
        - 애플리케이션에서 read 동작의 consistency가 중요치 않은 경우에 yes로 설정할 수 있다.
```conf
# 클러스토 모드 활성화
cluster-enabled yes

# 클러스터의 구성 파일 설정 (각 노드의 구성 정보 저장)
cluster-config-file <filename>
```

<br/>

## 클러스터 구성하기

 - Mac
    - 7000 ~ 7005번 포트로 클러스터 모드로 실행 
```Bash
$ brew install redis

$ mkdir 7000
$ cp redis.conf 7000/redis-7000.conf
$ cd 7000
$ code redis-7000.conf
port 7000
cluster-enabled yes

$ redis-server ./redis-7000.conf
```

 - 클러스터 구성 설정
    - redis-cli를 이용하여 구성이 가능하다.
```Bash
$ redis-cli \ 
    --cluster create localhost:7000 localhost:7001 localhost:7002 localhost:7003 localhost:7004 localhost:7005 \ 
    --cluster-replicas 1

# 클러스터 사용
$ redis-cli -p 7000
127.0.0.1:7000> cluster nodes

# 노드 추가
$ mkdir 7006
$ cp redis.conf 7006/redis-7006.conf
$ cd 7006
$ code redis-7006.conf
port 7006
cluster-enabled yes
$ redis-server ./redis-7006.conf

$ mkdir 7007
$ cp redis.conf 7007/redis-7007.conf
$ cd 7007
$ code redis-7007.conf
port 7007
cluster-enabled yes
$ redis-server ./redis-7007.conf

# 클러스터 노드 추가 (7006:마스터, 7007:슬레이브)
$ redis-cli --cluster add-node localhost:7006 localhost:7000
$ redis-cli --cluster add-node localhost:7007 localhost:7006 --cluster-slave
```

<br/>

## Spring을 이용한 클러스터 사용

Spring에서 Redis를 클러스터 모드로 동작하기 위해서는 단순히 애플리케이션 옵션에 클러스터 서버 정보만 설정해주면 된다.  
사용하는 곳의 소스 코드 변경은 필요없고, 클러스터 동작 옵션만 주면 된다.

 - applicaion.yml
```yml
spring:
  redis:
    cluster:
      nodes: 127.0.0.1:7000,127.0.0.1:7001,127.0.0.1:7002,127.0.0.1:7003,127.0.0.1:7004,127.0.0.1:7005
```

 - SimpleTest.java
    - setValues(): 다양한 클러스터에 값이 저장되도록 한다.
    - getValues(): 클러스터에 값을 조회한다. 이떄, 특정 마스터 서버를 죽이고 Failover가 된 다음에도 들어가있는 값들이 제대로 조회가 되는지 확인한다.
```Java
@SpringBootTest
class SimpleTest {

    @Autowired
    RedisTemplate redisTemplate;

    String dummyValue = "banana";

    @Test
    void setValues() {
        ValueOperations<String, String> ops = redisTemplate.opsForValue();

        for(int i = 0; i < 1000; i++) {
            String key = String.format("name:%d", i);   // name:1
            ops.set(key, dummyValue);
        }
    }

    @Test
    void getValues() {
        ValueOperations<String, String> ops = redisTemplate.opsForValue();

        for(int i = 0; i < 1000; i++) {
            String key = String.format("name:%d", i);   // name:1
            String value = ops.get(key);

            assertEquals(value, dummyValue);
        }
    }
}
```