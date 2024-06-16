# 첫 번째 요구사항 추가하기 - 책의 분야

 - Type, Status 등을 서버에서 관리하는 방법들을 살펴보고 장단점을 이해한다.
 - Test Fixture의 필요성을 느끼고 구성하는 방법을 알아본다.
 - Kotlin에성 Enum + JPA + Spring Boot를 활용하는 방법을 알아본다.

<br/>

 - `요구사항 확인`
    - 책을 등록할 때 '분야'를 선택해야 한다.
        - 분야에는 5가지 분야가 있다. (컴퓨터, 경제, 삭제, 언어, 과학)

<br/>

## 1. 책의 분야 추가하기

 - `Book`
    - Domain 계층을 변경하면, Service와 DTO 계층에 영향이 갈 수 있다.
    - 또한, 테스트 코드도 영향이 갈 수 있다.
        - 테스트 코드에서는 책에 타입과 상관이 없다.
        - Book 엔티티에 필드가 추가되더라도 테스트 코드를 변경하고 싶지 않다.
        - 이떄, 생성자를 통해서 객체를 만드는 것이 아니라 정적 팩토리 메서드를 이용하면 문제를 해결할 수 있다.
        - 엔티티에 추가적인 필드가 있더라도, 테스트 코드까지 전파되지 않는다.
```kotlin
@Entity
class Book(
  val name: String,

  val type: String,

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  val id: Long? = null,
) {

  init {
    if (name.isBlank()) {
      throw IllegalArgumentException("이름은 비어 있을 수 없습니다")
    }
  }

  companion object {
    fun fixture(
      name: String = "책 이름",
      type: String = "COMPUTER",
      id: Long? = null,
    ): Book {
      return Book(
        name = name,
        type = type,
        id = id,
      )
    }
  }

}
```
<br/>

 - `BookServiceTest`
    - 추가된 type이 정상적으로 저장되는지 테스트한다.
    - DTO 클래스로 정적 팩토리 메서드(fixture)를 이용해도 된다. 하지만, 도메인은 테스트 코드에서 많이 사용되는 반면에, DTO는 특정 API 호출시에만 사용되다 보니 상황에 따라서 만들어도 되고, 만들지 않아도 된다.
```kotlin
@SpringBootTest
class BookServiceTest @Autowired constructor(
  private val bookService: BookService,
  private val bookRepository: BookRepository,
  private val userRepository: UserRepository,
  private val userLoanHistoryRepository: UserLoanHistoryRepository,
) {

  // ..

  @Test
  @DisplayName("책 등록이 정상 동작한다")
  fun saveBookTest() {
    // given
    val request = BookRequest("이상한 나라의 엘리스", "COMPUTER")

    // when
    bookService.saveBook(request)

    // then
    val books = bookRepository.findAll()
    assertThat(books).hasSize(1)
    assertThat(books[0].name).isEqualTo("이상한 나라의 엘리스")
    assertThat(books[0].type).isEqualTo("COMPUTER")
  }

}
```
<br/>

## 2. Enum 클래스를 활용해 책의 분야 리팩토링 하기

### 기존 구조의 문제점

 - Book 엔티티에 type을 String으로 받는 경우, 정상적으로 문자열이 들어온지 검증하지 않는다.  
    - 물론, 초기화 메서드에 검증을 추가할 수 있지만 번거롭다.
 - 또한,코드만 보았을 때 DB 테이블에 어떤 값이 들어가는지 알 수 없다.
 - 문자열 타이핑은 실수할 여지가 않고, 새로운 type이 생기는 경우 로직추가를 놓칠 수 있다.
```kotlin
init {
    if (name.isEmpty()) {
        throw IllegalArgumentException("이름은 비어 있을 수 없습니다.")
    }

    if (type !in AVAILABLE_BOOK_TYPES) {
        throw IllegalArgumentException("들어올 수 없는 타입입니다.")
    }
}

fun getEventScore(): Int {
    return when (type) {
        "COMPUTER" -> 10
        "ECONOMY" -> 8
        "SOCIETY", "LANGUAGE", "SCIENCE" -> 5
        else -> throw IllegalArgumentException("잘못된 타입입니다")
    }
}

companion object {
    private val AVAILABLE_BOOK_TYPES = listOf("COMPUTER", "ECONOMY", "SOCIETY", "LANGUAGE", "SCIENCE")
}
```
<br/>

### Enum 클래스 이용하기

 - `BookType`
    - ENUM을 이용하여 들어가는 값을 검증할 수 있다.
    - 코드만 보았을 때, 어떤 값이 들어갈 지 알 수 있다.
```kotlin
enum class BookType {
  COMPUTER,
  ECONOMY,
  SOCIETY,
  LANGUAGE,
  SCIENCE,
}
```
<br/>

 - `Book`
    - 기본적으로 ENUM을 사용하면 인덱스 값이 들어간다.
    - @Enumerated(EnumType.STRING)을 정의하면 ENUM 문자열이 들어가게 된다.
```kotlin
@Entity
class Book(
  val name: String,

  @Enumerated(EnumType.STRING)
  val type: BookType,

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  val id: Long? = null,
) {

  init {
    if (name.isBlank()) {
      throw IllegalArgumentException("이름은 비어 있을 수 없습니다")
    }
  }

  companion object {
    fun fixture(
      name: String = "책 이름",
      type: BookType = BookType.COMPUTER,
      id: Long? = null,
    ): Book {
      return Book(
        name = name,
        type = type,
        id = id,
      )
    }
  }

}
```
<br/>

## 3. Boolean에도 Enum 활용하기

UserLoanHistory에 isReturn이라는 Boolean 타입에 ENUM을 적용해본다.  

<br/>

### Boolean 타입 문제점

```
User 테이블이 있다고 가정한다.

1. User에 휴면 여부를 관리한다.
 - 활성화 여부를 위해 isActive라는 변수의 Boolean 타입의 플래그 변수를 추가한다.
 - isActive가 true이면 활성화 유저
 - isActive가 false이면 휴면인 유저

2. 추가 요구사항으로 탈퇴 여부를 soft하게 관리한다.
 - soft 하게라는 것은 DB에는 데이터가 남아있지만, 시스템 상으로는 삭제된 것처럼 관리
 - 삭제 여부를 위해 isDeleted라는 변수의 Boolean 타입의 플래그 변수를 추가한다.
```
<br/>

Boolean이 2개 이상인 경우 코드를 이해하기 어려워 진다.
 - 한 객체가 여러 상태를 표현할 수록 이해하기 어렵다.
    - Boolean 타입이 2개인 경우 2^2으로 4가지 상태가 된다.
    - 4가지로도 충분히 어렵지만, Boolean이 1개 더 늘어나면 2^3으로 8가지 경우의 수가 나온다.
 - 또한, Boolean 2개로 표현되는 4가지 상태가 모두 유의미하지 않다.
    - isActive, isDeleted는 총 4가지 경우가 있다.
        - false, false: 휴면 상태인 유저
        - false, true: 휴면이면서 탈퇴한 유저는 없다.
        - true, false: 활성화된 유저
        - true, true: 탈퇴한 유저
    - 2번째 경우는 DB에 존재할 수 없는 조합이고, 이런 경우가 코드에서 가능한 것은 유지보수를 어렵게 만든다.

<br/>

### ENUM 코드 적용하기

상태를 ENUM 하나로 관리하면 필드 1개로 여러 상태를 표현할 수 있기 때문에 코드의 이해가 쉬워진다.  
또한, 정확하게 유의미한 상태만 나타낼 수 있기 때문에 코드의 유지보수가 용이해진다.  

<br/>

 - `UserLoanStatus`
```kotlin
enum class UserLoanStatus {
  RETURNED, // 반납 되어 있는 상태
  LOANED, // 대출 중인 상태
}
```
<br/>

 - `UserLoanHistory`
    - Booleaen 타입의 isReturn 변수를 ENUM 타입의 status로 변경한다.
    - 관련된 테스트 코드와 Repository, Service 코드를 개선해준다. (Boolean -> ENUM)
    - 생성자 부분도 정적 팩토리 메서드를 만들어서 활용해준다.
```kotlin
@Entity
class UserLoanHistory(
  @ManyToOne
  val user: User,

  val bookName: String,

  var status: UserLoanStatus = UserLoanStatus.LOANED,

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  val id: Long? = null,
) {

  val isReturn: Boolean
    get() = this.status == UserLoanStatus.RETURNED

  fun doReturn() {
    this.status = UserLoanStatus.RETURNED
  }

  companion object {
    fun fixture(
      user: User,
      bookName: String = "이상한 나라의 엘리스",
      status: UserLoanStatus = UserLoanStatus.LOANED,
      id: Long? = null,
    ): UserLoanHistory {
      return UserLoanHistory(
        user = user,
        bookName = bookName,
        status = status,
        id = id,
      )
    }
  }

}
```
