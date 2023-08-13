# Redis Data Type의 이해

레디스는 Key-Value Store로 Value의 다양한 데이터 타입을 지원한다.  

<br/>

## Strings

가장 기본적인 데이터 타입으로 키 하나의 문자열 값이 저장된다.  
 - 바이트 배열을 저장(binary-safe), 즉 모든 문자를 저장할 수 있다.
 - 바이너리로 변환할 수 있는 모든 데이터를 저장 가능(JPG와 같은 파일 등)
 - 최대 크기는 512MB
 - Strings 주요 명령어
    - SET
        - 특정 키에 문자열 값을 저장한다.
        - SET key1 value1
    - GET
        - 특정 키의 문자열 값을 얻어온다.
        - GET key1
    - INCR
        - 특정 키의 값을 Integer로 취급하여 1 증가시킨다. (아토믹 연산)
        - INCR mycount
    - DECR
        - 특정 키의 값을 Integer로 취급하여 1 감소시킨다. (아토믹 연산)
        - DECR mycount
    - MSET
        - 여러 키에 대한 값을 한 번에 저장한다.
        - MSET key1 value1 key2 value2
    - MGET
        - 여러 키에 대한 값을 한 번에 얻어온다.
        - MGET key1 key2
```Bash
127.0.0.1:6379> SET key1 hi
OK

127.0.0.1:6379> GET key1
"hi"

127.0.0.1:6379> INCR key1
(error) ERR value is not an integer or out of range

127.0.0.1:6379> SET mycount
OK

127.0.0.1:6379> INCR mycount
(integer) 11
```

<br/>

## Lists

List는 Key-Value 형태에서 Value안에 하나의 값이 아닌 여러 개의 값이 집합으로 들어가있는 형태의 데이터 타입을 뜻한다.  
 - Linked-list 형태의 자료구조(인덱스 접근은 느리지만 데이터 추가/삭제가 빠름)
 - Queue와 Stack으로 사용할 수 있음 (넣고 뺴는 방향에 따라)
 - Lists 주요 명령어
    - LPUSH
        - 리스트의 왼쪽에 새로운 값을 추가한다.
        - LPUSH mylist apple
    - RPUSH
        - 리스트의 오른쪽에 새로운 값을 추가한다.
        - RPUSH mylist banana
    - LLEN
        - 리스트에 들어있는 아이템 개수를 반환한다.
        - LLEN mylist
    - LRANGE
        - 리스트의 특정 범위를 반환한다. (시작점과 끝점을 지정한다.)
        - LRANGE mylist 0 -1
    - LPOP
        - 리스트의 왼쪽에서 값을 삭제하고 반환한다.
        - LPOP mylist
    - RPOP
        - 리스트의 오른쪽에서 값을 삭제하고 반환한다.
        - RPOP mylist
```Bash
127.0.0.1:6379> LPUSH mylist apple
(integer) 1

127.0.0.1:6379> LPUSH mylist banana
(integer) 2

127.0.0.1:6379> LLEN mylist
(integer) 2

127.0.0.1:6379> LRANGE mylist 0 -1
1) "banana"
2) "apple"

127.0.0.1:6379> LPOP mylist
"banana"
```

<br/>

## Sets

Set은 순서가 없는 유니크한 값의 집합으로 하나의 Set안에 같은 값을 넣더라도 중복으로 여러 값이 들어가지 않고, 하나의 값으로 표시된다.  
 - 검색이 빠르고, 개별 접근을 위한 인덱스가 존재하지 않고, 집합 연산이 가능(교집합, 합집합 등)
 - 만약, 쇼핑몰 쿠폰 발급 이벤트를 한다고 했을 때 Set에 값으로 UserId를 저장하고, SISMEMBER를 통해 해당 키에 해당 UserId가 포함되어있는지 빠른 속도로 조회가 가능하다.
 - Sets 주요 명령어
    - SADD
        - Set에 데이터를 추가한다.
        - SADD myset apple
    - SREM
        - Set에 데이터를 삭제한다.
        - SREM myset apple
    - SCARD
        - Set에 저장된 아이템 개수를 반환한다.
        - SCARD myset
    - SMEMBERS
        - Set에 저장된 아이템들을 반환한다.
        - SMEMBERS myset
    - SISMEMBER
        - 특정 값이 Set에 포함되어 있는 지를 반환한다.
        - SISMEMBER myset apple
```Bash
127.0.0.1:6379> SADD myset apple
(integer) 1

127.0.0.1:6379> SADD myset banana
(integer) 1

127.0.0.1:6379> SCARD myset
(integer) 2

127.0.0.1:6379> SMEMBERS myset
1) "apple"
2) "banana"

127.0.0.1:6379> SREM myset apple
(integer) 1

127.0.0.1:6379> SISMEMBER myset banana
(integer) 1
127.0.0.1:6379>  SISMEMBER grape
(integer) 0
```

<br/>

## Hashes

Hash는 하나의 Key안에 여러 개의 필드와 값 쌍을 저장할 수 있는 데이터 타입이다.  
 - 하나의 Key 하위에 여러 개의 Field-Value 쌍을 저장
 - 여러 필드를 가진 객체를 저장하는 것으로 생각할 수 있음
 - HINCRBY 명령어를 사용해 카운터로 활용 가능
 - Hash 주요 명령어
    - HSET
        - 한개 또는 다수의 필드에 값을 저장한다.
        - HSET user1 name bear age 10
    - HGET
        - 특정 필드의 값을 반환한다.
        - HGET user1 name
    - HMGET
        - 한개 이상의 필드 값을 반환한다.
        - HMGET user1 name age
    - HINCRBY
        - 특정 필드의 값을 Integer로 취급하여 지정한 숫자를 증가시킨다.
        - HINCRBY user1 viewcount 1
    - HDEL
        - 한개 이상의 필드를 삭제한다.
        - HDEL user1 name age
```Bash
127.0.0.1:6379> HSET user1 name bear age 10
(integer) 2

127.0.0.1:6379> HGET user1 name
"bear"

127.0.0.1:6379> HMGET user1 name age
1) "bear"
2) "10"
```

<br/>

## Sorted Sets

SortedSet은 Set과 유사하며 순서가 없느 유니크한 값들의 집합을 표현하며, Set과 다른 점은 각 값들이 score를 가지고 정렬되어 있다는 것이다.  
 - Set과 유사하게 유니크한 값의 집합
 - 각 값은 연관된 score를 가지고 정렬되어 있음
 - 정렬된 상태이기에 빠르게 최소/최대값을 구할 수 있음
 - 순위 계산, 리더보드 구현 등에 활용
 - Sorted Set 주요 명령어
    - ZADD
        - 한개 또는 다수의 값을 추가 또는 업데이트한다.
        - ZADD myrank 10 apple 20 banana
    - ZRANGE
        - 특정 범위의 값을 반환한다. (오름차순으로 정렬된 기준)
        - ZRANGE myrank 0 1
    - ZRANK
        - 특정 값의 위치(순위)를 반환한다. (오름차순으로 정렬된 기준)
        - ZRANK myrank apple
    - ZREVRANK
        - 특정 값의 위치(순위)를 반환한다. (내림차순으로 정렬된 기준)
        - ZREVRANK myrank apple
    - ZREM
        - 한개 이상의 값을 삭제한다.
        - ZREM myrank apple
```Bash
127.0.0.1:6379> ZADD myrank 10 apple 20 banana 30 grape
(integer) 3

127.0.0.1:6379> ZRANGE myrank 0 2
1) "apple"
2) "banana"
3) "grape"

127.0.0.1:6379> ZRANK myrank grape
(integer) 2

127.0.0.1:6379> ZREVRANK myrank grape
(integer) 0
```

<br/>

## Bitmaps

Bitmap은 비트 벡터를 의미하며, 비트 벡터를 사용해 N개의 Set을 공간 효율적으로 저장한다.
 - 비트 벡터를 사용해 N개의 Set을 공간 효율적으로 저장
 - 하나의 비트맵이 가지는 공간은 4,294,967,295(2^32-1)
 - 비트 연산 가능
 - Bitmap 주요 명령어
    - SETBIT
        - 비트맵의 특정 오프셋에 값을 변경한다.
        - SETBIT visit 10 1
    - GETBIT
        - 비트맵의 특정 오프셋의 값을 반환한다.
        - GETBIT visit 10
    - BITCOUNT
        - 비트맵에서 set(1) 상태인 비트의 개수를 반환한다.
        - BITCOUNT visit
    - BITOP
        - 비트맵들간의 비트 연산을 수행하고 결과를 비트맵에 저장한다.
        - BITOP AND result today yesterday
        - BITOP OR result today yesterday
```Bash
# 오늘 접속 유저 저장
127.0.0.1:6379> SETBIT today_visit 2 1
(integer) 0
127.0.0.1:6379> SETBIT today_visit 3 1
(integer) 0
127.0.0.1:6379> SETBIT today_visit 4 1
(integer) 0
127.0.0.1:6379> BITCOUNT today_visit
(integer) 3

# 어제 접속 유저 저장
127.0.0.1:6379> SETBIT yesterday_visit 2 1
(integer) 0
127.0.0.1:6379> SETBIT yesterday_visit 3 1
(integer) 0
127.0.0.1:6379> BITCOUNT yesterday_visit
(integer) 2

# 어제와 오늘 접속한 유저 연산
127.0.0.1:6379> BITOP AND result yesterday_visit today_visit
(integer) 1
127.0.0.1:6379> BITCOUNT result
(integer) 2

127.0.0.1:6379> GETBIT result 2
(integer) 1
127.0.0.1:6379> GETBIT result 3
(integer) 1
```

<br/>

## HyperLogLog


HyperLogLog는 대량의 고유한 원소의 개수를 근사적으로 계산하기 위한 확률적 데이터 구조입니다.  
이는 대규모 데이터 세트에서 고유한 원소의 개수를 정확하게 세는 것이 어려운 경우에 유용합니다.  
예를 들어, 웹 사이트의 방문자 수나 특정 이벤트의 사용자 수와 같은 대량의 데이터에서 중복을 제거하고 고유한 원소의 개수를 빠르게 계산하는데 사용됩니다.  
__`HyperLogLog는 근사치를 제공하는 확률적인 알고리즘이기 때문에, 정확한 결과를 보장하지는 않지만 매우 적은 메모리 공간을 사용하여 고유한 원소의 개수를 추정할 수 있는 장점이 있습니다.`__

 - 유니크한 값의 개수를 효율적으로 얻을 수 있음
 - 확률적 자료 구조로서 오차가 있으며, 매우 큰 데이터를 다룰 때 사용
 - 18,446,744,073,709,551,616(2^64)개의 유니크 값을 계산 가능
 - 12KB까지 메모리를 사용하며 0.81%의 오차율을 허용
 - HyperLogLog 주요 명령어
    - PFADD
        - HyperLogLog에 값들을 추가한다.
        - PFADD visit Jay Peter Jane
    - PFCOUNT
        - HyperLogLog에 입력된 값들의 cardinality(유일값의 수)를 반환한다.
        - PFCOUNT visit
    - PFMERGE
        - 다수의 HyperLogLog를 병합한다.
        - PFMERGE result visit1 visit2
```Bash
127.0.0.1:6379> PFADD visit Jay Peter Jane
(integer) 1

127.0.0.1:6379> PFCOUNT visit
(integer) 3
```