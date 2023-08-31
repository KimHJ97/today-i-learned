# Appendix(부록)

## 학습 테스트

 - 잘 모르는 기능, 라이브러리, 프레임워크를 학습하기 위해 작성하는 테스트
 - 여러 테스트 케이스를 스스로 정의하고 검증하는 과정을 통해 보다 구체적인 동작과 기능을 학습할 수 있다.
 - 관련 문서만 읽는 것보다 훨씬 재미있게 학습할 수 있다.

<br/>

### Guava 학습 테스트 예제

Google Guava(구글 구아바)는 구글에서 개발한 오픈 소스 자바 라이브러리로, 자바 프로그래밍을 보다 편리하게 만들기 위해 다양한 유틸리티 클래스와 함수를 제공하는 라이브러리입니다. Guava는 자바 표준 라이브러리(java.util)에 있는 클래스들을 보완하고 확장하여 코드의 가독성, 효율성, 유지보수성을 향상시키기 위해 만들어졌습니다.  
 - https://github.com/google/guava
 - 컬렉션 유틸리티: 더 풍부하고 강력한 컬렉션 유틸리티 클래스를 제공하여 컬렉션 데이터를 다루는 작업을 보다 쉽게 처리할 수 있게 합니다.
 - 함수형 프로그래밍: 함수형 프로그래밍 스타일을 지원하는 함수와 연산자들을 포함하여 코드를 더 간결하게 작성할 수 있게 합니다.
 - 문자열 유틸리티: 문자열 처리와 관련된 다양한 유틸리티 메서드를 제공하여 문자열 다루기를 편리하게 합니다.
 - 기타 유틸리티 클래스: 자주 사용되는 구조체, 술어 함수, 날짜 및 시간 유틸리티 등을 포함하여 다양한 유틸리티 클래스를 제공합니다.
 - 이벤트 버스: 이벤트 기반 프로그래밍을 지원하는 이벤트 버스 구현을 포함하여 컴포넌트 간의 통신을 용이하게 합니다.
 - 캐싱: 메모리 캐시를 지원하는 클래스를 제공하여 빠른 데이터 접근을 위한 캐싱 기능을 제공합니다.
 - 함수형 기능: 함수, Predicate, Supplier 등 함수형 프로그래밍에 필요한 다양한 함수 인터페이스를 제공합니다.

<br/>

#### 테스트 코드

 - build.gradle
```
dependencies {
    ..

    // Guava
    implementation 'com.google.guava:guava:32.1.1-jre'
}
```

 - GuavaLearningTest
    - 실제로 Guava에서 제공하는 문서를 통해 기능을 확인할 수 있지만, 직접 능동적으로 테스트 케이스를 생각해보면서 검증하면서 학습할 수 있다.
```Java
class GuavaLearningTest {

    @DisplayName("주어진 개수만큼 List를 파티셔닝한다.")
    @Test
    void partitionLearningTest1() {
        // Given
        List<Integer> integers = List.of(1, 2, 3, 4, 5, 6);

        // When
        List<List<Integer>> partition = Lists.partition(integers, 3);

        // Then
        assertThat(partition).hasSize(2)
                .isEqualTo(List.of(
                        List.of(1, 2, 3),
                        List.of(4, 5, 6)
                ));
    }

    @DisplayName("주어진 개수만큼 List를 파티셔닝한다.")
    @Test
    void partitionLearningTest2() {
        // Given
        List<Integer> integers = List.of(1, 2, 3, 4, 5, 6);

        // When
        List<List<Integer>> partition = Lists.partition(integers, 4);

        // Then
        assertThat(partition).hasSize(2)
                .isEqualTo(List.of(
                        List.of(1, 2, 3, 4),
                        List.of(5, 6)
                ));
    }

    @DisplayName("멀티맵 기능 확인")
    @Test
    void multiMapLearningTest() {
        // Given
        Multimap<String, String> multimap = ArrayListMultimap.create();
        multimap.put("커피", "아메리카노");
        multimap.put("커피", "카페라떼");
        multimap.put("커피", "카푸치노");
        multimap.put("베이커리", "크루아상");
        multimap.put("베이커리", "식빵");

        // When
        Collection<String> strings = multimap.get("커피");

        // Then
        assertThat(strings).hasSize(3)
                .isEqualTo(List.of("아메리카노", "카페라떼", "카푸치노"));
    }

    @DisplayName("멀티맵 기능 확인")
    @TestFactory
    Collection<DynamicTest> multiMapLearningTest2() {
        // Given
        Multimap<String, String> multimap = ArrayListMultimap.create();
        multimap.put("커피", "아메리카노");
        multimap.put("커피", "카페라떼");
        multimap.put("커피", "카푸치노");
        multimap.put("베이커리", "크루아상");
        multimap.put("베이커리", "식빵");

        return List.of(
                DynamicTest.dynamicTest("1개 value 삭제", () -> {
                    // When
                    multimap.remove("커피", "카푸치노");

                    // Then
                    Collection<String> results = multimap.get("커피");
                    assertThat(results).hasSize(2)
                            .isEqualTo(List.of("아메리카노", "카페라떼"));
                }),
                DynamicTest.dynamicTest("1개 key 삭제", () -> {
                    // When
                    multimap.removeAll("커피");

                    // Then
                    Collection<String> results = multimap.get("커피");
                    assertThat(results).isEmpty();
                })
        );
    }
}
```

<br/>

## Spring REST Docs

Spring REST Docs는 Spring Framework 기반의 웹 애플리케이션에서 API 문서를 생성하고 관리하기 위한 도구입니다.  
주로 RESTful API를 문서화하고 API 사용자들에게 정확하고 명확한 문서를 제공하는 데 사용됩니다.  
Spring REST Docs는 API 엔드포인트, 요청 및 응답의 예제, 설명 등을 기반으로 문서를 생성하며, 이를 통해 개발자와 API 소비자 간의 의사소통을 원활하게 만들어줍니다.  
 - 테스트 코드를 통한 API 문서 자동화 도구
 - API 명세를 문서로 만들고 외부에 제공함으로써 협업을 원활하게 한다.
 - 기본적으로 AsciiDoc을 사용하여 문서를 작성한다.
```
1. 테스트 기반 문서 생성
Spring REST Docs는 테스트 코드를 작성하면서 API의 동작을 검증하고 그 결과를 문서화합니다. 이를 통해 코드와 문서가 일치하며 항상 최신 상태를 유지할 수 있습니다.

2. Asciidoctor를 사용한 문서 형식
Spring REST Docs는 Asciidoctor와 같은 마크업 언어를 사용하여 문서를 작성하며, 이를 통해 문서의 스타일 및 형식을 정의할 수 있습니다.

3. 요청 및 응답의 예제 생성
테스트를 통해 얻은 API 호출의 요청과 응답을 기반으로 문서에 예제를 자동으로 생성합니다. 이로써 API 사용자들이 각각의 엔드포인트가 어떻게 동작하는지를 더 쉽게 이해할 수 있습니다.

4. Curl 및 HTTPie 명령어 생성
Spring REST Docs는 API 사용자들이 문서에서 바로 복사하여 사용할 수 있는 Curl 또는 HTTPie 형식의 명령어 예제도 생성합니다.

5. 템플릿과 확장 가능성
Spring REST Docs는 커스텀 템플릿을 사용하여 문서의 스타일을 조정하거나 확장할 수 있는 기능을 제공합니다.

6. Swagger와 통합
Spring REST Docs와 Swagger를 함께 사용하여 API 문서 생성 및 관리의 유연성을 높일 수 있습니다.
```

<br/>

### REST Docs VS Swagger

 - REST Docs
    - 장점
        - 테스트를 통과해야 문서가 만들어진다. (신뢰도가 높다.)
        - 프로덕션 코드에 비침투적이다.
    - 단점
        - 코드 양이 많다.
        - 설정이 어렵다.
 - Swagger
    - 장점
        - 적용이 쉽다.
        - 문서에서 바로 API 호출을 수행해볼 수 있다.
    - 단점
        - 프로덕션 코드에 침투적이다.
        - 테스트와 무관하기 때문에 신뢰도가 떨어질 수 있다.

<br/>

### REST Docs 적용하기

Spring REST Docs: https://docs.spring.io/spring-restdocs/docs/current/reference/htmlsingle/  
Asciidoc: https://asciidoctor.org/  
Swagger: https://swagger.io/  


 - build.gradle
    - Asciidoc 플러그인과 RestDocs 의존성을 추가한다.
    - plugins
        - org.asciidoctor.jvm.convert: Asciidoctor는 Asciidoc이라는 마크업 언어를 HTML, PDF 등의 다양한 형식으로 변환해주는 도구로 Spring REST Docs는 Asciidoc을 사용하여 API 문서를 작성하고 변환하기 때문에, 이 플러그인을 추가하여 Asciidoctor를 프로젝트에서 사용할 수 있도록 설정합니다.
    - configurations
        - asciidoctorExt: Asciidoctor에서 사용하는 확장 모듈에 관련된 설정을 정의합니다. Spring REST Docs에서는 Asciidoctor 확장을 사용하여 문서 생성 시 필요한 스타일이나 기능을 추가하거나 변경할 수 있습니다.
    - ext
        - 전역 변수를 정의하는 곳으로, snippetsDir 이라는 변수를 정의하고 초기값으로 'build/generated-snippets' 디렉토리를 지정합니다. snippetsDir은 Spring REST Docs 테스트 실행 중에 생성된 스니펫 파일들이 저장되는 디렉토리입니다.
    - test
        - test 블록은 테스트 관련 설정을 지정하는 부분으로 테스트 실행 결과로 생성된 스니펫 파일들이 snippetsDir 디렉토리에 저장되도록 설정합니다.
    - asciidoctor
        - asciidoctor 블록은 Asciidoctor 관련 설정을 지정하는 부분입니다.
        - inputs.dir snippetsDir: Asciidoctor에게 스니펫 파일들이 있는 디렉토리를 입력으로 사용하도록 지정합니다.
        - configurations 'asciidoctorExt': Asciidoctor 확장 설정을 적용하도록 지정합니다.
        - sources: 변환할 Asciidoc 소스 파일을 지정합니다. 여기서는 '**/index.adoc'라는 패턴에 맞는 파일만 변환합니다.
        - baseDirFollowsSourceFile(): 다른 Asciidoc 파일을 포함할 때 경로를 소스 파일을 기준으로 맞추도록 설정합니다.
        - dependsOn test:  Asciidoctor 작업이 테스트 작업에 의존한다는 것을 나타냅니다. 즉, 테스트 실행 이후에 문서 생성이 진행됩니다.
    - bootJar
        -  Spring Boot JAR 파일 빌드와 관련된 설정을 지정하는 부분입니다.
        - dependsOn asciidoctor: Spring Boot JAR 빌드가 Asciidoctor 작업에 의존함을 나타냅니다. 즉, 문서 생성 이후에 JAR 빌드가 실행됩니다.
        - from("${asciidoctor.outputDir}"): Asciidoctor 작업의 결과물이 위치한 디렉토리를 지정합니다.
        - into 'static/docs': JAR 파일 내에서 문서를 저장할 경로를 지정합니다. 이 경우 문서가 static/docs 경로에 포함되게 됩니다.
    - REST Docs를 만들기 위한 테스트를 작성하고, 테스트에 대한 결과물로 나오는 문서 파일들은 snippetsDir 디렉토리 경로로 생성이 된다. 이후 test가 수행된 다음 asciidoctor가 수행되는데, snippetsDir 디렉토리의 결과물 파일들을 받아서 API 문서를 만든다. 만들어진 문서는 정적 파일로 확인할 수 있도록 소스 코드내에 static/docs 경로로 복사된다. (test -> asciidoctor -> bootJar)
```Gradle
// 1. 플러그인 추가
plugins {
    ..
    id "org.asciidoctor.jvm.convert" version "3.3.2"
}

// 2. 설정 추가
configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
    asciidoctorExt
}

// 3. 의존성 추가
dependencies {
    ..

    // RestDocs
    asciidoctorExt 'org.springframework.restdocs:spring-restdocs-asciidoctor'
    testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
}

..

// 4. Task 추가
ext { // 전역 변수
    snippetsDir = file('build/generated-snippets')
}

test {
    outputs.dir snippetsDir
}

asciidoctor {
    inputs.dir snippetsDir
    configurations 'asciidoctorExt'

    sources { // 특정 파일만 html로 만든다.
        include("**/index.adoc")
    }
    baseDirFollowsSourceFile() // 다른 adoc 파일을 include 할 때 경로를 baseDir로 맞춘다.
    dependsOn test
}

bootJar {
    dependsOn asciidoctor
    from("${asciidoctor.outputDir}") {
        into 'static/docs'
    }
}
```

 - RestDocsSupport
    - RestDoc을 작성하기 위한 MockMvc를 설정해주어야 한다.
    - standaloneSetup()과 webAppContextSetup()이 제공된다.
```Java
// 1. webAppContextSetup() 사용
// @SpringBootTest로 RestDoc을 작성하는 것과 같다. 즉, 문서를 생성할 떄도 스프링 서버를 띄워지게 된다.
@SpringBootTest
@ExtendWith(RestDocumentationExtension.class)
public abstract class RestDocsSupport {

    protected MockMvc mockMvc;

    @BeforeEach
    void setUp(
            WebApplicationContext webApplicationContext,
            RestDocumentationContextProvider provider) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(documentationConfiguration(provider))
                .build();
    }
}

// 2. standaloneSetup() 사용
@ExtendWith(RestDocumentationExtension.class)
public abstract class RestDocsSupport {

    protected MockMvc mockMvc;
    protected ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp(RestDocumentationContextProvider provider) {
        this.mockMvc = MockMvcBuilders.standaloneSetup(initController())
            .apply(documentationConfiguration(provider))
            .build();
    }

    // 하위 클래스에서 문서로 만들고 싶은 컨트롤러를 주입하기 위한 메서드
    protected abstract Object initController();

}
```

 - ProductControllerDocsTest
    - Spring에 관한 의존없이 단순 Java를 통한 코드를 작성한다. 때문에, 객체를 직접 생성해주고, Controller 생성시 필요한 객체들은 모의 객체(Mock)로 지정한다.
    - mockMvc.perform() 수행 후 andExpect() 검증 하는 부분까지는 다른 ControllerTest 내용과 동일하고, 이후에 andDo() 안에 생성될 REST Docs의 내용을 정의한다.
    - document("Doc의 이름", Snippet)
        - pathParameters(): 요청 PathParameter Snippet 정의
        - requestParameters(): 요청 쿼리 파라미터 Snippet 정의
        - requestFields(): 요청 Body Snippet 정의
        - responseFields(): 응답 Body Snippet 정의
```Java
public class ProductControllerDocsTest extends RestDocsSupport {

    private final ProductService productService = mock(ProductService.class);

    @Override
    protected Object initController() {
        return new ProductController(productService);
    }

    @DisplayName("신규 상품을 등록하는 API")
    @Test
    void createProduct() throws Exception {
        // Given
        ProductCreateRequest request = ProductCreateRequest.builder()
                .type(HANDMADE)
                .sellingStatus(SELLING)
                .name("아메리카노")
                .price(4000)
                .build();

        given(productService.createProduct(any(ProductCreateServiceRequest.class)))
                .willReturn(
                        ProductResponse.builder()
                                .id(1L)
                                .productNumber("001")
                                .type(HANDMADE)
                                .sellingStatus(SELLING)
                                .name("아메리카노")
                                .price(4000)
                                .build()
                );

        // When // Then
        mockMvc.perform(
                        post("/api/v1/products/new")
                                .content(objectMapper.writeValueAsString(request))
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isOk())
                .andDo(document("product-create",
                        // Snippet
                        requestFields(
                                fieldWithPath("type").type(JsonFieldType.STRING)
                                        .description("상품 타입"),
                                fieldWithPath("sellingStatus").type(JsonFieldType.STRING)
                                        .description("상품 판매상태"),
                                fieldWithPath("name").type(JsonFieldType.STRING)
                                        .description("상품 이름"),
                                fieldWithPath("price").type(JsonFieldType.NUMBER)
                                        .description("상품 가격")

                        ),
                        responseFields(
                                fieldWithPath("code").type(JsonFieldType.NUMBER)
                                        .description("코드"),
                                fieldWithPath("status").type(JsonFieldType.STRING)
                                        .description("상태"),
                                fieldWithPath("message").type(JsonFieldType.STRING)
                                        .description("메시지"),
                                fieldWithPath("data").type(JsonFieldType.OBJECT)
                                        .description("응답 데이터"),
                                fieldWithPath("data.id").type(JsonFieldType.NUMBER)
                                        .description("상품 ID"),
                                fieldWithPath("data.productNumber").type(JsonFieldType.STRING)
                                        .description("상품 번호"),
                                fieldWithPath("data.type").type(JsonFieldType.STRING)
                                        .description("상품 타입"),
                                fieldWithPath("data.sellingStatus").type(JsonFieldType.STRING)
                                        .description("상품 판매상태"),
                                fieldWithPath("data.name").type(JsonFieldType.STRING)
                                        .description("상품 이름"),
                                fieldWithPath("data.price").type(JsonFieldType.NUMBER)
                                        .description("상품 가격")
                        )
                ));
    }
}
```

<br/>

#### REST Docs 작업하기

REST Docs를 만들기 위한 테스트 코드를 작성하고, 해당 테스트를 실행하면 해당 결과에 대한 AsciiDoc 파일을 'build/generated-snippets/Doc의 이름' 디렉토리에 생성해준다.  

 - documentation의 asciidoctor Task 수행 흐름
```Bash
> Task :compileJava UP-TO-DATE
> Task :processResources UP-TO-DATE
> Task :classes UP-TO-DATE
> Task :compileTestJava
> Task :processTestResources NO-SOURCE
> Task :testClasses
> Task :test
> Task :asciidoctor NO-SOURCE
```

<br/>

만들어진 코드 조각(adoc)들을 합쳐서 하나의 문서를 만든다.  
'src' 디렉토리 하위에 'src/docs/asciidoc' 디렉토리를 만든다.  

 - index.adoc ('src/docs/asciidoc/index.adoc')
```adoc
ifndef::snippets[]
:snippets: ../../build/generated-snippets
endif::[]
= CafeKiosk REST API 문서
:doctype: book
:icons: font
:source-highlighter: highlightjs
:toc: left
:toclevels: 2
:sectlinks:

[[Product-API]]
== Product API

include::api/product/product.adoc[]
```

 - product.adoc ('src/docs/asciidoc/api/product/product.adoc')
```adoc
[[product-create]]
=== 신규 상품 등록

==== HTTP Request
include::{snippets}/product-create/http-request.adoc[]
include::{snippets}/product-create/request-fields.adoc[]

==== HTTP Response
include::{snippets}/product-create/http-response.adoc[]
include::{snippets}/product-create/response-fields.adoc[]
```

<br/>

'src/docs/asciidoc' 디렉토리내에 API 문서에 대해 필요한 부분을 정의해주고, build를 한번 더 진행하면 'build/docs/asciidoc/' 디렉토리내에 정의한 AsciiDoc을 보여주는 HTML 문서가 생성된다.  



 - ProductControllerDocsTest
    - preprocessRequest(prettyPrint()), preprocessResponse(prettyPrint()): 프로세싱전에 룰을 추가, JSON을 좀더 보기 좋은 형태로 만들어준다.
```Java
public class ProductControllerDocsTest extends RestDocsSupport {
    ..

    @DisplayName("신규 상품을 등록하는 API")
    @Test
    void createProduct() throws Exception {
        ..

        // When // Then
        mockMvc.perform(
                        post("/api/v1/products/new")
                                .content(objectMapper.writeValueAsString(request))
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isOk())
                .andDo(document("product-create",
                        // Snippet
                        preprocessRequest(prettyPrint()), // 추가
                        preprocessResponse(prettyPrint()), // 추가
                        requestFields(
                            ..
                        ),
                        ..
                ));
    }
}
```

 - ProductControllerDocsTest
    - 필수값과 Optional한 값 정의하기
```Java
public class ProductControllerDocsTest extends RestDocsSupport {
    ..

    @DisplayName("신규 상품을 등록하는 API")
    @Test
    void createProduct() throws Exception {
        ..

        // When // Then
        mockMvc.perform(
                post("/api/v1/products/new")
                    .content(objectMapper.writeValueAsString(request))
                    .contentType(MediaType.APPLICATION_JSON)
            )
            .andDo(print())
            .andExpect(status().isOk())
            .andDo(document("product-create",
                preprocessRequest(prettyPrint()),
                preprocessResponse(prettyPrint()),
                requestFields(
                    fieldWithPath("type").type(JsonFieldType.STRING)
                        .description("상품 타입"),
                    fieldWithPath("sellingStatus").type(JsonFieldType.STRING)
                        .optional() // 추가
                        .description("상품 판매상태"),
                    fieldWithPath("name").type(JsonFieldType.STRING)
                        .description("상품 이름"),
                    fieldWithPath("price").type(JsonFieldType.NUMBER)
                        .description("상품 가격")
                ),
                ..
            ));
    }
}
```

 - request-fileds.snippet 템플릿
    - 'test/resources/org/springframework/templates/request-field.snippet'
```snippet
==== Request Fields
|===
|Path|Type|Optional|Description

{{#fields}}

|{{#tableCellContent}}`+{{path}}+`{{/tableCellContent}}
|{{#tableCellContent}}`+{{type}}+`{{/tableCellContent}}
|{{#tableCellContent}}{{#optional}}O{{/optional}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}

{{/fields}}

|===
```

 - response-fields.snippet 템플릿
    - 'test/resources/org/springframework/templates/response-field.snippet'
```snippet
==== Response Fields
|===
|Path|Type|Optional|Description

{{#fields}}

|{{#tableCellContent}}`+{{path}}+`{{/tableCellContent}}
|{{#tableCellContent}}`+{{type}}+`{{/tableCellContent}}
|{{#tableCellContent}}{{#optional}}O{{/optional}}{{/tableCellContent}}
|{{#tableCellContent}}{{description}}{{/tableCellContent}}

{{/fields}}

|===
```

