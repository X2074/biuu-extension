// // injected.ts
export { }
import { announceProviderInject } from '../utils/EIP6963/EIP6963';
// import { windowProvider } from '../utils/provider/window-provider';
announceProviderInject()
window.addEventListener('message', function (e) {
    if (e.data.type === 'chainChanged') {
        window.ethereum.emit('chainChanged', e.data.chainId)
    }
    if (e.data.type === 'accountsChanged') {
        window.ethereum.emit('accountsChanged', e.data.accounts)
    }
    if (e.data.type === 'connect') {
        window.ethereum.emit('connect', e.data.chainId)
    }
    if (e.data.type === 'disconnect') {
        window.ethereum.emit('disconnect', e.data.chainId)
    }
})