require('dotenv').config({ path: '.env' })
const { query } = require('../lib/fabric-rest')

async function main() {
  try {
    const fn = process.argv[2] || 'ping'
    const args = process.argv.slice(3)
    console.log('🧪 REST query:', fn, args)
    const res = await query(fn, args)
    console.log('✅ Result:', JSON.stringify(res, null, 2))
  } catch (e) {
    console.error('❌ REST test failed:', e.message)
    process.exit(1)
  }
}

main()
