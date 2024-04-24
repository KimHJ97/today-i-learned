# Redis 데이터 구조 학습

```bash
# Redis Client 접속
$ redis-cli -p 6380
```

### String

String 타입의 데이터 구조로 텍스트, 직렬화된 객체 등을 저장하는 용도로 자주 사용된다.  

 - SET: 지정된 Key의 문자열을 저장
 - GET: 지정된 Key의 저장된 문자열을 조회

```bash
SET key value
GET key
```
<br/>

### List

데이터 삽입 순서에 따라 정렬된 문자열 컬렉션의 형태이다.  

 - LRANGE: 리스트에서 지정된 범위의 요소를 반환
 - LPUSH: 리스트의 Head에 지정된 요소를 추가
 - RPUSH: 리스트의 Tail에 지정된 요소를 추가
 - LPOP: 리스트의 첫 번쨰 요소를 제거하고 반환
 - RPOP: 리스트의 마지막 요소를 제거하고 반환
 - LLEN: 리스트에 저장된 요소 수를 반환 (리스트 사이즈) [시간복잡도 O(1)]
 - LPOS: 리스트에서 일치하는 요소를 찾고 인덱스를 반환 [시간복잡도 O(N)]
```bash
LRANGE key start stop
LPUSH key element
RPUSH key element
LPOP key [count]
RPOP key [count]
LLEN key
LPOS key element
```
<br/>

### Set

순서가 지정되지 않은 문자열 컬렉션의 형태로 중복 요소가 허용되지 않는다.  

 - SMEMBERS: Set에 저장된 모든 요소를 반환 [시간 복잡도 O(N)]
 - SADD: Set에 멤버를 추가 [시간복잡도 O(1)]
 - SISMEMBER: Set에 멤버가 포함되어 있는지 확인 [시간복잡도 O(1)]
 - SCARD: Set에 저장된 요소 수를 반환 [시간복잡도 O(1)]
 - SREM: Set에 저장된 요소를 제거 (시간복잡도 O(삭제할요소수))
```bash
SMEMBERS key
SADD key member
SISMEMBER key member
SCARD key
SREM key member
```
<br/>

### Sorted Set

지정한 스코어에 따라서 순서가 지정되는 문자열 컬렉션 형태로 중복 요소가 허용되지 않는다.  

 - ZRANGE: Sorted Set에 저장된 범위 내(순위, 스코어) 요소를 반환 [시간복잡도 O(log(N)+M)]
 - ZADD: member가 score에 의해 정렬 및 저장. 동일한 score인 경우 사전순 정렬
 - ZCARD: 해당하는 Key의 요소 수를 반환
 - ZPOPMIN: 점수가 낮은 순으로 멤버를 제거하고 반환
 - ZPOPMAX: 점수가 낮은 순으로 멤버를 제거하고 반환
```bash
ZRANGE key start stop
ZADD key score member
ZCARD key
ZPOPMIN key [count]
ZPOPMAX key [count]
```

