# 프로젝트 환경설정

## 1. Sakila Database

Sakila Database는 MySQL 데이터베이스 관리 시스템을 위한 샘플 데이터베이스입니다. MySQL AB(현재는 Oracle Corporation에 인수됨)가 개발했으며, 학습, 테스트 및 데모 목적으로 자주 사용됩니다. Sakila Database는 영화 대여점을 모델로 하며, 다양한 테이블과 관계를 포함하여 복잡한 SQL 쿼리를 연습하고 실험할 수 있는 좋은 자료를 제공합니다.  
 - MySQL에서 공식적으로 제공하는 데모용 DB
 - 주요 테이블
    - actor: 배우 정보
    - film: 영화 정보
    - category: 영화 장르
    - film_category: 영화와 장르 간의 관계
    - film_actor: 영화와 배우 간의 관계
 - jOOQ Sakila 깃허브: https://github.com/jOOQ/sakila

<br/>

## 2. Sakila DB 환경 구축

```bash
# 1. 볼륨 생성
docker volumn create sakila_volume

# 2. docker-compose 실행
# docker-compose.yml 파일이 있는 경로로 이동한 다음 실행한다.
docker-compose up -d

# 3. 접속 확인: DB Client를 이용한다.
# localhost: 3306 
# ID: root
# PW: passwd

# 4. Sakila DB 정보 등록
# DDL 실행: mysql-sakila-schema.sql
# Seed 데이터 생성: mysql-sakila-insert-data.sql

# 5. 컨테이너 중지
docker-compose stop

# 6. 컨테이너 삭제
# docker-compose down
```

<br/>

## 3. jOOQ 프로젝트 생성하기

### 3-1. 프로젝트 기술 스팩

 - JDK 17
 - Spring Boot 3.2.4
 - jOOQ 3.19.5
 - Gradle 8.5
    - jOOQ Plugin: https://github.com/etiennestuder/gradle-jooq-plugin

<br/>

### 3-2. 프로젝트 실습

 - `build.gradle`
    - MySQL Driver, JOOQ Access Layer
```groovy
// jOOQ 버전을 전역 변수로 관리
buildscript {
	ext {
		jooqVersion = '3.19.5'
	}
}

plugins {
	id 'java'
	id 'org.springframework.boot' version '3.2.3'
	id 'io.spring.dependency-management' version '1.1.4'

    // JOOQ 플러그인 저으이
	id 'nu.studer.jooq' version '9.0'
}

group = 'org.sight'
version = '0.0.1-SNAPSHOT'

java {
	sourceCompatibility = '17'
}

repositories {
	mavenCentral()
}

// 생성된 DSL을 소스 코드에 포함하도록 설정
sourceSets {
	main {
		java {
			srcDirs = ["src/main/java", "src/generated"]
		}
	}
}

dependencies {

	implementation 'org.springframework.boot:spring-boot-starter'
	runtimeOnly 'com.mysql:mysql-connector-j'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'

	// 1. JOOQ 버전을 직접 정의하기 위해 제외 처리
    implementation ('org.springframework.boot:spring-boot-starter-jooq') {
		exclude group: 'org.jooq:jooq'
	}

    // 2. 직접 정의한 JOOQ 버전의 의존성 정의
	implementation "org.jooq:jooq:${jooqVersion}"

    // 3. JOOQ 코드 제네레이터 필요 의존성 정의
	jooqGenerator 'com.mysql:mysql-connector-j'
	jooqGenerator "org.jooq:jooq:${jooqVersion}"
	jooqGenerator "org.jooq:jooq-meta:${jooqVersion}"
}

tasks.named('test') {
	useJUnitPlatform()
}

// JOOQ 플러그인 설정
String dbUser   = System.properties["db-user"]   ?: "root"
String dbPasswd = System.properties["db-passwd"] ?: "passwd"

jooq {
	version = "${jooqVersion}"
	configurations {
		sakilaDB {
			generationTool {
				jdbc {
					driver = 'com.mysql.cj.jdbc.Driver'
					url = 'jdbc:mysql://localhost:3306'
					user = "${dbUser}"
					password = "${dbPasswd}"
				}

				generator {
					name = 'org.jooq.codegen.DefaultGenerator'

					database {
						name = 'org.jooq.meta.mysql.MySQLDatabase'

						schemata {
							schema {
								inputSchema = 'sakila'
							}
						}
					}

					// 생성할 항목 지정
					generate {
						daos = true
						records = true
						fluentSetters = true
						javaTimeTypes = true
						deprecated = false
					}

					// DSL 생성 경로 지정
					target {
						directory = 'src/generated'
					}
				}
			}
		}
	}
}
```
<br/>

### 3-3. 생성된 DSL 구조 살펴보기

Gradle Task로 jooq 항목에 generateXxxJooq를 수행하면 DSL 파일이 생성된다.  

jOOQ를 사용하여 generateXxxJooq 작업을 수행하면, 데이터베이스 스키마에 기반하여 자바 코드가 자동으로 생성됩니다. 이 자바 코드는 SQL 쿼리를 타입 안전하게 작성하고 실행할 수 있는 DSL (Domain-Specific Language) API를 포함합니다.  

 - Routines: DB의 프로시저 정보를 읽어 자바 코드로 만든다.
 - Tables: DB의 테이블 정보를 읽어 자바 코드로 만든다.
 - tables 패키지: DB의 테이블 정보를 읽어 자바 코드로 만든다.
	- pojos: 각 테이블에 대응하는 POJO 클래스 생성
	- records: 각 테이블에 대응하는 레코드 클래스 생성
	- daos: 각 테이블에 대응하는 DAO(Data Access Object) 클래스 생성

<br/>

## 4. jOOQ DSL Custom 하기

 - DSL generate strategy: DSL 생성 클래스 이름 커스텀
 - DSL generate: DSL들 중에서 무엇을 생성할지 커스텀
 - jOOQ runtime configuration: 런타임 jOOQ 커스텀

<br/>

### 4-1. jOOQ 서브 모듈 만들기

 - `jOOQ-custom/build.gradle`
```groovy
plugins {
    id 'java'
}

group 'com.sightstudio'
version '0.0.1-SNAPSHOT'

repositories {
    mavenCentral()
}

dependencies {
    implementation "org.jooq:jooq-codegen:${jooqVersion}"
    runtimeOnly 'com.mysql:mysql-connector-j:8.2.0'
}
```
<br/>

 - `src/main/java/jooq/custom/generator/JPrefixGeneratorStrategy.java`
```java
public class JPrefixGeneratorStrategy extends DefaultGeneratorStrategy {

    @Override
    public String getJavaClassName(final Definition definition, final Mode mode) {
        if (mode == Mode.DEFAULT) {
            return "J" + super.getJavaClassName(definition, mode);
        }
        return super.getJavaClassName(definition, mode);
    }
}
```
<br/>

 - `루트 프로젝트/build.gradle`
```groovy
dependencies {
	// ..

	jooqGenerator project(':jooq-custom')
	jooqGenerator "org.jooq:jooq:${jooqVersion}"
	jooqGenerator "org.jooq:jooq-meta:${jooqVersion}"
}

jooq {
	version = "${jooqVersion}"
	configurations {
		sakilaDB {
			generationTool {
				// ..

				generator {
					// ..

					generate {
						daos = true
						records = true
						fluentSetters = true
						javaTimeTypes = true
						deprecated = false

						// jpaAnnotations = true
						// jpaVersion = 2.2
						// validationAnnotations = true
						// springAnnotations = true
						// springDao = true
					}

					// jooq-custom 내부의 설정
					strategy.name = 'jooq.custom.generator.JPrefixGeneratorStrategy'
				} 
			}
		}
	}
}
```
<br/>

### 4-2. 테스트 코드

```java
@SpringBootTest
class FirstLookjOOQTest {
	@Autowired
	DSLContext dslContext;

	@Test
	void test() {
		dslContext.selectFrom(JActor.ACTOR)
				.limit(10)
				.fetch();
	}
}
```
<br/>

 - `JooqConfig`
	- SQL 수행시 스키마명을 제외하고 싶은 경우 아래 옵션을 추가한다.
```java
@Configuration
public class JooqConfig {

    @Bean
    Settings jooqSettings() {
        return new Settings()
                .withRenderSchema(false);
    }
}
```

