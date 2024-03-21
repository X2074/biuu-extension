/**
 * 桌面弹出框
 * type (可选): 字符串，指定通知的类型，可以是 "basic"、"image"、"list" 或 "progress"。
 * iconUrl (可选): 字符串，指定通知中显示的图标的 URL。
 * title (必需): 字符串，指定通知的标题。
 * message (必需): 字符串，指定通知的主要内容。
 * contextMessage (可选): 字符串，指定通知的第二行内容。
 * buttons (可选): 数组，包含通知中显示的按钮的信息。
 * imageUrl (可选): 字符串，指定在通知中显示的图像的 URL。
 * items (可选): 数组，包含在通知中显示的项目的信息。
 * progress (可选): 整数，指定通知中显示的进度条的百分比值。
 **/
export async function chromeNotifications(data: any) {
    // 右下角提示,这个id是唯一的，每次都不一样，否则不能触发
    chrome.notifications.create(data.uuid, data.content, function (id) {
        console.log(id);
    });
}