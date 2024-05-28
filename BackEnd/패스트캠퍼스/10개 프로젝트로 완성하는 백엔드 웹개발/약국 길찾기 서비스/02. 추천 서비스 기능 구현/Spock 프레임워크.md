# Spock 프레임워크

Spock 프레임워크는 Groovy 언어를 기반으로 한 테스트 프레임워크로, 주로 Java와 Groovy 애플리케이션을 테스트하는 데 사용됩니다. Spock은 간결하고 표현력이 뛰어난 테스트 작성 방식을 제공하며, JUnit과 호환됩니다.  

 - Groovy의 간결한 문법을 사용하여 코드가 간결하고 읽기 쉬우며, 테스트의 의도를 쉽게 파악할 수 있습니다.
 - JUnit과 호환되기 때문에 기존의 JUnit 테스트를 Spock으로 쉽게 마이그레이션할 수 있습니다.
 -  테스트 메소드 이름을 문자열로 작성할 수 있으며 given, when, then 코드 블록을 명확히 구분

<br/>

## 사용 방법

 - 테스트 클래스는 Groovy 클래스로 생성하고, Specification 클래스를 상속 받는다. 
 - feature(테스트 메서드는) def를 이용하여 함수로 선언하며, 하나 이상 블록이 존재해야 함 
 - given 블록 : 테스트에 필요한 값을 준비한다.  
 - when 블록 : 테스트할 코드를 실행한다.  
 - then 블록 : when과 함께 사용하며 예외 및 결과 값을 검증한다.  
 - expect 블록 : then과 같으며 when을 필요로 하지 않기 때문에 간단한 테스트 및 where와 같이 사용된다.   
 - where 블록 : 데이터가 다르고 로직이 동일한 경우 동일한 테스트에 대한 중복 코드 제거 가능
 - 문서: https://spockframework.org/spock/docs/1.3/all_in_one.html

```groovy
import spock.lang.*

class MathSpec extends Specification {

    def "maximum of two numbers"() {
        expect:
        Math.max(a, b) == c

        where:
        a | b || c
        1 | 3 || 3
        7 | 4 || 7
        0 | 0 || 0
    }
}
```
<br/>

## 사용 예시

 - `build.gradle`
    - Spock 프레임워크를 사용하기 위해 플러그인과 의존 라이브러리를 추가한다.
```groovy
plugins {
	// ..
	id 'groovy'
}

dependencies {
    // ..

	// spock
	testImplementation('org.spockframework:spock-core:2.1-groovy-3.0')
	testImplementation('org.spockframework:spock-spring:2.1-groovy-3.0')

	// 런타임에 클래스 기반 spock mock을 만들기 위해서 필요
	testImplementation('net.bytebuddy:byte-buddy:1.12.10')
}
```
<br/>

 - `KakaoUriBuilderServiceTest`
```groovy
import spock.lang.Specification

import java.nio.charset.StandardCharsets

class KakaoUriBuilderServiceTest extends Specification {

    private KakaoUriBuilderService kakaoUriBuilderService

    def setup() {
        kakaoUriBuilderService = new KakaoUriBuilderService()
    }

    def "buildUriByAddressSearch - 한글 파라미터의 경우 정상적으로 인코딩"() {
        given:
        String address = "서울 성북구"
        def charset = StandardCharsets.UTF_8

        when:
        def uri = kakaoUriBuilderService.buildUriByAddressSearch(address)
        def decodedResult = URLDecoder.decode(uri.toString(), charset)

        then:
        decodedResult == "https://dapi.kakao.com/v2/local/search/address.json?query=서울 성북구"
    }
}
```

