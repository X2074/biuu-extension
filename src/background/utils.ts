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
    let info: any = {
        type: 'list',
        iconUrl: 'https://th.bing.com/th/id/R.9018c4f47b9796cbea207325cb60e457?rik=TKWy9KALYKcXBg&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f92%2f1692.jpg&ehk=YB59358%2fCaARUufRoOEdKK9gWz%2fCdnQLXvP%2fn8DAPrA%3d&risl=&pid=ImgRaw&r=0',
        appIconMaskUrl: 'https://th.bing.com/th/id/R.9018c4f47b9796cbea207325cb60e457?rik=TKWy9KALYKcXBg&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f92%2f1692.jpg&ehk=YB59358%2fCaARUufRoOEdKK9gWz%2fCdnQLXvP%2fn8DAPrA%3d&risl=&pid=ImgRaw&r=0',
        title: '通知主标题',
        message: '通知副标题',
        contextMessage: '好开心呀，终于会使用谷歌扩展里面的API了！',
        buttons: [{ title: '按钮1的标题', iconUrl: 'https://th.bing.com/th/id/R.9018c4f47b9796cbea207325cb60e457?rik=TKWy9KALYKcXBg&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f92%2f1692.jpg&ehk=YB59358%2fCaARUufRoOEdKK9gWz%2fCdnQLXvP%2fn8DAPrA%3d&risl=&pid=ImgRaw&r=0' }, { title: '按钮2的标题', iconUrl: 'https://th.bing.com/th/id/R.9018c4f47b9796cbea207325cb60e457?rik=TKWy9KALYKcXBg&riu=http%3a%2f%2fpic.bizhi360.com%2fbbpic%2f92%2f1692.jpg&ehk=YB59358%2fCaARUufRoOEdKK9gWz%2fCdnQLXvP%2fn8DAPrA%3d&risl=&pid=ImgRaw&r=0' }],
        items: [{ title: '消息1', message: '今天天气真好！' }, { title: '消息2', message: '明天天气估计也不错！' }],
        eventTime: Date.now() + 2000
    }
    // 右下角提示,这个id是唯一的，每次都不一样，否则不能触发
    chrome.notifications.create('sadsadsadasdasdsa', info, function (id) {
        console.log(id);
    });
}


export default {
    chromeNotifications
}