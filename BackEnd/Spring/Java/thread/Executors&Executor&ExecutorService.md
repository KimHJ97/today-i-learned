# Executors, Executor, ExecutorService

Java 5에는 쓰레드 생성과 관리를 위한 쓰레드 풀을 위한 기능이 추가되었다.  
쓰레드 풀을 위한 Executor, ExecutorService, ScheduledExecutorService와 쓰레드 풀 생성을 도와주는 팩토리 클래스인 Executor가 추가되었다.  

<br/>

## Executor 인터페이스

동시에 여러 요청을 처리해야 하는 경우에 매번 새로운 쓰레드를 만드는 것은 비효율적이다. 그래서 쓰레드를 미리 만들어두고 재사용하기 위한 쓰레드 풀(Thread Pool)이 등장하게 되었는데, Executor 인터페이스는 쓰레드 풀의 구현을 위한 인터페이스이다.  

쉽게, Executor 인터페이스는 등록된 작업(Runnable)을 실행하기 위한 인터페이스로 등록된 작업을 실행하는 책임만을 갖는다.  

 - `Executor 인터페이스`
    - 전달받은 작업(Runnable)을 실행하는 메서드만 가지고 있다.
```java
public interface Executor {
   void execute(Runnable command);
}
```

<br/>

 - `Executor 예제`
```java
// Executor 예제1: 전달받은 Runnable 작업 실행
// 단순히, 전달받은 객체의 run() 메서드를 그대로 호출하는 것으로 메인 쓰레드에서 실행된다.
@Test
void executorRun() {
    final Runnable runnable = () -> System.out.println("Thread: " + Thread.currentThread().getName());

    Executor executor = new RunExecutor();
    executor.execute(runnable);
}

static class RunExecutor implements Executor {
    @Override
    public void execute(final Runnable command) {
        command.run();
    }
}

// Executor 예제1: 전달받은 Runnable을 Thread로 만든 후 작업 실행
// Thread의 start() 메서드로 새로운 쓰레드로 작업을 실행하도록 한다.
@Test
void executorRun() {
    final Runnable runnable = () -> System.out.println("Thread: " + Thread.currentThread().getName());

    Executor executor = new StartExecutor();
    executor.execute(runnable);
}

static class StartExecutor implements Executor {
    @Override
    public void execute(final Runnable command) {
        new Thread(command).start();
    }
}
```

<br/>

## ExecutorService 인터페이스

ExecutorService는 작업(Runnable, Callable) 등록을 위한 인터페이스이다. ExecutorService는 Executor를 상속받아서 작업 등록 뿐만 아니라 실행을 위한 책임도 갖는다. 그래서 쓰레드 풀은 기본적으로 ExecutorService 인터페이스를 구현한다. 대표적으로 ThreadPoolExecutor가 ExecutorService의 구현체인데, ThreadPoolExecutor 내부에 있는 블로킹 큐에 작업들을 등록해둔다.  
ExecutorService는 라이프사이클 관리를 위한 기능과 비동기 작업을 위한 기능을 제공한다.  

 - `ExecutorService 인터페이스`
```java
public interface ExecutorService extends Executor {

    void shutdown();

    List<Runnable> shutdownNow();

    boolean isShutdown();

    boolean isTerminated();

    boolean awaitTermination(long timeout, TimeUnit unit)
        throws InterruptedException;

    <T> Future<T> submit(Callable<T> task);

    <T> Future<T> submit(Runnable task, T result);

    Future<?> submit(Runnable task);

    <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks)
        throws InterruptedException;

    <T> List<Future<T>> invokeAll(Collection<? extends Callable<T>> tasks,
                                  long timeout, TimeUnit unit)
        throws InterruptedException;

    <T> T invokeAny(Collection<? extends Callable<T>> tasks)
        throws InterruptedException, ExecutionException;

    <T> T invokeAny(Collection<? extends Callable<T>> tasks,
                    long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutException;
}
```

 - `라이프사이클 관리를 위한 기능`
    - shutdown()
        - 실행 중인 모든 Task가 수행되면 종료된다.
        - 새로운 작업들을 더 이상 받아들이지 않는다.
        - 호출 전에 제출된 작업들은 그대로 실행이 끝나고 종료된다. (Graceful Shutdown)
    - shutdownNow()
        - 실행중인 Thread들을 즉시 종료시키려고 하지만, 모든 Thread가 동시에 종료되는 것을 보장하지는 않고 실행되지 않은 Task를 반환한다.
        - 이미 제출된 작업들을 인터럽트시킨다.
        - 실행을 위해 대기중인 작업 목록(List<Runnable>)을 반환한다.
    - isShutdown()
        - Executor의 shutdown 여부 반환
    - isTerminated()
        - shutdown 실행 후 모든 작업의 종료 여부 반환
    - awaitTermination()
        - shutdown 실행 후 지정한 시간 동안 모든 작업이 종료될 때 까지 대기
        - 지정한 시간 내에 모든 작업이 종료되었는지 여부 반환
    - __ExecutorService를 만들어 작업을 실행하는 경우 shutdown이 호출되기 전까지 계속해서 다음 작업을 대기하게 된다. 떄문에, 작업이 완료되었다면 반드시 shutdown을 명시적으로 호출해주어야 한다.__
    - __shutdownNow 시에 만약, 실행중인 작업들에서 인터럽트 여부에 따른 처리 코드가 없다면 계속 실행된다. 때문에, 필요한 경우 인터럽트 시에 추가적인 조치를 구현해야 한다.__
```java
@Test
void shutdown() {
    ExecutorService executorService = Executors.newFixedThreadPool(10);
    Runnable runnable = () -> System.out.println("Thread: " + Thread.currentThread().getName());
    executorService.execute(runnable);

    // shutdown 호출
    executorService.shutdown();

    // shutdown 호출 이후에는 새로운 작업들을 받을 수 없음, 에러 발생
    RejectedExecutionException result = assertThrows(RejectedExecutionException.class, () -> executorService.execute(runnable));
    assertThat(result).isInstanceOf(RejectedExecutionException.class);
}

@Test
void shutdownNow() throws InterruptedException {
    Runnable runnable = () -> {
        System.out.println("Start");
        while (true) {
            if (Thread.currentThread().isInterrupted()) {
                System.out.println("Interrupted");
                break;
            }
        }
        System.out.println("End");
    };

    ExecutorService executorService = Executors.newFixedThreadPool(10);
    executorService.execute(runnable);

    executorService.shutdownNow();
    Thread.sleep(1000L);
}
```

<br/>

 - `비동기 작업을 위한 기능`
    - ExecutorService는 Runnable과 Callable을 작업으로 사용하기 위한 메서드를 제공한다. 동시에 여러 작업들을 실행시키는 메서드도 제공하고 있는데, 비동기 작업의 진행을 추적할 수 있도록 Future를 반환한다.
    - submit()
        - Task를 할당하고 Future 타입을 반환한다.
        - 실행할 작업들을 추가하고, 작업의 상태와 결과를 포함하는 Future를 반환
        - Future의 get()을 호출하면 성공적으로 작업이 완료된 후 결과를 얻을 수 있다.
    - invokeAll()
        - Task를 Collection에 넣어서 인자로 넘겨줄 수 있으며, 모든 Task의 리턴값을 List<Future>로 반환한다.
        - 모든 결과가 나올 때 까지 대기하는 블로킹 방식
        - 동시에 주어진 작업들을 모두 실행하고, 전부 끝나면 각각의 상태와 결과를 갖는 List<Future>를 반환
    - invokeAny()
        - Task를 Collection에 넣어서 인자로 넘겨줄 수 있으며, 실행에 성공한 Task 중 하나의 리턴값을 반환한다.
        - 가장 빨리 실행된 결과가 나올 떄 까지 대기하는 블로킹 방식
        - 동시에 주어진 작업들을 모두 실행하고, 가장 빨리 완료된 하나의 결과를 Future로 반환
```java
// invokeAll(): 모든 Task가 종료될 때 까지 기다린다.
// 즉, 가장 오래 걸리는 작업만큼 시간이 소요된다.
// 만약, 쓰레드가 부족하다면 대기 시간과 작업 시간만큼의 시간이 소요된다.
@Test
void invokeAll() throws InterruptedException, ExecutionException {
    ExecutorService executorService = Executors.newFixedThreadPool(10);
    Instant start = Instant.now();

    Callable<String> hello1 = () -> {
        Thread.sleep(1000L);
        final String result = "Hello1";
        System.out.println("result = " + result);
        return result;
    };

    Callable<String> hello2 = () -> {
        Thread.sleep(4000L);
        final String result = "Hello2";
        System.out.println("result = " + result);
        return result;
    };

    Callable<String> hello3 = () -> {
        Thread.sleep(2000L);
        final String result = "Hello3";
        System.out.println("result = " + result);
        return result;
    };

    List<Future<String>> futures = executorService.invokeAll(Arrays.asList(hello1, hello2, hello3));
    for(Future<String> f : futures) {
        System.out.println(f.get());
    }

    System.out.println("time = " + Duration.between(start, Instant.now()).getSeconds());
    executorService.shutdown();
}

// invokeAny(): 
@Test
void invokeAny() throws InterruptedException, ExecutionException {
    ExecutorService executorService = Executors.newFixedThreadPool(10);
    Instant start = Instant.now();

    Callable<String> hello1 = () -> {
        Thread.sleep(1000L);
        final String result = "Hello1";
        System.out.println("result = " + result);
        return result;
    };

    Callable<String> hello2 = () -> {
        Thread.sleep(4000L);
        final String result = "Hello2";
        System.out.println("result = " + result);
        return result;
    };

    Callable<String> hello3 = () -> {
        Thread.sleep(2000L);
        final String result = "Hello3";
        System.out.println("result = " + result);
        return result;
    };

    String result = executorService.invokeAny(Arrays.asList(hello1, hello2, hello3));

    System.out.println("time = " + Duration.between(start, Instant.now()).getSeconds());
    executorService.shutdown();
}
```

<br/>

## ScheduledExecutorService 인터페이스

ScheduledExecutorService는 ExecutorService 인터페이스를 확장한 인터페이스로, 특정 시간 간격 또는 특정 시간에 주기적으로 작업을 실행할 수 있는 기능을 제공합니다. 이는 주로 예약된 작업을 관리하고 실행하는 데 사용됩니다.  

 - `주기적 작업 기능`
    - schedule()
        - 특정 시간(delay) 이후에 작업을 실행시킨다.
    - scheduleAtFixedRate()
        - 특정 시간(delay) 이후 처음 작업을 실행시킨다.
        - 작업이 실행되고 특정 시간마다 작업을 실행시킨다.
    - scheduleWithFixedDelay()
        - 특정 시간(delay) 이후 처음 작업을 실행시킨다.
        - 작업이 완료되고 특정 시간이 지나면 작업을 실행시킨다.
        - __작업이 완료된 시간 기준 특정 시간(delay)을 기다린 후에 작업을 실행시킨다.__

<br/>

## Executors 인터페이스

Executor, ExecutorService는 모두 쓰레드 풀을 위한 인터페이스이다.  
직접 쓰레드를 다루는 것은 번거로우므로, 이를 도와주는 팩토리 클래스인 Executors가 등장하게 되었다.  
Executors는 고수준(High-Level)의 동시성 프로그래밍 모델로써 Executor, ExecutorService 또는 SchedueledExecutorService를 구현한 쓰레드 풀을 손쉽게 생성해준다.  

 - `쓰레드 풀 생성`
    - newFixedThreadPool()
        - 고정된 쓰레드 개수를 갖는 쓰레드 풀을 생성한다.
        - ExecutorService 인터페이스를 구현한 ThreadPoolExecutor 객체가 생성된다.
    - newCachedThreadPool
        - 필요할 때 필요한 만큼의 쓰레드 풀을 생성한다.
        - 이미 생성된 쓰레드가 있다면 이를 재활용할 수 있다.
    - newScheduledThreadPool
        - 일정 시간 뒤 혹은 주기적으로 실행되어야 하는 작업을 위한 쓰레드 풀을 생성한다.
        - ScheduledExecutorService 인터페이스를 구현한 ScheduledThreadPoolExecutor 객체가 생성된다.
    - newSingleThreadExecutor, newSingleThreadScheduledExecutor
        - 1개의 쓰레드만을 갖는 쓰레드 풀을 생성한다.
        - 각각 newFixedThreadPool과 newScheduledThreadPool에 1개의 쓰레드만을 생성하도록 한 것이다.

```java
// newSingleThreadExecutor(): Thread가 1개로 작업을 예약한 순서대로 처리한다.
// 동시성을 고려할 필요가 없다. 순서대로 처리된다.
@Test
void newSingleThreadExecutor() throws InterruptedException, ExecutionException {
    ExecutorService executor = Executors.newSingleThreadExecutor();
    executor.submit(() -> {
        String threadName = Thread.currentThread().getName();
        System.out.println("Job1 " + threadName);
    });
    executor.submit(() -> {
        String threadName = Thread.currentThread().getName();
        System.out.println("Job2 " + threadName);
    });
    executor.submit(() -> {
        String threadName = Thread.currentThread().getName();
        System.out.println("Job3 " + threadName);
    });
    executor.submit(() -> {
        String threadName = Thread.currentThread().getName();
        System.out.println("Job4 " + threadName);
    });

    executor.shutdown();
    System.out.println("end");
}

// newFixedThreadPool(): 고정된 쓰레드 갯수를 갖는 쓰레드 풀을 생성한다.
// Thread를 2개로 지정하였으므로, 1번과 2번 쓰레드가 번갈아가면서 작업을 수행한다.
@Test
void newSingleThreadExecutor() throws InterruptedException, ExecutionException {
    ExecutorService executor = Executors.newFixedThreadPool(2);
    executor.submit(() -> {
        String threadName = Thread.currentThread().getName();
        System.out.println("Job1 " + threadName);
    });
    executor.submit(() -> {
        String threadName = Thread.currentThread().getName();
        System.out.println("Job2 " + threadName);
    });
    executor.submit(() -> {
        String threadName = Thread.currentThread().getName();
        System.out.println("Job3 " + threadName);
    });
    executor.submit(() -> {
        String threadName = Thread.currentThread().getName();
        System.out.println("Job4 " + threadName);
    });

    executor.shutdown();
    System.out.println("end");
}
```

<br/>

## 정리

Java 5에서는 멀티 쓰레드 처리를 위한 다양한 API가 만들어졌다.  
Callable을 통해 기존에 Thread나 Runnable로 결과를 받을 수 없었던 결과를 받을 수 있게 되었고, Future로 비동기로 처리되는 쓰레드의 결과를 블로킹 방식으로 대기하여 쉽게 얻을 수 있다.  
또한, 쓰레드 생성과 관리에 대한 불편함을 Executor 인터페이스로 작업에 실행을 책임지고, ExecutorService 인터페이스로 작업 등록과 실행을 책임지고, 라이프 사이클과 비동기 처리를 위한 기능을 쉽게 사용할 수 있다.  
또한, 쓰레드 풀을 직접 다루는 것은 번거로우므로, 이를 도와주는 Executors 팩토리 클래스를 이용할 수 있다.  

다만, Future는 결과를 얻으려면 블로킹 방식으로 대기한다는 단점이 있다.  
이러한 문제는 Future에 처리 결과에 대한 콜백을 정의하는 방식으로 해결할 수 있는데, Java 8에는 이를 보완하여 CompletableFuture가 추가되었다.  

<br/>

## 참고

 - https://simyeju.tistory.com/119
 - https://mangkyu.tistory.com/259
 - https://codechacha.com/ko/java-executors/
 - https://velog.io/@ssssujini99/Java-Callable-Executors-ExecutorService-%EC%9D%98-%EC%9D%B4%ED%95%B4-%EB%B0%8F-%EC%82%AC%EC%9A%A9%EB%B2%95
