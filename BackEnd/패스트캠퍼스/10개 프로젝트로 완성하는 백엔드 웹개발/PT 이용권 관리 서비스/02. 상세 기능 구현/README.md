# 상세 기능 구현

## 1. Batch 프로젝트 생성

### 프로젝트 구성

 - JDK 18
 - Spring Boot 2.7.3
 - Gradle
 - MySQL
 - JPA
 - Lombok
 - ModelMapper
```gradle
dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-batch'
	implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
	compileOnly 'org.projectlombok:lombok'
	runtimeOnly 'mysql:mysql-connector-java'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
	testImplementation 'org.springframework.batch:spring-batch-test'
}
```

<br/>

 - `Git 연동`
```bash
$ git init
$ git add .
$ git commit -m "First Commit"
$ git remote add origin {your-github-url}
$ git push -u origin master
```

<br/>

### 배치 샘플 만들기

 - `application.yml`
```yml
spring:
  datasource:
    url: jdbc:h2:mem:mydb
    username: sa
    password: 
    driver-class-name: org.h2.Driver
```

<br/>

 - `Application.java`
```java
@RequiredArgsConstructor
@EnableBatchProcessing
@SpringBootApplication
public class PassBatchApplication {

    private final JobBuilderFactory jobBuilderFactory;

    private final StepBuilderFactory stepBuilderFactory;

    @Bean
    public Job passJob() {
        return this.jobBuilderFactory.get("passJob")
                .start(passStep())
                .build();
    }

    @Bean
    public Step passStep() {
        return this.stepBuilderFactory.get("passStep")
                .tasklet(new Tasklet() {
                    @Override
                    public RepeatStatus execute(StepContribution contribution, ChunkContext chunkContext) throws Exception {
                        System.out.println("Execute PassStep");
                        return RepeatStatus.FINISHED;
                    }
                })
                .build();
    }

    public static void main(String[] args) {
        SpringApplication.run(PassBatchApplication.class, args);
    }

}
```

<br/>

## 2. Docker MySQL 설치 및 테이블 생성

 - `docker-compose.yml`
```yml
version: "3.8"
services:
  mysql:
    container_name: mysql_local
    image: mysql:8.0.30
    volumes:
      - ./db/conf.d:/etc/mysql/conf.d
      - ./db/initdb.d:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    environment:
      - MYSQL_DATABASE=pass_local
      - MYSQL_USER=pass_local_user
      - MYSQL_PASSWORD=passlocal123
      - MYSQL_ROOT_PASSWORD=passlocal123
      - TZ=Asia/Seoul
```

<br/>

 - `conf.d/my.cnf`
```cnf
[client]
default-character-set = utf8mb4

[mysqld]
authentication-policy = mysql_native_password
```

<br/>

 - `initdb.d/create_table.sql`
```sql
CREATE TABLE `package`
(
    `package_seq`  int         NOT NULL AUTO_INCREMENT COMMENT '패키지 순번',
    `package_name` varchar(50) NOT NULL COMMENT '패키지 이름',
    `count`        int                  DEFAULT NULL COMMENT '이용권 수, NULL인 경우 무제한',
    `period`       int                  DEFAULT NULL COMMENT '기간(일), NULL인 경우 무제한',
    `created_at`   timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    `modified_at`  timestamp            DEFAULT NULL COMMENT '수정 일시',
    PRIMARY KEY (`package_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='패키지';

CREATE TABLE `pass`
(
    `pass_seq`        int         NOT NULL AUTO_INCREMENT COMMENT '이용권 순번',
    `package_seq`     int         NOT NULL COMMENT '패키지 순번',
    `user_id`         varchar(20) NOT NULL COMMENT '사용자 ID',
    `status`          varchar(10) NOT NULL COMMENT '상태',
    `remaining_count` int                  DEFAULT NULL COMMENT '잔여 이용권 수, NULL인 경우 무제한',
    `started_at`      timestamp   NOT NULL COMMENT '시작 일시',
    `ended_at`        timestamp            DEFAULT NULL COMMENT '종료 일시, NULL인 경우 무제한',
    `expired_at`      timestamp            DEFAULT NULL COMMENT '만료 일시',
    `created_at`      timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    `modified_at`     timestamp            DEFAULT NULL COMMENT '수정 일시',
    PRIMARY KEY (`pass_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='이용권';

CREATE TABLE `booking`
(
    `booking_seq`  int         NOT NULL AUTO_INCREMENT COMMENT '예약 순번',
    `pass_seq`     int         NOT NULL COMMENT '이용권 순번',
    `user_id`      varchar(20) NOT NULL COMMENT '사용자 ID',
    `status`       varchar(10) NOT NULL COMMENT '상태',
    `used_pass`    tinyint(1) NOT NULL DEFAULT '0' COMMENT '이용권 사용 여부',
    `attended`     tinyint(1) NOT NULL DEFAULT '0' COMMENT '출석 여부',
    `started_at`   timestamp   NOT NULL COMMENT '시작 일시',
    `ended_at`     timestamp   NOT NULL COMMENT '종료 일시',
    `cancelled_at` timestamp            DEFAULT NULL COMMENT '취소 일시',
    `created_at`   timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    `modified_at`  timestamp            DEFAULT NULL COMMENT '수정 일시',
    PRIMARY KEY (`booking_seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='예약';

CREATE TABLE `user`
(
    `user_id`     varchar(20) NOT NULL COMMENT '사용자 ID',
    `user_name`   varchar(50) NOT NULL COMMENT '사용자 이름',
    `status`      varchar(10) NOT NULL COMMENT '상태',
    `phone`       varchar(50)          DEFAULT NULL COMMENT '연락처',
    `meta`        TEXT                 DEFAULT NULL COMMENT '메타 정보, JSON',
    `created_at`  timestamp   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    `modified_at` timestamp            DEFAULT NULL COMMENT '수정 일시',
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='사용자';
```

<br/>

 - `initdb.d/insert_data.sql`
```sql
INSERT INTO package (package_name, count, period, created_at)
VALUES ('Starter PT 10회', 10, 60, '2022-08-01 00:00:00'),
       ('Starter PT 20회', 20, 120, '2022-08-01 00:00:00'),
       ('Starter PT 30회', 30, 180, '2022-08-01 00:00:00'),
       ('무료 이벤트 필라테스 1회', 1, NULL, '2022-08-01 00:00:00'),
       ('바디 챌린지 PT 4주', NULL, 28, '2022-08-01 00:00:00'),
       ('바디 챌린지 PT 8주', NULL, 48, '2022-08-01 00:00:00'),
       ('인바디 상담', NULL, NULL, '2022-08-01 00:00:00');

INSERT INTO `user` (user_id, user_name, status, phone, meta, created_at)
VALUES ('A1000000', '우영우', 'ACTIVE', '01011112222', NULL, '2022-08-01 00:00:00'),
       ('A1000001', '최수연', 'ACTIVE', '01033334444', NULL, '2022-08-01 00:00:00'),
       ('A1000002', '이준호', 'INACTIVE', '01055556666', NULL, '2022-08-01 00:00:00'),
       ('B1000010', '권민우', 'ACTIVE', '01077778888', NULL, '2022-08-01 00:00:00'),
       ('B1000011', '동그라미', 'INACTIVE', '01088889999', NULL, '2022-08-01 00:00:00'),
       ('B2000000', '한선영', 'ACTIVE', '01099990000', NULL, '2022-08-01 00:00:00'),
       ('B2000001', '태수미', 'ACTIVE', '01000001111', NULL, '2022-08-01 00:00:00');
```

<br/>

 - `도커 컴포즈 실행 및 정지 명령어`
```bash
# 도커 컴포즈 실행
docker-compose up -d --force-recreate

# 도커 컴포즈 정지
docker-compose down -v
```

