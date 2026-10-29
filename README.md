# Showcase · Cyndi Global

Cyndi Global 的**选品提案展示站**，参考 Kotis Design 的 Showcase 框架搭建（分类分组 + 商品卡片 + 色板切换 + 图库 + 阶梯价 + Start a Project）。

线上地址：<https://www.cyndiglobal.com/showcase/>

---

## 快速开始

```bash
npm install
npm run dev      # 本地开发 http://localhost:5174
npm run build    # 产出 dist/
npm run preview  # 预览构建产物
```

---

## 目录结构

```
showcase/
├── index.html                 入口 HTML
├── vite.config.js             构建配置（base = /showcase/）
├── public/
│   ├── favicon.svg
│   └── images/products/       ← 选品图片放这里
│       ├── canvas-totes/
│       ├── squeeze-bottles/
│       └── drinkware/
└── src/
    ├── main.jsx
    ├── App.jsx                页面组装
    ├── index.css              品牌变量 + Kotis 风格样式
    ├── data/
    │   ├── showcase.json       ← 内容数据源（改这个文件）
    │   └── schema.json        数据字段说明
    └── components/
        ├── ShowcaseNav.jsx     顶部导航 + 分类锚点
        ├── ShowcaseHeader.jsx  SHOWCASE 页头 + 项目介绍
        ├── ProductCard.jsx     商品卡片（Kotis quote-detail-wrapper）
        ├── ColorSwatches.jsx   颜色色板 + show more 折叠
        └── GalleryModal.jsx    图片灯箱
```

---

## 怎么添加选品

**只需两步：**

### 1. 放图片

把图片放到 `public/images/products/<分类id>/`，例如：

```
public/images/products/canvas-totes/legacy-tote.jpg
```

### 2. 改数据文件

编辑 `src/data/showcase.json`，在对应分类的 `products` 数组里追加一项：

```json
{
  "id": "cy-tote-003",
  "sku": "T3265272",
  "name": "Heritage Supply Co. Weekender Tote",
  "description": "一句话商品描述。",
  "features": [
    "卖点 1",
    "卖点 2"
  ],
  "materials": "210D rPET/PU Canvas",
  "image": "/images/products/canvas-totes/weekender.jpg",
  "gallery": [
    "/images/products/canvas-totes/weekender.jpg",
    "/images/products/canvas-totes/weekender-2.jpg"
  ],
  "colors": [
    { "name": "Black", "hex": "#1c1917", "image": "/images/products/canvas-totes/weekender.jpg" }
  ],
  "sizes": ["15\"L x 16\"H x 5\"W"],
  "pricing": [
    { "quantity": 300, "price": 42.5 },
    { "quantity": 500, "price": 39.8 }
  ],
  "priceIncludes": "1-color heat transfer imprint, 1 location.",
  "priceNotes": ["Pre tax. Pre shipping"],
  "additionalCharges": [
    { "label": "Setup (per color)", "amount": 70 }
  ],
  "currency": "$"
}
```

改完保存，构建即生效。

---

## 字段速查

| 字段 | 说明 | 必填 |
|---|---|---|
| `id` | 商品唯一标识 | ✅ |
| `sku` | 款号 / 产品编号 | ✅ |
| `name` | 商品名称 | ✅ |
| `description` | 商品描述 | |
| `features[]` | 卖点列表 | |
| `materials` | 材质说明 | |
| `image` | 主图路径 | ✅ |
| `gallery[]` | 图库路径，点击主图开灯箱 | |
| `colors[]` | `{name, hex, image}`，超过 8 个自动折叠 | |
| `sizes[]` | 尺寸 | |
| `pricing[]` | `{quantity, price}` 阶梯价，单条时显示为 Quantity/Price 两行 | ✅ |
| `priceIncludes` | 价格包含的定制工艺 | |
| `priceNotes[]` | 价格备注 | |
| `additionalCharges[]` | `{label, amount}` 附加费 | |
| `currency` | 货币符号，`$` / `¥` / `€` | |

> 新增分类：在 `categories` 数组追加 `{id, name, products}`。`id` 用英文小写短横线格式，作为页面锚点。

---

## 交互说明（对齐 Kotis）

- **分类分组**：每个分类一个 `<h2>` + 2px 黑色下划线，页面顶部导航可锚点跳转
- **商品卡片**：3/4 列响应式网格（手机 1 列）
- **Start a Project**：hover 主图时从底部浮出，点击跳转邮件询价（自动带上商品名与款号）
- **色板切换**：点击颜色色板切换主图；超过 8 个颜色折叠为 `... show more`
- **图片灯箱**：点击主图打开，支持 ← → 切换、Esc 关闭
- **阶梯价**：多条 `pricing` 显示为阶梯表，单条显示为 Quantity / Price 两行

---

## 部署

构建产物在 `dist/`，作为**静态资源**发布到 `www.cyndiglobal.com/showcase/`。

主站仓库 `HRT/cyndi-global-website` 通过构建脚本拉取本仓库产物并合入主站 `dist/showcase/`。
详见主站仓库的 `SHOWCASE_DEPLOY.md`。
