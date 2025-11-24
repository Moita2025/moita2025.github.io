function splitAfterColon(strings) {
    return strings.map(str => {
        const index = str.indexOf(':');
        return index === -1 ? str : str.substring(index + 1);
    });
}

function RenderTask(taskText, taskSetting) {
    const container = document.getElementById("text-container");
    container.innerHTML = ""; // 清空旧内容

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
        headerTitle.textContent = "Texts";
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
            for (let i = startIdx; i < texts.length; i++) {
                renderParagraph(texts[i]);
            }
        }
    }
}

RenderTask(sampleTaskText, sampleSetting);