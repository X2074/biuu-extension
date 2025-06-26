<template>
    <div class="import-wallt">
        <div class="header flex">
            {{ step }}==step
            <img class="back-img" v-if="step >= 1" @click="changeStep" src="@/assets/images/icons/back.png" alt="" />
            <!-- <img class="close-img" @click="step = 0" src="@/assets/images/icons/close.png" alt="" /> -->
        </div>
        <setPsd v-if="step == 1" />
        <importPhrase v-if="step == 2" />
        <importPrivate v-if="step == 3" />
    </div>
</template>
<script lang="ts">
export default {
    name: 'importWallet'
};
</script>
<script lang="ts" setup>
import { ref } from 'vue';
import bus from '@/utils/bus.js';
import importPhrase from './importPhrase/index.vue';
import importPrivate from './importPrivate/index.vue';
import setPsd from './setPsd/index.vue';
import { useRouter } from 'vue-router';
let router = useRouter();
const step = ref(1);
bus.on('importWalletPage', (res: any) => {
    console.log(res, 'resresres');

    if (res == 'setPsd') step.value = 1;
    if (res == 'createMnemonic') step.value = 2;
    if (res == 'verifyMnemonic') step.value = 3;
    //     if (res == 'userContent') {
    //         window.location.href = 'userContentPage.html';
    //     };
    //     // if (res == 'buyPage') {
    //     //     window.location.href = 'userContentPage.html';
    //     // };
});
const changeStep = () => {
    step.value = step.value - 1;
    if (step.value == 0) {
        // router.push('/create');
        router.go(-1).catch(() => {
            router.push('/create'); // 回退失败时跳转到首页
        });
    }
};
</script>
<style lang="scss">
.import-wallt {
    width: 360px;
    padding: 18px 16px;
    position: absolute;
    bottom: 0;
    top: 60px;
    .header {
        align-items: center;
        justify-content: space-between;
        img {
            width: 24px;
            height: 24px;
            cursor: pointer;
        }
    }
    .title {
        font-size: 28px;
        font-weight: 600;
        line-height: 40px;
        color: #000;
    }

    .text {
        font-size: 14px;
        line-height: 22px;
    }
}
</style>
