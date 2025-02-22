{
    // 清单文件版本
    "manifest_version": 3,
    // 扩展名称
    "name": "My Vue Chrome Ext",
    // 扩展版本号
    "version": "0.0.1",
    // 扩展描述
    "description": "Chrome 插件",
    // 扩展图标，定义不同尺寸的图标路径
    "icons": {
        "16": "icons/icon.png",
        "19": "icons/icon.png",
        "38": "icons/icon.png",
        "48": "icons/icon.png",
        "128": "icons/icon.png"
    },
    // 定义浏览器操作按钮的默认行为
    "action": {
        "default_title": "Vue Chrome Ext",
        "default_icon": "icons/icon.png",
        "default_popup": "popup/index.html"
    },
    // 后台服务配置
    "background": {
        "service_worker": "background/service-worker.js",
        "type": "module"
    },
    // 请求的权限列表
    "permissions": ["scripting", "activeTab", "tabs", "alarms", "storage", "notifications"],
    // 请求的主机权限列表
    "host_permissions": ["<all_urls>"],
    // 内容脚本配置
    "content_scripts": [
        {
            "js": ["content/content.js"],
            "matches": ["<all_urls>"],
            "all_frames": true,
            "run_at": "document_end",
            "match_about_blank": true
        }
    ],
    // 可访问的网页资源配置
    "web_accessible_resources": [
        {
            "resources": ["popup/*", "content/content.js", "contentPage/*", //允许访问我们的注入脚本
            "assets/*", "js/*"],
            "matches": ["<all_urls>"]
        }
    ]
}
