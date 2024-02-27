<template>
    <div class="loading">
        <img src="@/assets/images/icons/loading.png" alt="">
        <p class="desc">{{title}}</p>
    </div>
  </template>
   
  <script type="text/ecmascript-6">
  // 使用的时候 在容器上添加 div v-loading="true"即可实现loading效果 无需import
  export default {
    name: 'loading',
    data() {
      return {
        title: ''
      }
    },
    methods: {
      setTitle(title) {
        this.title = title
      }
    }
  }
  </script>
   
  <style lang="scss" scoped>

.loading{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(2px);
	display: flex;
	justify-content: center;
	align-items: center;
    img{
        width: 40px;
        height: 40px;
        animation: rotateLoading 1s linear infinite;
    }
    .desc{
        text-align:center;
        font-size:16px;
        color:#000;
        margin-top:35px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%);
    }
}
  </style>