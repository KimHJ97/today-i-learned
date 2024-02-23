<template>
    <div>
        <button @click="add">
            ADD
        </button>
        <h1>{{ reversedMessage }}</h1>
        <h1>{{ reversedMessage }}</h1>
        <h1>{{ reversedMessage }}</h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // Getter, Setter 기능 수행
            msg: 'Hello Computed!'
        }
    },
    computed: {
        // 메서드처럼 만들긴 했지만, 계산된 하나의 메시지이다.
        // 계산된 데이터는 캐싱 기능으로 사용된다.
        // 즉, 첫 출력시에만 로직이 수행되고 이후에는 캐싱된 값을 사용한다.
        //reversedMessage() {
        //    return this.msg.split('').reverse().join('')
        //}

        reversedMessage: {
            get() {
                // reversedMessage의 값을 얻어내는 용도
                return this.msg.split('').reverse().join('')
            },
            set(newValue) {
                // reversedMessage의 값을 할당할 때 실행할 메서드
                this.msg = newValue
            }
        }
    },
    methods: {
        // 메서드를 사용할 때마다 로직이 수행된다.
        reverseMessage() {
            return this.msg.split('').reverse().join('')
        },
        add() {
            // 계산된 속성은 읽기 전용이라 변하지 않는다.
            // this.reversedMessage += '!?'

            this.reversedMessage += '!?'
        }
    }
}
</script>