/**
 * 通用：更新 URL Search Params（不刷新页面）
 * @param {Object} params - 要设置的参数，如 {TPO: 12, search:"apple"}
 * @param {Object} options - 配置项
 *   - clearHash: 是否清除 # 部分（默认 true）
 *   - usePush: 是否使用 pushState（默认 false -> replaceState）
 *   - removeEmpty: 是否在值为空时删除该参数（默认 true）
 */
function updateSearchParams(params = {}, options = {}) {
    const {
        clearHash = true,
        usePush = false,
        removeEmpty = true,
    } = options;

    const url = new URL(window.location.href);

    // 设置参数
    for (const key in params) {
        const value = params[key];

        if (removeEmpty && (value === null || value === undefined || value === "")) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, String(value));
        }
    }

    // 可选：清除 hash
    if (clearHash) {
        url.hash = "";
    }

    // 无刷新更新地址
    if (usePush) {
        window.history.pushState({}, "", url.toString());
    } else {
        window.history.replaceState({}, "", url.toString());
    }
}