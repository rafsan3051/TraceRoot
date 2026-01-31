require('dotenv').config()

async function testKaleidoConnection() {
  const KALEIDO_REST_API = process.env.KALEIDO_REST_API
  const KALEIDO_AUTH_HEADER = process.env.KALEIDO_AUTH_HEADER
  
  console.log('🔗 Testing Kaleido Connection...\n')
  
  try {
    // Test REST API connection
    const response = await fetch(`${KALEIDO_REST_API}`, {
      method: 'GET',
      headers: {
        'Authorization': KALEIDO_AUTH_HEADER,
        'Content-Type': 'application/json'
      }
    })
    
    console.log(`✅ Kaleido REST API Status: ${response.status}`)
    console.log(`✅ Connection: ${response.ok ? 'SUCCESS' : 'FAILED'}`)
    
    if (response.ok) {
      console.log('\n✨ Your blockchain is ready for fresh transactions!')
      console.log('📝 All new products will get unique blockchain IDs')
      console.log('🔒 Previous blockchain data remains (immutable by design)\n')
    } else {
      console.log('\n⚠️  Connection issue detected')
      console.log('   Check your Kaleido credentials in .env file\n')
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.log('\n💡 If using free tier, ensure your Kaleido environment is active')
    console.log('   Visit: https://console.kaleido.io\n')
  }
}

testKaleidoConnection()
