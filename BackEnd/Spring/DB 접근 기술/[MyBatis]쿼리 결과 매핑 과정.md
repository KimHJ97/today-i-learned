# MyBatis 쿼리 결과 매핑 과정

 - 참고 블로그
    - https://jasper-rabbit.github.io/posts/mybatis-refector/
    - https://zzang9ha.tistory.com/420#google_vignette
    - https://lotuus.tistory.com/75

<br/>

## MyBatis 컬럼 매핑 과정

1. 클래스에 Setter가 있으면 Setter를 호출한다.  
2. Setter가 없다면 필드 이름을 매핑한다. (기본 생성자가 필요하다)  
3. 직접 정의한 생성자는 DB 출력 컬럼 순서와 생성자에 정의된 파라미터 순서가 같아야 한다.  

<br/>

## MyBatis 매핑 원리

매핑될 클래스(DTO)에 getter와 setter 메서드가 필요없다.  
매개변수가 없는 기본 생성자가만 있으면 된다.  
이것은 자바의 리플렉션(Reflection)을 이용하기 때문이다.  

 - Reflector 클래스
    - addGetMethods() 메서드를 통해 getter 메서드를 대상으로 정보를 취합한다.
    - getter가 없다면, addSetMethods() 메서드를 통해 setter 메서드를 대상으로 정보를 취합한다.
    - setter가 없다면, addFields() 메서드를 통해 필드를 대상으로 정보를 취합한다.
    - ※ 맵의 키를 저장할 때 upperCase로 저장하고 있다. 떄문에, 필드명과 컬럼명 대소문자가 다른 경우에도 정상적으로 매핑된다.
```Java
public class Reflector {

  ..
 
  public Reflector(Class<?> clazz) {
    type = clazz;
    addDefaultConstructor(clazz);
    Method[] classMethods = getClassMethods(clazz);
    addGetMethods(classMethods); // getter 메서드 대상으로 정보 취합
    addSetMethods(classMethods); // setter 메서드 대상으로 정보 취합
    addFields(clazz); // field 대상으로 정보 취합
    readablePropertyNames = getMethods.keySet().toArray(new String[0]);
    writablePropertyNames = setMethods.keySet().toArray(new String[0]);
    for (String propName : readablePropertyNames) {
      caseInsensitivePropertyMap.put(propName.toUpperCase(Locale.ENGLISH), propName); // 대문자 설정
    }
    for (String propName : writablePropertyNames) {
      caseInsensitivePropertyMap.put(propName.toUpperCase(Locale.ENGLISH), propName); // 대문자 설정
    }
  }

}
```

 - addGetMethods()
    - getter 메서드인 경우 getMethods 라는 Map<String, Invoker> 타입의 맵에 저장해둔다.
    - 이떄, 키 값은 해당 메서드명을 이용해서 필드명을 추출한다.
    - 즉, 실제 변수가 없고 getter 메서드만 있더라도 메서드 명을 이용해서 필드명을 추출하여 키 값으로 사용한다.
    - 정리하면, 메서드들을 대상으로 먼저 정보를 취합하고 다음으로 필드에 대해서 처리한다. 이떄, 각 필드명으로 먼저 만들어 두었던 getMethods 에서 검색하여 해당 필드에 대한 getter가 없다면 새로 만들어서 각 맵에 추가한다.
```Java
private void addGetMethods(Class<?> cls) {
    ...
    for (Method method : methods) {
        String name = method.getName();
        if (name.startsWith("get") && name.length() > 3) {
            if (method.getParameterTypes().length == 0) {
                name = PropertyNamer.methodToProperty(name);
                addMethodConflict(conflictingGetters, name, method);
            }
        } else if (name.startsWith("is") && name.length() > 2) {
            if (method.getParameterTypes().length == 0) {
                name = PropertyNamer.methodToProperty(name);
                addMethodConflict(conflictingGetters, name, method);
            }
        }
    }
    ...
}
```

<br/>

## MyBatis 컬럼 매핑 케이스

 - 기본 생성자만 존재하는 경우 (@NoArgsConstructor)
    - 객체의 매핑이 이루어지지 않는다.
    - 모든 데이터가 null로 매핑된다.
 - 기본 생성자와 별칭이 존재하는 경우 (@NoArgsConstructor + Alias)
    - 컬럼의 Alias로 필드명과 동일한 경우 객체 매핑이 정상적으로 진행된다.
    - 컬럼의 순서는 중요하지 않고, 별칭(Alias)이 객체의 필드명과 동일한지가 중요하다.
 - 모든 필드를 포함하는 생성자만 존재하는 경우 (@AllArgsConstructor)
    - 컬럼 순서대로 필드와 매핑이 이루어진다.
    - 컬럼과 필드의 순서를 고려해야 한다.
    - 순서가 다른 경우 원하지 않는 결과가 나올 수 있다. 때문에, 컬럼의 타입이 다른 경우 SQLException이 발생할 수 있다.
 - 기본 생성자와 모든 필드를 포함하는 생성자가 존재하는 경우
    - 모든 필드를 포함하는 생성자만 존재하는 경우와 동일하다.
 - 여러 개의 생성자가 존재할 경우
    - 기본 생성자는 존재하나 Alias가 없는 경우 null로 매핑된다.
    - 기본 생성자가 존재하지 않을 경우 Alias 여부와 상관없이 어떠한 생성자를 선택해야 할지 알 수 없기에 오류가 발생한다.
 - 일부 필드만 가지는 단 하나의 생성자만 존재하는 경우
    - Alias 설정이 없는 경우 생성자에 존재하는 필드만 매핑된다.
    - Alias 설정이 있는 경우 모든 필드에 대해 정상적으로 매핑된다.
 - 정리
    - @AllArgsConstructor 사용시 컬럼 순서를 신경써야 하므로 유지 보수가 힘들다.
    - @NoArgsConstructor와 Alias를 사용시 객체의 필드와 컬럼의 순서가 일치하지 않더라도 어떠한 필드가 매핑되는지 바로 파악할 수 있다.
