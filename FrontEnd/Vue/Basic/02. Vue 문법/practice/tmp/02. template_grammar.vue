<template>
    <h1 @click="add">
        {{ msg }}
    </h1>
</template>

<script>
export default {
    data() {
        return {
            msg: 'Hello world!'
        }
    },
    methods: {
        add() {
            this.msg += '!'
        }
    }
}
</script>