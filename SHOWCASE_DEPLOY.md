# Showcase 部署说明

本项目（`Georgiazhu/showcase`）是 Cyndi Global 选品展示站的**独立源码仓库**，
线上地址为 <https://www.cyndiglobal.com/showcase/>。

---

## 架构关系

```
Georgiazhu/showcase                    Georgiazhu/cyndi-global-website
（选品内容 + 前端源码，本仓库）   ───▶  （主站仓库，Cloudflare Pages 源仓库）
                                            │
                                            ├─ product-showcase/  商城/落地页
                                            └─ showcase/          ← 本项目构建产物
```

主站仓库的构建脚本会**拉取本仓库最新 `main` 分支 → 构建 → 拷贝到 `product-showcase/dist/showcase/`**，
因此本仓库一推送，线上 `www.cyndiglobal.com/showcase/` 随之更新。

---

## 日常更新流程（用户侧）

1. 本地改 `src/data/showcase.json` 与 `public/images/products/` 下的图片
2. `git push origin main`
3. 等待 Cloudflare Pages 自动构建（约 1–3 分钟）
4. 访问 <https://www.cyndiglobal.com/showcase/> 确认

> 若 Cloudflare 因缓存未更新，可在 Dashboard 手动点 **Deployments → Retry deployment**。

---

## 主站侧构建脚本

主站仓库 `Georgiazhu/cyndi-global-website` 的 `scripts/build_showcase.mjs` 负责：

1. `git clone --depth 1 --branch main https://github.com/Georgiazhu/showcase.git` 到临时目录
2. `npm ci && npm run build`
3. 将产物拷贝到 `product-showcase/dist/showcase/`
4. 若拉取失败（网络等），**不阻断主站构建**，沿用上一版产物

---

## 本地联调

```bash
# 终端 1：主站
cd cyndi-global-website/product-showcase && npm run dev

# 终端 2：showcase（独立预览）
cd showcase && npm run dev     # http://localhost:5174/showcase/
```

---

## 注意事项

- 本仓库 `vite.config.js` 中 `base: '/showcase/'` **不可改动**，否则线上静态资源路径会 404。
- 商品图片建议用 `.webp` 或 `.jpg`，单张控制在 300KB 以内。
- 若新增分类目录，记得在 `src/data/showcase.json` 的 `categories` 中同步添加，并在
  `public/images/products/` 下建同名目录。
