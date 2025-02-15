<template src='./index.html'></template>  
<script type="text/ecmascript-6">
// 使用的时候 在容器上添加 div v-loading="true"即可实现loading效果 无需import
export default {
    name: "loading",
    data() {
        return {
            title: "",
        };
    },
    methods: {
        setTitle(title) {
            this.title = title;
        },
    },
};
</script>

<style scoped lang="scss">
@import "./index.scss";
</style>