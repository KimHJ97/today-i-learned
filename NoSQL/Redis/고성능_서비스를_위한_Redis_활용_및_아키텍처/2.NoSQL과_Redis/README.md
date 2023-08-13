# `NoSQL과 Redis`

NoSQL은 "Not Only SQL"의 약자로, 관계형 데이터베이스 관리 시스템(RDBMS)과 다른 형태의 데이터 저장 및 관리를 위한 데이터베이스 모델 및 기술을 나타냅니다.  
NoSQL 데이터베이스는 기존의 관계형 데이터베이스의 제약을 극복하고 대용량, 고속, 분산 데이터 처리를 가능하게 하는 목적으로 개발되었습니다.  
NoSQL 데이터베이스는 다양한 종류와 모델을 가지고 있으며, 주로 수평 확장성과 유연한 데이터 모델링을 지원합니다.  

<br/>

## `관계형 DB`


관계형 데이터베이스(Relational Database, RDB)는 데이터를 테이블(table)이라는 구조에 저장하며, 테이블 간의 관계를 이용하여 데이터를 구성하고 관리하는 데이터베이스 시스템입니다.  
관계형 데이터베이스는 Edgar F. Codd에 의해 개발된 관계형 모델에 기반하여 동작하며, SQL(Structured Query Language)을 사용하여 데이터를 조회, 조작 및 관리합니다.  
 - 관계(relation): 속성(attribute)들로 이루어진 집합. DB에서 테이블이라고부르는
것.
 - 속성(attribute): DB에서 컬럼(column)을 나타냄.
 - 튜플(tuple): DB에서 레코드(record) 또는 로우(row)로 표현
 - 테이블간의 관계
    - 한 테이블에서 속성들이 연관되는 것처럼 다른 테이블들 간에도 연관될 수 있음
    - 일대일, 일대다, 다대다
 - SQL(Structed Query Language)
    - 관계형 DB를 관리하기 위해 설계된 질의 언어
    - 자료 검색, 수정, 스키마 관리 등
 - 관계형 DB 제품들
    - MySQL, Oracle, SQL Server, PostgreSQL, DB2 등
 - 관계형 DB의 장점
    - 데이터 무결성을 유지에 용이함(정규화를 통해 중복을 제거)
    - SQL을 통해 복잡한 질의 수행 가능
 - 관계형 DB의 단점
    - 고정된 스키마를 정의해야 함
    - Join으로 인한 성능 문제
    - 데이터들이 복잡한 관계를 맺고 있기 때문에 수평적 확장성이 떨어짐

<br/>

## `NoSQL 이해`

NoSQL은 말 그대로 "Not Only SQL"의 약자로 관계형 DB에서 사용하는 SQL을 사용하지 않는 저장소를 뜻한다.  
쉽게, 비 관계형 데이터베이스를 지칭할 떄 사용됩니다.  

<br/>

2000년대 스토리지 비용이 내려가고(데이터 중복이 스토리지 용량 면에서는 큰 이슈가 아니게 됨), 다루는 데이터의 크기와 성능 요구사항이 커지게 되며(고성능 데이터 모델이나 데이터 분할이 필요), 분산 환경의 대중화가 되었다.  
즉, 이런 것들에 적합한 단순한 대랴으이 데이터를 다루기 쉬운 저장소가 필요하게 된다.  
 - Key-Value
    - Redis, Memcached, Riak, DynamoDB
 - Document
    - Key-Value Store에 Value에 계층적인 문서 형태나 Object 형태가 들어간 모델 (XML, JSON 등으로 객체 형태로 표현)
    - MongoDB, CouchDB
 - Wide-column
    - Cassandra, HBase, Google BigTable
 - Graph
    - Neo4j, OrientDB, AgensGraph

<br/>

## `NoSQL로서의 Redis`

Redis는 데이터를 다루는 인터페이스를 제공하므로 DBMS의 성격이 있다.  
하지만, 기본적으로 영속성을 위한 DB는 아니다.  
원하는 경우 디스크에 데이터를 저장하여 영속성을 지원할 수 있지만, DBMS보다는 빠른 캐시의 성격으로 대표된다.  
보통 영속성을 위한 저장소로 레디스를 도입하지 않고, 관계형 DB를 사용하면서 캐시와 같은 빠른 저장소로 사용하기 위해서 사용한다.  
 - Redis의 다양한 특성
    - 기본적으로 NoSQL DB로 분류되는 Key-Value Store
    - 다양한 자료 구조를 지원(String, Hash, Set, List 등)
 - External Heap(외부 메모리)로서의 Redis
    - Application이 장애가 나도 Redis의 데이터는 보존(단기)
    - Application이 여러 머신에서 돌아도 같은 데이터를 접근 가능
 - DBMS로서의 Redis
    - Redis의 영속화 수단을 이용해 DBMS처럼 이용 가능
    - 일반 RDB 수준의 안전성을 얻기 위해선 속도를 희생해야 함
    - Application -> 읽기/쓰기 -> Redis -> 백업 -> Disk
 - Middleware로서의 Redis
    - Redis가 제공하는 자료 구조를 활용해 복잡한 로직을 쉽게 구현
    - ex: Sorted Set