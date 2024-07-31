# Spring RestDocs

Spring REST Docs는 Spring 애플리케이션에서 RESTful 웹 서비스의 API 문서를 자동으로 생성하는 도구입니다. 이는 API 문서화를 쉽게하고, 실제 코드와 문서 간의 일관성을 유지하는 데 도움을 줍니다. Spring REST Docs는 다양한 테스트 프레임워크와 함께 사용할 수 있으며, 주로 Spring MVC Test 또는 WebTestClient와 함께 사용됩니다.  
 - 자동화된 문서화: API 문서를 코드에서 작성된 테스트를 기반으로 자동으로 생성합니다. 이를 통해 API 문서와 실제 구현 간의 불일치를 줄일 수 있습니다.
 - 테스트 통합: Spring MVC Test 또는 WebTestClient를 사용하여 작성된 테스트에서 API 문서를 생성합니다. 테스트가 성공적으로 실행될 때만 문서가 생성되므로, 항상 최신 상태를 유지할 수 있습니다.
 - 유연한 구성: 템플릿을 사용하여 생성된 문서의 형식을 쉽게 커스터마이징할 수 있습니다. AsciiDoc, Markdown 등 다양한 형식을 지원합니다.
 - 사용자 정의 가능: 커스터마이징 가능한 스니펫을 사용하여 문서의 각 부분을 세밀하게 제어할 수 있습니다. 요청/응답 본문, 헤더, 상태 코드, 필드 등 다양한 정보를 문서화할 수 있습니다.

<br/>

## Spring RestDocs 관련 인터페이스

 - `PayloadDocumentation`
    - PayloadDocumentation는 Spring REST Docs에서 요청(request)과 응답(response)의 본문(payload)을 문서화하는 데 사용되는 클래스입니다.
    - 요청 및 응답 본문의 필드 문서화: API의 요청 및 응답 본문에 포함된 각 필드를 설명하고, 이를 문서화합니다.
    - 문서화 스니펫 생성: 요청 및 응답 본문의 구조를 설명하는 스니펫(snippet)을 생성합니다.
    - pathParameters(): 요청 URL의 경로 변수 문서화
    - requestParameters(): 요청 URL 쿼리 파라미터 문서화
    - requestFields(): 요청 본문 필드 문서화
    - responseFields(): 응답 본문 필드 문서화
    - fieldWithPath(): JSON 또는 XML 구조에서 특정 필드를 설명하는 데 사용
```java
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

        // When, Then
        mockMvc.perform(
                        post("/api/v1/products/new")
                                .content(objectMapper.writeValueAsString(request))
                                .contentType(MediaType.APPLICATION_JSON)
                )
                .andDo(print())
                .andExpect(status().isOk())
                .andDo(document("product-create",
                        // Snippet
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestFields(
                                fieldWithPath("type").type(JsonFieldType.STRING)
                                        .description("상품 타입"),
                                fieldWithPath("sellingStatus").type(JsonFieldType.STRING)
                                        .optional()
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

    @Test
    void getUserById() throws Exception {
        this.mockMvc.perform(get("/users/{id}", 1)
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andDo(document("get-user",
                preprocessRequest(prettyPrint()),
                preprocessResponse(prettyPrint()),
                pathParameters(
                    parameterWithName("id").description("ID of the user to retrieve")),
                responseFields(
                    fieldWithPath("id").description("ID of the user"),
                    fieldWithPath("name").description("Name of the user"),
                    fieldWithPath("age").description("Age of the user"))));
    }

    @Test
    void getUsersByAge() throws Exception {
        mockMvc.perform(get("/users")
                .param("age", "30")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andDo(document("get-users-by-age",
                preprocessRequest(prettyPrint()),
                preprocessResponse(prettyPrint()),
                requestParameters(
                    parameterWithName("age").description("Age of the users to retrieve")),
                responseFields(
                    fieldWithPath("[].id").description("ID of the user"),
                    fieldWithPath("[].name").description("Name of the user"),
                    fieldWithPath("[].age").description("Age of the user"))));
    }
```
<br/>

## Spring RestDocs 설정

```groovy
// AsciiDoc 형식의 문서를 HTML 변환 플러그인 추가
plugins {
    id 'org.asciidoctor.jvm.convert' version '3.3.2'
}

// Asciidoctor 관련 의존성 관리
configurations {
    compileOnly {
        extendsFrom annotationProcessor
    }
    asciidoctorExt
}

// 전역 변수 설정
ext {
    set('snippetsDir', file("build/generated-snippets"))
}

dependencies {
    // Spring REST Docs 의존성 추가
    testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
    asciidoctorExt 'org.springframework.restdocs:spring-restdocs-asciidoctor'

}

tasks.named('test') {
    outputs.dir snippetsDir
    useJUnitPlatform()
}

tasks.register("restDocsTest", Test) {
    outputs.dir snippetsDir
    useJUnitPlatform {
        includeTags("restDocs")
    }

    finalizedBy "asciidoctor"
}

// restDocsTest 수행 후 실행되는 태스크
tasks.named("asciidoctor") {
    dependsOn restDocsTest

    inputs.dir snippetsDir
    configurations "asciidoctorExt"
    baseDirFollowsSourceDir()
}

// HTML 파일들을 프로젝트 정적 리소스 폴더로 이동
tasks.register('copyAsciidocHTML', Copy) {
    dependsOn asciidoctor
    from "${asciidoctor.outputDir}"
    into "${project.rootDir}/src/main/resources/static/docs"
}
```
