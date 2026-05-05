import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Download,
  Eye,
  FileJson2,
  FileInput,
  Image as ImageIcon,
  Menu,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  Underline,
} from 'lucide-react';
import {
  JAVA_ERROR_MAX_LENGTH,
  analyzeJavaLog,
  buildJavaErrorReport,
  javaErrorSamples,
} from './javaErrorAnalyzer.js';
import { categories, tools } from './toolCatalog.js';
import { categories as mergedCategories, tools as mergedTools } from './merged/siteData.js';
import { mountTool } from './merged/toolEngine.js';

const pageCopy = {
  eyebrow: 'TOOLS HUB',
  title: '在线工具合集工作台',
  text: '优先使用合并后的工具合集，按分类选择并在浏览器本地处理数据。',
};

const jsonSample = `{
  "project": "ToolBox Studio",
  "owner": "Java Developer",
  "tools": [
    { "name": "JSON 工作台", "ready": true },
    { "name": "JWT 解析器", "ready": true }
  ]
}`;

const jwtSample =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqYXZhLWRldiIsIm5hbWUiOiJUb29sQm94IFN0dWRpbyIsImlhdCI6MTcxNDQ2ODgwMCwiZXhwIjoxODkzNDU2MDAwfQ.signature';

const diffSamples = {
  base: 'server.port=8080\nspring.application.name=toolbox\nlogging.level.root=INFO\nfeatures.diff=false',
  left: 'server.port=8080\nspring.application.name=toolbox\nlogging.level.root=INFO\nfeatures.diff=false',
  right:
    'server.port=8081\nspring.application.name=toolbox\nlogging.level.root=DEBUG\nfeatures.diff=true\nfeatures.image=true',
};

const marketingTerms = [
  '在线免费',
  '无需下载',
  '无安装',
  '免安装',
  '免注册',
  '本地处理',
  '本地运算',
  '无需上传',
  '网页版',
  '网页端',
  '纯前端',
  '浏览器本地处理',
];

const categoryScenes = {
  dev: '适合开发调试、数据转换与接口排查场景。',
  image: '适合素材压缩、格式处理和图像快速加工场景。',
  pdf: '适合文档整理、合并分发和打印前处理场景。',
  office: '适合日常办公计算、文本整理和效率提升场景。',
};

const toolIntroOverrides = {
  'json-formatter': '用于整理杂乱 JSON 文本，支持格式化、压缩与结构统计，方便排查字段层级和数据完整性。',
  'json-to-xml': '把 JSON 结构转换为 XML 表达，适合对接老系统、配置文件导出或接口联调。',
  'base64-encode-decode': '提供 Base64 双向转换，便于处理 token、二进制片段和传输编码文本。',
  'url-encode-decode': '用于 URL 编解码，快速处理参数乱码、回调地址和查询串转义问题。',
  'timestamp-converter': '在时间戳与日期时间之间互转，支持秒毫秒识别，方便日志定位与跨时区核对。',
  'qr-code-generator': '将文本或链接生成二维码，可快速用于分享下载地址、表单入口或活动页。',
  'md5-hash': '生成 MD5 摘要，常用于文件校验、内容比对和接口签名调试。',
  'sha256-hash': '计算 SHA256 哈希值，适合做完整性校验、加密流程联调和数据验签。',
  'uuid-generator': '批量生成 UUID，适合测试数据造数、主键模拟和分布式唯一标识场景。',
  'regex-tester': '实时验证正则表达式匹配结果，便于调试提取规则与文本过滤逻辑。',
  'text-trim-spaces': '一键清理多余空格和空行，适合日志清洗、配置整理与文本预处理。',
  'case-converter': '完成大小写、驼峰、下划线等格式转换，方便变量命名与代码规范统一。',
  'base-converter': '支持二进制、十进制、十六进制互转，适合协议分析和底层开发调试。',
  'ip-lookup': '可做 IP 格式校验与基础地址类型识别，帮助快速判断输入是否有效。',
  'port-checker': '在浏览器能力范围内验证端口连通性，用于本地服务启动检查与联调前自检。',
  'html-escape-unescape': '实现 HTML 实体转义与还原，避免模板渲染冲突并提升内容安全性。',
  'csv-to-json': '把 CSV 表格文本转换为 JSON 数组，适合导入接口、脚本处理和数据清洗。',
  'character-counter': '统计字符、字数与行数，适合文案长度控制和输入限制预检查。',
  'jwt-decoder': '解析 JWT 头部与载荷，快速查看 claims、过期时间与签名结构。',
  'color-rgb-hex-converter': '完成 RGB、HEX、HSL 颜色值互转，方便前端配色与设计联调。',
  'image-compressor': '批量压缩图片并支持 ZIP 下载，兼顾质量与体积，适合发布前资源优化。',
  'image-format-converter': '在 JPG、PNG、WebP 等格式间转换，满足不同平台的图片兼容需求。',
  'image-crop-resize': '进行裁剪与缩放，快速统一封面尺寸、头像比例和素材规格。',
  'image-watermark-remover': '提供本地遮盖式去水印处理，用于演示图修整和素材二次编辑。',
  'image-ocr': '从图片中提取可编辑文字，适合票据摘录、截图转文本与资料整理。',
  'meme-maker': '支持文字叠加和图片导出，可快速制作表情包与社媒传播素材。',
  'image-grayscale-colorize': '完成黑白与彩色效果转换，适合做视觉风格统一与快速滤镜处理。',
  'image-stitcher': '将多张图片横向或纵向拼接，适合长图排版和步骤截图整合。',
  'ico-generator': '生成 ICO 图标文件，适用于网站 favicon 和桌面快捷方式图标。',
  'screenshot-text-extractor': '针对截图内容提取文字，适合聊天记录、文档片段和界面文案复用。',
  'pdf-compressor': '压缩 PDF 文件体积，方便邮件发送、移动端传输和归档存储。',
  'pdf-merger': '将多个 PDF 按顺序合并成一个文件，适合材料汇总与统一分发。',
  'pdf-splitter': '按页码范围拆分 PDF，便于按章节提取、归档或局部分享。',
  'pdf-to-word': '将 PDF 内容转换为可编辑 Word，便于后续修改和排版。',
  'pdf-to-image': '把 PDF 页面转成图片，适合生成预览图和内容展示素材。',
  'word-to-pdf': '将 Word 文档输出为 PDF，便于跨设备查看与打印。',
  'excel-to-pdf': '把表格转成 PDF 保留阅读布局，适合报表分发和审阅。',
  'text-to-pdf': '将纯文本快速生成 PDF，适合笔记归档与说明文档输出。',
  'pdf-password-remover': '在本地移除已知密码限制，方便后续编辑、合并和打印。',
  'pdf-reader': '直接在网页中阅读 PDF，支持快速预览和页面定位。',
  'scientific-calculator': '提供科学计算功能，覆盖常见函数、指数与括号表达式运算。',
  'date-diff-calculator': '计算两个日期之间的天数差与时间间隔，适合排期和工期估算。',
  'unit-converter': '支持长度、重量、温度等单位换算，减少手工计算错误。',
  'chinese-to-pinyin': '将汉字转换为拼音，适合命名、检索和学习辅助场景。',
  'traditional-simplified-converter': '完成简体与繁体互转，便于跨地区内容发布与校对。',
  'random-number-generator': '根据区间和数量生成随机数，适合抽样测试和模拟数据。',
  'strong-password-generator': '按复杂度规则生成高强度密码，提升账号安全性。',
  'garbage-sorting-query': '按关键词查询垃圾分类建议，快速判断投放类别。',
  'horizontal-vertical-text': '在横排与竖排文本样式间转换，适合海报和特殊排版场景。',
  'duplicate-text-remover': '自动去重重复文本行，适合名单清洗和数据预处理。',
  'legacy:java-error-analyzer': '解析 Java / Spring 异常堆栈并输出 root cause、排查步骤与修复建议。',
  'legacy:diff-viewer': '对比文本差异并高亮变更位置，适合配置回归检查和代码片段审阅。',
};

function tidySummary(text) {
  if (!text) return '';
  let result = text;
  marketingTerms.forEach((term) => {
    result = result.replaceAll(term, '');
  });
  result = result
    .replace(/[，,]\s*[，,]+/g, '，')
    .replace(/\s+/g, ' ')
    .replace(/^\s*[，,。.；;:：\-|·]+\s*/g, '')
    .replace(/\s*[，,。.；;:：\-|·]+\s*$/g, '')
    .trim();
  return result;
}

function ensureSentence(text) {
  if (!text) return '';
  return /[。！？.!?]$/.test(text) ? text : `${text}。`;
}

function getToolIntro(meta) {
  if (!meta) return '';
  const key = meta.legacy ? `legacy:${meta.legacyId}` : meta.slug;
  if (toolIntroOverrides[key]) return toolIntroOverrides[key];
  const cleaned = tidySummary(meta.summary || meta.description || '');
  if (!cleaned) return '';
  const scene = categoryScenes[meta.category] || '';
  return `${ensureSentence(cleaned)}${scene ? ` ${scene}` : ''}`;
}

function getToolCardIntro(meta) {
  const intro = getToolIntro(meta);
  if (intro) return intro;
  return tidySummary(meta.summary || meta.description || '');
}

function getToolGuide(meta) {
  if (!meta) {
    return { scene: '', steps: [], faq: [] };
  }
  const slug = meta.legacy ? `legacy:${meta.legacyId}` : meta.slug;
  const isFileTool =
    /(image|pdf|word|excel|ico|screenshot|ocr|compressor|merger|splitter)/.test(slug) ||
    ['image', 'pdf'].includes(meta.category);
  const isCalcTool = /(calculator|converter|generator|counter|diff|hash|uuid|timestamp)/.test(slug);

  let steps;
  if (isFileTool) {
    steps = ['上传或选择待处理文件', '按当前工具需求设置参数并执行', '预览处理结果并下载文件'];
  } else if (isCalcTool) {
    steps = ['输入待处理内容或数值', '选择规则并点击处理', '核对结果后复制或继续调整'];
  } else {
    steps = ['输入原始内容', '按工具规则一键处理', '复制、下载或继续下一轮处理'];
  }

  const faqByCategory = {
    dev: [
      { q: '数据会上传到服务器吗？', a: '不会，当前页面仅在浏览器内处理内容。' },
      { q: '需要安装插件或登录吗？', a: '不需要，打开页面即可直接使用。' },
      { q: '手机上可以用吗？', a: '可以，已适配移动端输入与按钮操作。' },
    ],
    image: [
      { q: '图片会离开本地设备吗？', a: '不会，处理流程在浏览器中完成。' },
      { q: '支持批量操作吗？', a: '大多数图片工具支持多文件处理与下载。' },
      { q: '移动端能上传和下载吗？', a: '支持，手机端可直接选择相册或文件。' },
    ],
    pdf: [
      { q: 'PDF 处理是否安全？', a: '工具采用本地处理模式，不主动上传文档。' },
      { q: '是否需要注册账号？', a: '不需要，直接打开网页即可使用。' },
      { q: '文件较大时怎么办？', a: '建议分批处理并优先使用桌面浏览器。' },
    ],
    office: [
      { q: '这些计算结果会被记录吗？', a: '不会，页面不会保存你的输入内容。' },
      { q: '是否可以离线使用？', a: '浏览器缓存后，部分工具可在离线场景继续使用。' },
      { q: '能在手机端快速操作吗？', a: '支持，按钮与输入控件已做触控优化。' },
    ],
  };

  const scene = categoryScenes[meta.category] || '适合日常快速处理与效率提升场景。';
  return {
    scene,
    steps,
    faq: faqByCategory[meta.category] || faqByCategory.dev,
  };
}

function parseHashRoute(hashValue) {
  const hash = (hashValue || '').trim();
  if (hash.startsWith('#/tool/')) {
    return { type: 'tool', slug: decodeURIComponent(hash.slice('#/tool/'.length)) };
  }
  if (hash.startsWith('#/legacy/')) {
    return { type: 'legacy', id: decodeURIComponent(hash.slice('#/legacy/'.length)) };
  }
  return { type: 'home', anchor: hash.replace(/^#/, '') || 'home' };
}

function App() {
  const [route, setRoute] = useState(() => parseHashRoute(window.location.hash));
  const [keyword, setKeyword] = useState('');
  const [activeCategoryKey, setActiveCategoryKey] = useState('all');
  const runtimeRef = useRef(null);

  const mergedToolIds = useMemo(
    () => new Set(['json-lab', 'regex-checker', 'jwt-inspector', 'url-codec', 'timestamp', 'hash-lab', 'image-compress']),
    [],
  );

  const legacyDevTools = useMemo(
    () =>
      tools
        .filter((tool) => tool.status === 'ready' && !mergedToolIds.has(tool.id) && tool.id !== 'mega-tools-suite')
        .map((tool) => ({
          legacy: true,
          legacyId: tool.id,
          slug: `legacy-${tool.id}`,
          name: tool.name,
          summary: tool.description,
          category: 'dev',
        })),
    [mergedToolIds],
  );

  const filteredMergedTools = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return mergedTools.filter((tool) => {
      const byCategory = activeCategoryKey === 'all' || tool.category === activeCategoryKey;
      const byQuery = !q || (tool.name + ' ' + tool.summary + ' ' + (tool.categoryName || '')).toLowerCase().includes(q);
      return byCategory && byQuery;
    });
  }, [keyword, activeCategoryKey]);

  const filteredLegacyDevTools = useMemo(() => {
    if (activeCategoryKey !== 'all' && activeCategoryKey !== 'dev') return [];
    const q = keyword.trim().toLowerCase();
    return legacyDevTools.filter((tool) => !q || (tool.name + ' ' + tool.summary).toLowerCase().includes(q));
  }, [activeCategoryKey, keyword, legacyDevTools]);

  const groupedCategories = useMemo(
    () =>
      mergedCategories
        .map((category) => {
          const mergedList = filteredMergedTools
            .filter((tool) => tool.category === category.key)
            .map((tool) => ({ ...tool, legacy: false }));
          const list = category.key === 'dev' ? [...mergedList, ...filteredLegacyDevTools] : mergedList;
          return { ...category, list };
        })
        .filter((category) => category.list.length > 0),
    [filteredMergedTools, filteredLegacyDevTools],
  );

  const filteredCount = groupedCategories.reduce((total, category) => total + category.list.length, 0);
  const totalCount = mergedTools.length + legacyDevTools.length;

  const activeSuiteTool = useMemo(
    () => (route.type === 'tool' ? mergedTools.find((tool) => tool.slug === route.slug) ?? null : null),
    [route],
  );

  const activeLegacyTool = useMemo(
    () =>
      route.type === 'legacy'
        ? tools.find(
            (tool) =>
              String(tool.id) === String(route.id) &&
              tool.status === 'ready' &&
              !mergedToolIds.has(tool.id) &&
              tool.id !== 'mega-tools-suite',
          ) ?? null
        : null,
    [route, mergedToolIds],
  );

  const CustomSuitePanel = activeSuiteTool ? suiteToolPanels[activeSuiteTool.slug] : null;

  const activeToolMeta = activeLegacyTool
    ? {
        legacy: true,
        legacyId: activeLegacyTool.id,
        slug: `legacy-${activeLegacyTool.id}`,
        name: activeLegacyTool.name,
        summary: activeLegacyTool.description,
        category: 'dev',
      }
    : activeSuiteTool
      ? { ...activeSuiteTool, legacy: false }
      : null;
  const activeToolIntro = getToolIntro(activeToolMeta);
  const activeToolGuide = getToolGuide(activeToolMeta);

  const allToolsForRecommend = useMemo(
    () => [
      ...mergedTools.map((tool) => ({ ...tool, legacy: false })),
      ...legacyDevTools,
    ],
    [legacyDevTools],
  );

  const relatedTools = useMemo(() => {
    if (!activeToolMeta) return [];
    const isSameTool = (candidate) => {
      if (activeToolMeta.legacy) {
        return candidate.legacy && candidate.legacyId === activeToolMeta.legacyId;
      }
      return !candidate.legacy && candidate.slug === activeToolMeta.slug;
    };

    const sameCategory = allToolsForRecommend.filter(
      (candidate) => !isSameTool(candidate) && candidate.category === activeToolMeta.category,
    );
    const crossCategory = allToolsForRecommend.filter(
      (candidate) => !isSameTool(candidate) && candidate.category !== activeToolMeta.category,
    );
    return [...sameCategory, ...crossCategory].slice(0, 8);
  }, [activeToolMeta, allToolsForRecommend]);

  useEffect(() => {
    const handleHashChange = () => setRoute(parseHashRoute(window.location.hash));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (route.type === 'home') return;
    if (route.type === 'tool' && !activeSuiteTool) {
      window.location.hash = '#home';
    }
    if (route.type === 'legacy' && !activeLegacyTool) {
      window.location.hash = '#home';
    }
  }, [route, activeSuiteTool, activeLegacyTool]);

  useEffect(() => {
    if (route.type !== 'home') return;
    const anchor = route.anchor || 'home';
    if (anchor === 'cat-dev') setActiveCategoryKey('dev');
    if (anchor === 'cat-image') setActiveCategoryKey('image');
    if (anchor === 'cat-pdf') setActiveCategoryKey('pdf');
    if (anchor === 'cat-office') setActiveCategoryKey('office');
  }, [route]);

  useEffect(() => {
    const root = runtimeRef.current;
    if (!root) return;
    if (route.type !== 'tool' || !activeSuiteTool || CustomSuitePanel) {
      root.innerHTML = '';
      return;
    }
    let cancelled = false;
    root.innerHTML = '';
    mountTool(activeSuiteTool.slug, root).catch((error) => {
      if (cancelled || !root) return;
      root.innerHTML = '<div class="result-message danger">工具加载失败：' + (error?.message || '未知错误') + '</div>';
    });
    return () => {
      cancelled = true;
      if (root) root.innerHTML = '';
    };
  }, [route, activeSuiteTool, CustomSuitePanel]);

  const openToolPage = (tool) => {
    const hash = tool.legacy ? `#/legacy/${encodeURIComponent(tool.legacyId)}` : `#/tool/${encodeURIComponent(tool.slug)}`;
    window.location.hash = hash;
  };

  const goHome = (categoryKey = 'all', anchor = 'home') => {
    setKeyword('');
    setActiveCategoryKey(categoryKey);
    window.location.hash = `#${anchor}`;
  };

  const renderHome = (
    <main className="new-page" id="home">
      <section className="new-hero card">
        <span className="eyebrow">TOOLS HUB</span>
        <h1>在线工具合集首页</h1>
        <p>覆盖开发、图片、PDF、办公生活四大场景，共50个网页版工具。</p>
      </section>

      <section className="new-search-row">
        <div className="new-search-card card">
          <label className="new-home-search" htmlFor="suite-search">
            <span>快速搜索工具</span>
            <input
              id="suite-search"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="输入工具名称，例如 JSON、图片压缩、PDF..."
              value={keyword}
            />
          </label>
          <div className="new-filter-tabs" role="tablist" aria-label="工具分类筛选">
            <button className={activeCategoryKey === 'all' ? 'active' : ''} onClick={() => setActiveCategoryKey('all')} type="button">
              全部
            </button>
            {mergedCategories.map((category) => (
              <button
                className={activeCategoryKey === category.key ? 'active' : ''}
                key={category.key}
                onClick={() => setActiveCategoryKey(category.key)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
          <p className="new-home-stats">
            共 {totalCount} 个工具，当前匹配 {filteredCount} 个
          </p>
        </div>
      </section>

      {groupedCategories.map((category) => (
        <section className="new-category-block" id={`cat-${category.key}`} key={category.key}>
          <div className="new-category-head">
            <div>
              <h2>{category.name}</h2>
              <p>{category.intro}</p>
            </div>
            <span>{category.list.length} 个工具</span>
          </div>
          <div className="new-tools-grid">
            {category.list.map((tool) => (
              <button className="new-tool-card" key={tool.slug} onClick={() => openToolPage(tool)} type="button">
                <strong>{tool.name}</strong>
                <p>{getToolCardIntro(tool)}</p>
              </button>
            ))}
          </div>
        </section>
      ))}
    </main>
  );

  const renderToolPage = (
    <main className="new-page">
      <section className="tool-page-hero card">
        <button className="tool-back-button" onClick={() => goHome('all', 'home')} type="button">
          返回主页
        </button>
        <h1>{activeToolMeta?.name ?? '工具未找到'}</h1>
        {activeToolIntro ? <p>{activeToolIntro}</p> : null}
      </section>

      <section className="tool-workspace-grid">
        <section className="new-runtime card" id="runtime-zone" aria-label="工具运行区">
          <div className="new-runtime-title">当前工具：{activeLegacyTool?.name ?? activeSuiteTool?.name ?? '未选择工具'}</div>
          <div className="new-runtime-body">
            {activeLegacyTool ? (
              <ToolRunner tool={activeLegacyTool} />
            ) : CustomSuitePanel ? (
              <CustomSuitePanel tool={activeSuiteTool} />
            ) : (
              <div className="new-runtime-host" ref={runtimeRef} />
            )}
          </div>
        </section>

        <aside className="tool-sidebar">
          <section className="tool-side-card card">
            <h2>适用场景</h2>
            <p>{activeToolGuide.scene}</p>
          </section>

          <section className="tool-side-card card">
            <h2>使用步骤</h2>
            <ol>
              {activeToolGuide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <section className="tool-side-card card">
            <h2>常见问题</h2>
            <div className="tool-faq-list">
              {activeToolGuide.faq.map((item) => (
                <article key={item.q}>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>

      {relatedTools.length ? (
        <section className="tool-related card" aria-label="相关工具推荐">
          <div className="tool-related-head">
            <h2>相关工具推荐</h2>
            <p>继续处理相似任务，或切换到其他常用工具。</p>
          </div>
          <div className="tool-related-grid">
            {relatedTools.map((tool) => (
              <button className="tool-related-card" key={tool.slug} onClick={() => openToolPage(tool)} type="button">
                <strong>{tool.name}</strong>
                <p>{getToolCardIntro(tool)}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );

  return (
    <div className="new-home-shell">
      <header className="new-site-header">
        <div className="new-home-brand">
          <div className="new-home-brand-mark">
            <Sparkles size={20} strokeWidth={2.3} />
          </div>
          <div>
            <strong>ToolBox Studio</strong>
            <span>50个浏览器工具合集</span>
          </div>
        </div>
        <nav className="new-site-links" aria-label="首页导航">
          <a
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              goHome('all', 'home');
            }}
          >
            首页
          </a>
          <a
            href="#cat-dev"
            onClick={(event) => {
              event.preventDefault();
              goHome('dev', 'cat-dev');
            }}
          >
            开发类工具
          </a>
          {route.type === 'home' ? (
            <a
              href="#cat-image"
              onClick={(event) => {
                event.preventDefault();
                goHome('image', 'cat-image');
              }}
            >
              图片类工具
            </a>
          ) : (
            <a
              href="#home"
              onClick={(event) => {
                event.preventDefault();
                goHome('all', 'home');
              }}
            >
              返回主页
            </a>
          )}
        </nav>
      </header>

      {route.type === 'home' ? renderHome : renderToolPage}

      <footer className="new-site-footer" id="privacy">
        <p>© 2026 ljtools.online · 在线工具合集</p>
        <div>
          <a href="#privacy">隐私政策</a>
          <a href="#terms">用户协议</a>
          <span id="terms">ICP备案号：待补充</span>
        </div>
      </footer>
    </div>
  );
}
function ToolCard({ tool, isActive, onSelect }) {
  const Icon = tool.icon;

  return (
    <button
      className={`tool-card accent-${tool.accent} ${isActive ? 'active' : ''}`}
      onClick={onSelect}
      type="button"
    >
      <span className="tool-icon">
        <Icon size={21} />
      </span>
      <span className="tool-copy">
        <strong>{tool.name}</strong>
      </span>
    </button>
  );
}

function ToolRunner({ tool }) {
  const Icon = tool.icon;
  const Panel = toolPanels[tool.id] ?? ToolPlaceholder;

  return (
    <div className={`tool-runner accent-${tool.accent}`}>
      <header className="runner-header">
        <div className="runner-title">
          <span className="tool-icon large">
            <Icon size={27} />
          </span>
          <div>
            <h2>{tool.name}</h2>
            <p>{tool.description}</p>
          </div>
        </div>
      </header>
      <Panel tool={tool} />
    </div>
  );
}

function JsonTool() {
  const [input, setInput] = useState(jsonSample);
  const [output, setOutput] = useState(() => formatJson(jsonSample, 2).value);
  const parsed = useMemo(() => parseJson(input), [input]);

  const handleFormat = () => {
    const result = formatJson(input, 2);
    setOutput(result.value);
  };

  const handleMinify = () => {
    const result = formatJson(input, 0);
    setOutput(result.value);
  };

  return (
    <div className="tool-body">
      <div className="tool-action-bar">
        <button className="action-button" onClick={handleFormat} type="button">
          格式化
        </button>
        <button className="action-button" onClick={handleMinify} type="button">
          压缩
        </button>
        <button className="action-button subtle" onClick={() => setInput(jsonSample)} type="button">
          <RotateCcw size={16} />
          示例
        </button>
      </div>

      <div className="editor-grid">
        <label className="field-panel">
          <span>输入 JSON</span>
          <textarea onChange={(event) => setInput(event.target.value)} spellCheck="false" value={input} />
        </label>
        <label className="field-panel">
          <span>输出结果</span>
          <textarea readOnly spellCheck="false" value={output} />
        </label>
      </div>

      <div className={`result-message ${parsed.valid ? 'success' : 'danger'}`}>
        {parsed.valid
          ? `JSON 有效，字段 ${parsed.stats.keys} 个，数组 ${parsed.stats.arrays} 个，节点 ${parsed.stats.nodes} 个`
          : parsed.error}
      </div>
    </div>
  );
}

function SuiteJsonFormatterPanel() {
  const [input, setInput] = useState(jsonSample);
  const [output, setOutput] = useState(() => formatJson(jsonSample, 2).value);
  const [tip, setTip] = useState('');
  const parsed = useMemo(() => parseJson(input), [input]);

  const handleFormat = () => {
    const result = formatJson(input, 2);
    setOutput(result.value);
    setTip(result.valid ? '已按 2 空格格式化' : 'JSON 无法解析，请先修正');
  };

  const handleMinify = () => {
    const result = formatJson(input, 0);
    setOutput(result.value);
    setTip(result.valid ? '已压缩为单行 JSON' : 'JSON 无法解析，请先修正');
  };

  const handleCopy = async () => {
    if (!output.trim()) return;
    try {
      await navigator.clipboard.writeText(output);
      setTip('结果已复制到剪贴板');
    } catch {
      setTip('复制失败，请检查浏览器权限');
    }
  };

  const handleReset = () => {
    setInput(jsonSample);
    setOutput(formatJson(jsonSample, 2).value);
    setTip('已恢复示例内容');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setTip('已清空输入与输出');
  };

  return (
    <section className="suite-tool-panel suite-json-panel">
      <header className="suite-tool-header suite-json-header">
        <span className="suite-tool-icon">
          <FileJson2 size={24} />
        </span>
        <div>
          <h3>JSON 工作台</h3>
          <p>格式化、压缩、结构统计</p>
        </div>
      </header>

      <div className="suite-tool-actions">
        <button className="action-button" onClick={handleFormat} type="button">
          格式化
        </button>
        <button className="action-button" onClick={handleMinify} type="button">
          压缩
        </button>
        <button className="action-button subtle" onClick={handleCopy} type="button">
          <Copy size={16} />
          复制
        </button>
        <button className="action-button subtle" onClick={handleReset} type="button">
          <RotateCcw size={16} />
          示例
        </button>
        <button className="action-button subtle" onClick={handleClear} type="button">
          <Trash2 size={16} />
          清空
        </button>
      </div>

      <div className="suite-json-grid">
        <label className="suite-field">
          <span>输入 JSON</span>
          <textarea onChange={(event) => setInput(event.target.value)} spellCheck="false" value={input} />
        </label>
        <label className="suite-field">
          <span>输出结果</span>
          <textarea readOnly spellCheck="false" value={output} />
        </label>
      </div>

      <div className={`suite-status ${parsed.valid ? 'ok' : 'error'}`}>
        {parsed.valid
          ? `JSON 有效，字段 ${parsed.stats.keys} 个，数组 ${parsed.stats.arrays} 个，节点 ${parsed.stats.nodes} 个`
          : parsed.error}
      </div>
      {tip ? <p className="suite-tip">{tip}</p> : null}
    </section>
  );
}

function SuiteScientificCalculatorPanel() {
  const [mode, setMode] = useState('basic');
  const [expression, setExpression] = useState('');
  const [mathResult, setMathResult] = useState('0');
  const [status, setStatus] = useState({ type: 'neutral', text: '已就绪，支持键盘或按钮输入' });
  const expressionInputRef = useRef(null);
  const expressionSelectionRef = useRef({ start: 0, end: 0 });
  const pendingExpressionCursorRef = useRef(null);

  const [programmerBase, setProgrammerBase] = useState('dec');
  const [programmerValue, setProgrammerValue] = useState('255');
  const [programmerOp, setProgrammerOp] = useState('NONE');
  const [programmerOperand, setProgrammerOperand] = useState('1');
  const [programmerWidth, setProgrammerWidth] = useState('32');
  const [programmerSigned, setProgrammerSigned] = useState(false);
  const [programmerResult, setProgrammerResult] = useState(() =>
    computeProgrammerCalculatorResult({
      base: 'dec',
      inputValue: '255',
      op: 'NONE',
      operandValue: '1',
      width: 32,
      signed: false,
    }),
  );

  const basicKeys = ['7', '8', '9', '/', 'DEL', '4', '5', '6', '*', '(', '1', '2', '3', '-', ')', '0', '.', '+', '^', '='];
  const scientificKeys = ['sin(', 'cos(', 'tan(', 'sqrt(', 'log(', 'ln(', 'abs(', 'pi', 'e', '%'];

  const syncExpressionSelection = (target = expressionInputRef.current) => {
    if (!target) return;
    const start = typeof target.selectionStart === 'number' ? target.selectionStart : expression.length;
    const end = typeof target.selectionEnd === 'number' ? target.selectionEnd : start;
    expressionSelectionRef.current = { start, end };
  };

  const updateExpressionWithSelection = (edit) => {
    setExpression((previous) => {
      const { start, end } = expressionSelectionRef.current;
      const safeStart = Math.max(0, Math.min(start, previous.length));
      const safeEnd = Math.max(safeStart, Math.min(end, previous.length));
      const next = edit({ previous, start: safeStart, end: safeEnd });
      pendingExpressionCursorRef.current = next.cursor;
      return next.value;
    });
  };

  const appendToken = (token) => {
    updateExpressionWithSelection(({ previous, start, end }) => ({
      value: `${previous.slice(0, start)}${token}${previous.slice(end)}`,
      cursor: start + token.length,
    }));
  };

  const deleteExpressionBySelection = () => {
    updateExpressionWithSelection(({ previous, start, end }) => {
      if (start !== end) {
        return { value: `${previous.slice(0, start)}${previous.slice(end)}`, cursor: start };
      }
      if (start === 0) {
        return { value: previous, cursor: 0 };
      }
      return {
        value: `${previous.slice(0, start - 1)}${previous.slice(end)}`,
        cursor: start - 1,
      };
    });
  };

  const isLikelyIncompleteExpression = (source) => {
    if (!source) return true;
    const open = (source.match(/\(/g) || []).length;
    const close = (source.match(/\)/g) || []).length;
    if (open > close) return true;
    return /[+\-*/^.(,]$/.test(source);
  };

  const clearExpression = () => {
    setExpression('');
    setMathResult('0');
    pendingExpressionCursorRef.current = 0;
    expressionSelectionRef.current = { start: 0, end: 0 };
    setStatus({ type: 'neutral', text: '已清空表达式' });
  };

  const evaluateMath = () => {
    try {
      const source = expression.trim();
      if (!source) throw new Error('请输入表达式');
      const value = evaluateCalculatorExpression(source);
      const text = formatCalculatorNumber(value);
      setMathResult(text);
      setStatus({ type: 'ok', text: `计算完成：${text}` });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || '表达式无效' });
    }
  };

  const handleMathKey = (token) => {
    if (token === '=') {
      evaluateMath();
      return;
    }
    if (token === 'DEL') {
      deleteExpressionBySelection();
      return;
    }
    appendToken(token);
  };

  useEffect(() => {
    const cursor = pendingExpressionCursorRef.current;
    if (cursor == null) return;
    pendingExpressionCursorRef.current = null;
    const input = expressionInputRef.current;
    if (!input) return;
    input.focus();
    input.setSelectionRange(cursor, cursor);
    expressionSelectionRef.current = { start: cursor, end: cursor };
  }, [expression]);

  useEffect(() => {
    if (mode === 'programmer') return;
    const source = expression.trim();
    if (!source) {
      setMathResult('0');
      setStatus({ type: 'neutral', text: '已就绪，支持键盘或按钮输入' });
      return;
    }
    try {
      const value = evaluateCalculatorExpression(source);
      const text = formatCalculatorNumber(value);
      setMathResult(text);
      setStatus({ type: 'ok', text: `实时结果：${text}` });
    } catch (error) {
      if (isLikelyIncompleteExpression(source)) {
        setStatus({ type: 'neutral', text: '输入中，结果会实时更新' });
        return;
      }
      setStatus({ type: 'error', text: error.message || '表达式无效' });
    }
  }, [expression, mode]);

  const copyMathResult = async () => {
    try {
      await navigator.clipboard.writeText(mathResult);
      setStatus({ type: 'ok', text: '结果已复制到剪贴板' });
    } catch {
      setStatus({ type: 'error', text: '复制失败，请检查浏览器权限' });
    }
  };

  const runProgrammerCalc = () => {
    try {
      const output = computeProgrammerCalculatorResult({
        base: programmerBase,
        inputValue: programmerValue,
        op: programmerOp,
        operandValue: programmerOperand,
        width: Number(programmerWidth),
        signed: programmerSigned,
      });
      setProgrammerResult(output);
      setStatus({ type: 'ok', text: `程序员计算完成：DEC ${output.dec}` });
    } catch (error) {
      setStatus({ type: 'error', text: error.message || '程序员计算失败' });
    }
  };

  const copyProgrammerSummary = async () => {
    if (!programmerResult) return;
    const summary = [
      `BIN: ${programmerResult.bin}`,
      `OCT: ${programmerResult.oct}`,
      `DEC: ${programmerResult.dec}`,
      `HEX: ${programmerResult.hex}`,
      `SIGNED_DEC: ${programmerResult.signedDec}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setStatus({ type: 'ok', text: '进制结果已复制' });
    } catch {
      setStatus({ type: 'error', text: '复制失败，请检查浏览器权限' });
    }
  };

  return (
    <section className="suite-tool-panel suite-calc-panel">
      <header className="suite-tool-header suite-calc-header">
        <span className="suite-tool-icon calc">=</span>
        <div>
          <h3>计算器工作区</h3>
          <p>简单计算器、科学计算器、程序员计算器三种模式</p>
        </div>
      </header>

      <div className="suite-calc-mode-tabs">
        <button className={mode === 'basic' ? 'active' : ''} onClick={() => setMode('basic')} type="button">
          简单计算器
        </button>
        <button className={mode === 'scientific' ? 'active' : ''} onClick={() => setMode('scientific')} type="button">
          科学计算器
        </button>
        <button className={mode === 'programmer' ? 'active' : ''} onClick={() => setMode('programmer')} type="button">
          程序员计算器
        </button>
      </div>

      {mode === 'programmer' ? (
        <div className="suite-calc-programmer">
          <div className="suite-calc-prog-grid">
            <label>
              <span>输入基数</span>
              <select onChange={(event) => setProgrammerBase(event.target.value)} value={programmerBase}>
                <option value="bin">二进制 BIN</option>
                <option value="oct">八进制 OCT</option>
                <option value="dec">十进制 DEC</option>
                <option value="hex">十六进制 HEX</option>
              </select>
            </label>
            <label>
              <span>位宽</span>
              <select onChange={(event) => setProgrammerWidth(event.target.value)} value={programmerWidth}>
                <option value="8">8-bit</option>
                <option value="16">16-bit</option>
                <option value="32">32-bit</option>
                <option value="64">64-bit</option>
              </select>
            </label>
            <label>
              <span>运算类型</span>
              <select onChange={(event) => setProgrammerOp(event.target.value)} value={programmerOp}>
                <option value="NONE">仅转换</option>
                <option value="AND">AND</option>
                <option value="OR">OR</option>
                <option value="XOR">XOR</option>
                <option value="NOT">NOT</option>
                <option value="SHL">左移 SHL</option>
                <option value="SHR">右移 SHR</option>
              </select>
            </label>
          </div>

          <div className="suite-calc-prog-grid value-row">
            <label>
              <span>主值</span>
              <input
                onChange={(event) => setProgrammerValue(event.target.value)}
                placeholder="例如：FF / 255 / 1010"
                value={programmerValue}
              />
            </label>
            <label>
              <span>{programmerOp === 'SHL' || programmerOp === 'SHR' ? '位移数量' : '第二操作数'}</span>
              <input
                disabled={programmerOp === 'NONE' || programmerOp === 'NOT'}
                onChange={(event) => setProgrammerOperand(event.target.value)}
                placeholder={programmerOp === 'SHL' || programmerOp === 'SHR' ? '例如：3' : '例如：0F'}
                value={programmerOperand}
              />
            </label>
            <label className="inline-check">
              <span>有符号解释</span>
              <input
                checked={programmerSigned}
                onChange={(event) => setProgrammerSigned(event.target.checked)}
                type="checkbox"
              />
            </label>
          </div>

          <div className="suite-tool-actions">
            <button className="action-button" onClick={runProgrammerCalc} type="button">
              计算/转换
            </button>
            <button className="action-button subtle" onClick={copyProgrammerSummary} type="button">
              <Copy size={16} />
              复制结果
            </button>
          </div>

          {programmerResult ? (
            <div className="suite-calc-base-grid">
              <article>
                <span>BIN</span>
                <strong>{programmerResult.bin}</strong>
              </article>
              <article>
                <span>OCT</span>
                <strong>{programmerResult.oct}</strong>
              </article>
              <article>
                <span>DEC</span>
                <strong>{programmerResult.dec}</strong>
              </article>
              <article>
                <span>HEX</span>
                <strong>{programmerResult.hex}</strong>
              </article>
              <article className="wide">
                <span>Signed DEC</span>
                <strong>{programmerResult.signedDec}</strong>
              </article>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="suite-calc-standard">
          <label className="suite-calc-expression">
            <span>数学表达式</span>
            <input
              onBlur={(event) => syncExpressionSelection(event.target)}
              onChange={(event) => {
                setExpression(event.target.value);
                syncExpressionSelection(event.target);
              }}
              onClick={(event) => syncExpressionSelection(event.target)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  evaluateMath();
                }
              }}
              onKeyUp={(event) => syncExpressionSelection(event.target)}
              onSelect={(event) => syncExpressionSelection(event.target)}
              placeholder="例如：(1+2)*3^2 + pi"
              ref={expressionInputRef}
              spellCheck="false"
              value={expression}
            />
          </label>

          <div className="suite-calc-result-card">
            <span>结果</span>
            <strong>{mathResult}</strong>
          </div>

          {mode === 'scientific' ? (
            <div className="suite-calc-func-grid">
              {scientificKeys.map((token) => (
                <button key={token} onClick={() => appendToken(token)} type="button">
                  {token}
                </button>
              ))}
            </div>
          ) : null}

          <div className="suite-calc-keypad">
            {basicKeys.map((token) => (
              <button
                className={token === '=' ? 'equals' : token === 'DEL' ? 'danger' : ''}
                key={token}
                onClick={() => handleMathKey(token)}
                type="button"
              >
                {token}
              </button>
            ))}
          </div>

          <div className="suite-tool-actions">
            <button className="action-button" onClick={evaluateMath} type="button">
              计算
            </button>
            <button className="action-button subtle" onClick={copyMathResult} type="button">
              <Copy size={16} />
              复制结果
            </button>
            <button className="action-button subtle" onClick={clearExpression} type="button">
              <Trash2 size={16} />
              清空
            </button>
          </div>
        </div>
      )}

      <div className={`suite-status ${status.type}`}>{status.text}</div>
    </section>
  );
}

function RegexTool() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [sample, setSample] = useState('admin@example.com\nsupport@toolbox.dev\ninvalid-email');

  const result = useMemo(() => {
    try {
      const safeFlags = flags.includes('g') ? flags : `${flags}g`;
      const regex = new RegExp(pattern, safeFlags);
      const matches = [];
      let match = regex.exec(sample);
      while (match) {
        matches.push({ text: match[0], index: match.index, groups: match.groups });
        if (match[0] === '') regex.lastIndex += 1;
        match = regex.exec(sample);
      }
      return { valid: true, matches };
    } catch (error) {
      return { valid: false, error: error.message, matches: [] };
    }
  }, [flags, pattern, sample]);

  return (
    <div className="tool-body">
      <div className="inline-fields">
        <label className="field-panel compact">
          <span>表达式</span>
          <input onChange={(event) => setPattern(event.target.value)} value={pattern} />
        </label>
        <label className="field-panel tiny">
          <span>Flags</span>
          <input onChange={(event) => setFlags(event.target.value)} value={flags} />
        </label>
      </div>
      <label className="field-panel">
        <span>测试文本</span>
        <textarea onChange={(event) => setSample(event.target.value)} spellCheck="false" value={sample} />
      </label>
      <div className={`result-message ${result.valid ? 'success' : 'danger'}`}>
        {result.valid ? `匹配 ${result.matches.length} 处` : result.error}
      </div>
      <div className="match-list">
        {result.matches.map((match) => (
          <div className="match-row" key={`${match.text}-${match.index}`}>
            <strong>{match.text}</strong>
            <span>index {match.index}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function JavaErrorTool() {
  const [content, setContent] = useState(javaErrorSamples['Spring Bean 注入失败']);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const report = useMemo(() => buildJavaErrorReport(result), [result]);

  const analyze = () => {
    const analysis = analyzeJavaLog(content);
    setCopied(false);
    if (!analysis.ok) {
      setResult(null);
      setError(analysis.error);
      return;
    }
    setResult(analysis.response);
    setError('');
  };

  const pickSample = (sample) => {
    setContent(sample);
    setResult(null);
    setError('');
    setCopied(false);
  };

  const clear = () => {
    setContent('');
    setResult(null);
    setError('');
    setCopied(false);
  };

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setError('');
    } catch {
      setError('复制失败，请检查浏览器剪贴板权限');
    }
  };

  return (
    <div className="tool-body">
      <div className="tool-action-bar wrap">
        {Object.entries(javaErrorSamples).map(([label, sample]) => (
          <button className="action-button subtle" key={label} onClick={() => pickSample(sample)} type="button">
            {label}
          </button>
        ))}
      </div>

      <label className="field-panel">
        <span>异常日志</span>
        <textarea
          className="java-log-input"
          maxLength={JAVA_ERROR_MAX_LENGTH}
          onChange={(event) => setContent(event.target.value)}
          placeholder="粘贴 Java 或 Spring Boot 异常堆栈"
          spellCheck="false"
          value={content}
        />
      </label>

      <div className="tool-action-bar">
        <button className="action-button primary-action" onClick={analyze} type="button">
          <Play size={16} />
          分析
        </button>
        <button className="action-button subtle" disabled={!result} onClick={copyReport} type="button">
          <Copy size={16} />
          {copied ? '已复制' : '复制报告'}
        </button>
        <button className="action-button subtle" onClick={clear} type="button">
          <Trash2 size={16} />
          清空
        </button>
      </div>

      <div className={`result-message ${error ? 'danger' : result ? 'success' : 'neutral'}`}>
        {error
          ? error
          : result
            ? `${result.exceptionType}，置信度 ${Math.round(result.confidence * 100)}%${result.masked ? '，已脱敏' : ''}`
            : `已输入 ${content.length}/${JAVA_ERROR_MAX_LENGTH} 字符`}
      </div>

      {result ? (
        <div className="java-analysis-grid">
          <section className="analysis-overview">
            <span>异常类型</span>
            <h3>{result.exceptionType}</h3>
            <p>{result.rootMessage}</p>
            <div className="confidence-meter" aria-label="置信度">
              <span style={{ width: `${Math.round(result.confidence * 100)}%` }} />
            </div>
          </section>

          <section className="diagnosis-panel wide">
            <span>诊断摘要</span>
            <p>{result.summary}</p>
          </section>

          <ResultList items={result.possibleCauses} title="可能原因" />
          <ResultList items={result.checkSteps} title="排查步骤" />
          <ResultList items={result.fixSuggestions} title="修复建议" />

          <section className="diagnosis-panel stack-panel">
            <span>关键调用栈</span>
            {result.keyFrames.length ? <pre>{result.keyFrames.join('\n')}</pre> : <p>未解析到关键调用栈</p>}
          </section>

          <section className="diagnosis-panel wide">
            <span>标签</span>
            <div className="tag-list">
              {result.tags.map((tag) => (
                <strong key={tag}>{tag}</strong>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function JwtTool() {
  const [token, setToken] = useState(jwtSample);
  const decoded = useMemo(() => decodeJwt(token), [token]);

  return (
    <div className="tool-body">
      <label className="field-panel">
        <span>JWT Token</span>
        <textarea onChange={(event) => setToken(event.target.value)} spellCheck="false" value={token} />
      </label>

      <div className={`result-message ${decoded.valid ? 'success' : 'danger'}`}>
        {decoded.valid ? decoded.expText : decoded.error}
      </div>

      <div className="editor-grid">
        <label className="field-panel">
          <span>Header</span>
          <textarea readOnly spellCheck="false" value={decoded.headerText} />
        </label>
        <label className="field-panel">
          <span>Payload</span>
          <textarea readOnly spellCheck="false" value={decoded.payloadText} />
        </label>
      </div>
    </div>
  );
}

function UrlTool() {
  const [input, setInput] = useState('https://example.com/search?q=工具网站&lang=zh-CN');
  const [output, setOutput] = useState('');

  const transforms = [
    ['URL 编码', () => encodeURIComponent(input)],
    ['URL 解码', () => decodeURIComponent(input)],
    ['Base64 编码', () => toBase64(input)],
    ['Base64 解码', () => fromBase64(input)],
    ['HTML 转义', () => escapeHtml(input)],
    ['HTML 反转义', () => unescapeHtml(input)],
  ];

  const runTransform = (transform) => {
    try {
      setOutput(transform());
    } catch (error) {
      setOutput(`转换失败：${error.message}`);
    }
  };

  return (
    <div className="tool-body">
      <div className="tool-action-bar wrap">
        {transforms.map(([label, transform]) => (
          <button className="action-button" key={label} onClick={() => runTransform(transform)} type="button">
            {label}
          </button>
        ))}
      </div>
      <div className="editor-grid">
        <label className="field-panel">
          <span>输入文本</span>
          <textarea onChange={(event) => setInput(event.target.value)} value={input} />
        </label>
        <label className="field-panel">
          <span>输出结果</span>
          <textarea readOnly value={output} />
        </label>
      </div>
    </div>
  );
}

function TimestampTool() {
  const [value, setValue] = useState(() => String(Date.now()));
  const [unit, setUnit] = useState('auto');
  const parsed = useMemo(() => parseTimestamp(value, unit), [unit, value]);

  return (
    <div className="tool-body">
      <div className="inline-fields">
        <label className="field-panel compact">
          <span>时间戳</span>
          <input onChange={(event) => setValue(event.target.value)} value={value} />
        </label>
        <label className="field-panel tiny">
          <span>单位</span>
          <select onChange={(event) => setUnit(event.target.value)} value={unit}>
            <option value="auto">自动</option>
            <option value="seconds">秒</option>
            <option value="milliseconds">毫秒</option>
          </select>
        </label>
      </div>
      <div className="tool-action-bar">
        <button className="action-button" onClick={() => setValue(String(Date.now()))} type="button">
          当前毫秒
        </button>
        <button className="action-button" onClick={() => setValue(String(Math.floor(Date.now() / 1000)))} type="button">
          当前秒
        </button>
      </div>
      <div className={`result-message ${parsed.valid ? 'success' : 'danger'}`}>
        {parsed.valid ? `识别为${parsed.unitLabel}时间戳` : parsed.error}
      </div>
      {parsed.valid ? (
        <div className="info-grid">
          <InfoItem label="本地时间" value={parsed.local} />
          <InfoItem label="ISO" value={parsed.iso} />
          <InfoItem label="UTC" value={parsed.utc} />
          <InfoItem label="日期" value={parsed.date} />
        </div>
      ) : null}
    </div>
  );
}

function HashTool() {
  const [input, setInput] = useState('ToolBox Studio');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [output, setOutput] = useState('');

  const digest = async () => {
    try {
      const bytes = new TextEncoder().encode(input);
      const hash = await crypto.subtle.digest(algorithm, bytes);
      setOutput([...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join(''));
    } catch (error) {
      setOutput(`计算失败：${error.message}`);
    }
  };

  return (
    <div className="tool-body">
      <div className="inline-fields">
        <label className="field-panel compact">
          <span>文本</span>
          <input onChange={(event) => setInput(event.target.value)} value={input} />
        </label>
        <label className="field-panel tiny">
          <span>算法</span>
          <select onChange={(event) => setAlgorithm(event.target.value)} value={algorithm}>
            <option>SHA-1</option>
            <option>SHA-256</option>
            <option>SHA-384</option>
            <option>SHA-512</option>
          </select>
        </label>
      </div>
      <button className="action-button primary-action" onClick={digest} type="button">
        计算摘要
      </button>
      <label className="field-panel">
        <span>Hash</span>
        <textarea readOnly value={output} />
      </label>
    </div>
  );
}

function DiffTool() {
  const [mode, setMode] = useState('two');
  const [pair, setPair] = useState('left-right');
  const [base, setBase] = useState(diffSamples.base);
  const [left, setLeft] = useState(diffSamples.left);
  const [right, setRight] = useState(diffSamples.right);
  const [showDiff, setShowDiff] = useState(true);
  const [showSpacerShadow, setShowSpacerShadow] = useState(true);
  const [showUnderline, setShowUnderline] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [currentDiff, setCurrentDiff] = useState(0);
  const [copied, setCopied] = useState(false);
  const editorRefs = useRef({});

  const pairConfig = getDiffPair(mode, pair, { base, left, right });
  const rows = useMemo(
    () => buildLineDiff(pairConfig.left, pairConfig.right, { ignoreCase, ignoreWhitespace }),
    [ignoreCase, ignoreWhitespace, pairConfig.left, pairConfig.right],
  );
  const diffInfo = useMemo(() => summarizeDiffRows(rows), [rows]);
  const activeGroup = diffInfo.groups[currentDiff] ?? null;
  const activeRows = useMemo(() => {
    if (!activeGroup) return new Set();
    const indexes = [];
    for (let index = activeGroup.start; index <= activeGroup.end; index += 1) {
      indexes.push(index);
    }
    return new Set(indexes);
  }, [activeGroup]);
  const editorHighlights = useMemo(
    () => buildEditorHighlights(rows, pairConfig, activeRows),
    [activeRows, pairConfig, rows],
  );

  useEffect(() => {
    setCurrentDiff((current) => (diffInfo.groups.length ? Math.min(current, diffInfo.groups.length - 1) : 0));
  }, [diffInfo.groups.length]);

  const jumpToDiff = (nextIndex) => {
    if (!diffInfo.groups.length) return;
    const safeIndex = Math.max(0, Math.min(nextIndex, diffInfo.groups.length - 1));
    setCurrentDiff(safeIndex);
    window.requestAnimationFrame(() => {
      const targets = getDiffGroupTargets(rows, pairConfig, diffInfo.groups[safeIndex]);
      targets.forEach(({ key, lineNumber }) => {
        editorRefs.current[key]?.scrollToLine(lineNumber);
      });
    });
  };

  const resetSample = () => {
    setBase(diffSamples.base);
    setLeft(diffSamples.left);
    setRight(diffSamples.right);
    setPair('left-right');
    setCopied(false);
  };

  const clearAll = () => {
    setBase('');
    setLeft('');
    setRight('');
    setCopied(false);
  };

  const swapTexts = () => {
    setLeft(right);
    setRight(left);
    setCopied(false);
  };

  const copyReport = async () => {
    const report = buildDiffReport(rows, pairConfig, diffInfo);
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const downloadReport = () => {
    const report = buildDiffReport(rows, pairConfig, diffInfo);
    downloadBlob(new Blob([report], { type: 'text/plain;charset=utf-8' }), `text-diff-${Date.now()}.txt`);
  };

  const inputPanels =
    mode === 'three'
      ? [
          { key: 'base', label: '基准文本', setter: setBase, value: base },
          { key: 'left', label: '版本 A', setter: setLeft, value: left },
          { key: 'right', label: '版本 B', setter: setRight, value: right },
        ]
      : [
          { key: 'left', label: '左侧文本', setter: setLeft, value: left },
          { key: 'right', label: '右侧文本', setter: setRight, value: right },
        ];

  return (
    <div className="tool-body diff-tool">
      <div className="diff-topline">
        <div className="diff-status" aria-live="polite">
          <strong>共 {diffInfo.groups.length} 处不同</strong>
          <span>当前第 {diffInfo.groups.length ? currentDiff + 1 : 0} 个</span>
          <span className="diff-stat-pill add">新增 {diffInfo.added}</span>
          <span className="diff-stat-pill remove">删除 {diffInfo.removed}</span>
          <span className="diff-stat-pill change">修改 {diffInfo.changed}</span>
        </div>

        <div className="diff-nav" aria-label="差异导航">
          <button
            disabled={!diffInfo.groups.length || currentDiff === 0}
            onClick={() => jumpToDiff(0)}
            title="第一个差异"
            type="button"
          >
            <ChevronsLeft size={17} />
          </button>
          <button
            disabled={!diffInfo.groups.length || currentDiff === 0}
            onClick={() => jumpToDiff(currentDiff - 1)}
            title="上一个差异"
            type="button"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            disabled={!diffInfo.groups.length || currentDiff >= diffInfo.groups.length - 1}
            onClick={() => jumpToDiff(currentDiff + 1)}
            title="下一个差异"
            type="button"
          >
            <ChevronRight size={17} />
          </button>
          <button
            disabled={!diffInfo.groups.length || currentDiff >= diffInfo.groups.length - 1}
            onClick={() => jumpToDiff(diffInfo.groups.length - 1)}
            title="最后一个差异"
            type="button"
          >
            <ChevronsRight size={17} />
          </button>
        </div>
      </div>

      <div className="diff-toolbar">
        <div className="segmented-control" role="tablist" aria-label="对比模式">
          <button
            aria-selected={mode === 'two'}
            className={mode === 'two' ? 'active' : ''}
            onClick={() => setMode('two')}
            role="tab"
            type="button"
          >
            双向
          </button>
          <button
            aria-selected={mode === 'three'}
            className={mode === 'three' ? 'active' : ''}
            onClick={() => setMode('three')}
            role="tab"
            type="button"
          >
            三向
          </button>
        </div>

        {mode === 'three' ? (
          <label className="diff-pair-select">
            <span>视图</span>
            <select onChange={(event) => setPair(event.target.value)} value={pair}>
              <option value="left-right">A ↔ B</option>
              <option value="base-left">基准 ↔ A</option>
              <option value="base-right">基准 ↔ B</option>
            </select>
          </label>
        ) : null}

        <div className="diff-toolbar-actions">
          <button className="action-button subtle" disabled={mode === 'three'} onClick={swapTexts} type="button">
            <ArrowLeftRight size={16} />
            交换
          </button>
          <button className="action-button subtle" onClick={copyReport} type="button">
            <Copy size={16} />
            {copied ? '已复制' : '复制差异'}
          </button>
          <button className="action-button subtle" onClick={downloadReport} type="button">
            <Download size={16} />
            下载报告
          </button>
          <button className="action-button subtle" onClick={resetSample} type="button">
            <RotateCcw size={16} />
            示例
          </button>
          <button className="action-button subtle" onClick={clearAll} type="button">
            <Trash2 size={16} />
            清空
          </button>
        </div>
      </div>

      <div className="diff-switches">
        <ToggleField checked={showDiff} icon={Eye} label="显示差异" onChange={setShowDiff} />
        <ToggleField checked={showSpacerShadow} label="间隔阴影" onChange={setShowSpacerShadow} />
        <ToggleField checked={showUnderline} icon={Underline} label="差异下划线" onChange={setShowUnderline} />
        <ToggleField checked={ignoreWhitespace} label="忽略空白" onChange={setIgnoreWhitespace} />
        <ToggleField checked={ignoreCase} label="忽略大小写" onChange={setIgnoreCase} />
      </div>

      <div className={`diff-input-grid mode-${mode}`}>
        {inputPanels.map((panel) => (
          <DiffTextEditor
            editorKey={panel.key}
            editorRefs={editorRefs}
            highlights={showDiff ? editorHighlights[panel.key] : new Map()}
            key={panel.key}
            label={panel.label}
            onChange={(value) => {
              panel.setter(value);
              setCopied(false);
            }}
            showSpacerShadow={showSpacerShadow}
            showUnderline={showUnderline}
            value={panel.value}
          />
        ))}
      </div>

      <div className="diff-summary-inline">
        {diffInfo.groups.length
          ? `正在对比：${pairConfig.name}，当前差异已直接标记在输入文本中`
          : `正在对比：${pairConfig.name}，内容一致`}
      </div>
    </div>
  );
}

function ImageTool() {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(0.8);
  const [outputMode, setOutputMode] = useState('auto');
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState('选择图片后会自动压缩');
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(revokeImageItem);
    };
  }, []);

  useEffect(() => {
    if (!items.length) return undefined;
    const timer = window.setTimeout(() => {
      compressItems(itemsRef.current, quality, outputMode);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [outputMode, quality]);

  const completedItems = items.filter((item) => item.status === 'done' && item.result);
  const summary = useMemo(() => {
    const original = completedItems.reduce((total, item) => total + item.file.size, 0);
    const compressed = completedItems.reduce((total, item) => total + item.result.size, 0);
    return {
      original,
      compressed,
      saved: original ? Math.round((1 - compressed / original) * 100) : 0,
    };
  }, [completedItems]);

  const compressItems = (nextItems, nextQuality = quality, nextOutputMode = outputMode) => {
    nextItems.forEach((item) => {
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, status: 'compressing', error: '' } : entry)),
      );
      compressImageFile(item.file, nextQuality, nextOutputMode)
        .then((result) => {
          setItems((current) =>
            current.map((entry) => {
              if (entry.id !== item.id) return entry;
              if (entry.result?.url) URL.revokeObjectURL(entry.result.url);
              return { ...entry, status: 'done', result, error: '' };
            }),
          );
        })
        .catch((error) => {
          setItems((current) =>
            current.map((entry) => (entry.id === item.id ? { ...entry, status: 'error', error: error.message } : entry)),
          );
        });
    });
  };

  const addFiles = (fileList) => {
    const currentCount = itemsRef.current.length;
    const available = 10 - currentCount;
    if (available <= 0) {
      setMessage('最多同时处理 10 张图片');
      return;
    }

    const picked = Array.from(fileList);
    const accepted = picked.filter(isCompressibleImage);
    const nextItems = accepted.slice(0, available).map(createImageItem);
    if (!nextItems.length) {
      setMessage('请选择 JPG、PNG、WebP 或 GIF 图片');
      return;
    }

    setItems((current) => [...current, ...nextItems]);
    setMessage(
      picked.length > nextItems.length
        ? `已添加 ${nextItems.length} 张，最多同时处理 10 张`
        : `已添加 ${nextItems.length} 张图片`,
    );
    compressItems(nextItems, quality, outputMode);
  };

  const removeItem = (id) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) revokeImageItem(target);
      return current.filter((item) => item.id !== id);
    });
  };

  const clearItems = () => {
    itemsRef.current.forEach(revokeImageItem);
    setItems([]);
    setMessage('选择图片后会自动压缩');
  };

  const downloadAll = async () => {
    if (!completedItems.length) return;
    const files = completedItems.map((item) => ({
      name: item.result.name,
      blob: item.result.blob,
    }));
    const zip = await createZipBlob(files);
    downloadBlob(zip, `toolbox-images-${Date.now()}.zip`);
  };

  const handleInput = (event) => {
    addFiles(event.target.files ?? []);
    event.target.value = '';
  };

  return (
    <div className="tool-body">
      <label
        className={`upload-box batch-upload ${dragging ? 'dragging' : ''}`}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <FileInput size={26} />
        <strong>点击或拖拽上传图片</strong>
        <span>最多 10 张，自动在浏览器本地压缩</span>
        <input accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleInput} type="file" />
      </label>

      <div className="image-toolbar">
        <label className="field-panel compact">
          <span>压缩率 {Math.round(Number(quality) * 100)}%</span>
          <input
            max="0.95"
            min="0.1"
            onChange={(event) => setQuality(Number(event.target.value))}
            step="0.05"
            type="range"
            value={quality}
          />
        </label>
        <label className="field-panel compact">
          <span>输出策略</span>
          <select onChange={(event) => setOutputMode(event.target.value)} value={outputMode}>
            <option value="auto">自动</option>
            <option value="original">保持格式</option>
            <option value="image/webp">WebP</option>
            <option value="image/jpeg">JPEG</option>
          </select>
        </label>
        <div className="image-batch-summary">
          <span>{message}</span>
          <strong>
            {completedItems.length
              ? `${formatBytes(summary.original)} -> ${formatBytes(summary.compressed)}，节省 ${summary.saved}%`
              : `${items.length}/10`}
          </strong>
        </div>
      </div>

      <div className="tool-action-bar">
        <button className="action-button primary-action" disabled={!completedItems.length} onClick={downloadAll} type="button">
          <Download size={16} />
          下载 ZIP
        </button>
        <button className="action-button subtle" disabled={!items.length} onClick={() => compressItems(itemsRef.current)} type="button">
          <RotateCcw size={16} />
          重新压缩
        </button>
        <button className="action-button subtle" disabled={!items.length} onClick={clearItems} type="button">
          <Trash2 size={16} />
          清空
        </button>
      </div>

      <div className="image-result-list">
        {items.length ? (
          items.map((item) => <ImageResultRow item={item} key={item.id} onRemove={() => removeItem(item.id)} />)
        ) : (
          <div className="empty-preview">等待上传图片</div>
        )}
      </div>
    </div>
  );
}

function ImageResultRow({ item, onRemove }) {
  const saved = item.result ? Math.round((1 - item.result.size / item.file.size) * 100) : 0;

  return (
    <div className={`image-result-row status-${item.status}`}>
      <img alt={item.file.name} src={item.preview} />
      <div className="image-file-info">
        <strong>{item.file.name}</strong>
        <span>
          原图 {formatBytes(item.file.size)}
          {item.result ? `，压缩后 ${formatBytes(item.result.size)}` : ''}
        </span>
        {item.result ? (
          <span>
            {item.result.width} x {item.result.height}，{getImageFormatLabel(item.result.mime)}
          </span>
        ) : null}
      </div>
      <div className="image-status">
        {item.status === 'compressing' ? <span className="status-pill">压缩中</span> : null}
        {item.status === 'error' ? <span className="status-pill danger">{item.error}</span> : null}
        {item.result ? (
          <span className={`status-pill ${saved >= 0 ? 'success' : 'danger'}`}>
            {saved >= 0 ? `节省 ${saved}%` : `增加 ${Math.abs(saved)}%`}
          </span>
        ) : null}
        {item.result?.staticFrame ? <span className="status-pill">GIF 首帧</span> : null}
      </div>
      <div className="row-actions">
        {item.result ? (
          <a download={item.result.name} href={item.result.url}>
            <Download size={16} />
            下载
          </a>
        ) : null}
        <button aria-label="移除图片" onClick={onRemove} type="button">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function SuiteImageCompressorPanel() {
  const [items, setItems] = useState([]);
  const [quality, setQuality] = useState(0.8);
  const [outputMode, setOutputMode] = useState('auto');
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState('选择图片后会自动压缩');
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach(revokeImageItem);
    };
  }, []);

  useEffect(() => {
    if (!items.length) return undefined;
    const timer = window.setTimeout(() => {
      compressItems(itemsRef.current, quality, outputMode);
    }, 260);
    return () => window.clearTimeout(timer);
  }, [outputMode, quality]);

  const completedItems = items.filter((item) => item.status === 'done' && item.result);
  const summary = useMemo(() => {
    const original = completedItems.reduce((total, item) => total + item.file.size, 0);
    const compressed = completedItems.reduce((total, item) => total + item.result.size, 0);
    return {
      original,
      compressed,
      saved: original ? Math.round((1 - compressed / original) * 100) : 0,
    };
  }, [completedItems]);

  const compressItems = (nextItems, nextQuality = quality, nextOutputMode = outputMode) => {
    nextItems.forEach((item) => {
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, status: 'compressing', error: '' } : entry)),
      );
      compressImageFile(item.file, nextQuality, nextOutputMode)
        .then((result) => {
          setItems((current) =>
            current.map((entry) => {
              if (entry.id !== item.id) return entry;
              if (entry.result?.url) URL.revokeObjectURL(entry.result.url);
              return { ...entry, status: 'done', result, error: '' };
            }),
          );
        })
        .catch((error) => {
          setItems((current) =>
            current.map((entry) => (entry.id === item.id ? { ...entry, status: 'error', error: error.message } : entry)),
          );
        });
    });
  };

  const addFiles = (fileList) => {
    const currentCount = itemsRef.current.length;
    const available = 10 - currentCount;
    if (available <= 0) {
      setMessage('最多同时处理 10 张图片');
      return;
    }
    const picked = Array.from(fileList);
    const accepted = picked.filter(isCompressibleImage);
    const nextItems = accepted.slice(0, available).map(createImageItem);
    if (!nextItems.length) {
      setMessage('请选择 JPG、PNG、WebP 或 GIF 图片');
      return;
    }
    setItems((current) => [...current, ...nextItems]);
    setMessage(
      picked.length > nextItems.length
        ? `已添加 ${nextItems.length} 张，最多同时处理 10 张`
        : `已添加 ${nextItems.length} 张图片`,
    );
    compressItems(nextItems, quality, outputMode);
  };

  const removeItem = (id) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) revokeImageItem(target);
      return current.filter((item) => item.id !== id);
    });
  };

  const clearItems = () => {
    itemsRef.current.forEach(revokeImageItem);
    setItems([]);
    setMessage('选择图片后会自动压缩');
  };

  const downloadAll = async () => {
    if (!completedItems.length) return;
    const files = completedItems.map((item) => ({
      name: item.result.name,
      blob: item.result.blob,
    }));
    const zip = await createZipBlob(files);
    downloadBlob(zip, `toolbox-images-${Date.now()}.zip`);
  };

  const handleInput = (event) => {
    addFiles(event.target.files ?? []);
    event.target.value = '';
  };

  return (
    <section className="suite-tool-panel suite-image-panel">
      <header className="suite-tool-header suite-image-header">
        <span className="suite-tool-icon image">
          <ImageIcon size={24} />
        </span>
        <div>
          <h3>图片压缩</h3>
          <p>批量上传、自动压缩、ZIP 下载</p>
        </div>
      </header>

      <label
        className={`suite-image-dropzone ${dragging ? 'dragging' : ''}`}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <FileInput size={30} />
        <strong>点击或拖拽上传图片</strong>
        <span>最多 10 张，自动在浏览器本地压缩</span>
        <input accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleInput} type="file" />
      </label>

      <div className="suite-image-controls">
        <label className="suite-control-card">
          <span>压缩率 {Math.round(Number(quality) * 100)}%</span>
          <input
            max="0.95"
            min="0.1"
            onChange={(event) => setQuality(Number(event.target.value))}
            step="0.05"
            type="range"
            value={quality}
          />
        </label>
        <label className="suite-control-card">
          <span>输出策略</span>
          <select onChange={(event) => setOutputMode(event.target.value)} value={outputMode}>
            <option value="auto">自动</option>
            <option value="original">保持格式</option>
            <option value="image/webp">WebP</option>
            <option value="image/jpeg">JPEG</option>
          </select>
        </label>
        <div className="suite-control-card summary">
          <span>{message}</span>
          <strong>
            {completedItems.length
              ? `${formatBytes(summary.original)} -> ${formatBytes(summary.compressed)}，节省 ${summary.saved}%`
              : `${items.length}/10`}
          </strong>
        </div>
      </div>

      <div className="suite-tool-actions">
        <button className="action-button primary-action" disabled={!completedItems.length} onClick={downloadAll} type="button">
          <Download size={16} />
          下载 ZIP
        </button>
        <button className="action-button subtle" disabled={!items.length} onClick={() => compressItems(itemsRef.current)} type="button">
          <RotateCcw size={16} />
          重新压缩
        </button>
        <button className="action-button subtle" disabled={!items.length} onClick={clearItems} type="button">
          <Trash2 size={16} />
          清空
        </button>
      </div>

      <div className="suite-image-list">
        {items.length ? (
          items.map((item) => <SuiteImageResultRow item={item} key={item.id} onRemove={() => removeItem(item.id)} />)
        ) : (
          <div className="suite-image-empty">等待上传图片</div>
        )}
      </div>
    </section>
  );
}

function SuiteImageResultRow({ item, onRemove }) {
  const saved = item.result ? Math.round((1 - item.result.size / item.file.size) * 100) : 0;

  return (
    <article className={`suite-image-row status-${item.status}`}>
      <img alt={item.file.name} src={item.preview} />
      <div className="suite-image-meta">
        <strong>{item.file.name}</strong>
        <span>
          原图 {formatBytes(item.file.size)}
          {item.result ? `，压缩后 ${formatBytes(item.result.size)}` : ''}
        </span>
        {item.result ? (
          <span>
            {item.result.width} x {item.result.height}，{getImageFormatLabel(item.result.mime)}
          </span>
        ) : null}
      </div>
      <div className="suite-image-tags">
        {item.status === 'compressing' ? <span className="status-pill">压缩中</span> : null}
        {item.status === 'error' ? <span className="status-pill danger">{item.error}</span> : null}
        {item.result ? (
          <span className={`status-pill ${saved >= 0 ? 'success' : 'danger'}`}>
            {saved >= 0 ? `节省 ${saved}%` : `增加 ${Math.abs(saved)}%`}
          </span>
        ) : null}
      </div>
      <div className="suite-image-actions">
        {item.result ? (
          <a download={item.result.name} href={item.result.url}>
            <Download size={15} />
            下载
          </a>
        ) : null}
        <button aria-label="移除图片" onClick={onRemove} type="button">
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}

function MegaToolsSuite() {
  const [suiteCategory, setSuiteCategory] = useState(mergedCategories[0]?.key ?? 'dev');
  const suiteTools = useMemo(
    () => mergedTools.filter((tool) => tool.category === suiteCategory),
    [suiteCategory],
  );
  const [activeSuiteSlug, setActiveSuiteSlug] = useState(suiteTools[0]?.slug ?? mergedTools[0]?.slug ?? '');
  const runtimeRef = useRef(null);

  useEffect(() => {
    if (!suiteTools.length) return;
    if (!suiteTools.some((tool) => tool.slug === activeSuiteSlug)) {
      setActiveSuiteSlug(suiteTools[0].slug);
    }
  }, [suiteTools, activeSuiteSlug]);

  useEffect(() => {
    const root = runtimeRef.current;
    if (!root || !activeSuiteSlug) return;
    let cancelled = false;
    root.innerHTML = '';
    mountTool(activeSuiteSlug, root).catch((error) => {
      if (cancelled || !root) return;
      root.innerHTML = '<div class="result-message danger">工具加载失败：' + (error?.message || '未知错误') + '</div>';
    });
    return () => {
      cancelled = true;
      if (root) root.innerHTML = '';
    };
  }, [activeSuiteSlug]);

  return (
    <div className="tool-body suite-tool-body">
      <div className="suite-toolbar">
        {mergedCategories.map((category) => (
          <button
            className={suiteCategory === category.key ? 'active' : ''}
            key={category.key}
            onClick={() => setSuiteCategory(category.key)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="suite-layout">
        <aside className="suite-list">
          {suiteTools.map((tool) => (
            <button
              className={activeSuiteSlug === tool.slug ? 'active' : ''}
              key={tool.slug}
              onClick={() => setActiveSuiteSlug(tool.slug)}
              type="button"
            >
              <strong>{tool.name}</strong>
              <span>{tool.summary}</span>
            </button>
          ))}
        </aside>
        <section className="suite-runtime">
          <div className="result-message neutral">
            当前：{suiteTools.find((tool) => tool.slug === activeSuiteSlug)?.name || activeSuiteSlug}
          </div>
          <div ref={runtimeRef} className="suite-runtime-body" />
        </section>
      </div>
    </div>
  );
}

function ToolPlaceholder({ tool }) {
  return (
    <div className="placeholder-panel">
      <tool.icon size={34} />
      <h3>{tool.status === 'backend' ? '建议接后端服务' : '这个工具稍后接入'}</h3>
      <p>
        {tool.status === 'backend'
          ? '可以用 Java Spring Boot 提供 API，再由当前 React 页面调用。'
          : '页面结构已经保留，后续可以在工具清单中打开为可用状态。'}
      </p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ResultList({ title, items }) {
  return (
    <section className="diagnosis-panel">
      <span>{title}</span>
      <ol>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}

function DiffTextEditor({
  editorKey,
  editorRefs,
  highlights,
  label,
  onChange,
  showSpacerShadow,
  showUnderline,
  value,
}) {
  const textareaRef = useRef(null);
  const overlayRef = useRef(null);

  const syncScroll = () => {
    if (!textareaRef.current || !overlayRef.current) return;
    overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  useEffect(() => {
    editorRefs.current[editorKey] = {
      scrollToLine(lineNumber) {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const style = window.getComputedStyle(textarea);
        const lineHeight = Number.parseFloat(style.lineHeight) || 20;
        textarea.scrollTo({
          top: Math.max(0, (lineNumber - 2) * lineHeight),
          behavior: 'smooth',
        });
        textarea.focus({ preventScroll: true });
        window.setTimeout(syncScroll, 180);
      },
    };

    return () => {
      delete editorRefs.current[editorKey];
    };
  }, [editorKey, editorRefs]);

  const lines = splitTextLines(value);

  return (
    <label className="field-panel diff-input-panel">
      <span>{label}</span>
      <div
        className={`diff-editor-shell ${showSpacerShadow ? 'show-spacer-shadow' : ''} ${
          showUnderline ? 'show-underlines' : ''
        }`}
      >
        <div aria-hidden="true" className="diff-highlight-layer" ref={overlayRef}>
          <div className="diff-highlight-content">
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const highlight = highlights.get(lineNumber);
              return (
                <div
                  className={`diff-editor-line ${highlight?.type ?? ''} ${highlight?.side ?? ''} ${
                    highlight?.active ? 'is-current' : ''
                  }`}
                  key={`${lineNumber}-${line}`}
                >
                  {renderEditorLineContent(line, highlight)}
                </div>
              );
            })}
          </div>
        </div>
        <textarea
          className="diff-editor-textarea"
          onChange={(event) => onChange(event.target.value)}
          onScroll={syncScroll}
          ref={textareaRef}
          spellCheck="false"
          value={value}
          wrap="off"
        />
      </div>
    </label>
  );
}

function ToggleField({ checked, icon: Icon, label, onChange }) {
  return (
    <label className="toggle-field">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span className="toggle-indicator" />
      {Icon ? <Icon size={15} /> : null}
      <strong>{label}</strong>
    </label>
  );
}

const toolPanels = {
  'json-lab': JsonTool,
  'regex-checker': RegexTool,
  'java-error-analyzer': JavaErrorTool,
  'jwt-inspector': JwtTool,
  'url-codec': UrlTool,
  timestamp: TimestampTool,
  'hash-lab': HashTool,
  'diff-viewer': DiffTool,
  'image-compress': ImageTool,
  'mega-tools-suite': MegaToolsSuite,
};

const suiteToolPanels = {
  'json-formatter': SuiteJsonFormatterPanel,
  'image-compressor': SuiteImageCompressorPanel,
  'scientific-calculator': SuiteScientificCalculatorPanel,
};

function parseJson(value) {
  try {
    return { valid: true, stats: countJson(JSON.parse(value)) };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

function formatJson(value, spaces) {
  try {
    return { valid: true, value: JSON.stringify(JSON.parse(value), null, spaces) };
  } catch (error) {
    return { valid: false, value: `JSON 解析失败：${error.message}` };
  }
}

function countJson(value) {
  if (Array.isArray(value)) {
    return value.reduce(
      (total, item) => mergeStats(total, countJson(item)),
      { keys: 0, arrays: 1, nodes: 1 },
    );
  }
  if (value && typeof value === 'object') {
    return Object.values(value).reduce(
      (total, item) => mergeStats(total, countJson(item)),
      { keys: Object.keys(value).length, arrays: 0, nodes: 1 },
    );
  }
  return { keys: 0, arrays: 0, nodes: 1 };
}

function mergeStats(left, right) {
  return {
    keys: left.keys + right.keys,
    arrays: left.arrays + right.arrays,
    nodes: left.nodes + right.nodes,
  };
}

function decodeJwt(token) {
  try {
    const [headerPart, payloadPart] = token.trim().split('.');
    if (!headerPart || !payloadPart) {
      throw new Error('Token 至少需要 Header 和 Payload 两段');
    }
    const header = JSON.parse(decodeBase64Url(headerPart));
    const payload = JSON.parse(decodeBase64Url(payloadPart));
    const exp = payload.exp ? new Date(payload.exp * 1000) : null;
    const expText = exp
      ? `${Date.now() > exp.getTime() ? '已过期' : '未过期'}，过期时间：${exp.toLocaleString()}`
      : '解析成功，未包含 exp 字段';
    return {
      valid: true,
      headerText: JSON.stringify(header, null, 2),
      payloadText: JSON.stringify(payload, null, 2),
      expText,
    };
  } catch (error) {
    return { valid: false, headerText: '', payloadText: '', error: `解析失败：${error.message}` };
  }
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unescapeHtml(value) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

function parseTimestamp(value, unit) {
  const numeric = Number(value.trim());
  if (!Number.isFinite(numeric)) {
    return { valid: false, error: '请输入数字时间戳' };
  }
  const useSeconds = unit === 'seconds' || (unit === 'auto' && Math.abs(numeric) < 100000000000);
  const date = new Date(useSeconds ? numeric * 1000 : numeric);
  if (Number.isNaN(date.getTime())) {
    return { valid: false, error: '时间戳超出可解析范围' };
  }
  return {
    valid: true,
    unitLabel: useSeconds ? '秒' : '毫秒',
    local: date.toLocaleString(),
    iso: date.toISOString(),
    utc: date.toUTCString(),
    date: date.toLocaleDateString(),
  };
}

function formatCalculatorNumber(value) {
  if (!Number.isFinite(value)) throw new Error('结果无效');
  if (Math.abs(value) >= 1e16 || (Math.abs(value) > 0 && Math.abs(value) < 1e-9)) {
    return value.toExponential(8);
  }
  const text = Number(value.toFixed(12)).toString();
  return text.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
}

function evaluateCalculatorExpression(expression) {
  const source = String(expression || '').trim();
  if (!source) throw new Error('请输入表达式');
  const allow = /^[0-9+\-*/().,%\s^A-Za-z_π]+$/;
  if (!allow.test(source)) throw new Error('表达式含不支持字符');

  let normalized = source
    .replace(/π/g, 'pi')
    .replace(/\^/g, '**')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\bln\s*\(/gi, 'logn(')
    .replace(/\blog\s*\(/gi, 'log10(')
    .replace(/\bpi\b/gi, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    .replace(/\bsqrt\s*\(/gi, 'Math.sqrt(')
    .replace(/\babs\s*\(/gi, 'Math.abs(')
    .replace(/\bfloor\s*\(/gi, 'Math.floor(')
    .replace(/\bceil\s*\(/gi, 'Math.ceil(')
    .replace(/\bround\s*\(/gi, 'Math.round(')
    .replace(/%/g, '/100');

  if (/[;`'"\\[\]{}]/.test(normalized)) throw new Error('表达式含不安全字符');
  const allowedWords = [
    'Math',
    'PI',
    'E',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'log10',
    'logn',
    'pow',
    'min',
    'max',
    'sqrt',
    'abs',
    'floor',
    'ceil',
    'round',
  ];
  const words = normalized.match(/[A-Za-z_]+/g) || [];
  const unknown = words.find((word) => !allowedWords.includes(word));
  if (unknown) throw new Error(`不支持函数: ${unknown}`);

  const toRad = (value) => (value * Math.PI) / 180;
  const fromRad = (value) => (value * 180) / Math.PI;
  const sin = (value) => Math.sin(toRad(Number(value)));
  const cos = (value) => Math.cos(toRad(Number(value)));
  const tan = (value) => Math.tan(toRad(Number(value)));
  const asin = (value) => fromRad(Math.asin(Number(value)));
  const acos = (value) => fromRad(Math.acos(Number(value)));
  const atan = (value) => fromRad(Math.atan(Number(value)));
  const log10 = (value) => Math.log10(Number(value));
  const logn = (value) => Math.log(Number(value));
  const pow = (left, right) => Math.pow(Number(left), Number(right));
  const min = (...args) => Math.min(...args.map((item) => Number(item)));
  const max = (...args) => Math.max(...args.map((item) => Number(item)));

  // eslint-disable-next-line no-new-func
  const fn = new Function(
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'log10',
    'logn',
    'pow',
    'min',
    'max',
    'Math',
    `return (${normalized});`,
  );
  const value = fn(sin, cos, tan, asin, acos, atan, log10, logn, pow, min, max, Math);
  if (!Number.isFinite(value)) throw new Error('结果无效');
  return value;
}

function parseBigIntByBase(input, base) {
  let raw = String(input || '')
    .trim()
    .replace(/\s+/g, '');
  if (!raw) throw new Error('请输入数值');

  let sign = 1n;
  if (raw.startsWith('-')) {
    sign = -1n;
    raw = raw.slice(1);
  } else if (raw.startsWith('+')) {
    raw = raw.slice(1);
  }
  if (!raw) throw new Error('请输入有效数值');

  let digits = raw.toLowerCase();
  if (base === 'hex' && digits.startsWith('0x')) digits = digits.slice(2);
  if (base === 'bin' && digits.startsWith('0b')) digits = digits.slice(2);
  if (base === 'oct' && digits.startsWith('0o')) digits = digits.slice(2);
  if (!digits) throw new Error('请输入有效数值');

  if (base === 'dec') {
    if (!/^\d+$/.test(digits)) throw new Error('十进制输入无效');
    return sign * BigInt(digits);
  }
  if (base === 'hex') {
    if (!/^[0-9a-f]+$/.test(digits)) throw new Error('十六进制输入无效');
    return sign * BigInt(`0x${digits}`);
  }
  if (base === 'oct') {
    if (!/^[0-7]+$/.test(digits)) throw new Error('八进制输入无效');
    return sign * BigInt(`0o${digits}`);
  }
  if (!/^[01]+$/.test(digits)) throw new Error('二进制输入无效');
  return sign * BigInt(`0b${digits}`);
}

function computeProgrammerCalculatorResult({ base, inputValue, op, operandValue, width, signed }) {
  const bitWidth = Number(width);
  if (![8, 16, 32, 64].includes(bitWidth)) throw new Error('位宽仅支持 8/16/32/64');

  const mask = (1n << BigInt(bitWidth)) - 1n;
  const full = 1n << BigInt(bitWidth);
  const maxSigned = (1n << BigInt(bitWidth - 1)) - 1n;

  const left = parseBigIntByBase(inputValue, base);
  const leftUnsigned = left & mask;
  let output = leftUnsigned;

  const parseOperand = () => {
    const raw = String(operandValue || '').trim();
    if (!raw) throw new Error('请填写第二操作数');
    return parseBigIntByBase(raw, base);
  };

  if (op === 'AND' || op === 'OR' || op === 'XOR') {
    const right = parseOperand() & mask;
    if (op === 'AND') output = leftUnsigned & right;
    if (op === 'OR') output = leftUnsigned | right;
    if (op === 'XOR') output = leftUnsigned ^ right;
  } else if (op === 'NOT') {
    output = ~leftUnsigned;
  } else if (op === 'SHL' || op === 'SHR') {
    const shiftRaw = parseOperand();
    const shift = Number(shiftRaw < 0n ? -shiftRaw : shiftRaw);
    if (!Number.isFinite(shift) || shift < 0 || shift > 1024) throw new Error('位移数量范围应为 0-1024');
    if (op === 'SHL') {
      output = leftUnsigned << BigInt(shift);
    } else {
      const signedLeft = leftUnsigned > maxSigned ? leftUnsigned - full : leftUnsigned;
      output = signedLeft >> BigInt(shift);
    }
  }

  output &= mask;
  const signedValue = output > maxSigned ? output - full : output;
  const showSigned = signed ? signedValue : output;
  return {
    bin: output.toString(2).padStart(bitWidth, '0'),
    oct: output.toString(8),
    dec: output.toString(10),
    hex: output.toString(16).toUpperCase(),
    signedDec: showSigned.toString(),
  };
}

function getDiffPair(mode, pair, texts) {
  if (mode === 'two') {
    return {
      left: texts.left,
      right: texts.right,
      leftKey: 'left',
      rightKey: 'right',
      leftLabel: '左侧文本',
      rightLabel: '右侧文本',
      name: '左侧文本 ↔ 右侧文本',
    };
  }

  if (pair === 'base-left') {
    return {
      left: texts.base,
      right: texts.left,
      leftKey: 'base',
      rightKey: 'left',
      leftLabel: '基准文本',
      rightLabel: '版本 A',
      name: '基准文本 ↔ 版本 A',
    };
  }

  if (pair === 'base-right') {
    return {
      left: texts.base,
      right: texts.right,
      leftKey: 'base',
      rightKey: 'right',
      leftLabel: '基准文本',
      rightLabel: '版本 B',
      name: '基准文本 ↔ 版本 B',
    };
  }

  return {
    left: texts.left,
    right: texts.right,
    leftKey: 'left',
    rightKey: 'right',
    leftLabel: '版本 A',
    rightLabel: '版本 B',
    name: '版本 A ↔ 版本 B',
  };
}

function buildLineDiff(left, right, options) {
  const leftLines = splitTextLines(left);
  const rightLines = splitTextLines(right);
  const leftKeys = leftLines.map((line) => normalizeDiffLine(line, options));
  const rightKeys = rightLines.map((line) => normalizeDiffLine(line, options));
  const operations = buildDiffOperations(leftLines, rightLines, leftKeys, rightKeys);
  return pairDiffOperations(operations);
}

function splitTextLines(value) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

function normalizeDiffLine(line, options) {
  let next = line;
  if (options.ignoreWhitespace) {
    next = next.replace(/\s+/g, ' ').trim();
  }
  if (options.ignoreCase) {
    next = next.toLocaleLowerCase();
  }
  return next;
}

function buildDiffOperations(leftLines, rightLines, leftKeys, rightKeys) {
  const leftLength = leftLines.length;
  const rightLength = rightLines.length;

  if (leftLength * rightLength > 900000) {
    return buildSimpleDiffOperations(leftLines, rightLines, leftKeys, rightKeys);
  }

  const columns = rightLength + 1;
  const table = new Uint32Array((leftLength + 1) * (rightLength + 1));

  for (let leftIndex = leftLength - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = rightLength - 1; rightIndex >= 0; rightIndex -= 1) {
      const offset = leftIndex * columns + rightIndex;
      table[offset] =
        leftKeys[leftIndex] === rightKeys[rightIndex]
          ? table[(leftIndex + 1) * columns + rightIndex + 1] + 1
          : Math.max(table[(leftIndex + 1) * columns + rightIndex], table[leftIndex * columns + rightIndex + 1]);
    }
  }

  const operations = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < leftLength || rightIndex < rightLength) {
    if (leftIndex < leftLength && rightIndex < rightLength && leftKeys[leftIndex] === rightKeys[rightIndex]) {
      operations.push({
        type: 'equal',
        leftNumber: leftIndex + 1,
        rightNumber: rightIndex + 1,
        leftText: leftLines[leftIndex],
        rightText: rightLines[rightIndex],
      });
      leftIndex += 1;
      rightIndex += 1;
    } else if (
      rightIndex >= rightLength ||
      (leftIndex < leftLength &&
        table[(leftIndex + 1) * columns + rightIndex] >= table[leftIndex * columns + rightIndex + 1])
    ) {
      operations.push({ type: 'remove', leftNumber: leftIndex + 1, leftText: leftLines[leftIndex] });
      leftIndex += 1;
    } else {
      operations.push({ type: 'add', rightNumber: rightIndex + 1, rightText: rightLines[rightIndex] });
      rightIndex += 1;
    }
  }

  return operations;
}

function buildSimpleDiffOperations(leftLines, rightLines, leftKeys, rightKeys) {
  const operations = [];
  const length = Math.max(leftLines.length, rightLines.length);

  for (let index = 0; index < length; index += 1) {
    if (leftKeys[index] === rightKeys[index]) {
      operations.push({
        type: 'equal',
        leftNumber: index + 1,
        rightNumber: index + 1,
        leftText: leftLines[index] ?? '',
        rightText: rightLines[index] ?? '',
      });
    } else {
      if (leftLines[index] !== undefined) {
        operations.push({ type: 'remove', leftNumber: index + 1, leftText: leftLines[index] });
      }
      if (rightLines[index] !== undefined) {
        operations.push({ type: 'add', rightNumber: index + 1, rightText: rightLines[index] });
      }
    }
  }

  return operations;
}

function pairDiffOperations(operations) {
  const rows = [];
  let index = 0;

  while (index < operations.length) {
    const operation = operations[index];
    if (operation.type === 'equal') {
      rows.push({
        id: `row-${rows.length}`,
        type: 'equal',
        leftNumber: operation.leftNumber,
        rightNumber: operation.rightNumber,
        leftText: operation.leftText,
        rightText: operation.rightText,
        inline: null,
      });
      index += 1;
      continue;
    }

    const removed = [];
    const added = [];
    while (index < operations.length && operations[index].type !== 'equal') {
      if (operations[index].type === 'remove') {
        removed.push(operations[index]);
      } else {
        added.push(operations[index]);
      }
      index += 1;
    }

    const max = Math.max(removed.length, added.length);
    for (let offset = 0; offset < max; offset += 1) {
      const leftOperation = removed[offset];
      const rightOperation = added[offset];
      const rowType = leftOperation && rightOperation ? 'change' : leftOperation ? 'remove' : 'add';
      const leftText = leftOperation?.leftText ?? null;
      const rightText = rightOperation?.rightText ?? null;
      rows.push({
        id: `row-${rows.length}`,
        type: rowType,
        leftNumber: leftOperation?.leftNumber ?? null,
        rightNumber: rightOperation?.rightNumber ?? null,
        leftText,
        rightText,
        inline: rowType === 'change' ? buildInlineDiff(leftText, rightText) : null,
      });
    }
  }

  return rows;
}

function buildInlineDiff(left, right) {
  const leftChars = [...left];
  const rightChars = [...right];

  if (!leftChars.length || !rightChars.length || leftChars.length * rightChars.length > 18000) {
    return {
      left: left ? [{ text: left, changed: true }] : [],
      right: right ? [{ text: right, changed: true }] : [],
    };
  }

  const columns = rightChars.length + 1;
  const table = new Uint32Array((leftChars.length + 1) * (rightChars.length + 1));

  for (let leftIndex = leftChars.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = rightChars.length - 1; rightIndex >= 0; rightIndex -= 1) {
      const offset = leftIndex * columns + rightIndex;
      table[offset] =
        leftChars[leftIndex] === rightChars[rightIndex]
          ? table[(leftIndex + 1) * columns + rightIndex + 1] + 1
          : Math.max(table[(leftIndex + 1) * columns + rightIndex], table[leftIndex * columns + rightIndex + 1]);
    }
  }

  const leftSegments = [];
  const rightSegments = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < leftChars.length || rightIndex < rightChars.length) {
    if (
      leftIndex < leftChars.length &&
      rightIndex < rightChars.length &&
      leftChars[leftIndex] === rightChars[rightIndex]
    ) {
      appendInlineSegment(leftSegments, leftChars[leftIndex], false);
      appendInlineSegment(rightSegments, rightChars[rightIndex], false);
      leftIndex += 1;
      rightIndex += 1;
    } else if (
      rightIndex < rightChars.length &&
      (leftIndex >= leftChars.length ||
        table[leftIndex * columns + rightIndex + 1] >= table[(leftIndex + 1) * columns + rightIndex])
    ) {
      appendInlineSegment(rightSegments, rightChars[rightIndex], true);
      rightIndex += 1;
    } else {
      appendInlineSegment(leftSegments, leftChars[leftIndex], true);
      leftIndex += 1;
    }
  }

  return { left: leftSegments, right: rightSegments };
}

function appendInlineSegment(segments, text, changed) {
  const previous = segments[segments.length - 1];
  if (previous && previous.changed === changed) {
    previous.text += text;
    return;
  }
  segments.push({ text, changed });
}

function renderEditorLineContent(line, highlight) {
  const segments = highlight?.segments;

  if (!segments?.length) {
    return <span>{line || ' '}</span>;
  }

  return segments.map((segment, index) => (
    <span className={segment.changed ? 'inline-change' : ''} key={`${index}-${segment.text}`}>
      {segment.text || ' '}
    </span>
  ));
}

function buildEditorHighlights(rows, pairConfig, activeRows) {
  const highlights = {
    base: new Map(),
    left: new Map(),
    right: new Map(),
  };

  rows.forEach((row, index) => {
    if (row.type === 'equal') return;

    const active = activeRows.has(index);

    if (row.leftNumber !== null && row.type !== 'add') {
      highlights[pairConfig.leftKey].set(row.leftNumber, {
        active,
        side: 'left-side',
        segments: row.type === 'change' ? row.inline?.left : null,
        type: row.type,
      });
    }

    if (row.rightNumber !== null && row.type !== 'remove') {
      highlights[pairConfig.rightKey].set(row.rightNumber, {
        active,
        side: 'right-side',
        segments: row.type === 'change' ? row.inline?.right : null,
        type: row.type,
      });
    }
  });

  return highlights;
}

function getDiffGroupTargets(rows, pairConfig, group) {
  const targets = [];
  const seen = new Set();

  for (let index = group.start; index <= group.end; index += 1) {
    const row = rows[index];
    if (!row) continue;

    if (row.leftNumber !== null && !seen.has(pairConfig.leftKey)) {
      seen.add(pairConfig.leftKey);
      targets.push({ key: pairConfig.leftKey, lineNumber: row.leftNumber });
    }

    if (row.rightNumber !== null && !seen.has(pairConfig.rightKey)) {
      seen.add(pairConfig.rightKey);
      targets.push({ key: pairConfig.rightKey, lineNumber: row.rightNumber });
    }
  }

  return targets;
}

function summarizeDiffRows(rows) {
  const summary = {
    added: 0,
    changed: 0,
    groups: [],
    removed: 0,
  };
  let currentGroup = null;

  rows.forEach((row, index) => {
    if (row.type === 'equal') {
      if (currentGroup) {
        summary.groups.push(currentGroup);
        currentGroup = null;
      }
      return;
    }

    if (!currentGroup) {
      currentGroup = { start: index, end: index };
    } else {
      currentGroup.end = index;
    }

    if (row.type === 'add') summary.added += 1;
    if (row.type === 'remove') summary.removed += 1;
    if (row.type === 'change') summary.changed += 1;
  });

  if (currentGroup) {
    summary.groups.push(currentGroup);
  }

  return summary;
}

function buildDiffReport(rows, pairConfig, diffInfo) {
  const lines = [
    `Text diff: ${pairConfig.name}`,
    `Changes: ${diffInfo.groups.length}, added: ${diffInfo.added}, removed: ${diffInfo.removed}, modified: ${diffInfo.changed}`,
    '',
  ];

  rows.forEach((row) => {
    if (row.type === 'equal') {
      lines.push(`  ${row.leftText}`);
    } else if (row.type === 'change') {
      lines.push(`- ${row.leftText}`);
      lines.push(`+ ${row.rightText}`);
    } else if (row.type === 'remove') {
      lines.push(`- ${row.leftText}`);
    } else {
      lines.push(`+ ${row.rightText}`);
    }
  });

  return lines.join('\n');
}

function formatBytes(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function createImageItem(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`,
    file,
    preview: URL.createObjectURL(file),
    status: 'compressing',
    result: null,
    error: '',
  };
}

function revokeImageItem(item) {
  if (item.preview) URL.revokeObjectURL(item.preview);
  if (item.result?.url) URL.revokeObjectURL(item.result.url);
}

function isCompressibleImage(file) {
  return (
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) ||
    /\.(jpe?g|png|webp|gif)$/i.test(file.name)
  );
}

async function compressImageFile(file, quality, outputMode) {
  const image = await loadImageFile(file);
  const outputMime = getOutputMime(file, outputMode);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('浏览器不支持 Canvas 压缩');
  }

  if (outputMime === 'image/jpeg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const compressed = await canvasToBlob(canvas, outputMime, outputMime === 'image/png' ? undefined : quality);
  const useOriginal = compressed.size >= file.size && outputMode === 'original';
  const blob = useOriginal ? file : compressed;
  const mime = useOriginal ? normalizeImageMime(file) : outputMime;
  const extension = getImageExtension(mime);

  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size,
    width: canvas.width,
    height: canvas.height,
    mime,
      extension,
      name: getCompressedFileName(file.name, extension),
      staticFrame: file.type === 'image/gif' || /\.gif$/i.test(file.name),
    };
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片读取失败'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else if (mime !== 'image/jpeg') {
          canvas.toBlob((fallback) => (fallback ? resolve(fallback) : reject(new Error('压缩失败'))), 'image/jpeg', quality);
        } else {
          reject(new Error('压缩失败'));
        }
      },
      mime,
      quality,
    );
  });
}

function getOutputMime(file, outputMode) {
  if (outputMode === 'image/webp' || outputMode === 'image/jpeg') return outputMode;
  if (outputMode === 'original') return normalizeImageMime(file);
  if (file.type === 'image/jpeg') return 'image/jpeg';
  return 'image/webp';
}

function normalizeImageMime(file) {
  if (file.type === 'image/png') return 'image/png';
  if (file.type === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

function getImageExtension(mime) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  return 'webp';
}

function getImageFormatLabel(mime) {
  if (mime === 'image/jpeg') return 'JPEG';
  if (mime === 'image/png') return 'PNG';
  return 'WebP';
}

function getCompressedFileName(fileName, extension) {
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'image';
  return `${baseName}.compressed.${extension}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 200);
}

async function createZipBlob(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const crc = crc32(data);
    const { time, date } = getZipDateTime();
    const localHeader = createZipHeader(30, (view) => {
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, time, true);
      view.setUint16(12, date, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, data.length, true);
      view.setUint32(22, data.length, true);
      view.setUint16(26, nameBytes.length, true);
      view.setUint16(28, 0, true);
    });

    localParts.push(localHeader, nameBytes, data);

    const centralHeader = createZipHeader(46, (view) => {
      view.setUint32(0, 0x02014b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 20, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, time, true);
      view.setUint16(14, date, true);
      view.setUint32(16, crc, true);
      view.setUint32(20, data.length, true);
      view.setUint32(24, data.length, true);
      view.setUint16(28, nameBytes.length, true);
      view.setUint16(30, 0, true);
      view.setUint16(32, 0, true);
      view.setUint16(34, 0, true);
      view.setUint16(36, 0, true);
      view.setUint32(38, 0, true);
      view.setUint32(42, offset, true);
    });
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + data.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = createZipHeader(22, (view) => {
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, files.length, true);
    view.setUint16(10, files.length, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, offset, true);
    view.setUint16(20, 0, true);
  });

  return new Blob([...localParts, ...centralParts, endRecord], { type: 'application/zip' });
}

function createZipHeader(size, write) {
  const bytes = new Uint8Array(size);
  write(new DataView(bytes.buffer));
  return bytes;
}

function getZipDateTime() {
  const now = new Date();
  return {
    time: (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2),
    date: ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate(),
  };
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc ^= bytes[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export default App;
