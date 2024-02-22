<template>
	<div class="hash-content margin-auto" v-loading="loading">
		<div class="user-info">
			<p class="user-name">{{ walltContent.userName ? 'Account 1' : walltContent.userName }}</p>
			<div class="user-address mt-5 flex">
				<p class="mr-10">
					{{ walltContent.address ? walltContent.address.substr(0, 4) : '' }}...{{ walltContent.address ? walltContent.address.substr(-4) : '' }}
				</p>
				<i class="el-icon-copy-document" @click="onCopy"></i>
			</div>
			<div class="user-currency mt-30 flex">
				<img src="../../../assets/images/unitLogo.png" alt="">
				<p class="ml-10">{{ walltContent.balance }} {{ walltContent.balanceUnit }}</p>
			</div>
		</div>
		<div class="uesr-btn mt-30 flex">
			<p @click="toPage('buy')">
				<img src="../../../assets/images/buy.png" alt="">
			</p>
			<p class="ml-20 mr-20">
				<img src="../../../assets/images/swap.png" alt="">
			</p>
			<p>
				<img src="../../../assets/images/send.png" alt="">
			</p>
		</div>
		<!-- 转账记录 -->
		
		<div class="activity-list mt-30">
			<div class="pl-20 pr-10 flex" v-for="(item,index) in txHashList" :key="index">
				<div class="flex">
					<img v-if="(address!=item.to)" class="mr-10" src="../../../assets/images/homePage/to.png" alt="">
					<img v-else class="mr-10" src="../../../assets/images/homePage/from.jpg" alt="">
					<div>
						<p class="title">{{(address==item.to?'Receive':'Send')}}</p>
						<div class="time-address flex">
							<p class="date mr-5" v-if="item.time">{{item.time}}.</p>
							<p class="address">to: {{item.to.substr(0,4)}}...{{item.to.substr(-4)}}</p>
							
						</div>
					</div>
				</div>
				<div class="hkd">
					<p class="title">{{toWei(item.value)}}{{balanceUnit}}</p>
					<p class="text mt-5">HK$xxHKD</p>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="js" src="./index.js"></script>
<style lang="scss">
@import "./index.scss";
</style>
  