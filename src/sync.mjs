import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { buildCategoryCounts, buildDiff, dedupeCandidates, parseSourceFile } from './radar.mjs'

const SOURCE_REPO = process.env.SOURCE_REPO || '1c7/chinese-independent-developer'
const SOURCE_BRANCH = process.env.SOURCE_BRANCH || 'master'
const SOURCE_FILES = (process.env.SOURCE_FILES || 'README.md,pages/README-Programmer-Edition.md,pages/README-Game.md')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
const CHECK_ONLY = process.argv.includes('--check')
const FORCE = process.argv.includes('--force')
const ROOT = path.resolve(import.meta.dirname, '..')

async function fetchJson(url) {
  const token = process.env.GITHUB_TOKEN?.trim()
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ruhang365-indie-developer-radar',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${url}`)
  return response.json()
}

async function fetchText(file) {
  const url = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_BRANCH}/${file}`
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ruhang365-indie-developer-radar' },
  })
  if (!response.ok) throw new Error(`Source fetch ${response.status}: ${url}`)
  return response.text()
}

async function readPreviousCandidates() {
  try {
    const body = await fs.readFile(path.join(ROOT, 'data/candidates.json'), 'utf8')
    return JSON.parse(body).candidates || []
  } catch {
    return []
  }
}

async function readPreviousState() {
  try {
    return JSON.parse(await fs.readFile(path.join(ROOT, 'data/source-state.json'), 'utf8'))
  } catch {
    return null
  }
}

function toJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`
}

async function main() {
  const commit = await fetchJson(`https://api.github.com/repos/${SOURCE_REPO}/commits/${SOURCE_BRANCH}`)
  const previousState = await readPreviousState()
  if (!CHECK_ONLY && !FORCE && previousState?.source_sha === commit.sha) {
    console.log(JSON.stringify({
      ok: true,
      changed: false,
      source_sha: commit.sha,
      reason: 'source_sha_unchanged',
    }))
    return
  }
  const previous = await readPreviousCandidates()
  const parsed = []

  for (const file of SOURCE_FILES) {
    parsed.push(...parseSourceFile(await fetchText(file), file))
  }

  const candidates = dedupeCandidates(parsed).map((candidate) => ({
    ...candidate,
    source_repo: SOURCE_REPO,
    source_url: `https://github.com/${SOURCE_REPO}/blob/${SOURCE_BRANCH}/${candidate.source_file}#L${candidate.source_line}`,
    source_sha: commit.sha,
    source_license_status: 'unknown',
  }))
  const diff = buildDiff(previous, candidates)
  const generatedAt = new Date().toISOString()
  const report = {
    schema_version: '1.0.0',
    generated_at: generatedAt,
    source_repo: SOURCE_REPO,
    source_branch: SOURCE_BRANCH,
    source_sha: commit.sha,
    candidate_count: candidates.length,
    categories: buildCategoryCounts(candidates),
    added_count: diff.added.length,
    removed_count: diff.removed.length,
    status_changed_count: diff.status_changed.length,
    diff,
  }
  const state = {
    schema_version: '1.0.0',
    generated_at: generatedAt,
    source_repo: SOURCE_REPO,
    source_branch: SOURCE_BRANCH,
    source_sha: commit.sha,
    source_files: SOURCE_FILES,
    source_license_status: 'unknown',
    redistribution_mode: 'facts_and_original_derived_metadata_only',
  }
  const dataset = {
    schema_version: '1.0.0',
    generated_at: generatedAt,
    attribution: {
      source_repo: SOURCE_REPO,
      source_url: `https://github.com/${SOURCE_REPO}`,
      source_sha: commit.sha,
      source_license_status: 'unknown',
      note: '不包含上游项目介绍原文；分类、标签和风险提示由入行365规则生成。',
    },
    candidates,
  }

  if (CHECK_ONLY) {
    console.log(JSON.stringify({
      ok: true,
      source_sha: commit.sha,
      candidate_count: candidates.length,
      categories: report.categories,
      added_count: diff.added.length,
      removed_count: diff.removed.length,
    }))
    return
  }

  await fs.mkdir(path.join(ROOT, 'data'), { recursive: true })
  await fs.mkdir(path.join(ROOT, 'reports'), { recursive: true })
  await Promise.all([
    fs.writeFile(path.join(ROOT, 'data/candidates.json'), toJson(dataset)),
    fs.writeFile(path.join(ROOT, 'data/source-state.json'), toJson(state)),
    fs.writeFile(path.join(ROOT, 'reports/latest.json'), toJson(report)),
  ])
  console.log(JSON.stringify({
    ok: true,
    source_sha: commit.sha,
    candidate_count: candidates.length,
    added_count: diff.added.length,
    removed_count: diff.removed.length,
  }))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
