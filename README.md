# 双衡智价 SHUANGHENG v2.0

> 贵不贵不是绝对值，是分位数。

## 一句话

输入你买的东西、在哪买的、花了多少钱，双衡智价告诉你这个价在当地属于「便宜 / 正常 / 偏贵」，并给出 P10 / P50 / P90 三档参考价、AI 解读、以及每元能买到多少营养（NPI）。

## 核心创新

| 特性 | 说明 |
|------|------|
| **分位数判价** | 把你的报价放进对数正态分布，第几百分位一目了然 |
| **NPI 营养性价比指数** | 首创：每元获得的营养分（蛋白质+维C），买得值不只买得便宜 |
| **众筹价格网络** | 用户每次查价自动沉淀到本地民间价格库，越用越准 |
| **AI + 规则双引擎** | 配置 DeepSeek 密钥后自动生成价格解读；无密钥时规则引擎优雅兜底 |
| **市场大盘** | 6城批发价横向对比，蔬菜/水果/肉蛋/水产分类可视化 |
| **论坛** | 用 TiDB 云数据库存帖子和回复，邻里之间交流真实菜价 |

## 运行

直接双击 `index.html` 在浏览器打开（定位和 AI 功能需要 `http(s)` 环境）。

**推荐本地服务器：**
```bash
node server.js
# 访问 http://localhost:8000
```

**部署：** 推到 GitHub Pages / Vercel / Netlify 任意一个，扫码即可体验。

## 文件结构

```
index.html          主页面（所有视图 + 逻辑）
cats.js             品类数据层（内置8个 + 用户自定义）
geo.js              城市定位（GPS + IP 多源投票）
prices.js           6城市批发参考价（元/斤）
nutrition.js        NPI营养性价比指数（中国食物成分表第6版）
ai.js               AI解读模块（DeepSeek API + 规则兜底）
crowd.js            众筹价格网络（本地 localStorage 聚合）
sw.js               PWA 离线缓存
server.js           本地 HTTP 服务器
manifest.webmanifest  PWA 配置
```

## AI 解读配置

在「设置」页输入 DeepSeek API 密钥即可启用 AI 解读。
密钥格式：`sk-xxxxxxxxxxxxxxxxxx`
申请地址：https://platform.deepseek.com

无密钥时系统自动使用规则引擎生成解读，功能正常。

## 数据说明

- **批发参考价**：北京新发地、合肥周谷堆、上海农产品中心、广州江南果菜、成都农产品中心、武汉白沙洲（元/斤，零售价一般高出20%–50%）
- **NPI 营养数据**：中国食物成分表（第6版），60+ 品类
- **众筹价格**：用户本地报价，仅存于 localStorage，不上传服务器

## 论坛（TiDB）

「论坛」页的数据存在已部署的 TiDB Cloud Data App，共三张表：

- `test.mm_forum_posts`：帖子（作者、标题、内容、城市、品类、价格、点赞数、回复数）
- `test.mm_forum_replies`：回复
- `test.mm_forum_likes`：点赞记录（按浏览器访客去重）

演示版不做权限校验：列表和详情里所有帖子都显示删除按钮，任何人都能删；删除时会一并清掉这条帖子的回复和点赞。正式上线建议加登录和权限控制。

接口：`https://ap-northeast-1.data.tidbcloud.com/api/v1beta/app/dataapp-qfCgliqz/endpoint/system/query`

当前是黑客松演示版，Data App 的 Basic Auth 写在前端 `index.html` 里，任何拿到页面的人都能直接读写。正式上线前应把 SQL 调用迁到自己的后端或云函数，并在服务端补鉴权、限流和内容审核。

