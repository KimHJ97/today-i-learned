# ItemWriter

ItemWriter는 Spring Batch에서 사용되는 인터페이스로, 배치 작업의 결과 데이터를 쓰는 역할을 합니다. 주로 읽어온 데이터를 데이터베이스, 파일, 메시지 큐 등 다양한 대상에 저장하거나 출력하는 데 사용됩니다. ItemWriter를 사용하면 배치 작업에서 처리한 결과 데이터를 지속적으로 저장하거나 다른 시스템과 연동하는 등의 작업을 할 수 있습니다.  

ItemWriter는 배치 작업에서 데이터를 지속적으로 저장하거나 외부 시스템과 통합하기 위해 필수적인 컴포넌트 중 하나입니다. 데이터를 안전하게 저장하고 결과를 외부 시스템과 연동하는 데 사용됩니다.  
 - 데이터 저장: 처리된 데이터를 데이터베이스, 파일, 클라우드 스토리지 등의 대상에 저장합니다.
 - 데이터 전달: 처리된 데이터를 메시지 큐나 웹 서비스를 통해 다른 시스템으로 전달합니다.
 - 결과 보고: 작업의 결과를 보고서로 생성하거나 로그로 남깁니다.
 - 데이터 업데이트: 데이터를 업데이트하거나 변경 사항을 기록합니다.

<br/>

## ItemWriter 인터페이스

 - T는 ItemWriter가 처리하는 데이터 아이템의 유형을 나타냅니다.
```Java
public interface ItemWriter<T> {
    void write(List<? extends T> items) throws Exception;
}
```

<br/>

## ItemWriter 구현체

Spring Batch에서는 다양한 ItemWriter 구현체가 제공되며, 이러한 구현체를 사용하여 다양한 대상에 데이터를 저장하거나 출력할 수 있습니다.  
각 ItemWriter 구현체는 특정 대상과의 통합을 지원하며, 프로젝트 요구사항에 따라 선택할 수 있습니다.  

 - JdbcBatchItemWriter
    - JdbcBatchItemWriter는 데이터베이스 테이블에 데이터를 쓰는 데 사용됩니다. JDBC를 기반으로 동작하며, 대량의 데이터를 효율적으로 데이터베이스에 저장할 수 있습니다. SQL 문을 지정하여 데이터 쓰기 작업을 수행합니다.
 - JpaItemWriter
    - JpaItemWriter는 JPA (Java Persistence API)를 사용하여 데이터를 쓰는 데 사용됩니다. JPA 엔티티에 데이터를 저장하는 데 유용합니다.
 - FlatFileItemWriter
    - FlatFileItemWriter는 텍스트 파일(CSV, TSV 등)에 데이터를 쓰는 데 사용됩니다. 각 아이템을 텍스트 레코드로 변환하고 지정된 파일에 쓰는 작업을 수행합니다.
 - XmlItemWriter
    - XmlItemWriter는 XML 파일에 데이터를 쓰는 데 사용됩니다. 객체를 XML 형식으로 변환하고 XML 파일에 기록합니다.
 - CompositeItemWriter
    - CompositeItemWriter는 여러 개의 ItemWriter를 결합하여 사용하는 데 유용합니다. 여러 대상에 데이터를 동시에 쓰는 데 사용될 수 있습니다.
 - Custom ItemWriter
    - 필요한 대상에 맞춰 사용자 정의 ItemWriter를 구현할 수 있습니다. 데이터를 저장하거나 다른 시스템과 통합하기 위해 필요한 로직을 자유롭게 작성할 수 있습니다.
 - NoOpItemWriter
    - NoOpItemWriter는 실제로 데이터를 저장하지 않고 아무 작업도 수행하지 않습니다. 주로 테스트 목적으로 사용됩니다.
```
FlatFileItemWriter: 일반 파일
StaxEventItemWriter: XML 파일
JsonFileItemWriter: JSON 파일
JdbcBatchItemWriter: 데이터베이스
HibernateItemWriter: 데이터베이스
JpaItemWriter: 데이터베이스
MyBatisBatchItemWriter: 데이터베이스
```

<br/>

## ItemWriter 인터페이스 구현

ItemWriter를 구현하려면 write 메서드를 오버라이드하여 받은 데이터 아이템들을 지정된 대상에 쓰는 로직을 구현합니다.  
write 메서드는 리스트 형태의 데이터 아이템들을 입력으로 받으며, 이를 원하는 형식으로 대상에 쓰는 작업을 수행합니다.  

 - 아이템을 하나씩 받아서 처리하지 않고, Chunk 단위로 아이템을 받아서 처리한다.
```Java
import org.springframework.batch.item.ItemWriter;

import java.util.List;

public class MyItemWriter implements ItemWriter<ProcessedData> {

    @Override
    public void write(List<? extends ProcessedData> items) throws Exception {
        // 처리된 데이터를 데이터베이스에 저장하는 로직
        for (ProcessedData item : items) {
            // 데이터베이스에 저장
            databaseService.save(item);
        }
    }
}
```
