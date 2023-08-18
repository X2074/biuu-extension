<template>
    <div class="new-mnemonic margin-auto" v-loading="loading">
        <img class="return-img" @click="onPage" src="images/return.png" alt="">
        <p class="mnemonic-title">Import wallet using account mnemonic</p>
        <p class="mnemonic-text">Only the first account on this wallet will be loaded automatically. After completing this process, to add additional accounts, click the drop-down menu and select Create Account.</p>
        <div class="title-select flex">
            <p>Mnemonic</p>
        </div>
        <div class="mnemonic-tips flex">
            <i class="el-icon-warning"></i>
            <p>You can paste the whole mnemonic into any field.</p>
        </div>
        <div class="mnemonic-input flex" v-if="(mnemonicList && mnemonicList.length)">
            <div class="input-list" v-for="item in mnemonicList" :key="item.id" :class="item.class?'bgc':''">
                <p>{{item.id}}.</p>
                <input @paste="pasteFun" :type="item.yn=='y'?'text':'password'" v-model="item.mnemonic" maxlength="15">
                <img :class="item.yn=='y'?'none':'show'" :src="'images/'+(item.yn=='y'?'none':'show')+'.png'" @click="item.yn=='y'?(item.yn='n'):(item.yn='y')" alt="">
            </div>
        </div>
        <div class="set-password flex">
            <div class="new">
                <p>New password (minimum 8 characters)</p>
                <input class="mt-10" type="password" maxlength="16" v-model="newPsd">
                <span v-if="newPsdBol">Please enter a minimum 8-digit passcode</span>
            </div>
            <div class="confirm">
                <p>Confirm password</p>
                <input class="mt-10" type="password" maxlength="16" v-model="confirmPsd">
                <span v-if="confirmPsdBol">The passwords entered are inconsistent</span>
            </div>
        </div>
        <div class="import flex">
            <div class="flex">
                <img :src="'images/'+(useCheck=='y'?'check':'uncheck')+'.png'" alt="">
                <p class="flex"> I have read and agree to the terms of <a href="">use</a></p>
            </div>
            <button @click="creatKeyStory">import</button>
        </div>
    </div>
  </template>
  <script lang="js" src="./index.js"></script>
  <style lang="scss">
  @import "./index.scss";
  </style>
  