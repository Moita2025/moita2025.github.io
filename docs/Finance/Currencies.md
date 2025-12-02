# 汇率

<button onclick="BackToTop('2')" class="BackToTop">返回 首页</button>

---

<script>
  document.addEventListener("DOMContentLoaded", function() {
    // 确保 Twemoji 在页面加载完成后进行解析
    twemoji.parse(document.body);

    // 初始化所有汇率图表
    initAllExchangeCharts();
  });
</script>

<style>
  .emoji {
      width: 36px;
      height: 36px;
      vertical-align: middle;
  }
</style>

## 美元-人民币

🇺🇸 &nbsp; __USD__ &nbsp; :fontawesome-solid-left-right: &nbsp; 🇨🇳 &nbsp; __CNY__

---
<div class="exchange-chart-wrapper" data-pair="USD-CNY"><canvas></canvas></div>

<br>

## 新西兰元-人民币

🇳🇿 &nbsp; __NZD__ &nbsp; :fontawesome-solid-left-right: &nbsp; 🇨🇳 &nbsp; __CNY__

---
<div class="exchange-chart-wrapper" data-pair="NZD-CNY"><canvas></canvas></div>

<br>

## 澳大利亚元-人民币

🇦🇺 &nbsp; __AUD__ &nbsp; :fontawesome-solid-left-right: &nbsp; 🇨🇳 &nbsp; __CNY__

---
<div class="exchange-chart-wrapper" data-pair="AUD-CNY"><canvas></canvas></div>

<br>

## 英镑-人民币

🇬🇧 &nbsp; __GBP__ &nbsp; :fontawesome-solid-left-right: &nbsp; 🇨🇳 &nbsp; __CNY__

---
<div class="exchange-chart-wrapper" data-pair="GBP-CNY"><canvas></canvas></div>

<br>

## 欧元-人民币

🇪🇺 &nbsp; __EUR__ &nbsp; :fontawesome-solid-left-right: &nbsp; 🇨🇳 &nbsp; __CNY__

---
<div class="exchange-chart-wrapper" data-pair="EUR-CNY"><canvas></canvas></div>

<br>

## 人民币-日元

🇨🇳 &nbsp; __CNY__ &nbsp; :fontawesome-solid-left-right: &nbsp; 🇯🇵 &nbsp; __JPY__

---
<div class="exchange-chart-wrapper" data-pair="CNY-JPY"><canvas></canvas></div>

<script src="/assets/javascripts/exchange_chart.js"></script>