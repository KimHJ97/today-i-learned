<template>
    <div>
        <button @click="handler">
            Click me!
        </button>
        <h1 v-if="isShow">
            Hello World! v-if
        </h1>
        <h1 v-else-if="count > 3">
            Count > 3
        </h1>
        <h1 v-else>
            Hello World! v-else
        </h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isShow: true,
            count: 0
        }
    },
    methods: {
        handler() {
            this.isShow = !this.isShow
            this.count += 1
        }
    }
}
</script>