# Java 서버를 Kotlin 서버로 리팩토링

 - Java로 작성된 도서관리 애플리케이션을 Kotlin으로 완전히 리팩토링 한다.
 - Kotlin + JPA 코드를 작성하며, 사용에 익숙해진다.
 - Kotlin + Spring 코드를 작성하며, 사용에 익숙해진다.
 - Java 프로젝트를 kotlin으로 리팩토링 해야 하는 상황에 대한 경험을 쌓는다.

```
★ Kotlin 리팩토링 계획
1. Domain 계층부터 코틀린으로 변경한다.
 - Domain은 POJO, JPA Entity 객체이다.

2. Repository 계층을 코틀린으로 변경한다.
 - Repository는 Spring Bean이고, 해당 계층은 다른 스프링 빈을 의존하지 않는다.

3. Service 계층을 코틀린으로 변경한다.
 - Service는 Spring Bean이고, 다른 스프링 빈을 의존하며, 비즈니스 로직이 있다.

4. Controller와 DTO를 코틀린으로 변경한다.
 - Controller는 Spring Bean이고, 다른 스프링 빈을 의존한다.
 - DTO는 간단하지만 그 숫자가 많다.

각 단계별로 작성해둔 테스트를 지속적으로 실행시키며
모든 기능이 동작하는지 검증한다.
```
<br/>

## 1. 도메인 계층을 Kotlin으로 변경

### 프로젝트 환경 설정

 - `build.gradle`
    - JPA 사용시 기본 생성자가 필요하다. kotlin.plugin.jpa 플러그인을 등록해준다.
    - Kotlin 클래스에 대해서 Reflection 기능을 사용하기 위해서는 의존 라이브러리를 등록해야 한다. kotlin-reflect 의존성을 추가한다.
```groovy
plugins {
    // ..
    id 'org.jetbrains.kotlin.jvm' version '1.6.21'
    id 'org.jetbrains.kotlin.plugin.jpa' version '1.6.21'
}

dependencies {
    // ..
    implementation 'org.jetbrains.kotlin:kotlin-stdlib-jdk8'
    implementation 'org.jetbrains.kotlin:kotlin-reflect:1.6.21'
}
```

### Book

 - `Book.java`
```java
@Entity
public class Book {

  @Id
  @GeneratedValue(strategy = IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  public Book() {

  }

  public Book(String name) {
    if (name.isBlank()) {
      throw new IllegalArgumentException("이름은 비어 있을 수 없습니다");
    }
    this.name = name;
  }

  public String getName() {
    return name;
  }

}
```
<br/>
 
 - `Book.kt`
```kotlin
@Entity
class Book (
    val name: String,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
) {

    init {
        if (name.isBlank()) {
            throw IllegalArgumentException("이름은 비어 있을 수 없습니다")
        }
    }
}
```
<br/>

 - `BookRepsitory.java`
    - Repository는 아직까지 Java 코드이다.
    - Book 객체를 Book.java가 아닌, Book.kt를 이용하도록 한다.
```java
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByName(String bookName);
}
```
<br/>

 - `BookService.java`
    - Java에서 Kotlin 코드를 호출할 때는 디폴트 파라미터를 인식하지 못한다.
        - 해당 부분에 대해서는 null로 정의해준다.
```java
@Service
public class BookService {

  private final BookRepository bookRepository;
  private final UserRepository userRepository;
  private final UserLoanHistoryRepository userLoanHistoryRepository;

  public BookService(
      BookRepository bookRepository,
      UserRepository userRepository,
      UserLoanHistoryRepository userLoanHistoryRepository
  ) {
    this.bookRepository = bookRepository;
    this.userRepository = userRepository;
    this.userLoanHistoryRepository = userLoanHistoryRepository;
  }

  @Transactional
  public void saveBook(BookRequest request) {
    Book newBook = new Book(request.getName(), null);
    bookRepository.save(newBook);
  }

  // ..

}
```
<br/>

 - `BookServiceTest.kt`
    - 해당 Book.java를 Book.kt로 변경해준다.
    - 이후 테스트 코드를 실행해준다.

<br/>

### User, UserLoanHistory

#### UserLoanHistory

 - `UserLoanHistory.java`
```java
@Entity
public class UserLoanHistory {

  @Id
  @GeneratedValue(strategy = IDENTITY)
  private Long id;

  @ManyToOne
  private User user;

  private String bookName;

  private boolean isReturn;

  public UserLoanHistory() {

  }

  public UserLoanHistory(User user, String bookName, boolean isReturn) {
    this.user = user;
    this.bookName = bookName;
    this.isReturn = isReturn;
  }

  public String getBookName() {
    return this.bookName;
  }

  public void doReturn() {
    this.isReturn = true;
  }

}
```
<br/>

 - `UserLoanHistory.kt`
```kotlin
@Entity
class UserLoanHistory (
  @ManyToOne
  val user: User,

  val bookName: String,

  var isReturn: Boolean,

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  val id: Long? = null,
) {
  fun doReturn() {
    this.isReturn = true
  }
}
```
<br/>

 - `UserLoanHistory 사용 부분 변경하기`
    - User.java에서 UserLoanHistory.kt로 변경
    - UserLoanHistoryRepository.java에서 UserLoanHistory.kt로 변경

<br/>

#### User

 - `User.java`
```java
@Entity
public class User {

  @Id
  @GeneratedValue(strategy = IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  private Integer age;

  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  private final List<UserLoanHistory> userLoanHistories = new ArrayList<>();

  public User() {

  }

  public User(String name, Integer age) {
    if (name.isBlank()) {
      throw new IllegalArgumentException("이름은 비어 있을 수 없습니다");
    }
    this.name = name;
    this.age = age;
  }

  public void updateName(String name) {
    this.name = name;
  }

  public void loanBook(Book book) {
    this.userLoanHistories.add(new UserLoanHistory(this, book.getName(), false));
  }

  public void returnBook(String bookName) {
    UserLoanHistory targetHistory = this.userLoanHistories.stream()
        .filter(history -> history.getBookName().equals(bookName))
        .findFirst()
        .orElseThrow();
    targetHistory.doReturn();
  }

  public String getName() {
    return name;
  }

  public Integer getAge() {
    return age;
  }

  public Long getId() {
    return id;
  }

}
```
<br/>

 - `User.kt`
    - 가변 리스트를 사용하기 위해 MutableList를 이용한다.
```kotlin
class User (
  var name: String,

  val age: Int?,

  @OneToMany(mappedBy = "user", cascade = [CascadeType.ALL], orphanRemoval = true)
  val userLoanHistories: MutableList<UserLoanHistory> = mutableListOf(),

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  val id: Long? = null,
) {

  init {
    if (name.isBlank()) {
      throw IllegalArgumentException("이름은 비어 있을 수 없습니다")
    }
  }

  fun updateName(name: String) {
    this.name = name
  }

  fun loanBook(book: Book) {
    this.userLoanHistories.add(UserLoanHistory(this. book.name, false))
  }

  fun returnBook(bookName: String) {
    this.userLOanHistories.first { history -> history.bookName == bookName }.doReturn()
  }
}
```
<br/>

 - `User 사용 부분 변경하기`
    - UserResponse에서 User 엔티티를 받아서 객체를 생성해주는데, User.kt로 변경
    - UserRepository에서 User.kt로 변경
    - UserService에서 User.kt로 변경
        - 코틀린에서 mutableListOf() 디폴트 파라미터를 사용하지만, Java에서는 인식하지 못한다. 해당 부분을 Collections.emptyList()로 변경해준다.
    - BookService에서 User.kt로 변경
    - BookServiceTest에서 User.kt로 변경
    - UserServiceTest에서 User.kt로 변경

<br/>

## 2. 레포지토리 계층을 Kotlin으로 변경

### Kotlin과 JPA를 함께 사용할 때 주의점 3 가지

#### Setter에 관한 이야기

Setter 대신 좋은 이름의 함수를 사용하는 것이 훨씬 Clean하다.  
Setter 대신 다른 이름의 함수를 사용하면, 함수의 이름을 붙여줄 수 있고, 여러 프로퍼티를 한 번에 수정해줄 수 있다.  

 - User 엔티티 클래스를 코틀린으로 변경할 때 var 키워드로 name 프로퍼티를 만들어준다.
 - 그리고, Setter 대신 추가적인 함수를 만들어 수정 작업을 해준다.
```kotlin
@Entity
class User(
  var name: String,

  // ..
) {

  fun updateName(name: String) {
    this.name = name
  }
}
```
<br/>

하지만, name에 대한 Setter는 public이기 떄문에, 유저 이름 업데이트 기능에서 Setter 함스를 사용할 수도 있다.  
즉, 코드상 Setter 함수가 열려있어 Setter를 사용할 수 있다는 것이 불편하다.  
또한, Getter는 필요하기 때문에 public해야 하고, Setter는 닫혀야 하기 떄문에 private 하게 만드는 것이 최선이다.  

 - __backing property__
    - name 프로퍼티를 '_name'으로 만들고, private 접근 제어자로 정의한다.
    - 외부에서는 불변인 name에 접근하도록 해준다.
```kotlin
class User(
  private var _name: String
) {

  val name: String
    get() = this._name
}
```
<br/>

 - __커스텀 Setter__
```kotlin
class User(
  name: String
) {
  var name = name
    private set
}
```
<br/>

두 방법 모두 프로퍼티가 많아지면 번거롭다.  
때문에, 개인적으로 Setter를 열어 두지만 사용하지 않는 방법이 선호된다.  
팀 내에서 Setter를 사용하면 안 된다는 사실을 모든 개발자 분들이 체득하여야 한다.  
 - Trace-Off의 영역으로 팀 컨벤션에 맞추는 것이 가장 중요하다.

<br/>

#### 생성자 안의 프로퍼티

프로퍼티를 생성자 안에서 정의할 수 있고, 클래스 Body 안에 정의할 수 있다.  
 - 모든 프로퍼티를 생성자에서 정의
 - 프로퍼티를 생성자 혹은 클래스 Body 안에 구분해서 넣을 때 명확한 기준 만들기

<br/>

#### JPA와 data class

코틀린에서는 data 클래스가 존재한다.  
해당 클래스는 equals(), hashCode(), toString() 함수 등을 자동으로 만들어준다.  
 - __Entity는 data class를 피하는 것이 좋다.__
    - equals, hashCode, toString 모두 JPA Entity와 100% 어울리지 않는다.
    - User와 UserLoanHistory 같이 양방향 매핑이 있을 때, equals()를 사용시 서로 재귀 호출을 하게 될 수 있다.

<br/>

### Repository 코드 변경

 - `BookRepository.kt`
    - 코틀린에서는 '?' 키워드를 통해서 타입에 NULL 가능 여부를 지정하여 Optional을 제외시킬 수 있다.
    - 하지만, Service 계층과의 호환성을 위해 Optional을 유지해준다.
```kotlin
interface BookRepository: JpaRepository<Book, Long> {
  fun findByName(bookName: String): Optional<Book>
}
```
<br/>

 - `UserRepository.kt`
```kotlin
interface UserRepository: JpaRepository<User, Long> {
  fun findByName(name: String): Optional<User>
}
```
<br/>

 - `UserLoanHistoryRepository`
```kotlin
interface UserLoanHistoryRepository: JpaRepository<User, Long> {
  fun findByBookNameAndIsReturn(bookName: String, isReturn: Boolean): UserLoanHistory?
}
```
<br/>

## 3. 서비스 계층을 Kotlin으로 변경

### 프로젝트 설정

 - `build.gradle`
    - 코틀린은 기본적으로 클래스와 함수에 Override가 불가능하다. 이것을 허용하기 위해서는 open 키워드를 정의해주어야 한다.
    - 하지만, 재정의가 필요한 모든 곳에 open을 정의하는 것은 번거롭다. 이것을 해결하기 위해서 플러그인을 이용할 수 있다.
    - 'org.jetbrains.kotlin.plugin.spring' 플러그인을 이용하면 스프링 빈 클래스를 자동으로 열어주고, 그 안에 메서드들도 자동으로 열어준다.
```groovy
plugins {
    // ..
    id 'org.jetbrains.kotlin.jvm' version '1.6.21'
    id 'org.jetbrains.kotlin.plugin.jpa' version '1.6.21'
    id 'org.jetbrains.kotlin.plugin.spring' version '1.6.21'
}
```
<br/>

### User 관련 코드

 - `UserService.kt`
    - @Transactional 기능을 사용하기 위해서는 해당 함수가 Override가 가능해야 한다. 하지만, 코틀린에서는 기본적으로 class와 method 모두 상속이 불가능하다. 상속이 가능하게 하기 위해서는 open 이라는 키워드를 정의해주어야 한다. 'org.jetbrains.kotlin.plugin.spring' 플러그인을 통해 자동으로 스프링 빈의 클래스와 메서드가 자동으로 열린다.
```kotlin
@Service
class UserService(
  private val userRrepository: UserRepository,
) {

  @Transactional
  fun saveUser() {
    val newUser = User(request.name, request.age)
    userRepository.save(newUser)
  }

  @Transactional(readOnly = true)
  fun getUsers(): List<UserResponse> {
    return userRepository.findAll()
      .map { user -> UserResponse(user) }
      // .map { UserResponse(it) } // 하나의 람다는 it을 이용할 수 있다.
      // .map(::UserResponse) // 생성자 이용시 ::을 이용할 수 있다.
  }

  @Transactional
  fun updateUserName(request: UserUpdateRequest) {
    val user = userRepository.findById(request.id).orElseThrow(::IllegalArgumentException)
    user.updateName(request.name)
  }

  @Transactional
  fun deleteUser(name: String) {
    val user = userRepository.findByName(name).orElseThrow(::IllegalArgumentException)
    userRepository.delete(user)
  }
}
```
<br/>

 - `UserService 사용 부분`
    - UserServiceTest, UserController 변경

<br/>

### Book 관련 코드

 - `BookService.kt`
```kotlin
@Service
class BookService(
  private val bookRepository: BookRepository,
  private val userRepository: UserRepository,
  private val userLoanHistoryRepository: UserLoanHistoryRepository,
) {

  @Transactional
  fun saveBook(request: BookRequest) {
     val newBook = Book(request.name)
     bookRepository.save(newBook)
  }

  @Transactional
  fun loanBook(request: BookLoanRequest) {
    val book = bookRepository.findByName(request.name).orElseThrow(::IllegalArgumentException)
    if (userLoanHistoryRepository.findByBookNameAndIsReturn(request.bookName, false) != null) {
      throw IllegalArgumentException("진작 대출되어 있는 책입니다")
    }

    val user = userRepository.findByName(request.userName).orElseThrow(::IllegalArgumentException)
    user.loanBook(book)
  }

  @Transactional
  fun returnBook(request: BookReturnRequest) {
    val user = userRepository.findByName(request.userName).orElseThrow(::IllegalArgumentException)
    user.returnBook(request.bookName)
  }
}
```
<br/>

 - `BookService 사용 부분`
    - BookServiceTest, BookController 변경

<br/>

### Optional 제거

Java에서 Optional은 특정 값이 Null이 될 수 있는지를 표현하기 위해 생겨났다.  
Kotlin에서는 언어 자체에서 '?' 키워드를 통해서 어떠한 값이 Null을 허용하는지 아닌지를 표현할 수 있다.  

 - `Repository`
```kotlin
interface UserRepository: JpaRepository<User, Long> {
  fun findByName(name: String): User?
}

interface BookRepository: JpaRepository<Book, Long> {
  fun findByName(bookName: String): Book?
}
```
<br/>

 - `UserService`
```kotlin
@Service
class UserService(
  private val userRrepository: UserRepository,
) {

  // ..

  @Transactional
  fun updateUserName(request: UserUpdateRequest) {
    val user = userRepository.findById(request.id).orElseThrow(::IllegalArgumentException)
    user.updateName(request.name)
  }

  @Transactional
  fun deleteUser(name: String) {
    val user = userRepository.findByName(name) ?: throw IllegalArgumentException()
    userRepository.delete(user)
  }
}
```
<br/>

 - `BookService`
```kotlin
@Service
class BookService(
  private val bookRepository: BookRepository,
  private val userRepository: UserRepository,
  private val userLoanHistoryRepository: UserLoanHistoryRepository,
) {

  // ..

  @Transactional
  fun loanBook(request: BookLoanRequest) {
    val book = bookRepository.findByName(request.name) ?: throw IllegalArgumentException()
    if (userLoanHistoryRepository.findByBookNameAndIsReturn(request.bookName, false) != null) {
      throw IllegalArgumentException("진작 대출되어 있는 책입니다")
    }

    val user = userRepository.findByName(request.userName) ?: throw IllegalArgumentException()
    user.loanBook(book)
  }

  @Transactional
  fun returnBook(request: BookReturnRequest) {
    val user = userRepository.findByName(request.userName) ?: throw IllegalArgumentException()
    user.returnBook(request.bookName)
  }
}
```
<br/>

#### 좀 더 개선하기: throw IllegalArgumentException

엔티티가 Null이 될 수 있을 때마다, '?: throw IllegalArgumentException()' 코드를 붙여줘야 한다.  
해당 부분에 대해서 Util 함수를 만드러 좀 더 가독성과 재사용성을 높일 수 있다.  

 - `util/ExceptionUtils.kt`
```kotlin
fun fail(): Nothing {
  throw IllegalArgumentException()
}
```
<br/>

 - `BookService`
```kotlin
@Service
class BookService(
  private val bookRepository: BookRepository,
  private val userRepository: UserRepository,
  private val userLoanHistoryRepository: UserLoanHistoryRepository,
) {

  // ..

  @Transactional
  fun loanBook(request: BookLoanRequest) {
    val book = bookRepository.findByName(request.name) ?: fail()
    if (userLoanHistoryRepository.findByBookNameAndIsReturn(request.bookName, false) != null) {
      throw IllegalArgumentException("진작 대출되어 있는 책입니다")
    }

    val user = userRepository.findByName(request.userName) ?: fail()
    user.loanBook(book)
  }

  @Transactional
  fun returnBook(request: BookReturnRequest) {
    val user = userRepository.findByName(request.userName) ?: fail()
    user.returnBook(request.bookName)
  }
}
```
<br/>

#### 좀 더 개선하기: findById

CrudRepository의 findById() 함수는 Optional을 반환한다.  
해당 클래스는 라이브러리로 해당 코드를 제어할 수 없다.  
하지만, Kotlin에서는 확장 함수를 이용하여 라이브러리의 코드를 제어할 수 있다.  
 - Spring Framework는 Kotlin 언어에서 Repository를 사용할 것을 대비하여 'CrudRepositoryExtensions.kt' 확장 함수를 제공해준다.

```kotlin
fun <T, ID> CrudRepository<T, ID>.findByIdOrNull(id: ID): T? = findById(id).orElse(null)
```
<br/>

 - `UserService`
```kotlin
@Service
class UserService(
  private val userRrepository: UserRepository,
) {

  // ..

  @Transactional
  fun updateUserName(request: UserUpdateRequest) {
    //val user = userRepository.findById(request.id).orElseThrow(::IllegalArgumentException)
    val user = userRepository.findByIdOrNull(request.id) ?: fail()
    user.updateName(request.name)
  }

}
```
<br/>

 - `util/ExceptionUtils.kt`
    - 엘비스 연산자를 이용해서 NULL일 때, fail() 함수를 호출하는 부분도 확장 함수를 이용하여 더 줄일 수 있다.
```kotlin
fun fail(): Nothing {
  throw IllegalArgumentException()
}

fun <T, ID> CrudRepository<T, ID>.findByIdOrThrow(id: ID): T {
  return this.findByIdOrNull(id) ?: fail()
}

// UserService
@Transactional
fun updateUserName(request: UserUpdateRequest) {
  //val user = userRepository.findById(request.id).orElseThrow(::IllegalArgumentException)
  //val user = userRepository.findByIdOrNull(request.id) ?: fail()
  val user = userRepository.findByIdOrThrow(request.id)
  user.updateName(request.name)
}
```
<br/>

## 4. DTO를 Kotlin으로 변경

DTO는 간단하지만 양이 많다.  
IntelliJ 기능을 이용하여 *.java 파일을 *.kt 파일로 쉽게 변경할 수 있다.  

 - `IntelliJ 기능`
    - Java에서는 Integer 타입은 Null이 가능하다. Kotlin으로 변환될 떄 단순히 Int 타입으로 변경되는데, Null이 불가능한 타입으로 변경된다. 이러한 부분은 찾아서 '?' 키워드를 넣어주어야 한다.
```
DTO 패키지 우클릭 > Convert Java File To Kotlin File
```
<br/>

### UserResponse

 - `UserResponse.java`
```java
public class UserResponse {

  private final long id;
  private final String name;
  private final Integer age;

  public UserResponse(User user) {
    this.id = user.getId();
    this.name = user.getName();
    this.age = user.getAge();
  }

  public long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public Integer getAge() {
    return age;
  }

}
```
<br/>

 - `UserResponse.kt`
    - 자동으로 변환시 User를 생성자로 받고, init을 이용하여 프로퍼티에 대입된다.
```kotlin
class UserResponse(user: User) {
  val id: Long
  val name: String
  val age: Int?

  init {
    id = user.id!!
    name = user.name
    age = user.age
  }
}

// 부생성자를 이용한 방식으로 리팩토링
class UserResponse(
  val id: Long,
  val name: String,
  val age: Int?,
) {

  constructor(user: User): this(
    id = user.id!!,
    name = user.name,
    age = user.age
  )
}

// 정적 팩토리 메서드로 리팩토링
class UserResponse(
  val id: Long,
  val name: String,
  val age: Int?,
) {

  companion object {
    fun of(user: User): UserResponse {
      return UserResponse(
        id = user.id!!,
        name = user.name,
        age = user.age
      )
    }
  }

}

// data 클래스로 변경
data class UserResponse(
  val id: Long,
  val name: String,
  val age: Int?,
) {

  // ..
}
```
<br/>

## 5. Controller 계층을 Kotlin으로 변경

 - `BookController`
```kotlin
@RestController
class BookController(
  private val bookService: BookService,
) {

  @PostMapping("/book")
  fun saveBook(@RequestBody request: BookRequest) {
    bookService.saveBook(request)
  }

  @PostMapping("/book/loan")
  fun loanBook(@RequestBody request: BookLoanRequest) {
    bookService.loanBook(request)
  }

  @PutMapping("/book/return")
  fun returnBook(@RequestBody request: BookReturnRequest) {
    bookService.returnBook(request)
  }

}
```
<br/>

 - `UserController`
```kotlin
@RestController
class UserController(
  private val userService: UserService,
) {

  @PostMapping("/user")
  fun saveUser(@RequestBody request: UserCreateRequest) {
    userService.saveUser(request)
  }

  @GetMapping("/user")
  fun getUsers(): List<UserResponse> {
    return userService.getUsers()
  }

  @PutMapping("/user")
  fun updateUserName(@RequestBody request: UserUpdateRequest) {
    userService.updateUserName(request)
  }

  @DeleteMapping("/user")
  fun deleteUser(@RequestParam name: String) {
    userService.deleteUser(name)
  }

}
```
<br/>

 - `LibraryAppApplication`
    - 코틀린에서는 top 라인에 여러 클래스와 여러 함수를 만들 수 있다.
    - 함수를 만들면, 해당 함수는 static 함수로 감지된다.
    - 또한, Spring에서는 Kotlin과의 호환성을 위해서 SpringApplication.run() 메서드를 확장한 runApplication() 확장 함수를 제공한다.
```kotlin
@SpringBootApplication
class LibraryAppApplication

fun main(args: Array<String>) {
  runApplication<LibraryAppApplication>(*args)
}
```

### JSON 파싱

Jackson 라이브러리는 JSON 문자열과 Java 객체와의 직렬화와 역직렬화를 제공해준다.  
떄문에, Kotlin 코드를 인지하지 못할 수 있는데 이러한 경우 의존성을 추가해준다.  


 - `build.gradle`
    - jackson-module-kotlin 의존성을 추가한다.
```groovy
dependencies {
    // ..
    implementation 'org.jetbrains.kotlin:kotlin-stdlib-jdk8'
    implementation 'org.jetbrains.kotlin:kotlin-reflect:1.6.21'
    implementation 'com.fasterxml.jackson.module:jackson-module-kotlin:2.13.3'
}
```

