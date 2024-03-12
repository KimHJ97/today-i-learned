# 대용량 INSERT

 - 키워드: Bulk Insert, Batch Insert, 일괄 Insert, 대용량 Insert, 다중 Insert
 - https://btcd.tistory.com/1451
 - https://velog.io/@frankle97/MyBatis-%EC%9D%BC%EA%B4%84Batch-INSERTUPDATE
 - https://infjin.tistory.com/192
 - https://gngsn.tistory.com/156
 - https://sas-study.tistory.com/452
 - https://m.blog.naver.com/minsg1202/221974440751
 - https://linked2ev.github.io/mybatis/2019/09/08/MyBatis-1-MyBatis-%EA%B0%9C%EB%85%90-%EB%B0%8F-%EA%B5%AC%EC%A1%B0/

## 1. MyBatis

### 1-1. 단건 INSERT(Service단에서 반복)

Service에서 List를 매개변수로 받고, 해당 List에서 Item을 하나씩 꺼내 SQL을 호출한다.  
만약, __100번의 SQL 호출이 있다면 DB 서버에 100번에 네트워크를 타게 된다.__  

 - `Service`
    - Mapper를 통해 SQL을 수행한다.
    - Service단에서 List를 반복하여 Item을 등록한다.
```java
@RequiredArgsConstructor
@Service
public class ItemService {
    private final ItemMapper itemMapper;

    public void insertItem(Item item) {
        itemMapper.insertItem(item);
    }

    public void bulkInsertItem(List<Item> items) {
        for(Item item: items) {
            itemMapper.insertItem(item);
        }
    }
}
```
<br/>

 - `Mapper.java`
```java
@Mapper
public interface ItemMapper {
    int insertItem(Item item);
}
```
<br/>

 - `Mapper.xml`
    - Item DTO를 받아서 등록한다.
```xml
<insert id="insertItem" parameterType="Item">
    INSERT INTO (
        name, price, serialNo
    ) VALUES (
        #{name}, #{price}, #{serialNo}
    )
</insert>
```
<br/>

### 1-2. MyBatis forEach INSERT

SQL Mapper에서 여러 건을 등록하는 SQL을 하나 만든다.  
한 번에 네트워크를 통해 INSERT SQL을 수행하게 된다.  

 - `Service&Mapper`
    - Mapper에 List를 넘긴다. Mapper에서는 해당 List를 순회하여 INSERT SQL 정보를 만든다.
```java
// Service
@RequiredArgsConstructor
@Service
public class ItemService {
    ..

    public void bulkInsertItem(List<Item> items) {
        itemMapper.bulkInsertItem(items);
    }
}

// Mapper
@Mapper
public interface ItemMapper {
    int bulkInsertItem(@Param("items") List<Item> items);
}
```
<br/>

 - `Mapper.xml`
    - Item List를 순회하여 INSERT SQL을 만든다.
    - 만들어진 Batch INSERT 쿼리가 한 번에 수행된다. (네트워크 1번)
```xml
<insert id="insertItem" parameterType="Item">
    INSERT INTO (
        name, price, serialNo
    ) VALUES
    <foreach collection="items" item="item" separator=",">
        (
            #{name}, #{price}, #{serialNo}
        )
    </foreach>
</insert>
```
<br/>

#### 주의사항

__MySQL Client가 Server로 전달하는 Packet의 크기는 제한되어 있다.__  
때문에 Packet의 크기가 허용치를 넘는 경우 예외(max_allowed_packet)가 발생하게 된다.  

```sql
-- 최대 패킷 확인
SHOW VARIABLES LIKE 'max_allowed_packet';
```
<br/>

 - `Truncated Bulk INSERT`
    - List를 한 번에 처리하지 않고, List의 길이를 잘라서 사이즈별로 처리한다.
    - 시작 위치와 사이즈를 변수로 만들어, 한 번에 처리될 List의 사이즈를 제어한다.
```java
@RequiredArgsConstructor
@Service
public class ItemService {
    ..
    private final LIMIT_SIZE = 500;

    public void bulkInsertItem(List<Item> items) {
        int skip = 0;
        
        int itemsSize = items.size();
        while(skip < itemsSize) {
            final List<Item> truncatedItems = items
                        .stream()
                        .skip(skip)
                        .limit(LIMIT_SIZE)
                        .collect(Collectors.toList());
            
            skip += LIMIT_SIZE;
            itemMapper.bulkInsertItem(items);
        }
        
    }
}
```
<br/>

### 1-3. ExecutorType.BATCH 사용

ExecutorType.BATCH 모드로 사용하면, MyBatis가 한 번의 커넥션을 열고 여러 개의 SQL 쿼리를 배치 처리한다.  
이로써 데이터베이스 연결 및 해제 오버헤드를 줄이며, 실행 시간을 크게 단축시킬 수 있다.  

```java
@RequiredArgsConstructor
@Service
public class ItemService {
    ..
    private final LIMIT_SIZE = 500;

    public void bulkInsertItem(List<Item> items) {
        SqlSession session = sqlSessionFactory.openSession(ExecutorType.BATCH);
        try {
            int index = 0;
            for(Item item: items) {
                session.insert("itemMapper.insertItem", item);
                index++;

                if(index % 500 == 0) {
                    session.commit();
                }
            }
        } catch (Exception e) {
            session.rollback();
        } finally {
            session.commit();
            session.close();
        }
    }
}
```
<br/>

#### ExecutorType.BATCH 주의점

ExecutorType.BATCH 모드일 때 실제 SQL이 메서드 수행시 바로 동작하지 않는다.  
때문에, SELECT 구문과 변경(INSERT, UPDATE) 구문이 같이 실행이 필요한 경우 경계를 표시해야 한다.  
 - 모든 명령이 배치 처리되기 때문에 원하는 실행 방법이 기본 설정과 다른 경우에만 사용해야한다.
 - BATCH가 아닌ExecutorType의 트랜잭션과 혼용될 수 없고 만약 섞이게 된다면 Exception이 발생하기 때문에 해당 메서드를 별도의 트랜잭션으로 구분해야한다.
```java
// Propagation.REQURIES_NEW는 부모 트랜잭션이 있다면 잠시 대기시키고,
// 자식 트랜잭션을 별도로 실행한다.
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void bulkInsertItem(List<Item> items) {
    ..
}
```
<br/>

#### SqlSessionTemplate 여러 모드 등록

SqlSessionTemplate을 기본 ExecutorType과 Batch로 구분해서 생성한다.  
필요한 곳에서 Batch 처리용 SqlSession을 받아서 사용한다.  

```java
@Configuration
public class MyBatisConfig {
    @Bean(name = "dataSource")
    @ConfigurationProperties(prefix = "spring.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }
   
   ..... 생략 .....
  
    @Bean(name = "sqlSessionTemplate")
    @Primary
    public SqlSessionTemplate sqlSessionTemplate(SqlSessionFactory sqlSessionFactory) throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    @Bean(name = "batchSqlSessionTemplate")
    public SqlSessionTemplate batchSqlSessionTemplate(SqlSessionFactory sqlSessionFactory) throws Exception {
        return new SqlSessionTemplate(sqlSessionFactory, ExecutorType.BATCH);
    }
}

// 1. SqlSessionTemplate 사용
public class ItemService {
    @Autowired
    @Qualifier("batchSqlSessionTemplate")
    public SqlSessionTemplate sqlBatchTemplate;

    public void bulkInsertItem {
        try {
            int index = 0;
            for(Item item: items) {
                sqlBatchTemplate.insert("itemMapper.insertItem", item);
                index++;

                if(index % 500 == 0) {
                    sqlBatchTemplate.commit();
                }
            }
        } catch (Exception e) {
            sqlBatchTemplate.rollback();
        } finally {
            sqlBatchTemplate.commit();
            sqlBatchTemplate.close();
        }
    }
}

// 2. SqlSessionTemplate 사용
public class ItemService {
    @Autowired
    @Qualifier("batchSqlSessionTemplate")
    public SqlSessionTemplate sqlBatchTemplate;

    public void bulkInsertItem {
        SqlSession session = sqlBatchTemplate.getSqlSessionFactory().openSession(ExecutorType.BATCH);
        ..
    }
}
```
