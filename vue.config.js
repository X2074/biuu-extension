const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path')

// 复制文件到指定目录
const copyFiles = [
	{
		from: path.resolve("src/plugins/manifest.json"),
		to: `${path.resolve("dist")}/manifest.json`
	},
	{
		from: path.resolve("src/assets"),
		to: path.resolve("dist/assets")
	},
	{
		from: path.resolve("src/plugins/inject.js"),
		to: path.resolve("dist/js")
	}
];

// 复制插件
const plugins = [
	new CopyWebpackPlugin({
		patterns: copyFiles
	})
];

// 页面文件
const pages = {};
// 配置 popup.html 页面
// ,"importMnemonicPage","userContentPage"
const chromeName = ["popup", "background","indexPage","creasteWalletPage"];

chromeName.forEach(name => {
	// 如果是background页面，路径特殊处理
	if(name.includes('Page')){
		pages[name] = {
			entry: `src/components/background/${name}/main.js`,
			template: `src/components/background/${name}/index.html`,
			filename: `${name}.html`
		};
	}else{
		pages[name] = {
			entry: `src/${name}/main.js`,
			template: `src/${name}/index.html`,
			filename: `${name}.html`
		};
	}
});

module.exports = {
	pages,
	productionSourceMap: false,
	// 配置 content.js background.js
	configureWebpack: {
		entry: {
			content: "./src/content/main.js",
			background: "./src/background/main.js"
		},
		output: {
			filename: "js/[name].js"
		},
		plugins,
		resolve: {
			extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
			alias: {
				'@': path.resolve(__dirname, 'src')
			},
		}
	},
	// 配置 content.css
	css: {
		extract: {
			filename: "css/[name].css"
		}
	},
	chainWebpack: config => {
		if (process.env.NODE_ENV === 'production') {
			config.output.filename('js/[name].js').end()
			config.output.chunkFilename('js/[name].js').end()
		}
	}
}