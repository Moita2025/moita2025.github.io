const PAGE_SIZE = 20;
window.words = [];
let currentPage = 1;
let totalPages = 1;

const pageParam = new URLSearchParams(window.location.search).get("page");

if (pageParam)
{
    currentPage = pageParam;
}

// 渲染表格
function renderPage(page, colFactor = 2, isColArrange = false) {
    const start = (page - 1) * PAGE_SIZE;
    const end = page * PAGE_SIZE;
    const pageWords = window.words.slice(start, end);

    const rows = Math.ceil(PAGE_SIZE / colFactor); // 计算行数
    const cols = colFactor * 2;                    // 每列显示单词 + 中文

    let html = `<table>`;

    // === 动态生成 thead ===
    html += `<thead><tr>`;
    for (let c = 0; c < colFactor; c++) {
        html += `<th>单词</th><th>中文意思</th>`;
    }
    html += `</tr></thead>`;

    // === 生成 tbody ===
    html += `<tbody>`;

    for (let r = 0; r < rows; r++) {
        html += `<tr>`;

        for (let c = 0; c < colFactor; c++) {
            let index;
            if (isColArrange) {
                // 按列填充（纵向）
                index = r + c * rows;
            } else {
                // 按行填充（横向）
                index = c + r * colFactor;
            }

            const item = pageWords[index];

            if (item) {
                html += `
                <td><a href="/Languages/English_Vocab/WordDetail/?word=${item.word}&collection=${window.currentWordKey}" target="_blank">
                <strong>${item.word}<strong></a></td>
                <td>${item.translations[0].translation}</td>
                `;
            } else {
                //html += `<td></td><td></td>`; // 空位填充
            }
        }

        html += `</tr>`;
    }

    html += `</tbody></table>`;

    document.getElementById('words-table-container').innerHTML = html;
}


// 更新分页信息
function updatePageInfo() {
    document.getElementById('page-info').textContent = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
    document.getElementById('page-input').value = currentPage;
}

// 分页按钮事件
document.getElementById('prev-page').addEventListener('click', () => {
    if(currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
        updatePageInfo();
        updateSearchParams({ page: currentPage });
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    if(currentPage < totalPages) {
        currentPage++;
        renderPage(currentPage);
        updatePageInfo();
        updateSearchParams({ page: currentPage });
    }
});

// ✅ 新增：抽成公共函数
function goToPage(page) {
    const targetPage = parseInt(page);
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
        currentPage = targetPage;
        renderPage(currentPage);
        updatePageInfo();
        updateSearchParams({ page: currentPage });
    }
}

// 保留原来的按钮绑定，调用公共函数
document.getElementById('go-page').addEventListener('click', () => {
    const input = document.getElementById('page-input').value;
    goToPage(input);
});

// 初始化
initWordsGeneric(
    'wordsReady',
    function(words) {
        window.words = words;
        totalPages = Math.ceil(words.length / PAGE_SIZE);
        renderPage(currentPage);
        updatePageInfo();
    }
);
