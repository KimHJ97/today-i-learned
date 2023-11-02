# jQuery

jQuery는 자바스크립트 프레임워크로서, 웹 개발을 간편하게 만들기 위해 사용되는 라이브러리 중 하나입니다.  
jQuery는 HTML 문서 요소에 대한 조작, 이벤트 처리, 애니메이션 및 AJAX(Asynchronous JavaScript and XML) 기능을 향상시키는 데 사용됩니다.  
jQuery를 사용하면 웹 개발자가 크로스 브라우징(다양한 웹 브라우저에서 일관된 동작 보장)을 신경 쓰지 않고도 다양한 웹 브라우저에서 일관된 동작을 보장할 수 있습니다.  

 - 공식 사이트: https://jquery.com/
 - 공식 문서: https://api.jquery.com/

<br/>

## 다운로드 및 설치

 - 홈페이지: https://jquery.com/download/
```Bash
# NPM install
$ npm install jquery

# Yarn Install
$ yarn add jquery
```

 - CDN
    - Google CDN: https://developers.google.com/speed/libraries?hl=ko#jquery
    - Microsofty CDN: https://learn.microsoft.com/en-us/aspnet/ajax/cdn/overview#jQuery_Releases_on_the_CDN_0
    - CDNJS CDN: https://cdnjs.com/libraries/jquery
    - jsDelivr CDN: https://www.jsdelivr.com/package/npm/jquery
```HTML
<!-- jQuery 3.x 스니펫 -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

<!-- jQuery 2.x 스니펫 -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
```

<br/>

## 기초 사용 방법

 - DOM 탐색 및 조작
    - Button 요소의 continue 클래스가 존재하는 요소에 대해서 HTML을 변경한다.
    - <button class="continue">의 내부 요소를 "Next Step"으로 변경
```JS
$( "button.continue" ).html( "Next Step..." )
```

 - 이벤트 처리
    - 버튼을 클릭하면 숨겨진 요소를 표시한다.
```JS
var hiddenBox = $( "#banner-message" );
$( "#button-container button" ).on( "click", function( event ) {
    hiddenBox.show();
});
```

 - Ajax
    - "/api/getWeather" URL로 zipcode=97201를 쿼리매개변수로 요청한다.
    - 이후 성공시 "#weather-temp"의 HTML을 반환된 텍스트로 변경한다.
```JS

$.ajax({
    url: "/api/getWeather",
    data: {
        zipcode: 97201
    },
    success: function( result ) {
        $( "#weather-temp" ).html( "<strong>" + result + "</strong> degrees" );
    }
});
```
