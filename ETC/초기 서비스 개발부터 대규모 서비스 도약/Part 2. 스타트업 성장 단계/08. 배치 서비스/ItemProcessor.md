# ItemProcessor

ItemProcessor는 Spring Batch에서 사용되는 인터페이스로, 배치 작업에서 데이터 아이템을 읽어와 처리하고, 그 결과를 반환하는 역할을 합니다. 주로 데이터 가공, 필터링, 변환, 유효성 검사 및 비즈니스 로직을 적용하는 데 사용됩니다. ItemProcessor를 사용하면 데이터를 처리하는 작업을 모듈화하고 재사용 가능한 방식으로 구현할 수 있습니다.  

ItemProcessor는 ItemReader로부터 읽어온 데이터를 가공하고, 이후에 ItemWriter로 전달하기 전에 중요한 역할을 수행합니다. 데이터 처리 파이프라인을 구성하는 데 필수적인 컴포넌트 중 하나이며, 배치 작업의 복잡성을 관리하고 데이터 품질을 향상시키는 데 도움을 줍니다.  
 - 데이터 가공: 입력 데이터를 가공하여 필요한 형식으로 변환하거나 데이터 필드를 조작합니다.
 - 데이터 필터링: 입력 데이터 중에서 특정 조건을 만족하는 아이템만 처리하고 나머지는 건너뜁니다.
 - 데이터 유효성 검사: 데이터의 유효성을 검사하고, 유효하지 않은 데이터를 걸러냅니다.
 - 비즈니스 로직 적용: 비즈니스 규칙을 적용하여 데이터를 처리하고, 결과를 반환합니다.

<br/>

## ItemProcessor 인터페이스

 - I (Input)는 ItemProcessor가 입력으로 받는 데이터 아이템의 유형을 나타냅니다.
 - O (Output)는 ItemProcessor가 처리 후 반환하는 데이터 아이템의 유형을 나타냅니다.
```Java
public interface ItemProcessor<I, O> {
    O process(I item) throws Exception;
}
```

<br/>

## ItemProcessor 인터페이스 구현

ItemProcessor를 구현하려면 process 메서드를 오버라이드하여 입력으로 받은 아이템을 가공하고 처리 후의 아이템을 반환하는 로직을 구현합니다.  

 - process() 메서드의 매개변수 타입은 입력 아이템 타입을 입력하고, 반환 타입은 출력 아이템 타입을 입력한다.
```Java
import org.springframework.batch.item.ItemProcessor;

public class MyItemProcessor implements ItemProcessor<SourceData, ProcessedData> {

    @Override
    public ProcessedData process(SourceData item) throws Exception {
        // 입력 데이터를 가공하고 처리 후 데이터로 변환
        ProcessedData processedData = new ProcessedData();
        processedData.setProcessedValue(item.getInputValue() * 2);
        return processedData;
    }
}
```
