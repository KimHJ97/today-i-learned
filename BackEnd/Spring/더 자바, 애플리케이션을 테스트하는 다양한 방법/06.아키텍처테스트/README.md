# 아키텍처 테스트

## ArchUnit 소개

ArchUnit는 Java 애플리케이션의 아키텍처와 코드 구조를 검증하고 테스트하는 데 사용되는 오픈 소스 라이브러리입니다. 이 라이브러리는 애플리케이션의 아키텍처 규칙과 설계 원칙을 코드 수준에서 검사하고 유지 관리하는 데 도움을 줍니다. 주로 소프트웨어 아키텍처를 관리하고 모니터링하는 데 사용되는 도구인 "Architecture as Code" 접근 방식의 일부로 사용됩니다.  
 - 공식 사이트: https://www.archunit.org/
 - ArchUnit User Guide: https://www.archunit.org/userguide/html/000_Index.html
 - 애플리케이션의 아키텍처를 테스트 할 수 있는 오픈 소스 라이브러리로, 패키지, 클래스, 레이어, 슬라이스 간의 의존성을 확인할 수 있는 기능을 제공한다.
 - 아키텍처 테스트 유즈 케이스
    - A 라는 패키지가 B (또는 C, D) 패키지에서만 사용 되고 있는지 확인 가능.
    - *Serivce라는 이름의 클래스들이 *Controller 또는 *Service라는 이름의 클래스에서만 참조하고 있는지 확인.
    - *Service라는 이름의 클래스들이 ..service.. 라는 패키지에 들어있는지 확인.
    - A라는 애노테이션을 선언한 메소드만 특정 패키지 또는 특정 애노테이션을 가진 클래스를 호출하고 있는지 확인.
    - 특정한 스타일의 아키텍처를 따르고 있는지 확인.

<br/>

## ArchUnit 설치

 - pom.xml 의존성 추가
```XML
<dependency>
    <groupId>com.tngtech.archunit</groupId>
    <artifactId>archunit-junit5-engine</artifactId>
    <version>0.12.0</version>
    <scope>test</scope>
</dependency>
```

 - 주요 사용법
    - 1. 특정 패키지에 해당하는 클래스를 읽어들인다.
    - 2. 확인할 규칙을 정의한다.
    - 3. 읽어들인 클래스들이 그 규칙을 잘 따르는지 확인한다.
```Java
@Test
public void Services_should_only_be_accessed_by_Controllers() {
    // 1. 특정 패키지에 해당하는 클래스를 읽어들인다.
    JavaClasses importedClasses = new ClassFileImporter().importPackages("com.mycompany.myapp");

    // 2. 확인할 규칙을 정의한다.
    ArchRule myRule = classes()
        .that().resideInAPackage("..service..")
        .should().onlyBeAccessed().byAnyPackage("..controller..", "..service..");

    // 3. 읽어들인 클래스들이 그 규칙을 잘 따르는지 확인한다.
    myRule.check(importedClasses);
}
```

 - JUnit 5 확장팩 제공
    - @AnalyzeClasses: 클래스를 읽어들여서 확인할 패키지 설정
    - @ArchTest: 확인할 규칙 정의

<br/>

## ArchUnit 패키지 의존성 확인하기

 - 패키지 의존성 예제
    - ..domain.. 패키지에 있는 클래스는 ..study.., ..member.., ..domain에서 참조 가능.
    - ..member.. 패키지에 있는 클래스는 ..study..와 ..member..에서만 참조 가능.
        - (반대로) ..domain.. 패키지는 ..member.. 패키지를 참조하지 못한다.
    - ..study.. 패키지에 있는 클래스는 ..study.. 에서만 참조 가능.
    - 순환 참조 없어야 한다.
```Java
public class ArchTests {

    @Test
    void packageDependencyTests() {
        JavaClasses classes = new ClassFileImporter().importPackages("com.hello.inflearnthejavatest");

        // domain 패키지 안에 있는 클래스들은 study, member, domain 패키지 안에 클래스에서 참조가 가능하다.
        ArchRule domainPackageRule = classes()
            .that().resideInAPackage("..domain..")
            .should().onlyBeAccessed().byClassesThat().resideInAnyPackage("..study..", "..member..", "..domain..");
        
        domainPackageRule.check(classes);

        // domain 패키지 안에 있는 클래스들은 member 패키지 안에 있는 어떠한 클래스든 참조할 수 없다.
        ArchRule memberPackageRule = noClasses()
            .that().resideInAPackage("..domain..")
            .should().accessClassesThat().resideInAPackage("..member..");
        
        memberPackageRule.check(classes);

        // 패키지가 study가 아닌 다른 패키지들은 study 패키지 클래스들을 참조할 수 없다.
        ArchRule studyPackageRule = noClasses()
            .that().resideOutsideOfPackage("..study..")
            .should().accessClassesThat().resideInAnyPackage("..study..");

        studyPackageRule.check(classes);

        // 순환 참조가 없어야 한다.
        ArchRule freeOfCycles = slices()
            .matching("..inflearnthejavatest.(*)..")
            .should().beFreeOfCycles();
        
        freeOfCycles.check(classes);
    }
}
```

<br/>

## ArchUnit JUnit 5 연동

ArchUnit에서는 JUnit 5와 연동하여 사용할 수 있는 확장팩을 제공해준다.    
ArchUnit을 통한 테스트 코드 작성시 중복되는 코드를 없애고, 코드를 간단하게 작성할 수 있다.  
하지만, 테스트 이름을 지정할 수 없다는 단점이 있다.  
 - ※ @Extension 어노테이션을 이용하여 확장한 것이 아니라 JUnit Engine 자체를 확장하였다. 즉, 테스트를 실행하면 JUnit Jupiter로 실행하는 것이 아닌, 자체 실행 엔진인 ArchUnit JUnit 5 엔진으로 실행하게 된다.
 - @AnalyzeClasses: 클래스를 읽어들여서 확인할 패키지 설정
 - @ArchTest: 확인할 규칙 정의

```Java
@AnalyzeClasses(packagesOf = App.class)
public class ArchTests {

    @ArchTest
    ArchRule controllerClassRule = classes().that().haveSimpleNameEndingWith("Controller")
            .should().accessClassesThat().haveSimpleNameEndingWith("Service")
            .orShould().accessClassesThat().haveSimpleNameEndingWith("Repository");

    @ArchTest
    ArchRule domainPackageRule = classes().that().resideInAPackage("..domain..")
            .should().onlyBeAccessed().byClassesThat()
            .resideInAnyPackage("..study..", "..member..", "..domain..");

    @ArchTest
    ArchRule memberPackageRule = noClasses().that().resideInAPackage("..domain..")
            .should().accessClassesThat().resideInAPackage("..member..");

    @ArchTest
    ArchRule studyPackageRule = noClasses().that().resideOutsideOfPackage("..study..")
            .should().accessClassesThat().resideInAnyPackage("..study..");

    @ArchTest
    ArchRule freeOfCycles = slices().matching("..inflearnthejavatest.(*)..")
            .should().beFreeOfCycles();

}
```

<br/>

## ArchUnit 클래스 의존성 확인하기

 - 클래스 의존성 테스트 예제
    - StudyController는 StudyService와 StudyRepository를 사용할 수 있다.
    - Study* 로 시작하는 클래스는 ..study.. 패키지에 있어야 한다.
    - StudyRepository는 StudyService와 StudyController를 사용할 수 없다.
```Java
@AnalyzeClasses(packagesOf = App.class)
public class ArchClassTests {

    // 이름이 Controller로 끝나는 클래스들은 
    // 이름이 Service로 끝나는 클래스들을 참조할 수 있다.
    // 또한, 이름이 Repository로 끝나는 클래스들을 참조할 수 있다.
    @ArchTest
    ArchRule controllerClassRule = classes().that().haveSimpleNameEndingWith("Controller")
            .should().accessClassesThat().haveSimpleNameEndingWith("Service")
            .orShould().accessClassesThat().haveSimpleNameEndingWith("Repository");

    // 이름이 Repository로 끝나는 클래스들은
    // 이름이 Service로 끝나는 클래스들을 참조할 수 없다.
    @ArchTest
    ArchRule repositoryClassRule = noClasses().that().haveSimpleNameEndingWith("Repository")
            .should().accessClassesThat().haveSimpleNameEndingWith("Service");

    // 이름이 Study로 시작하는 클래스들중에
    // Enum이 아니고, @Entity 어노테이션이 없는 클래스들은
    // study 패키지 안에 있어야 한다.
    @ArchTest
    ArchRule studyClassesRule = classes().that().haveSimpleNameStartingWith("Study")
            .and().areNotEnums()
            .and().areNotAnnotatedWith(Entity.class)
            .should().resideInAnyPackage("..study..");

}
```
