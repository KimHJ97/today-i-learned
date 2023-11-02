# 텍스트 ellipsis('...') 말줄임 표시 처리

CSS로 말줄임 처리를 하기 위해서 글자를 출력할 공간이 필요하다.  
기본적으로 CSS display 속성의 inline 값은 요소의 너비를 가질 수 없기 때문에 block 혹은 inline-block으로 변경하여 너비를 가질 수 있도록 하여야 한다.  

기본적으로 글자가 블록 너비를 넘어가면, 줄바꿈이 된다. white-space 속성을 nowrap으로 줄바꿈을 없애준다.  
글자가 특정 너비를 넘어가는 경우 말줄임 처리를 위해 text-overflow 속성을 ellipsis로 지정한다. overflow 속성은 hidden으로 숨겨준다.  


 - 한 줄 라인 텍스트 자르기
    - display: block > 요소를 블록을 지정
    - overflow:hidden > 박스를 넘어가는 부분을 숨김
    - text-overflow:ellipsis > 글자가 화면 크기를 넘을 경우 생략 부호를 표시
    - white-space:nowrap > 공백문자가 있는 경우 줄바꿈하지 않고 한 줄로 나오게 처리
    - word-break: break-all > 너비를 초과하면 단어를 나눔
```CSS
.ellipsis {
    display: block;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    word-break: break-all;
}
```

<br/>

멀티 라인 텍스트 자르기를 설정하기 위해서는 첫 번째로 한 줄 말줄임을 위해 너비 지정과 text-overflow 속성을 ellipsis로 지정하고, overflow를 hidden으로 지정한다.  
이후, webkit-line-clamp 속성으로 멀티 라인 수를 지정한다. 이때 해당 속성을 적용하기 위해서 display가 webkit-box 혹은 webkit-inline-box로 지정해야 한다.  
또한, webkit-line-clamp는 webkit 엔진을 사용하지 않는 브라우저에서는 문제가 된다. 때문에, line-height, height을 추가적으로 지정한다.  

 - 멀티 라인 텍스트 자르기
    - display: -webkit-box > 블록을 수직, 수평으로 배치하거나 역순으로 배열하거나 임의로 배치 순서를 변경 가능
    - line-clamp: 블록 컨테이너의 콘텐츠를 지정한 줄 수 만큼 제한
    - box-orient: 컨텐츠를 가로 또는 세로로 배치할 지 여부를 결정
        - -webkit은 크로스 브라우징을 위해 필요하며 구글, 사파리 브라우저에서 사용이 가능하다.
```CSS
.multi-ellipsis {
    width: 300px;
    text-overflow: ellipsis;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    word-break: break-word; // break-word(단어), keep-all(문단)
    line-height: 50px;
    height: 150px;
}
```

<br/>

## 참고

 - https://jos39.tistory.com/211
 - https://webruden.tistory.com/655
 - https://mong-blog.tistory.com/entry/css-%ED%95%9C-%EC%A4%84-%EC%97%AC%EB%9F%AC-%EC%A4%84-%EB%A7%90%EC%A4%84%EC%9E%84