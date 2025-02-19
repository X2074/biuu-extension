
<template src="./index.html"></template>
<script lang="ts" >
export default {
  name: 'create'
};
</script>
<script lang="ts" setup>
import bus from '@/utils/bus.js';
const toCreate = (res: any) => {
  bus.emit('nextPage', res);
};
</script>
<style lang="scss">
@import './index.scss';
</style>