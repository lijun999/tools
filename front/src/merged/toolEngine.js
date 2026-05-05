/* 合并工具引擎：来自在线工具合集，供 front 项目挂载使用 */
  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function toast(msg, isError) {
    let el = qs("#siteToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "siteToast";
      el.className = "fixed right-4 bottom-4 z-50 px-4 py-2 rounded-lg text-sm shadow";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className =
      "fixed right-4 bottom-4 z-50 px-4 py-2 rounded-lg text-sm shadow " +
      (isError ? "bg-red-600 text-white" : "bg-slate-900 text-white");
    el.style.opacity = "1";
    setTimeout(() => (el.style.opacity = "0"), 1800);
  }

  function copyText(text) {
    if (!text) return Promise.reject(new Error("没有可复制内容"));
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    return Promise.resolve();
  }

  function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsArrayBuffer(file);
    });
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsText(file, "utf-8");
    });
  }

  function createCanvasFromImageData(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve({ img, canvas, ctx });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  function loadScript(src, check) {
    return new Promise((resolve, reject) => {
      if (check && check()) {
        resolve();
        return;
      }
      const existing = qsa("script").find((s) => s.src === src);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("脚本加载失败: " + src));
      document.head.appendChild(s);
    });
  }

  async function loadLib(name) {
    const libs = {
      qrcode: {
        src: "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",
        check: () => typeof window.QRCode !== "undefined",
      },
      crypto: {
        src: "https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js",
        check: () => typeof window.CryptoJS !== "undefined",
      },
      pdfLib: {
        src: "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
        check: () => typeof window.PDFLib !== "undefined",
      },
      pdfjs: {
        src: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
        check: () => typeof window.pdfjsLib !== "undefined",
      },
      jspdf: {
        src: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
        check: () => !!(window.jspdf && window.jspdf.jsPDF),
      },
      mammoth: {
        src: "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.11.0/mammoth.browser.min.js",
        check: () => typeof window.mammoth !== "undefined",
      },
      xlsx: {
        src: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
        check: () => typeof window.XLSX !== "undefined",
      },
      tesseract: {
        src: "https://unpkg.com/tesseract.js@4.1.1/dist/tesseract.min.js",
        check: () => typeof window.Tesseract !== "undefined",
      },
      opencc: {
        src: "https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.js",
        check: () => typeof window.OpenCC !== "undefined",
      },
      pinyin: {
        src: "https://cdn.jsdelivr.net/npm/tiny-pinyin@1.3.2/dist/tiny-pinyin.min.js",
        check: () => typeof window.pinyin !== "undefined",
      },
    };
    const info = libs[name];
    if (!info) return;
    await loadScript(info.src, info.check);
  }

  function initMenu() {
    const btn = qs("#menuBtn");
    const menu = qs("#mobileMenu");
    if (!btn || !menu) return;
    btn.addEventListener("click", () => {
      menu.classList.toggle("hidden");
    });
  }

  function initSearch() {
    const input = qs("#toolSearch");
    if (!input) return;
    const hint = qs("#searchHint");
    const cards = qsa("#toolSections article");
    input.addEventListener("input", () => {
      const kw = input.value.trim().toLowerCase();
      let showCount = 0;
      cards.forEach((card) => {
        const ok = card.innerText.toLowerCase().includes(kw);
        card.style.display = ok ? "" : "none";
        if (ok) showCount += 1;
      });
      if (hint) hint.textContent = kw ? "匹配 " + showCount + " 个工具" : "共 " + cards.length + " 个工具";
    });
  }

  function baseToolShell(root, opts) {
    root.innerHTML = `
      <div class="toolkit-shell">
        <div class="toolkit-inputs grid gap-4">${opts.inputs || ""}</div>
        <div class="toolkit-actions flex flex-wrap gap-2">
          <button type="button" class="btn-main" data-act="process">一键处理</button>
          <button type="button" class="btn-sub" data-act="copy">一键复制结果</button>
          <button type="button" class="btn-sub" data-act="clear">一键清空</button>
          ${opts.extraButtons || ""}
        </div>
        <div class="toolkit-status" id="toolkitStatus">准备就绪，输入内容后点击一键处理</div>
        <div class="toolkit-result card p-4 bg-slate-50 border-slate-200">
          ${opts.result || '<label class="toolkit-label text-sm text-slate-600">处理结果</label><textarea id="resultText" class="textarea-base mt-2" placeholder="结果会显示在这里"></textarea>'}
        </div>
      </div>`;
    return {
      btnProcess: qs('[data-act="process"]', root),
      btnCopy: qs('[data-act="copy"]', root),
      btnClear: qs('[data-act="clear"]', root),
      status: qs("#toolkitStatus", root),
      resultText: qs("#resultText", root),
    };
  }

  function xmlEscape(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function jsonToXml(obj, nodeName) {
    const safeNode = sanitizeXmlTagName(nodeName || "item");
    if (obj === null || obj === undefined) return `<${safeNode} />`;
    if (typeof obj !== "object") {
      return `<${safeNode}>${xmlEscape(obj)}</${safeNode}>`;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => jsonToXml(item, safeNode)).join("");
    }
    const tag = sanitizeXmlTagName(nodeName || "root");
    const children = Object.entries(obj)
      .map(([k, v]) => jsonToXml(v, k))
      .join("");
    return `<${tag}>${children}</${tag}>`;
  }

  function sanitizeXmlTagName(name) {
    const raw = String(name || "item").trim();
    const replaced = raw.replace(/[^A-Za-z0-9_.:-]/g, "_");
    const withPrefix = /^[A-Za-z_]/.test(replaced) ? replaced : `n_${replaced}`;
    return withPrefix || "item";
  }

  function prettyXml(xml, indent = "  ") {
    const reg = /(>)(<)(\/*)/g;
    const normalized = xml.replace(reg, "$1\n$2$3");
    const lines = normalized.split("\n").filter(Boolean);
    let depth = 0;
    return lines
      .map((line) => {
        if (line.match(/^<\/.+>/)) depth = Math.max(0, depth - 1);
        const pad = indent.repeat(depth);
        if (line.match(/^<[^!?][^>]*[^\/]>.*$/) && !line.includes("</")) depth += 1;
        return pad + line;
      })
      .join("\n");
  }

  function safeMathEval(expr) {
    const allow = /^[0-9+\-*/().,%\s^eEpiPI]+$/;
    if (!allow.test(expr)) throw new Error("表达式含不支持字符");
    const normalized = expr
      .replace(/\^/g, "**")
      .replace(/\bpi\b/gi, "Math.PI")
      .replace(/%/g, "/100");
    // eslint-disable-next-line no-new-func
    const fn = new Function("return (" + normalized + ")");
    const res = fn();
    if (!Number.isFinite(res)) throw new Error("结果无效");
    return res;
  }

  function parseJwt(token) {
    const parts = token.split(".");
    if (parts.length < 2) throw new Error("JWT 格式错误");
    const decode = (b64) => {
      const normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized + "===".slice((normalized.length + 3) % 4);
      return decodeURIComponent(
        atob(padded)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      );
    };
    return {
      header: JSON.parse(decode(parts[0])),
      payload: JSON.parse(decode(parts[1])),
      signature: parts[2] || "",
    };
  }

  function csvToJson(csv) {
    const lines = csv.replace(/\r/g, "").split("\n").filter(Boolean);
    if (!lines.length) return [];
    const splitLine = (line) => {
      const out = [];
      let cur = "";
      let q = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
          if (q && line[i + 1] === '"') {
            cur += '"';
            i += 1;
          } else {
            q = !q;
          }
        } else if (ch === "," && !q) {
          out.push(cur);
          cur = "";
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out;
    };
    const headers = splitLine(lines[0]);
    return lines.slice(1).map((line) => {
      const cols = splitLine(line);
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i] ?? "";
      });
      return obj;
    });
  }

  function rgbHexConvert(input) {
    const text = input.trim();
    if (!text) return "";
    if (text.startsWith("#")) {
      let hex = text.slice(1);
      if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error("HEX 格式无效");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `RGB(${r}, ${g}, ${b})`;
    }
    const m = text.match(/(\d{1,3})[^\d]+(\d{1,3})[^\d]+(\d{1,3})/);
    if (!m) throw new Error("RGB 格式无效");
    const vals = m.slice(1).map((v) => Number(v));
    if (vals.some((n) => n < 0 || n > 255)) throw new Error("RGB 范围应为 0-255");
    return "#" + vals.map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function textCount(str) {
    return {
      chars: str.length,
      charsNoSpace: str.replace(/\s/g, "").length,
      words: (str.trim().match(/\S+/g) || []).length,
      lines: str ? str.split(/\r?\n/).length : 0,
    };
  }

  function createTextTool(root, setup) {
    const shell = baseToolShell(root, {
      inputs: setup.inputs,
      result: setup.result,
      extraButtons: setup.extraButtons || "",
    });
    const getOutput = setup.getOutput || (() => (shell.resultText ? shell.resultText.value : ""));
    const setStatus = (msg, type = "neutral") => {
      if (!shell.status) return;
      shell.status.textContent = msg;
      shell.status.className = `toolkit-status ${type}`;
    };
    setStatus(setup.readyText || "准备就绪，输入内容后点击一键处理");
    shell.btnProcess.addEventListener("click", async () => {
      setStatus("处理中...", "working");
      try {
        await setup.process(shell, root);
        setStatus(setup.successText || "处理完成，可复制结果或继续调整", "success");
      } catch (err) {
        setStatus(err.message || "处理失败，请检查输入内容", "error");
        toast(err.message || "处理失败", true);
      }
    });
    shell.btnCopy.addEventListener("click", async () => {
      try {
        await copyText(getOutput());
        setStatus("结果已复制到剪贴板", "success");
        toast("已复制结果");
      } catch (err) {
        setStatus(err.message || "复制失败，请检查浏览器权限", "error");
        toast(err.message || "复制失败", true);
      }
    });
    shell.btnClear.addEventListener("click", () => {
      qsa("textarea,input", root).forEach((el) => {
        if (el.type === "file") {
          el.value = "";
        } else if (el.type === "checkbox") {
          el.checked = false;
        } else if (el.type === "number") {
          el.value = "";
        } else {
          el.value = "";
        }
      });
      qsa("select", root).forEach((el) => (el.selectedIndex = 0));
      qsa("canvas", root).forEach((c) => c.getContext("2d").clearRect(0, 0, c.width, c.height));
      qsa("[data-result-html]", root).forEach((el) => (el.innerHTML = ""));
      if (shell.resultText) shell.resultText.value = "";
      if (setup.clear) setup.clear(shell, root);
      setStatus("已清空，等待新的输入", "neutral");
    });
    if (setup.init) setup.init(shell, root);
  }

  async function renderTool(slug, root) {
    const handlers = {
      // 开发类
      "json-formatter": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">JSON 输入</label><textarea id="inputText" class="textarea-base" placeholder="{\"name\":\"tool\"}"></textarea>',
          process: (shell) => {
            const input = qs("#inputText", root).value.trim();
            const obj = JSON.parse(input);
            shell.resultText.value = JSON.stringify(obj, null, 2);
          },
        }),
      "json-to-xml": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-3 gap-3"><div><label class="text-sm text-slate-600">根节点名称</label><input id="rootName" class="input-base mt-2" value="root" /></div><div><label class="inline-flex items-center gap-2 text-sm text-slate-600"><input id="withDecl" type="checkbox" checked/> 包含 XML 声明头</label></div><div><label class="inline-flex items-center gap-2 text-sm text-slate-600"><input id="prettyXml" type="checkbox" checked/> 输出格式化缩进</label></div></div><label class="text-sm text-slate-600">JSON 输入</label><textarea id="inputText" class="textarea-base" placeholder="{\"user\":{\"name\":\"A\"}}"></textarea>',
          extraButtons: '<button type="button" id="sampleJsonBtn" class="btn-sub">示例数据</button>',
          init: () => {
            const sample = '{\n  "user": {\n    "name": "Alice",\n    "roles": ["admin", "editor"]\n  },\n  "active": true\n}';
            const sampleBtn = qs("#sampleJsonBtn", root);
            if (sampleBtn) {
              sampleBtn.addEventListener("click", () => {
                qs("#inputText", root).value = sample;
              });
            }
          },
          process: (shell) => {
            const input = qs("#inputText", root).value.trim();
            const obj = JSON.parse(input);
            const rootName = qs("#rootName", root).value.trim() || "root";
            const withDecl = qs("#withDecl", root).checked;
            const isPretty = qs("#prettyXml", root).checked;
            let xmlBody = jsonToXml(obj, rootName);
            if (isPretty) xmlBody = prettyXml(xmlBody);
            shell.resultText.value = (withDecl ? '<?xml version="1.0" encoding="UTF-8"?>\n' : "") + xmlBody;
          },
          readyText: "支持自定义根节点、声明头与格式化输出",
          successText: "JSON 已转换为 XML，可复制结果继续使用",
        }),
      "base64-encode-decode": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">模式</label><select id="mode" class="input-base mt-2"><option value="encode">编码</option><option value="decode">解码</option></select></div><div><label class="text-sm text-slate-600">字符集</label><select id="charset" class="input-base mt-2"><option value="utf8">UTF-8</option></select></div></div><label class="text-sm text-slate-600">输入内容</label><textarea id="inputText" class="textarea-base" placeholder="请输入要编码或解码的内容"></textarea>',
          process: (shell) => {
            const input = qs("#inputText", root).value;
            const mode = qs("#mode", root).value;
            if (mode === "encode") {
              shell.resultText.value = btoa(unescape(encodeURIComponent(input)));
            } else {
              shell.resultText.value = decodeURIComponent(escape(atob(input.trim())));
            }
          },
        }),
      "url-encode-decode": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">模式</label><select id="mode" class="input-base mt-2"><option value="encode">URL 编码</option><option value="decode">URL 解码</option></select></div><label class="text-sm text-slate-600">输入内容</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: (shell) => {
            const v = qs("#inputText", root).value;
            const mode = qs("#mode", root).value;
            shell.resultText.value = mode === "encode" ? encodeURIComponent(v) : decodeURIComponent(v);
          },
        }),
      "timestamp-converter": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">时间戳或日期</label><input id="inputText" class="input-base mt-2" placeholder="例如：1716161616 或 2026-05-01 12:00:00" /></div><div><label class="text-sm text-slate-600">当前时间</label><input id="nowText" class="input-base mt-2" readonly /></div></div>',
          init: () => {
            const now = Date.now();
            qs("#nowText", root).value = now + " / " + new Date(now).toLocaleString();
          },
          process: (shell) => {
            const input = qs("#inputText", root).value.trim();
            if (!input) throw new Error("请输入时间戳或日期");
            if (/^\d{10,13}$/.test(input)) {
              const ms = input.length === 13 ? Number(input) : Number(input) * 1000;
              const d = new Date(ms);
              shell.resultText.value = "本地时间: " + d.toLocaleString() + "\nISO: " + d.toISOString();
            } else {
              const ts = new Date(input).getTime();
              if (Number.isNaN(ts)) throw new Error("日期格式无法识别");
              shell.resultText.value =
                "秒级时间戳: " + Math.floor(ts / 1000) + "\n毫秒时间戳: " + ts;
            }
          },
        }),
      "qr-code-generator": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">二维码内容</label><input id="inputText" class="input-base mt-2" placeholder="https://example.com" /></div><div><label class="text-sm text-slate-600">尺寸（像素）</label><input id="size" class="input-base mt-2" type="number" value="240" min="120" max="600"/></div></div>',
          result:
            '<label class="text-sm text-slate-600">二维码结果</label><div id="qrResult" data-result-html class="mt-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[150px]"></div><textarea id="resultText" class="textarea-base mt-3" placeholder="二维码数据地址将显示在这里"></textarea>',
          extraButtons:
            '<button type="button" id="downloadBtn" class="btn-sub">下载二维码</button>',
          process: async (shell) => {
            await loadLib("qrcode");
            const text = qs("#inputText", root).value.trim();
            if (!text) throw new Error("请输入二维码内容");
            const size = Number(qs("#size", root).value) || 240;
            const box = qs("#qrResult", root);
            box.innerHTML = "";
            // eslint-disable-next-line no-new
            new window.QRCode(box, {
              text,
              width: size,
              height: size,
              colorDark: "#1f2937",
              colorLight: "#ffffff",
            });
            await new Promise((r) => setTimeout(r, 30));
            const canvas = box.querySelector("canvas");
            const img = box.querySelector("img");
            const dataUrl = canvas ? canvas.toDataURL("image/png") : img ? img.src : "";
            shell.resultText.value = dataUrl || "二维码生成成功";
            qs("#downloadBtn", root).onclick = () => {
              if (!dataUrl) return;
              const a = document.createElement("a");
              a.href = dataUrl;
              a.download = "qrcode.png";
              a.click();
            };
          },
        }),
      "md5-hash": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">输入内容</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: async (shell) => {
            await loadLib("crypto");
            shell.resultText.value = window.CryptoJS.MD5(qs("#inputText", root).value).toString();
          },
        }),
      "sha256-hash": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">输入内容</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: async (shell) => {
            const text = qs("#inputText", root).value;
            if (window.crypto && window.crypto.subtle) {
              const enc = new TextEncoder().encode(text);
              const hash = await window.crypto.subtle.digest("SHA-256", enc);
              shell.resultText.value = bufferToHex(hash);
            } else {
              await loadLib("crypto");
              shell.resultText.value = window.CryptoJS.SHA256(text).toString();
            }
          },
        }),
      "uuid-generator": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">生成数量</label><input id="count" class="input-base mt-2" type="number" value="5" min="1" max="100" /></div><div><label class="text-sm text-slate-600">版本</label><select id="version" class="input-base mt-2"><option value="v4">UUID v4</option></select></div></div>',
          process: (shell) => {
            const count = Math.min(100, Math.max(1, Number(qs("#count", root).value) || 1));
            const list = [];
            for (let i = 0; i < count; i += 1) {
              if (window.crypto && window.crypto.randomUUID) {
                list.push(window.crypto.randomUUID());
              } else {
                const s = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                  const r = (Math.random() * 16) | 0;
                  const v = c === "x" ? r : (r & 0x3) | 0x8;
                  return v.toString(16);
                });
                list.push(s);
              }
            }
            shell.resultText.value = list.join("\n");
          },
        }),
      "regex-tester": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-3 gap-3"><div class="md:col-span-2"><label class="text-sm text-slate-600">正则表达式</label><input id="pattern" class="input-base mt-2" placeholder="例如：\\\b\\w+@\\w+\\.\\w+\\\b" /></div><div><label class="text-sm text-slate-600">Flags</label><input id="flags" class="input-base mt-2" value="g" placeholder="gim" /></div></div><label class="text-sm text-slate-600">待测试文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: (shell) => {
            const pattern = qs("#pattern", root).value;
            const flags = qs("#flags", root).value;
            const text = qs("#inputText", root).value;
            const reg = new RegExp(pattern, flags);
            const matches = [...text.matchAll(reg)];
            shell.resultText.value = matches.length
              ? matches.map((m, i) => `#${i + 1}: ${m[0]} (index: ${m.index})`).join("\n")
              : "未匹配到结果";
          },
        }),
      "text-trim-spaces": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><label class="inline-flex items-center gap-2 text-sm text-slate-600"><input id="rmAll" type="checkbox" /> 删除全部空格</label><label class="inline-flex items-center gap-2 text-sm text-slate-600"><input id="rmBlankLine" type="checkbox" checked/> 删除空行</label></div><label class="text-sm text-slate-600">输入文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: (shell) => {
            const text = qs("#inputText", root).value;
            const rmAll = qs("#rmAll", root).checked;
            const rmBlankLine = qs("#rmBlankLine", root).checked;
            let out = text;
            out = out
              .split(/\r?\n/)
              .map((line) => {
                if (rmAll) return line.replace(/\s+/g, "");
                return line.replace(/^\s+|\s+$/g, "");
              })
              .join("\n");
            if (rmBlankLine) out = out.split(/\r?\n/).filter((l) => l.trim() !== "").join("\n");
            shell.resultText.value = out;
          },
        }),
      "case-converter": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">转换类型</label><select id="mode" class="input-base mt-2"><option value="upper">UPPERCASE</option><option value="lower">lowercase</option><option value="title">Title Case</option><option value="snake">snake_case</option><option value="camel">camelCase</option></select></div><label class="text-sm text-slate-600">输入文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: (shell) => {
            const text = qs("#inputText", root).value;
            const mode = qs("#mode", root).value;
            let out = text;
            if (mode === "upper") out = text.toUpperCase();
            if (mode === "lower") out = text.toLowerCase();
            if (mode === "title") {
              out = text
                .toLowerCase()
                .replace(/\b\w/g, (s) => s.toUpperCase());
            }
            if (mode === "snake") {
              out = text
                .replace(/([a-z])([A-Z])/g, "$1_$2")
                .replace(/[\s-]+/g, "_")
                .toLowerCase();
            }
            if (mode === "camel") {
              const words = text
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .split(/[^a-zA-Z0-9\u4e00-\u9fa5]+/)
                .filter(Boolean);
              out = words
                .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
                .join("");
            }
            shell.resultText.value = out;
          },
        }),
      "base-converter": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-3 gap-3"><div><label class="text-sm text-slate-600">输入进制</label><select id="fromBase" class="input-base mt-2"><option value="2">2</option><option value="8">8</option><option value="10" selected>10</option><option value="16">16</option></select></div><div><label class="text-sm text-slate-600">输出进制</label><select id="toBase" class="input-base mt-2"><option value="2" selected>2</option><option value="8">8</option><option value="10">10</option><option value="16">16</option></select></div><div><label class="text-sm text-slate-600">输入值</label><input id="inputText" class="input-base mt-2" placeholder="例如 FF" /></div></div>',
          process: (shell) => {
            const fromBase = Number(qs("#fromBase", root).value);
            const toBase = Number(qs("#toBase", root).value);
            const val = qs("#inputText", root).value.trim();
            const num = parseInt(val, fromBase);
            if (Number.isNaN(num)) throw new Error("输入值与进制不匹配");
            shell.resultText.value = num.toString(toBase).toUpperCase();
          },
        }),
      "ip-lookup": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">IP 地址</label><input id="inputText" class="input-base" placeholder="例如：192.168.1.100" />',
          process: (shell) => {
            const ip = qs("#inputText", root).value.trim();
            const v4 = ip.match(/^(\d{1,3}\.){3}\d{1,3}$/);
            const v6 = ip.includes(":");
            if (!v4 && !v6) throw new Error("IP 格式无效");
            if (v4) {
              const parts = ip.split(".").map(Number);
              if (parts.some((n) => n < 0 || n > 255)) throw new Error("IPv4 段值应在 0-255");
              const privateRanges =
                (parts[0] === 10) ||
                (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
                (parts[0] === 192 && parts[1] === 168);
              shell.resultText.value =
                "IP版本: IPv4\n" +
                "地址类型: " +
                (privateRanges ? "私有地址" : "公网地址（仅格式判断）") +
                "\n说明: 纯前端本地模式不包含离线地理库。";
            } else {
              shell.resultText.value = "IP版本: IPv6\n地址格式: 有效（基础判断）\n说明: 本地工具不上传数据。";
            }
          },
        }),
      "port-checker": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-3 gap-3"><div><label class="text-sm text-slate-600">主机</label><input id="host" class="input-base mt-2" value="127.0.0.1" /></div><div><label class="text-sm text-slate-600">端口</label><input id="port" class="input-base mt-2" type="number" value="80" min="1" max="65535" /></div><div><label class="text-sm text-slate-600">协议</label><select id="proto" class="input-base mt-2"><option value="http">HTTP</option><option value="https">HTTPS</option></select></div></div>',
          process: async (shell) => {
            const host = qs("#host", root).value.trim();
            const port = Number(qs("#port", root).value);
            const proto = qs("#proto", root).value;
            if (!host) throw new Error("请输入主机");
            if (port < 1 || port > 65535) throw new Error("端口范围应为 1-65535");
            const url = `${proto}://${host}:${port}`;
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 3000);
            try {
              await fetch(url, { mode: "no-cors", signal: controller.signal });
              shell.resultText.value =
                `探测地址: ${url}\n结果: 浏览器可发起请求（端口可能可达）\n说明: 受 CORS 与浏览器安全策略影响，仅供参考。`;
            } catch (e) {
              shell.resultText.value =
                `探测地址: ${url}\n结果: 请求失败或超时\n说明: 这并不一定表示端口关闭，可能被浏览器策略拦截。`;
            } finally {
              clearTimeout(timer);
            }
          },
        }),
      "html-escape-unescape": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">模式</label><select id="mode" class="input-base mt-2"><option value="escape">HTML 转义</option><option value="unescape">HTML 还原</option></select></div><label class="text-sm text-slate-600">输入文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: (shell) => {
            const mode = qs("#mode", root).value;
            const input = qs("#inputText", root).value;
            if (mode === "escape") {
              shell.resultText.value = input
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
            } else {
              const ta = document.createElement("textarea");
              ta.innerHTML = input;
              shell.resultText.value = ta.value;
            }
          },
        }),
      "csv-to-json": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">CSV 输入</label><textarea id="inputText" class="textarea-base" placeholder="name,age\nTom,20"></textarea>',
          process: (shell) => {
            const arr = csvToJson(qs("#inputText", root).value);
            shell.resultText.value = JSON.stringify(arr, null, 2);
          },
        }),
      "character-counter": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">输入文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: (shell) => {
            const c = textCount(qs("#inputText", root).value);
            shell.resultText.value =
              "总字符数: " + c.chars + "\n" +
              "去空白字符数: " + c.charsNoSpace + "\n" +
              "单词数: " + c.words + "\n" +
              "行数: " + c.lines;
          },
        }),
      "jwt-decoder": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">JWT Token</label><textarea id="inputText" class="textarea-base" placeholder="eyJhbGciOi..."></textarea>',
          process: (shell) => {
            const parsed = parseJwt(qs("#inputText", root).value.trim());
            shell.resultText.value =
              "Header:\n" +
              JSON.stringify(parsed.header, null, 2) +
              "\n\nPayload:\n" +
              JSON.stringify(parsed.payload, null, 2) +
              "\n\nSignature:\n" +
              parsed.signature;
          },
        }),
      "color-rgb-hex-converter": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">输入 RGB 或 HEX</label><input id="inputText" class="input-base" placeholder="例如 #3b82f6 或 rgb(59,130,246)" />',
          process: (shell) => {
            shell.resultText.value = rgbHexConvert(qs("#inputText", root).value);
          },
        }),

      // 图片类
      "image-compressor": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">上传图片</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div><div><label class="text-sm text-slate-600">质量（0.1-1）</label><input id="quality" class="input-base mt-2" type="number" value="0.75" step="0.05" min="0.1" max="1"/></div></div>',
          result:
            '<label class="text-sm text-slate-600">压缩结果预览</label><div id="imgWrap" data-result-html class="mt-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[120px]"></div><textarea id="resultText" class="textarea-base mt-3" placeholder="压缩信息"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载压缩图</button>',
          process: async (shell) => {
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请先上传图片");
            const q = Math.min(1, Math.max(0.1, Number(qs("#quality", root).value) || 0.75));
            const dataUrl = await readFileAsDataURL(file);
            const { canvas } = await createCanvasFromImageData(dataUrl);
            const out = canvas.toDataURL("image/jpeg", q);
            const beforeKB = (file.size / 1024).toFixed(1);
            const afterBytes = Math.round((out.length * 3) / 4);
            const afterKB = (afterBytes / 1024).toFixed(1);
            qs("#imgWrap", root).innerHTML = '<img src="' + out + '" class="max-h-72 rounded-lg border border-slate-200" alt="compressed" />';
            shell.resultText.value = `原大小: ${beforeKB} KB\n压缩后: ${afterKB} KB\n说明: 浏览器本地压缩完成`;
            qs("#downloadBtn", root).onclick = () => {
              const a = document.createElement("a");
              a.href = out;
              a.download = "compressed.jpg";
              a.click();
            };
          },
        }),
      "image-format-converter": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">上传图片</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div><div><label class="text-sm text-slate-600">目标格式</label><select id="fmt" class="input-base mt-2"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></div></div>',
          result:
            '<label class="text-sm text-slate-600">转换结果</label><div id="imgWrap" data-result-html class="mt-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[120px]"></div><textarea id="resultText" class="textarea-base mt-3"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载图片</button>',
          process: async (shell) => {
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请先上传图片");
            const fmt = qs("#fmt", root).value;
            const dataUrl = await readFileAsDataURL(file);
            const { canvas } = await createCanvasFromImageData(dataUrl);
            const out = canvas.toDataURL(fmt, 0.92);
            const ext = fmt.split("/")[1];
            qs("#imgWrap", root).innerHTML = '<img src="' + out + '" class="max-h-72 rounded-lg border border-slate-200" alt="converted" />';
            shell.resultText.value = `输出格式: ${ext.toUpperCase()}\n处理方式: 浏览器本地转换`;
            qs("#downloadBtn", root).onclick = () => {
              const a = document.createElement("a");
              a.href = out;
              a.download = "converted." + ext;
              a.click();
            };
          },
        }),
      "image-crop-resize": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-3 gap-3"><div><label class="text-sm text-slate-600">上传图片</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div><div><label class="text-sm text-slate-600">宽度(px)</label><input id="w" class="input-base mt-2" type="number" value="800" /></div><div><label class="text-sm text-slate-600">高度(px)</label><input id="h" class="input-base mt-2" type="number" value="600" /></div></div><label class="inline-flex items-center gap-2 text-sm text-slate-600"><input id="centerCrop" type="checkbox" checked/> 使用中心裁剪后缩放</label>',
          result:
            '<label class="text-sm text-slate-600">处理结果</label><div id="imgWrap" data-result-html class="mt-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[120px]"></div><textarea id="resultText" class="textarea-base mt-3"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载图片</button>',
          process: async (shell) => {
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请先上传图片");
            const targetW = Math.max(1, Number(qs("#w", root).value) || 800);
            const targetH = Math.max(1, Number(qs("#h", root).value) || 600);
            const centerCrop = qs("#centerCrop", root).checked;
            const dataUrl = await readFileAsDataURL(file);
            const { img } = await createCanvasFromImageData(dataUrl);
            const outCanvas = document.createElement("canvas");
            outCanvas.width = targetW;
            outCanvas.height = targetH;
            const outCtx = outCanvas.getContext("2d");
            let sx = 0;
            let sy = 0;
            let sw = img.width;
            let sh = img.height;
            if (centerCrop) {
              const srcRatio = img.width / img.height;
              const targetRatio = targetW / targetH;
              if (srcRatio > targetRatio) {
                sw = Math.round(img.height * targetRatio);
                sx = Math.round((img.width - sw) / 2);
              } else {
                sh = Math.round(img.width / targetRatio);
                sy = Math.round((img.height - sh) / 2);
              }
            }
            outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
            const out = outCanvas.toDataURL("image/png");
            qs("#imgWrap", root).innerHTML = '<img src="' + out + '" class="max-h-72 rounded-lg border border-slate-200" alt="resized" />';
            shell.resultText.value = `输出尺寸: ${targetW} x ${targetH}px`;
            qs("#downloadBtn", root).onclick = () => {
              const a = document.createElement("a");
              a.href = out;
              a.download = "resized.png";
              a.click();
            };
          },
        }),
      "image-watermark-remover": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">上传图片</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div><div><label class="text-sm text-slate-600">画笔大小</label><input id="brush" class="input-base mt-2" type="number" value="26" min="5" max="120"/></div></div><p class="text-xs text-slate-500">说明：本工具为本地遮盖式去水印（模糊修补），可在水印区域反复涂抹。</p>',
          result:
            '<label class="text-sm text-slate-600">编辑画布</label><canvas id="wmCanvas" class="mt-2 w-full max-h-[460px] border border-slate-200 rounded-xl bg-white"></canvas><textarea id="resultText" class="textarea-base mt-3">请上传图片后在画布上拖动涂抹。</textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载处理图</button>',
          init: () => {
            let drawing = false;
            let canvasRef = null;
            let ctxRef = null;
            qs("#fileInput", root).addEventListener("change", async (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const data = await readFileAsDataURL(file);
              const { img } = await createCanvasFromImageData(data);
              const c = qs("#wmCanvas", root);
              c.width = img.width;
              c.height = img.height;
              c.getContext("2d").drawImage(img, 0, 0);
              canvasRef = c;
              ctxRef = c.getContext("2d");
            });
            const draw = (ev) => {
              if (!drawing || !ctxRef || !canvasRef) return;
              const rect = canvasRef.getBoundingClientRect();
              const x = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left) * (canvasRef.width / rect.width);
              const y = ((ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top) * (canvasRef.height / rect.height);
              const size = Number(qs("#brush", root).value) || 26;
              ctxRef.save();
              ctxRef.filter = "blur(6px)";
              ctxRef.globalAlpha = 0.6;
              const imgData = ctxRef.getImageData(Math.max(0, x - size), Math.max(0, y - size), size * 2, size * 2);
              ctxRef.putImageData(imgData, Math.max(0, x - size), Math.max(0, y - size));
              ctxRef.restore();
            };
            const start = () => (drawing = true);
            const stop = () => (drawing = false);
            ["mousedown", "touchstart"].forEach((evt) => qs("#wmCanvas", root).addEventListener(evt, start));
            ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) => qs("#wmCanvas", root).addEventListener(evt, stop));
            ["mousemove", "touchmove"].forEach((evt) =>
              qs("#wmCanvas", root).addEventListener(evt, (e) => {
                e.preventDefault();
                draw(e);
              }, { passive: false })
            );
            qs("#downloadBtn", root).addEventListener("click", () => {
              if (!qs("#wmCanvas", root).width) return;
              const url = qs("#wmCanvas", root).toDataURL("image/png");
              const a = document.createElement("a");
              a.href = url;
              a.download = "watermark-removed.png";
              a.click();
              qs("#resultText", root).value = "处理完成并可下载。";
            });
          },
          process: () => {
            qs("#resultText", root).value = "已进入涂抹模式：请在水印区域拖动鼠标/手指处理。";
          },
        }),
      "image-ocr": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">上传图片（支持截图）</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div>',
          result:
            '<label class="text-sm text-slate-600">OCR 结果</label><div id="ocrPreview" data-result-html class="mt-2"></div><textarea id="resultText" class="textarea-base mt-3" placeholder="识别结果会显示在这里"></textarea>',
          process: async (shell) => {
            await loadLib("tesseract");
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请先上传图片");
            const dataUrl = await readFileAsDataURL(file);
            qs("#ocrPreview", root).innerHTML =
              '<img src="' + dataUrl + '" class="max-h-72 rounded-lg border border-slate-200" alt="ocr" />';
            shell.resultText.value = "OCR 识别中，请稍候...";
            const result = await window.Tesseract.recognize(dataUrl, "chi_sim+eng");
            shell.resultText.value = result.data.text.trim() || "未识别到文字";
          },
        }),
      "meme-maker": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-3 gap-3"><div class="md:col-span-1"><label class="text-sm text-slate-600">上传底图</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div><div><label class="text-sm text-slate-600">顶部文字</label><input id="topText" class="input-base mt-2" placeholder="上方文案"/></div><div><label class="text-sm text-slate-600">底部文字</label><input id="bottomText" class="input-base mt-2" placeholder="下方文案"/></div></div>',
          result:
            '<label class="text-sm text-slate-600">预览</label><canvas id="memeCanvas" class="mt-2 w-full max-h-[460px] border border-slate-200 rounded-xl bg-white"></canvas><textarea id="resultText" class="textarea-base mt-3">上传图片后点击一键处理。</textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载表情包</button>',
          process: async (shell) => {
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请先上传图片");
            const top = qs("#topText", root).value.trim();
            const bottom = qs("#bottomText", root).value.trim();
            const data = await readFileAsDataURL(file);
            const { img } = await createCanvasFromImageData(data);
            const canvas = qs("#memeCanvas", root);
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const fontSize = Math.max(24, Math.round(img.width / 12));
            ctx.font = "bold " + fontSize + "px sans-serif";
            ctx.textAlign = "center";
            ctx.lineWidth = Math.max(3, Math.round(fontSize / 10));
            ctx.strokeStyle = "black";
            ctx.fillStyle = "white";
            if (top) {
              ctx.strokeText(top, img.width / 2, fontSize + 16);
              ctx.fillText(top, img.width / 2, fontSize + 16);
            }
            if (bottom) {
              ctx.strokeText(bottom, img.width / 2, img.height - 24);
              ctx.fillText(bottom, img.width / 2, img.height - 24);
            }
            shell.resultText.value = "表情包已生成，可下载。";
            qs("#downloadBtn", root).onclick = () => {
              const a = document.createElement("a");
              a.href = canvas.toDataURL("image/png");
              a.download = "meme.png";
              a.click();
            };
          },
        }),
      "image-grayscale-colorize": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-3 gap-3"><div><label class="text-sm text-slate-600">上传图片</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div><div><label class="text-sm text-slate-600">模式</label><select id="mode" class="input-base mt-2"><option value="gray">转黑白</option><option value="warm">暖色上色</option><option value="cool">冷色上色</option></select></div><div><label class="text-sm text-slate-600">强度(0-1)</label><input id="strength" class="input-base mt-2" type="number" step="0.1" value="0.6" min="0" max="1"/></div></div>',
          result:
            '<label class="text-sm text-slate-600">结果预览</label><canvas id="fxCanvas" class="mt-2 w-full max-h-[460px] border border-slate-200 rounded-xl bg-white"></canvas><textarea id="resultText" class="textarea-base mt-3"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载图片</button>',
          process: async (shell) => {
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请先上传图片");
            const mode = qs("#mode", root).value;
            const strength = Math.max(0, Math.min(1, Number(qs("#strength", root).value) || 0.6));
            const data = await readFileAsDataURL(file);
            const { img } = await createCanvasFromImageData(data);
            const canvas = qs("#fxCanvas", root);
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imageData.data;
            for (let i = 0; i < d.length; i += 4) {
              const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (mode === "gray") {
                d[i] = d[i + 1] = d[i + 2] = gray;
              } else if (mode === "warm") {
                d[i] = gray + 80 * strength;
                d[i + 1] = gray + 25 * strength;
                d[i + 2] = gray - 30 * strength;
              } else {
                d[i] = gray - 30 * strength;
                d[i + 1] = gray + 15 * strength;
                d[i + 2] = gray + 90 * strength;
              }
            }
            ctx.putImageData(imageData, 0, 0);
            shell.resultText.value = "图片效果处理完成。";
            qs("#downloadBtn", root).onclick = () => {
              const a = document.createElement("a");
              a.href = canvas.toDataURL("image/png");
              a.download = "image-effect.png";
              a.click();
            };
          },
        }),
      "image-stitcher": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">上传多张图片</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" multiple /></div><div><label class="text-sm text-slate-600">拼接方向</label><select id="dir" class="input-base mt-2"><option value="vertical">纵向拼接</option><option value="horizontal">横向拼接</option></select></div></div>',
          result:
            '<label class="text-sm text-slate-600">拼接结果</label><canvas id="stitchCanvas" class="mt-2 w-full max-h-[460px] border border-slate-200 rounded-xl bg-white"></canvas><textarea id="resultText" class="textarea-base mt-3"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载拼接图</button>',
          process: async (shell) => {
            const files = Array.from(qs("#fileInput", root).files || []);
            if (!files.length) throw new Error("请至少选择一张图片");
            const dir = qs("#dir", root).value;
            const imgs = [];
            for (const f of files) {
              const d = await readFileAsDataURL(f);
              const { img } = await createCanvasFromImageData(d);
              imgs.push(img);
            }
            let width = 0;
            let height = 0;
            if (dir === "vertical") {
              width = Math.max(...imgs.map((i) => i.width));
              height = imgs.reduce((s, i) => s + i.height, 0);
            } else {
              width = imgs.reduce((s, i) => s + i.width, 0);
              height = Math.max(...imgs.map((i) => i.height));
            }
            const canvas = qs("#stitchCanvas", root);
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#fff";
            ctx.fillRect(0, 0, width, height);
            let x = 0;
            let y = 0;
            imgs.forEach((img) => {
              ctx.drawImage(img, x, y);
              if (dir === "vertical") y += img.height;
              else x += img.width;
            });
            shell.resultText.value = `拼接完成：${imgs.length} 张图片，输出 ${width}x${height}px`;
            qs("#downloadBtn", root).onclick = () => {
              const a = document.createElement("a");
              a.href = canvas.toDataURL("image/png");
              a.download = "stitched.png";
              a.click();
            };
          },
        }),
      "ico-generator": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">上传 PNG/JPG 图片</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div><p class="text-xs text-slate-500">将输出 64x64 的 favicon.ico（本地生成）。</p>',
          result:
            '<label class="text-sm text-slate-600">结果预览</label><div id="icoPreview" data-result-html class="mt-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[120px]"></div><textarea id="resultText" class="textarea-base mt-3"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载ICO</button>',
          process: async (shell) => {
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请先上传图片");
            const data = await readFileAsDataURL(file);
            const { img } = await createCanvasFromImageData(data);
            const canvas = document.createElement("canvas");
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, 64, 64);
            const pngDataUrl = canvas.toDataURL("image/png");
            const pngBytes = Uint8Array.from(atob(pngDataUrl.split(",")[1]), (c) => c.charCodeAt(0));
            const header = new Uint8Array(6);
            header[2] = 1;
            header[4] = 1;
            const entry = new Uint8Array(16);
            entry[0] = 64;
            entry[1] = 64;
            entry[2] = 0;
            entry[3] = 0;
            entry[4] = 1;
            entry[6] = 32;
            const size = pngBytes.length;
            entry[8] = size & 0xff;
            entry[9] = (size >> 8) & 0xff;
            entry[10] = (size >> 16) & 0xff;
            entry[11] = (size >> 24) & 0xff;
            const offset = 6 + 16;
            entry[12] = offset & 0xff;
            entry[13] = (offset >> 8) & 0xff;
            entry[14] = (offset >> 16) & 0xff;
            entry[15] = (offset >> 24) & 0xff;
            const icoBytes = new Uint8Array(header.length + entry.length + pngBytes.length);
            icoBytes.set(header, 0);
            icoBytes.set(entry, header.length);
            icoBytes.set(pngBytes, header.length + entry.length);
            const blob = new Blob([icoBytes], { type: "image/x-icon" });
            const url = URL.createObjectURL(blob);
            qs("#icoPreview", root).innerHTML = '<img src="' + pngDataUrl + '" class="h-20 w-20 border border-slate-200 rounded" alt="ico preview"/>';
            shell.resultText.value = "ICO 生成成功（64x64）。";
            qs("#downloadBtn", root).onclick = () => {
              const a = document.createElement("a");
              a.href = url;
              a.download = "favicon.ico";
              a.click();
            };
          },
        }),
      "screenshot-text-extractor": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">上传截图图片</label><input id="fileInput" class="input-base mt-2" type="file" accept="image/*" /></div>',
          result:
            '<label class="text-sm text-slate-600">文字提取结果</label><div id="ssPreview" data-result-html class="mt-2"></div><textarea id="resultText" class="textarea-base mt-3"></textarea>',
          process: async (shell) => {
            await loadLib("tesseract");
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传截图");
            const data = await readFileAsDataURL(file);
            qs("#ssPreview", root).innerHTML =
              '<img src="' + data + '" class="max-h-72 rounded-lg border border-slate-200" alt="screenshot" />';
            shell.resultText.value = "识别中...";
            const result = await window.Tesseract.recognize(data, "chi_sim+eng");
            shell.resultText.value = result.data.text.trim() || "未识别到文字";
          },
        }),

      // PDF类
      "pdf-compressor": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">上传 PDF</label><input id="fileInput" class="input-base mt-2" type="file" accept="application/pdf" /></div><div><label class="text-sm text-slate-600">重构模式</label><select id="mode" class="input-base mt-2"><option value="rebuild">结构重构压缩</option><option value="image">图像重采样压缩</option></select></div></div>',
          result:
            '<label class="text-sm text-slate-600">压缩结果</label><textarea id="resultText" class="textarea-base mt-2"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载PDF</button>',
          process: async (shell) => {
            await loadLib("pdfLib");
            await loadLib("pdfjs");
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传 PDF 文件");
            const mode = qs("#mode", root).value;
            const bytes = await readFileAsArrayBuffer(file);
            let outBytes;
            if (mode === "rebuild") {
              const doc = await window.PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
              outBytes = await doc.save({ useObjectStreams: true, objectsPerTick: 30 });
            } else {
              window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
              const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
              await loadLib("jspdf");
              const jsPDF = window.jspdf.jsPDF;
              const pdfOut = new jsPDF();
              for (let p = 1; p <= pdf.numPages; p += 1) {
                const page = await pdf.getPage(p);
                const viewport = page.getViewport({ scale: 1 });
                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext("2d");
                await page.render({ canvasContext: ctx, viewport }).promise;
                const img = canvas.toDataURL("image/jpeg", 0.72);
                if (p > 1) pdfOut.addPage();
                const w = pdfOut.internal.pageSize.getWidth();
                const h = (viewport.height / viewport.width) * w;
                pdfOut.addImage(img, "JPEG", 0, 0, w, h);
              }
              outBytes = pdfOut.output("arraybuffer");
            }
            const blob = new Blob([outBytes], { type: "application/pdf" });
            const before = (file.size / 1024).toFixed(1);
            const after = (blob.size / 1024).toFixed(1);
            shell.resultText.value = `处理完成\n原始大小: ${before} KB\n输出大小: ${after} KB\n说明: 浏览器本地压缩`;
            qs("#downloadBtn", root).onclick = () => downloadBlob(blob, "compressed.pdf");
          },
        }),
      "pdf-merger": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">上传多个 PDF</label><input id="fileInput" class="input-base mt-2" type="file" accept="application/pdf" multiple /></div>',
          result: '<label class="text-sm text-slate-600">合并结果</label><textarea id="resultText" class="textarea-base mt-2"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载合并PDF</button>',
          process: async (shell) => {
            await loadLib("pdfLib");
            const files = Array.from(qs("#fileInput", root).files || []);
            if (files.length < 2) throw new Error("请至少选择两个 PDF");
            const merged = await window.PDFLib.PDFDocument.create();
            let totalPages = 0;
            for (const file of files) {
              const bytes = await readFileAsArrayBuffer(file);
              const doc = await window.PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
              const pages = await merged.copyPages(doc, doc.getPageIndices());
              pages.forEach((p) => merged.addPage(p));
              totalPages += pages.length;
            }
            const out = await merged.save();
            const blob = new Blob([out], { type: "application/pdf" });
            shell.resultText.value = `合并成功\n文件数量: ${files.length}\n总页数: ${totalPages}`;
            qs("#downloadBtn", root).onclick = () => downloadBlob(blob, "merged.pdf");
          },
        }),
      "pdf-splitter": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">上传 PDF</label><input id="fileInput" class="input-base mt-2" type="file" accept="application/pdf" /></div><div><label class="text-sm text-slate-600">页码范围（如 1-3,5）</label><input id="ranges" class="input-base mt-2" placeholder="1-2,4" /></div></div>',
          result: '<label class="text-sm text-slate-600">拆分结果</label><textarea id="resultText" class="textarea-base mt-2"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载拆分PDF</button>',
          process: async (shell) => {
            await loadLib("pdfLib");
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传 PDF");
            const ranges = qs("#ranges", root).value.trim();
            if (!ranges) throw new Error("请输入页码范围");
            const bytes = await readFileAsArrayBuffer(file);
            const src = await window.PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true });
            const total = src.getPageCount();
            const idx = new Set();
            ranges.split(",").forEach((part) => {
              const p = part.trim();
              if (!p) return;
              if (p.includes("-")) {
                const [a, b] = p.split("-").map((n) => Number(n));
                const from = Math.max(1, a);
                const to = Math.min(total, b);
                for (let i = from; i <= to; i += 1) idx.add(i - 1);
              } else {
                const n = Number(p);
                if (n >= 1 && n <= total) idx.add(n - 1);
              }
            });
            const outDoc = await window.PDFLib.PDFDocument.create();
            const pages = await outDoc.copyPages(src, [...idx].sort((a, b) => a - b));
            pages.forEach((p) => outDoc.addPage(p));
            const out = await outDoc.save();
            const blob = new Blob([out], { type: "application/pdf" });
            shell.resultText.value = `拆分成功\n选中页数: ${pages.length}\n原总页数: ${total}`;
            qs("#downloadBtn", root).onclick = () => downloadBlob(blob, "split.pdf");
          },
        }),
      "pdf-to-word": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">上传 PDF</label><input id="fileInput" class="input-base mt-2" type="file" accept="application/pdf" /></div><p class="text-xs text-slate-500">说明：当前为文本提取模式，适合普通文档，不保证复杂排版完全一致。</p>',
          result:
            '<label class="text-sm text-slate-600">提取文本</label><textarea id="resultText" class="textarea-base mt-2"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载Word</button>',
          process: async (shell) => {
            await loadLib("pdfjs");
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传 PDF");
            const bytes = await readFileAsArrayBuffer(file);
            const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
            let allText = "";
            for (let p = 1; p <= pdf.numPages; p += 1) {
              const page = await pdf.getPage(p);
              const txt = await page.getTextContent();
              const line = txt.items.map((i) => i.str).join(" ");
              allText += "第 " + p + " 页\n" + line + "\n\n";
            }
            shell.resultText.value = allText.trim();
            qs("#downloadBtn", root).onclick = () => {
              const html = "<html><head><meta charset='utf-8'></head><body><pre>" +
                shell.resultText.value
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;") +
                "</pre></body></html>";
              downloadBlob(new Blob([html], { type: "application/msword" }), "pdf-to-word.doc");
            };
          },
        }),
      "pdf-to-image": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">上传 PDF</label><input id="fileInput" class="input-base mt-2" type="file" accept="application/pdf" /></div>',
          result:
            '<label class="text-sm text-slate-600">页面预览</label><div id="imgPages" data-result-html class="mt-2 space-y-3"></div><textarea id="resultText" class="textarea-base mt-3"></textarea>',
          process: async (shell) => {
            await loadLib("pdfjs");
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传 PDF");
            const bytes = await readFileAsArrayBuffer(file);
            const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
            const wrap = qs("#imgPages", root);
            wrap.innerHTML = "";
            for (let p = 1; p <= Math.min(20, pdf.numPages); p += 1) {
              const page = await pdf.getPage(p);
              const vp = page.getViewport({ scale: 1.3 });
              const canvas = document.createElement("canvas");
              canvas.width = vp.width;
              canvas.height = vp.height;
              await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
              const url = canvas.toDataURL("image/png");
              const row = document.createElement("div");
              row.className = "card p-3";
              row.innerHTML =
                '<img src="' + url + '" class="max-h-80 border border-slate-200 rounded" alt="page" />' +
                '<div class="mt-2"><button class="btn-sub text-sm" data-url="' + url + '" data-page="' + p + '">下载第' + p + "页</button></div>";
              wrap.appendChild(row);
            }
            qsa("button[data-url]", wrap).forEach((btn) => {
              btn.onclick = () => {
                const a = document.createElement("a");
                a.href = btn.getAttribute("data-url");
                a.download = "page-" + btn.getAttribute("data-page") + ".png";
                a.click();
              };
            });
            shell.resultText.value = "转换完成，共 " + pdf.numPages + " 页（页面展示最多20页）。";
          },
        }),
      "word-to-pdf": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">上传 DOCX 文件</label><input id="fileInput" class="input-base mt-2" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" /></div>',
          result:
            '<label class="text-sm text-slate-600">提取文本</label><textarea id="resultText" class="textarea-base mt-2"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载PDF</button>',
          process: async (shell) => {
            await loadLib("mammoth");
            await loadLib("jspdf");
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传 DOCX");
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            const text = result.value.trim();
            shell.resultText.value = text || "未读取到文本内容";
            qs("#downloadBtn", root).onclick = () => {
              const jsPDF = window.jspdf.jsPDF;
              const doc = new jsPDF();
              const lines = doc.splitTextToSize(shell.resultText.value || "", 180);
              let y = 12;
              lines.forEach((line) => {
                if (y > 280) {
                  doc.addPage();
                  y = 12;
                }
                doc.text(line, 12, y);
                y += 7;
              });
              doc.save("word-to-pdf.pdf");
            };
          },
        }),
      "excel-to-pdf": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">上传 XLSX 文件</label><input id="fileInput" class="input-base mt-2" type="file" accept=".xlsx,.xls" /></div>',
          result:
            '<label class="text-sm text-slate-600">表格预览文本</label><textarea id="resultText" class="textarea-base mt-2"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载PDF</button>',
          process: async (shell) => {
            await loadLib("xlsx");
            await loadLib("jspdf");
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传 Excel 文件");
            const bytes = await readFileAsArrayBuffer(file);
            const wb = window.XLSX.read(bytes, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const text = rows.map((r) => r.join("\t")).join("\n");
            shell.resultText.value = text || "空表格";
            qs("#downloadBtn", root).onclick = () => {
              const jsPDF = window.jspdf.jsPDF;
              const doc = new jsPDF();
              const lines = doc.splitTextToSize(shell.resultText.value, 180);
              let y = 12;
              lines.forEach((line) => {
                if (y > 280) {
                  doc.addPage();
                  y = 12;
                }
                doc.text(line, 12, y);
                y += 6;
              });
              doc.save("excel-to-pdf.pdf");
            };
          },
        }),
      "text-to-pdf": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">输入文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          result:
            '<label class="text-sm text-slate-600">输出预览</label><textarea id="resultText" class="textarea-base mt-2" placeholder="处理结果会显示在这里"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载PDF</button>',
          process: async (shell) => {
            await loadLib("jspdf");
            const text = qs("#inputText", root).value;
            shell.resultText.value = text;
            qs("#downloadBtn", root).onclick = () => {
              const jsPDF = window.jspdf.jsPDF;
              const doc = new jsPDF();
              const lines = doc.splitTextToSize(text, 180);
              let y = 12;
              lines.forEach((line) => {
                if (y > 280) {
                  doc.addPage();
                  y = 12;
                }
                doc.text(line, 12, y);
                y += 7;
              });
              doc.save("text.pdf");
            };
          },
        }),
      "pdf-password-remover": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">上传加密PDF</label><input id="fileInput" class="input-base mt-2" type="file" accept="application/pdf" /></div><div><label class="text-sm text-slate-600">已知密码（如有）</label><input id="pwd" class="input-base mt-2" type="password" placeholder="可选"/></div></div><p class="text-xs text-slate-500">说明：需要已知密码或可直接解析文档，工具会重新导出无密码副本。</p>',
          result: '<label class="text-sm text-slate-600">处理结果</label><textarea id="resultText" class="textarea-base mt-2"></textarea>',
          extraButtons: '<button type="button" id="downloadBtn" class="btn-sub">下载无密码PDF</button>',
          process: async (shell) => {
            await loadLib("pdfjs");
            await loadLib("jspdf");
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传 PDF");
            const pwd = qs("#pwd", root).value || undefined;
            const bytes = await readFileAsArrayBuffer(file);
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            const loadingTask = window.pdfjsLib.getDocument({ data: bytes, password: pwd });
            const pdf = await loadingTask.promise;
            const jsPDF = window.jspdf.jsPDF;
            const out = new jsPDF();
            for (let p = 1; p <= pdf.numPages; p += 1) {
              const page = await pdf.getPage(p);
              const vp = page.getViewport({ scale: 1 });
              const canvas = document.createElement("canvas");
              canvas.width = vp.width;
              canvas.height = vp.height;
              await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
              const img = canvas.toDataURL("image/jpeg", 0.85);
              if (p > 1) out.addPage();
              const w = out.internal.pageSize.getWidth();
              const h = (vp.height / vp.width) * w;
              out.addImage(img, "JPEG", 0, 0, w, h);
            }
            const blob = out.output("blob");
            shell.resultText.value = "已重新导出无密码 PDF（图像重建方式）。";
            qs("#downloadBtn", root).onclick = () => downloadBlob(blob, "pdf-unlocked.pdf");
          },
        }),
      "pdf-reader": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-3 gap-3"><div class="md:col-span-2"><label class="text-sm text-slate-600">上传 PDF</label><input id="fileInput" class="input-base mt-2" type="file" accept="application/pdf" /></div><div><label class="text-sm text-slate-600">缩放</label><input id="scale" class="input-base mt-2" type="number" value="1.2" step="0.1" min="0.5" max="3"/></div></div>',
          result:
            '<label class="text-sm text-slate-600">阅读区</label><div id="pdfPages" data-result-html class="mt-2 space-y-4 max-h-[680px] overflow-auto p-2 bg-white border border-slate-200 rounded-xl"></div><textarea id="resultText" class="textarea-base mt-3"></textarea>',
          process: async (shell) => {
            await loadLib("pdfjs");
            const file = qs("#fileInput", root).files[0];
            if (!file) throw new Error("请上传 PDF");
            const scale = Number(qs("#scale", root).value) || 1.2;
            const bytes = await readFileAsArrayBuffer(file);
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
            const wrap = qs("#pdfPages", root);
            wrap.innerHTML = "";
            for (let p = 1; p <= pdf.numPages; p += 1) {
              const page = await pdf.getPage(p);
              const vp = page.getViewport({ scale });
              const canvas = document.createElement("canvas");
              canvas.width = vp.width;
              canvas.height = vp.height;
              await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
              const box = document.createElement("div");
              box.className = "border border-slate-200 rounded-lg p-2";
              box.appendChild(canvas);
              wrap.appendChild(box);
            }
            shell.resultText.value = "加载完成，共 " + pdf.numPages + " 页。";
          },
        }),

      // 办公生活类
      "scientific-calculator": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">数学表达式</label><input id="inputText" class="input-base" placeholder="例如：(1+2)*3^2 + pi" />',
          process: (shell) => {
            const expr = qs("#inputText", root).value.trim();
            if (!expr) throw new Error("请输入表达式");
            shell.resultText.value = String(safeMathEval(expr));
          },
        }),
      "date-diff-calculator": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">开始日期</label><input id="start" type="date" class="input-base mt-2"/></div><div><label class="text-sm text-slate-600">结束日期</label><input id="end" type="date" class="input-base mt-2"/></div></div>',
          process: (shell) => {
            const s = qs("#start", root).value;
            const e = qs("#end", root).value;
            if (!s || !e) throw new Error("请选择两个日期");
            const start = new Date(s + "T00:00:00");
            const end = new Date(e + "T00:00:00");
            const diffMs = end - start;
            const days = Math.round(diffMs / 86400000);
            shell.resultText.value =
              "天数差: " + days + "\n" +
              "周数差: " + (days / 7).toFixed(2) + "\n" +
              "月数差(约): " + (days / 30).toFixed(2);
          },
        }),
      "unit-converter": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-4 gap-3"><div><label class="text-sm text-slate-600">类型</label><select id="type" class="input-base mt-2"><option value="length">长度</option><option value="weight">重量</option><option value="temp">温度</option><option value="area">面积</option></select></div><div><label class="text-sm text-slate-600">输入单位</label><select id="from" class="input-base mt-2"></select></div><div><label class="text-sm text-slate-600">输出单位</label><select id="to" class="input-base mt-2"></select></div><div><label class="text-sm text-slate-600">数值</label><input id="inputText" class="input-base mt-2" type="number" value="1"/></div></div>',
          init: () => {
            const units = {
              length: ["m", "cm", "mm", "km", "in", "ft"],
              weight: ["kg", "g", "mg", "lb"],
              temp: ["C", "F", "K"],
              area: ["m2", "cm2", "km2", "ft2"],
            };
            const typeSel = qs("#type", root);
            const fromSel = qs("#from", root);
            const toSel = qs("#to", root);
            function fill() {
              const type = typeSel.value;
              const arr = units[type];
              fromSel.innerHTML = arr.map((u) => "<option>" + u + "</option>").join("");
              toSel.innerHTML = arr.map((u) => "<option>" + u + "</option>").join("");
              if (arr[1]) toSel.selectedIndex = 1;
            }
            typeSel.addEventListener("change", fill);
            fill();
          },
          process: (shell) => {
            const type = qs("#type", root).value;
            const from = qs("#from", root).value;
            const to = qs("#to", root).value;
            const val = Number(qs("#inputText", root).value);
            if (!Number.isFinite(val)) throw new Error("请输入有效数字");
            let out = 0;
            if (type === "length") {
              const m = { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048 };
              out = (val * m[from]) / m[to];
            }
            if (type === "weight") {
              const kg = { mg: 0.000001, g: 0.001, kg: 1, lb: 0.45359237 };
              out = (val * kg[from]) / kg[to];
            }
            if (type === "area") {
              const m2 = { cm2: 0.0001, m2: 1, km2: 1e6, ft2: 0.092903 };
              out = (val * m2[from]) / m2[to];
            }
            if (type === "temp") {
              const toC = (v, u) => (u === "C" ? v : u === "F" ? ((v - 32) * 5) / 9 : v - 273.15);
              const fromC = (v, u) => (u === "C" ? v : u === "F" ? (v * 9) / 5 + 32 : v + 273.15);
              out = fromC(toC(val, from), to);
            }
            shell.resultText.value = `${val} ${from} = ${out} ${to}`;
          },
        }),
      "chinese-to-pinyin": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">输入中文文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: async (shell) => {
            await loadLib("pinyin");
            const text = qs("#inputText", root).value;
            if (!text.trim()) throw new Error("请输入文本");
            if (window.pinyin && window.pinyin.convertToPinyin) {
              shell.resultText.value = window.pinyin.convertToPinyin(text, " ", true);
            } else {
              shell.resultText.value = "当前浏览器未加载拼音库，请稍后重试。";
            }
          },
        }),
      "traditional-simplified-converter": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">转换方向</label><select id="mode" class="input-base mt-2"><option value="t2s">繁体 -> 简体</option><option value="s2t">简体 -> 繁体</option></select></div><label class="text-sm text-slate-600">输入文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: async (shell) => {
            await loadLib("opencc");
            const mode = qs("#mode", root).value;
            const text = qs("#inputText", root).value;
            if (!text.trim()) throw new Error("请输入文本");
            if (!window.OpenCC || !window.OpenCC.Converter) throw new Error("转换库加载失败");
            const converter = mode === "t2s"
              ? window.OpenCC.Converter({ from: "t", to: "cn" })
              : window.OpenCC.Converter({ from: "cn", to: "t" });
            shell.resultText.value = converter(text);
          },
        }),
      "random-number-generator": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-4 gap-3"><div><label class="text-sm text-slate-600">最小值</label><input id="min" class="input-base mt-2" type="number" value="1"/></div><div><label class="text-sm text-slate-600">最大值</label><input id="max" class="input-base mt-2" type="number" value="100"/></div><div><label class="text-sm text-slate-600">数量</label><input id="count" class="input-base mt-2" type="number" value="10" min="1" max="500"/></div><div><label class="text-sm text-slate-600">小数位</label><input id="fixed" class="input-base mt-2" type="number" value="0" min="0" max="8"/></div></div>',
          process: (shell) => {
            const min = Number(qs("#min", root).value);
            const max = Number(qs("#max", root).value);
            const count = Math.min(500, Math.max(1, Number(qs("#count", root).value) || 1));
            const fixed = Math.min(8, Math.max(0, Number(qs("#fixed", root).value) || 0));
            if (min > max) throw new Error("最小值不能大于最大值");
            const list = [];
            for (let i = 0; i < count; i += 1) {
              const r = min + Math.random() * (max - min);
              list.push(Number(r.toFixed(fixed)));
            }
            shell.resultText.value = list.join("\n");
          },
        }),
      "strong-password-generator": () =>
        createTextTool(root, {
          inputs:
            '<div class="grid md:grid-cols-2 gap-3"><div><label class="text-sm text-slate-600">密码长度</label><input id="len" class="input-base mt-2" type="number" value="16" min="6" max="64"/></div><div><label class="text-sm text-slate-600">数量</label><input id="count" class="input-base mt-2" type="number" value="5" min="1" max="50"/></div></div><div class="grid md:grid-cols-4 gap-3 text-sm text-slate-600"><label class="inline-flex items-center gap-2"><input id="up" type="checkbox" checked/>大写</label><label class="inline-flex items-center gap-2"><input id="low" type="checkbox" checked/>小写</label><label class="inline-flex items-center gap-2"><input id="num" type="checkbox" checked/>数字</label><label class="inline-flex items-center gap-2"><input id="sym" type="checkbox" checked/>符号</label></div>',
          process: (shell) => {
            const len = Math.max(6, Math.min(64, Number(qs("#len", root).value) || 16));
            const count = Math.max(1, Math.min(50, Number(qs("#count", root).value) || 5));
            const pools = [];
            if (qs("#up", root).checked) pools.push("ABCDEFGHJKLMNPQRSTUVWXYZ");
            if (qs("#low", root).checked) pools.push("abcdefghijkmnopqrstuvwxyz");
            if (qs("#num", root).checked) pools.push("23456789");
            if (qs("#sym", root).checked) pools.push("!@#$%^&*()_+-=[]{}");
            if (!pools.length) throw new Error("请至少选择一种字符类型");
            const all = pools.join("");
            const list = [];
            for (let i = 0; i < count; i += 1) {
              const chars = [];
              pools.forEach((p) => chars.push(p[Math.floor(Math.random() * p.length)]));
              while (chars.length < len) chars.push(all[Math.floor(Math.random() * all.length)]);
              chars.sort(() => Math.random() - 0.5);
              list.push(chars.join(""));
            }
            shell.resultText.value = list.join("\n");
          },
        }),
      "garbage-sorting-query": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">输入物品名称</label><input id="inputText" class="input-base" placeholder="例如：电池、苹果皮、纸箱" />',
          process: (shell) => {
            const q = qs("#inputText", root).value.trim();
            if (!q) throw new Error("请输入物品名称");
            const dict = [
              { k: ["电池", "灯管", "油漆", "药品"], t: "有害垃圾" },
              { k: ["苹果皮", "剩饭", "菜叶", "果核"], t: "厨余垃圾" },
              { k: ["纸箱", "塑料瓶", "金属", "玻璃"], t: "可回收物" },
              { k: ["纸巾", "烟头", "灰土", "陶瓷"], t: "其他垃圾" },
            ];
            const hit = dict.find((d) => d.k.some((w) => q.includes(w)));
            shell.resultText.value = hit
              ? `查询词: ${q}\n建议分类: ${hit.t}\n说明: 结果仅供日常参考，请以当地垃圾分类规范为准。`
              : `查询词: ${q}\n未命中内置词库，建议按当地规则人工判断。`;
          },
        }),
      "horizontal-vertical-text": () =>
        createTextTool(root, {
          inputs:
            '<div><label class="text-sm text-slate-600">模式</label><select id="mode" class="input-base mt-2"><option value="v">横排转竖排</option><option value="h">竖排转横排</option></select></div><label class="text-sm text-slate-600">输入文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: (shell) => {
            const mode = qs("#mode", root).value;
            const text = qs("#inputText", root).value;
            if (mode === "v") {
              shell.resultText.value = text.split("").join("\n");
            } else {
              shell.resultText.value = text.replace(/\r?\n/g, "");
            }
          },
        }),
      "duplicate-text-remover": () =>
        createTextTool(root, {
          inputs:
            '<label class="text-sm text-slate-600">按行输入文本</label><textarea id="inputText" class="textarea-base"></textarea>',
          process: (shell) => {
            const lines = qs("#inputText", root).value.split(/\r?\n/);
            const uniq = [...new Set(lines.filter((l) => l !== ""))];
            shell.resultText.value =
              uniq.join("\n") +
              "\n\n---\n原行数: " +
              lines.length +
              "\n去重后: " +
              uniq.length;
          },
        }),
    };

    const fn = handlers[slug];
    if (!fn) {
      root.innerHTML =
        '<div class="card p-4 text-slate-600">该工具正在维护中，请返回首页选择其他工具。</div>';
      return;
    }
    await fn();
  }

export async function mountTool(slug, root) {
  if (!root) throw new Error('缺少工具挂载容器');
  await renderTool(slug, root);
}
