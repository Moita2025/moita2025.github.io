function showDialog(htmlContent = "") {
  const dialogBox = document.querySelector(".dialog-box");
  if (dialogBox) {
    dialogBox.innerHTML = htmlContent += 
    `<button onclick="hideDialog()" class="ui-btn">关闭</button>`;  // 设置动态内容
  }
  document.querySelector(".dialog-backdrop").style.display = "flex";

  // 推入一个假历史记录，用于安卓返回键关闭对话框
  history.pushState({ dialog: true }, "");
}

function hideDialog() {
  document.querySelector(".dialog-backdrop").style.display = "none";

  // 关闭对话框时撤销虚假的 history
  if (history.state && history.state.dialog) {
    history.back();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("beforeend", `
    <div class="dialog-backdrop" onclick="hideDialog()">
      <div class="dialog-box md-typeset" onclick="event.stopPropagation()"></div>
    </div>
  `);
});

// 电脑 ESC 键关闭
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideDialog();
  }
});

window.addEventListener("popstate", (event) => {
  // 若返回键触发，并且当前是 dialog 状态，则关闭对话框
  if (event.state && event.state.dialog) {
    hideDialog();
  }
});