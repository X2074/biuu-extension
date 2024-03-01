<template>
    <div class="prompt-tips pl-10 pr-10 flex" v-if="promptBol">
		<img v-if="promptStatus == 'err'" class="prompt-status" src="@/assets/images/tips/err.png" alt="">
		<img v-if="promptStatus == 'warn'" class="prompt-status" src="@/assets/images/tips/warn.png" alt="">
		<img v-if="promptStatus == 'success'" class="prompt-status" src="@/assets/images/tips/success.png" alt="">
		<img v-if="promptStatus == 'loading'" class="prompt-status loading" src="@/assets/images/tips/loading.png" alt="">
        <p class="ml-5">{{tipsTxt}}</p>
        <!-- <img class="prompt-close" @click.self="promptBol = false" src="@/assets/images/icons/close.png" alt=""> -->
    </div>
</template>

<script setup>
import { ref, watch, onMounted,nextTick } from 'vue';
import bus from '@/utils/bus.js';
let promptBol = ref(false);
let tipsTxt = ref('')
let promptStatus = ref('warn')
bus.on('promptModalSuccess',res=>{
    promptBol.value = false;
    tipsTxt.value = res;
    initialize('success')
})
bus.on('promptModalErr',res=>{
    promptBol.value = false;
    tipsTxt.value = res;
    initialize('err')
})
bus.on('promptModalWarn',res=>{
    promptBol.value = false;
    tipsTxt.value = res;
    initialize('warn')
})
bus.on('promptModalLoading',res=>{
    promptBol.value = false;
    tipsTxt.value = res;
    initialize('loading')
})

const initialize = (type)=>{
    nextTick(()=>{
        promptBol.value = true;
        promptStatus.value = type;
        setTimeout(() => {
            promptBol.value = false;
        }, 3000);
    })
}
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
    