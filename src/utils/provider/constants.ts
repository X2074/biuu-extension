// 用于标识 Provider Bridge 通信的目标
// 当 Content Script 需要与 Background Script 通信时使用
export const PROVIDER_BRIDGE_TARGET = 'biuu-provider-bridge';
// 当 Background Script 需要与 Content Script 通信时使用
export const WINDOW_PROVIDER_TARGET = 'biuu-window-provider';
export const EXTERNAL_PORT_NAME = 'biuu-external';
// 用于获取扩展的配置信息
// 包含网络配置、入口点地址等重要信息
export const AA_EXTENSION_CONFIG = 'biuu_getConfig';