# ToolBox Studio Front

React 前端骨架，面向“每个工具独立接入”的工具网站。

## 启动

```bash
npm install
npm run dev
```

## 目录

```text
front/
  index.html
  vite.config.js
  src/
    App.jsx
    main.jsx
    styles.css
    toolCatalog.js
```

## 接入新工具

1. 在 `src/toolCatalog.js` 新增工具配置。
2. 给工具分配独立 `id`、`route`、`category`、`backend` 标记。
3. 纯前端工具先放浏览器侧逻辑；需要后端的工具保留 API 适配层，后续可接 Java Spring Boot。
