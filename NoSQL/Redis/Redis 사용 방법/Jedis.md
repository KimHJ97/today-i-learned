# Jedis 가이드

 - 깃허브 주소: https://github.com/redis/jedis
 - Redis 공식 가이드: https://redis.io/docs/connect/clients/java/

<br/>

## Jedis

Jedis는 Java로 작성된 오픈 소스 Redis 클라이언트 라이브러리입니다. Redis는 메모리 기반의 데이터 구조 저장소로, 데이터베이스, 캐시 및 메시지 브로커로 사용될 수 있습니다. Jedis는 Redis 서버와 통신하여 데이터를 저장, 검색 및 조작하는 데 사용됩니다.  

Jedis 라이브러리를 사용하면 Java 애플리케이션에서 Redis 서버와 상호 작용할 수 있습니다. Jedis는 Java 개발자가 Redis의 강력한 기능을 활용할 수 있도록 다양한 API를 제공합니다. 이를 통해 데이터의 저장, 검색, 수정, 삭제 등의 작업을 수행할 수 있습니다.  

Jedis는 간단하고 직관적인 API를 제공하여 개발자가 Redis와 손쉽게 통합할 수 있도록 도와줍니다. 또한 Jedis는 고성능을 목표로 설계되어 있으며, 다양한 환경에서 안정적으로 동작합니다.  

<br/>

### Jedis 호환 버전

Jedis 라이브러리는 Redis 5.0, 6.0, 6.2, 7.0, 7.2 등을 지원합니다.  

 - Jedis 3.9
    - Redis 5.0, 6.2
    - JDK 8, 11
 - Jedis 4.0+
    - Redis 5.0+
    - JDK 8, 11, 17
 - Jedis 5.0+
    - Redis 6.0+
    - JDK 8, 11, 17

<br/>

### Jedis 의존 라이브러리

 - `Maven`
```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>4.3.1</version>
</dependency>
```
<br/>

 - `Gradle`
```gradle
dependencies {
    implementation 'redis.clients:jedis:4.3.1'
    //...
}
```
<br/>

### Jedis 클라이언트 연결

Jedis를 이용하여 Redis에 연결하기 위해서는 Jedis 연결 풀을 인스턴스화하는 방법이 있습니다. 해당 방식은 try-with-resources 문을 통해 연결을 해제하는 과정을 거치게 됩니다. 그 외 더 쉬운 방법으로는 JedisPooled 이용하는 방법이 있습니다.  

추가적으로 Jedis는 Redis 클러스터 사양을 지원하는 Redis 클러스터를 이용할 수도 있습니다. Redis 클러스터를 연결하기 위해서는 JedisCluster 인스턴스를 사용합니다.  

```java
// 1. try-with-resoucres 문을 이용한 연결
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

JedisPool pool = new JedisPool("localhost", 6379);
try (Jedis jedis = pool.getResource()) {
    jedis.set("clientName", "Jedis");
}

// 2. JedisPooled 객체를 이용한 연결
import redis.clients.jedis.JedisPooled;

JedisPooled jedis = new JedisPooled("localhost", 6379);
jedis.set("clientName", "Jedis");

// 3. Redis 클러스터 연결
import redis.clients.jedis.JedisCluster;
import redis.clients.jedis.HostAndPort;

Set<HostAndPort> jedisClusterNodes = new HashSet<HostAndPort>();
jedisClusterNodes.add(new HostAndPort("127.0.0.1", 7379));
jedisClusterNodes.add(new HostAndPort("127.0.0.1", 7380));
JedisCluster jedis = new JedisCluster(jedisClusterNodes);
```
<br/>

 - `TLS를 사용한 연결`
    - Redis 데이터베이스와 보안 연결을 설정할 수 있습니다.
```java
package org.example;

import redis.clients.jedis.*;

import javax.net.ssl.*;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyStore;

public class Main {

    public static void main(String[] args) throws GeneralSecurityException, IOException {
        HostAndPort address = new HostAndPort("my-redis-instance.cloud.redislabs.com", 6379);

        SSLSocketFactory sslFactory = createSslSocketFactory(
                "./truststore.jks",
                "secret!", // use the password you specified for keytool command
                "./redis-user-keystore.p12",
                "secret!" // use the password you specified for openssl command
        );

        JedisClientConfig config = DefaultJedisClientConfig.builder()
                .ssl(true).sslSocketFactory(sslFactory)
                .user("default") // use your Redis user. More info https://redis.io/docs/management/security/acl/
                .password("secret!") // use your Redis password
                .build();

        JedisPooled jedis = new JedisPooled(address, config);
        jedis.set("foo", "bar");
        System.out.println(jedis.get("foo")); // prints bar
    }

    private static SSLSocketFactory createSslSocketFactory(
            String caCertPath, String caCertPassword, String userCertPath, String userCertPassword)
            throws IOException, GeneralSecurityException {

        KeyStore keyStore = KeyStore.getInstance("pkcs12");
        keyStore.load(new FileInputStream(userCertPath), userCertPassword.toCharArray());

        KeyStore trustStore = KeyStore.getInstance("jks");
        trustStore.load(new FileInputStream(caCertPath), caCertPassword.toCharArray());

        TrustManagerFactory trustManagerFactory = TrustManagerFactory.getInstance("X509");
        trustManagerFactory.init(trustStore);

        KeyManagerFactory keyManagerFactory = KeyManagerFactory.getInstance("PKIX");
        keyManagerFactory.init(keyStore, userCertPassword.toCharArray());

        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(keyManagerFactory.getKeyManagers(), trustManagerFactory.getTrustManagers(), null);

        return sslContext.getSocketFactory();
    }
}
```
<br/>

### Jedis 연결 풀 옵션

JedisPool과 JedisPooled를 사용하여 연결 풀을 생성하 수 있습니다.  
연결 풀은 지정된 수의 연결을 보유하고 필요할 때 더 많은 연결을 생성하고 더 이상 필요하지 않을 때 연결을 종료합니다.  

```java
ConnectionPoolConfig poolConfig = new ConnectionPoolConfig();
// 풀의 최대 활성 연결, 기본값은 8
poolConfig.setMaxTotal(8);

// 풀의 최대 유휴 연결, 기본값은 8
poolConfig.setMaxIdle(8);
// 풀의 최소 유휴 연결, 기본값은 0
poolConfig.setMinIdle(0);

// 연결이 가능해질 때까지 기다리는 것을 활성화
poolConfig.setBlockWhenExhausted(true);
// 연결이 가능해질 때까지 기다리는 최대 시간(초)
poolConfig.setMaxWait(Duration.ofSeconds(1));

// 연결이 유휴 상태인 동안 주기적으로 PING 명령 전송을 활성화
poolConfig.setTestWhileIdle(true);
// 풀에서 유휴 연결을 확인하는 간격을 제어
poolConfig.setTimeBetweenEvictionRuns(Duration.ofSeconds(1));

JedisPooled jedis = new JedisPooled(poolConfig, "localhost", 6379);
```
<br/>

 - `시간 초과`
    - 연결 시간 제한을 설정할 수 있습니다.
```java
HostAndPort hostAndPort = new HostAndPort("localhost", 6379);

JedisPooled jedisWithTimeout = new JedisPooled(hostAndPort,
    DefaultJedisClientConfig.builder()
        .socketTimeoutMillis(5000)  // set timeout to 5 seconds
        .connectionTimeoutMillis(5000) // set connection timeout to 5 seconds
        .build(),
    poolConfig
);
```
<br/>

### Jedis 사용법

 - 공식 Docs: https://www.javadoc.io/doc/redis.clients/jedis/latest/redis/clients/jedis/Jedis.html
```java
/* String 형태 입출력 */
// 문자열 값을 키 값으로 설정합니다.
set(java.lang.String key, java.lang.String value)
set(java.lang.String key, java.lang.String value, SetParams params)

// 지정된 키를 제거합니다.
del(java.lang.String key)
del(java.lang.String... keys)

/* Sets 형태 입출력 */
// 키에 저장된 설정값에 지정된 멤버를 추가합니다.
sadd(byte[] key, byte[]... members)
sadd(java.lang.String key, java.lang.String... members)

// key에 저장된 설정값의 모든 멤버(요소)를 반환합니다.
smembers(byte[] key)
smembers(java.lang.String key)

/* Lists 형태 입출력 */
// 키에 저장된 목록의 헤드(LPUSH) 또는 테일(RPUSH)에 문자열 값을 추가합니다.
lpush(byte[] key, byte[]... strings)
lpush(java.lang.String key, java.lang.String... strings)
rpush(byte[] key, byte[]... strings)
rpush(java.lang.String key, java.lang.String... strings)

// 목록의 첫 번째(LPOP) 또는 마지막(RPOP) 요소를 원자적으로 반환하고 제거합니다.
lpop(java.lang.String key)
lpop(java.lang.String key, int count)
rpop(java.lang.String key)
rpop(java.lang.String key, int count)
```
<br/>

 - `사용 예제`
    - 참고: https://jeong-pro.tistory.com/140
```java
JedisPoolConfig jedisPoolConfig = new JedisPoolConfig();

// 1. Jedis풀 생성(JedisPoolConfig, host, port, timeout, password)
String host = "127.0.0.1";
int port = 6379;
int timeout = 3000;
int db = 2;

JedisPool pool = new JedisPool(jedisPoolConfig, host, port, timeout, null, db);

// 2. 필요할 때마다 getResource()로 받아서 쓰고 다 쓰면 close로 닫아야 한다.
Jedis jedis = pool.getResource();

// 데이터 입력
jedis.set("jeong", "pro");
//데이터 출력
System.out.println(jedis.get("jeong"));//pro
//데이터 삭제
jedis.del("jeong");
System.out.println(jedis.get("jeong"));//null

try {
    jedis.set("key", "value");
    // 데이터 만료시간 지정: 5초 동안만 "key"를 key로 갖는 데이터 유지
    edis.expire("key", 5);
    Thread.sleep(4000);
    System.out.println(jedis.get("key"));//value
    Thread.sleep(2000);
    System.out.println(jedis.get("key"));//null
} catch (Exception e) {
    e.printStackTrace();
}

/* Lists 형태 입출력 */
jedis.lpush("/home/jdk", "firstTask");
jedis.lpush("/home/jdk", "secondTask");
System.out.println(jedis.rpop("/home/jdk"));//firstTask
System.out.println(jedis.rpop("/home/jdk"));//secondTask

/* Sets 형태 입출력 */
jedis.sadd("nicknames", "jeongpro");
jedis.sadd("nicknames", "jdk");
jedis.sadd("nicknames", "jeongpro");
Set<String> nickname = jedis.smembers("nicknames");
Iterator iter = nickname.iterator();
while(iter.hasNext()) {
    System.out.println(iter.next());
}

/* Hashes 형태 입출력 */
edis.hset("user", "name", "jeongpro");
jedis.hset("user", "job", "software engineer");        
jedis.hset("user", "hobby", "coding");                
System.out.println(jedis.hget("user","name"));//jeongpro        
Map<String, String> fields = jedis.hgetAll("user");        
System.out.println(fields.get("job"));//software engineer                

/* Sorted Sets 형태 입출력 */            
jedis.zadd("scores", 6379.0, "PlayerOne");        
jedis.zadd("scores", 8000.0, "PlayerTwo");        
jedis.zadd("scores", 1200.5, "PlayerThree");                
System.out.println(jedis.zrangeByScore("scores", 0, 10000));        
                      
if(jedis != null) {
    jedis.close();        
}        
pool.close();
```
<br/>

### Jedis 사용 예제

 - `Docker를 이용한 Redis 설치`
```sh
docker run -p 6379:6379 -it redis/redis-stack:latest
```
<br/>

 - `예제 코드`
```java
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

public class Main {
    public static void main(String[] args) {
        JedisPool pool = new JedisPool("localhost", 6379);

        try (Jedis jedis = pool.getResource()) {
            // Store & Retrieve a simple string
            jedis.set("foo", "bar");
            System.out.println(jedis.get("foo")); // prints bar
            
            // Store & Retrieve a HashMap
            Map<String, String> hash = new HashMap<>();;
            hash.put("name", "John");
            hash.put("surname", "Smith");
            hash.put("company", "Redis");
            hash.put("age", "29");
            jedis.hset("user-session:123", hash);
            System.out.println(jedis.hgetAll("user-session:123"));
            // Prints: {name=John, surname=Smith, company=Redis, age=29}
        }
    }
}
```
