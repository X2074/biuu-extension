<template>
	<div class="private-keys">
        <i @click="closeModal" class="el-icon-close"></i>
		<div class="account-info">
			<!-- 需要判断用户选择的是那个头像 -->
			<img src="images/user.png" alt="">
			<div class="account-name mt-10 flex">
				<p class="mr-15">{{userName?userName:'Account 1'}}</p>
			</div>
		</div>
		<div class="copy-address mt-15">
			<p>{{address}}</p>
		</div>
		<p class="show-key mt-30">Show Private Keys</p>
		<p class="spotPay-password mt-10">Type your SpotPay password</p>
		<div class="key-pass" v-if="privateKeyBol">
			<el-input class="password-input mt-10" :class="incorrect?'error-input':''" v-model="passwordValue" :type="'password'" placeholder=""></el-input>
			<p class="password-error">{{incorrect?'Incorrect Password.':''}}</p>
			<p class="warning mt-5">Warning: Never disclose this key. Anyone with your private keys can steal any assets held in your account.</p>
			<div class="private-btn mt-15 flex">
				<p class="cancel" @click="closeModal">Cancel</p>
				<p class="confirm" @click="confirm">Confirm</p>
			</div>
		</div>
		
		<div class="key-show" v-if="!privateKeyBol">
			<div class="copy-key mt-15" @click="onCopy">
				<p>{{privateKey.privateKey}}</p>
			</div>
			<p class="warning mt-10">Warning: Never disclose this key. Anyone with your private keys can steal any assets held in your account.</p>
			<p class="key-btn mt-15" @click="closeModal">Done</p>
		</div>
	</div>
</template>
<script lang="js" src="./index.js"></script>
<style lang="scss">
@import "./index.scss";
</style>
  