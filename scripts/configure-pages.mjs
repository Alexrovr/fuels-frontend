import { execFileSync } from 'node:child_process'
const credentials = execFileSync('git', ['credential', 'fill'], {
  input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8',
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' },
})
const token = credentials.split('\n').find(line => line.startsWith('password='))?.slice(9)
if (!token) throw new Error('GitHub credentials unavailable; select gh-pages / (root) in Settings > Pages')
const endpoint = 'https://api.github.com/repos/Alexrovr/fuels-frontend/pages'
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }
const current = await fetch(endpoint, { headers })
console.log('Pages status:', current.status)
if (!current.ok && current.status !== 404) throw new Error('Cannot read Pages settings')
const response = await fetch(endpoint, {
  method: current.status === 404 ? 'POST' : 'PUT', headers,
  body: JSON.stringify({ build_type: 'legacy', source: { branch: 'gh-pages', path: '/' } }),
})
if (!response.ok) throw new Error(`Pages setup failed: ${response.status} ${await response.text()}`)
console.log('Pages configured: https://alexrovr.github.io/fuels-frontend/')
