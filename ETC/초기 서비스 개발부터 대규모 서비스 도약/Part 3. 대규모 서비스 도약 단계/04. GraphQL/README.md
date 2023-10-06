# GraphQL 도입하기

## GraphQL

GraphQL은 데이터 쿼리 언어 및 런타임 환경으로, 페이스북에서 개발되었으며 현재는 GraphQL Foundation의 일부로 오픈 소스로 관리되고 있습니다. GraphQL은 웹 애플리케이션과 모바일 애플리케이션에서 데이터를 효율적으로 가져오고 조작하기 위한 강력한 도구로 사용됩니다.  

GraphQL은 웹 및 모바일 애플리케이션에서 데이터를 효과적으로 관리하고 소비하는 데 매우 유용한 도구로서, 클라이언트와 서버 간의 효율적인 데이터 통신을 가능하게 합니다. Facebook, GitHub, Shopify, Twitter 등 많은 기업과 서비스에서 GraphQL을 사용하고 있으며, 개발자 커뮤니티에서도 큰 인기를 얻고 있습니다.  
 - 유연한 데이터 쿼리: GraphQL은 클라이언트가 필요로 하는 데이터를 정확하게 요청할 수 있도록 해줍니다. 클라이언트는 원하는 필드와 연결된 데이터를 쿼리할 수 있으며, 불필요한 데이터를 받지 않도록 제어할 수 있습니다. 이로 인해 "오버-퀘리" 문제를 방지할 수 있습니다.
 - 단일 엔드포인트: GraphQL은 단일 엔드포인트를 사용하여 모든 데이터 요청을 처리합니다. 이는 RESTful API와 달리 다수의 엔드포인트를 필요로 하지 않으므로 네트워크 요청 수를 줄일 수 있습니다.
 - 타입 시스템: GraphQL은 강력한 타입 시스템을 가지고 있어 데이터 모델을 정의하고 유효성을 검증하기 용이합니다. 서버에서 제공하는 타입과 필드에 대한 문서화도 자동으로 생성됩니다.
 - 실시간 데이터: GraphQL은 실시간 데이터를 지원하기 위한 구독(subscription) 메커니즘을 제공합니다. 이를 통해 실시간 업데이트가 필요한 애플리케이션에 적합합니다.
 - 한 번의 요청으로 다수의 데이터 획득: 클라이언트는 하나의 GraphQL 요청으로 여러 데이터 소스에서 데이터를 한꺼번에 요청할 수 있습니다. 이는 클라이언트가 여러 REST 엔드포인트에 여러 번 요청을 보내는 것보다 효율적입니다.
 - 버전 관리 없음: GraphQL은 데이터 모델이 변경되어도 기존 쿼리를 수정하지 않아도 되는 유연한 스키마 업데이트를 제공합니다.

<br/>

### GraphQL 특징

|설계|GraphQL|REST API|
|---|---|---|
|구성|스키마 / 타입 시스템|URL Endpoints|
|동작|Query, Mutation, Subscription|CRUD|
|Endpoint|단일 접점(API 1개)|URL 집합|
|버전|API 버전 변경이 적음|다수의 API 버전 지원|
|데이터 포맷|단일 JSON 포맷|다수의 데이터 포맷(XML, JSON 등)|
|관점|클라이언트 주도 설계|서버 주도 설계|
|학습곡선|어려움|보통|
|스팩|GraphQL 스키마 논의 또는 제공|API 스팩 협의 또는 제공|
|API 명세|GraphQL 스키마|Swagger 도구|
|테스트|서버가 GraphiQL 사이트 제공|별도 HTTP 클라이언트 사용|

 - GraphQL 표준 스팩으로 클라이언트는 서버에 상관없이 일관되게 사용할 수 있다.
 - 데이터 주도권이 클라이언트에게 있다.
 - 타입 시스템을 사용한다. (자동화된 데이터 유형 검사)
 - 단일 접점 API Endpoint로 상대적으로 빠르다.

<br/>

### GraphQL 자바 프레임워크

 - Spring for GraphQL
 - Netflix DGS
 - GraphQL Kick Starter

<br/>

### GraphQL 작업 타입


GraphQL에서 작업 타입(Operation Type)은 GraphQL 스키마 내에서 사용되는 네 가지 기본 작업 형식입니다. GraphQL API를 쿼리하거나 변경하기 위해 이러한 작업 타입을 사용합니다.  

Query와 Mutation은 주로 데이터를 검색하고 변경하는 데 사용되고, Subscription은 실시간 업데이트를 처리하기 위한 데 사용됩니다. Introspection은 클라이언트가 스키마에 대한 정보를 얻는 데 사용됩니다.  

 - 쿼리(Query): 조회
    - Query는 GraphQL 스키마에서 데이터를 읽기 위해 사용되는 작업 타입입니다. 클라이언트가 데이터를 요청하고 읽을 때 사용됩니다. 예를 들어, 사용자 정보를 검색하거나 뉴스 기사 목록을 가져올 때 Query 작업을 사용할 수 있습니다.
```graphql
type Query {
  user(id: ID!): User
  news: [News]
}
```

 - 뮤테이션(Mutation): 입력, 수정, 삭제
    - Mutation은 GraphQL 스키마에서 데이터를 변경하고 업데이트하기 위해 사용되는 작업 타입입니다. 클라이언트가 데이터를 생성, 수정 또는 삭제할 때 사용됩니다. 예를 들어, 사용자를 추가하거나 게시물을 업데이트하는 작업에 Mutation을 사용할 수 있습니다.
```graphql
type Mutation {
  addUser(input: UserInput!): User
  updatePost(id: ID!, input: PostInput!): Post
  deleteComment(id: ID!): Boolean
}

```

 - 서브스크립션(Subscription): 구독
    - Subscription은 GraphQL 스키마에서 실시간 데이터를 처리하기 위해 사용되는 작업 타입입니다. Subscription은 서버가 클라이언트에게 실시간 이벤트 업데이트를 보낼 때 사용됩니다. 예를 들어, 실시간 채팅 메시지를 구독하거나 실시간 알림을 받는 데 Subscription을 사용할 수 있습니다.
```graphql
type Subscription {
  newChatMessage: ChatMessage
  newNotification: Notification
}
```

 - 자기 탐색(Introspection)
    - Introspection은 GraphQL 스키마의 메타데이터를 쿼리하는 데 사용되는 작업 타입입니다. 클라이언트는 스키마에 대한 정보를 동적으로 검색하고 사용할 수 있습니다. GraphQL 서버는 이러한 Introspection 쿼리를 허용하여 클라이언트가 스키마를 이해하고 효율적으로 사용할 수 있도록 합니다.
```graphql
{
  __schema {
    queryType {
      name
    }
    types {
      name
      kind
    }
  }
}
```

<br/>

### GraphQL 타입

GraphQL에서는 다양한 종류의 타입을 사용하여 데이터 모델을 정의합니다. 이러한 타입들은 GraphQL 스키마를 구성하며, 클라이언트가 어떤 데이터를 요청하거나 서버에 데이터를 전달할 때 사용됩니다.  

 - 스칼라 타입(Scalar Types)
    - 스칼라 타입은 단일 값만 표현하는 가장 기본적인 GraphQL 타입입니다.
    - Int, Float, String, Boolean, ID
 - 객체 타입(Object Types)
    - 객체 타입은 사용자 정의 타입으로, 객체 내부에 필드들을 가질 수 있습니다. 이 필드들은 다른 객체 타입이나 스칼라 타입을 가질 수 있습니다. 객체 타입은 GraphQL 스키마의 핵심 구성 요소 중 하나이며, 데이터 모델을 정의하는 데 사용됩니다.
```graphql
type User {
  id: ID!
  name: String!
  age: Int
}
```

 - 리스트 타입(List Types)
    - 리스트 타입은 여러 개의 값을 포함하는 배열 형태의 타입을 나타냅니다. GraphQL에서는 대괄호 [ ]를 사용하여 리스트 타입을 정의합니다.
```graphql
type Post {
  id: ID!
  title: String!
  tags: [String!]!
}
```

 - 열거 타입(Enum Types)
    - 열거 타입은 일련의 가능한 값을 나타내는데 사용됩니다. 각 값은 열거 타입 내에서 고유한 이름을 가지며, 클라이언트는 이러한 값을 선택적으로 사용할 수 있습니다.
```graphql
enum Status {
  PENDING
  APPROVED
  REJECTED
}
```

 - 인터페이스 타입(Interface Types)
    - 인터페이스 타입은 다른 객체 타입에서 공통으로 사용되는 필드와 형태를 정의합니다. 인터페이스를 구현하는 여러 객체 타입을 정의하고, 클라이언트는 인터페이스를 사용하여 다양한 객체 타입을 일관되게 처리할 수 있습니다.
```graphql
interface Animal {
  name: String!
  makeSound: String!
}

type Dog implements Animal {
  name: String!
  makeSound: String!
  breed: String!
}

type Cat implements Animal {
  name: String!
  makeSound: String!
  color: String!
}
```

<br/>

### GraphQL 문법 규칙

 - 필드에 느낌표(!)로 null 여부를 표현한다.
|필드 표현|설명|
|---|---|
|name: String!|name 필드는 널을 허용하지 않음|
|name: String|name 필드는 널을 허용|
|[Int]|리스트와 리스트 요소 모두 널 허용|
|[Int!]|리스트는 널 허용, 리스트 요소는 널 허용하지 않음|
|[Int!]!|리스트와 리스트 요소 모두 널을 허용하지 않음|
|[Int]!|리스트는 널을 허용하지 않음, 리스트 요소는 널 허용|

 - GraphQL 파라미터
    - 필드와 동일하게 파라미터도 타입이 필요하다.
    - 느낌표(!)를 이용해서 파라미터도 널 여부를 지정한다.
```graphql
type Query {
    Product(id: ID!): Product!
    User(userId: ID!): User!
}
```

 - GraphQL 조회 페이징
    - REST API와 유사
    - 파라미터를 이용해서 페이징 요청 가능
```graphql
type Query {
    allProducts(page: Int=1 size: Int=10): [Product!]!
}
```

 - GraphQL 입력 타입
    - GraphQL에서는 입력 타입이라는 특수한 타입을 제공한다.
    - 입력 값이 많은 경우 입력 타입을 사용하여 입력 파라미터를 한 번에 받을 수 있다.
    - 파라미터에서만 사용되는 타입, 입력 필드를 관리
```graphql
input ProductInput {
    name: String!
    price: Int!
    description: String
}

type mutation {
    createProduct(input: ProductInput!): Product!
}
```

