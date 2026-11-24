/* 双衡智价 · AI解读模块  ai.js
   DeepSeek API调用，无密钥时退回规则解释 */
(function (g) {
  'use strict';

  var KEY_STORE = 'mm_ds_key_v1';

  function getKey() {
    try { return localStorage.getItem(KEY_STORE) || ''; } catch (e) { return ''; }
  }
  function setKey(k) {
    try { localStorage.setItem(KEY_STORE, String(k).trim()); } catch (e) {} }

  /* 规则兜底：无API密钥时本地生成解读 */
  function fallback(params) {
    var pct = params.percentile, cat = params.catName, city = params.city;
    var p50 = params.p50, price = params.price, ch = params.channel;
    var diff = ((price - p50) / p50 * 100).toFixed(0);
    var sign = price > p50 ? '高出' : '低于';
    var abs = Math.abs(diff);
    if (pct >= 90) {
      return cat + '在' + city + '' + ch + '的这个价格处于第' + pct + '百分位，明显偏贵——比当地中位价' + sign + '' + abs + '%。建议货比三家，或换到菜市场、早市购买，通常可节省15–30%。';
    } else if (pct >= 75) {
      return '这个价格略高于市场主流，' + sign + '中位价' + abs + '%。如果追求新鲜或服务便利可以接受，但如果预算有限，同城菜市场通常还有更实惠的选择。';
    } else if (pct >= 40) {
      return cat + '¥' + price + '/斤处于' + city + '市场正常区间（第' + pct + '分位），与中位价' + sign + '仅' + abs + '%，属于合理价格，可以放心购买。';
    } else {
      return '这个价格相当实惠！低于' + (100 - pct) + '%的同城报价，' + sign + '中位价' + abs + '%。可能是促销、尾货或集中上市，建议按需多买一些。';
    }
  }

  /* DeepSeek API调用 */
  async function analyze(params) {
    var key = getKey();
    if (!key) return { ok: true, text: fallback(params), source: 'rule' };

    var prompt = '我在' + params.city + params.channel + '买' + params.catName +
      '，每斤¥' + params.price + '。当地批发价中位数约¥' + params.p50 +
      '/斤，这个价格处于当地第' + params.percentile + '百分位。' +
      '请用3句简洁中文依次说明：①这个价格是否合理；②可能原因；③一句购买建议。不要编号或标题。';

    try {
      var res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 160, temperature: 0.6
        })
      });
      if (!res.ok) return { ok: true, text: fallback(params), source: 'rule' };
      var data = await res.json();
      var text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
      if (!text) return { ok: true, text: fallback(params), source: 'rule' };
      return { ok: true, text: text.trim(), source: 'ai' };
    } catch (e) {
      return { ok: true, text: fallback(params), source: 'rule' };
    }
  }

  g.MMAI = { getKey: getKey, setKey: setKey, analyze: analyze, fallback: fallback };
})(window);
