/* 双衡智价 · 营养性价比指数 NPI  nutrition.js
   独创指标：每元能买到多少营养。把价格判断从"贵不贵"升级到"值不值"。
   数据源：中国食物成分表（第6版）每100g可食部，按 1斤=500g 换算 */
(function (g) {
  'use strict';

  /* 每100g：蛋白质g、维生素C mg、能量 kcal。一斤 = ×5 */
  var DATA = {
    '西瓜':   { p: 0.6,  v: 6,  e: 26 },
    '猪肉':   { p: 20.3, v: 0,  e: 395 },
    '排骨':   { p: 18.3, v: 0,  e: 278 },
    '草莓':   { p: 0.8,  v: 47, e: 32 },
    '鸡蛋':   { p: 12.6, v: 0,  e: 144 },
    '青菜':   { p: 1.5,  v: 36, e: 15 },
    '西红柿': { p: 0.9,  v: 19, e: 19 },
    '苹果':   { p: 0.3,  v: 4,  e: 54 },
    '白菜':   { p: 1.0,  v: 28, e: 17 },
    '大白菜': { p: 1.0,  v: 28, e: 17 },
    '菠菜':   { p: 2.6,  v: 32, e: 24 },
    '黄瓜':   { p: 0.8,  v: 9,  e: 15 },
    '茄子':   { p: 1.1,  v: 5,  e: 21 },
    '土豆':   { p: 2.0,  v: 27, e: 77 },
    '胡萝卜': { p: 1.0,  v: 13, e: 39 },
    '青椒':   { p: 1.0,  v: 72, e: 22 },
    '西兰花': { p: 4.1,  v: 51, e: 36 },
    '洋葱':   { p: 1.1,  v: 8,  e: 40 },
    '大蒜':   { p: 4.5,  v: 7,  e: 149 },
    '香菇':   { p: 2.2,  v: 1,  e: 26 },
    '南瓜':   { p: 0.7,  v: 8,  e: 23 },
    '红薯':   { p: 1.1,  v: 26, e: 99 },
    '玉米':   { p: 4.0,  v: 16, e: 112 },
    '生菜':   { p: 1.3,  v: 13, e: 15 },
    '芹菜':   { p: 1.2,  v: 8,  e: 20 },
    '韭菜':   { p: 1.4,  v: 24, e: 26 },
    '油麦菜': { p: 1.4,  v: 20, e: 15 },
    '豆角':   { p: 2.5,  v: 18, e: 33 },
    '莲藕':   { p: 1.9,  v: 44, e: 73 },
    '菜花':   { p: 2.1,  v: 61, e: 24 },
    '牛肉':   { p: 20.0, v: 0,  e: 250 },
    '羊肉':   { p: 19.0, v: 0,  e: 203 },
    '鸡肉':   { p: 19.3, v: 0,  e: 167 },
    '鸡腿':   { p: 16.0, v: 0,  e: 181 },
    '鸡胸肉': { p: 23.0, v: 0,  e: 118 },
    '鲫鱼':   { p: 17.1, v: 0,  e: 108 },
    '草鱼':   { p: 16.6, v: 0,  e: 113 },
    '鲤鱼':   { p: 17.6, v: 0,  e: 109 },
    '带鱼':   { p: 17.7, v: 0,  e: 127 },
    '鲈鱼':   { p: 18.6, v: 0,  e: 105 },
    '虾':     { p: 18.6, v: 0,  e: 87 },
    '螃蟹':   { p: 13.8, v: 0,  e: 95 },
    '香蕉':   { p: 1.4,  v: 8,  e: 91 },
    '葡萄':   { p: 0.5,  v: 4,  e: 44 },
    '梨':     { p: 0.4,  v: 6,  e: 50 },
    '橘子':   { p: 0.7,  v: 28, e: 47 },
    '柚子':   { p: 0.8,  v: 23, e: 42 },
    '柑橘':   { p: 0.7,  v: 28, e: 47 },
    '菠萝':   { p: 0.5,  v: 18, e: 41 },
    '芒果':   { p: 0.6,  v: 23, e: 35 },
    '柠檬':   { p: 1.1,  v: 22, e: 37 },
    '猕猴桃': { p: 0.8,  v: 62, e: 56 },
    '桃子':   { p: 0.9,  v: 7,  e: 48 },
    '樱桃':   { p: 1.1,  v: 10, e: 46 },
    '车厘子': { p: 1.1,  v: 10, e: 46 },
    '白萝卜': { p: 0.9,  v: 21, e: 23 },
    '冬瓜':   { p: 0.3,  v: 18, e: 12 },
    '包菜':   { p: 1.5,  v: 40, e: 24 },
    '葱':     { p: 1.6,  v: 17, e: 31 }
  };

  /* 营养分 = 蛋白质权重 + 维C权重。反映"这一斤能提供多少关键营养"。
     蛋白质 1分/g，维C 0.15分/mg —— 蛋白质是主食营养核心，维C是果蔬核心 */
  function score100(name) {
    var d = DATA[name];
    if (!d) return null;
    return d.p * 1.0 + d.v * 0.15;
  }

  /* 一斤的蛋白克数、维C毫克数、能量、营养分 */
  function per(name) {
    var d = DATA[name];
    if (!d) return null;
    return {
      protein: +(d.p * 5).toFixed(1),
      vitC: Math.round(d.v * 5),
      energy: Math.round(d.e * 5),
      score: +((d.p * 1.0 + d.v * 0.15) * 5).toFixed(1)
    };
  }

  /* NPI = 每元营养分 = 一斤营养分 / 一斤价格 */
  function npi(name, pricePerJin) {
    var s = score100(name);
    if (!s || !(pricePerJin > 0)) return null;
    return +((s * 5) / pricePerJin).toFixed(2);
  }

  /* 横向对比：同一品类在不同渠道/城市的 NPI，输出排名 */
  function rank(name, options) {
    return options.map(function (o) {
      return { name: o.name, price: o.price, npi: npi(name, o.price) };
    }).filter(function (x) { return x.npi != null; })
      .sort(function (a, b) { return b.npi - a.npi; });
  }

  /* 等级：把 NPI 转成通俗易懂的标签 */
  function grade(npiVal) {
    if (npiVal == null) return { label: '—', cls: 'mid' };
    if (npiVal >= 8) return { label: '营养极高', cls: 'good' };
    if (npiVal >= 4) return { label: '营养不错', cls: 'good' };
    if (npiVal >= 2) return { label: '营养一般', cls: 'mid' };
    if (npiVal >= 1) return { label: '营养偏低', cls: 'warn' };
    return { label: '纯享乐型', cls: 'bad' };
  }

  g.MMN = { DATA: DATA, per: per, npi: npi, rank: rank, grade: grade, score100: score100 };
})(window);
