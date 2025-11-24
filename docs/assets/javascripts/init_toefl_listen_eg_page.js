function splitAfterColon(strings) {
    return strings.map(str => {
        const index = str.indexOf(':');
        return index === -1 ? str : str.substring(index + 1);
    });
}

function RenderTask(taskText, taskSetting) {
    const container = document.getElementById("text-container");
    //container.innerHTML = ""; // 清空旧内容

    // ========== 工具函数 ==========
    const createEl = (tag, text, className) => {
        const el = document.createElement(tag);
        if (text) el.textContent = text;
        if (className) el.className = className;
        return el;
    };

    const renderParagraph = (line) => {
        const p = createEl("p", line);
        container.appendChild(p);
    };

    const renderDialogueLine = (line, index, parent) => {
        const wrapper = document.createElement("div");
        wrapper.className = index % 2 === 0 ? "message incoming" : "message outgoing";

        const p = document.createElement("p");
        p.textContent = line;

        wrapper.appendChild(p);
        parent.appendChild(wrapper);
    };

    // ========== 1. 渲染 Task 标题 ==========
    const h2 = createEl("h2", `Task ${taskText.TaskNumber}`);
    container.appendChild(h2);

    // ========== 2. 判断存在 Reading ==========
    if (taskSetting.hasReading === "1") {
        const hReading = createEl("p", "Reading", "section-title");
        container.appendChild(hReading);

        const reading = taskText.Reading;

        if (taskSetting.readingHasTitle === "1") {
            // 第一行标题居中
            const title = createEl("p", reading[0], "reading-title");
            container.appendChild(title);

            // 其余为正文
            for (let i = 1; i < reading.length; i++) {
                renderParagraph(reading[i]);
            }
        } else {
            reading.forEach(renderParagraph);
        }
    }

    // ========== 3. 判断存在 Listening ==========
    if (taskSetting.hasListening === "1") {

        container.appendChild(document.createElement('hr'));

        const hListening = createEl("p", "Listening", "section-title");
        container.appendChild(hListening);

        const listening = splitAfterColon(taskText.Listening);
        let startIdx = 0;

        if (taskSetting.listeningFirstIsIntro === "1") {
            const intro = createEl("p", listening[0], "intro-line");
            container.appendChild(intro);
            startIdx = 1;
        }

        const chatCard = document.createElement("div");
        chatCard.className = "chat-card";

        const chatHeader = document.createElement("div");
        chatHeader.className = "chat-header";
        const headerTitle = document.createElement("div");
        headerTitle.className = "h2";
        headerTitle.textContent = "聊天记录";
        chatHeader.appendChild(headerTitle);

        const chatBody = document.createElement("div");
        chatBody.className = "chat-body";

        chatCard.appendChild(chatHeader);
        chatCard.appendChild(chatBody);
        container.appendChild(chatCard);

        if (taskSetting.listeningIsDialogue === "1") {
            // 对话（跳过 intro 行）
            for (let i = startIdx; i < listening.length; i++) {
                renderDialogueLine(listening[i], i - startIdx, chatBody);
            }
        } else {
            chatCard.remove();
            // 普通段落
            for (let i = startIdx; i < listening.length; i++) {
                renderParagraph(listening[i]);
            }
        }
    }

    // ========== 4. Texts 部分渲染 ==========
    if (taskSetting.hasTexts === "1") {
        const chatCard = document.createElement("div");
        chatCard.className = "chat-card";

        const texts = splitAfterColon(taskText.Texts);
        let startIdx = 0;

        if (taskSetting.textsFirstIsIntro === "1") {
            const intro = createEl("p", texts[0], "intro-line");
            container.appendChild(intro);
            startIdx = 1;
        }

        const chatHeader = document.createElement("div");
        chatHeader.className = "chat-header";
        const headerTitle = document.createElement("div");
        headerTitle.className = "h2";
        headerTitle.textContent = "聊天记录";
        chatHeader.appendChild(headerTitle);

        const chatBody = document.createElement("div");
        chatBody.className = "chat-body";

        chatCard.appendChild(chatHeader);
        chatCard.appendChild(chatBody);
        container.appendChild(chatCard);

        if (taskSetting.textsIsDialogue === "1") {
            for (let i = startIdx; i < texts.length; i++) {
                renderDialogueLine(texts[i], i - startIdx, chatBody);
            }
        } else {
            chatCard.remove();
            for (let i = startIdx; i < texts.length; i++) {
                renderParagraph(texts[i]);
            }
        }
    }
}

const TPO_DATA_URL = '/assets/data/toefl_data/toefl_tpo1-55_listening_text.json';
const TPO_FLAGS_URL = '/assets/data/toefl_data/toefl_tpo1-55_listening_text_structure_flags.json'; 

let tpoData = [];       // 源数据（TPO 列表）
let tpoFlags = [];      // 结构标记列表
let currentPage = 1;    // 当前页（对应 tpoData 的索引 + 1）
let totalPages = 1;

// ===================== 1. 环境判断函数 =====================
function isLocalHttps() {
  const { protocol, hostname } = window.location;
  // 你可以按自己实际情况再扩展判断条件
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local');

  return isLocalHost;
}

// ===================== 2. URL 参数工具 =====================
function getTpoFromSearchParam() {
  const params = new URLSearchParams(window.location.search);
  const tpoParam = params.get('TPO');
  if (!tpoParam) return null;
  const num = parseInt(tpoParam, 10);
  return Number.isNaN(num) ? null : num;
}

function setTpoSearchParam(tpoNumber) {
  const url = new URL(window.location.href);
  url.searchParams.set('TPO', String(tpoNumber));
  // 不刷新的情况下更新地址
  window.history.replaceState({}, '', url.toString());
}

// ===================== 3. 结构标记查找 / 默认设置构造 =====================
function findTaskSetting(tpoNo, taskNo) {
  if (!Array.isArray(tpoFlags)) return null;
  return (
    tpoFlags.find(
      (row) =>
        String(row.TPO) === String(tpoNo) &&
        String(row.Task) === String(taskNo)
    ) || null
  );
}

// 如果 flags 里没有对应记录，就用简单规则构造一个 setting
function buildFallbackSetting(task) {
  const hasReading = task.Reading && task.Reading.length > 0;
  const hasListening = task.Listening && task.Listening.length > 0;
  const hasTexts = task.Texts && task.Texts.length > 0;

  const readingHasTitle = hasReading && task.Reading.length > 1 ? 1 : 0;

  const firstListening = hasListening ? task.Listening[0] : '';
  const firstTexts = hasTexts ? task.Texts[0] : '';

  const looksLikeIntro = (line) => {
    if (!line) return false;
    const s = line.trim().toLowerCase();
    return (
      s.startsWith('now listen') ||
      s.startsWith('listen to') ||
      s.startsWith('now listen to')
    );
  };

  const looksLikeDialogueIntro = (line) => {
    if (!line) return false;
    const s = line.toLowerCase();
    return (
      s.includes('conversation between') ||
      s.includes('conversation with') ||
      s.includes('two students') ||
      s.includes('between a student and') ||
      s.includes('between a professor and')
    );
  };

  return {
    hasReading: hasReading ? '1' : '0',
    hasListening: hasListening ? '1' : '0',
    hasTexts: hasTexts ? '1' : '0',
    readingHasTitle: readingHasTitle ? '1' : '0',
    listeningFirstIsIntro: looksLikeIntro(firstListening) ? '1' : '0',
    textsFirstIsIntro: looksLikeIntro(firstTexts) ? '1' : '0',
    listeningIsDialogue: looksLikeDialogueIntro(firstListening) ? '1' : '0',
    textsIsDialogue: looksLikeDialogueIntro(firstTexts) ? '1' : '0'
  };
}

// ===================== 4. 渲染 TPO（内部多次调用 RenderTask） =====================
function RenderTPO(tpoEntry) {
  const container = document.getElementById('text-container');
  if (!container) return;

  container.innerHTML = ''; // 清空

  // TPO 级别标题
  /*const h1 = document.createElement('h1');
  h1.textContent = `TPO ${tpoEntry.TPO}`;
  container.appendChild(h1);*/

  // 依次渲染该 TPO 下的所有 Task
  (tpoEntry.Tasks || []).forEach((task) => {

    // 找到该 Task 对应的 setting
    const settingFromFlags = findTaskSetting(tpoEntry.TPO, task.TaskNumber);
    const taskSetting =
      settingFromFlags || buildFallbackSetting(task);

    // 每个 Task 之间加一个分隔（可选）
    const hr = document.createElement('hr');
    container.appendChild(hr);

    // 这里调用你已经实现好的 RenderTask(task, setting)
    RenderTask(task, taskSetting);
  });
}

// ===================== 5. 分页相关 =====================
function renderPage(pageIndex) {
  // pageIndex 从 1 开始
  if (!Array.isArray(tpoData) || tpoData.length === 0) return;

  const idx = pageIndex - 1;
  if (idx < 0 || idx >= tpoData.length) return;

  const tpoEntry = tpoData[idx];
  currentPage = pageIndex;

  // 渲染当前 TPO
  RenderTPO(tpoEntry);

  // 更新页信息
  updatePageInfo();

  // 同步 URL search param: ?TPO=该页对应的 TPO 编号
  setTpoSearchParam(tpoEntry.TPO);
}

function updatePageInfo() {
  const pageInfoEl = document.getElementById('page-info');
  const pageInputEl = document.getElementById('page-input');

  if (pageInfoEl) {
    pageInfoEl.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
  }
  if (pageInputEl) {
    pageInputEl.value = currentPage;
  }
}

// 公共跳转函数
function goToPage(page) {
  const targetPage = parseInt(page, 10);
  if (
    !Number.isNaN(targetPage) &&
    targetPage >= 1 &&
    targetPage <= totalPages
  ) {
    renderPage(targetPage);
  }
}

// 绑定分页器按钮
function setupPaginator() {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const goBtn = document.getElementById('go-page');
  const pageInputEl = document.getElementById('page-input');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        renderPage(currentPage - 1);
        scrollTo(0,0);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        renderPage(currentPage + 1);
        scrollTo(0,0);
      }
    });
  }

  if (goBtn && pageInputEl) {
    goBtn.addEventListener('click', () => {
      const input = pageInputEl.value;
      goToPage(input);
      scrollTo(0,0);
    });
  }
}

// ===================== 6. 初始化逻辑 =====================
async function initToeflListenPage() {
  const container = document.getElementById('text-container');
  if (!container) return;

  // 如果不是本地 https 环境：只展示 sample 示例 + 简单分页信息
  if (!isLocalHttps()) {
    // sampleTaskText / sampleSetting 从你的 html 中的 <script> 里拿
    RenderTask(sampleTaskText, sampleSetting);
    currentPage = 1;
    totalPages = 1;
    updatePageInfo();
    return;
  }

  // 本地环境：尝试拉取两个 JSON
  try {
    const [tpoResp, flagsResp] = await Promise.all([
      fetch(TPO_DATA_URL),
      fetch(TPO_FLAGS_URL)
    ]);

    if (!tpoResp.ok || !flagsResp.ok) {
      throw new Error('Fetch JSON failed');
    }

    tpoData = await tpoResp.json();
    tpoFlags = await flagsResp.json();

    if (!Array.isArray(tpoData)) {
      throw new Error('TPO data is not an array');
    }

    totalPages = tpoData.length;
    setupPaginator();

    // 初始页：优先看 URL ?TPO= 参数
    const tpoParam = getTpoFromSearchParam();
    if (tpoParam != null) {
      const idx = tpoData.findIndex(
        (item) => String(item.TPO) === String(tpoParam)
      );
      if (idx !== -1) {
        renderPage(idx + 1);
        return;
      }
    }

    // 默认从第一页开始
    renderPage(1);
  } catch (err) {
    console.error('Init TOEFL page failed, fallback to sample:', err);
    // 任一环节失败：退回示例模式（保证页面可用）
    RenderTask(sampleTaskText, sampleSetting);
    currentPage = 1;
    totalPages = 1;
    updatePageInfo();
  }
}

// DOM Ready 后启动
document.addEventListener('DOMContentLoaded', initToeflListenPage);