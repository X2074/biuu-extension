import indexDbData from '../../indexDB.js';
import { showExtensionPopup } from '../../index.ts';
/* 接收 wallet_requestPermissions 请求，并从中提取请求的权限参数
	获取当前活动标签页的 URL 和 origin  属性
	创建一个授权弹窗，将当前 origin 作为参数传递
	等待用户响应（授权或拒绝）
	如果用户授权，将权限信息保存到 IndexedDB
	返回符合 EIP-2255 标准的权限响应
*/
// 权限类型定义
interface Permission {
    id: string;
    parentCapability: string;
    invoker: string;
    caveats: Array<{
        type: string;
        value: any;
    }>;
    date: number;
}

// 权限请求参数类型
interface PermissionRequest {
    eth_accounts?: {
        eth?: {
            methods?: string[];
            events?: string[];
        };
    };
    wallet?: {
        rpc?: string[];
    };
}
export default async function requestPermissions(request: any) {
	try {
	const { params } = request;
	const [permissions] = params || [{}];
	console.log(request,"permissionspermissionspermissions");
	

	// 获取当前活动标签页
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (!tab?.url) {
		throw new Error('Unable to determine the current tab URL');
	}

	const currentOrigin = new URL(tab.url).origin;
	const url: any = `/connect?origin=${encodeURIComponent(currentOrigin)}`;
	const popupUrl: any = await showExtensionPopup(url);
	// 生成权限ID
	const generatePermissionId = () => {
		return crypto.randomUUID();
	};
	// 返回一个 Promise，等待用户响应
	return new Promise((resolve, reject) => {
		// 监听来自弹窗的响应
		const handleMessage: any = (message: any) => {
		console.log(message, 'messagemessagemessage');
		if (message.action === 'authorization_response') {
			chrome.runtime.onMessage.removeListener(handleMessage);

				if (message.approved) {
					// 获取当前钱包地址
					const walletAddress = message.currentWallt.address
					|| '';

					// 构建权限响应
					const grantedPermissions: Permission[] = [];

					// 处理 eth_accounts 权限
					if (permissions.eth_accounts) {
						const accountPermission: Permission = {
							id: generatePermissionId(),
							parentCapability: 'eth_accounts',
							invoker: currentOrigin,
							caveats: [
								{
									type: 'allowedOrigins',
									value: [currentOrigin]
								},
								{
									type: 'filterResponse',
									value: [walletAddress]
								}
							],
							date: Date.now()
						};
						grantedPermissions.push(accountPermission);
					}

					// 处理 wallet_rpc 权限
					if (permissions.wallet?.rpc) {
						const rpcPermission: Permission = {
							id: generatePermissionId(),
							parentCapability: 'wallet_rpc',
							invoker: currentOrigin,
							caveats: [
								{
									type: 'allowedOrigins',
									value: [currentOrigin]
								},
								{
									type: 'allowedMethods',
									value: permissions.wallet.rpc
								}
							],
							date: Date.now()
						};
						grantedPermissions.push(rpcPermission);
					}

					// 保存到 IndexedDB
					indexDbData.getData('authorized_sites')
						.then((sites: any) => {
							console.log(sites,"sitessitessites");
							 // 如果不存在 authorized_sites 记录，则创建新的
							 if (!sites) {
								return indexDbData.putData({
									id: 'authorized_sites',
									[currentOrigin]: {
										permissions: grantedPermissions,
										timestamp: Date.now()
									}
								});
							}
							// 如果存在 authorized_sites 记录，则更新它
							return indexDbData.getData('authorized_sites')
							.then((existingSites: any) => {
								const updatedSites = {
									...existingSites,
									[currentOrigin]: {
										permissions: grantedPermissions,
										timestamp: Date.now()
									}
								};
								return indexDbData.putData(updatedSites);
							});
						})
						.then(() => {
							resolve(grantedPermissions);
						})
						.catch((error: any) => {
							console.error('Error saving permissions:', error);
							reject(error);
						});
				} else {
					reject(new Error('User rejected permissions request'));
				}
			}
		};

		// 添加消息监听
		chrome.runtime.onMessage.addListener(handleMessage);

		// 设置超时
		setTimeout(() => {
		chrome.runtime.onMessage.removeListener(handleMessage);
		reject(new Error('Request timeout'));
		}, 300000); // 5分钟超时
	});
	} catch (error) {
	console.error('Error in requestPermissions:', error);
	throw error;
	}
}
