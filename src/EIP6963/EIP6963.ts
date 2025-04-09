import { isObject } from '@metamask/utils';

import { BaseProvider } from './BaseProvider';

/**
* 描述可能的 EIP-6963 事件名称
*/
enum EIP6963EventNames {
    Announce = 'eip6963:announceProvider',
    Request = 'eip6963:requestProvider', // eslint-disable-line @typescript-eslint/no-shadow
}

declare global {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface WindowEventMap {
        [EIP6963EventNames.Request]: EIP6963RequestProviderEvent;
        [EIP6963EventNames.Announce]: EIP6963AnnounceProviderEvent;
    }
}


/**
* 表示显示和识别钱包所需的资产。
*
* @type EIP6963ProviderInfo
* @property uuid - 钱包的本地唯一标识符。必须是 v4 UUID。
* @property name - 钱包的名称。
* @property icon - 钱包的图标。必须是数据 URI。
* @property rdns - 钱包的反向语法域名标识符。
*/
export type EIP6963ProviderInfo = {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
};


/**
* 表示提供商及其与 dapp 相关的信息。
*
* @type EIP6963ProviderDetail
* @property info - EIP6963ProviderInfo 对象。
* @property provider - 提供商实例。
*/
export type EIP6963ProviderDetail = {
    info: EIP6963ProviderInfo;
    provider: BaseProvider;
};


/**
* 用于请求 EVM 提供商的事件。
*
* @type EIP6963RequestProviderEvent
* @property type - 事件名称。
*/
export type EIP6963RequestProviderEvent = Event & {
    type: EIP6963EventNames.Request;
};


/**
* 用于宣布 EVM 提供商的事件。
*
* @type EIP6963RequestProviderEvent
* @property type - 事件名称。
* @property detail - 事件的详细信息对象。
*/
export type EIP6963AnnounceProviderEvent = CustomEvent & {
    type: EIP6963EventNames.Announce;
    detail: EIP6963ProviderDetail;
};

// https://github.com/thenativeweb/uuidv4/blob/bdcf3a3138bef4fb7c51f389a170666f9012c478/lib/uuidv4.ts#L5
const UUID_V4_REGEX =
    /(?:^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[a-f0-9]{4}-[a-f0-9]{12}$)|(?:^0{8}-0{4}-0{4}-0{4}-0{12}$)/u;

// https://stackoverflow.com/a/20204811
const FQDN_REGEX =
    /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$)/u;


/**
* 旨在供 dapp 使用。通过监听 * {@link EIP6963AnnounceProviderEvent}，将每个已宣布的提供商转发到
* 提供的处理程序，
* 并分派 {@link EIP6963RequestProviderEvent}。
*
* @param handleProvider - 用于处理已宣布提供商的函数。
*/
export function requestProvider<HandlerReturnType>(
    handleProvider: (providerDetail: EIP6963ProviderDetail) => HandlerReturnType,
): void {
    window.addEventListener(
        EIP6963EventNames.Announce,
        (event: EIP6963AnnounceProviderEvent) => {
            if (!isValidAnnounceProviderEvent(event)) {
                throwErrorEIP6963(
                    `Invalid EIP-6963 AnnounceProviderEvent object received from ${EIP6963EventNames.Announce} event.`,
                );
            }
            handleProvider(event.detail);
        },
    );

    window.dispatchEvent(new Event(EIP6963EventNames.Request));
}
/**
* 供钱包使用。通过调度
* {@link EIP6963AnnounceProviderEvent} 来宣布提供商，并监听
* {@link EIP6963RequestProviderEvent} 以重新宣布。
*
* 如果 {@link EIP6963ProviderDetail} 无效，则抛出 @throws。
* @param providerDetail - 要宣布的 {@link EIP6963ProviderDetail}。
* @param providerDetail.info - 要宣布的 {@link EIP6963ProviderInfo}。
* @param providerDetail.provider - 要宣布的提供商。
*/
export function announceProvider(providerDetail: EIP6963ProviderDetail): void {
    if (!isValidProviderDetail(providerDetail)) {
        throwErrorEIP6963('Invalid EIP-6963 ProviderDetail object.');
    }
    const { info, provider } = providerDetail;

    const _announceProvider = () =>
        window.dispatchEvent(
            new CustomEvent(EIP6963EventNames.Announce, {
                detail: Object.freeze({ info: { ...info }, provider }),
            }),
        );

    _announceProvider();
    window.addEventListener(
        EIP6963EventNames.Request,
        (event: EIP6963RequestProviderEvent) => {
            if (!isValidRequestProviderEvent(event)) {
                throwErrorEIP6963(
                    `Invalid EIP-6963 RequestProviderEvent object received from ${EIP6963EventNames.Request} event.`,
                );
            }
            _announceProvider();
        },
    );
}

/**
* 验证 {@link EIP6963RequestProviderEvent} 对象。
*
* @param event - 需要验证的 {@link EIP6963RequestProviderEvent}。
* @returns {@link EIP6963RequestProviderEvent} 是否有效。
*/
function isValidRequestProviderEvent(
    event: unknown,
): event is EIP6963RequestProviderEvent {
    return event instanceof Event && event.type === EIP6963EventNames.Request;
}


/**
* 验证 {@link EIP6963AnnounceProviderEvent} 对象。
*
* @param event - 需要验证的 {@link EIP6963AnnounceProviderEvent}。
* @returns 返回 {@link EIP6963AnnounceProviderEvent} 是否有效。
*/
function isValidAnnounceProviderEvent(
    event: unknown,
): event is EIP6963AnnounceProviderEvent {
    return (
        event instanceof CustomEvent &&
        event.type === EIP6963EventNames.Announce &&
        Object.isFrozen(event.detail) &&
        isValidProviderDetail(event.detail)
    );
}


/**
* 验证 {@link EIP6963ProviderDetail} 对象。
*
* @param providerDetail - 需要验证的 {@link EIP6963ProviderDetail}。
* @returns {@link EIP6963ProviderDetail} 是否有效。
*/
function isValidProviderDetail(
    providerDetail: unknown,
): providerDetail is EIP6963ProviderDetail {
    if (
        !isObject(providerDetail) ||
        !isObject(providerDetail.info) ||
        !isObject(providerDetail.provider)
    ) {
        return false;
    }
    const { info } = providerDetail;

    return (
        typeof info.uuid === 'string' &&
        UUID_V4_REGEX.test(info.uuid) &&
        typeof info.name === 'string' &&
        Boolean(info.name) &&
        typeof info.icon === 'string' &&
        info.icon.startsWith('data:image') &&
        typeof info.rdns === 'string' &&
        FQDN_REGEX.test(info.rdns)
    );
}


/**
* 抛出一个错误，并附带指向 EIP-6963 规范的链接。
*
* @param message - 要包含的消息。
* @throws 一个友好错误，并附带指向 EIP-6963 的链接。
*/
function throwErrorEIP6963(message: string) {
    throw new Error(
        `${message} See https://eips.ethereum.org/EIPS/eip-6963 for requirements.`,
    );
}