# JPA를 이용한 CRUD

```java
@RequiredArgsConstructor
@Service
public class BlogService {

    private final BlogRepository blogRepository;

    // Create
    public Article save(AddArticleRequest request, String userName) {
        return blogRepository.save(request.toEntity(userName));
    }

    // Read(여러건)
    public List<Article> findAll() {
        return blogRepository.findAll();
    }

    // Read(단건)
    public Article findById(long id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));
    }

    // Delete
    public void delete(long id) {
        Article article = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));

        authorizeArticleAuthor(article);
        blogRepository.delete(article);
    }

    // Update
    @Transactional
    public Article update(long id, UpdateArticleRequest request) {
        Article article = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));

        authorizeArticleAuthor(article);
        article.update(request.getTitle(), request.getContent());

        return article;
    }

    // 게시글을 작성한 유저인지 확인
    private static void authorizeArticleAuthor(Article article) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!article.getAuthor().equals(userName)) {
            throw new IllegalArgumentException("not authorized");
        }
    }

}
```

## 1. Create(생성)

### 기본 프로세스

 - 등록 요청 Dto를 Entity로 변환한다.
 - 변환된 Entity를 DB에 등록한다.

<br/>

### 예제 코드

```java
@RequiredArgsConstructor
@Service
public class BlogService {

    // ..

    public Article save(AddArticleRequest request, String userName) {
        return blogRepository.save(request.toEntity(userName));
    }

}
```

<br/>

## 2. Read(조회)

### 기본 프로세스

 - 전체 조회시
    - findAll() 메서드 수행
 - 특정 대상 조회시(단건)
    - findById() 메서드 수행
    - orElseThrow() 메서드로 대상이 없는 경우 예외 발생

<br/>

### 예제 코드

```java
@RequiredArgsConstructor
@Service
public class BlogService {

    // ..

    public List<Article> findAll() {
        return blogRepository.findAll();
    }

    public Article findById(long id) {
        return blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));
    }

}
```

## 3. Update(수정)

### 기본 프로세스

 - id를 통해 Entity를 조회한다.
 - 필요한 경우 조회한 Entity와 현재 유저를 검증한다. (권한 체크)
 - 조회한 Entity 내부에서 수정 메서드를 호출한다. 이때, 매개변수로 요청 Dto를 주입받는다.

<br/>

### Setter 메서드 사용하지 않기

 - `Setter를 이용한 업데이트`
    - 아래 코드는 회원 정보의 성, 이름, 주소를 변경하는 코드로 여러 setter 메소드들이 나열돼있습니다.
    - 아래 setter들은 회원 정보를 변경하기 위한 나열이라서 메소드들의 의도가 명확히 드러나지 않습니다.
```java
public Account updateMyAccount(long id, AccountDto.MyAccountReq dto) {
    final Account account = findById(id);
    account.setAddress("value");
    account.setFistName("value");
    account.setLastName("value");
    return account;
}
```

<br/>

 - `updateMyAccount 메서드를 이용한 업데이트`
    - Account 도메인 클래스에 updateMyAccount 메소드를 통해서 회원정보업데이트를 진행하였습니다.
    - 요청 클래스를 나누어 회원 정보 수정에 필요한 값인 변경될 값에 대한 명확한 명세가 될 수 있습니다.
```java
public Account updateMyAccount(long id, AccountDto.MyAccountModifyRequest request) {
    final Account account = findById(id);
    account.updateMyAccount(request);
    return account;
}

/* Dto 클래스 */
public class AccountDto {

    // ..

    public void updateMyAccount(AccountDto.MyAccountReq dto) {
        this.address = dto.getAddress();
        this.fistName = dto.getFistName();
        this.lastName = dto.getLastName();
    }

    // 내 정보 수정 요청 Dto
    public static class MyAccountModifyRequest {
        private Address address;
        private String firstName;
        private String lastName;
    }
}
```

<br/>

### 예제 코드

```java
@RequiredArgsConstructor
@Service
public class BlogService {

    // ..

    @Transactional
    public Article update(long id, UpdateArticleRequest request) {
        Article article = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));

        authorizeArticleAuthor(article);
        article.update(request.getTitle(), request.getContent());

        return article;
    }

    // 게시글을 작성한 유저인지 확인
    private static void authorizeArticleAuthor(Article article) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!article.getAuthor().equals(userName)) {
            throw new IllegalArgumentException("not authorized");
        }
    }

}
```

## 4. Delete(삭제)

### 기본 프로세스

 - id를 통해 Entity를 조회한다.
 - 필요한 경우 조회한 Entity와 현재 유저를 검증한다. (권한 체크)
 - Repository로 조회한 Entity를 삭제한다. (delete 메서드 수행)

```java
@RequiredArgsConstructor
@Service
public class BlogService {

    // ..

    public void delete(long id) {
        Article article = blogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("not found : " + id));

        authorizeArticleAuthor(article);
        blogRepository.delete(article);
    }

    // 게시글을 작성한 유저인지 확인
    private static void authorizeArticleAuthor(Article article) {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!article.getAuthor().equals(userName)) {
            throw new IllegalArgumentException("not authorized");
        }
    }
    
}
```

