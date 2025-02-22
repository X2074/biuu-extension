import { injectProvider } from './provider';

// 确保content script已被注入
const contentScriptInjected = 'biuu-content-script-injected';
if (!window[contentScriptInjected]) {
    window[contentScriptInjected] = true;
    injectProvider();
}
