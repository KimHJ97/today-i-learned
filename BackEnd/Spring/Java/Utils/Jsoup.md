# Jsoup

Jsoup은 자바로 작성된 HTML 파싱 라이브러리로, HTML 문서를 읽고, 파싱하고, 조작하고, 검색할 수 있는 기능을 제공합니다. 주로 웹 스크래핑이나 HTML을 다루는 작업에서 사용됩니다.  

 - HTML 파싱: Jsoup은 HTML 파일이나 웹 페이지에서 HTML을 읽고 이를 파싱하여 DOM 트리 구조로 변환합니다. 이 DOM 트리를 사용하면 HTML 요소에 쉽게 접근할 수 있습니다.
 - 웹 스크래핑: Jsoup은 HTTP 클라이언트 기능을 포함하고 있어서, 웹 페이지의 내용을 가져와 분석할 수 있습니다. 이 기능을 통해 웹에서 데이터를 추출하는 웹 스크래핑 작업을 간편하게 수행할 수 있습니다.
 - DOM 탐색 및 수정: HTML 문서에서 특정 요소를 선택하고 조작할 수 있습니다. CSS 선택자 또는 DOM 트리 탐색을 통해 특정 요소를 찾고, 그 요소의 내용을 변경하거나 속성을 수정할 수 있습니다.
 - 데이터 정리 및 변환: Jsoup은 HTML 문서를 텍스트로 정리하거나, 불필요한 태그를 제거하고, 구조를 재정렬하는 등의 데이터 정리 작업을 지원합니다.
 - 보안성: Jsoup은 웹 페이지에서 HTML을 안전하게 처리하기 위해 내장된 XSS(크로스 사이트 스크립팅) 방지 기능을 가지고 있어서, 입력된 HTML 코드에서 악성 스크립트를 제거할 수 있습니다.
 - 공식 사이트: https://jsoup.org/
```groovy
dependencies {
    implementation 'org.jsoup:jsoup:1.18.1'
}
```

 - 예제 코드
```java
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public static void main(String[] args) {
    try {
        // 웹 페이지를 가져와서 파싱
        Document doc = Jsoup.connect("https://www.naver.com").get();

        // 페이지의 제목 가져오기
        String title = doc.title();
        System.out.println("Title: " + title);

        // 특정 요소 선택 (모든 링크 가져오기)
        Elements links = doc.select("a[href]");
        for (Element link : links) {
            System.out.println("Link: " + link.attr("href"));
            System.out.println("Text: " + link.text());
        }
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

## Jsoup API

 - HTTP 요청 후 Document 정보 얻기
```java
// GET 요청
Document doc = Jsoup.connect("URL").get();

// GET 요청 (Response 사용)
Connection.Response response = Jsoup.connect("URL")
        .method(Connection.Method.GET)
        .execute();
Document doc = response.parse();

// POST 요청
Document doc = Jsoup.connect("URL")
        .data("value1", "1")
        .data("value2", "2")
        .userAgent("Mozilla")
        .cookie("auth", "token")
        .timeout(3000)
        .post();
```

 - Document의 특정 내용 파싱
    - head(): head 태그를 파싱
    - body(): body 태그를 파싱
    - getElementById(): 아이디 선택자로 파싱
    - getElementsByTag(): 태그 선택자로 파싱 (Elements 반환)
    - select(): jQuery처럼 아이디, 태그, 클래스, 속성 등 복합 선택자를 이용해 파싱 (Elements 반환)
```java
// head 태그 파싱
Element head = doc.head();

// body 태그 파싱
Element body = doc.body();

// 특정 요소 선택
Element element = doc.getElementById("아이디");
Elements elements = doc.getElementsByTag("태그"); // Eelement = ArrayList<Element>
Elements links = doc.select(".title"); // 클래스 선택자
Elements links = doc.select("#title"); // 아이디 선택자
```

 - Element의 속성 파싱
```java
// 1. HTTP 요청 후 문서 정보 얻기
Document doc = Jsoup.connect("https://en.wikipedia.org/").get();

// 2. 문서의 타이틀 정보 얻기
String title = doc.title();

// 3. 특정 요소 선택(파싱)
Elements newsHeadlines = doc.select("#mp-itn b a");
for (Element headline : newsHeadlines) {
    // 3-1. Elements를 순회하여 하나씩 HTML 내용과 속성 파싱
    System.out.println(headline.html());
    System.out.println(headline.text());
    System.out.printf("%s%s\n", headline.attr("title"), headline.absUrl("href"));
}
```

 - Element 내용 조작하기
```java
element.attr("키", "값");
element.text("내용");
element.append("HTML 내용");
element.addClass("클래스명");
element.appendChild(new Element("div").text("신규 요소 내용"));
element.appendElement("div").text("신규 요소 내용");
```

 - 파싱 및 Element 내용 조작 예시
    - HTML 문서 내용을 String 변수에 직접 만들고, Jsoup.parse()로 해당 텍스트를 문서로 만든다.
    - 문서에서 특정 요소를 선택하고, 해당 요소의 자식 요소를 추가해본다.
```java
String html = "<div>안녕하세요</div>";
Document doc = Jsoup.parse(html);

Elements divElements = doc.select("div");
for (Element divElement : divElements) {
    divElement.appendChild(new Element("div").text("11"));
    divElement.appendElement("div").text("22");
    System.out.println(divElement.html());
}

// 출력 결과
/*
안녕하세요
<div>
 11
</div>
<div>
 22
</div>
*/
```

## Jsoup 한계

Jsoup은 HTML 파싱과 웹 스크래핑 작업에서 매우 유용하지만, 몇 가지 한계와 제약 사항이 있습니다. 이를 알면 적절한 상황에서 사용할 수 있고, 필요할 때는 대체 도구를 고려할 수 있습니다.  

 - 동적 콘텐츠 처리 제한
    - 문제: Jsoup은 서버로부터 받은 정적인 HTML만 처리할 수 있습니다. 이는 자바스크립트를 실행하지 않기 때문에, 자바스크립트를 사용해 동적으로 생성된 콘텐츠나 API 요청 후에 로드되는 데이터를 처리할 수 없다는 한계가 있습니다.
    - 해결 방안: 만약 자바스크립트로 생성된 콘텐츠를 스크래핑하려면, Selenium 같은 브라우저 자동화 도구나 Puppeteer 같은 헤드리스 브라우저 도구를 사용할 수 있습니다.
 - HTML 문서 크기에 따른 성능 문제
    - 문제: 매우 큰 HTML 문서를 파싱할 때 Jsoup은 메모리를 많이 사용하고, 성능이 저하될 수 있습니다. 이는 메모리에 전체 문서를 로드한 후 파싱하는 방식이기 때문에 발생하는 문제입니다.
    - 해결 방안: 메모리 사용량을 줄이기 위해서는 Jsoup을 사용하기 전에 특정 부분만 미리 필터링하거나, 너무 큰 HTML 문서를 다룰 때는 SAX 파서와 같은 이벤트 기반 파서로 대체할 수 있습니다.
 - HTTP 기능의 한계
    - 문제: Jsoup은 기본적인 HTTP 요청을 지원하지만, 고급 HTTP 기능에 제약이 있습니다. 예를 들어, 쿠키 관리, 세션 유지, 인증 헤더 설정, 파일 업로드 등과 같은 복잡한 요청을 다루기에는 한계가 있습니다.
    - 해결 방안: 이런 경우, Apache HttpClient 또는 OkHttp와 같은 고급 HTTP 라이브러리와 함께 사용할 수 있습니다. 이를 통해 세션 유지나 인증 처리를 하고, 그 결과 HTML을 Jsoup으로 파싱하는 방식으로 해결할 수 있습니다.

