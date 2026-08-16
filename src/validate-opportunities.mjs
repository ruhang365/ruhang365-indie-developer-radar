import fs from 'node:fs/promises'
import path from 'node:path'

import { validateOpportunityDataset } from './opportunities.mjs'

const root = path.resolve(import.meta.dirname, '..')
const dataset = JSON.parse(
  await fs.readFile(path.join(root, 'data/opportunity-patterns.json'), 'utf8'),
)
const result = validateOpportunityDataset(dataset)

console.log(JSON.stringify(result))
if (!result.ok) process.exitCode = 1
