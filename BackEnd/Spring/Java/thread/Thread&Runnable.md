# Thread와 Runnable

스레드(Thread)는 프로세스안에서 실질적으로 작업을 실행하는 단위를 말하며, 자바에서는 JVM(Java Virtual Machine)에 의해 관리됩니다. 프로세스에는 적어도 한개 이상의 스레드가 있으며, Main 스레드 하나로 시작하여 스레드를 추가 생성하게 되면 멀티 스레드 환경이 됩니다. 이러한 스레드들은 프로세스의 리소스를 공유하기 때문에 효율적이긴 하지만 잠재적인 문제점에 노출될 수도 있습니다.  
 - 쓰레드란 프로그램 실행의 가장 작은 단위이다.
 - 1개의 쓰레드 만으로는 동시에 여러 작업을 할 수 없다.

<br/>

## Thread

 - `생성자 및 메서드`
```java
// 생성자
Thread()                // 새로운 스레드 객체 할당
Thread(String name)     // 객체가 할당 + 이름 부여
Thread(Runnable target) // Runnable target이 구현된 스레드 객체 할당
Thread(Runnable target, String name)

// 메서드
void run()                        // 스레드의 동작을 구현한다.
void start()                      // 새로운 스레드를 만들어 실행한다.
void interrupt()                  // 스레드 중지
void join()                       // 이 스레드가 끝날때까지 대기
void join(long millis)            // 최대 millis 시간동안 이 스레드가 끝날때까지 대기
static void sleep(long millis)    // millis 시간동안 현재 스레드를 일시중지시킵니다. 
static void yield()               // 현재 스레드의 실행시간을 다른 스레드에게 양보
static Thread currentThread()     // 현재 실행중인 스레드 객체의 참조값 반환
static boolean interrupted()      // 현재 스레드의 interrupted 여부를 반환
long getId()                      // ID 반환
String getName()                  // 이름 반환
int getPriority()                 // 우선순위 반환 (우선순위 범위 : 1 ~ 10)
Thread.State getState()           // 상태 값 반환
ThreadGroup getThreadGroup()      // 스레드가 속한 스레드 그룹 반환
boolean isInterrupted()           // 스레드 interrupted 여부
boolean isAlive()                 // 스레드 생존 여부
boolean isDaemon()                // 데몬 스레드 여부
void setDaemon(boolean on)        // 데몬 스레드로 변경
void setName(String name)         // 스레드 이름 변경
void setPriority(int newPriority) // 우선순위 변경
String toString()                 // 스레드의 이름, 우선순위, 스레드그룹등의 정보를 담은 문자열 반환

```

<br/>

### Thread 사용법

스레드는 만들기 위해서는 Thread 클래스를 상속하는 방법과 Runnable 인터페이스를 구현하는 방법 2가지가 있다.  
Thread는 클래스로 해당 클래스를 상속받으면 다른 클래스를 상속받을 수 없다.  
Runnable은 1개의 메소드만 갖는 인터페이스로 다른 클래스 상속과 람다식으로도 구현이 가능하다.  

 - `Thread 클래스 상속하는 방법`
    - Thread 클래스를 상속하는 클래스를 만들어 run() 메서드 구현
    - 쓰레드 객체를 생성하고, start() 메서드로 쓰레드 실행
    - 해당 메서드의 실행을 별도의 쓰레드로 실행하기 위해서는 __run() 메서드를 직접 호출하는 것이 아니라, start()를 호출해야 한다.__ run() 메서드를 직접 호출하는 것은 해당 객체의 메서드를 호출하는 것에 불과하다.
    - start() 메서드는 내부적으로 쓰레드가 실행 가능한지 검사하고, 쓰레드 그룹에 해당 쓰레드를 추가하고, JVM을 이용하여 쓰레드를 실행시킨다.
```java
// 1. Thread 클래스를 상속하는 클래스를 만들어 run() 메서드 구현
public MyThread extends Thread {
    public void run() {
        System.out.println("Hello Thread");
    }
}

// 2. 쓰레드 객체를 생성하고, start() 메서드로 쓰레드 실행
public class Runner {
    public static void main(String[] args) {
        Thread thread = new MyThread();
        thread.start();
    }
}
```

<br/>

 - `Runnable 인터페이스 구현하는 방법`
    - Runnable 인터페이스의 run() 메서드를 구현한 클래스 작성
    - Runnable 객체를 생성하고, 해당 Runnable 객체로 쓰레드를 생성한다. 이후 start() 메서드로 쓰레드 실행
```java
// 1. Runnable 인터페이스의 run() 메서드를 구현한 클래스 작성
public MyRunnable implements Runnable {
    public void run() {
        System.out.println("Hello Runnable");
    }
}

// 2. Runnable 객체를 생성하고, 해당 Runnable 객체로 쓰레드를 생성한다. 이후 start() 메서드로 쓰레드 실행
public class Runner {
    public static void main(String[] args) {
        Runnable runnable = new MyRunnable();
        Thread thread = new Thread(runnable);
        thread.start();

        // 익명 함수를 이용한 방법
        Runnable runnable2 = new Runnable() {
            @Override
            public void run() {
                System.out.println("Hello Runnable2");
            }
        };
        Thread thread2 = new Thread(runnable2);
        thread2.start();

        // 람다식을 이용한 방법
        Thread thread3 = new Thread(() -> {
            System.out.println("Hello Runnable Lambda");
        });
        thread3.start();
    }
}
```

<br/>

### Thread와 Runnable 비교

Runnable은 익명 객체 및 람다로 사용할 수 있지만, Thread는 별도의 클래스를 만들어야 한다는 점에서 번거롭다. 또한 Java에서는 다중 상속이 불가능하므로 Thread 클래스를 상속받으면 다른 클래스를 상속받을 수 없어서 좋지 않다. 또한 Thread 클래스를 상속받으면 Thread 클래스에 구현된 코드들에 의해 더 많은 자원(메모리와 시간 등)을 필요로 하므로 Runnable이 주로 사용된다.  

<br/>

## 참고

 - https://kadosholy.tistory.com/121
 - https://mangkyu.tistory.com/258
 - https://mangkyu.tistory.com/259
 - https://mangkyu.tistory.com/263
