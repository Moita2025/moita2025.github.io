const ARTICLE_DATA_URL = '/assets/data/toefl_data/toefl_reading_articles.json';
const ARTICLE_KEYS_URL = '/assets/data/toefl_data/toefl_reading_articles_index.json'; 

let articleData = [];  
let currentPage = 1; 
let totalPages = 1;

const sampleArticle = {
  "ArticleName": "火星上的液态水证据",
  "Type": "TPO",
  "SerialNumber": "TPO-Practice-01",
  "Paragraphs": [
    "科学家们长期以来一直在寻找火星表面曾经存在液态水的明确证据。2015年，美国国家航空航天局（NASA）宣布了一项重大发现：火星上存在季节性的暗窄条纹（recurring slope lineae，简称RSL），这些条纹在温暖的季节会出现并延长，在较冷的季节则会逐渐消失。这种现象最有可能由含盐的液态水流动造成。",
    "这些季节性条纹通常出现在火星赤道附近的高陡坡上，宽度只有0.5到5米，但长度可达数百米。光谱仪数据显示，这些条纹区域含有水合盐类（perchlorates），这种盐能大幅降低水的冰点，使水在火星低温低压的环境中仍能保持液态。研究人员认为，RSL很可能是在火星浅层地下渗出的少量盐水沿坡面流动形成的。",
    "尽管这一发现极大地提升了火星过去或现在存在生命的可能性，但科学家也指出，目前还不能100%确定这些条纹就是液态水流动造成的。其他可能的解释包括干沙流动或季节性二氧化碳霜的升华。然而，大多数研究者认为，含水合盐的液态水是最合理的解释。这一发现促使NASA重新评估火星探测任务中的行星保护政策，以避免地球微生物污染潜在的火星水体。"
  ],
  "Questions": [
    {
      "Paragraph": 1,
      "QuestionText": "The word \"explicit\" in the passage is closest in meaning to",
      "Choices": [
        "clear and direct",
        "temporary",
        "possible",
        "ancient"
      ],
      "CorrectChoices": ["clear and direct"],
      "Analysis": ["explicit 表示‘明确的、不含糊的’，与 clear and direct 意思最接近。"]
    },
    {
      "Paragraph": 2,
      "QuestionText": "The word \"these\" in paragraph 2 refers to",
      "Choices": [
        "steep slopes",
        "seasonal streaks",
        "spectrometers",
        "perchlorates"
      ],
      "CorrectChoices": ["seasonal streaks"],
      "Analysis": ["these 指代前一句中出现的 seasonal streaks（季节性条纹），后文紧接着描述这些条纹的宽度和长度。"]
    },
    {
      "Paragraph": 2,
      "QuestionText": "Which of the following best expresses the essential information in the highlighted sentence? \"这种盐能大幅降低水的冰点，使水在火星低温低压的环境中仍能保持液态。\"",
      "Choices": [
        "This salt can significantly lower the freezing point of water, allowing it to remain liquid even in Mars' cold, low-pressure environment.",
        "This salt can raise the temperature on Mars so that water does not freeze.",
        "This salt prevents water from evaporating quickly under Mars' low pressure.",
        "This salt is the main reason why Mars has a cold and dry climate."
      ],
      "CorrectChoices": ["This salt can significantly lower the freezing point of water, allowing it to remain liquid even in Mars' cold, low-pressure environment."],
      "Analysis": ["句子简化题需保留原句核心信息：盐类降低冰点 → 在低温低压下仍保持液态。第一选项完全忠实原文。"]
    },
    {
      "Paragraph": 3,
      "QuestionText": "According to paragraph 3, what has the discovery of RSL caused NASA to do?",
      "Choices": [
        "Cancel all future Mars missions",
        "Reassess planetary protection policies",
        "Confirm that life exists on Mars",
        "Stop studying perchlorates"
      ],
      "CorrectChoices": ["Reassess planetary protection policies"],
      "Analysis": ["细节题。原文倒数第二句明确提到：This discovery has prompted NASA to reassess planetary protection policies..."]
    },
    {
      "Paragraph": 3,
      "QuestionText": "What can be inferred from paragraph 3 about the possibility of life on Mars?",
      "Choices": [
        "It has been completely ruled out.",
        "The discovery of RSL has greatly increased the estimated possibility.",
        "Scientists are certain that microbial life exists in RSL.",
        "The possibility remains exactly the same as before the discovery."
      ],
      "CorrectChoices": ["The discovery of RSL has greatly increased the estimated possibility."],
      "Analysis": ["推断题。原文提到‘这一发现极大地提升了火星过去或现在存在生命的可能性’，直接支持第二选项。其他选项要么过于绝对，要么与原文矛盾。"]
    }
  ]
};

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
function getPageFromSearchParam() {
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get('page');
  if (!pageParam) return null;
  const num = parseInt(pageParam, 10);
  return Number.isNaN(num) ? null : num;
}

function RenderArticle(tpoEntry) {
  const container = document.getElementById('text-container');
  if (!container) return;

  container.innerHTML = ''; // 清空

  container.innerHTML += `
    <h2>${tpoEntry.ArticleName}</h2>
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

  // 更新页信息
  updatePageInfo();

  updateSearchParams({ page: pageIndex });

  rewriteMainTitle();
  rewriteMkdocsToc();
}

function updatePageInfo() {
  const pageInfoEls = document.querySelectorAll('.page-info_duplicate');
  const pageInputEls = document.querySelectorAll('.page-input_duplicate');

  pageInfoEls.forEach(el => {
    el.textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
  });

  pageInputEls.forEach(input => {
    input.value = currentPage;
  });
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
  const paginators = document.querySelectorAll('.paginator_duplicate');

  paginators.forEach(p => {
    const prevBtn = p.querySelector('.prev-page_duplicate');
    const nextBtn = p.querySelector('.next-page_duplicate');
    const goBtn = p.querySelector('.go-page_duplicate');
    const pageInputEl = p.querySelector('.page-input_duplicate');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          renderPage(currentPage - 1);
          syncPaginatorInputs();
          scrollTo(0, 0);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          renderPage(currentPage + 1);
          syncPaginatorInputs();
          scrollTo(0, 0);
        }
      });
    }

    if (goBtn && pageInputEl) {
      goBtn.addEventListener('click', () => {
        goToPage(pageInputEl.value);
        syncPaginatorInputs();
        scrollTo(0,0);
      });
    }
  });
}

function syncPaginatorInputs() {
  document.querySelectorAll('.paginator_duplicate .page-input_duplicate')
    .forEach(input => input.value = currentPage);
}

// ===================== 6. 初始化逻辑 =====================
async function initToeflReadPage() {
  const container = document.getElementById('text-container');
  if (!container) return;

  // 如果不是本地 https 环境：只展示 sample 示例 + 简单分页信息
  if (!isLocalHttps()) {
    // sampleTaskText / sampleSetting 从你的 html 中的 <script> 里拿
    RenderArticle(sampleArticle);
    currentPage = 1;
    totalPages = 1;
    updatePageInfo();
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
    setupPaginator();

    // 初始页：优先看 URL ?TPO= 参数
    const pageParam = getPageFromSearchParam();
    if (pageParam != null) {
      renderPage(pageParam);
      return;
    }

    // 默认从第一页开始
    renderPage(1);
  } catch (err) {
    console.error('Init TOEFL page failed, fallback to sample:', err);
    // 任一环节失败：退回示例模式（保证页面可用）
    RenderArticle(sampleArticle);
    currentPage = 1;
    totalPages = 1;
    updatePageInfo();
  }
}

// DOM Ready 后启动
document.addEventListener('DOMContentLoaded', initToeflReadPage);

function rewriteMainTitle() {
    const h1 = document.querySelector(".md-typeset h1");
    if (!h1) return;

    const label = "示例";
    if (h1.innerText.includes(label)) {
        h1.innerText = `示例 (${currentPage})`;
    }
}

function rewriteMkdocsToc() {
  const container = document.querySelector('.md-nav.md-nav--secondary');
  const article = document.querySelector('.md-typeset');
  if (!container || !article) return;

  // 清空旧 toc（避免重复）
  container.innerHTML = "";

  // 1. 创建 Toc 标题 label
  const label = document.createElement('label');
  label.className = 'md-nav__title';
  label.setAttribute('for', '__toc');
  label.innerHTML = `
      <span class="md-nav__icon md-icon"></span>
      Table of contents
  `;
  container.appendChild(label);

  // 2. 创建 TOC ul
  const ul = document.createElement('ul');
  ul.className = 'md-nav__list';
  ul.dataset.mdComponent = 'toc';
  container.appendChild(ul);

  // 3. 找到所有 h2
  const h2s = article.querySelectorAll('h2');

  h2s.forEach(h2 => {
    // h2 文本
    const title = h2.textContent.trim();

    // 生成 id（简单 slug，可根据需要增强）
    const id = title.replace(/\s+/g, '-').replace(/[^\w\-]/g, '').toLowerCase();

    // 给 h2 设置 id
    h2.id = id;

    // 生成 li
    const li = document.createElement('li');
    li.className = 'md-nav__item';

    li.innerHTML = `
      <a href="#${id}" class="md-nav__link">
        <span class="md-ellipsis">
          ${title}
        </span>
      </a>
    `;

    ul.appendChild(li);
  });
}
