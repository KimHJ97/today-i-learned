# Redis 개발 실습

## Java 개발 환경 구성

 - Language: Java 8(1.8)
 - Framework: SpringBoot 2.7
 - IDE: IntelliJ IDEA

<br/>

### Spring Initializr

프로젝트 생성 시 Gradle 파일에 Spring Boot용 설정을 일일이 추가하는 수고를 덜어주는 툴로 Spring Boot 버전을 선택하고 필요한 의존성을 추가할 수 있다.  
 - https://start.spring.io/
```
Project
 - Gradle Project

Language
 - Java

Spring Boot
 - 2.7.5

Project Metadata
 - Group: com.example
 - Artifact: helloworld
 - Name: helloworld
 - Description: 프로젝트 설명
 - Package name: com.example.helloworld
 - Packaging: Jar
 - Java: 8

Dependencies
 - Spring Web
```

<br/>

### 프로젝트 소스 코드

Spring Initializr을 통해 만든 Spring Boot 프로젝트를 IntelliJ IDEA를 통해 열어준다.  

 - Redis 의존성 추가하기 (build.gradle 변경)
    - Reids를 Java에서 사용하기 위해서는 Redis를 연결해주는 라이브러리를 사용해야 한다.
    - Lettuce: 가장 많이 사용되는 라이브러리로 Spring Data Redis에 내장되어 있다.
    - Spring Data Redis는 RedisTemplate라는 Redis 조작의 추상 레이어를 제공한다. (Lettuce 라이브러리를 직접 조작하는 것이 아니라, Spring Data Redis를 조작하여 구현체를 사용할 수 있다.)
        - 추상화된 레이러를 이용함으로써 구현체 변경이 용이하고, 구현체마다 다른 에러에 대한 추상화된 에러를 받을 수 있어 공통 에러 처리도 가능하다.
```build.gradle
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-data-redis'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	..
}
```

 - Redis 호스트와 포트 설정
    - applicayion.yml 파일에 Redis 서버에 대한 정보를 설정한다.
```yml
spring:
  redis:
    host: localhost
    port: 6379
```

 - HelloController 만들기
    - StringRedisTemplate를 통해 Redis에 키-값 쌍을 저장한다.
    - [GET] "/setFruit?name=과일명": Redis String 타입으로 "fruit" 키에 과일명 값을 저장한다.
    - [GET] "/getFruit": Reids String 타입의 "fruit" 키의 저장된 값을 반환한다.
```Java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @Autowired
    StringRedisTemplate redisTemplate;

    @GetMapping("/hello")
    public String hello() {
        return "hello world!";
    }

    @GetMapping("/setFruit")
    public String setFruit(@RequestParam String name) {
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        ops.set("fruit", name);

        return "saved.";
    }

    @GetMapping("/getFruit")
    public String getFruit() {
        ValueOperations<String, String> ops = redisTemplate.opsForValue();
        String fruitName = ops.get("fruit");

        return fruitName;
    }
}
```

<br/>

## RedisTemplate

RedisTemplate은 Spring Framework에서 제공하는 클래스로, Redis 데이터베이스와 상호작용하기 위한 고급 수준의 템플릿 클래스입니다.  
RedisTemplate은 다양한 데이터 유형과 작업을 처리할 수 있는 유연한 인터페이스를 제공하며, Redis 데이터베이스와의 상호작용을 추상화하여 개발자가 더 편리하게 Redis 데이터를 다룰 수 있도록 합니다.  
 - RedisTemplate은 Spring Data Redis 모듈의 일부로 제공되며, 다양한 데이터 유형에 대한 CRUD(Create, Read, Update, Delete) 작업을 지원하고 Redis 서버와의 통신을 캡슐화합니다. 특히, 문자열, 해시맵, 리스트, 셋, 정렬된 집합 등 다양한 Redis 데이터 구조를 다룰 수 있습니다.
 - opsForValue: Strings를 쉽게Serialize / Deserialize 해주는 Interface
 - opsForList: List를 쉽게 Serialize / Deserialize 해주는 Interface
 - opsForSet: Set를 쉽게 Serialize / Deserialize 해주는 Interface
 - opsForZSet: ZSet를 쉽게 Serialize / Deserialize 해주는 Interface
 - opsForHash: Hash를 쉽게 Serialize / Deserialize 해주는 Interface

<br/>

## StringRedisTemplate
StringRedisTemplate은 Spring Framework에서 제공하는 클래스로, Redis 서버와 상호작용하기 위해 문자열 데이터를 처리하는 데 사용되는 템플릿 클래스입니다.  
Redis 데이터베이스에 저장된 데이터를 문자열 형태로 읽고 쓰는 작업을 간편하게 수행할 수 있도록 도와줍니다.  
 - RedisTemplate를 상속받은 클래스로 대부분 레디스 key-value 는 문자열 위주이기 때문에 문자열에 특화된 템플릿을 제공
    - setKeySerializer(RedisSerializer.string()): 이 메서드는 RedisTemplate의 키(key) 직렬화 설정을 문자열 직렬화로 변경합니다. 즉, 키를 문자열로 직렬화하여 저장하거나 조회할 때 사용됩니다.
    - setValueSerializer(RedisSerializer.string()): 이 메서드는 RedisTemplate의 값(value) 직렬화 설정을 문자열 직렬화로 변경합니다. 즉, 값을 문자열로 직렬화하여 저장하거나 조회할 때 사용됩니다.
    - setHashKeySerializer(RedisSerializer.string()): 이 메서드는 해시맵의 키(key)를 문자열로 직렬화하는 설정을 변경합니다. 해시맵 내의 키들을 문자열로 직렬화하여 저장하거나 조회할 때 사용됩니다.
    - setHashValueSerializer(RedisSerializer.string()): 이 메서드는 해시맵의 값(value)을 문자열로 직렬화하는 설정을 변경합니다. 해시맵 내의 값들을 문자열로 직렬화하여 저장하거나 조회할 때 사용됩니다.
    - 이러한 설정을 적용하면 Redis에 저장되는 데이터의 내용이 객체로 직렬화되는 대신, 문자열 형태로 저장되므로 데이터를 더 쉽게 읽고 이해할 수 있습니다. 그리고 Redis 클라이언트를 통해 데이터를 확인하는 경우에도 문자열 형태로 읽을 수 있어 편리합니다.
```Java
public class StringRedisTemplate extends RedisTemplate<String, String> {

	public StringRedisTemplate() {
		setKeySerializer(RedisSerializer.string());
		setValueSerializer(RedisSerializer.string());
		setHashKeySerializer(RedisSerializer.string());
		setHashValueSerializer(RedisSerializer.string());
	}

    ..
}
```