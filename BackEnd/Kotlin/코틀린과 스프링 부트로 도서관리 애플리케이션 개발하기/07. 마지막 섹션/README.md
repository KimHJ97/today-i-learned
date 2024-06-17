# 마지막 섹션

## 테스트 코드 레포지토리 데이터 삭제 자동화

 - `CleaningSpringBootTtest`
```kotlin
@SpringBootTest
class CleaningSpringBootTtest {

    @Autowired
    private lateinit var repositories: List<JpaRepository<*, *>>

    @AfterEach
    fun clean() {
        val currentMillis = System.currentTimeMillis()
        repositories.forEach { it.deleteAll() }
        println("소요 시간 : ${System.currentTimeMillis() - currentMillis}")
    }
}
```
<br/>

## 테스트와 영속성 컨텍스트

엔티티 클래스에서 oneToMany 관계의 Lazy Loading을 이용한다고 가정한다.  
이떄, 테스트 코드에서 트랜잭션이 없어서 조회 이후에 영속성 컨텍스트가 종료되어 버린다.  
떄문에, Lazy Loading이 동작하지 않게 되어 원하는 결과를 얻지 못한다.  

<br/>

이러한 경우 테스트 코드에 @Transactional 어노테이션을 명시하거나, 여러 가지 방법으로 해결해야 한다.  

 - `UserService`
```kotlin
@Transactional
fun saveUserAndLoanTwoBooks() {
    val newUser = User("A", 123)
    val books = bookRepository.saveAll(
        listOf(
            Book("책1", COMPUTER),
            Book("책2", COMPUTER),
        )
    )
    books.forEach { book -> newUser.loanBook(book) }
    userRepository.save(newUser)
}
```
<br/>

 - `TempTest`
    - @Transactional
        - 장점: 간결하고, 롤백이 된다. 트랜잭션별로 테스트를 격리할 수 있어 병렬 테스트도 가능하다.
        - 단점: 테스트 내성이 떨어진다. (Service 측에 @Transactional이 없어도 테스트가 성공한다.)
    - Fetch Join을 사용해 미리 불러온다.
        - 데이터를 조회할 때 애초에 연관된 모든 데이터를 조회한다.
    - TxHelper를 사용한다.
```kotlin
@SpringBootTest
class TempTest @Autowired constructor(
    private val userService: UserService,
    private val userRepository: UserRepository,
    private val userLoanHistoryRepository: UserLoanHistoryRepository,
    private val txHelper: TxHelper,
) {
    
    // ❌ 트랜잭션이 종료되어 Lazy Loading 되지 않는다.
    @Test
    fun `유저 1명과 책 2권을 저장하고 대출한다`() {
        // when
        userService.saveUserAndLoanTwoBooks()

        // then
        val users = userRepository.findAll()
        assertThat(users).hasSize(1)
        assertThat(users[0].userLoanHistories).hasSize(2)
    }

    // @Transactional을 활용한다.
    @Transactional
    @Test
    fun `유저 1명과 책 2권을 저장하고 대출한다2`() {
        // when
        userService.saveUserAndLoanTwoBooks()

        // then
        val users = userRepository.findAll()
        assertThat(users).hasSize(1)
        assertThat(users[0].userLoanHistories).hasSize(2)
    }

    // Lazy Loading 되는 Repository 측을 활용한다.
    @Test
    fun `유저 1명과 책 2권을 저장하고 대출한다3`() {
        // when
        userService.saveUserAndLoanTwoBooks()

        // then
        val users = userRepository.findAll()
        assertThat(users).hasSize(1)
        val histories = userLoanHistoryRepository.findAll()
        assertThat(histories).hasSize(2)
        assertThat(histories[0].user.id).isEqualTo(users[0].id)
    }

    // TxHelper 활용
    @Test
    fun `유저 1명과 책 2권을 저장하고 대출한다3`() {
        // when
        userService.saveUserAndLoanTwoBooks()

        // then
        txHelper.exec {
            val users = userRepository.findAll()
            assertThat(users).hasSize(1)
            assertThat(users[0].userLoanHistories).hasSize(2)
        }
    }
}
```
<br/>

 - `TxHelper`
```kotlin
@Component
class TxHelper {

    @Transactional
    fun exec(block: () -> Unit) {
        block()
    }
}
```
<br/>

## 코프링과 플러그인

 - 스프링 컴포넌트와 spring 플러그인
    - @Componenet, @Transactional, @Async, @Cacheable, @SpringBootTest 등 스프링 어노테이션이 붙어있는 클래스와 메서드에 대해서 open 해준다.
```groovy
plugins {
    id 'org.jetbrains.kotlin.plugin.spring' version '1.6.21'
}
```
<br/>

 - JPA 객체와 기본 생성자
    - JPA 관련 객체(Entity, MappedSuperClass, Embeddable)에 기본 생성자를 만들어준다.
    - JPA가 동적으로 엔티티 객체의 인스턴스를 만들 때, 리플렉션 기술을 사용하는데 기본 생성자가 필수로 필요하다.
```groovy
plugins {
    id 'org.jetbrains.kotlin.plugin.jpa' version '1.6.21'
}
```
<br/>

 - JPA 객체와 open
    - JPA 객체에 대해서 open
```groovy
plugins {
    id 'org.jetbrains.kotlin.plugin.allopen' version '1.6.21'
}

allOpen {
    annotation("javax.persistence.Entity")
    annotation("javax.persistence.MappedSuperclass")
    annotation("javax.persistence.Embeddable")
}
```
