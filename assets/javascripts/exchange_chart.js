/**
 * 日期格式化（UTC, YYYY-MM-DD）
 */
function formatDateUTC(d) {
    return d.toISOString().split("T")[0];
}

/**
 * 缓存每天的 API 数据
 * 结构：
 * cache["2024-03-06"]["eur"] = { usd:1.08, cny:7.8, ... }
 */
const exchangeDataCache = {};


/**
 * 尝试加载某日期的 base 货币数据
 */
async function fetchDailyRates(date, base) {
    if (!exchangeDataCache[date]) {
        exchangeDataCache[date] = {};
    }
    if (exchangeDataCache[date][base]) {
        return exchangeDataCache[date][base];
    }

    const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${base}.json`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Request failed");

        const data = await res.json();
        if (!data[base]) throw new Error("Invalid response");

        exchangeDataCache[date][base] = data[base];
        return data[base];

    } catch (err) {
        return null; // 稍后 fallback 会处理
    }
}


/**
 * 带 fallback 的每日汇率获取：
 * 从 {date} 开始，最多回退 maxFallback 天
 */
async function fetchDailyRatesWithFallback(date, base, maxFallback = 7) {
    let d = new Date(date);

    for (let i = 0; i <= maxFallback; i++) {
        const dateStr = formatDateUTC(d);

        const data = await fetchDailyRates(dateStr, base);
        if (data) {
            return { date: dateStr, data };
        }

        // 往前一天
        d.setUTCDate(d.getUTCDate() - 1);
    }

    return { date: null, data: null };
}


/**
 * 创建汇率图表
 */
async function createExchangeChart(canvas, base, symbol, days = 7) {
    let chartInstance = null;

    base = base.toLowerCase();
    symbol = symbol.toLowerCase();

    async function updateChart(days) {
        const now = new Date();

        // 固定为 UTC 零点
        now.setUTCHours(0, 0, 0, 0);

        const dates = [];
        const values = [];

        // 生成最近 days 天
        for (let i = 0; i < days; i++) {
            const d = new Date(now);
            d.setUTCDate(now.getUTCDate() - i);
            dates.push(formatDateUTC(d));
        }
        dates.reverse();

        // 批量获取每日数据，带 fallback
        const finalDates = [];
        for (const date of dates) {
            const { date: usedDate, data } = await fetchDailyRatesWithFallback(date, base);

            finalDates.push(usedDate || date);
            const val = data ? data[symbol] : null;
            values.push(val ?? null);
        }

        // 移除旧图
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(canvas, {
            type: "line",
            data: {
                labels: finalDates,
                datasets: [
                    {
                        label: `${base.toUpperCase()}/${symbol.toUpperCase()}`,
                        data: values,
                        borderColor: "#4c8bf5",
                        tension: 0.25
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: false }
                }
            }
        });
    }

    await updateChart(days);
}


/**
 * 自动扫描所有控件
 * data-pair="USD-CNY" → base: usd, symbol: cny
 */
function initAllExchangeCharts() {
    const wrappers = document.querySelectorAll(".exchange-chart-wrapper");

    wrappers.forEach(wrapper => {
        const pair = wrapper.dataset.pair;
        if (!pair?.includes("-")) return;

        const [base, symbol] = pair.split("-").map(x => x.trim().toLowerCase());
        const canvas = wrapper.querySelector("canvas");

        if (canvas) {
            createExchangeChart(canvas, base, symbol, 7);
        }
    });
}