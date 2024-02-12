# 리액티브 연산자에 익숙해지기

## 리액티브 연산자 개요 및 생성 연산자

RxJava에서의 연산자는 메서드(함수)로 연산자를 이용하여 데이터를 생성하고 통지하는 Flowable이나 Observable 등의 생산자를 생성할 수 있다.  
Flowable이나 Observable에서 통지한 데이터를 다양한 연산자를 사용하여 가공 처리하여 결과값을 만들어 낼 수 있고, 연산자의 특성에 따라 카테고리로 분류된다.  
 - Flowable/Observable 생성 연산자
 - 통지된 데이터를 필터링 해주는 연산자
 - 통지된 데이터를 변환해주는 연산자
 - 여러 개의 Flowable/Observable을 결합하는 연산자
 - 에러 처리 연산자
 - 유틸리티 연산자
 - 조건과 불린 연산자
 - 통지된 데이터를 집계해주는 연산자

<br/>

### Flowable/Observable 생성 연산자

 - `interval 함수`
    - 지정한 시간 간격마다 0부터 시작하는 숫자(Long)을 통지한다.
    - initialDelay 파라미터를 이용해서 최초 통지에 대한 대기 시간을 지정할 수 있다.
    - 완료 없이 계속 통지한다.
    - 호출한 쓰레드와는 별도의 쓰레드에서 실행된다.
    - polling 용도의 작업을 수행할 때 활용할 수 있다.
    - interval(long period, TimeUnit unit)
        - initialDelay: 최초 통지시 딜레이 시간
        - period: 통지 주기
```java
public class ObservableIntervalExample {
    public static void main(String[] args){
        System.out.println("# start : " +TimeUtil.getCurrentTimeFormatted());

        Observable.interval(1000L, TimeUnit.MILLISECONDS)
                .map(num -> num + " count")
                .subscribe(data -> Logger.log(LogType.ON_NEXT, data));

        TimeUtil.sleep(3000);
    }
}
```

<br/>

 - `range 함수`
    - 지정한 값(n)부터 m개의 숫자를 통지한다.
    - for, while 문 등의 반복문을 대체할 수 있다.
```java
public class ObservableRangeExample {
    public static void main(String[] args){
        Observable<Integer> source = Observable.range(0, 5);
        source.subscribe(num -> Logger.log(LogType.ON_NEXT, num));
    }
}
```

<br/>

 - `timer 함수`
    - 지정한 시간이 지나면 0을 통지한다.
    - 0을 통지하고 onComplete() 이벤트가 발생하여 종료한다.
    - 호출한 쓰레드와는 별도의 쓰레드에서 실행된다.
    - 특정 시간을 대기한 후에 어떤 처리를 하고자 할 때 활용할 수 있다.
```java
public class ObservableTimerExample {
    public static void main(String[] args){
        Logger.log(LogType.PRINT, "# Start!");
        Observable<String> observable =
                Observable.timer(2000, TimeUnit.MILLISECONDS)
                        .map(count -> "Do work!");

        observable.subscribe(data -> Logger.log(LogType.ON_NEXT, data));

        TimeUtil.sleep(3000);
    }
}
```

<br/>

 - `defer 함수`
    - 구독이 발생할 때마다 즉, subscribe()가 호출될 때마다 새로운 Observable을 생성한다.
    - 선언한 시점의 데이터를 통지하는 것이 아니라 호출 시점의 데이터를 통지한다.
    - 데이터 생성을 미루는 효과가 있기 때문에 최신 데이터를 얻고자할 때 활용할 수 있다.
```java
/**
 * 실제 구독이 발생할 때 Observable을 새로 반환하여 새로운 Observable을 생성한다.
 * defer()를 활용하면 데이터 흐름의 생성을 지연하는 효과를 보여준다.
 */
public class ObservableDeferExample {
    public static void main(String[] args) throws InterruptedException {
        // defer() 함수 호출시가 아니라, subscribe() 호출시 시간을 통지한다.
        Observable<LocalTime> observable = Observable.defer(() -> {
            LocalTime currentTime = LocalTime.now();
            return Observable.just(currentTime);
        });

        // just() 함수 호출시 시간을 통지한다.
        Observable<LocalTime> observableJust = Observable.just(LocalTime.now());

        observable.subscribe(time -> Logger.log(LogType.PRINT, " # defer() 구독1의 구독 시간: " + time));
        observableJust.subscribe(time -> Logger.log(LogType.PRINT, " # just() 구독1의 구독 시간: " + time));

        Thread.sleep(3000);

        observable.subscribe(time -> Logger.log(LogType.PRINT, " # defer() 구독2의 구독 시간: " + time));
        observableJust.subscribe(time -> Logger.log(LogType.PRINT, " # just() 구독자2의 구독 시간: " + time));
    }
}
```

<br/>

 - `fromIterable`
    - Iterable 인터페이스를 구현한 클래스(ArrayList 등)를 파라미터로 받는다.
    - Iterable에 담긴 데이터를 순서대로 통지한다.
```java
public class ObservableFromIterableExample {
    public static void main(String[] args){
        List<String> countries = Arrays.asList("Korea", "Canada", "USA", "Italy");

        Observable.fromIterable(countries)
                .subscribe(country -> Logger.log(LogType.ON_NEXT, country));
    }
}
```

<br/>

 - `fromFuture`
    - Future 인터페이스는 JDK 5+에서 비동기 처리를 위해 추가된 동시성 API이다.
    - 시간이 오래 걸리는 작업은 Future를 반환하는 ExcutorService에게 맡기고 비동기로 다른 작업을 수행할 수 있다.
    - JDK 8+에서는 CompletableFuture 클래스를 통해 구현이 간결해졌다.
```java
public class ObservableFromFutureExample {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        Logger.log(LogType.PRINT, "# start time");

        // 긴 처리 시간이 걸리는 작업
        Future<Double> future = longTimeWork();

        // 짧은 처리 시간이 걸리는 작업
        shortTimeWork();

        Observable.fromFuture(future)
                .subscribe(data -> Logger.log(LogType.PRINT, "# 긴 처리 시간 작업 결과 : " + data));

        Logger.log(LogType.PRINT, "# end time");
    }

    public static CompletableFuture<Double> longTimeWork(){
        return CompletableFuture.supplyAsync(() -> calculate());
    }

    private static Double calculate() {
        Logger.log(LogType.PRINT, "# 긴 처리 시간이 걸리는 작업 중.........");
        TimeUtil.sleep(6000L);
        return 100000000000000000.0;
    }

    private static void shortTimeWork() {
        TimeUtil.sleep(3000L);
        Logger.log(LogType.PRINT, "# 짧은 처리 시간 작업 완료!");
    }
}
```

