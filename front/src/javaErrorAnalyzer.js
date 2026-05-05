export const JAVA_ERROR_MAX_LENGTH = 50000;

export const javaErrorSamples = {
  'Spring Bean 注入失败': `org.springframework.beans.factory.NoSuchBeanDefinitionException: No qualifying bean of type 'com.demo.UserService' available
	at com.demo.OrderController.create(OrderController.java:18)
	at com.demo.OrderService.submit(OrderService.java:42)`,
  '空指针异常': `java.lang.NullPointerException: Cannot invoke "User.getName()" because "user" is null
	at com.demo.UserService.build(UserService.java:23)
	at com.demo.UserController.detail(UserController.java:35)`,
  'MySQL 语法错误': `java.sql.SQLSyntaxErrorException: You have an error in your SQL syntax; check the manual
	at com.mysql.cj.jdbc.ClientPreparedStatement.executeInternal(ClientPreparedStatement.java:953)
	at com.demo.mapper.UserMapper.find(UserMapper.java:28)`,
  '端口被占用': `java.net.BindException: Address already in use: bind
	at java.base/sun.nio.ch.Net.bind0(Native Method)
	at org.springframework.boot.web.embedded.tomcat.TomcatWebServer.start(TomcatWebServer.java:251)`,
  'Redis 连接超时': `org.apache.http.conn.ConnectTimeoutException: connect timed out
	at org.apache.http.impl.conn.DefaultHttpClientConnectionOperator.connect(DefaultHttpClientConnectionOperator.java:151)
	at com.demo.cache.RedisClient.get(RedisClient.java:64)`,
};

const exceptionRules = [
  {
    id: 'npe',
    exceptionType: 'NullPointerException',
    messageKeywords: ['is null', 'null'],
    stackKeywords: ['.java:'],
    summary: '代码中访问了空对象。',
    possibleCauses: ['对象未初始化', '查询结果为空', '返回值为空未判断'],
    checkSteps: ['定位报错行', '检查对象来源', '补充空值日志'],
    fixSuggestions: ['增加 null 判断', '使用 Optional', '提前初始化对象'],
    tags: ['Java', 'NPE'],
  },
  {
    id: 'nosuchbean',
    exceptionType: 'NoSuchBeanDefinitionException',
    messageKeywords: ['No qualifying bean'],
    stackKeywords: ['springframework'],
    summary: 'Spring 容器中没有找到需要注入的 Bean。',
    possibleCauses: ['未加注解', '扫描路径不正确', '按类型注入冲突'],
    checkSteps: ['检查 @Service/@Component', '检查包扫描', '确认 @Qualifier'],
    fixSuggestions: ['补充 Bean 定义', '修正扫描路径', '使用明确限定符'],
    tags: ['Spring', 'DI'],
  },
  {
    id: 'beancreate',
    exceptionType: 'BeanCreationException',
    messageKeywords: ['Error creating bean'],
    stackKeywords: ['createBean'],
    summary: 'Bean 创建阶段失败。',
    possibleCauses: ['依赖初始化异常', '配置缺失'],
    checkSteps: ['查看嵌套异常', '检查构造参数'],
    fixSuggestions: ['先修复根因异常', '补齐配置'],
    tags: ['Spring'],
  },
  {
    id: 'unsatisfied',
    exceptionType: 'UnsatisfiedDependencyException',
    messageKeywords: ['Unsatisfied dependency'],
    stackKeywords: ['Autowired'],
    summary: '依赖注入无法满足。',
    possibleCauses: ['缺失 Bean', '循环依赖'],
    checkSteps: ['检查注入链路', '确认依赖实现'],
    fixSuggestions: ['新增实现', '拆分循环依赖'],
    tags: ['Spring', 'DI'],
  },
  {
    id: 'cnf',
    exceptionType: 'ClassNotFoundException',
    messageKeywords: ['ClassNotFoundException'],
    stackKeywords: ['ClassLoader'],
    summary: '运行时缺少类定义。',
    possibleCauses: ['依赖未引入', '打包遗漏'],
    checkSteps: ['核对依赖', '检查 fat jar'],
    fixSuggestions: ['补充依赖', '调整打包插件'],
    tags: ['Java', 'Classpath'],
  },
  {
    id: 'noclassdef',
    exceptionType: 'NoClassDefFoundError',
    messageKeywords: ['NoClassDefFoundError'],
    stackKeywords: ['ClassLoader'],
    summary: '类在编译期存在但运行期缺失。',
    possibleCauses: ['依赖冲突', '部署包不完整'],
    checkSteps: ['检查依赖树', '检查部署产物'],
    fixSuggestions: ['统一版本', '重新打包部署'],
    tags: ['Java', 'Classpath'],
  },
  {
    id: 'sqlsyntax',
    exceptionType: 'SQLSyntaxErrorException',
    messageKeywords: ['You have an error in your SQL syntax'],
    stackKeywords: ['PreparedStatement'],
    summary: 'SQL 语法错误。',
    possibleCauses: ['关键字冲突', '字段拼写错误'],
    checkSteps: ['打印最终 SQL', '在数据库直接执行'],
    fixSuggestions: ['修正 SQL', '字段名加反引号'],
    tags: ['SQL', 'MySQL'],
  },
  {
    id: 'duplicate',
    exceptionType: 'DuplicateKeyException',
    messageKeywords: ['Duplicate entry'],
    stackKeywords: ['insert'],
    summary: '唯一键冲突。',
    possibleCauses: ['重复写入', '幂等处理缺失'],
    checkSteps: ['核对唯一索引', '排查重试逻辑'],
    fixSuggestions: ['改为 upsert', '增加幂等键'],
    tags: ['DB'],
  },
  {
    id: 'integrity',
    exceptionType: 'DataIntegrityViolationException',
    messageKeywords: ['constraint'],
    stackKeywords: ['hibernate'],
    summary: '数据完整性约束冲突。',
    possibleCauses: ['外键冲突', '非空字段缺失'],
    checkSteps: ['查看约束名', '核对实体映射'],
    fixSuggestions: ['修正数据', '修正映射'],
    tags: ['DB', 'JPA'],
  },
  {
    id: 'lazy',
    exceptionType: 'LazyInitializationException',
    messageKeywords: ['could not initialize proxy'],
    stackKeywords: ['hibernate'],
    summary: '懒加载对象在会话外被访问。',
    possibleCauses: ['事务边界不当'],
    checkSteps: ['检查事务范围', '确认 fetch 策略'],
    fixSuggestions: ['在事务内访问', '改为 DTO 查询'],
    tags: ['JPA', 'Hibernate'],
  },
  {
    id: 'oom',
    exceptionType: 'OutOfMemoryError',
    messageKeywords: ['Java heap space'],
    stackKeywords: ['GC'],
    summary: 'JVM 内存不足。',
    possibleCauses: ['内存泄漏', '堆设置过小'],
    checkSteps: ['查看 GC 日志', '分析堆转储'],
    fixSuggestions: ['优化对象生命周期', '调大 -Xmx'],
    tags: ['JVM'],
  },
  {
    id: 'stackoverflow',
    exceptionType: 'StackOverflowError',
    messageKeywords: ['StackOverflowError'],
    stackKeywords: ['at '],
    summary: '调用栈过深，常见于递归失控。',
    possibleCauses: ['递归无终止条件'],
    checkSteps: ['定位重复栈帧'],
    fixSuggestions: ['补充终止条件', '改循环'],
    tags: ['JVM'],
  },
  {
    id: 'ctimeout',
    exceptionType: 'ConnectTimeoutException',
    messageKeywords: ['connect timed out'],
    stackKeywords: ['http'],
    summary: '连接超时。',
    possibleCauses: ['目标服务不可达', '网络抖动'],
    checkSteps: ['检查网络连通', '检查目标服务状态'],
    fixSuggestions: ['重试+退避', '调整超时参数'],
    tags: ['Network'],
  },
  {
    id: 'stimeout',
    exceptionType: 'SocketTimeoutException',
    messageKeywords: ['Read timed out'],
    stackKeywords: ['socket'],
    summary: '读取超时。',
    possibleCauses: ['下游响应慢'],
    checkSteps: ['核对慢请求', '看服务负载'],
    fixSuggestions: ['优化下游', '设置合理超时'],
    tags: ['Network'],
  },
  {
    id: 'bind',
    exceptionType: 'BindException',
    messageKeywords: ['Address already in use', 'Port already in use'],
    stackKeywords: ['bind'],
    summary: '端口已被占用。',
    possibleCauses: ['已有进程占用端口'],
    checkSteps: ['查看端口占用进程'],
    fixSuggestions: ['结束占用进程', '更换端口'],
    tags: ['Network', 'Port'],
  },
  {
    id: 'illegalarg',
    exceptionType: 'IllegalArgumentException',
    messageKeywords: ['Illegal argument'],
    stackKeywords: ['java.lang'],
    summary: '方法参数不合法。',
    possibleCauses: ['调用方参数错误'],
    checkSteps: ['核对入参来源'],
    fixSuggestions: ['增加参数校验', '返回明确错误'],
    tags: ['Java'],
  },
  {
    id: 'indexout',
    exceptionType: 'IndexOutOfBoundsException',
    messageKeywords: ['Index'],
    stackKeywords: ['ArrayList'],
    summary: '集合下标越界。',
    possibleCauses: ['边界判断缺失'],
    checkSteps: ['检查索引计算'],
    fixSuggestions: ['增加范围判断'],
    tags: ['Java'],
  },
  {
    id: 'numberformat',
    exceptionType: 'NumberFormatException',
    messageKeywords: ['For input string'],
    stackKeywords: ['parse'],
    summary: '字符串转数字失败。',
    possibleCauses: ['输入非数字'],
    checkSteps: ['打印原始入参'],
    fixSuggestions: ['先做格式校验'],
    tags: ['Java'],
  },
  {
    id: 'filenotfound',
    exceptionType: 'FileNotFoundException',
    messageKeywords: ['No such file'],
    stackKeywords: ['FileInputStream'],
    summary: '文件不存在或路径错误。',
    possibleCauses: ['路径配置错误'],
    checkSteps: ['确认绝对路径', '确认部署目录'],
    fixSuggestions: ['修正路径', '增加文件存在性校验'],
    tags: ['IO'],
  },
  {
    id: 'accessdenied',
    exceptionType: 'AccessDeniedException',
    messageKeywords: ['AccessDenied'],
    stackKeywords: ['security'],
    summary: '权限不足导致访问被拒绝。',
    possibleCauses: ['权限配置缺失'],
    checkSteps: ['核对权限规则'],
    fixSuggestions: ['补充角色权限'],
    tags: ['Security'],
  },
];

const MAIN_EXCEPTION = /([\w.$]*(Exception|Error))(?:\s*:\s*(.*))?/;
const CAUSED_BY = /Caused by:\s*([\w.$]+)(?::\s*(.*))?/;

export function analyzeJavaLog(content) {
  const value = content ?? '';
  if (!value.trim()) {
    return { ok: false, error: '日志内容不能为空' };
  }
  if (value.length > JAVA_ERROR_MAX_LENGTH) {
    return { ok: false, error: '日志长度不能超过 50000 字符' };
  }
  if (value.trim().length < 20) {
    return { ok: false, error: '内容过短，请粘贴完整异常日志' };
  }

  const maskedContent = maskSensitiveData(value);
  const parsed = parseException(maskedContent);
  const scored = matchRule(parsed, maskedContent);

  if (!scored || scored.score < 0.2) {
    return {
      ok: true,
      response: {
        exceptionType: parsed.exceptionType,
        rootMessage: parsed.rootMessage || '未解析到明确根因信息',
        summary: '未命中强规则，建议按调用栈逐层排查。',
        confidence: 0.35,
        possibleCauses: ['异常信息不完整', '规则库未覆盖该场景'],
        checkSteps: ['确认完整堆栈', '重点关注第一个业务代码栈帧'],
        fixSuggestions: ['补充日志上下文', '检查最近变更'],
        keyFrames: parsed.keyFrames,
        tags: ['Java', 'General'],
        masked: maskedContent !== value,
      },
    };
  }

  const rule = scored.rule;
  return {
    ok: true,
    response: {
      exceptionType: parsed.exceptionType,
      rootMessage: parsed.rootMessage || '未解析到明确根因信息',
      summary: rule.summary,
      confidence: scored.score,
      possibleCauses: rule.possibleCauses,
      checkSteps: rule.checkSteps,
      fixSuggestions: rule.fixSuggestions,
      keyFrames: parsed.keyFrames,
      tags: rule.tags,
      masked: maskedContent !== value,
    },
  };
}

export function buildJavaErrorReport(result) {
  if (!result) return '';
  return [
    `异常类型: ${result.exceptionType}`,
    `根因信息: ${result.rootMessage}`,
    `诊断摘要: ${result.summary}`,
    `置信度: ${Math.round(result.confidence * 100)}%`,
    `可能原因: ${result.possibleCauses.join('; ')}`,
    `排查步骤: ${result.checkSteps.join('; ')}`,
    `修复建议: ${result.fixSuggestions.join('; ')}`,
    `关键调用栈: ${result.keyFrames.join(' | ') || '无'}`,
    `标签: ${result.tags.join(', ')}`,
  ].join('\n');
}

function maskSensitiveData(content) {
  return [
    [/(password\s*[=:]\s*)([^\s,;]+)/gi, '$1******'],
    [/(token\s*[=:]\s*)([^\s,;]+)/gi, '$1******'],
    [/(secret\s*[=:]\s*)([^\s,;]+)/gi, '$1******'],
    [/(authorization\s*:\s*)(.+)/gi, '$1******'],
    [/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '******@******'],
    [/(?<!\d)1[3-9]\d{9}(?!\d)/g, '***********'],
    [/(?<!\d)\d{17}[\dXx](?!\d)/g, '******************'],
    [/jdbc:[^\s]+/gi, 'jdbc:******'],
  ].reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), content);
}

function parseException(text) {
  const lines = text.split(/\r?\n/);
  let exceptionType = 'UnknownException';
  let mainMessage = '';
  let rootMessage = '';
  const keyFrames = [];

  for (const line of lines) {
    const match = line.trim().match(MAIN_EXCEPTION);
    if (match) {
      exceptionType = simpleType(match[1]);
      mainMessage = match[3] ?? '';
      break;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    const causedBy = trimmed.match(CAUSED_BY);
    if (causedBy) {
      exceptionType = simpleType(causedBy[1]);
      rootMessage = causedBy[2] ?? '';
    }
    if (trimmed.startsWith('at ') && keyFrames.length < 6) {
      keyFrames.push(trimmed);
    }
  }

  return {
    exceptionType,
    mainMessage,
    rootMessage: rootMessage || mainMessage,
    keyFrames,
  };
}

function matchRule(parsed, fullText) {
  const haystack = fullText.toLowerCase();
  let best = null;

  for (const rule of exceptionRules) {
    let score = 0;
    if (rule.exceptionType.toLowerCase() === parsed.exceptionType.toLowerCase()) {
      score += 0.65;
    }
    for (const keyword of rule.messageKeywords ?? []) {
      if (keyword && haystack.includes(keyword.toLowerCase())) {
        score += 0.08;
      }
    }
    for (const keyword of rule.stackKeywords ?? []) {
      if (keyword && haystack.includes(keyword.toLowerCase())) {
        score += 0.04;
      }
    }
    const capped = Math.min(score, 0.98);
    if (!best || capped > best.score) {
      best = { rule, score: capped };
    }
  }

  return best;
}

function simpleType(type) {
  const index = type.lastIndexOf('.');
  return index >= 0 ? type.slice(index + 1) : type;
}
