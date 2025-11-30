// ==================== 配置 ====================
const BCZ_DATA_URL = '/assets/data/toefl_data/toefl_bcz_words.json';           // 百词斩生词记录（你自己的）
const TOEFL_DICT_URL = '/assets/data/KyleBing-english-vocabulary/6-托福-顺序.json'; // 托福词库（带翻译）

let bczDaysData = [];     // 原始百词斩数据：[{day:1, words:["abandon","ability",...]}, ...]
let toeflDict = [];       // 托福词库（已加载完的完整数组）

// ==================== 工具函数 ====================
const $ = (tag, text = '', className = '') => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
};

// 朗读单词（使用浏览器自带 SpeechSynthesis）
const speakWord = (word) => {
    if (!word) return;
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = 'en-US';
    speechSynthesis.cancel();   // 防止队列堆积
    speechSynthesis.speak(utter);
};

// 创建“自检翻译”单元格（默认隐藏，hover/tap 后显示）
const createTranslationCell = (translation) => {
    const td = $('td', translation, 'translation-cell');
    // 初始状态：黑底白字但透明度为0，只有 hover/active 才显示
    td.style.cssText = `
        background:#000;
        color:#fff;
        cursor:pointer;
        user-select:none;
        opacity:0;
        transition:opacity .25s;
    `;
    td.addEventListener('mouseenter', () => td.style.opacity = 1);
    td.addEventListener('mouseleave', () => td.style.opacity = 0);
    td.addEventListener('touchstart', (e) => {
        e.preventDefault();
        td.style.opacity = 1;
    });
    td.addEventListener('touchend', () => td.style.opacity = 0);
    return td;
};

// ==================== 渲染核心 ====================
const renderDayTable = (dayObj, container) => {
    const day = dayObj.day;

    // ---- 第 X 天标题 ----
    container.appendChild($('h2', `第 ${day} 天`));

    const tableContainer = $('div', '', 'word-table');
    const table = $('table');
    const thead = $('thead');
    const tbody = $('tbody');

    const header = $('tr');
    ['单词', '中文翻译', '朗读'].forEach(txt => header.appendChild($('th', txt)));
    thead.appendChild(header);
    table.appendChild(thead);

    // ---- 遍历当天单词 ----
    dayObj.words.forEach(word => {
        const entry = toeflDict.find(item => item.word.toLowerCase() === word.toLowerCase());
        const translation = entry?.translations?.[0]?.translation || '——';

        const tr = $('tr');

        // 单词列
        tr.appendChild($('td', word, 'word-cell'));

        // 翻译列（自检）
        tr.appendChild(createTranslationCell(translation));

        // 朗读按钮列
        const speakTd = $('td');
        const btn = $('button', '🔊', 'speak-btn');
        btn.type = 'button';
        btn.onclick = () => speakWord(word);
        speakTd.appendChild(btn);
        tr.appendChild(speakTd);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
};

// 渲染一页（3 天）
const renderPage = (pageIndex, container) => {
    container.innerHTML = '';

    const start = pageIndex * 3;
    const daysToShow = bczDaysData.slice(start, start + 3);

    daysToShow.forEach(dayObj => renderDayTable(dayObj, container));

    // 更新分页器标题（可选）
    window.Utils?.mkdocsRewrite?.rewriteMainTitle({
        label: `第 ${daysToShow[0].day}–${daysToShow[daysToShow.length - 1].day} 天`,
        append: false,
        brackets: false
    });

    window.Utils.mkdocsRewrite.rewriteToc();
};

// ==================== 初始化 ====================
async function initReviewPage() {
    const container = document.getElementById('render-area');
    if (!container) return;

    try {
        const [bczResp, dictResp] = await Promise.all([
            fetch(BCZ_DATA_URL),
            fetch(TOEFL_DICT_URL)
        ]);

        if (!bczResp.ok || !dictResp.ok) throw new Error('fetch failed');

        const rawBcz = await bczResp.json();
        toeflDict = await dictResp.json();

        // 把百词斩的结构统一成 [{day:1, words:[...]}, ...]
        // 假设你的 bcz json 是 [[word,word,...],[word,...],...] 即每天一个数组
        bczDaysData = rawBcz.map((words, idx) => ({
            day: idx + 1,
            words: words
        }));

        if (bczDaysData.length === 0) throw new Error('bcz data empty');

        // 初始化分页器（每页 3 天）
        window.Utils.ui.pagination.init({
            totalItems: bczDaysData.length,
            pageSize: 3,
            onChange: (page) => {
                renderPage(page - 1, container);
                scrollTo(0, 0);
            }
        });

        renderPage(0, container);

    } catch (err) {
        console.error('加载数据失败', err);
        container.innerHTML = '<p style="color:red">加载失败，请检查网络或数据文件</p>';
    }
}

document.addEventListener('DOMContentLoaded', initReviewPage);