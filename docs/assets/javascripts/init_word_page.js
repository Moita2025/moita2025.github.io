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
        paramName: "en_words",
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
    window.Utils.mkdocsRewrite.rewriteNav({
        rewrite_nav_items: rewrite_nav_keywords,
        key: window.currentWordKey,
        label: window.currentWordLabel,
        paramName: "en_words"
    });
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

    Object.keys(window.Utils.vocab.WORD_JSON_MAP).forEach(key => {
        if (key !== currentKey) {   // 排除当前词库
            const itemName = window.Utils.vocab.WORD_NAME_MAP[key];
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