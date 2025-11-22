// ==============================
// 全局状态
// ==============================
window.blogStatusDict = window.blogStatusDict || {};
window.currentWordKey = "junior";        // 使用的字典 key
window.currentWordLabel = "初中词汇";    // 中文名称


// ==============================
// 1. 字典映射
// ==============================
const WORD_JSON_MAP = {
    "junior": "/assets/data/KyleBing-english-vocabulary/1-初中-顺序.json",
    "senior": "/assets/data/KyleBing-english-vocabulary/2-高中-顺序.json",
    "cet4": "/assets/data/KyleBing-english-vocabulary/3-CET4-顺序.json",
    "cet6": "/assets/data/KyleBing-english-vocabulary/4-CET6-顺序.json",
    "pg": "/assets/data/KyleBing-english-vocabulary/5-考研-顺序.json",
    "toefl": "/assets/data/KyleBing-english-vocabulary/6-托福-顺序.json",
    "sat": "/assets/data/KyleBing-english-vocabulary/7-SAT-顺序.json"
};

const WORD_NAME_MAP = {
    "junior": "初中词汇",
    "senior": "高中词汇",
    "cet4": "四级词汇",
    "cet6": "六级词汇",
    "pg": "考研词汇",
    "toefl": "托福词汇",
    "sat": "SAT词汇"
};

const rewrite_nav_keywords = [
    "词汇表",
    "英 → 中 四选一"
];

// ==============================
// 2. 获取 URL 参数对应的词库 key
// ==============================
function resolveWordKey() {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("en_words");

    // 判断是否有效
    if (key && WORD_JSON_MAP[key]) {
        return key;
    }
    return "junior"; // 默认
}


// ==============================
// 3. 初始化词库加载（核心对外函数）
// ==============================
async function initWordsGeneric(eventName, onLoaded = null) {
    // 获取使用的 key
    const key = resolveWordKey();
    const jsonFile = WORD_JSON_MAP[key];

    // 记录使用的 key
    window.currentWordKey = key;
    window.currentWordLabel = WORD_NAME_MAP[key];

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
// 4. MkDocs Nav 处理：重写 href + 添加中文标签
// ==============================
function rewriteMkdocsNav() {
    const key = window.currentWordKey;
    const label = window.currentWordLabel;
    const selector = ".md-sidebar--primary .md-nav__item a";

    document.querySelectorAll(selector).forEach(a => {
        const url = new URL(a.href, location.origin);

        // 在 span 中添加 "(xxx词汇)"
        const span = a.querySelector("span");

        if (
            span && !span.innerText.includes(label) && 
            rewrite_nav_keywords.includes(span.innerText.trim())
        ) 
        {
            // 添加 en_words 参数
            url.searchParams.set("en_words", key);
            a.href = url.toString();

            span.innerText += ` (${label})`;
        }
    });
}


// ==============================
// 5. 主标题 h1 处理：添加 "(词汇名)"
// ==============================
function rewriteMainTitle() {
    const h1 = document.querySelector(".md-typeset h1");
    if (!h1) return;

    const label = window.currentWordLabel;
    if (!h1.innerText.includes(label)) {
        h1.innerText += ` (${label})`;
    }
}


// ==============================
// 6. 页面加载后统一处理
// ==============================
document.addEventListener("DOMContentLoaded", function() {
    rewriteMkdocsNav();
    rewriteMainTitle();
});


// ==============================
// 生成词库切换对话框内容
// ==============================
function generateSwitchWordsHTML() {
    const currentKey = window.currentWordKey;

    let html = `
      <h2>切换词汇表</h2>
      <div class="grid cards compact-grid-single-row">
        <ul>
    `;

    Object.keys(WORD_JSON_MAP).forEach(key => {
        if (key !== currentKey) {   // 排除当前词库
            const itemName = WORD_NAME_MAP[key];
            const itemParam = key;

            html += `
              <li>
                <p><strong>${itemName}</strong></p>
                <p><a href="?en_words=${itemParam}">切换</a></p>
              </li>
            `;
        }
    });

    html += `
        </ul>
      </div>
    `;

    return html;
}



// ==============================
// 按钮绑定：点击弹出对话框
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector("#switch-words");

    if (btn) {
        btn.addEventListener("click", () => {
            const htmlContent = generateSwitchWordsHTML();
            showDialog(htmlContent);
        });
    }
});