import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import copy from 'rollup-plugin-copy'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'
// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/',
  plugins: [
    vue(),
    copy({
      targets: [
        { src: 'manifest.json', dest: 'dist' },
        { src: 'src/content/content.js', dest: 'dist/content' },
        { src: "src/icons/**", dest: 'dist/icons' }
      ]
    }),
    nodePolyfills()
  ],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
  },
  build: {
    // minify: false,
    sourcemap: true,
    outDir: path.resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'src/popup/index.html'),
        indexPage: path.resolve(__dirname, 'src/components/indexPage/index.html'),
        // content: path.resolve(__dirname, 'src/content/content.js'),
        background: path.resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]', // 静态资源
        chunkFileNames: 'js/[name]-[hash].js', // 代码分割中产生的 chunk
        entryFileNames: (chunkInfo) => { // 入口文件
          const baseName = path.basename(chunkInfo.facadeModuleId, path.extname(chunkInfo.facadeModuleId))
          const saveArr = ['content', 'service-worker']
          return `[name]/${saveArr.includes(baseName) ? baseName : chunkInfo.name}.js`;
        },
        name: '[name].js'
      }
    }
  },
})
