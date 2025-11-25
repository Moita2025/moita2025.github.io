// ==============================
// TOEFL 单篇生词渲染引擎（支持多实例）
// ==============================
class TOEFLVocabViewer {
    constructor(options = {}) {
        this.containerId = options.containerId || 'toefl-vocab-container';
        this.pageSize = options.pageSize || 40;        // 每页词数（建议 40~60）
        this.columns = options.columns || 2;           // 默认 2 列
        this.articleParam = options.articleParam || 'article';
        this.dictParam = options.dictParam || 'dict';  // 可选：初中/高中/托福等

        this.words = [];
        this.currentPage = 1;
        this.totalPages = 0;
        this.articleName = '';
        this.dictKey = 'toefl';  // 默认用托福词库过滤

        this.init();
    }

    async init() {
        this.readURLParams();
        await this.loadArticleWords();

        // 如果加载失败，render 里已经处理了错误提示
        if (this.words.length > 0 || !document.getElementById(this.containerId).querySelector('.md-typeset')) {
            this.render();  // 首次渲染
        }
    }

    readURLParams() {
        const params = new URLSearchParams(location.search);
        this.articleName = params.get(this.articleParam) || '';
        if (!this.articleName) this.articleName = 'timberline_vegetation_on_mountains';
        const page = params.get('page');
        if (page && !isNaN(page)) this.currentPage = Math.max(1, parseInt(page));

        const dict = params.get(this.dictParam);
        this.dictKey = dict && WORD_NAME_MAP[dict] ? dict : 'toefl';
    }

    // loadArticleWords() 方法保持不变（前面已给出）

    async loadArticleWords() {
        if (!this.articleName) {
            this.showError('未指定文章参数：?article=xxx');
            return;
        }

        let articleTitle = this.articleName;

        // Step 1: 先查 index 获取真实文章标题（KeyName → Article）
        try {
            const idxRes = await fetch('/assets/data/toefl_data/toefl_reading_articles_index.json');
            if (idxRes.ok) {
                const index = await idxRes.json();
                const match = index.find(i => i.ParamName === this.articleName);
                if (match) articleTitle = match.Article || match.KeyName;
            }
        } catch (e) {
            console.warn('读取 articles_index.json 失败，使用 ParamName 继续尝试', e);
        }

        // Step 2: 读取所有文章的生词数据（大文件，只读一次）
        const jsonPath = '/assets/data/toefl_data/toefl_reading_articles_words.json';
        try {
            const res = await fetch(jsonPath);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const allData = await res.json();               // 数组

            // 找到当前文章的对象
            const articleData = allData.find(item => item.Article === articleTitle);
            if (!articleData) {
                throw new Error(`未找到文章 "${articleTitle}" 的生词数据`);
            }

            // 词库映射（和 WORD_NAME_MAP 保持一致，大写形式）
            const collectionMap = {
                junior: 'Junior',
                senior: 'Senior',
                cet4  : 'CET4',
                cet6  : 'CET6',
                toefl : 'TOEFL'
            };

            const collectionKey = collectionMap[this.dictKey] || 'TOEFL';
            const wordArray = articleData.Words[collectionKey] || [];

            // 统一转成 {word: "xxx"} 的结构，方便后面统一处理
            this.words = wordArray.map(w => ({ word: w }));
            this.totalPages = Math.ceil(this.words.length / this.pageSize) || 1;

        } catch (err) {
            this.showError(`加载生词失败<br>文章：${articleTitle}<br>错误：${err.message}`);
            console.error(err);
        }
    }

    // ==================================================
    // 2. render() 重写（只显示单词 + 带参数链接）
    // ==================================================
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageWords = this.words.slice(start, end);

        const wordsPerCol = Math.ceil(pageWords.length / this.columns);

        // 词库中文名称（用于标题和切换按钮）
        const dictDisplayName = WORD_NAME_MAP[this.dictKey] || this.dictKey.toUpperCase();

        let html = `
        <div class="toefl-vocab-header">
            <h2>${this.getDisplayTitle()} <br> ${dictDisplayName}（第 ${this.currentPage}/${this.totalPages} 页，共 ${this.words.length} 词）</h2>
            <div class="vocab-controls" id="paginator">
                <button class="ui-btn" id="prev-page"${this.currentPage <= 1 ? ' disabled' : ''}>上一页</button>
                <button class="ui-btn" id="next-page"${this.currentPage >= this.totalPages ? ' disabled' : ''}>下一页</button>
                <input class="ui-int-input" type="number" id="page-input" min="1" max="${this.totalPages}" value="${this.currentPage}">
                <button class="ui-btn" id="go-page">跳转</button>
                <button class="ui-btn" id="switch-dict">切换词库（当前：${dictDisplayName}）</button>
            </div>
        </div>`;

        // 表格只有一列（单词），但仍保持多列布局以兼容原来样式
        html += `<div class="md-typeset__scrollwrap"><div class="md-typeset__table"><table><thead><tr>`;
        for (let i = 0; i < this.columns; i++) {
            html += `<th>单词</th>`;
        }
        html += `</tr></thead><tbody>`;

        // ==================== 关键修改：改为水平填充（左→右，上→下） ====================
        const totalRows = Math.ceil(pageWords.length / this.columns);  // 实际需要的行数

        for (let row = 0; row < totalRows; row++) {
            html += `<tr>`;
            for (let col = 0; col < this.columns; col++) {
                const idx = row * this.columns + col;   // 关键：这里改成行优先
                const item = pageWords[idx];
                if (item) {
                    const word = item.word;
                    const link = `/Languages/English_Vocab/WordDetail/?word=${encodeURIComponent(word)}&collection=${this.dictKey}`;
                    html += `<td><a href="${link}" class="vocab-word-link" target="_blank"><strong>${word}</strong></a></td>`;
                } else {
                    html += `<td></td>`;
                }
            }
            html += `</tr>`;
        }
        html += `</tbody></table></div></div>`;
        container.innerHTML = html;

        // ========= 事件绑定（保持不变，只改一点点）=========
        const goTo = (page) => {
            page = Math.max(1, Math.min(this.totalPages, page));
            if (page !== this.currentPage) {
                this.currentPage = page;
                this.updateURL({ page: this.currentPage > 1 ? this.currentPage : null });
                this.render();
                window.scrollTo(0, 0);
            }
        };

        document.getElementById('prev-page')?.addEventListener('click', () => goTo(this.currentPage - 1));
        document.getElementById('next-page')?.addEventListener('click', () => goTo(this.currentPage + 1));
        document.getElementById('go-page')?.addEventListener('click', () => {
            const val = parseInt(document.getElementById('page-input').value) || 1;
            goTo(val);
        });
        document.getElementById('page-input')?.addEventListener('keypress', e => {
            if (e.key === 'Enter') document.getElementById('go-page').click();
        });

        // 切换词库 → 更换 dictKey 并重新加载对应词库的单词
        document.getElementById('switch-dict')?.addEventListener('click', async () => {
            const keys = Object.keys(WORD_NAME_MAP);
            const next = keys[(keys.indexOf(this.dictKey) + 1) % keys.length];

            this.dictKey = next;
            this.currentPage = 1;
            this.updateURL({ dict: next, page: null }, true);

            // 重新加载该词库的单词
            await this.loadArticleWords();
            this.render();
            window.scrollTo(0, 0);
        });
    }

    getDisplayTitle() {
        if (!this.articleName) return '托福阅读生词';
        const map = {
            'groundwater_tpo01': 'Groundwater (TPO01)',
            'groundwater_tpo28': 'Groundwater (TPO28)',
        };
        return map[this.articleName] || this.articleName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }

    updateURL(params, replace = false) {
        const url = new URL(location);
        Object.entries(params).forEach(([k, v]) => {
            if (v === undefined || v === null) url.searchParams.delete(k);
            else url.searchParams.set(k, v);
        });
        if (params.page === 1) url.searchParams.delete('page');
        history[replace ? 'replaceState' : 'pushState']({}, '', url);
    }

    showError(msg) {
        document.getElementById(this.containerId).innerHTML = `
            <div class="md-typeset" style="text-align:center;padding:4rem;color:var(--md-default-fg-color--light)">
                <h3>加载失败</h3>
                <p>${msg}</p>
                <p><a href="../ArtiSubjClasList/">返回分类表</a></p>
            </div>`;
    }
}

// ==============================
// 启动（保留你原有词库映射）
// ==============================
const WORD_NAME_MAP = {
    "junior": "初中词汇",
    "senior": "高中词汇",
    "cet4": "四级词汇",
    "cet6": "六级词汇",
    "toefl": "托福词汇"
};

// 页面加载完成后启动
document.addEventListener("DOMContentLoaded", () => {
    window.toeflViewer = new TOEFLVocabViewer({
        containerId: 'toefl-vocab-container',
        pageSize: 36,
        columns: 3
    });
});