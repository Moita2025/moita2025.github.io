# 词汇表

<button onclick="BackToTop('2')" class="BackToTop">返回 “语言”</button>

---

<button id="switch-words" class="ui-btn">切换其他词汇</button>

<style>
  #words-table-container{text-align:center;}
  #words-table-container td{max-width: 150px;word-break: break-all;}
</style>

## 单词表

<div id="letter-buttons-container"></div>

---

<div id="words-table-container"></div>

---

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

## 搜索

<div class="search-box">
  <input id="word-search-input" class="ui-txt" type="text" placeholder="搜索单词..." />
  <button id="word-search-btn" class="ui-btn">搜索</button>
  <button id="word-clear-btn" class="ui-btn">清空</button>
</div>

<ul id="search-result-list"></ul>

<script src="/assets/javascripts/utils.js"></script>
<script src="/assets/javascripts/init_page/word_page.js"></script>
<script src="/assets/javascripts/third_party/fuse.js"></script>
<script src="/assets/javascripts/word_list/word_table_pagination.js"></script>
<script src="/assets/javascripts/word_list/word_table_letter_index.js"></script>
<script src="/assets/javascripts/word_list/word_data_search.js"></script>