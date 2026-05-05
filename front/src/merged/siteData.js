export const categories = [
  {
    "key": "dev",
    "name": "开发类工具",
    "slug": "dev-tools.html",
    "intro": "面向开发与调试场景的在线免费工具，支持网页版本地处理，无需下载、无安装。"
  },
  {
    "key": "image",
    "name": "图片媒体类工具",
    "slug": "image-tools.html",
    "intro": "图片处理全部在浏览器本地完成，在线免费使用，无需注册、无安装、无需上传到服务器。"
  },
  {
    "key": "pdf",
    "name": "PDF文档类工具",
    "slug": "pdf-tools.html",
    "intro": "PDF与文档处理工具合集，网页版即开即用，本地处理优先，在线免费且无需下载客户端。"
  },
  {
    "key": "office",
    "name": "办公生活计算类工具",
    "slug": "office-tools.html",
    "intro": "办公与生活常用计算工具，纯前端本地计算，在线免费、免安装、手机电脑都能快速使用。"
  }
].map((c) => ({
  ...c,
  routePath: "/" + c.slug.replace(/\.html$/, "")
}));

export const tools = [
  {
    "id": 1,
    "category": "dev",
    "slug": "json-formatter",
    "name": "JSON格式化工具",
    "summary": "在线免费 JSON 美化与校验，支持本地处理、无需下载。",
    "categoryName": "开发类工具"
  },
  {
    "id": 2,
    "category": "dev",
    "slug": "json-to-xml",
    "name": "JSON转XML",
    "summary": "将 JSON 快速转为 XML，网页版本地转换，无需安装。",
    "categoryName": "开发类工具"
  },
  {
    "id": 3,
    "category": "dev",
    "slug": "base64-encode-decode",
    "name": "Base64加密解密",
    "summary": "Base64 编码解码一键完成，在线免费，本地运算。",
    "categoryName": "开发类工具"
  },
  {
    "id": 4,
    "category": "dev",
    "slug": "url-encode-decode",
    "name": "URL编码解码",
    "summary": "URL Encode/Decode 工具，纯前端处理，无需注册。",
    "categoryName": "开发类工具"
  },
  {
    "id": 5,
    "category": "dev",
    "slug": "timestamp-converter",
    "name": "时间戳转换工具",
    "summary": "时间戳与日期互转，支持秒/毫秒，网页版无安装。",
    "categoryName": "开发类工具"
  },
  {
    "id": 6,
    "category": "dev",
    "slug": "qr-code-generator",
    "name": "二维码生成器",
    "summary": "文本或链接转二维码，在线免费生成，可下载。",
    "categoryName": "开发类工具"
  },
  {
    "id": 7,
    "category": "dev",
    "slug": "md5-hash",
    "name": "MD5加密工具",
    "summary": "本地生成 MD5 摘要，不上传数据，免安装使用。",
    "categoryName": "开发类工具"
  },
  {
    "id": 8,
    "category": "dev",
    "slug": "sha256-hash",
    "name": "SHA256加密",
    "summary": "SHA256 哈希计算，浏览器本地处理，安全便捷。",
    "categoryName": "开发类工具"
  },
  {
    "id": 9,
    "category": "dev",
    "slug": "uuid-generator",
    "name": "随机UUID生成器",
    "summary": "快速生成 UUID，支持批量，在线免费无安装。",
    "categoryName": "开发类工具"
  },
  {
    "id": 10,
    "category": "dev",
    "slug": "regex-tester",
    "name": "正则表达式测试",
    "summary": "在线测试正则匹配结果，实时查看命中内容。",
    "categoryName": "开发类工具"
  },
  {
    "id": 11,
    "category": "dev",
    "slug": "text-trim-spaces",
    "name": "文本去空格",
    "summary": "一键清理空格与空行，纯前端处理，快速高效。",
    "categoryName": "开发类工具"
  },
  {
    "id": 12,
    "category": "dev",
    "slug": "case-converter",
    "name": "字符串大小写转换",
    "summary": "大小写、首字母格式转换，网页端一键处理。",
    "categoryName": "开发类工具"
  },
  {
    "id": 13,
    "category": "dev",
    "slug": "base-converter",
    "name": "进制转换(二进制/十六进制)",
    "summary": "二进制、十进制、十六进制互转，离线本地运算。",
    "categoryName": "开发类工具"
  },
  {
    "id": 14,
    "category": "dev",
    "slug": "ip-lookup",
    "name": "IP地址查询",
    "summary": "IP 格式校验与地址类型识别，本地处理无上传。",
    "categoryName": "开发类工具"
  },
  {
    "id": 15,
    "category": "dev",
    "slug": "port-checker",
    "name": "端口检测工具",
    "summary": "本地网页端端口连通性测试（浏览器能力范围内）。",
    "categoryName": "开发类工具"
  },
  {
    "id": 16,
    "category": "dev",
    "slug": "html-escape-unescape",
    "name": "HTML转义还原",
    "summary": "HTML 实体转义与还原，一键处理，免安装。",
    "categoryName": "开发类工具"
  },
  {
    "id": 17,
    "category": "dev",
    "slug": "csv-to-json",
    "name": "CSV转JSON",
    "summary": "CSV 文本转 JSON 数组，本地转换无需上传。",
    "categoryName": "开发类工具"
  },
  {
    "id": 18,
    "category": "dev",
    "slug": "character-counter",
    "name": "字符字数计数器",
    "summary": "统计字符数、字数、行数，在线免费使用。",
    "categoryName": "开发类工具"
  },
  {
    "id": 19,
    "category": "dev",
    "slug": "jwt-decoder",
    "name": "JWT解码工具",
    "summary": "JWT 头部与载荷本地解码，隐私安全无上传。",
    "categoryName": "开发类工具"
  },
  {
    "id": 20,
    "category": "dev",
    "slug": "color-rgb-hex-converter",
    "name": "颜色代码RGB十六进制转换",
    "summary": "RGB/HEX/HSL 色值互转，开发调色更高效。",
    "categoryName": "开发类工具"
  },
  {
    "id": 21,
    "category": "image",
    "slug": "image-compressor",
    "name": "在线图片压缩",
    "summary": "本地压缩 JPG/PNG/WebP，在线免费无需下载软件。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 22,
    "category": "image",
    "slug": "image-format-converter",
    "name": "图片格式转换(JPG/PNG/WebP)",
    "summary": "图片格式互转，纯前端本地转换，无需上传。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 23,
    "category": "image",
    "slug": "image-crop-resize",
    "name": "图片尺寸裁剪缩放",
    "summary": "在线裁剪与缩放图片，移动端也可直接使用。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 24,
    "category": "image",
    "slug": "image-watermark-remover",
    "name": "图片去水印",
    "summary": "本地遮盖式去水印处理，不上传原图，隐私友好。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 25,
    "category": "image",
    "slug": "image-ocr",
    "name": "图片OCR文字识别",
    "summary": "网页版 OCR 提取文字，本地处理优先，免安装。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 26,
    "category": "image",
    "slug": "meme-maker",
    "name": "表情包制作工具",
    "summary": "快速制作表情包，加字导出，一键完成。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 27,
    "category": "image",
    "slug": "image-grayscale-colorize",
    "name": "图片黑白上色转换",
    "summary": "黑白与彩色效果切换，支持灰度与着色处理。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 28,
    "category": "image",
    "slug": "image-stitcher",
    "name": "多张图片拼接",
    "summary": "多图横向/纵向拼接，浏览器本地合成下载。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 29,
    "category": "image",
    "slug": "ico-generator",
    "name": "ICO图标生成器",
    "summary": "PNG 一键转 ICO，适合网站 favicon 生成。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 30,
    "category": "image",
    "slug": "screenshot-text-extractor",
    "name": "截图文字提取",
    "summary": "截图 OCR 识别文字，网页版在线免费工具。",
    "categoryName": "图片媒体类工具"
  },
  {
    "id": 31,
    "category": "pdf",
    "slug": "pdf-compressor",
    "name": "PDF在线压缩",
    "summary": "PDF 本地压缩（重构导出），无需上传，在线免费。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 32,
    "category": "pdf",
    "slug": "pdf-merger",
    "name": "PDF合并工具",
    "summary": "多个 PDF 一键合并，浏览器本地处理。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 33,
    "category": "pdf",
    "slug": "pdf-splitter",
    "name": "PDF拆分分割",
    "summary": "按页码范围拆分 PDF，纯前端无服务器。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 34,
    "category": "pdf",
    "slug": "pdf-to-word",
    "name": "PDF转Word",
    "summary": "提取 PDF 文本并导出 Word 文档，网页版无安装。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 35,
    "category": "pdf",
    "slug": "pdf-to-image",
    "name": "PDF转图片",
    "summary": "PDF 页面转 PNG 图片，支持多页导出。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 36,
    "category": "pdf",
    "slug": "word-to-pdf",
    "name": "Word转PDF",
    "summary": "DOCX 转 PDF，本地转换，免下载客户端。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 37,
    "category": "pdf",
    "slug": "excel-to-pdf",
    "name": "Excel转PDF",
    "summary": "XLSX 表格转 PDF，纯前端处理，简单高效。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 38,
    "category": "pdf",
    "slug": "text-to-pdf",
    "name": "纯文本转PDF",
    "summary": "TXT/文本内容快速导出 PDF，在线免费使用。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 39,
    "category": "pdf",
    "slug": "pdf-password-remover",
    "name": "PDF密码移除",
    "summary": "已知密码场景下移除 PDF 保护并重新导出。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 40,
    "category": "pdf",
    "slug": "pdf-reader",
    "name": "在线PDF阅读",
    "summary": "网页端本地读取 PDF，支持翻页与缩放。",
    "categoryName": "PDF文档类工具"
  },
  {
    "id": 41,
    "category": "office",
    "slug": "scientific-calculator",
    "name": "在线科学计算器",
    "summary": "支持常见数学表达式计算，响应快速。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 42,
    "category": "office",
    "slug": "date-diff-calculator",
    "name": "日期天数间隔计算",
    "summary": "计算两个日期之间天数、周数与月数。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 43,
    "category": "office",
    "slug": "unit-converter",
    "name": "万能单位换算器",
    "summary": "长度、重量、温度、面积等单位一键换算。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 44,
    "category": "office",
    "slug": "chinese-to-pinyin",
    "name": "汉字转拼音",
    "summary": "中文转拼音，适合学习与内容整理。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 45,
    "category": "office",
    "slug": "traditional-simplified-converter",
    "name": "繁体简体互换",
    "summary": "繁简中文本地互转，在线免费、无安装。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 46,
    "category": "office",
    "slug": "random-number-generator",
    "name": "自定义随机数生成器",
    "summary": "设定范围与数量，批量生成随机数字。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 47,
    "category": "office",
    "slug": "strong-password-generator",
    "name": "高强度密码生成器",
    "summary": "按规则生成复杂密码，提升账户安全性。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 48,
    "category": "office",
    "slug": "garbage-sorting-query",
    "name": "垃圾分类查询",
    "summary": "输入物品名称快速查询垃圾分类建议。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 49,
    "category": "office",
    "slug": "horizontal-vertical-text",
    "name": "文字横竖排版转换",
    "summary": "文本横排与竖排互转，一键复制结果。",
    "categoryName": "办公生活计算类工具"
  },
  {
    "id": 50,
    "category": "office",
    "slug": "duplicate-text-remover",
    "name": "重复文本一键删除",
    "summary": "按行去重文本内容，适合数据清洗整理。",
    "categoryName": "办公生活计算类工具"
  }
];

export const toolsBySlug = Object.fromEntries(tools.map((t) => [t.slug, t]));
export const categoryByKey = Object.fromEntries(categories.map((c) => [c.key, c]));
export const baseFaq = [
  {
    "q": "数据会上传到服务器吗？",
    "a": "不会。该工具默认在浏览器本地处理数据，不会主动上传、储存或提交你的内容。"
  },
  {
    "q": "需要注册登录才能使用吗？",
    "a": "不需要。全站在线免费、免注册、免登录，打开网页即可直接操作。"
  },
  {
    "q": "手机和平板可以使用吗？",
    "a": "可以。页面采用响应式布局，按钮和输入区域针对触摸场景做了适配。"
  },
  {
    "q": "是否需要下载安装软件？",
    "a": "无需下载、无需安装。全部为网页版工具，打开即可使用。"
  }
];
export const defaultSteps = [
  "在输入区填写文本或上传文件，按页面提示设置参数。",
  "点击「一键处理」执行本地计算或转换。",
  "在结果区查看输出，使用「一键复制」或下载按钮获取结果。"
];
