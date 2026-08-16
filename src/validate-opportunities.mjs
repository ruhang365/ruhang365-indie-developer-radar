import fs from 'node:fs/promises'
import path from 'node:path'

import { validateOpportunityCaseDataset, validateOpportunityDataset } from './opportunities.mjs'

const root = path.resolve(import.meta.dirname, '..')
const [patternDataset, caseDataset] = await Promise.all([
  fs.readFile(path.join(root, 'data/opportunity-patterns.json'), 'utf8').then(JSON.parse),
  fs.readFile(path.join(root, 'data/opportunity-cases.json'), 'utf8').then(JSON.parse),
])
const patterns = validateOpportunityDataset(patternDataset)
const cases = validateOpportunityCaseDataset(caseDataset, {
  opportunityPatternIds: patternDataset.patterns.map((pattern) => pattern.id),
})
const result = { ok: patterns.ok && cases.ok, patterns, cases }

console.log(JSON.stringify(result))
if (!result.ok) process.exitCode = 1
