// injected.ts
export { }
import { announceProviderInject } from '../utils/EIP6963/EIP6963';
// import { windowProvider } from '../utils/provider/window-provider';
announceProviderInject()

// 确保 window.ethereum 存在
if (!window.ethereum) {
    console.warn('window.ethereum is not available');
} else {
    // 如果 window.ethereum 没有 emit 方法，添加一个简单的实现
    if (typeof window.ethereum.emit !== 'function') {
        const listeners: { [event: string]: Function[] } = {};
        
        window.ethereum.emit = function(event: string, ...args: any[]) {
            console.log(`Emitting event: ${event}`, args);
            if (listeners[event]) {
                listeners[event].forEach(listener => {
                    try {
                        if (event === 'connect') {
                            // 对于 connect 事件，传递一个包含 chainId 的对象
                            listener({ chainId: args[0] });
                        } else {
                            listener(...args);
                        }
                    } catch (error) {
                        console.error(`Error in ${event} handler:`, error);
                    }
                });
            }
            return true;
        };

        window.ethereum.on = function(event: string, listener: Function) {
            if (!listeners[event]) {
                listeners[event] = [];
            }
            listeners[event].push(listener);
            return () => {
                const index = listeners[event].indexOf(listener);
                if (index > -1) {
                    listeners[event].splice(index, 1);
                }
            };
        };

        window.ethereum.removeListener = function(event: string, listener: Function) {
            if (listeners[event]) {
                const index = listeners[event].indexOf(listener);
                if (index > -1) {
                    listeners[event].splice(index, 1);
                }
            }
        };
    }
}

window.addEventListener('message', function (e) {
    console.log('onChange事件', e.data);
    
    if (!window.ethereum) {
        console.warn('window.ethereum is not available');
        return;
    }

    if (e.data.type === 'chainChanged') {
        window.ethereum.emit('chainChanged', e.data.chainId);
    } else if (e.data.type === 'accountsChanged') {
        window.ethereum.emit('accountsChanged', e.data.accounts);
    } else if (e.data.type === 'connect') {
        // 确保传递一个包含 chainId 的对象
        window.ethereum.emit('connect', e.data.chainId);
    } else if (e.data.type === 'disconnect') {
        window.ethereum.emit('disconnect', { 
            code: 1013, 
            message: 'Network connection lost',
            chainId: e.data.chainId 
        });
    }
});