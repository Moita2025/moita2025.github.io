// 全局状态记录器
window.blogStatusDict = window.blogStatusDict || {};

// 词库字典
const WORD_JSON_MAP = {
    "junior": "/assets/data/KyleBing-english-vocabulary/1-初中-顺序.json",
    "senior": "/assets/data/KyleBing-english-vocabulary/2-高中-顺序.json",
    "cet4": "/assets/data/KyleBing-english-vocabulary/3-CET4-顺序.json",
    "cet6": "/assets/data/KyleBing-english-vocabulary/4-CET6-顺序.json",
    "pg": "/assets/data/KyleBing-english-vocabulary/5-考研-顺序.json",
    "toefl": "/assets/data/KyleBing-english-vocabulary/6-托福-顺序.json",
    "sat": "/assets/data/KyleBing-english-vocabulary/7-SAT-顺序.json"
};

/**
 * 通用初始化 JSON 单词表（新版：根据 URL 参数 en_words 决定 JSON 文件）
 * @param {string} eventName - 数据加载完成后派发的事件名
 * @param {function(words):void} onLoaded - 加载完成后的回调
 */
async function initWordsGeneric(eventName, onLoaded = null) {

    // 读取 URL 参数
    const params = new URLSearchParams(window.location.search);
    const key = params.get("en_words");

    // 根据参数从字典获取 JSON 文件，不合法或缺失则 fallback 至 junior
    const jsonFile = WORD_JSON_MAP[key] || WORD_JSON_MAP["junior"];

    try {
        const response = await fetch(jsonFile);
        const words = await response.json();

        window.words = words;
        window.blogStatusDict[eventName] = true;

        // 派发事件
        const event = new CustomEvent(eventName, { detail: { words }});
        window.dispatchEvent(event);

        // 回调
        if (typeof onLoaded === "function") {
            onLoaded(words);
        }

    } catch (err) {
        console.error(`加载 ${jsonFile} 时出错：`, err);
    }
}