<template>
    <h1>{{ count }}</h1>
</template>

<script>
export default {
    data() {
        return {
            count: 1
        }
    },
    beforeCreate() {
        // 인스턴스가 생성되기전
        console.log('Before Create!', this.count) // count: undefined
    },
    created() {
        // ✔ 인스턴스가 생성될 때
        console.log('Created!', this.count) // count: 1
    },
    beforeMount() {
        // 화면 렌더링 이전
        console.log('Before Mount!')
        console.log(document.querySelector('h1')) // DOM 요소를 찾을 수 없음
    },
    mounted() {
        // ✔ 화면 렌더링 이후
        console.log('Mounted!')
        console.log(document.querySelector('h1')) // DOM 요소를 찾을 수 있음
    }
}
</script>
