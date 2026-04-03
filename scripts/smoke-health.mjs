const baseUrl = process.env.SMOKE_BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? process.argv[2]

if (!baseUrl) {
  console.error('SMOKE_BASE_URL or PLAYWRIGHT_BASE_URL is required')
  process.exit(1)
}

const healthUrl = new URL('/api/health', baseUrl).toString()
const response = await fetch(healthUrl)
const body = await response.text()

if (!response.ok) {
  console.error(`Health smoke failed: ${healthUrl} -> ${response.status}`)
  console.error(body)
  process.exit(1)
}

console.log(`Health smoke OK: ${healthUrl} -> ${response.status}`)
console.log(body)
