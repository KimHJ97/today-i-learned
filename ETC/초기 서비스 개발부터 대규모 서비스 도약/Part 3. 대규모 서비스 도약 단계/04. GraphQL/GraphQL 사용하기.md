# GraphQL 사용하기

## DGS Framework

DGS(DGS Framework)는 GraphQL 서버를 빠르게 개발하고 실행할 수 있도록 도와주는 Java 기반의 프레임워크입니다. DGS는 "Data Graphs for Spring"의 약자로, Spring Boot 및 Spring Data와 통합되어 GraphQL API를 간단하게 작성하고 실행할 수 있는 강력한 도구입니다.  
 - 넷플릭스에서 만들어 오픈 소스로 공개한 GraphQL 프레임워크
 - graphql-java 기반으로 구축된 프레임워크

<br/>

## GraphQL 사용하기

 - __build.gradle__
    - 스프링부트 버전에 맞는 DGS Framework 알맞은 버전 의존성을 추가한다.
        - 버전 태그: https://github.com/Netflix/dgs-framework/tags
        - DGS 6.x -> 스프링 부트 3.0, JDK 17
        - DGS 5.5.x -> 스프링 부트 2.7
        - DGS 5.4.x -> 스프링 부트 2.6
```gradle
// DGS 5.5.1
// Spring Boot 2.7.8
plugins {
	id 'java'
	id 'org.springframework.boot' version '2.7.8'
	id 'io.spring.dependency-management' version '1.0.15.RELEASE'
}

dependencies {
	implementation 'com.netflix.graphql.dgs:graphql-dgs-spring-boot-starter:5.5.1'
	..
}

dependencyManagement {
	imports {
		mavenBom 'com.netflix.graphql.dgs:graphql-dgs-platform-dependencies:5.5.1'
	}
}
```

<br/>

 - __스키마 만들기__
    - 경로: src/main/resources/schema
    - 스키마 파일: src/main/resources/schema/schema.graphqls
```graphql
type Query {
    hello(name: String): String!
    customers(nameFilter: String): [Customer]!
}

type Mutation {
    addCustomer(customerInput: CustomerInput): [Customer]
}

input CustomerInput {
    name: String
    age: Int
}

type Customer {
    name: String
    age: Int
}
```

<br/>

 - __DGS 어노테이션 기본 정보__
    - @DgsComponent
        - DGS에서 사용되는 컴포넌트 지정
        - 이 어노테이션은 DGS 컴포넌트 클래스를 선언합니다. 컴포넌트 클래스는 GraphQL 스키마의 일부로 간주되며, DGS 프레임워크에 의해 관리됩니다.
    - @DgsData
        - 데이터 Fetcher 메서드에 사용
        - 이 어노테이션은 GraphQL 쿼리의 리졸버 메서드를 선언합니다. 쿼리 필드에 대한 데이터를 가져오거나 계산하기 위해 사용됩니다. 리졸버 메서드는 필드 이름과 일치하는 이름을 가져야 합니다.
    - @DgsQuery
        - Query 타입의 약칭
        - 이 어노테이션은 GraphQL 쿼리의 리졸버 메서드를 선언합니다. 쿼리 필드에 대한 데이터를 가져오거나 계산하기 위해 사용됩니다. 리졸버 메서드는 쿼리 필드 이름과 일치하는 이름을 가져야 합니다.
    - @DgsMutation
        - Mutation 타입의 약칭
        - 이 어노테이션은 GraphQL 뮤테이션의 리졸버 메서드를 선언합니다. 뮤테이션은 데이터를 변경하거나 추가하기 위해 사용됩니다. 리졸버 메서드는 뮤테이션 이름과 일치하는 이름을 가져야 합니다.
    - @DgsSubscription
        - Subscription 타입의 약칭
        - 이 어노테이션은 GraphQL 구독(Subscriptions)의 리졸버 메서드를 선언합니다. 구독은 실시간 데이터 업데이트를 처리하기 위해 사용됩니다. 리졸버 메서드는 구독 이름과 일치하는 이름을 가져야 합니다.
    - @InputArgument
        - 입력 타입(Input Types, Scala, Enum)
        - 이 어노테이션은 리졸버 메서드에 전달되는 인풋 인자를 정의합니다. 리졸버 메서드의 매개변수 중에서 어떤 것이 GraphQL 쿼리에서 전달되는 인자와 일치하는지 지정합니다.
    - @DgsDataLoader
        - 이 어노테이션은 데이터 로딩을 처리하는 메서드를 선언합니다. 데이터 로더는 여러 데이터 소스에서 데이터를 가져와서 필요한 쿼리를 최적화하는 데 사용됩니다.
    - @DgsScalar
        - 이 어노테이션은 사용자 정의 스칼라 타입을 정의합니다. GraphQL 스키마에 사용자 정의 스칼라 타입을 추가하려면 이 어노테이션을 사용합니다.

<br/>

 - __HelloDataFetcher__
    - REST API와 유사하게 Controller로 볼 수 있다. Controller 대신 DataFetcher를, @GetMapping 대신 @DgsQuery를, @RequestParam 대신 @InputArgument를 사용했다고 볼 수 있다.
    - 제공되는 GraphiQL로 테스트: http://localhost:8080/graphiql
```Java
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;

import java.util.Objects;

@DgsComponent // Dgs 컴포넌트 지정
public class HelloDataFetcher {
    @DgsQuery
    public String hello(@InputArgument String name) {
        if (Objects.isNull(name)) {
            name = "Nobody";
        }
        return "Hello, " + name;
    }
}
```
```graphql
query {
    hello(name: "Log")
}
```

<br/>

 - __CustomerDataFetcher__
```Java
@DgsComponent
public class CustomerDataFetcher {

    private List<Customer> customers = new ArrayList<>(Arrays.asList(
            new Customer("김철수", 32),
            new Customer("이창수", 22),
            new Customer("강현만", 12),
            new Customer("조동현", 42),
            new Customer("진상민", 52)
    ));

    @DgsQuery
    public List<Customer> customers(@InputArgument String nameFilter) {
        return customers.stream().filter(c -> c.getName().contains(nameFilter)).collect(Collectors.toList());
    }

    @DgsMutation
    public List<Customer> addCustomer(@InputArgument CustomerInput customerInput) {
        customers.add(new Customer(customerInput.getName(), customerInput.getAge()));
        return customers;
    }
}
```
```graphql
query {
    customers(nameFilter: "김") {
        name
        age
    }
}
```
```graphql
mutation {
    addCustomer(customerInput: {
        name: "Test",
        age: 20
    }) {
        name
        age
    }
}
```

<br/>

 - __DGS GraphQL Configuration__
    - https://netflix.github.io/dgs/configuration/

|속성|타입|기본값|설명|
|---|---|---|---|
|dgs.graphql.path|String|"/graphql"|API 엔드포인트|
|dgs.graphql.introspection.enabled|Boolean|true|스키마 조회 기능|
|dgs.graphql.schema-locations|[String]|"classpath*:schema/**/*.graphql*"|스키마 파일 위치|
|dgs.graphql.graphiql.enabled|Boolean|true|GraphiQL 기능|
|dgs.graphql..graphiql.path|String|"/graphiql"|GraphiQL 엔드포인트|

<br/>


