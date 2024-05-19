# 입문자를 위한 LangChain 기초

 - 인프런 주소: https://www.inflearn.com/course/입문자를위한-랭체인-기초/dashboard
 - 실습 파일: https://github.com/tsdata/langchain-study

<br/>

## 개발 환경

 - 파이썬 3.11
 - LangChain: 0.1.10
 - OepnAI: GPT-3.5-turbo-0125
 - 코드 에디터: 구글 코랩

<br/>

## 1. 체인에 대한 이해: 기본 LLM 체인과 멀티 체인

기본 체인(Prompt + LLM)은 LLM 기반 애플리케이션 개발에서 핵심적인 개념 중 하나로, 사용자의 입력(프롬프트)을 받아 LLM을 통해 적절한 응답이나 결과를 생성하는 구조를 말한다.  

<br/>

### 1-1. 기본 체인의 구성 요소

 - __프롬프트(Prompt)__
    - 사용자 또는 시스템에서 제공하는 입력으로, LLM에게 특정 작업을 수행하도록 요청하는 지시문
    - 프롬프트는 질문, 명령, 문장 시작 부분 등 다양한 형태를 취할 수 있으며, LLM의 응답을 유도하는 데 중요한 역할을 한다.
 - __LLM(Large Language Model)__
    - GPT, Gemini 등 대규모 언어 모델로, 대량의 텍스트 데이터에서 학습하여 언어를 이해하고 생성할 수 있는 인공지능 시스템
    - LLM은 프롬프트를 바탕으로 적절한 응답을 생성하거나, 주어진 작업을 수행하는 데 사용된다.

<br/>

### 1-2. 일반적인 작동 방식

 - __프롬프트 생성__
    - 애플리케이션은 사용자의 요구 사항이나 특정 작업을 정의하는 프롬프트를 생성한다.
 - __LLM 처리__
    - LLM은 제공된 프롬프트를 분석하고, 학습된 지식을 바탕으로 적절한 응답을 생성한다.
 - __응답 반환__
    - LLM에 의해 생성된 응답은 애플리케이션으로 반환되며, 최종 사용자에게 제공된다.

<br/>

### 실습: 환경 구성

 - `라이브러리 설치`
```sh
!pip install -q langchain langchain-openai tiktoken
```
<br/>

 - `OpenAI 인증키 설정`
    - 인증키를 환경 변수로 등록한다.
```python
import os
os.environ['OPENAI_API_KEY'] = 'OPENAI_API_KEY'
```
<br/>

### 실습: LLM Chain

 - `단순 질문`
```python
from langchain_openai import ChatOpenAI

# model
llm = ChatOpenAI(model="gpt-3.5-turbo-0125")

# chain 실행
result = llm.invoke("지구의 자전 주기는?") # 실행마다 답변이 달라진다.
print(result.content)
```
<br/>

 - `LLM 역할 부여`
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# prompt + model + output parser
prompt = ChatPromptTemplate.from_template("You are an expert in astronomy. Answer the question. : {input}")
llm = ChatOpenAI(model="gpt-3.5-turbo-0125")
output_parser = StrOutputParser()

# LCEL chaining
chain = prompt | llm | output_parser

# chain 호출
chain.invoke({"input": "지구의 자전 주기는?"})
```

<br/>

### 1-3. 멀티 체인

여러 개의 체인을 연결하거나 복합적으로 작용하는 것은 멀티 체인 구조를 통해 이루어진다. 이러한 구조는 각기 다른 목적을 가진 여러 체인을 조합하여, 입력 데이터를 다양한 방식으로 처리하고 최종적인 결과를 도출할 수 있도록 한다.  

<br/>

### 실습: Multi Chain

```python
prompt1 = ChatPromptTemplate.from_template("translates {korean_word} to English.")
prompt2 = ChatPromptTemplate.from_template(
    "explain {english_word} using oxford dictionary to me in Korean."
)

llm = ChatOpenAI(model="gpt-3.5-turbo-0125")

chain1 = prompt1 | llm | StrOutputParser()

chain1.invoke({"korean_word":"미래"})

# 2번째 체인
chain2 = (
    {"english_word": chain1}
    | prompt2
    | llm
    | StrOutputParser()
)

chain2.invoke({"korean_word":"미래"})
```
