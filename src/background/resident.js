/**
 * 跟踪 Service Worker 上次处于活动状态的时间并扩展 Service Worker
 * 通过每 20 秒将当前时间写入扩展存储来延长生存期。
 * 您仍应为意外终止做好准备 - 例如，如果
 * 扩展进程崩溃或您的扩展被手动停止
 * chrome://serviceworker-internals。
 */
let heartbeatInterval;

async function runHeartbeat() {
    await chrome.storage.local.set({ 'last-heartbeat': new Date().getTime() });
}

/**
  * 启动使 Service Worker 保持活动状态的心跳间隔。
  * 当您在做需要坚持不懈的工作时，请谨慎使用
  *  一旦工作完成,请调用 stopHeartbeat
  */
async function startHeartbeat() {
    console.log('测试数据');
    // 在 Service Worker 启动时运行一次检测信号。
    runHeartbeat().then(() => {
        // 然后每 20 秒再次一次。
        heartbeatInterval = setInterval(runHeartbeat, 20 * 1000);
    });
}

async function stopHeartbeat() {
    clearInterval(heartbeatInterval);
}
/**
  * 返回存储在扩展存储中的最后一个检测信号，如果出现
  * 心跳以前从未运行过。
  */
async function getLastHeartbeat() {
    return (await chrome.storage.local.get('last-heartbeat'))['last-heartbeat'];
}
