<template>
    <div>
        <h1 @click="changeMessage">
            {{ msg }}
        </h1>
        <h1>{{ reversedMessage }}</h1>
    </div>
</template>

<script>
export default {
    data() {
        msg: 'Hello?'
    },
    computed: {
        reversedMessage() {
            return this.msg.split('').reverse().join('')
        }
    },
    watch: {
        // msg 데이터가 변경되는 것을 감시
        msg() {
            console.log('msg:', this.msg)
        },
        // 계산된 데이터도 감시 가능
        reversedMessage() {
            console.log('reversedMessage:', this.reversedMessage)
        }
    },
    methods: {
        changeMethod() {
            this.msg = 'Good!'
        }
    }
}
</script>