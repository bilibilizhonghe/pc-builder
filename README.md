# ⚡ 极客装机 · PC Builder

一个基于 **React + Vite + Tailwind CSS + Zustand** 的电脑装机配置组合 Web 应用。支持智能推荐、自定义装机、实时兼容性检测与京东价格同步。

> 深色科技感界面 · 158 件主流硬件 · 覆盖 2020–2025 各代平台

---

## ✨ 功能特性

### 1. 智能推荐

根据预算、用途、品牌偏好自动生成一套完整配置单。

- **预算**：3000 – 30000 元（输入框 + 滑块联动）
- **用途**：3A 游戏 / 办公影音 / 视频剪辑 / AI 绘图 / 无偏好
- **品牌偏好**：Intel / AMD / 无偏好

推荐算法按用途动态调整各配件的预算权重，例如：

| 用途 | 预算倾斜 |
|---|---|
| 3A 游戏 | 显卡 40%，CPU 20% |
| 视频剪辑 | CPU 28%，内存 18% |
| AI 绘图 | 显卡 40%，内存 18% |
| 办公影音 | 均衡，硬盘/机箱占比提升 |

生成后可在面板中查看**预算分配明细**（每类实际花费 / 分配额度），并一键应用到配置单。

### 2. 自定义虚拟装机

9 大分类：`CPU` `主板` `显卡` `内存` `硬盘` `电源` `机箱` `散热器` `机箱风扇`

点击分类卡片弹出硬件选择器，支持：

- **品牌筛选**：多选 chip（Intel / AMD / NVIDIA / 通用），实时显示各品牌数量
- **5 种排序**：默认 / 由新到旧 / 价格 ↑ / 价格 ↓ / 京东价命中
- **智能分组**：「由新到旧」自动按年份分组，经典款独立置底
- **标签体系**：品牌、年份（2024/2025）、档位（入门/主流/高端/旗舰）、技术特性（DLSS4/3D缓存/CUDIMM 等）
- **类型徽章**：散热器区分 🌬️ 风冷 / 💧 一体水冷；内存区分 DDR4 / DDR5

### 3. 实时兼容性检测

选择硬件时实时校验，不兼容项**标红并禁用**「加入配置」按钮，右侧配置单同步显示错误与警告。

| 规则 | 说明 |
|---|---|
| CPU ↔ 主板插槽 | 如 LGA1851 / LGA1700 / AM5 / AM4 必须一致 |
| 内存 ↔ 主板代际 | DDR4 / DDR5 必须匹配，且容量不超过主板上限 |
| 电源功率 | ≥ CPU TDP + GPU TDP + 80W（其它部件）+ 150W（余量） |
| 机箱 ↔ 主板板型 | mATX / ATX / E-ATX / ITX 需被机箱支持 |
| 散热器 ↔ CPU 插槽 | 散热器需支持对应插槽，且散热能力覆盖 CPU TDP |
| 显卡长度 ↔ 机箱 | 显卡长度不超过机箱最大支持长度 |

严重冲突显示**红色错误**（阻止加入），潜在风险显示**黄色建议**（不阻止）。

### 4. 实时价格表

右侧配置单实时显示已选配件、单价与总价，支持单项删除与一键清空。

京东价格采用**四级数据源优先级**，任一环失效自动降级：

| 优先级 | 来源 | 徽章 | 说明 |
|---|---|---|---|
| 1 | UI 导入 | 🟢 `JD·真实` | 用户粘贴抓取的 JSON，存入 localStorage |
| 2 | 本地缓存 | 🔵 `JD·缓存` | `npm run fetch-prices` 生成的价格文件 |
| 3 | 京东接口 | 🔴 `JD` | Vite 中间件代理 `p.3.cn` 实时拉取 |
| 4 | 演示数据 | 🟡 `演示` | 网络不可达时的兜底数据 |

---

## 🛠 技术栈

| 类别 | 选型 |
|---|---|
| 框架 | React 18.3 |
| 构建 | Vite 5.3 |
| 样式 | Tailwind CSS 3.4（深色主题 + 自定义科技感色板） |
| 状态管理 | Zustand 4.5 |
| 数据 | 本地 JS 模块模拟硬件数据库 |
| 价格接口 | 京东 `p.3.cn`（通过 Vite 中间件代理规避跨域） |

---

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

### 可用命令

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（含京东价格代理中间件） |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 预览生产构建 |
| `npm run fetch-prices` | 抓取京东真实价格并写入本地缓存 |

### 抓取真实京东价格

```bash
npm run fetch-prices
```

脚本会读取 `src/data/jdSkuMap.js` 中的全部 SKU，分批请求 `p.3.cn`，结果写入 `data/jd-prices-cache.json`。前端启动后会自动读取该文件，徽章显示为 `JD·缓存`。

> 需要能访问京东的网络环境。若接口不可达，前端会自动降级为演示数据，不会报错。

---

## 📁 项目结构

```
pc-builder/
├── data/
│   └── jd-prices-cache.json      # 京东价格本地缓存（由抓取脚本生成）
├── scripts/
│   ├── fetch-jd-prices.mjs       # 京东价格抓取脚本
│   └── gen-cache.mjs             # 缓存初始化生成器
├── src/
│   ├── api/
│   │   └── jd.js                 # 京东价格客户端（去重、分块、缓存）
│   ├── components/
│   │   ├── App.jsx               # 根组件（左右分栏布局）
│   │   ├── RecommendationForm.jsx    # 智能推荐表单
│   │   ├── CategorySelector.jsx      # 分类硬件选择区
│   │   ├── HardwarePicker.jsx        # 硬件选择弹窗（筛选 + 排序）
│   │   ├── BuildSummary.jsx          # 右侧实时配置单
│   │   ├── CompatibilityWarning.jsx  # 兼容性警告条
│   │   ├── JdPriceBadge.jsx          # 京东价徽章（四级状态）
│   │   ├── JdPriceImporter.jsx       # 真实价格导入弹窗
│   │   └── JdLinkBinder.jsx          # 京东链接绑定弹窗
│   ├── data/
│   │   ├── hardware.js           # 硬件数据库（158 件）
│   │   └── jdSkuMap.js           # 硬件 ID → 京东 SKU 映射
│   ├── hooks/
│   │   └── useJdPrices.js        # 京东价格同步 Hook
│   ├── store/
│   │   └── useBuildStore.js      # Zustand 全局状态
│   ├── utils/
│   │   ├── compatibility.js      # 兼容性检测
│   │   ├── recommender.js        # 智能推荐算法
│   │   ├── jdPriceImporter.js    # 价格 JSON 解析与持久化
│   │   └── jdSkuStorage.js       # SKU 覆盖层与链接解析
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js                # 含京东价格代理中间件
├── tailwind.config.js
└── package.json
```

---

## 🗄 数据模型

硬件对象结构（`src/data/hardware.js`）：

```js
{
  id: 'gpu-rtx5090',              // 唯一标识
  category: 'gpu',                // 分类
  name: 'NVIDIA RTX 5090 32G',    // 完整名称
  brand: 'NVIDIA',                // 品牌阵营（Intel/AMD/NVIDIA/通用）
  price: 16499,                   // 本地参考价（元）
  tags: ['旗舰', '4K', 'AI', 'DLSS4', '2025'],  // 标签
  specs: {                        // 关键参数（用于兼容性判断）
    tdp: 575,
    length: 358,
    powerConnector: '16pin'
  }
}
```

各分类的 `specs` 字段差异：

| 分类 | 关键字段 |
|---|---|
| CPU | `socket` `tdp` `cores` `threads` |
| 主板 | `socket` `chipset` `formFactor` `ramType` `ramSlots` `maxRam` |
| 显卡 | `tdp` `length` `powerConnector` |
| 内存 | `type` `size` `sticks` `speed` |
| 硬盘 | `type` `size` `interface` |
| 电源 | `wattage` `rating` |
| 机箱 | `formFactor[]` `maxGpuLength` |
| 散热器 | `type` `height` `supportedSockets[]` `maxTdp` |
| 风扇 | `size` `rgb` `maxRpm` `airflow` |

---

## 📦 硬件库

共 **158 件**，覆盖 9 大分类：

| 分类 | 数量 | 代表型号 |
|---|---|---|
| CPU | 28 | Core Ultra 9 285K、R7 9800X3D、i9-14900K、R5 5500 |
| 显卡 | 26 | RTX 5090 / 5080 / 5070、RX 9070 XT、Arc B580、GTX 1660S |
| 主板 | 25 | Z890、B850 小吹雪、X870E、B760、A620M |
| 机箱 | 14 | O11 Vision、NZXT H9 Flow、TUF GT302、ITX 小机箱 |
| 电源 | 14 | 1600W 钛金 ATX 3.1、1300W 白金、500W 铜牌 |
| 内存 | 14 | DDR5 8000 CUDIMM、96GB(48×2)、DDR4 3200 |
| 硬盘 | 14 | 9100 PRO 4TB (PCIe 5.0)、990 PRO、SATA HDD |
| 散热器 | 12 | NH-D15 G2、ROG RYUJIN III、GL360 V2 |
| 机箱风扇 | 11 | UNI FAN SL V3、NF-A12x25、工业级 3000RPM |

---

## 🔌 京东价格接入

### 方式一：脚本抓取（推荐）

```bash
npm run fetch-prices
```

### 方式二：UI 导入

在配置单面板点击「**导入真实价**」，按弹窗指引：

1. 复制抓取 URL 或 curl 命令
2. 在能联网的环境执行
3. 将返回的 JSON 粘贴回弹窗 → 解析 → 导入

支持三种 JSON 格式：

```jsonc
// ① p.3.cn 原生
[{ "id": "J_100012345", "p": "1234.00", "op": "1399.00", "cpr": "满减" }]

// ② 简化对象
{ "100012345": { "price": 1234, "originalPrice": 1399 } }

// ③ 简化数组
[{ "sku": "100012345", "price": 1234, "originalPrice": 1399 }]
```

### 方式三：绑定真实 SKU

点击「**绑定京东SKU**」，粘贴京东商品链接（如 `https://item.jd.com/100012345.html`），自动提取 SKU 并绑定到指定硬件。绑定关系保存在 localStorage，优先于内置映射。

---

## ⚠️ 说明与限制

- **价格为模拟/参考数据**：硬件库中的价格为市场参考价，非实时成交价；接入京东接口后以抓取结果为准。
- **京东 SKU 需维护**：商品会下架或变更，`src/data/jdSkuMap.js` 中的映射需定期更新。无效 SKU 会被自动识别并降级为演示数据。
- **非商业用途**：京东价格接口为公开接口，请遵守相关网站的使用条款，避免高频请求。生产环境建议接入京东开放平台 API。
- **兼容性规则为简化模型**：仅覆盖主要冲突项（插槽、代际、功率、尺寸），未包含 BIOS 版本、内存 QVL、供电相数等细节。

---

## 📄 License

MIT
