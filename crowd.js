/* 双衡智价 · 众筹价格网络  crowd.js
   本地聚合用户报价，形成"真实民间价格"数据飞轮。
   数据存 localStorage，不联网，演示阶段即可产生真实分布感。 */
(function (g) {
  'use strict';

  var KEY = 'mm_crowd_v2';
  var MAX = 2000; // 最多保留条数

  function load() {
    try {
      var r = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(r) ? r : [];
    } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX))); } catch (e) {}
  }

  /* 提交一条报价 */
  function submit(item) {
    // item: {cat, city, channel, price, ts}
    if (!item.cat || !(item.price > 0)) return false;
    var list = load();
    list.push({
      c: String(item.cat).slice(0, 8),
      ci: String(item.city || '').slice(0, 6),
      ch: String(item.channel || '').slice(0, 6),
      p: Math.round(Number(item.price) * 100) / 100,
      t: item.ts || Date.now()
    });
    save(list);
    return true;
  }

  /* 查询：同品类同城市近N天，返回价格数组 */
  function query(cat, city, days) {
    var cutoff = Date.now() - (days || 30) * 86400000;
    return load().filter(function (r) {
      return r.c === cat && (!city || r.ci === city) && r.t >= cutoff;
    }).map(function (r) { return r.p; });
  }

  /* 统计：分位数 P10/P50/P90 + 样本量 + 众数区间 */
  function stats(prices) {
    if (!prices || prices.length < 3) return null;
    var s = prices.slice().sort(function (a, b) { return a - b; });
    var n = s.length;
    var pct = function (q) {
      var idx = q * (n - 1);
      var lo = Math.floor(idx), hi = Math.ceil(idx);
      return +(s[lo] + (s[hi] - s[lo]) * (idx - lo)).toFixed(2);
    };
    var mean = s.reduce(function (a, b) { return a + b; }, 0) / n;
    return {
      n: n,
      p10: pct(0.1),
      p25: pct(0.25),
      p50: pct(0.5),
      p75: pct(0.75),
      p90: pct(0.9),
      mean: +mean.toFixed(2),
      min: s[0],
      max: s[n - 1]
    };
  }

  /* 市场大盘：所有品类的最新均价快照 */
  function snapshot() {
    var all = load();
    var cutoff = Date.now() - 7 * 86400000; // 7天
    var map = {};
    all.forEach(function (r) {
      if (r.t < cutoff) return;
      if (!map[r.c]) map[r.c] = [];
      map[r.c].push(r.p);
    });
    var out = [];
    Object.keys(map).forEach(function (k) {
      var arr = map[k].sort(function (a, b) { return a - b; });
      var n = arr.length;
      out.push({ cat: k, n: n, median: arr[Math.floor(n / 2)] });
    });
    return out.sort(function (a, b) { return b.n - a.n; });
  }

  /* 趋势：某品类过去N天每日中位价 */
  function trend(cat, days) {
    days = days || 14;
    var now = Date.now();
    var all = load().filter(function (r) { return r.c === cat; });
    var out = [];
    for (var i = days - 1; i >= 0; i--) {
      var dayStart = now - (i + 1) * 86400000;
      var dayEnd = now - i * 86400000;
      var arr = all.filter(function (r) { return r.t >= dayStart && r.t < dayEnd; })
                   .map(function (r) { return r.p; })
                   .sort(function (a, b) { return a - b; });
      var label = new Date(dayEnd);
      var med = arr.length ? arr[Math.floor(arr.length / 2)] : null;
      out.push({
        day: (label.getMonth() + 1) + '/' + label.getDate(),
        median: med,
        n: arr.length
      });
    }
    return out;
  }

  /* 清空所有众筹数据 */
  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  /* 种子数据：首次打开时注入一批模拟报价，让大盘不空白 */
  function seed(cats, cities) {
    if (load().length > 10) return; // 已有数据不重复注入
    var now = Date.now();
    var list = [];
    cats.forEach(function (cat) {
      var base = cat.base;
      var sigma = cat.sigma || 0.2;
      cities.slice(0, 3).forEach(function (city) {
        var n = 8 + Math.floor(Math.random() * 10);
        for (var i = 0; i < n; i++) {
          // 对数正态随机数
          var u = Math.random(), v = Math.random();
          var z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
          var p = Math.exp(Math.log(base) + sigma * z);
          p = Math.round(p * 10) / 10;
          list.push({
            c: cat.k, ci: city,
            p: Math.max(0.1, p),
            t: now - Math.floor(Math.random() * 14 * 86400000)
          });
        }
      });
    });
    save(list);
  }

  g.MMCrowd = { submit: submit, query: query, stats: stats, snapshot: snapshot, trend: trend, clear: clear, seed: seed };
})(window);
