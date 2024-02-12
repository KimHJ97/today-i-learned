# Java에서의 함수형 프로그래밍 기본 지식

## 함수형 인터페이스와 람다의 개념

함수형 인터페이스(Functional Interface)는 딱 하나의 추상 메서드를 갖는 인터페이스를 말합니다. 이는 함수형 프로그래밍의 핵심 개념 중 하나로, Java 8부터 소개되었습니다.  

함수형 인터페이스는 주로 람다 표현식이나 메서드 레퍼런스와 함께 사용됩니다. 람다 표현식은 함수형 인터페이스의 인스턴스를 생성하고 이를 통해 메서드를 호출할 수 있도록 합니다.  

 - 함수형 인터페이스는 단 하나의 추상 메서드만 가지고 있는 인터페이스이다.
 - 함수형 인터페이스의 메서드를 람다 표현식으로 작성해서 다른 메서드의 파라미터로 전달할 수 있다.
 - 즉, 람다 표현식 전체를 해당 함수형 인터페이스를 구현한 클래스의 인스턴스로 취급한다.

<br/>

### 람다 표현식

 - 람다 표현식은 함수형 인터페이스를 구현한 클래스 즉, 익명 클래스의 메서드를 단순화한 표현식이다.  
 - 함수형 인터페이스의 메서드를 람다 표현식으로 작성해서 다른 메서드의 파라미터로 전달할 수 있다.
 - 즉, 람다 표현식 전체를 해당 함수형 인터페이스를 구현한 클래스의 인스턴스로 취급한다.

```java
/**
 * 하나의 추상 메서드를 가지고 있는 기존 인터페이스를 구현하는 예제
 */
public class LegacyInterfaceExample {
    public static void main(String[] args) {
        List<Car> cars = Arrays.asList(
                new Car(CarMaker.HYUNDAE, CarType.SUV, "팰리세이드", 28000000, true),
                new Car(CarMaker.SAMSUNG, CarType.SEDAN, "SM5", 35000000, true),
                new Car(CarMaker.CHEVROLET, CarType.SUV, "트래버스", 50000000, true),
                new Car(CarMaker.KIA, CarType.SEDAN, "K5", 20000000, false),
                new Car(CarMaker.SSANGYOUNG, CarType.SUV, "티볼리", 23000000, true)
        );

        Collections.sort(cars, new Comparator<Car>() {
            @Override
            public int compare(Car car1, Car car2) {
                return car1.getCarPrice() - car2.getCarPrice();
            }
        });

        for(Car car : cars)
            System.out.println("차 이름: " + car.getCarName() + ", 가격: " + car.getCarPrice());
    }
}

/**
 * 하나의 추상 메서드를 가지고 있는 기존 인터페이스를 함수형 인터페이스로 사용하는 예제
 */
public class LegacyInterfaceToFunctionalInterfaceExample {
    public static void main(String[] args) {

        List<Car> cars = Arrays.asList(
                new Car(CarMaker.HYUNDAE, CarType.SUV, "팰리세이드", 28000000, true),
                new Car(CarMaker.SAMSUNG, CarType.SEDAN, "SM5", 35000000, true),
                new Car(CarMaker.CHEVROLET, CarType.SUV, "트래버스", 50000000, true),
                new Car(CarMaker.KIA, CarType.SEDAN, "K5", 20000000, false),
                new Car(CarMaker.SSANGYOUNG, CarType.SUV, "티볼리", 23000000, true)
        );

        Collections.sort(cars, (car1, car2) -> car1.getCarPrice() - car2.getCarPrice());

        for(Car car : cars)
            System.out.println("차 이름: " + car.getCarName() + ", 가격: " + car.getCarPrice());
    }
}
```

 - `FunctionalInterface 예시`
```java
// CarPredicate
public interface CarPredicate {
    boolean test(Car car);
}

// CarFilter
public class CarFilter {
    // 사용자 정의 Predicate 사용
    public static List<Car> filterCarByCustomPredicate(List<Car> cars, CarPredicate p) {
        List<Car> resultCars = new ArrayList<>();
        for(Car car : cars)
            if (p.test(car)) {
                resultCars.add(car);
            }

        return resultCars;
    }

    // java.util.function 패키지에 내장된 Predicate 사용
    public static List<Car> filterCarByBuiltinPredicate(List<Car> cars, Predicate<Car> p) {
        List<Car> resultCars = new ArrayList<>();
        for(Car car : cars)
            if (p.test(car)) {
                resultCars.add(car);
            }

        return resultCars;
    }
}

/**
 * 사용자 정의 Predicate를 익명 클래스로 구현하는 예제
 */
public class FunctionalInterfaceExample {
    public static void main(String[] args) {
        List<Car> cars = Arrays.asList(
                new Car(CarMaker.HYUNDAE, CarType.SUV, "팰리세이드", 28000000, true),
                new Car(CarMaker.SAMSUNG, CarType.SEDAN, "SM5", 35000000, true),
                new Car(CarMaker.CHEVROLET, CarType.SUV, "트래버스", 50000000, true),
                new Car(CarMaker.KIA, CarType.SEDAN, "K5", 20000000, false),
                new Car(CarMaker.SSANGYOUNG, CarType.SUV, "티볼리", 23000000, true)
        );

        List<Car> carsFilteredByPrice = CarFilter.filterCarByCustomPredicate(cars, new CarPredicate() {
            @Override
            public boolean test(Car car) {
                return car.getCarPrice() > 30000000;
            }
        });

        for(Car car : carsFilteredByPrice)
            System.out.println("차 이름: " + car.getCarName() + ", 가격: " + car.getCarPrice());

        List<Car> carsFilteredByCarType = CarFilter.filterCarByCustomPredicate(cars, new CarPredicate() {
            @Override
            public boolean test(Car car) {
                return car.getCarType().equals(CarType.SUV);
            }
        });
        for(Car car : carsFilteredByCarType)
            System.out.println("차 이름: " + car.getCarName() + ", 차종: " + car.getCarType());
    }
}

/**
 * 사용자 정의 Predicate를 람다 표현식으로 사용하는 예제
 */
public class FunctionalInterfaceToLamdaExample {
    public static void main(String[] args) {
        List<Car> cars = Arrays.asList(
                new Car(CarMaker.HYUNDAE, CarType.SUV, "팰리세이드", 28000000, true),
                new Car(CarMaker.SAMSUNG, CarType.SEDAN, "SM5", 35000000, true),
                new Car(CarMaker.CHEVROLET, CarType.SUV, "트래버스", 50000000, true),
                new Car(CarMaker.KIA, CarType.SEDAN, "K5", 20000000, false),
                new Car(CarMaker.SSANGYOUNG, CarType.SUV, "티볼리", 23000000, true)
        );

        List<Car> carsFilteredByPrice =
                CarFilter.filterCarByCustomPredicate(cars, (Car car) -> car.getCarPrice() > 30000000);
        for(Car car : carsFilteredByPrice)
            System.out.println("차 이름: " + car.getCarName() + ", 가격: " + car.getCarPrice());

        List<Car> carsFilteredByCarType =
                CarFilter.filterCarByCustomPredicate(cars, car -> car.getCarType().equals(CarType.SUV));
        for(Car car : carsFilteredByCarType)
            System.out.println("차 이름: " + car.getCarName() + ", 차종: " + car.getCarType());
    }
}
```

<br/>

### 함수 디스크립터

함수형 인터페이스의 추상 메서드를 설명해놓은 시그니처를 함수 디스크립터라고 한다. Java 8에서는 java.util.function 패키지 하위로 다양한 함수형 인터페이스를 지원한다.  
 - Consumer<T>: T 타입의 인자를 받아서 아무런 결과를 리턴하지 않는 메서드를 정의한 함수형 인터페이스입니다.
 - Supplier<T>: 아무런 인자 없이 T 타입의 값을 리턴하는 메서드를 정의한 함수형 인터페이스입니다.
 - Function<T, R>: T 타입의 인자를 받아서 R 타입의 값을 리턴하는 메서드를 정의한 함수형 인터페이스입니다.
 - Predicate<T>: T 타입의 인자를 받아서 boolean 값을 리턴하는 메서드를 정의한 함수형 인터페이스입니다.

```java
/**
 * 함수 디스크립터의 Predicate 예제
 */
public class FunctionalDescriptorPredicateExample {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 6, 10, 30, 65, 70, 102);
        List<Integer> result = filter(numbers, n -> n > 30);

        for(int number : result)
            System.out.println(number);
    }

    // Predicate를 이용하여 filter() 함수를 구현한다.
    // Predicate는 T 타입의 인자를 받아서 boolean 값을 리턴한다.
    private static <T> List<T> filter(List<T> numbers, Predicate<T> p){
        List<T> result = new ArrayList<>();
        for(T number : numbers)
            if(p.test(number))
                result.add(number);

        return result;
    }
}

/**
 * 함수 디스크립터의 Consumer 예제
 */
public class  FunctionalDescriptorConsumer {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1, 6, 10, 30, 65, 70, 102);
        forEachPrint(numbers, n -> System.out.println(n));
    }

    // Consumer를 이용하여 forEach 함수를 구현한다.
    // Consumer는 T 타입의 인자를 받아서 아무런 결과를 리턴하지 않는다.
    // 쉽게, Consumer는 소비자로 입력받은 파라미터를 순회하며 소비한다.
    public static <T> void forEachPrint(List<T> numbers, Consumer<T> c) {
        for(T number : numbers)
            c.accept(number);
    }
}

/**
 * 함수 디스크립터의 Function 예제
 */
public class FunctionalDescriptorFunctionExample {
    public static void main(String[] args) {
        List<Character> characterList = Arrays.asList('a', 'b', 'c', 'd', 'e');
        List<Integer> asciiNumbers = map(characterList, character -> (int) character);

        for(int asciiNumber : asciiNumbers)
            System.out.println(asciiNumber);
    }

    // Function을 이용하여 map() 함수를 구현한다.
    // Function은 T 타입의 인자를 받아서 R 타입의 값을 리턴한다.
    // Function은 입력받은 파라미터를 순회하며 가공 및 수행한 결과를 반환한다.
    public static <T, R> List<R> map(List<T> list, Function<T, R> f){
        List<R> result = new ArrayList<>();
        for(T t : list)
            result.add(f.apply(t));
        return result;
    }
}
```

