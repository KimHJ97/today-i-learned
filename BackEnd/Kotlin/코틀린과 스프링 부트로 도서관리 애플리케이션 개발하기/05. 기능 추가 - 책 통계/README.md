# 세 번째 요구사항 추가하기 - 책 통계

 - SQL의 다양한 기능들(sum, avg, count, group by, order by)을 이해한다.
 - 간결한 함수형 프로그래밍 기법을 사용해보고 익숙해진다.
 - 동일한 기능을 애플리케이션과 DB로 구현해보고, 차이점을 이해한다.

<br/>

## 1. 책 통계 보여주기 - 프로덕션 코드 개발

### 요구사항 확인

 - `책 통계 화면`
    - 현재 대여 중인 책 몇 권인지 보여준다.
    - 분야별로 도서관에 등록되어 있는 책이 각각 몇 권인지 보여준다.
 - `대여 중인 책 갯수 조회 API`
    - URL: /book/loan
    - HTTP Method: GET
    - 요청 파라미터: 없음
 - `분야별로 등록되어 있는 책 갯수 조회`
    - URL: /book/stat
    - HTTP Method: GET
    - 요청 파라미터: 없음

<br/>

### 책 통계 코드

 - `BookStatResponse`
```kotlin
data class BookStatResponse(
    val type: BookType,
    var count: Int,
) {
    fun plusOne() {
        count++
    }
}
```
<br/>


 - `BookController`
```kotlin
@RestController
class BookController(
    private val bookService: BookService,
) {

    // ..

    @GetMapping("/book/loan")
    fun countLoanedBook(): Int {
        return bookService.countLoanedBook()
    }

    @GetMapping("/book/stat")
    fun getBookStatistics(): List<BookStatResponse> {
        return bookService.getBookStatistics()
    }
}
```
<br/>

 - `BookService`
```kotlin
@Transactional(readOnly = true)
fun countLoanedBook(): Int {
    return userLoanHistoryRepository.findByStatus(UserLoanStatus.LOANED).size
}

@Transactional(readOnly = true)
fun getBookStatistics(): List<BookStatResponse> {
    val results = mutableListOf<BookStatResponse>()

    // 1. 모든 책 정보를 조회
    val books = bookRepository.findAll()

    // 2. 책을 순회
    for (book in books) {
        // results안에 해당 타입의 책이 존재하는지 확인
        val targetDto = results.firstOrNull { dto -> book.type == dto.type }
        if (targetDto == null) {
            // 타입이 없다면 추가
            results.add(BookStatResponse(book.type, 1))
        } else {
            // 타입이 있다면 +1
            targetDto.plusOne()
        }
    }
    return results
}

@Transactional(readOnly = true)
fun getBookStatistics2(): List<BookStatResponse> {
    val results = mutableListOf<BookStatResponse>()

    // 1. 모든 책 정보를 조회
    val books = bookRepository.findAll()

    // 2. 책을 순회
    for (book in books) {
        // results안에 해당 타입의 책이 존재하는지 확인
        val targetDto = results.firstOrNull { dto -> book.type == dto.type }?.plusOne()
            ?: results.add(BookStatResponse(book.type, 1))
    }
    return results
}

```
<br/>

 - `UserLoanHistoryRepository`
```kotlin
interface UserLoanHistoryRepository : JpaRepository<UserLoanHistory, Long> {
    fun findByBookNameAndStatus(bookName: String, status: UserLoanStatus): UserLoanHistory?

    fun findAllByStatus(status: UserLoanStatus): List<UserLoanHistory>
}
```
<br/>

## 2. 테스트 코드 개발과 리팩토링

 - `BookServiceTest.kt`
```kotlin
@Test
@DisplayName("책 대여 권수를 정상 확인한다")
fun countLoanedBookTest() {
    // given
    val savedUser = userRepository.save(User("로그", null))
    userLoanHistoryRepository.saveAll(
        listOf(
            UserLoanHistory.fixture(savedUser, "A"),
            UserLoanHistory.fixture(savedUser, "B", UserLoanStatus.RETURNED),
            UserLoanHistory.fixture(savedUser, "C", UserLoanStatus.RETURNED),
        )
    )

    // when
    val result = bookService.countLoanedBook()

    // then
    assertThat(result).isEqualTo(1)
}

@Test
@DisplayName("분야별 책 권수를 정상 확인한다")
fun getBookStatisticsTest() {
    // given
    bookRepository.saveAll(
        listOf(
            Book.fixture("A", BookType.COMPUTER),
            Book.fixture("B", BookType.COMPUTER),
            Book.fixture("C", BookType.SCIENCE),
        )
    )

    // when
    val results = bookService.getBookStatistics()

    // then
    assertThat(results).hasSize(2)
    assertCount(results, BookType.COMPUTER, 2)
    //val computerDto = results.first { result -> result.type == BookType.COMPUTER }
    //assertThat(computerDto.count).isEqualTo(2)

    assertCount(results, BookType.SCIENCE, 1)
    //val scienceDto = results.first { result -> result.type == BookType.SCIENCE }
    //assertThat(scienceDto.count).isEqualTo(1)
}

private fun assertCount(results: List<BookStatResponse>, type: BookType, count: Int) {
    assertThat(results.first { result -> result.type == type}.count).isEqualTo(count)
}
```
<br/>

### 리팩토링

 - `BookService.kt`
```kotlin
@Transactional(readOnly = true)
fun getBookStatistics(): List<BookStatResponse> {
    return bookRepository.findAll()     // List<Book>
        .groupBy { book -> book.type }  // Map<BookType, List<Book>>
        .map { (type, books) -> BookStatResponse(type, books.size) } // List<BookStatResponse>
}
```
<br/>

## 3. 애플리케이션 대신 DB로 기능 구현하기

```sql
-- 책 분야별로 갯수
SELECT type, count(1)
FROM book
GROUP BY type;
```
<br/>

 - 대출 중인 책 갯수 통계
```kotlin
// 대출 중인 책의 갯수 조회
// findAll로 데이터를 조회하고, size로 갯수 반환
@Transactional(readOnly = true)
fun countLoanedBook(): Int {
    return userLoanHistoryRepository.findAllByStatus(UserLoanStatus.LOANED).size
}

// countBy~ 쿼리 메서드를 이용하여 COUNT 쿼리를 이용
interface UserLoanHistoryRepository: JpaRepository<UserLoanHistory, Long> {
    // ..

    fun countByStatus(status: UserLoanStatus): Long
}
```
<br/>

 - 분야별 통계
```kotlin
// findAll로 존재하는 모든 책을 조회하고,
// groupBy로 타입 별로 그루핑하고,
// map 으로 적절히 갯수를 반환한다.
@Transactional(readOnly = true)
fun getBookStatistics(): List<BookStatResponse> {
    return bookRepository.findAll()
        .groupBy { book -> book.type }
        .map { (type, books) -> BookStatResponse(type, books.size) }
}

interface BookRepository: JpaRepository<Book, Long> {

    @Query("SELECT NEW com.group.libraryapp.dto.book.response.BookStatResponse(b.type, COUNT(b.id)) FROM Book b GROUP BY b.type")
    fun getStatus(): List<BookStatResponse>
}
```

