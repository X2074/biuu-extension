
<template src="./index.html"></template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
const googleId = ref('fkhnghcgmjcgeniccpjpmlfpgbibmmge')
import bus from '@/utils/bus';
const toCreate = (res) => {
    bus.emit('nextPage',res)
}
</script>
<style lang="scss">
@import "./index.scss";
</style>