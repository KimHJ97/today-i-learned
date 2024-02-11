# 실습 환경 구축

## RxJava 프로젝트 환경 구축

 - JDK 1.8+ 설치
 - IDE 다운로드 및 설치
 - RxJava를 위한 의존 라이브러리 설치

<br/>

### 예제 코드

 - `build.gradle`
    - 의존 라이브러리를 추가한다.
```gradle
dependencies {
    .. 

    // https://mvnrepository.com/artifact/io.reactivex.rxjava2/rxjava
    compile group: 'io.reactivex.rxjava2', name: 'rxjava', version: '2.2.6'
}
```

<br/>

 - `HelloRxJava`
```java
import io.reactivex.Observable;

public class HelloRxJava {
    public static void main(String[] args){
        // 데이터 생성(생산자)
        Observable<String> observable = Observable.just("Hello", "RxJava!");
        // 데이터 구독(소비자)
        observable.subscribe(data -> System.out.println(data));

        Observable.just("Hello", "RxJava!")
                .subscribe(data -> System.out.println(data));

    }
}
```

