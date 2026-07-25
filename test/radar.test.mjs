import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildCategoryCounts,
  buildDiff,
  canonicalizeUrl,
  dedupeCandidates,
  parseSourceFile,
} from '../src/radar.mjs'

const sample = `
### 2026 年 7 月 24 号添加

#### DemoDev - [GitHub](https://github.com/demo)
* :white_check_mark: [PDF Helper](https://example.com/?utm_source=list)：把 PDF 转成 Markdown 的工具
* :clock8: [AI Studio](https://studio.example.com)：AI 视频创作工作台
`

test('parses facts while excluding upstream descriptions', () => {
  const items = parseSourceFile(sample, 'README.md')
  assert.equal(items.length, 2)
  assert.equal(items[0].name, 'PDF Helper')
  assert.equal(items[0].url, 'https://example.com')
  assert.equal(items[0].status, 'live')
  assert.equal(items[0].developer_name, 'DemoDev')
  assert.equal(items[0].category, 'productivity')
  assert.equal('description' in items[0], false)
})

test('deduplicates by canonical URL and reports changes', () => {
  const items = parseSourceFile(sample, 'README.md')
  const duplicate = { ...items[0], source_line: 99 }
  const current = dedupeCandidates([...items, duplicate])
  assert.equal(current.length, 2)
  assert.equal(current.find((item) => item.url === items[0].url)?.source_line, 99)
  const diff = buildDiff([items[0]], current)
  assert.deepEqual(diff.added, ['https://studio.example.com'])
  assert.deepEqual(diff.removed, [])
})

test('counts original derived categories', () => {
  const counts = buildCategoryCounts(parseSourceFile(sample, 'README.md'))
  assert.equal(counts.productivity, 1)
  assert.equal(counts['ai-content'], 1)
})

test('removes tracking parameters without changing the destination', () => {
  assert.equal(canonicalizeUrl('https://example.com/path/?utm_campaign=test&id=2#top'), 'https://example.com/path?id=2')
})
