export function addClass(el: any, className: any) {
    // 如果当前元素样式列表中没有className
    if (!el.classList.contains(className)) {
        el.classList.add(className)
    }
}

export function removeClass(el: any, className: any) {
    el.classList.remove(className)
}