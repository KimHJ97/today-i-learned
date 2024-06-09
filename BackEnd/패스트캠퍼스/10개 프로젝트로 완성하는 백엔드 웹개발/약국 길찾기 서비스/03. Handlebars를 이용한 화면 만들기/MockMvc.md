# MockMvc

MockMvc는 Spring Framework에서 제공하는 테스트 도구로, 주로 Spring MVC 애플리케이션을 테스트하는 데 사용됩니다. MockMvc를 사용하면 실제 서블릿 컨테이너를 구동하지 않고도 Spring MVC 컨트롤러를 테스트할 수 있습니다. 이는 빠르고 효율적인 단위 테스트와 통합 테스트를 가능하게 합니다.  
 - __MockMvc의 주요 기능__
    - __HTTP 요청과 응답의 모킹__: 실제 서버를 띄우지 않고도 HTTP 요청을 보내고 응답을 받을 수 있습니다. 이를 통해 컨트롤러의 동작을 검증할 수 있습니다.
    - __Fluent API__: 직관적인 API를 통해 테스트 코드를 작성할 수 있습니다. 메서드 체이닝을 통해 코드의 가독성을 높이고, 테스트 시나리오를 쉽게 구성할 수 있습니다.
    - __검증 및 매칭__: 응답 상태 코드, 헤더, 본문 등의 검증을 간단히 할 수 있습니다. 또한 JSONPath나 XPath를 사용하여 응답 본문의 특정 부분을 검증할 수 있습니다.
 - __MockMvc 설정 방법__
    - __JUnit과의 통합__: 보통 JUnit과 함께 사용되며, @WebMvcTest 어노테이션을 사용하여 컨트롤러를 테스트합니다.
    - __테스트 구성 설정__: @WebMvcTest 어노테이션을 사용하면 필요한 빈만 로드하여 테스트 환경을 구성할 수 있습니다.
```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(MyController.class)
public class MyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetEndpoint() throws Exception {
        mockMvc.perform(get("/my-endpoint"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.key").value("value"));
    }
}
```
<br/>

## MockMvc 소개

MockMvc란 스프링 3.2부터 스프링 MVC를 모킹하여 웹 어플리케이션을 테스트하는 유용한 라이브러리이다. 이 기능으로 실제 서블릿 컨테이너에서 컨트롤러를 실행하지 않고도 컨트롤러에 HTTP 요청을 할 수 있다. 스프링 Mock MVC 프레임워크는 어플리케이션을 마치 서블릿 컨테이너에서 실행하는 것처럼 스프링 MVC를 흉내 내지만 실제 컨테이너에서 실행하지는 않는다.  

웹 환경에서 컨트롤러를 테스트하려면 서블릿 컨테이너가 구동되고 DispatcherServlet 객체가 메모리에 올라가야 한다. 이때 서블릿 컨테이너를 모킹하면 실제 서블릿 컨테이너가 아닌 테스트 모형 컨테이너를 사용해서 간단하게 컨트롤러를 테스트할 수 있다.  

<br/>

### MockMvcBuilders

MockMvcBuilders는 Spring Framework에서 제공하는 클래스 중 하나로, MockMvc 인스턴스를 생성하는 데 사용됩니다. 이 클래스는 다양한 설정 옵션과 빌더 패턴을 제공하여 MockMvc를 유연하게 구성할 수 있게 합니다. MockMvcBuilders를 통해 테스트 환경에 맞게 MockMvc를 설정하고, 컨트롤러를 쉽게 테스트할 수 있습니다.  

 - __standaloneSetup__
    - 독립 실행형 컨트롤러 설정을 통해 MockMvc를 구성합니다. 실제 스프링 컨텍스트를 사용하지 않고 특정 컨트롤러만 테스트할 때 유용합니다.
    - 테스트할 컨트롤러를 수동으로 주입하는 것이며, 한 컨트롤러에 집중하여 테스트하는 용도로만 사용한다는 점에서 유닛 테스트와 유사하다.
```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

public class MyControllerTest {
    
    @Test
    public void testStandaloneSetup() throws Exception {
        MyController controller = new MyController();
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get("/my-endpoint"))
               .andExpect(status().isOk());
    }
}
```
<br/>

 - __webAppContextSetup__
    - 실제 Spring 웹 애플리케이션 컨텍스트를 사용하여 MockMvc를 구성합니다. 이 방법은 전체 애플리케이션 컨텍스트를 로드하고 통합 테스트를 수행할 때 유용합니다.
    - webAppContextSetup은 스프링에서 로드한 WebApplicationContext의 인스턴스로 작동하기 때문에 스프링 컨트롤러는 물론 의존성까지 로드되기 때문에 완전한 통합테스트를 할 수 있다.
```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
public class MyControllerIntegrationTest {
    
    @Autowired
    private WebApplicationContext wac;

    @Test
    public void testWebAppContextSetup() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(this.wac).build();

        mockMvc.perform(get("/my-endpoint"))
               .andExpect(status().isOk());
    }
}
```
<br/>

 - __configuration__
    - 다양한 설정을 통해 MockMvc의 동작을 세밀하게 조정할 수 있습니다. 예를 들어, 필터를 추가하거나 전역 설정을 적용할 수 있습니다.
```java
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.filter.CharacterEncodingFilter;

public class MyControllerTest {
    
    @Test
    public void testWithCustomConfig() throws Exception {
        MyController controller = new MyController();
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller)
                                         .addFilters(new CharacterEncodingFilter("UTF-8", true))
                                         .build();

        mockMvc.perform(get("/my-endpoint"))
               .andExpect(status().isOk());
    }
}
```
<br/>

### MockMvc 메서드

 - __perform()__
    - 요청을 전송하는 역할을 한다.
    - 결과로 ResultActions 객체를 받으며, ResultActions 객체는 리턴 값을 검증하고 확인할 수 있는 andExpect() 메서드를 제공해준다.
 - __get("/endpoint")__
    - HTTP 메소드를 결정할 수 있다(get(), post(), put(), delete()) 인자로는 경로를 전달한다.
 - __params()__
    - 키=값의 파라미터를 전달할 수 있다.
    - 여러 개일 때는 params()를, 하나일 때에는 param()을 사용한다.
 - __andExpect()__
    - 응답을 검증하는 역할을 한다.
    - andExpect가 1개라도 실패하면 테스트는 실패한다.
    - __상태 코드(status())__
        - isOk(): 200
        - isNotFound(): 404
        - isMethodNotAllowed(): 405
        - isInternalServerError(): 500
        - is(int status): status 상태 코드
    - __뷰(view())__
        - 리턴하는 뷰 이름을 검증한다.
    - __핸들러(handler())__
        - 요청에 매핑된 컨트롤러를 검증한다.
    - __리다이렉트(redirect())__
        - 리다이렉트 응답을 검증한다.
    - __모델 정보(model())__
        - 컨트롤러에서 저장한 모델들의 정보 검증
        - attributeExists(String name) : name에 해당하는 데이터가 model에 있는지 검증
        - attribute(String name, Object value) : name에 해당하는 데이터가 value 객체인지 검증
```java
// 상태
mockMvc.perform(get("/"))
    .andExpect(status().isOk()) // status()로 예상 값을 검증한다.
    .andExpect(is(404))         // 또는 is()로 검증

// 뷰
mockMvc.perform(get("/"))
    .andExpect(view().name("output")) // 리턴하는 뷰 이름이 output 인지 검증

// 핸들러
mockMvc.perform(get("/"))
     .andExpect(handler().handlerType(FormController.class))
     .andExpect(handler().methodName("main"))

// 리다이렉트    
mockMvc.perform(get("/"))
    .andExpect(redirectUrl("/output")) // /output로 리다이렉트 되는지 검증

// 모델
mockMvc.perform(get("/"))
    .andExpect(model().attributeExists("outputFormList"))
    .andExpect(model().attribute("outputFormList", outputDtoList))
```
<br/>

 - __응답 정보 검증(content())__
    - 응답에 대한 정보를 검증한다.
```java
ResultActions result = mockMvc.perform(
                post("/search")
                 .contentType(MediaType.APPLICATION_FORM_URLENCODED) // @ModelAttribute 매핑 검증을 위한 content type 지정
                 .content("address=서울 성북구 종암동"))
```
<br/>

 - __ContentType__
    - ContentType이란 HTTP 메시지(요청과 응답 모두)에 담겨 보내는 데이터의 형식을 알려주는 헤더이다.
    - Ajax를 통해 json 형식의 데이터를 전송하는 경우 ContentType값을 application/json 으로 지정하여 보낸다.
    - form 태그를 통해 첨부파일 등을 전송하는 경우라면 브라우저가 자동으로 ContentType을 multipart/form-data로 설정하여 요청 메시지를 보낸다.
 - __Accept__
    - Accept 헤더의 경우에는 브라우저(클라이언트)에서 웹서버로 요청시 요청메시지에 담기는 헤더이다.
    - 브라우저가 요청 메시지의 Accept 헤더 값을 application/json이라고 설정했다면 클라이언트는 웹서버에게 json 데이터만 처리할 수 있으니 json 데이터 형식으로 응답을 돌려줘 라고 말하는 것과 같다.
 - __andDo()__
    - 요청/응답 전체 메시지를 확인할 수 있다.
    - print(): 실행결과를 지정해준 대상으로 출력해준다.(default는 System.out)
    - log(): 실행결과를 디버깅 레벨로 출력한다.

<br/>

