import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import test from 'node:test'

let validateOpportunityDataset
let validateOpportunityCaseDataset
try {
  ;({ validateOpportunityDataset, validateOpportunityCaseDataset } = await import(
    '../src/opportunities.mjs'
  ))
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

const validCase = {
  id: 'local-business-content-week',
  title: '为本地商家交付一周内容包',
  opportunity_pattern_id: 'ai-content-operations-service',
  summary: '使用真实业务资料完成一周选题、内容草稿和复盘模板。',
  target_user: '没有专职内容运营的本地商家',
  work_node: '商家准备下一周内容，但资料分散且无法稳定更新时',
  problem: '临时追热点导致内容与真实业务脱节，也无法复用素材。',
  starting_materials: ['产品与服务资料', '过去一个月发布记录'],
  workflow_steps: ['访谈业务负责人', '整理事实与素材', '生成并人工审核草稿'],
  deliverable: '一周选题表、三条内容草稿和一张复盘表',
  acceptance_criteria: ['所有业务事实经负责人确认', '至少一条草稿进入真实发布审核'],
  first_customer_path: '从已有客户、朋友或社群里的真实经营者开始',
  validation: {
    duration_days: 7,
    actions: ['访谈 5 位目标用户', '为 1 位用户完成最小交付'],
    evidence_required: ['5 份最近一次内容生产记录', '1 份真实使用反馈'],
    output: '一份匿名案例卡和一套可展示交付物',
    continue_if: ['至少 3 位用户确认问题反复发生'],
    stop_if: ['用户不愿提供真实资料或反馈'],
  },
  source_refs: [
    {
      type: 'benchmark_lead',
      title: 'AiMoneyHunter 新媒体推文方向',
      url: 'https://github.com/bleedline/aimoneyhunter',
      captured_at: '2026-08-16',
      transformation: '保留内容服务场景，重新设计用户、交付、验收和七天验证。',
    },
  ],
  risk_flags: ['confidential-input', 'unsupported-income-claim'],
  promise_boundary: 'no_outcome_guarantee',
  status: 'hypothesis',
  evidence_status: 'source_lead_only',
  last_verified_at: null,
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

test('accepts an actionable case dataset linked to a known opportunity pattern', () => {
  assert.equal(typeof validateOpportunityCaseDataset, 'function', 'case validator should exist')

  const result = validateOpportunityCaseDataset(
    {
      schema_version: '1.0.0',
      generated_at: '2026-08-16T00:00:00.000Z',
      cases: [validCase],
    },
    { opportunityPatternIds: [validPattern.id] }
  )

  assert.deepEqual(result, {
    ok: true,
    case_count: 1,
    opportunity_pattern_ids: ['ai-content-operations-service'],
    status_counts: { hypothesis: 1 },
    errors: [],
  })
})

test('rejects incomplete, orphaned or falsely validated cases', () => {
  const result = validateOpportunityCaseDataset(
    {
      schema_version: '1.0.0',
      generated_at: '2026-08-16T00:00:00.000Z',
      cases: [
        {
          ...validCase,
          opportunity_pattern_id: 'missing-pattern',
          workflow_steps: [],
          acceptance_criteria: [],
          source_refs: [],
          status: 'validated',
          evidence_status: 'source_lead_only',
          last_verified_at: null,
        },
      ],
    },
    { opportunityPatternIds: [validPattern.id] }
  )

  assert.equal(result.ok, false)
  assert.deepEqual(result.errors, [
    'cases[0].opportunity_pattern_id must reference a known opportunity pattern',
    'cases[0].workflow_steps must not be empty',
    'cases[0].acceptance_criteria must not be empty',
    'cases[0].source_refs must not be empty',
    'cases[0].validated cases require validated_evidence',
    'cases[0].validated cases require last_verified_at',
  ])
})

test('ships twelve original case hypotheses across all seven opportunity patterns', async () => {
  let caseDataset = null
  let patternDataset = null
  try {
    ;[caseDataset, patternDataset] = await Promise.all([
      fs
        .readFile(new URL('../data/opportunity-cases.json', import.meta.url), 'utf8')
        .then(JSON.parse),
      fs
        .readFile(new URL('../data/opportunity-patterns.json', import.meta.url), 'utf8')
        .then(JSON.parse),
    ])
  } catch {
    // RED phase: the public case dataset does not exist yet.
  }

  assert.ok(caseDataset, 'public opportunity case dataset should exist')
  const result = validateOpportunityCaseDataset(caseDataset, {
    opportunityPatternIds: patternDataset.patterns.map((pattern) => pattern.id),
  })

  assert.equal(result.ok, true, result.errors.join('\n'))
  assert.equal(result.case_count, 12)
  assert.equal(result.opportunity_pattern_ids.length, 7)
  assert.deepEqual(result.status_counts, { hypothesis: 12 })
})
