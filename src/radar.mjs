import { createHash } from 'node:crypto'

const STATUS_MAP = new Map([
  [':clock8:', 'building'],
  [':white_check_mark:', 'live'],
  [':x:', 'inactive'],
])

const CATEGORY_RULES = [
  ['ai-content', /ai|大模型|llm|图片生成|视频生成|写作|prompt|智能体|agent/i],
  ['developer-tools', /开发|代码|github|api|终端|ssh|数据库|debug|编程|模型检测/i],
  ['productivity', /效率|管理|日历|笔记|剪贴板|文件|pdf|markdown|ocr|转换|工具/i],
  ['creator-tools', /创作|剪辑|字幕|播客|音乐|摄影|视频|图片|设计|海报/i],
  ['commerce', /电商|营销|销售|seo|广告|客户|发票|财务|投资|行情/i],
  ['education', /教育|学习|课程|题库|阅读|考试|科研|论文/i],
  ['lifestyle', /健康|运动|旅行|宠物|天气|饮食|睡眠|生活/i],
  ['games', /游戏|启动器|娱乐|桌游/i],
]

const RISK_RULES = [
  ['sensitive-key-input', /api key|密钥|token/i],
  ['financial-claims', /投资|股票|加密货币|收益|行情/i],
  ['health-context', /医疗|健康|心理|经期|睡眠/i],
  ['adult-content', /nsfw|成人|色情/i],
]

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

function cleanText(value = '') {
  return value.replace(/<br\s*\/?>/gi, ' ').replace(/\s+/g, ' ').trim()
}

export function canonicalizeUrl(value) {
  try {
    const url = new URL(value)
    url.hash = ''
    if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '')
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|ref$|source$|from$)/i.test(key)) url.searchParams.delete(key)
    }
    return url.toString().replace(/\/$/, '')
  } catch {
    return value.trim()
  }
}

export function classifyProject(name, description) {
  const input = `${name} ${description}`
  const category = CATEGORY_RULES.find(([, pattern]) => pattern.test(input))?.[0] || 'other'
  const riskFlags = RISK_RULES.filter(([, pattern]) => pattern.test(input)).map(([flag]) => flag)
  const capabilityTags = CATEGORY_RULES.filter(([, pattern]) => pattern.test(input)).map(([tag]) => tag)
  return {
    category,
    capability_tags: [...new Set(capabilityTags)].slice(0, 4),
    risk_flags: riskFlags,
  }
}

function extractDeveloper(line) {
  const heading = line.replace(/^####\s+/, '').trim()
  const link = heading.match(/\[GitHub\]\((https?:\/\/[^)]+)\)/i)
  const name = cleanText(heading.split(/\s+-\s+\[/)[0])
  return {
    developer_name: name,
    developer_url: link?.[1] ? canonicalizeUrl(link[1]) : null,
  }
}

function extractEntry(line) {
  const match = line.match(/^\*\s+(:clock8:|:white_check_mark:|:x:)\s+\[([^\]]+)\]\((https?:\/\/[^)]+)\)\s*[：:]\s*(.+)$/i)
  if (!match) return null
  return {
    status: STATUS_MAP.get(match[1]) || 'unknown',
    name: cleanText(match[2]),
    url: canonicalizeUrl(match[3]),
    description: cleanText(match[4]),
  }
}

export function parseSourceFile(markdown, sourceFile) {
  const candidates = []
  let sourceDate = null
  let developer = { developer_name: null, developer_url: null }

  for (const [index, line] of markdown.split('\n').entries()) {
    const dateMatch = line.match(/^###\s+(.+?添加)\s*$/)
    if (dateMatch) {
      sourceDate = cleanText(dateMatch[1])
      developer = { developer_name: null, developer_url: null }
      continue
    }

    if (/^####\s+/.test(line)) {
      developer = extractDeveloper(line)
      continue
    }

    const entry = extractEntry(line)
    if (!entry) continue

    const derived = classifyProject(entry.name, entry.description)
    const sourceFingerprint = hash(`${sourceFile}:${index + 1}:${line}`)
    candidates.push({
      id: hash(entry.url).slice(0, 16),
      name: entry.name,
      url: entry.url,
      status: entry.status,
      developer_name: developer.developer_name,
      developer_url: developer.developer_url,
      source_date_label: sourceDate,
      source_file: sourceFile,
      source_line: index + 1,
      source_fingerprint: sourceFingerprint,
      category: derived.category,
      capability_tags: derived.capability_tags,
      risk_flags: derived.risk_flags,
      review_status: 'candidate',
    })
  }

  return candidates
}

export function dedupeCandidates(candidates) {
  const byUrl = new Map()
  for (const candidate of candidates) {
    const existing = byUrl.get(candidate.url)
    if (!existing || candidate.source_line > existing.source_line) {
      byUrl.set(candidate.url, candidate)
    }
  }
  return [...byUrl.values()].sort((a, b) => {
    const fileOrder = a.source_file.localeCompare(b.source_file)
    return fileOrder || a.source_line - b.source_line
  })
}

export function buildCategoryCounts(candidates) {
  return Object.fromEntries(
    [...candidates.reduce((map, candidate) => {
      map.set(candidate.category, (map.get(candidate.category) || 0) + 1)
      return map
    }, new Map()).entries()].sort((a, b) => b[1] - a[1]),
  )
}

export function buildDiff(previous, current) {
  const previousByUrl = new Map(previous.map((item) => [item.url, item]))
  const currentByUrl = new Map(current.map((item) => [item.url, item]))
  return {
    added: current.filter((item) => !previousByUrl.has(item.url)).map((item) => item.url),
    removed: previous.filter((item) => !currentByUrl.has(item.url)).map((item) => item.url),
    status_changed: current
      .filter((item) => previousByUrl.has(item.url) && previousByUrl.get(item.url).status !== item.status)
      .map((item) => ({
        url: item.url,
        before: previousByUrl.get(item.url).status,
        after: item.status,
      })),
  }
}
