<template>
    <div>
        <h1 
            v-once
            @click="add">
            {{ msg }}
        </h1>
        <h1 v-html="msg"></h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            msg: '<div style="color: red;">Hello!!</div>'
        }
    },
    methods: {
        add() {
            this.msg += '!'
        }
    }
}
</script>