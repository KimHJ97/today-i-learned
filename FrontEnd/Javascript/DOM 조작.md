# Javascript을 이용한 DOM 조작

 - https://developer.mozilla.org/en-US/docs/Web/API/Document

<br/>

## DOM 조작 과정

 - __1. HTML 요소 선택__
    - DOM을 조작하기 위해 먼저 원하는 HTML 요소를 선택해야 한다.
    - getElementById(): id 속성이 일치하는 요소를 가져온다.
    - getElementsByName(): name 속성이 일치하는 요소들을 가져온다.
    - getElementsByTagNAme(): 태그명이 일치하는 요소들을 가져온다.
    - querySelector(): 선택자를 통해 요소를 가져온다. (조회된 첫 번째만을 반환)
    - querySelectorAll(): 선택자를 통해 요소들을 가져온다.
```JS
const myElement = document.querySelector('#myId'); // 아이디로 요소 선택
const myElement = document.querySelector('.myClass'); // 클래스로 요소 선택
const myButton = document.getElementById('myButton'); // 아이디로 버튼 요소 선택
```

<br/>

 - __2. HTML 요소 수정__
    - 선택한 요소에 대해서 속성, 내용, 스타일 등을 변경할 수 있다.
```JS
myElement.textContent = '새로운 내용'; // 텍스트 내용 변경
myElement.classList.add('newClass'); // 클래스 추가
myElement.style.color = 'blue'; // 스타일 변경
```

<br/>

 - __3. HTML 요소 생성__
    - JavaScript를 사용하여 새로운 HTML 요소를 생성하고 DOM에 추가할 수 있다.
    - document.createElement()를 사용하여 새 요소를 만들고 appendChild()나 insertBefore()와 같은 메서드를 사용하여 요소를 DOM에 추가한다.
```JS
const newElement = document.createElement('div'); // 새로운 div 요소 생성
document.body.appendChild(newElement); // body에 새로운 요소 추가
```

<br/>

 - __4. 요소 삭제__
    - removeChild() 메서드를 사용하여 DOM에서 요소를 삭제할 수 있습니다.
```JS
const elementToRemove = document.querySelector('.removeMe');
elementToRemove.parentNode.removeChild(elementToRemove); // 요소 삭제
```

<br/>

 - __5. 이벤트 처리__
    - DOM 요소에 이벤트 처리기를 추가하여 사용자 상호 작용을 처리할 수 있다.
    - 이벤트를 감지하고 이벤트 핸들러 함수를 등록하여 원하는 동작을 수행할 수 있다.
```JS
const myButton = document.getElementById('myButton');
myButton.addEventListener('click', function() {
    alert('버튼이 클릭되었습니다.');
});
```

<br/>

## Utils

```JS
// HTML Form 요소 내부 값 초기화
var clearFormInputElements = function(formId, elementNames) {
   let form = document.getElementById(formId);
   if (!form) {
      console.error(`Form with ID ${formId} not found.`);
      return;
   }

   elementNames.forEach(key => {
      let inputElement = form.querySelector('[name="' + key + '"]');

      if (inputElement.type === 'radio') {
         var radioButtons = form.querySelectorAll('input[type="radio"][name="' + key + '"]');
         for (var i = 0; i < radioButtons.length; i++) {
            var radioButton = radioButtons[i];
            radioButton.checked = false;

            var isChecked = radioButton.getAttribute("checked");
            if(isChecked != null) {
               radioButton.checked = true;
               break;
            }
         }
      } else if(inputElement.type === 'checkbox') {
         var checkBoxes = form.querySelectorAll('input[type="checkbox"][name="' + key + '"]');
         for (var i = 0; i < checkBoxes.length; i++) {
            var checkBox = checkBoxes[i];
            checkBox.checked = false;

            var isChecked = checkBox.getAttribute("checked");
            if(isChecked != null) {
               checkBox.checked = true;
            }
         }
      } else { // text, password, hidden, textarea 등
         var originalValue = inputElement.getAttribute("value");
         if(originalValue != null) {
            inputElement.value = originalValue;
         } else {
            inputElement.value = '';
         }
      }
   })

}

// HTML Form 요소 내부에 값 설정
var fillHtmlFormFromObject = function(formId, dataObject) {
   let form = document.getElementById(formId);
   if (!form) {
      console.error(`Form with ID ${formId} not found.`);
      return;
   }

   for (let key in dataObject) {
      if (dataObject.hasOwnProperty(key)) {
         let inputElement = form.querySelector('[name="' + key + '"]');
         if (inputElement) {
            if (inputElement.type === 'radio') {
               // 라디오 버튼인 경우 찾아서 해당 값과 일치하는 것을 체크
               let radioButtons = form.querySelectorAll('[name="' + key + '"]');
               for (let radio of radioButtons) {
                  if (radio.value === dataObject[key]) {
                     radio.checked = true;
                  }
               }
            } else {
               // 그 외(text, passwod, email, textarea 등)는 값 세팅
               inputElement.value = dataObject[key];
            }
         }
      }
   }
}

```
