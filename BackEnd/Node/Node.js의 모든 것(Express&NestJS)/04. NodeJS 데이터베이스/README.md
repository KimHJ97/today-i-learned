# NodeJS 데이터베이스

## 데이터베이스

데이터베이스(영어: database, DB)는 여러 사람이 공유하여 사용할 목적으로 체계화해 통합, 관리하는 데이터의 집합이다. 작성된 목록으로써 여러 응용 시스템들의 통합된 정보들을 저장하여 운영할 수 있는 공용 데이터들의 묶음이다. 데이터베이스에 속해있는 모델은 다양하다.  
 - __데이터베이스 장점__
    - 데이터 중복 최소화 
    - 데이터 공유 
    - 일관성, 무결성, 보안성 유지 
    - 최신의 데이터 유지 
    - 데이터의 표준화 가능 
    - 데이터의 논리적, 물리적 독립성 
    - 용이한 데이터 접근 
    - 데이터 저장 공간 절약
 - __데이터베이스 단점__
    - 데이터베이스 전문가 필요
    - 많은 비용 부담 
    - 데이터 백업과 복구가 어려움 
    - 시스템의 복잡함
    - 대용량 디스크로 액세스가 집중되면 과부하 발생
 - __DBMS__
    - 데이터베이스는 데이터의 집합이며, DBMS는 데이터베이스를 관리하고 운영하는 소프트웨어입니다. 이 소프트웨어를 이용해서 데이터를 저장하고 검색하는 기능등을 제공합니다. 
    - DBMS는 계층형, 네트워크형, 관계형, 객체형등이 있습니다. 
    - 그 중에서 현재는 관계형(RDBMS, Relational DBMS)를 주로 사용하고 있습니다. 
    - 대표적인 RDBMS에는 Oracle, MySQL, PostgrSQL 등이 있습니다.

<br/>

### SQL과 NoSQL

SQL은 관계형 데이터베이스(RDBMS)에서 사용하는 언어이며, 데이터에 접근하며 데이터를 컨트롤하게 해줍니다. 시퀄(Sequel) 또는 에스큐엘로 발음 할 수 있습니다. 
SQL은 언어이지만 표준이기도 하며 대부분의 RDBMS에서 (Oracle, Mysql, SQL server 등등...) SQL 표준을 준수하고 있습니다.  

NoSQL Database는 단어 뜻 그 자체를 따지자면 "Not only SQL"로, SQL만을 사용하지 않는 데이터베이스 관리 시스템(DBMS)을 지칭하는 단어이다. 관계형 데이터베이스를 사용하지 않는다는 의미가 아닌, 여러 유형의 데이터베이스를 사용하는 것이다.  

 - __ACID 모델__
    - __ACID 모델의 주요 특징은 일관성입니다. 거래를 완료하면 데이터가 일관되고 안정적입니다.__
    - Atomic: 트랜잭션의 모든 작업이 성공하거나 모든 작업이 롤백됩니다. 부분적인 성공은 허용되지 않습니다.
    - Consistency(일관성): 각 트랜잭션은 데이터베이스를 하나의 유효한 상태에서 다른 상태로 이동합니다. 트랜잭션은 데이터베이스를 일관성 없는 상태로 둘 수 없습니다.
    - Isolation(격리): 트랜잭션이 서로 간섭할 수 없습니다.
    - Durability(지속성): 트랜잭션 적용 결과는 실패가 있더라도 영구적입니다.
 - __BASE 모델__
    - __BASE 모델을 사용하는 데이터베이스는 복제된 데이터의 일관성보다 가용성을 선호합니다.__
    - Basically Available: 모든 사용자가 쿼리를 수행할 수 있습니다. 데이터베이스는 여러 시스템에 데이터를 분산하므로 데이터 세그먼트에 오류가 발생하는 경우 데이터베이스가 완전히 중단되지 않습니다.
    - Soft State: 데이터베이스 상태는 시간이 지남에 따라 변경될 수 있습니다.
    - Eventually Consistent: 시스템이 작동하고 충분히 오래 기다리면 데이터베이스가 결국 일관성을 갖게 됩니다.

<br/>

