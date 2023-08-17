<template>
	<div class="sites-page">
        <i @click="closeModal" class="el-icon-close"></i>
		<!-- 展示链接网站 -->
		<div class="">
			<p class="sites-title ml-15">Connected sites</p>
			<p class="sites-text mt-5 ml-15 mr-30">Account 1 is connected to these sites. They can view your account address.</p>
			<div class="url-list mt-10">
				<div class="flex pl-15 pr-15">
					<img src="images/homePage/zhanweifu.png" alt="">
					<p>astellite.money</p>
					<!-- 断开连接 -->
					<button>Broken link</button>
				</div>
			</div>
			<!-- 新增网站 -->
			<div class="sites-footer">Manually connect to current site</div>
		</div>
		<!-- 要删除的网页 -->
		<div>
			<p class="sites-title ml-15">Disconnect :</p>
			<p class="sites-url ml-15">https://lanhuapp.com</p>
			<p class="sites-text mt-20 ml-15 mr-15">Are you sure you want to diconnect? You may lose site functionalinty.</p>
			<div class="btn-list mt-20 pt-15 pb-20 pl-30 pr-30 flex">
				<p class="cancel">Cancel</p>
				<p class="disconnect">Disconnect</p>
			</div>
		</div>
	</div>
</template>
<script lang="js" src="./index.js"></script>
<style lang="scss">
@import "./index.scss";
</style>
  