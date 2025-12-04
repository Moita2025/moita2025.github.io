// ==============================
// 全局状态
// ==============================
window.blogStatusDict = window.blogStatusDict || {};
window.currentWordKey = "junior";        // 使用的字典 key
window.currentWordLabel = "初中词汇";    // 中文名称


// ==============================
// 1. 字典映射
// ==============================
const rewrite_nav_keywords = [
    "词汇表",
    "英 → 中 四选一"
];

// ==============================
// 3. 初始化词库加载（核心对外函数）
// ==============================
async function initWordsGeneric(eventName, onLoaded = null) {
    // 获取使用的 key
    const key = window.Utils.url.getSearchParam({
        paramName: "collection",
        map: window.Utils.vocab.WORD_JSON_MAP,
        defaultParam: "junior"
    });
    const jsonFile = window.Utils.vocab.WORD_JSON_MAP[key];

    // 记录使用的 key
    window.currentWordKey = key;
    window.currentWordLabel = window.Utils.vocab.WORD_NAME_MAP[key];

    try {
        const response = await fetch(jsonFile);
        const words = await response.json();

        window.words = words;
        window.blogStatusDict[eventName] = true;

        // 派发事件
        const event = new CustomEvent(eventName, { detail: { words }});
        window.dispatchEvent(event);

        if (typeof onLoaded === "function") {
            onLoaded(words);
        }

    } catch (err) {
        console.error(`加载 ${jsonFile} 时出错：`, err);
    }
}

// ==============================
// 6. 页面加载后统一处理
// ==============================
document.addEventListener("DOMContentLoaded", function() {
    window.Utils.mkdocsRewrite.rewriteNav({
        rewrite_nav_items: rewrite_nav_keywords,
        key: window.currentWordKey,
        label: window.currentWordLabel,
        paramName: "collection"
    });
    window.Utils.mkdocsRewrite.rewriteMainTitle({
        label: window.currentWordLabel
    });
});

window.currentWordKey = window.Utils.url.getSearchParam({
    paramName: "collection", 
    defaultParam: "junior"
});

window.Utils.ui.bindDlg2Btn("#switch-words", 
    window.Utils.ui.generateSwitchListHTML({
        title: '切换词汇表',
        currentKey: window.currentWordKey,
        keyToNameMap: window.Utils.vocab.WORD_NAME_MAP,
        keyToDataMap: window.Utils.vocab.WORD_JSON_MAP,
        buildUrl: (key) => `?collection=${encodeURIComponent(key)}`
    })
);
