# ToolBox Studio 项目整理（Agent 交接文档）

## 1. 当前有效项目与路径

当前你在浏览器里访问并持续迭代的项目是：

- `E:\codex\tools\front`
- 本地地址：`http://localhost:5176/`

说明：

- `E:\codex\newTools` 是另一套 React 工程（可作为参考/迁移来源），但你当前页面报错与样式问题对应的是 `E:\codex\tools\front`。
- 后续改动前，先确认端口和工程目录一致，避免“改了A项目，页面在看B项目”。

## 2. 技术栈

- React 19
- Vite 7
- `lucide-react` 图标
- 原生 CSS（`src/styles.css`）
- Hash 路由（`#/...`）

## 3. 运行与构建命令

在 `E:\codex\tools\front` 下执行：

```bash
npm install
npm run dev -- --port 5176
npm run build
npm run preview -- --port 5176
```

`package.json` 脚本（当前）：

- `dev`: `vite --host 0.0.0.0`
- `build`: `vite build`
- `preview`: `vite preview --host 0.0.0.0`

## 4. 项目结构（核心）

```text
E:\codex\tools\front
  package.json
  vite.config.js
  index.html
  src/
    App.jsx                    # 主页面、Hash 路由、工具区渲染
    styles.css                 # 全站样式（含工具面板样式）
    toolCatalog.js             # 旧工具配置（legacy）
    javaErrorAnalyzer.js       # Java 报错分析逻辑
    merged/
      siteData.js              # 合并后的 50 工具数据
      toolEngine.js            # 通用工具运行时（mountTool）
```

## 5. 路由与页面渲染逻辑

`src/App.jsx` 使用 `window.location.hash` 解析：

- `#home`：首页
- `#/tool/{slug}`：合并工具页（50 工具）
- `#/legacy/{id}`：旧工具页（legacy）

渲染优先级：

1. 若工具在 `suiteToolPanels` 里有“定制面板”，优先渲染 React 定制 UI。
2. 否则回退到 `mountTool(slug, runtimeRef.current)`（`merged/toolEngine.js`）通用运行时。

## 6. 数据来源与工具体系

项目实际是“双工具体系合并”：

1. 合并工具体系（主）  
   - 数据：`src/merged/siteData.js`  
   - 运行时：`src/merged/toolEngine.js`  
   - 覆盖开发/图片/PDF/办公生活，共 50 工具

2. 旧工具体系（补充）  
   - 数据：`src/toolCatalog.js`  
   - 典型工具：JSON 工作台、正则校验、Java 报错分析、文本对比等  
   - 通过 `legacy` 路由访问

## 7. 已完成的关键改造（最新状态）

### 7.1 科学计算器升级为三模式面板

已在 `E:\codex\tools\front` 落地：

- `simple`（简单计算器）
- `scientific`（科学计算器）
- `programmer`（程序员计算器：BIN/OCT/DEC/HEX + 位运算）

关键改动点：

- 面板组件：`SuiteScientificCalculatorPanel`（`src/App.jsx`）
- 映射接入：`suiteToolPanels['scientific-calculator'] = SuiteScientificCalculatorPanel`
- 新增函数：
  - `formatCalculatorNumber`
  - `evaluateCalculatorExpression`
  - `computeProgrammerCalculatorResult`
- 新增样式：
  - `.suite-calc-*`
  - `.suite-status.neutral`
  - `.suite-tool-icon.calc`

### 7.2 工程误连问题已定位

- 之前 `5176` 与 `5177` 同时有项目运行，出现“看见旧页面”的情况。
- 已确认当前生效目标是 `E:\codex\tools\front @ 5176`。

## 8. 当前关键文件定位

- 科学计算器面板入口：`E:\codex\tools\front\src\App.jsx`
- 面板映射表：`E:\codex\tools\front\src\App.jsx` 中 `suiteToolPanels`
- 计算函数区：`E:\codex\tools\front\src\App.jsx`（工具函数段）
- 面板样式：`E:\codex\tools\front\src\styles.css`
- 通用工具引擎：`E:\codex\tools\front\src\merged\toolEngine.js`

## 9. 后续维护建议（执行顺序）

1. 新增/改造某个工具时，先决定：
   - 使用 `toolEngine.js` 通用面板
   - 还是在 `App.jsx` 增加定制面板（推荐给复杂工具）
2. 若加定制面板，必须同步完成三步：
   - 新组件
   - `suiteToolPanels` 映射
   - `styles.css` 对应样式
3. 每次改完执行：
   - `npm run build`
   - 本地打开对应 `#/tool/{slug}` 手测
4. 出现“改了不生效”，先查端口占用和项目根目录是否一致。

## 10. 部署说明（当前域名）

域名：`ljtools.online`

建议部署流程：

1. 在 `E:\codex\tools\front` 执行 `npm run build`
2. 上传 `dist/` 到服务器静态站点目录
3. 服务端配置 SPA 兜底（`index.html`）以兼容 hash/前端路由
4. 发布后重点回归：
   - 首页分类筛选
   - `#/tool/scientific-calculator`
   - 相关工具推荐跳转

---

最后更新时间：2026-05-04  
维护目标：以 `E:\codex\tools\front` 为唯一线上主工程持续迭代。
