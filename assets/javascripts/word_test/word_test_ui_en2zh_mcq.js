const TestUI = {
    app: null,
    isInit: false,

    init() {
        if (this.isInit) return;

        this.app = document.getElementById("test-app");
        this.renderQuestion();

        this.isInit = true;
    },

    renderQuestion() {
        const q = TestEngine.getCurrent();
        if (!q) {
            this.renderResult();
            return;
        }

        const word = b64d(q.word);
        const options = q.options.map(o => ({ 
            raw: o, 
            text: b64d(o) 
        }));

        this.app.innerHTML = `
            <div class="test-progress">
                <div class="bar" style="width:${(TestEngine.currentIndex / 50) * 100}%"></div>
            </div>

            <div class="test-count">
                ${TestEngine.currentIndex + 1} / 50
            </div>

            <div class="test-word">${word}</div>

            <div class="test-options">
                ${options.map(o => `
                    <button class="opt-btn" data-opt="${o.raw}">${o.text}</button>
                `).join("")}
            </div>

            <div class="test-end">
                <button id="end-now" class="ui-btn">提前结束</button>
            </div>
        `;

        // 绑定事件
        document.querySelectorAll(".opt-btn").forEach(btn => {
            btn.onclick = () => {
                TestEngine.answer(btn.dataset.opt);
                if (TestEngine.hasNext()) {
                    this.renderQuestion();
                } else {
                    this.renderResult();
                }
            };
        });

        document.getElementById("end-now").onclick = () => {
            this.renderResult();
        };
    },

    // 结束页
    renderResult() {
        const r = TestEngine.result;

        // 如果已经存在 chart，先销毁，避免重复渲染
        if (this.chart) {
            this.chart.destroy();
        }

        this.app.innerHTML = `
            <div class="result-chart">
                <canvas id="resultChart" width="160" height="160"></canvas>
                <div class="result-text">
                    正确：${r.correct}  
                    错误：${r.wrong}  
                    未完成：${r.unfinished}
                </div>
                <button onclick="location.reload()" class="ui-btn">重新开始</button>
            </div>

            <h3>错误单词：</h3>
            <div class="wrong-list">
                ${this.renderWrongWords()}
            </div>
        `;

        const ctx = document.getElementById('resultChart');

        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ["正确", "错误", "未完成"],
                datasets: [{
                    data: [r.correct, r.wrong, r.unfinished],
                    backgroundColor: [
                        '#4caf50',
                        '#f44336',
                        '#ccc'
                    ]
                }]
            },
            options: {
                responsive: false,
                animation: {
                    animateRotate: true,
                    duration: 1200
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    renderWrongWords() {
        if (TestEngine.result.wrongWords.length === 0) {
            return `<p>全部正确！</p>`;
        }

        // 从 window.words 中查 zh
        return TestEngine.result.wrongWords
            .map(wb64 => {
                const w = b64d(wb64);
                const item = window.words.find(x => x.word === w);
                return `<div class="wrong-item">${w} - ${item?.translations[0].translation || "(未找到释义)"}</div>`;
            }).join("");
    }
};

// 如果 testReady 已经提前触发 → 立即初始化
if (window.blogStatusDict["testReady"]) {
    TestUI.init();
}

// 否则监听事件
window.addEventListener("testReady", () => {
    TestUI.init();
});