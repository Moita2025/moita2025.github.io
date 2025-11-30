# 素材分类展示

<button onclick="BackToTop()" class="BackToTop">返回 “类别”</button>

---

<button id="switch-type" class="ui-btn">切换其他类别</button>

<!-- 分页器 -->
<div id="paginator">
  <button class="ui-btn prev-page">上一页</button>
  <button class="ui-btn next-page">下一页</button>

  <input
    id="page-input"
    type="number"
    min="1"
    value="1"
    class="ui-int-input page-input"
  />

  <button class="ui-btn go-page">跳转</button>

  <span class="page-info"></span>
</div>

<div id="render-area"></div>

<!-- 分页器 -->
<div id="paginator">
  <button class="ui-btn prev-page">上一页</button>
  <button class="ui-btn next-page">下一页</button>

  <input
    id="page-input"
    type="number"
    min="1"
    value="1"
    class="ui-int-input page-input"
  />

  <button class="ui-btn go-page">跳转</button>

  <span class="page-info"></span>
</div>

<script src="/assets/javascripts/utils.js"></script>
<script src="/assets/javascripts/init_page/corpus_display_page.js"></script>