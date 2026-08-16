export function validateOpportunityDataset(dataset) {
  const patterns = Array.isArray(dataset?.patterns) ? dataset.patterns : []
  const errors = []
  const ids = new Set()
  const allowedStatuses = new Set(['hypothesis', 'pilot', 'validated', 'retired'])

  if (dataset?.schema_version !== '1.0.0') errors.push('schema_version must be 1.0.0')
  if (!dataset?.generated_at?.trim()) errors.push('generated_at is required')
  if (patterns.length === 0) errors.push('patterns must not be empty')

  for (const [index, pattern] of patterns.entries()) {
    const prefix = `patterns[${index}]`
    if (ids.has(pattern.id)) errors.push(`${prefix}.id must be unique`)
    ids.add(pattern.id)

    if (!pattern.id?.trim()) errors.push(`${prefix}.id is required`)
    if (!pattern.title?.trim()) errors.push(`${prefix}.title is required`)
    if (!pattern.track?.trim()) errors.push(`${prefix}.track is required`)
    if (!pattern.summary?.trim()) errors.push(`${prefix}.summary is required`)
    if (!pattern.target_users?.length) errors.push(`${prefix}.target_users must not be empty`)
    if (!pattern.work_node?.trim()) errors.push(`${prefix}.work_node is required`)
    if (!pattern.problem?.trim()) errors.push(`${prefix}.problem is required`)
    if (!pattern.deliverable?.trim()) errors.push(`${prefix}.deliverable is required`)
    if (!pattern.entry_requirements?.length) {
      errors.push(`${prefix}.entry_requirements must not be empty`)
    }
    if (!pattern.first_customer_paths?.length) {
      errors.push(`${prefix}.first_customer_paths must not be empty`)
    }
    if (
      !Number.isInteger(pattern.validation?.duration_days) ||
      pattern.validation.duration_days < 1 ||
      pattern.validation.duration_days > 14
    ) {
      errors.push(`${prefix}.validation.duration_days must be between 1 and 14`)
    }
    if (!pattern.validation?.actions?.length) {
      errors.push(`${prefix}.validation.actions must not be empty`)
    }
    if (!pattern.validation?.evidence_required?.length) {
      errors.push(`${prefix}.validation.evidence_required must not be empty`)
    }
    if (!pattern.validation?.output?.trim()) {
      errors.push(`${prefix}.validation.output is required`)
    }
    if (!pattern.validation?.continue_if?.length) {
      errors.push(`${prefix}.validation.continue_if must not be empty`)
    }
    if (!pattern.validation?.stop_if?.length) {
      errors.push(`${prefix}.validation.stop_if must not be empty`)
    }
    if (!pattern.candidate_filter?.categories?.length) {
      errors.push(`${prefix}.candidate_filter.categories must not be empty`)
    }
    if (!pattern.candidate_filter?.keywords?.length) {
      errors.push(`${prefix}.candidate_filter.keywords must not be empty`)
    }
    if (pattern.promise_boundary !== 'no_income_guarantee') {
      errors.push(`${prefix}.promise_boundary must be no_income_guarantee`)
    }
    if (!allowedStatuses.has(pattern.status)) {
      errors.push(`${prefix}.status must be hypothesis, pilot, validated or retired`)
    }
  }

  return {
    ok: errors.length === 0,
    pattern_count: patterns.length,
    tracks: [...new Set(patterns.map((pattern) => pattern.track))].sort(),
    errors,
  }
}

export function validateOpportunityCaseDataset(
  dataset,
  { opportunityPatternIds = [] } = {},
) {
  const cases = Array.isArray(dataset?.cases) ? dataset.cases : []
  const knownPatternIds = new Set(opportunityPatternIds)
  const allowedStatuses = new Set(['hypothesis', 'pilot', 'validated', 'retired'])
  const allowedEvidenceStatuses = new Set([
    'source_lead_only',
    'pilot_evidence',
    'validated_evidence',
  ])
  const errors = []
  const ids = new Set()
  const patternIds = new Set()
  const statusCounts = {}

  if (dataset?.schema_version !== '1.0.0') errors.push('schema_version must be 1.0.0')
  if (!dataset?.generated_at?.trim()) errors.push('generated_at is required')
  if (cases.length === 0) errors.push('cases must not be empty')

  for (const [index, opportunityCase] of cases.entries()) {
    const prefix = `cases[${index}]`

    if (ids.has(opportunityCase.id)) errors.push(`${prefix}.id must be unique`)
    ids.add(opportunityCase.id)

    if (!opportunityCase.id?.trim()) errors.push(`${prefix}.id is required`)
    if (!opportunityCase.title?.trim()) errors.push(`${prefix}.title is required`)
    if (!opportunityCase.opportunity_pattern_id?.trim()) {
      errors.push(`${prefix}.opportunity_pattern_id is required`)
    } else {
      patternIds.add(opportunityCase.opportunity_pattern_id)
      if (
        knownPatternIds.size > 0 &&
        !knownPatternIds.has(opportunityCase.opportunity_pattern_id)
      ) {
        errors.push(`${prefix}.opportunity_pattern_id must reference a known opportunity pattern`)
      }
    }
    if (!opportunityCase.summary?.trim()) errors.push(`${prefix}.summary is required`)
    if (!opportunityCase.target_user?.trim()) errors.push(`${prefix}.target_user is required`)
    if (!opportunityCase.work_node?.trim()) errors.push(`${prefix}.work_node is required`)
    if (!opportunityCase.problem?.trim()) errors.push(`${prefix}.problem is required`)
    if (!opportunityCase.starting_materials?.length) {
      errors.push(`${prefix}.starting_materials must not be empty`)
    }
    if (!opportunityCase.workflow_steps?.length) {
      errors.push(`${prefix}.workflow_steps must not be empty`)
    }
    if (!opportunityCase.deliverable?.trim()) errors.push(`${prefix}.deliverable is required`)
    if (!opportunityCase.acceptance_criteria?.length) {
      errors.push(`${prefix}.acceptance_criteria must not be empty`)
    }
    if (!opportunityCase.first_customer_path?.trim()) {
      errors.push(`${prefix}.first_customer_path is required`)
    }
    if (
      !Number.isInteger(opportunityCase.validation?.duration_days) ||
      opportunityCase.validation.duration_days < 1 ||
      opportunityCase.validation.duration_days > 14
    ) {
      errors.push(`${prefix}.validation.duration_days must be between 1 and 14`)
    }
    if (!opportunityCase.validation?.actions?.length) {
      errors.push(`${prefix}.validation.actions must not be empty`)
    }
    if (!opportunityCase.validation?.evidence_required?.length) {
      errors.push(`${prefix}.validation.evidence_required must not be empty`)
    }
    if (!opportunityCase.validation?.output?.trim()) {
      errors.push(`${prefix}.validation.output is required`)
    }
    if (!opportunityCase.validation?.continue_if?.length) {
      errors.push(`${prefix}.validation.continue_if must not be empty`)
    }
    if (!opportunityCase.validation?.stop_if?.length) {
      errors.push(`${prefix}.validation.stop_if must not be empty`)
    }
    if (!opportunityCase.source_refs?.length) {
      errors.push(`${prefix}.source_refs must not be empty`)
    }
    if (opportunityCase.promise_boundary !== 'no_outcome_guarantee') {
      errors.push(`${prefix}.promise_boundary must be no_outcome_guarantee`)
    }
    if (!allowedStatuses.has(opportunityCase.status)) {
      errors.push(`${prefix}.status must be hypothesis, pilot, validated or retired`)
    } else {
      statusCounts[opportunityCase.status] = (statusCounts[opportunityCase.status] || 0) + 1
    }
    if (!allowedEvidenceStatuses.has(opportunityCase.evidence_status)) {
      errors.push(
        `${prefix}.evidence_status must be source_lead_only, pilot_evidence or validated_evidence`,
      )
    }
    if (
      opportunityCase.status === 'validated' &&
      opportunityCase.evidence_status !== 'validated_evidence'
    ) {
      errors.push(`${prefix}.validated cases require validated_evidence`)
    }
    if (opportunityCase.status === 'validated' && !opportunityCase.last_verified_at?.trim()) {
      errors.push(`${prefix}.validated cases require last_verified_at`)
    }
  }

  return {
    ok: errors.length === 0,
    case_count: cases.length,
    opportunity_pattern_ids: [...patternIds].sort(),
    status_counts: statusCounts,
    errors,
  }
}
