# Callable

Java 5 이전에는 멀티 쓰레드를 위해 Thread와 Runnable 인터페이스를 이용할 수 있다. 하지만, 해당 인터페이스를 이용하는 방식은 지나치게 저수준의 API에 의존하며, 쓰레드 작업이 끝난 후 결과를 반환받을 수 없다.

<br/>

## Callable

기존의 Runnable 인터페이스는 결고를 반환할 수 없다는 한계점이 있었다. 반환값을 얻으려면 공용 메모리나 파이프 등을 사용해야 했는데, 이러한 작업은 상당히 번거롭다. 그래서 Runnable의 발전된 형태로써, Java5에 함께 추가된 제네릭을 사용해 결과를 받을 수 있는 Callable이 추가되었다.

 - `Callable 인터페이스`
    - 인자를 받지 않으며, 특정 타입의 객체를 리턴한다.
    - call() 메서드 수행 중 Exception을 발생시킬 수 있다.
```java
@FunctionalInterface
public interface Callable<V> {
    V call() throws Exception;
}
```

<br/>

 - `Callable 예제`
    - FutureTask.get()으로 Callable의 call()메소드가 호출되어 결과가 리턴되기를 기다린다.
```java
// 1. MyCallable 클래스를 상속하는 클래스를 만들어 call() 메서드 구현
public MyCallable extends Callable<String> {
    @Override
    public String call() throws Exception {
        String result = "Called at " + LocalTime.now();
        return result;
    }
}

// 2. 쓰레드 객체를 생성하고, start() 메서드로 쓰레드 실행
public class Runner {
    public static void main(String[] args) {
        MyCallable callable = new MyCallable();
        FutureTask futureTask = new FutureTask(callable);
        Thread thread = new Thread(futureTask);
        thread.start();
    }
}
```

 - `Callable`
```java
@Test
void callable_void() {
    ExecutorService executorService = Executors.newSingleThreadExecutor();

    Callable<Void> callable = new Callable<Void>() {
        @Override
        public Void call() {
            final String result = "Thread: " + Thread.currentThread().getName();
            System.out.println(result);
            return null;
        }
    };

    executorService.submit(callable);
    executorService.shutdown();
}


@Test
void callable_String() {
    ExecutorService executorService = Executors.newSingleThreadExecutor();

    Callable<String> callable = new Callable<String>() {
        @Override
        public String call() {
            return "Thread: " + Thread.currentThread().getName();
        }
    };

    executorService.submit(callable);
    executorService.shutdown();
}

@Test
void future() {
    ExecutorService executorService = Executors.newSingleThreadExecutor();

    Callable<String> callable = new Callable<String>() {
        @Override
        public String call() throws InterruptedException {
            Thread.sleep(3000L);
            return "Thread: " + Thread.currentThread().getName();
        }
    };

    // 블로킹에 의해 3초 동안 대기
    Future<String> future = executorService.submit(callable);
    System.out.println(future.get());

    executorService.shutdown();
}
```

<br/>

## Future

Callable 인터페이스의 구현체인 작업(Task)은 가용 가능한 쓰레드가 없어서 실행이 미뤄질 수 있고, 작업 시간이 오래 걸릴 수도 있다. 그래서 실행 결과를 바로 받지 못하고 미래의 어느 시점에 얻을 수 있는데, 미래에 완료된 Callable의 반환값을 구하기 위해 사용되는 것이 Future이다. 즉, Future는 비동기 작업을 갖고 있어 미래에 실행 결과를 얻도록 도와준다. 이를 위해 비동기 작업의 현재 상태를 확인하고, 기다리며, 결과를 얻는 방법 등을 제공한다.  

 - `Future 인터페이스`
    - get()
        - 블로킹 방식으로 결과를 가져온다.
        - 타임아웃 설정 가능
    - isDone(), isCancelled()
        - isDone()은 작업 완료 여부를 반환하고, isCancelled()는 작업 취소 여부를 반환한다.
    - cancel()
        - 작업을 취소하고, 취소 처리 여부를 반환한다.
        - 작업이 이미 완료되었거나, 취소되었거나, 다른 이유로 취소할 수 없는 경우에는 실패한다.
        - 파라미터로는 boolean 값을 전달할 수 있는데, true를 전달하면 쓰레드를 interrupt 시켜 InterrepctException을 발생시키고 false를 전달하면 진행중인 작업이 끝날때까지 대기한다.
```java
public interface Future<V> {

    boolean cancel(boolean mayInterruptIfRunning);

    boolean isCancelled();

    boolean isDone();

    V get() throws InterruptedException, ExecutionException;

    V get(long timeout, TimeUnit unit) throws InterruptedException, ExecutionException, TimeoutException;
}
```

<br/>

## 참고

 - https://simyeju.tistory.com/119
 - https://mangkyu.tistory.com/259
 - https://codechacha.com/ko/java-executors/
 - https://velog.io/@ssssujini99/Java-Callable-Executors-ExecutorService-%EC%9D%98-%EC%9D%B4%ED%95%B4-%EB%B0%8F-%EC%82%AC%EC%9A%A9%EB%B2%95
