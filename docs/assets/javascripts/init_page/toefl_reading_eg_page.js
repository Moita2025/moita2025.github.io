const ARTICLE_DATA_URL = '/assets/data/toefl_data/toefl_reading_articles.json';
const ARTICLE_KEYS_URL = '/assets/data/toefl_data/toefl_reading_articles_index.json'; 

let articleData = [];  
let currentPage = 1; 
let totalPages = 1;

function RenderArticle(tpoEntry) {
    const container = document.getElementById('text-container');
    if (!container) return;

    container.innerHTML = ''; // 清空

    container.innerHTML += `
        <h2 style="text-align:center;">${tpoEntry.ArticleName}</h2>
    `;

    for(paragraph in tpoEntry.Paragraphs)
    {
        container.innerHTML += `
        <p>${tpoEntry.Paragraphs[paragraph]}</p>
        `;
    }

    container.innerHTML += `
        <h2>Questions</h2>
    `;

    for(const question of tpoEntry.Questions)
    {
        container.innerHTML += `
        <p>
            <strong>Paragraph ${question.Paragraph}</strong>
            ${question.QuestionText}
        </p>
        `;

        var choiceULEL = document.createElement("ol");
        choiceULEL.type = "A";
        for(const choice of question.Choices)
        {
            choiceULEL.innerHTML += `
                <li>${choice}</li>
            `;
        }
        container.appendChild(choiceULEL);

        var correctChoicesEL = document.createElement("details");
        for(const correctchoice of question.CorrectChoices)
        {
            correctChoicesEL.innerHTML += `
                <p>${correctchoice}</p>
            `;
        }
        correctChoicesEL.setAttribute('open', '');
        container.appendChild(correctChoicesEL);
    }
}

// ===================== 5. 分页相关 =====================
function renderPage(pageIndex) {
    // pageIndex 从 1 开始
    if (!Array.isArray(articleData) || articleData.length === 0) return;

    const idx = pageIndex - 1;
    if (idx < 0 || idx >= articleData.length) return;

    const tpoEntry = articleData[idx];
    currentPage = pageIndex;

    // 渲染当前 TPO
    RenderArticle(tpoEntry);

    window.Utils.url.updateSearchParams({ page: pageIndex });

    window.Utils.mkdocsRewrite.rewriteToc();
}

// ===================== 6. 初始化逻辑 =====================
async function initToeflReadPage() {
    const container = document.getElementById('text-container');
    if (!container) return;

    // 如果不是本地 https 环境：只展示 sample 示例 + 简单分页信息
    if (!window.Utils.url.isLocalHttps()) {
        // sampleTaskText / sampleSetting 从你的 html 中的 <script> 里拿
        RenderArticle(sampleArticle);
        currentPage = 1;
        totalPages = 1;
        return;
    }

    // 本地环境：尝试拉取两个 JSON
    try {
        const [dataResp, keyResp] = await Promise.all([
            fetch(ARTICLE_DATA_URL),
            fetch(ARTICLE_KEYS_URL)
        ]);

        if (!dataResp.ok || !keyResp.ok) {
            throw new Error('Fetch JSON failed');
        }

        articleData = await dataResp.json();

        if (!Array.isArray(articleData)) {
            throw new Error('articleData is not an array');
        }

        totalPages = articleData.length;
        
        window.Utils.ui.pagination.init({
            totalItems: totalPages,
            pageSize: 1,                            // 每页 1 个 TPO
            onChange: (page) => {
                const entry = articleData[page - 1];
                RenderArticle(entry);
                scrollTo(0, 0);
            }
        });

        const pageParam = window.Utils.url.getSearchParam({ 
            paramName: "page",
            isInt: true,
            defaultParam: 1
        });

        renderPage(pageParam);

    } catch (err) {
        console.error('Init TOEFL page failed, fallback to sample:', err);
        // 任一环节失败：退回示例模式（保证页面可用）
        RenderArticle(sampleArticle);
        currentPage = 1;
        totalPages = 1;
    }
}

// DOM Ready 后启动
document.addEventListener('DOMContentLoaded', initToeflReadPage);
