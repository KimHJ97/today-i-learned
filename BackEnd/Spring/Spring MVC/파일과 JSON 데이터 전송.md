# Spring 파일과 JSON 데이터 동시에 전송

 - https://leeggmin.tistory.com/7
 - https://velog.io/@huewilliams/%ED%8C%8C%EC%9D%BC%EA%B3%BC-JSON-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%A5%BC-%EB%8F%99%EC%8B%9C%EC%97%90-%EB%B3%B4%EB%82%B4%EA%B8%B0-2%ED%8E%B8-feat.-React-Express-Spring
 - https://velog.io/@fever-max/SpringBoot3-json-MultipartFile

## Multipart/form-data

평소에 JSON 데이터를 전송할 때는 Content-Type을 'application/json' 형식으로 전송한다. 하지만, 파일 데이터를 전송할 떄는 'multipart/form-data' 형식을 사용해야 한다.  

Json Parser는 LIMIT Size가 4MB로 지정되어 있다. 파일의 경우 4MB를 넘어가는 파일이 존재한다. 또, 'application/x-www-form-urlencoded' 규격은 파일을 전송하기에 문제가 있다. 해당 규격은 Body가 키와 값으로 구성되는데 '='와 '&'를 사용하게 된다. 파일은 문자열이 아닌 바이너리 데이터로 전송되는데 '&' 특수문자도 사용된다.  

다른 Content-Type들의 한계로 파일을 전송할 때 'multipart/form-data'를 사용해야 한다.  

## Spring 서버 파일과 JSON 동시에 받기

### @RequestPart를 이용한 방법

 - `서버`
    - 클라이언트측에서 formData에 모든 데이터를 추가해야 한다. (append)
```java
@PostMapping("/upload")
public void uploadFile(
    @RequestPart("file") MultipartFile file,
    @RequestPart("user") UploadFileRequest uploadFileRequest
) {
    // ..
}

@Getter
class UploadFileRequest {
    private String name;
    private int age;
}
```

 - `클라이언트`
```javascript
// FormData 객체 생성 및 파일을 FormData에 추가
const formData = new FormData();
const fileInput = document.getElementById('fileInput'); // 파일 선택 요소 (예: <input type="file" id="fileInput">)
const file = fileInput.files[0]; 
formData.append('file', file);

// JSON 데이터 생성 및 JSON 데이터를 Blob으로 변환하여 추가
const user = {
    name: "John",
    age: 30
};
formData.append('user', new Blob([JSON.stringify(user)], { type: "application/json" })); 

// 서버로 요청 전송
fetch('http://localhost:8080/upload', {
    method: 'POST',
    body: formData
})
.then(response => response.text())
.then(result => {
    console.log('Success:', result);
})
.catch(error => {
    console.error('Error:', error);
});
```

 - `요청 데이터 형태`
    - --boundary: 각 파트는 boundary 문자열로 구분됩니다. boundary는 요청 헤더에서 서버에게 알려지며, 각 파트를 구분하는 데 사용됩니다.
    - Content-Disposition: form-data; name="user": 이 헤더는 이 파트가 폼 데이터의 일부임을 나타내며, name 속성으로 폼 필드의 이름(user)을 지정합니다.
    - Content-Type: application/json: 이 헤더는 이 파트의 데이터가 JSON 형식임을 나타냅니다. 이는 우리가 Blob을 생성할 때 지정한 MIME 타입과 일치합니다.
    - {"name":"John Doe","age":30}: 이 부분은 user 객체가 JSON으로 직렬화된 데이터입니다. 실제로 전송되는 본문 데이터입니다.
    - --boundary--: 마지막으로, 메시지의 끝을 나타내기 위해 boundary를 다시 사용하고, 끝에 --를 붙여 메시지의 종료를 명시합니다.
```javascript
--boundary
Content-Disposition: form-data; name="user"
Content-Type: application/json

{"name":"John Doe","age":30}
--boundary--
```

### @ModelAttribute를 이용한 방법

 - `서버`
```java
@PostMapping("/upload")
public void uploadFile(
    @ModelAttribute UploadFileRequest uploadFileRequest
) {
    // ..
}

@Getter
class UploadFileRequest {
    private String name;
    private int age;
    private MultipartFile file;
}
```

 - `클라이언트`
```javascript
const user = {
    name: "John",
    age: 30
};

const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('name', user.name);
formData.append('age', user.age);
formData.append('file', file);

fetch('http://localhost:8080/upload', {
    method: 'POST',
    body: formData
})
.then(response => response.text())
.then(result => {
    console.log('Success:', result);
})
.catch(error => {
    console.error('Error:', error);
});
```

 - `요청 데이터 형태`
```javascript
--boundary
Content-Disposition: form-data; name="name"

John Doe
--boundary
Content-Disposition: form-data; name="age"

30
--boundary
Content-Disposition: form-data; name="file"; filename="example.txt"
Content-Type: text/plain

file content
--boundary--
```
