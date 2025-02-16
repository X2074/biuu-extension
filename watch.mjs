// 导入必要的模块
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录的路径
const __dirname = dirname(__filename);

// 解析 Vite 二进制文件的路径
const VITE_BIN_PATH = path.resolve(__dirname, 'node_modules/.bin/vite');

// 启动 nodemon 监视 manifest.json 文件的变化，并在变化时执行 Vite 构建
const watcher = spawn('nodemon', ['--watch', 'manifest.json', '--exec', VITE_BIN_PATH, 'build'], {
  stdio: 'inherit',
});
// 当 nodemon 进程退出时，退出整个 Node.js 进程
watcher.on('exit', (code) => {
  process.exit(code);
})