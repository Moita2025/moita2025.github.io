let uniqueLettersByPage = {};

function buildLetterIndex() {
    if (!window.words || window.words.length === 0) {
        console.warn('words 还没准备好');
        return;
    }

    const list = window.words;

    // ---------- 1. 记录每个字母首次出现的索引 ----------
    const firstIndex = {};
    for (let c = 97; c <= 122; c++) firstIndex[String.fromCharCode(c)] = -1;

    list.forEach((item, idx) => {
        const word = item.word;
        if (!word) return;
        const letter = word[0].toLowerCase();
        if (firstIndex[letter] === -1) firstIndex[letter] = idx;
    });

    //console.log("每个字母首次出现的索引：");
    //console.table(firstIndex);

    // ---------- 2. 计算“首次出现的页数”（20 条/页） ----------
    const firstPage = {};
    for (const letter in firstIndex) {
        const idx = firstIndex[letter];
        if (idx === -1) firstPage[letter] = null;
        else firstPage[letter] = Math.floor(idx / 20) + 1;
    }

    //console.log("每个字母首次出现的页数：");
    //console.table(firstPage);

    // ---------- 3. 去重 ----------
    const seenPages = new Set();
    uniqueLettersByPage = {};
    for (const letter of Object.keys(firstPage)) {
        const p = firstPage[letter];
        if (!p) continue;
        if (!seenPages.has(p)) {
            seenPages.add(p);
            uniqueLettersByPage[letter] = p;
        }
    }

    //console.log("去重后（同页数只保留第一个字母）：");
    //console.table(uniqueLettersByPage);
}

// 假设 uniqueLettersByPage 已经是全局变量
// 新函数：生成按钮
function renderLetterButtons() {
    const container = document.getElementById('letter-buttons-container');
    if (!container) return;

    container.innerHTML = '';

    for (const letter in uniqueLettersByPage) {
        const p = uniqueLettersByPage[letter];
        if (!p) continue;

        const btn = document.createElement('button');
        btn.className = 'ui-btn';
        btn.setAttribute('data-jump', p);
        btn.textContent = letter.toUpperCase();

        // ✅ 新增：点击字母按钮跳页
        btn.addEventListener('click', () => {
            window.Utils.ui.pagination.goToPage(p);  // 调用 word_table_pagination.js 的公共函数
        });

        container.appendChild(btn);
    }
}


// 组合函数
function buildLetterIndexAndButtons() {
    buildLetterIndex();    // 先生成 uniqueLettersByPage
    renderLetterButtons(); // 再生成按钮
}

// 监听 wordsReady
window.addEventListener('wordsReady', buildLetterIndexAndButtons);

