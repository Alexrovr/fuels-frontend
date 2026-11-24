import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

if (!existsSync('dist/sw.js')) throw new Error('Run npm run build:pages first')
const directory = mkdtempSync(join(tmpdir(), 'heatcalc-pages-'))
cpSync('dist', directory, { recursive: true })
writeFileSync(join(directory, '.nojekyll'), '')
const git = (...args) => execFileSync('git', args, { cwd: directory, stdio: 'inherit' })
const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim()
git('init', '--initial-branch=gh-pages')
git('add', '.')
git('commit', '-m', 'Deploy lab 7 mock PWA')
// No force push: preserve existing deployments and refuse concurrent changes.
try {
  git('fetch', remote, 'gh-pages')
  const parent = execFileSync('git', ['rev-parse', 'FETCH_HEAD'], { cwd: directory, encoding: 'utf8' }).trim()
  const tree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: directory, encoding: 'utf8' }).trim()
  const commit = execFileSync('git', ['commit-tree', tree, '-p', parent, '-m', 'Deploy lab 7 mock PWA'], { cwd: directory, encoding: 'utf8' }).trim()
  git('update-ref', 'refs/heads/gh-pages', commit)
} catch (error) {
  // Only an absent branch permits an initial deployment. Network/auth failures must stop.
  const refs = execFileSync('git', ['ls-remote', remote, 'refs/heads/gh-pages'], { encoding: 'utf8' })
  if (refs.trim()) throw error
}
git('push', remote, 'HEAD:refs/heads/gh-pages')
console.log('Published gh-pages. Pages source must be gh-pages / (root).')
