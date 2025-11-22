function BackToTop(targetUrl = '') {
    // 如果 targetUrl 是非空且不是数字 → 直接跳转到指定 URL
    if (targetUrl && isNaN(targetUrl)) {
        window.location.href = targetUrl;
        return;
    }

    // 当前路径
    let currentUrl = window.location.pathname;

    // 分割路径
    let parts = currentUrl.split('/');

    // 去掉空项（开头或末尾的 / 会造成空字符串）
    parts = parts.filter(p => p.length > 0);

    // 默认层级为 1
    let level = parseInt(targetUrl) || 1;

    // 截断目录（上 n 层）
    parts = parts.slice(0, parts.length - level);

    // 拼接成最终 URL
    let finalURL = '/' + parts.join('/') + '/';

    console.log(finalURL);

    if (finalURL == "//") finalURL = "/";

    // 跳转
    window.location.href = finalURL;
}