const TestUI = {
    core: {
        app: null,
        chart: null,
        currentRenderer: null,  // 当前使用的题型渲染器

        init(containerId = "test-app") {
            this.app = document.getElementById(containerId);
        },

        setRenderer(renderer) {
            this.currentRenderer = renderer;
        },

        renderQuestion() {
            if (!this.currentRenderer) throw new Error("未设置题型渲染器");
            this.currentRenderer.renderQuestion();
        },

        renderResult() {
            const r = TestEngine.getResult();
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
                    ${this.currentRenderer?.renderWrongWords?.() || ""}
                </div>
            `;
            this.renderChart(r);
        },

        renderChart(r) {
            // 统一的饼图逻辑
            if (this.chart) this.chart.destroy();
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

        destroy() {
            if (this.chart) this.chart.destroy();
            this.chart = null;
        }
    },

    // ================ 4. 各题型专属渲染器（推荐这样拆）================
    renderers: {
        EngToZhMultipleChoice: {
            renderQuestion() {
                const q = TestEngine.getCurrent();
                if (!q) return TestUI.core.renderResult();

                const word = window.Utils.str.b64d(q.word);
                const options = q.options.map(o => ({
                    raw: o,
                    text: window.Utils.str.b64d(o)
                }));

                TestUI.core.app.innerHTML = `
                    <div class="test-progress">
                        <div class="bar" style="width:${(TestEngine.getCurrentIdx() / TestEngine.core.questions.length) * 100}%"></div>
                    </div>
                    <div class="test-count">${TestEngine.getCurrentIdx() + 1} / 50</div>
                    <div class="test-word">${word}</div>
                    <div class="test-options">
                        ${options.map((o, i) => `
                            <button class="opt-btn" data-opt="${o.raw}">
                                ${String.fromCharCode(65 + i)}. ${o.text}
                            </button>
                        `).join('')}
                    </div>
                    <div class="test-end">
                        <button id="end-now" class="ui-btn">提前结束</button>
                    </div>
                `;

                document.querySelectorAll(".opt-btn").forEach(btn => {
                    btn.onclick = () => {
                        const correct = q.correct;
                        const isCorrect = TestEngine.answer(btn.dataset.opt, correct, q);
                        btn.classList.add(isCorrect ? 'correct' : 'wrong');
                        if (TestEngine.hasNext()) {
                            TestUI.core.renderQuestion();
                        } else {
                            TestUI.core.renderResult();
                        }
                    };
                });

                document.getElementById("end-now").onclick = () => TestUI.core.renderResult();
            },

            renderWrongWords() {
                const wrongItems = TestEngine.getResult().wrongItems;
                if (wrongItems.length === 0) return "<p>全部正确！太棒了！</p>";

                return wrongItems.map(q => {
                    const word = window.Utils.str.b64d(q.word);
                    const item = window.words.find(x => x.word === word);
                    const zh = item?.translations[0]?.translation || "未知";
                    return `<div class="wrong-item">
                    ${window.Utils.vocab.getWordLink(word, window.currentWordKey)}
                    - ${zh}</div>`;
                }).join("");
            }
        },

        // 未来轻松添加：
        Spelling: {
            renderQuestion() { /* 输入框 + 语音播报 */ },
            renderWrongWords() { /* 显示用户输入 vs 正确拼写 */ }
        },

        Listening: {
            renderQuestion() { /* 自动播放音频 + 四个图片/文字选项 */ },
            renderWrongWords() { /* 显示音频 + 正确单词 */ }
        }
    },

    // ================ 5. 启动不同题型的统一入口 ================
    start(type = "EngToZhMultipleChoice", words) {
        // 1. 生成题目
        Utils.vocab.QuestionType[type].generate(words);

        // 2. 设置对应渲染器
        TestUI.core.setRenderer(TestUI.renderers[type]);

        // 3. 开始渲染
        TestUI.core.init();
        TestUI.core.renderQuestion();

        //window.blogStatusDict["testReady"] = true;
        //window.dispatchEvent(new CustomEvent("testReady"));
    }
};

// 如果 testReady 已经提前触发 → 立即初始化
if (window.blogStatusDict["testReady"]) {
    TestUI.start("EngToZhMultipleChoice", window.words);
}

// 否则监听事件
window.addEventListener("testReady", () => {
    TestUI.start("EngToZhMultipleChoice", window.words);
});