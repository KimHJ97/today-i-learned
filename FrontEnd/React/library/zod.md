# zod

 - https://zod.dev/
 - https://www.daleseo.com/zod-schema/
 - https://jjang-j.tistory.com/59
 - https://velog.io/@jinyoung985/TypeScript-zod-%EB%9D%BC%EC%9D%B4%EB%B8%8C%EB%9F%AC%EB%A6%AC%EB%9E%80


Zod는 TypeScript와 JavaScript에서 사용되는 정적 타입 선언 라이브러리입니다. 주로 데이터 검증 및 파싱에 사용되며, 개발자에게 안전하고 타입이 보장된 코드를 작성할 수 있도록 돕습니다.  
 - TypeScript 기반의 스키마(데이터 유형) 선언 및 유효성 검사 라이브러리
 - Zod의 목표는 유형 선언의 중복을 제거하는 것이며, Zod를 사용하면 한 번 유효성 검사기를 선언하고 Zod가 정적 TypeScript 유형을 자동으로 추론한다.


## 사용 방법

### 자료형

스키마 정의는 자료형을 명시하는 것부터 시작된다. Zod는 자바스크립트의 기본 자료형이나 Date와 같은 내장 클래스에 대응하는 검증자 함수를 제공한다.  

```javascript
import { z } from "zod";

const User = z.object({
  email: z.string(),
  age: z.number(),
  active: z.boolean(),
  createdAt: z.date(),
});

type User = z.infer<typeof User>;
//   ^? { email: string; image: string; ips: string[]; createdAt: Date; }
```

### 필수/선택

Zod 스키마에 포함된 모든 속성은 기본적으로 필수 입력이다. optional() 검증자를 사용하면 필수 입력을 선택 입력으로 바꿀 수 있다.  
```javascript
import { z } from "zod";

const User = z.object({
  email: z.string(),
  age: z.number(),
  active: z.boolean().optional(), // 속성 뒤에 ?를 붙이고 타입을 booleean 또는 undefined로 선언한 것과 마찬가지
});

type User = z.infer<typeof User>;
//   ^? { email: string; age: number; active?: boolean | undefined; }

// 검증
// ✅ true
User.parse({
  email: "user@test.com",
  age: 35,
  active: true,
});

// ✅ undefined
User.parse({
  email: "user@test.com",
  age: 35,
  active: undefined,
});

// ✅ 누락
User.parse({
  email: "user@test.com",
  age: 35,
});
```

### 기본값

유효성 검증 과정에서 값이 누락되어 있는 경우 속성에 기본값을 주고 싶을 때 default() 검증자를 사용할 수 있다.  

```javascript
import { z } from "zod";

const User = z.object({
  email: z.string(),
  age: z.number(),
  active: z.boolean().default(false), // 값이 없으면 false가 정의된다.
});

const user = User.parse({
  email: "user@test.com",
  age: 35,
});

console.log(user); // active: false
```

### 배열(Array)

Zod로 배열 스키마를 정의할 때 2가지 문법이 제공된다.  
 - 타입을 명시하고 array() 검증자를 이용하거나, z.string() 안에 타입을 인자로 넘길 수 있다.
```javascript
import { z } from "zod";

const IPs = z.string().array(); // 첫 번째 방법
const IPs = z.array(z.string()); // 두 번째 방법

type IPs = z.infer<typeof IPs>;
//   ^? type IPs = string[]
```

### 객체(Object)

타입스크립트에 Record 유틸리티 타입이 있는 것처럼 Zod에도 z.record() 검증자가 있다. z.record()를 사용하면 키 이름에는 구애받지 않고 값만 타입을 제한할 수 있다.  

```javascript
const Numbers = z.record(z.number());

Prices.parse({ A: 1, B: 2 }); // ✅
Prices.parse({ C: 1, D: "2" }); // ❌ Expected number, received string

type Numbers = z.infer<typeof Numbers>;
//   ^? type Numbers = { [x: string]: number; }
```

### 이넘(Enum)

```javascript
import { z } from "zod";

const Level = z.enum(["GOLD", "SILVER", "BRONZE"]);

Level.parse("GOLD"); // ✅
Level.parse("SILVER"); // ✅
Level.parse("BRONZE"); // ✅

Level.parse("PLATINUM"); // ❌ Expected 'GOLD' | 'SILVER' | 'BRONZE', received 'PLATINUM'

type Level = z.infer<typeof Level>;
//   ^? type Level = "GOLD" | "SILVER" | "BRONZE"
```

### 고정값

```javascript
import { z } from "zod";

const GoldUser = z.object({
  email: z.string().email(),
  level: z.literal("GOLD"),
});

GoldUser.parse({ email: "test@user.com", level: "GOLD" }); // ✅
GoldUser.parse({ email: "test@user.com", level: "SILVER" }); // ❌ Invalid literal value, expected "GOLD"

type GoldUser = z.infer<typeof GoldUser>;
//   ^? type GoldUser = { email: string; level: "GOLD"; }
```

### 문자열 포맷

Zod는 문자열에 특화된 검증자를 제공한다.  

```javascript
import { z } from "zod";

const User = z.object({
  email: z.string().email(),
  image: z.string().url(),
  ips: z.string().ip().array(),
});

type User = z.infer<typeof User>;
//   ^? { email: string; image: string; ips: string[]; }
```


### 간단한 사용 예시

 - parse 혹은 safeParse로 내용을 검증할 수 있다.
    - parse 수행시 검증에 실패하면 Error를 발생한다.
    - safeParse 수행시 검증에 실패하면 Boolean 자료형을 반환한다.
```javascript
import { z } from 'zod';

// 단순한 자료형
const mySchema = z.string();

mySchema.parse('hello');
mySchema.safeParse('hello');

// 복합 자료형
const userSchema = z.object({
    username: z.string(),
    age: z.number().min(18),
});

const result = userSchema.safeParse({
  name: "John Doe",
  age: 20,
});

if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.log("Invalid data:", result.error);
}
```

### 실전 예제

```javascript
const User = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  age: z.number().int().min(18).max(80),
  level: z.enum(["GOLD", "SILVER", "BRONZE"]),
  image: z.string().url().min(1).max(200).optional(),
  ips: z.string().ip().array().optional(),
  active: z.boolean().default(false),
  createdAt: z.date().default(new Date()),
});
```
