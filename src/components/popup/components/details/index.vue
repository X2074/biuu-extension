<template>
	<div class="more-account">
		<i @click="closeModal" class="el-icon-close"></i>
		<div class="account-info">
			<!-- 需要判断用户选择的是那个头像 -->
			<img src="images/user.png" alt="">
			<div class="account-name mt-10 flex">
				<p class="mr-15">{{ userName ? userName : 'Account 1' }}</p>
				<i class="el-icon-edit"></i>
			</div>
			<div class="qrcode mt-10" ref="qrCodeUrl"></div>
		</div>
		<div class="copy-address mt-15">
			<p>{{ address }}</p>
			<i class="el-icon-copy-document" @click="onCopy"></i>
		</div>
		<p class="account-btn mt-45" @click="openAteonscan">View on QITMEER</p>
		<p class="account-btn mt-15" @click="openModal('private')">Export private key</p>
	</div>
</template>
<script lang="js" src="./index.js"></script>
<style lang="scss">
@import "./index.scss";
</style>
  