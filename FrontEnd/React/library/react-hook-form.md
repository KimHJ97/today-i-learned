# react-hook-form

 - https://velog.io/@boyeon_jeong/React-Hook-Form

<br/>

react-hook-form은 React 애플리케이션에서 폼 관리를 쉽게 할 수 있도록 도와주는 인기 있는 라이브러리입니다. 이 라이브러리는 폼 상태를 관리하고, 검증, 서브미션, 에러 처리 등을 간편하게 처리할 수 있도록 도와줍니다.  

 - NPM 주소: https://www.npmjs.com/package/react-hook-form
 - 간단한 API: react-hook-form의 API는 간결하고 사용하기 쉬워, 코드의 복잡성을 줄일 수 있습니다. register, handleSubmit, watch, reset 등의 함수가 있으며, 각각 폼의 필드 등록, 폼 제출 핸들링, 값 감시, 초기화 등을 담당합니다.
 - 퍼포먼스 최적화: react-hook-form은 폼 상태를 효율적으로 관리하여 리렌더링을 최소화합니다. 이는 특히 많은 필드를 가진 대형 폼에서 성능을 크게 향상시킵니다.
 - 유연한 검증: 내장된 검증 기능을 사용하거나, 외부 라이브러리(예: Yup)를 사용하여 커스텀 검증 로직을 쉽게 적용할 수 있습니다. 검증은 각 필드별로 설정할 수 있으며, 비동기 검증도 지원합니다.
 - 컨트롤 컴포넌트와의 호환성: react-hook-form은 input, select 같은 기본 HTML 요소뿐만 아니라, Material-UI, Ant Design과 같은 UI 라이브러리의 커스텀 컴포넌트와도 쉽게 통합됩니다.
 - 타입스크립트 지원: react-hook-form은 TypeScript와 완벽하게 호환됩니다. TypeScript를 사용하면 폼 데이터의 타입을 명확하게 정의할 수 있어, 코드 작성 시 더 안전하고 예측 가능하게 됩니다.

## 기본 사용 예시

 - register 함수를 사용해 firstName과 age 필드를 등록하고, 폼 제출 시 handleSubmit을 통해 onSubmit 함수를 호출합니다. 또한, errors 객체를 사용해 필드별 에러를 쉽게 처리할 수 있습니다.
```javascript
import React from 'react';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const onSubmit = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName', { required: true })} placeholder="First Name" />
      {errors.firstName && <span>This field is required</span>}

      <input {...register('age', { required: true, pattern: /^[0-9]+$/i })} placeholder="Age" />
      {errors.age && <span>Age is required and must be a number</span>}

      <input type="submit" />
    </form>
  );
}
```

### useForm 훅

useForm() 훅은 react-hook-form에서 폼 관리를 위해 사용하는 주요 훅으로, 다양한 기능을 가진 객체를 반환합니다.  

 - register: 폼 필드를 react-hook-form에 등록하는 데 사용됩니다. 이 함수는 필드의 이름과 옵션을 인자로 받아, 폼 필드를 등록하고 검증 규칙을 설정할 수 있습니다.
```javascript
const { register } = useForm();
<input {...register('firstName')} />
```

 - handleSubmit: 폼 제출 시 호출할 함수를 감싸는 함수입니다. 폼이 유효성 검사를 통과하면 인자로 전달된 함수가 호출됩니다.
```javascript
const { handleSubmit } = useForm();
<form onSubmit={handleSubmit(onSubmit)} />
```

 - watch: 특정 폼 필드의 값을 관찰하고, 그 값이 변경될 때마다 실시간으로 반영할 수 있습니다. 인자로 필드의 이름을 받으며, 필드 이름이 없을 경우 전체 폼의 값을 반환합니다.
```javascript
const { watch } = useForm();
const firstName = watch('firstName');

```

 - formState: 폼의 상태와 관련된 정보를 담고 있는 객체입니다. 이 객체는 다음과 같은 속성들을 포함합니다:
    - errors: 각 필드별 에러 정보를 담고 있습니다.
    - isDirty: 폼의 값이 초기값과 달라졌는지 여부를 나타냅니다.
    - isSubmitting: 폼이 제출 중인 상태인지 여부를 나타냅니다.
    - isValid: 폼의 모든 필드가 유효한지 여부를 나타냅니다.
```javascript
const { formState: { errors, isSubmitting, isValid } } = useForm();
```

 - reset: 폼의 상태를 초기화하는 함수입니다. 인자로 초기값을 전달할 수 있습니다.
```javascript
const { reset } = useForm();
reset();
```

 - setValue: 특정 필드의 값을 설정하는 함수입니다. 필드의 이름과 값을 인자로 받습니다.
```javascript
const { setValue } = useForm();
setValue('firstName', 'John');
```

 - getValues: 특정 필드의 값을 가져오는 함수입니다. 인자로 필드의 이름을 받을 수 있으며, 이름이 없을 경우 전체 폼 데이터를 반환합니다.
```javascript
const { getValues } = useForm();
const values = getValues();
```

 - trigger: 특정 필드 또는 전체 폼의 검증(validation)을 수동으로 트리거할 수 있는 함수입니다.
```javascript
const { trigger } = useForm();
trigger('firstName');
```

 - setError: 특정 필드에 에러 상태를 수동으로 설정하는 함수입니다.
```javascript
const { setError } = useForm();
setError('firstName', { type: 'manual', message: 'This field is required' });
```

### 기본 개념 정리

useForm 훅을 사용하여 폼 인스턴스를 생성한다. register 함수를 사용하여 각 입력 필드를 등록하고, 유효성 검사 규칙을 설정한다. handleSubmit 함수를 사용하여 폼 제출 시 실행할 함수를 정의하고, onSubmit 함수를 해당 함수로 전달한다.  

입력 필드에 대한 유효성 검사 규칙은 register 함수의 인자로 전달된다. 예시에서는 각 필드가 필수(required) 인지를 검사하도록 설정한다. 유효성 검사 실패 시 errors 객체에 해당 필드의 에러 메시지가 포함되며, 이를 활용하여 에러 메시지를 표시할 수 있다.  

폼 제출 시 onSubmit 함수가 실행되며, 해당 함수에서는 제출할 데이터를 처리하거나 API 호출 등의 로직을 작성할 수 있다.  

```javascript
import React from 'react';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" name="firstName" ref={register({ required: true })} />
      {errors.firstName && <span>First name is required.</span>}

      <input type="text" name="lastName" ref={register({ required: true })} />
      {errors.lastName && <span>Last name is required.</span>}

      <button type="submit">Submit</button>
    </form>
  );
}

export default MyForm;
```

 - `예제 코드`
```javascript
import { useForm } from "react-hook-form";

export default function App() {
  const { register, handleSubmit } = useForm();
  const onSubmit = data => console.log(data);
   
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("firstName", { required: true, maxLength: 20 })} />
      <input {...register("lastName", { pattern: /^[A-Za-z]+$/i })} />
      <input type="number" {...register("age", { min: 18, max: 99 })} />
      <input type="submit" />
    </form>
  );
}
```

### Controller 컴포넌트

Controller는 react-hook-form에서 제공하는 컴포넌트로, 서드파티 UI 라이브러리의 폼 컴포넌트나 React에서 직접 제어하기 어려운 커스텀 컴포넌트를 쉽게 사용할 수 있도록 도와줍니다. Controller를 사용하면 render 함수나 render prop을 통해 해당 컴포넌트를 react-hook-form의 폼 상태와 연결할 수 있습니다.  

 - name: 폼 필드의 이름입니다. react-hook-form에서 해당 필드를 참조할 때 사용됩니다.
 - control: useForm 훅에서 가져오는 control 객체입니다. 폼 상태와 제어를 위한 객체로, Controller가 이 객체와 상호작용하여 폼 상태를 관리합니다.
 - defaultValue: 폼 필드의 초기 값입니다. 폼이 렌더링될 때 해당 필드에 설정되는 기본 값입니다.
 - render: 렌더링할 컴포넌트를 정의하는 함수입니다. 이 함수는 field 객체를 인자로 받으며, 이 field 객체를 해당 컴포넌트에 연결하여 사용합니다.
 - rules: 폼 필드에 대한 유효성 검사 규칙을 정의하는 속성입니다. 이 속성을 통해 특정 폼 필드가 충족해야 하는 다양한 조건을 설정할 수 있으며, 폼 제출 전에 이러한 조건들이 제대로 충족되었는지를 확인할 수 있습니다.
    - required: 필수 입력 여부를 지정합니다. 이 규칙을 설정하면 해당 필드가 비어 있을 때 유효성 검사에 실패합니다.
    - min: 숫자 필드의 최소값을 지정합니다. 입력 값이 이 값보다 작으면 유효성 검사에 실패합니다.
    - max: 숫자 필드의 최대값을 지정합니다. 입력 값이 이 값보다 크면 유효성 검사에 실패합니다.
    - minLength: 문자열 필드의 최소 길이를 지정합니다. 입력된 문자열의 길이가 이 값보다 짧으면 유효성 검사에 실패합니다.
    - maxLength: 문자열 필드의 최대 길이를 지정합니다. 입력된 문자열의 길이가 이 값보다 길면 유효성 검사에 실패합니다.
    - pattern: 정규 표현식을 사용하여 입력 값의 패턴을 지정합니다. 입력 값이 이 패턴과 일치하지 않으면 유효성 검사에 실패합니다.
    - validate: 커스텀 유효성 검사를 위한 함수 또는 객체를 지정합니다. 함수를 사용하면 복잡한 유효성 검사 로직을 구현할 수 있습니다.

```javascript
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import TextField from '@material-ui/core/TextField';

function MyForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = data => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="username"
        control={control}
        defaultValue=""
        rules={{
          required: 'Username is required',
          minLength: { value: 5, message: 'Minimum length is 5 characters' },
          maxLength: { value: 20, message: 'Maximum length is 20 characters' }
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label="Username"
            error={!!errors.username}
            helperText={errors.username ? errors.username.message : ''}
          />
        )}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default MyForm;
```

 - `rule을 미리 선언 후 사용`
```javascript
const emailRules = {
  required: 'Email ID를 입력해주세요',
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: '올바른 이메일 형식이 아닙니다.',
  },
  minLength: {
    value: 6,
    message: '이메일은 최소 6자 이상이어야 합니다.',
  },
};

const numberRules = {
  required: 'Number is required',
  valueAsNumber: true,
  validate: {
    positive: (value: number) => value > 0 || '반드시 양수여야 합니다.',
    max: (value: number) => value <= 100 || '100까지 입력할 수 있습니다.',
  },
};

return(
  <Controller
  name="email"
  control={control}
  defaultValue={''}
  rules={emailRules}
/>
);
```

### Controller와 yup 함께 사용

 - yum 설치
```bash
yarn add @hookform/resolvers yup
```

 - 스키마 정의
```javascript
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email ID is required')
    .email('Invalid email address')
    .min(6, 'Email must be at least 6 characters'),
  age: yup
    .number()
    .required('Age is required')
    .positive('Age must be a positive number')
    .max(100, 'Age must be less than or equal to 100'),
  price: yup
    .number()
    .required('Price is required')
    .typeError('Price must be a number')
    .positive('Price must be a positive number'),
});
```

 - useForm 사용시 옵션 설정
```javascript
import { yupResolver } from '@hookform/resolvers/yup';

const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
});
```
