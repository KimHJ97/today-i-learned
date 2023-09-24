# ItemReader

ItemReader는 Spring Batch에서 주로 대량의 데이터를 읽어오는 역할을 하는 인터페이스입니다. 배치 작업에서 데이터 소스에서 데이터를 읽고 처리 파이프라인에 데이터 아이템을 제공하는 데 사용됩니다.  

ItemReader는 일반적으로 다양한 데이터 소스에서 데이터를 읽는 데 사용되며, 데이터베이스 쿼리, 파일, 메시지 큐 등 다양한 소스와 통합할 수 있습니다.  

<br/>

## ItemReader의 구현체

 - JdbcCursorItemReader
    - 데이터베이스 테이블에서 데이터를 읽어오는 데 사용됩니다. 커서 기반으로 동작하며 대용량 데이터를 효율적으로 처리할 수 있습니다.
 - JpaPagingItemReader
    - JPA(Entity Manager)를 사용하여 데이터를 읽어오는 데 사용됩니다. 페이징 기능을 제공하여 대용량 데이터를 처리할 수 있습니다.
 - FlatFileItemReader
    - 텍스트 파일(CSV, TSV 등)에서 데이터를 읽어오는 데 사용됩니다. 각 라인을 문자열로 읽어올 수 있으며, 필요한 경우 데이터 변환도 수행할 수 있습니다.
 - StaxEventItemReader
    - XML 파일에서 데이터를 읽어오는 데 사용됩니다. XML 이벤트 스트림을 처리하여 데이터 아이템을 생성합니다.
 - Custom ItemReader
    - 필요한 데이터 소스에 맞춰 직접 ItemReader를 구현할 수도 있습니다. 사용자 정의 로직을 통해 데이터를 읽어올 수 있습니다.
```
FlatFileItemReader: CSV 파일
StaxEventItemReader: XML 파일
JsonItemReader: JSON 파일
JdbcCursorItemReader: 데이터베이스
JdbcPagingItemReader: 데이터베이스
JpaPagingItemReader: 데이터베이스
HibernateCursorItemReader: 데이터베이스
StoredProcedureItemReader: 데이터베이스
MyBatisPagingItemReader: 데이터베이스
```
