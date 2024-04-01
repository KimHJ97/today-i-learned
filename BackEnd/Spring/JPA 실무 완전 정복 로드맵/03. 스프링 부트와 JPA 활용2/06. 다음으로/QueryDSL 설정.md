# QueryDSL 설정

## Boot 2.x

```gradle
plugins {
	id 'org.springframework.boot' version '2.6.5'
	id 'io.spring.dependency-management' version '1.0.11.RELEASE'
	id 'java'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

ext["hibernate.version"] = "5.6.5.Final"

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	//JdbcTemplate 추가
	//implementation 'org.springframework.boot:spring-boot-starter-jdbc'
	//MyBatis 추가
	implementation 'org.mybatis.spring.boot:mybatis-spring-boot-starter:2.2.0'
	//JPA, 스프링 데이터 JPA 추가
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'

	//Querydsl 추가
	implementation 'com.querydsl:querydsl-jpa'
	annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jpa"
	annotationProcessor "jakarta.annotation:jakarta.annotation-api"
	annotationProcessor "jakarta.persistence:jakarta.persistence-api"

	//H2 데이터베이스 추가
	runtimeOnly 'com.h2database:h2'
	compileOnly 'org.projectlombok:lombok'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'

	//테스트에서 lombok 사용
	testCompileOnly 'org.projectlombok:lombok'
	testAnnotationProcessor 'org.projectlombok:lombok'
}

tasks.named('test') {
	useJUnitPlatform()
}

//Querydsl 추가, 자동 생성된 Q클래스 gradle clean으로 제거
clean {
	delete file('src/main/generated')
}
```
<br/>

## Boot 3.x

 - JDK 17+ 이상을 사용해야 한다.
 - javax 패키지 이름을 jakarta로 변경해야 한다.
    - 오라클과 자바 라이센스 문제로 모든 javax 패키지를 jakarta로 변경하기로 하였다.
 - H2 데이터베이스 사용시 2.1.214+ 이상을 사용해야 한다.

```gradle
plugins {
   id 'java'
   id 'org.springframework.boot' version '3.2.0'
   id 'io.spring.dependency-management' version '1.1.4'
}


group = 'study'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '17'


configurations {
   compileOnly {
       extendsFrom annotationProcessor
   }
}


repositories {
   mavenCentral()
}


dependencies {
   implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
   implementation 'org.springframework.boot:spring-boot-starter-web'
   implementation 'com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.9.0'
   compileOnly 'org.projectlombok:lombok'
   runtimeOnly 'com.h2database:h2'
   annotationProcessor 'org.projectlombok:lombok'
   testImplementation 'org.springframework.boot:spring-boot-starter-test'


   //test 롬복 사용
   testCompileOnly 'org.projectlombok:lombok'
   testAnnotationProcessor 'org.projectlombok:lombok'


   //Querydsl 추가
   implementation 'com.querydsl:querydsl-jpa:5.0.0:jakarta'
   annotationProcessor "com.querydsl:querydsl-apt:${dependencyManagement.importedProperties['querydsl.version']}:jakarta"
   annotationProcessor "jakarta.annotation:jakarta.annotation-api"
   annotationProcessor "jakarta.persistence:jakarta.persistence-api"
}


tasks.named('test') {
   useJUnitPlatform()
}


clean {
   delete file('src/main/generated')
}

```

