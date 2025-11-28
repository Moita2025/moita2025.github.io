// init_toefl_listen_eg_page.js （极简重构版）

const TPO_DATA_URL = '/assets/data/toefl_data/toefl_tpo1-55_listening_text.json';
const TPO_FLAGS_URL = '/assets/data/toefl_data/toefl_tpo1-55_listening_text_structure_flags.json';

let tpoData = [];
let tpoFlags = [];

// ===================== 工具函数 =====================
const createEl = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
};

const renderParagraph = (line, container) => {
    container.appendChild(createEl("p", line));
};

// ===================== RenderTask（保持不变或微调）=====================
function RenderTask(taskText, taskSetting, container) {
    // 1. Task 标题
    container.appendChild(createEl("h2", `Task ${taskText.TaskNumber}`));

    // 2. Reading
    if (taskSetting.hasReading === "1") {
        container.appendChild(createEl("p", "Reading", "section-title"));
        const reading = taskText.Reading || [];

        if (taskSetting.readingHasTitle === "1" && reading.length > 0) {
            container.appendChild(createEl("p", reading[0], "reading-title"));
            reading.slice(1).forEach(line => renderParagraph(line, container));
        } else {
            reading.forEach(line => renderParagraph(line, container));
        }
    }

    // 3. Listening
    if (taskSetting.hasListening === "1") {
        container.appendChild(document.createElement('hr'));
        container.appendChild(createEl("p", "Listening", "section-title"));

        const listening = window.Utils.str.splitAfterColon(taskText.Listening);
        let startIdx = 0;

        if (taskSetting.listeningFirstIsIntro === "1") {
            container.appendChild(createEl("p", listening[0], "intro-line"));
            startIdx = 1;
        }

        window.Utils.ui.generateDialogue(
            listening.slice(startIdx),
            container,
            taskSetting.listeningIsDialogue === "1"
        );
    }

    // 4. Texts
    if (taskSetting.hasTexts === "1") {
        const texts = window.Utils.str.splitAfterColon(taskText.Texts);
        let startIdx = 0;

        if (taskSetting.textsFirstIsIntro === "1") {
            container.appendChild(createEl("p", texts[0], "intro-line"));
            startIdx = 1;
        }

        window.Utils.ui.generateDialogue(
            texts.slice(startIdx),
            container,
            taskSetting.textsIsDialogue === "1"
        );
    }
}

// ===================== 查找结构标记 & 兜底规则 =====================
function findTaskSetting(tpoNo, taskNo) {
    //console.log(tpoFlags);
    return tpoFlags.find(r => String(r.TPO) === String(tpoNo) && String(r.Task) === String(taskNo)) || null;
}

function buildFallbackSetting(task) {
    const has = (arr) => arr && arr.length > 0;
    const first = (arr) => has(arr) ? arr[0] : '';

    const looksLikeIntro = (s) => /now listen|listen to/i.test(s || '');
    const looksLikeDialogue = (s) => /conversation|two students|professor|student/i.test(s || '');

    return {
        hasReading: has(task.Reading) ? '1' : '0',
        hasListening: has(task.Listening) ? '1' : '0',
        hasTexts: has(task.Texts) ? '1' : '0',
        readingHasTitle: has(task.Reading) && task.Reading.length > 1 ? '1' : '0',
        listeningFirstIsIntro: looksLikeIntro(first(task.Listening)) ? '1' : '0',
        textsFirstIsIntro: looksLikeIntro(first(task.Texts)) ? '1' : '0',
        listeningIsDialogue: looksLikeDialogue(first(task.Listening)) ? '1' : '0',
        textsIsDialogue: looksLikeDialogue(first(task.Texts)) ? '1' : '0'
    };
}

// ===================== 渲染单个 TPO =====================
function renderTPO(tpoEntry, container) {
    container.innerHTML = '';

    (tpoEntry.Tasks || []).forEach(task => {
        const setting = findTaskSetting(tpoEntry.TPO, task.TaskNumber) || buildFallbackSetting(task);

        // Task 之间加分隔线
        if (container.children.length > 0) {
            container.appendChild(document.createElement('hr'));
        }

        RenderTask(task, setting, container);
    });

    // 更新标题
    window.Utils.mkdocsRewrite.rewriteMainTitle({
        label: `示例 (TPO ${tpoEntry.TPO})`,
        append: false,
        brackets: false
    });
    window.Utils.mkdocsRewrite.rewriteToc();
    window.Utils.mkdocsRewrite.rewriteNav({
        rewrite_nav_items: ["示例"],
        label: `示例 (TPO ${tpoEntry.TPO})`,
        append: false,
        brackets: false,
        paramName: "TPO"
    });

    // 同步 URL 同步 TPO 参数
    window.Utils.url.updateSearchParams({ TPO: tpoEntry.TPO });
}

// ===================== 初始化 =====================
async function initToeflListenPage() {
    const container = document.getElementById('text-container');
    if (!container) return;

    // 非本地 https 环境 → 直接展示 sample
    if (!window.Utils.url.isLocalHttps()) {
        RenderTask(sampleTaskText, sampleSetting, container);
        return;
    }

    try {
        const [dataResp, flagsResp] = await Promise.all([
            fetch(TPO_DATA_URL),
            fetch(TPO_FLAGS_URL)
        ]);

        if (!dataResp.ok || !flagsResp.ok) throw new Error('fetch failed');

        tpoData = await dataResp.json();
        tpoFlags = await flagsResp.json();

        if (!Array.isArray(tpoData) || tpoData.length === 0) throw new Error('no data');

        // ========== 使用统一的 Utils.ui.pagination ==========
        window.Utils.ui.pagination.init({
            totalItems: tpoData.length,
            pageSize: 1,                            // 每页 1 个 TPO
            onChange: (page) => {
                const entry = tpoData[page - 1];
                renderTPO(entry, container);
                scrollTo(0, 0);
            }
        });

        // 优先读取 URL 中的 ?TPO= 参数
        const urlTPO = window.Utils.url.getSearchParam({ paramName: "TPO", isInt: true });
        if (urlTPO != null) {
            const idx = tpoData.findIndex(item => String(item.TPO) === String(urlTPO));
            if (idx !== -1) {
                renderTPO(tpoData[idx], container);
                return;
            }
        }

        // 默认第一页
        renderTPO(tpoData[0], container);

    } catch (err) {
        console.error('加载 TPO 数据失败，回退到示例', err);
        RenderTask(sampleTaskText, sampleSetting, container);
    }
}

document.addEventListener('DOMContentLoaded', initToeflListenPage);