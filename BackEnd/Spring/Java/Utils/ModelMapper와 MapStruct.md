# ModelMapper와 MapStruct

## 실습 환경 구축

 - build.gradle
    - ModelMapper와 MapStruct 관련 의존 라이브러리를 추가한다.
```gradle
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.1.10'
    id 'io.spring.dependency-management' version '1.1.4'
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'

java {
    sourceCompatibility = '17'
}

configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'

    implementation 'org.modelmapper:modelmapper:3.1.0'
    implementation 'org.mapstruct:mapstruct:1.5.3.Final'
    annotationProcessor 'org.mapstruct:mapstruct-processor:1.5.3.Final'
}

tasks.named('bootBuildImage') {
    builder = 'paketobuildpacks/builder-jammy-base:latest'
}

tasks.named('test') {
    useJUnitPlatform()
}
```
<br/>

 - `DTO 만들기`
    - Controller에 MemberCreateRequest로 파라미터를 받고, Service에서 사용될 MemberCreateServiceRequest로 변환하고, Service에서는 MemberCreateServiceRequest를 MemberEntity 엔티티로 변환한다고 가정한다.
    - 필드명이 다른 경우에 매핑을 테스트하기 위해 MemberCreateRequest와 MemberCreateServiceRequest는 name 이라는 필드명을 사용하고, MemberEntity에서는 username 을 사용한다고 가정한다.
```java
/* MemberCreateRequest */
@Getter
@NoArgsConstructor
public class MemberCreateRequest {

    private Long id;
    private String name;
    private int age;
    private String email;
    private String address;
    private String zipCode;

    @Builder
    public MemberCreateRequest(Long id, String name, int age, String email, String address, String zipCode) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.email = email;
        this.address = address;
        this.zipCode = zipCode;
    }
}

/* MemberCreateServiceRequest */
@Getter
@NoArgsConstructor
public class MemberCreateServiceRequest {
    private Long id;
    private String name;
    private int age;
    private String email;
    private String address;
    private String zipCode;

    @Builder
    public MemberCreateServiceRequest(Long id, String name, int age, String email, String address, String zipCode) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.email = email;
        this.address = address;
        this.zipCode = zipCode;
    }
}

/* MemberEntity */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MemberEntity {
    private Long id;
    private String username;
    private int age;
    private String email;
    private String address;
    private String zipCode;

    @Builder
    public MemberEntity(Long id, String username, int age, String email, String address, String zipCode) {
        this.id = id;
        this.username = username;
        this.age = age;
        this.email = email;
        this.address = address;
        this.zipCode = zipCode;
    }

    public void mappingUsername(String username) {
        this.username = username;
    }
}
```
<br/>

## 객체 직접 매핑

 - `DirectMappingTest`
    - MemberCreateRequest를 통해 MemberCreateServiceRequest를 만든다.
    - MemberCreateServiceRequest를 통해 MemberEntity를 만든다.
```java
package com.example.demo_utils.direct;

import com.example.demo_utils.dto.MemberCreateRequest;
import com.example.demo_utils.dto.MemberCreateServiceRequest;
import com.example.demo_utils.dto.MemberEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/*
 * 객체 직접 매핑 테스트
 */
class DirectMappingTest {

    @Test
    @DisplayName("요청 Dto를 Service Dto로 변환한다.")
    void requestDtoToServiceDto() {
        // Given
        MemberCreateRequest memberCreateRequest = getMemberCreateRequest();

        // When
        MemberCreateServiceRequest memberCreateServiceRequest = convertToMemberCreateServiceRequest(memberCreateRequest);

        // Then
        assertThat(memberCreateServiceRequest.getId()).isEqualTo(memberCreateRequest.getId());
        assertThat(memberCreateServiceRequest.getName()).isEqualTo(memberCreateRequest.getName());
        assertThat(memberCreateServiceRequest.getAge()).isEqualTo(memberCreateRequest.getAge());
    }

    @Test
    @DisplayName("Service Dto를 Entity로 변환한다.")
    void serviceDtoToEntity() {
        // Given
        MemberCreateRequest memberCreateRequest = getMemberCreateRequest();
        MemberCreateServiceRequest memberCreateServiceRequest = convertToMemberCreateServiceRequest(memberCreateRequest);

        // When
        MemberEntity member = convertToMemberEntity(memberCreateServiceRequest);

        // Then
        assertThat(member.getId()).isEqualTo(memberCreateServiceRequest.getId());
        assertThat(member.getUsername()).isEqualTo(memberCreateServiceRequest.getName());
        assertThat(member.getAge()).isEqualTo(memberCreateServiceRequest.getAge());

    }

    private MemberCreateRequest getMemberCreateRequest() {
        return MemberCreateRequest.builder()
                .id(1L)
                .name("홍길동")
                .age(20)
                .address("서울시")
                .zipCode("12345")
                .build();
    }

    private MemberCreateServiceRequest convertToMemberCreateServiceRequest(MemberCreateRequest memberCreateRequest) {
        return MemberCreateServiceRequest.builder()
                .id(memberCreateRequest.getId())
                .name(memberCreateRequest.getName())
                .age(memberCreateRequest.getAge())
                .address(memberCreateRequest.getAddress())
                .zipCode(memberCreateRequest.getZipCode())
                .build();
    }

    private MemberEntity convertToMemberEntity(MemberCreateServiceRequest memberCreateServiceRequest) {
        return MemberEntity.builder()
                .id(memberCreateServiceRequest.getId())
                .username(memberCreateServiceRequest.getName())
                .age(memberCreateServiceRequest.getAge())
                .address(memberCreateServiceRequest.getAddress())
                .zipCode(memberCreateServiceRequest.getZipCode())
                .build();
    }
}
```
<br/>

## ModelMapper

 - `ModelMapperTest`
    - ModelMapper는 런타임에 Java Reflection API 기능을 사용하여 객체 모델을 매핑한다.
    - 떄문에, ModelMapper를 사용하기 위해 따로 생성해야 할 클래스는 없고, ModelMapper 객체를 생성하고 변환 정책을 설정 후 변환해주면 된다.
    - ※ ModelMapper는 기본적으로 AccessLevel이 public으로 private 필드에 접근할 수 없어 Setter 메서드를 통해 매핑을 진행한다. 떄문에, Setter 메서드가 아닌, 필드를 통한 매칭을 하기 위해서는 AccessLevel을 private으로 변경해주어야 한다.
```java
package com.example.demo_utils.modelmapper;

import com.example.demo_utils.dto.MemberCreateRequest;
import com.example.demo_utils.dto.MemberCreateServiceRequest;
import com.example.demo_utils.dto.MemberEntity;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.modelmapper.config.Configuration;
import org.modelmapper.convention.MatchingStrategies;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ModelMapper 매핑 테스트
 *  - ModelMapper는 런타임에 Java Reflection API 기능을 사용하여 객체 모델을 매핑한다.
 */
class ModelMapperTest {

    private static ModelMapper modelMapper;

    /**
     * ModelMapper는 기본적으로 AccessLevel이 public으로 Setter 메서드가 존재해야 매핑을 진행할 수 있다.
     *  - AccessLevel을 private으로 설정하고, 핃드를 통한 매칭 설정을 해주면 Setter 메서드 없이 매핑할 수 있다.
     */
    @BeforeAll
    static void initModelMapper() {
        modelMapper = new ModelMapper();
        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setFieldAccessLevel(Configuration.AccessLevel.PRIVATE)
                .setFieldMatchingEnabled(true);

        // 필드명이 다른 경우 해당 클래스로 매핑시 규칙을 추가한다.
        modelMapper.createTypeMap(MemberCreateServiceRequest.class, MemberEntity.class)
                .addMapping(MemberCreateServiceRequest::getName, MemberEntity::mappingUsername);
    }


    @Test
    @DisplayName("요청 Dto를 Service Dto로 변환한다.")
    void requestDtoToServiceDto() {
        // Given
        MemberCreateRequest memberCreateRequest = getMemberCreateRequest();

        // When
        MemberCreateServiceRequest memberCreateServiceRequest = modelMapper.map(memberCreateRequest, MemberCreateServiceRequest.class);

        // Then
        assertThat(memberCreateServiceRequest.getId()).isEqualTo(memberCreateRequest.getId());
        assertThat(memberCreateServiceRequest.getName()).isEqualTo(memberCreateRequest.getName());
        assertThat(memberCreateServiceRequest.getAge()).isEqualTo(memberCreateRequest.getAge());
    }

    @Test
    @DisplayName("Service Dto를 Entity로 변환한다.")
    void serviceDtoToEntity() {
        // Given
        MemberCreateRequest memberCreateRequest = getMemberCreateRequest();
        MemberCreateServiceRequest memberCreateServiceRequest = modelMapper.map(
                memberCreateRequest, MemberCreateServiceRequest.class);

        // When
        MemberEntity member = modelMapper.map(
                memberCreateServiceRequest, MemberEntity.class);

        // Then
        assertThat(member.getId()).isEqualTo(memberCreateServiceRequest.getId());
        assertThat(member.getUsername()).isEqualTo(memberCreateServiceRequest.getName());
        assertThat(member.getAge()).isEqualTo(memberCreateServiceRequest.getAge());
    }

    private MemberCreateRequest getMemberCreateRequest() {
        return MemberCreateRequest.builder()
                .id(1L)
                .name("홍길동")
                .age(20)
                .address("서울시")
                .zipCode("12345")
                .build();
    }
}
```
<br/>

## MapStruct

 - `MemberCreateMapper`
    - MapStruct는 컴파일 시점에 매핑 정보를 생성하고, 이를 바탕으로 객체를 매핑한다.
    - 컴파일 시점에 매핑 정보로 객체 매핑을 제공해주는 구현체를 만들기 위해서는 @Mapper 어노테이션을 정의한 인터페이스를 만들어주면 된다. 해당 인터페이스의 메서드를 정의하여 매핑 정보를 정의할 수 있다.
        - 메서드 인자로 기준이 되는 타입을 정의하고, 반환 타입으로 변환될 타입을 정의한다.
```java
package com.example.demo_utils.dto;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface MemberCreateMapper {

    MemberCreateMapper INSTANCE = Mappers.getMapper(MemberCreateMapper.class);

    // MemberCreateRequest -> MemberCreateServiceRequest
    MemberCreateServiceRequest toMemberCreateServiceRequest(MemberCreateRequest memberCreateRequest);

    // MemberCreateServiceRequest -> MemberEntity
    @Mapping(source = "name", target = "username")
    MemberEntity toMemberEntity(MemberCreateServiceRequest memberCreateServiceRequest);

}
```
<br/>

 - `MapStructTest`
```java
package com.example.demo_utils.mapstruct;

import com.example.demo_utils.dto.MemberCreateMapper;
import com.example.demo_utils.dto.MemberCreateRequest;
import com.example.demo_utils.dto.MemberCreateServiceRequest;
import com.example.demo_utils.dto.MemberEntity;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MapStruct 매핑 테스트
 *  - MapStruct는 컴파일 시점에 매핑 정보를 생성하고, 이를 사용하여 객체를 매핑한다.
 *  - Annotation Processor를 이용해 메서드 인자와 반환할 값이 될 객체에 필요한 메서드를 호출(builder, getter)하여 자동으로 객체간의 매핑을 제공한다.
 */
class MapStructTest {

    private static MemberCreateMapper memberCreateMapper;

    /**
     * MapStruct는 @Mapper 어노테이션을 정의한 인터페이스를 만들면 자동으로 구현체를 만들어준다.
     */
    @BeforeAll
    static void initMemberCreateMapper() {
        memberCreateMapper = MemberCreateMapper.INSTANCE;
    }

    @Test
    @DisplayName("요청 Dto를 Service Dto로 변환한다.")
    void requestDtoToServiceDto() {
        // Given
        MemberCreateRequest memberCreateRequest = getMemberCreateRequest();

        // When
        MemberCreateServiceRequest memberCreateServiceRequest = memberCreateMapper.toMemberCreateServiceRequest(memberCreateRequest);

        // Then
        assertThat(memberCreateServiceRequest.getId()).isEqualTo(memberCreateRequest.getId());
        assertThat(memberCreateServiceRequest.getName()).isEqualTo(memberCreateRequest.getName());
        assertThat(memberCreateServiceRequest.getAge()).isEqualTo(memberCreateRequest.getAge());
    }

    @Test
    @DisplayName("Service Dto를 Entity로 변환한다.")
    void serviceDtoToEntity() {
        // Given
        MemberCreateRequest memberCreateRequest = getMemberCreateRequest();
        MemberCreateServiceRequest memberCreateServiceRequest = memberCreateMapper.toMemberCreateServiceRequest(memberCreateRequest);

        // When
        MemberEntity member = memberCreateMapper.toMemberEntity(memberCreateServiceRequest);

        // Then
        assertThat(member.getId()).isEqualTo(memberCreateServiceRequest.getId());
        assertThat(member.getUsername()).isEqualTo(memberCreateServiceRequest.getName());
        assertThat(member.getAge()).isEqualTo(memberCreateServiceRequest.getAge());
    }

    private MemberCreateRequest getMemberCreateRequest() {
        return MemberCreateRequest.builder()
                .id(1L)
                .name("홍길동")
                .age(20)
                .address("서울시")
                .zipCode("12345")
                .build();
    }
}
```

