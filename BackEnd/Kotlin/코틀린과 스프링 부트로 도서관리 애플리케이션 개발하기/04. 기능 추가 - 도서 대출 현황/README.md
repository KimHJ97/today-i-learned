# 두 번째 요구사항 추가하기 - 도서 대출 현황

 - JOIN 쿼리의 종류와 차이점을 이해한다.
 - JPA N+1 문제가 무엇이고 발생하는 원인을 이해한다.
 - N+1 문제를 해결하기 위한 방법을 이해하고 활용할 수 있다.
 - 새로운 API를 만들 때 생길 수 있는 고민 포인트를 이해하고 적절한 감을 잡을 수 있다.

<br/>

## 1. 유저 대출 현황 보여주기 - 프로덕션 코드 개발

### 요구사항 확인

 - `유저 대출 현황 화면`
    - 유저 대출 현황을 보여준다.
    - 과거에 대출했던 기록과 현재 대출 중인 기록을 보여준다.
    - 아무런 기록이 없는 유저도 화면에 보여져야 한다.
 - `유저 대출 현황 조회 API`
    - URL: /user/loan
    - HTTP Method: GET
    - 요청 파라미터: 없음

<br/>

### 새로운 API 만들 때 코드의 위치

 - 새로운 Controller를 만든다.
 - 기존의 Controller에 추가한다.
    - 기존의 Controller에 추가한다면 어떤 Controller에 추가해야 할까?

<br/>

#### Controller를 구분하는 3가지 기준

 - __화면에서 사용되는 API끼리 모아둔다.__
    - 장점
        - 화면에서 어떤 API가 사용되는지 한 눈에 알기 용이하다.
    - 단점
        - 한 API가 여러 화면에서 사용되면 위치가 애매하다.
        - 서버 코드가 화면에 종속적이다.
 - __동일한 도메인 끼리 API를 모아둔다.__
    - 장점
        - 화면 위치와 무관하게 서버 코드는 변경되지 않아도 된다.
        - 비슷한 API끼리 모이게 되며 코드의 위치를 예측할 수 있다.
    - 단점
        - 이 API가 어디서 사용되는지 서버 코드만 보고 알기 어렵다.

<br/>

### 유저 대출 현황 API 코드

 - `UserHistoryResponse`
```kotlin
data class UserLoanHistoryResponse(
    val name: String, // 사용자 이름
    val books: List<BookHistoryResponse>
)

data class BookHistoryResponse(
    val name: String, // 책의 이름
    val isReturn: Boolean,
)
```
<br/>

 - `UserController`
```kotlin
@RestController
class UserController(
    private val userService: UserService,
) {

    // ..

    @GetMapping("/user/loan")
    fun getUserLoanHistories(): List<UserLoanHistoryResponse> {
        return userService.getUserLoanHistories()
    }
}
```
<br/>

 - `UserService`
    - getUserLoanHistories(): 사용자의 대출 현황을 조회한다.
        - userRepository에서 사용자 정보를 조회한다.
        - 이후 User 엔티티와 연관된 userLoanHistories를 순회하여 대출 상태를 설정해준다.
```kotlin
@Service
class UserService(
    private val userRepository: UserRepository,
) {

    // ..

    @Transactional(readOnly = true)
    fun getUserLoanHistories(): List<UserLoanHistoryResponse> {
        return userRepository.findAll().map { user -> 
            UserLoanHistoryResponse(
                name = user.name,
                books = user.userLoanHistories.map { history ->
                    BookHistoryResponse(
                        name = history.bookName,
                        isReturn = history.status == UserLoanStatus.RETURNED
                    )
                }
            )
        }
    }
}
```
<br/>

### 테스트 코드 개발

 - __검증 포인트__
    - 사용자가 지금까지 한 번도 책을 빌리지 않은 경우 API 응답에 잘 포함되어 있어야 한다.
    - 사용자가 책을 빌리고 아직 반납하지 않은 경우 isReturn 값이 false로 잘 들어 있어야 한다.
    - 사용자가 책을 빌리고 반납한 경우 isReturn 값이 true로 잘 들어 있어야 한다.
    - 사용자가 책을 여러권 빌렸는데, 반납을 한 책도 있고 하지 않은 책도 있는 경우 중첩된 리스트에 여러 권이 정상적으로 들어가 있어야 한다.

<br/>

 - `UserServiceTest`
    - 복잡한 테스트 1개보다, 간단한 테스트 2개가 유지보수하기 용이하다.
```kotlin
@SpringBootTest
class UserServiceTest @Autowired constructor(
    private val userRepository: UserRepository,
    private val userService: UserService,
    private val userLoanHistoryRepository: UserLoanHistoryRepository,
) {

    // ..

    @Test
    @DisplayName("대출 기록이 없는 유저도 응답에 포함된다.")
    fun getUserLoanHistoriesTest1() {
        // given
        userRepository.save(User("A", null))

        // when
        val results = userService.getUserLoanHistories()

        // then
        assertThat(results).hasSize(1)
        assertThat(results[0].name).isEqualTo("A")
        assertThat(results[0].books).isEmpty()
    }

    @Test
    @DisplayName("대출 기록이 많은 유저의 응답이 정상 동작한다.")
    fun getUserLoanHistoriesTest2() {
        // given
        val savedUser = userRepository.save(User("A", null))
        userLoanHistoryRepository.saveAll(listOf(
            UserLoanHistory.fixture(savedUser, "책1", UserLoanStatus.LOANED)
            UserLoanHistory.fixture(savedUser, "책2", UserLoanStatus.LOANED)
            UserLoanHistory.fixture(savedUser, "책3", UserLoanStatus.RETURNED)
        ))

        // when
        val results = userService.getUserLoanHistories()

        // then
        assertThat(results).hasSize(1)
        assertThat(results[0].name).isEqualTo("A")
        assertThat(results[0].books).hasSize(3)
        assertThat(results[0].books).extracting("name")
            .containsExactlyInAnyOrder("책1", "책2", "책3")
        assertThat(results[0].books).extracting("isReturn")
            .containsExactlyInAnyOrder(false, false, true)          
    }

    @Test
    @DisplayName("유저 대출 현황 조회가 합쳐진 테스트")
    fun getUserLoanHistoriesTest3() {
        // given
        val savedUsers = userRepository.saveAll(listOf(
            User("A", null),
            User("B", null),
        ))
        userLoanHistoryRepository.saveAll(listOf(
            UserLoanHistory.fixture(savedUsers[0], "책1", UserLoanStatus.LOANED)
            UserLoanHistory.fixture(savedUsers[0], "책2", UserLoanStatus.LOANED)
            UserLoanHistory.fixture(savedUsers[0], "책3", UserLoanStatus.RETURNED)
        ))

        // when
        val results = userService.getUserLoanHistories()

        // then
        assertThat(results).hasSize(2)
        val userAResult = results.first { it.name == "A" }

        assertThat(userAResult.books).hasSize(3)
        assertThat(userAResult.books).extracting("name")
            .containsExactlyInAnyOrder("책1", "책2", "책3")
        assertThat(userAResult.books).extracting("isReturn")
            .containsExactlyInAnyOrder(false, false, true)

        val userBResult = results.first { it.name == "B" }
        assertThat(userBResult.books).isEmpty()
    }
}
```
<br/>

## 2. N + 1 문제

N + 1 문제는 최초에 데이터를 한 번 가져오고, 그 데이터를 토대로 다시 한번 N 번의 SQL을 수행하는 것을 'N + 1 문제'라고 한다.  

<br/>

### N + 1 문제와 N + 1 문제가 발생하는 이유

 - 아래 코드는 N + 1 문제가 발생한다.
    - userRepository.findAll() 메서드가 실행되면 'SELECT * FROM USER;' 쿼리가 실행되어 모든 사용자 정보가 조회된다.
    - 이후, 각 사용자 정보마다 userLoanHistories에 접근할 때 'SELECT * FROM userLoanHistory WHERE userId = {userId}' 쿼리가 수행된다.
        - 이떄, 도서 대출 정보에 대한 SQL이 수행되고 메모리에 올라가게 된다.
        - 사용자마다 도서 대출 정보 조회 SQL이 수행되게 된다.
    - 즉, 최초에 모든 유저를 가져오는 1번 SQL이 수행되고, Loop를 통해 사용자별로 히스토리를 가져오는 N번의 쿼리가 수행된다.
```kotlin
@Transactional(readOnly = true)
fun getUserLoanHistories(): List<UserLoanHistoryResponse> {
    val users = userRepository.findAll()
    return users.map { user -> 
        UserLoanHistoryResponse(
            name = user.name,
            books = user.userLoanHistories.map { history ->
                BookHistoryResponse(
                    name = history.bookName,
                    isReturn = history.status == UserLoanStatus.RETURNED
                )
            }
        )
    }
}
```
<br/>

#### JPA 연관관계 동작 원리

```
1. 최초 사용자 정보 로딩시 가짜 List<UserLoanHistory>가 들어간다.
 - 시작부터 모든 히스토리 정보를 조회하는 것은 비효율적일 수도 있다.
2. 실제 히스토리에 접근할 때 진짜 UserLoanHistory를 불러온다.
 - Lazy Fetching 전략
```
<br/>

### N + 1 문제를 해결하는 방법: FETCH JOIN

사용자 정보와 사용자의 도서 대출 정보를 각각 조회하는 것이 아니라, 사용자 정보와 도서 대출 정보를 한 번에 조회한다.  

<br/>

 - `UserRepository`
    - @Query 어노테이션을 이용하여 JPQL로 쿼리를 직접 만들어준다.
    - 대출 기록이 없는 사용자 정보도 조회해야되기 때문에 LEFT JOIN을 사용한다.
    - LEFT JOIN시 유저 정보가 여러 개가 조회된다. 중복을 제거하기 위해 DISTINCT 키워드를 명시한다.
    - N + 1 문제를 해결하기 위해 JOIN 시 FETCH 키워드를 명시한다.
```kotlin
interface UserRepository: JpaRepository<User, Long> {
    fun findByName(name: String): User?

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.userLoanHistories")
    fun findAllWithHistories(): List<User>
}
```
<br/>

 - `UserService`
```kotlin
@Transactional(readOnly = true)
fun getUserLoanHistories(): List<UserLoanHistoryResponse> {
    val users = userRepository.findAllWithHistories()
    return users.map { user -> 
        UserLoanHistoryResponse(
            name = user.name,
            books = user.userLoanHistories.map { history ->
                BookHistoryResponse(
                    name = history.bookName,
                    isReturn = history.status == UserLoanStatus.RETURNED
                )
            }
        )
    }
}
```
<br/>

### 조금 더 깔끔한 코드로 변경하기

getUserLoanHistories() 메서드에서 UserLoanHistoryResponse 객체를 만들기 위해 필드를 하나씩 정의해주고 있다.  
해당 부분을 DTO에 정적 팩토리 메서드를 만들어서 리팩토링해준다.  

<br/>

 - `UserLoanHistory`
    - 엔티티의 상태 체크를 Service 영역에서 하지 않고, 해당 도메인내에 편의 메서드로 만든다.
```kotlin
@Entity
class UserLoanHistory(
    // ..
) {
    // ..

    val isReturn: Boolean
        get() == this.status == UserLoanStatus.RETURNED
}
```
<br/>

 - `UserHistoryResponse`
```kotlin
data class UserLoanHistoryResponse(
    val name: String, // 사용자 이름
    val books: List<BookHistoryResponse>
) {
    companion object {
        fun of(user: User): UserLoanHistoryResponse {
            return UserLoanHistoryResponse(
                name = user.name,
                books = user.userLoanHistories.map(BookHistoryResponse::of)
            )
        }
    }
}

data class BookHistoryResponse(
    val name: String, // 책의 이름
    val isReturn: Boolean,
) {
    companion object {
        fun of(history: UserLoanHistory): BookHistoryResponse {
            return BookHistoryResponse(
                name = history.bookName,
                //isReturn = history.status == UserLoanStatus.RETURNED,
                isReturn = history.isReturn
            )
        }
    }
}
```
<br/>

 - `UserService`
```kotlin
@Transactional(readOnly = true)
fun getUserLoanHistories(): List<UserLoanHistoryResponse> {
    val users = userRepository.findAllWithHistories()

    return userRepository.findAllWithHistories().map(UserLoanHistoryResponse::of)
    /*
    return users.map { user -> 
        UserLoanHistoryResponse(
            name = user.name,
            books = user.userLoanHistories.map(BookHistoryResponse::of)
        )
    }
    */
}
```

