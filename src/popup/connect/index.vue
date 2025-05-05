<style lang="scss" scoped>
@import './index.scss';
</style>
<template src="./index.html">

</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import indexDbData from '../../utils/indexDB';
let authorization:any = ref(null);
onMounted(async()=>{
    authorization.value = await indexDbData.getData('authorization');
})

const reject = ()=>{
    let data: any = { action: 'authorization_response', approved: false };
    chrome.runtime.sendMessage(data, (response: any) => {
        window.close();
    });

}
const approve = ()=>{
    let data: any = { action: 'authorization_response', approved: true };
    chrome.runtime.sendMessage(data, (response: any) => {
        window.close();
    });
}
</script>