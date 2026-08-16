import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'

let validateOpportunityDataset
try {
  ;({ validateOpportunityDataset } = await import('../src/opportunities.mjs'))
} catch {
  // RED phase: the implementation does not exist yet.
}

const validPattern = {
  id: 'ai-content-operations-service',
  title: 'AI 内容运营服务',
  track: 'content-operations',
  summary: '把选题、资料整理和内容复盘交付给真实业务用户。',
  target_users: ['缺少稳定内容产出的本地商家'],
  work_node: '商家需要规划下一周内容，但没有专职运营时',
  problem: '临时追热点导致内容不连续，也无法复盘哪些主题有效。',
  deliverable: '一周选题表、三条内容草稿和一张复盘表',
  entry_requirements: ['能访谈一位真实商家', '能使用至少一种通用 AI 工具'],
  first_customer_paths: ['已有客户或朋友经营的真实门店'],
  validation: {
    duration_days: 7,
    actions: ['访谈 5 位目标用户', '为 1 位用户完成最小交付'],
    evidence_required: ['5 份最近一次内容生产记录', '1 份真实使用反馈'],
    output: '机会验证记录和一份可展示的匿名交付样例',
    continue_if: ['至少 3 位用户确认同一问题反复发生'],
    stop_if: ['无法找到 5 位目标用户或问题并不重复发生'],
  },
  candidate_filter: {
    categories: ['ai-content', 'creator-tools'],
    keywords: ['内容', '选题', '营销'],
  },
  risk_flags: ['unsupported-income-claim', 'platform-policy'],
  promise_boundary: 'no_income_guarantee',
  status: 'hypothesis',
}

test('accepts an actionable opportunity dataset without mixing it into project candidates', () => {
  assert.equal(typeof validateOpportunityDataset, 'function', 'opportunity validator should exist')

  const result = validateOpportunityDataset({
    schema_version: '1.0.0',
    generated_at: '2026-08-16T00:00:00.000Z',
    patterns: [validPattern],
  })

  assert.deepEqual(result, {
    ok: true,
    pattern_count: 1,
    tracks: ['content-operations'],
    errors: [],
  })
})

test('rejects duplicate opportunity ids', () => {
  const result = validateOpportunityDataset({
    schema_version: '1.0.0',
    generated_at: '2026-08-16T00:00:00.000Z',
    patterns: [validPattern, { ...validPattern }],
  })

  assert.equal(result.ok, false)
  assert.deepEqual(result.errors, ['patterns[1].id must be unique'])
})

test('rejects an opportunity that cannot produce and validate a real deliverable', () => {
  const result = validateOpportunityDataset({
    schema_version: '1.0.0',
    generated_at: '2026-08-16T00:00:00.000Z',
    patterns: [
      {
        ...validPattern,
        deliverable: '',
        validation: {
          ...validPattern.validation,
          actions: [],
          evidence_required: [],
        },
        candidate_filter: { categories: [], keywords: [] },
        promise_boundary: 'guaranteed_income',
      },
    ],
  })

  assert.equal(result.ok, false)
  assert.deepEqual(result.errors, [
    'patterns[0].deliverable is required',
    'patterns[0].validation.actions must not be empty',
    'patterns[0].validation.evidence_required must not be empty',
    'patterns[0].candidate_filter.categories must not be empty',
    'patterns[0].candidate_filter.keywords must not be empty',
    'patterns[0].promise_boundary must be no_income_guarantee',
  ])
})

test('rejects a dataset without a supported version, timestamp or patterns', () => {
  const result = validateOpportunityDataset({
    schema_version: '2.0.0',
    generated_at: '',
    patterns: [],
  })

  assert.equal(result.ok, false)
  assert.deepEqual(result.errors, [
    'schema_version must be 1.0.0',
    'generated_at is required',
    'patterns must not be empty',
  ])
})

test('rejects an incomplete opportunity contract', () => {
  const result = validateOpportunityDataset({
    schema_version: '1.0.0',
    generated_at: '2026-08-16T00:00:00.000Z',
    patterns: [
      {
        id: '',
        title: '',
        track: '',
        summary: '',
        target_users: [],
        work_node: '',
        problem: '',
        deliverable: '一个输出',
        entry_requirements: [],
        first_customer_paths: [],
        validation: {
          duration_days: 0,
          actions: ['执行'],
          evidence_required: ['证据'],
          output: '',
          continue_if: [],
          stop_if: [],
        },
        candidate_filter: { categories: ['other'], keywords: [] },
        risk_flags: [],
        promise_boundary: 'no_income_guarantee',
        status: 'idea',
      },
    ],
  })

  assert.equal(result.ok, false)
  assert.deepEqual(result.errors, [
    'patterns[0].id is required',
    'patterns[0].title is required',
    'patterns[0].track is required',
    'patterns[0].summary is required',
    'patterns[0].target_users must not be empty',
    'patterns[0].work_node is required',
    'patterns[0].problem is required',
    'patterns[0].entry_requirements must not be empty',
    'patterns[0].first_customer_paths must not be empty',
    'patterns[0].validation.duration_days must be between 1 and 14',
    'patterns[0].validation.output is required',
    'patterns[0].validation.continue_if must not be empty',
    'patterns[0].validation.stop_if must not be empty',
    'patterns[0].candidate_filter.keywords must not be empty',
    'patterns[0].status must be hypothesis, pilot, validated or retired',
  ])
})

test('ships seven independently actionable AI opportunity patterns from the benchmark transformation', async () => {
  let dataset = null
  try {
    dataset = JSON.parse(
      await fs.readFile(new URL('../data/opportunity-patterns.json', import.meta.url), 'utf8'),
    )
  } catch {
    // RED phase: the public dataset does not exist yet.
  }

  assert.ok(dataset, 'public opportunity pattern dataset should exist')
  assert.equal(dataset.inspiration_refs[0].url, 'https://github.com/bleedline/aimoneyhunter')

  const result = validateOpportunityDataset(dataset)
  assert.equal(result.ok, true, result.errors.join('\n'))
  assert.equal(result.pattern_count, 7)
  assert.deepEqual(result.tracks, [
    'ai-automation-service',
    'ai-content-operations',
    'ai-copy-service',
    'ai-image-service',
    'ai-product-builder',
    'ai-sound-service',
    'ai-video-service',
  ])
})
