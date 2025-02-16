import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import copy from 'rollup-plugin-copy'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'
// https://vitejs.dev/config/
export default defineConfig({
  // 设置项目根目录为'src/'
  root: 'src/',
  plugins: [
    // 使用Vue插件
    vue(),
    // 使用复制插件，将指定文件复制到构建输出目录
    copy({
      targets: [
        { src: 'manifest.json', dest: 'dist' },
        { src: 'src/content/content.js', dest: 'dist/content' },
        { src: "src/icons/**", dest: 'dist/icons' }
      ]
    }),
    // 使用Node标准库浏览器化插件
    nodePolyfills()
  ],
  resolve: {
    // 配置资源解析扩展名
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    // 配置路径别名，'@'指向'src'目录
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
  },
  build: {
    // 不使用代码压缩
    // minify: false,
    // 生成源码映射文件,方便控制台错误定位
    sourcemap: true,
    // 设置构建输出目录
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      // 配置多入口文件
      input: {
        popup: path.resolve(__dirname, 'src/popup/index.html'),
        indexPage: path.resolve(__dirname, 'src/components/indexPage/index.html'),
        // content: path.resolve(__dirname, 'src/content/content.js'),
        background: path.resolve(__dirname, 'src/background/service-worker.ts'),
      },
      // 配置构建输出选项
      output: {
        // 静态资源输出命名规则
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 代码分割中产生的 chunk 输出命名规则
        chunkFileNames: 'js/[name]-[hash].js',
        // 入口文件输出命名规则
        entryFileNames: (chunkInfo) => {
          const baseName = path.basename(chunkInfo.facadeModuleId, path.extname(chunkInfo.facadeModuleId))
          const saveArr = ['content', 'service-worker']
          return `[name]/${saveArr.includes(baseName) ? baseName : chunkInfo.name}.js`;
        },
        // 输出文件名
        name: '[name].js'
      }
    }
  },
})