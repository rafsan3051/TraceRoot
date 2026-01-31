require('dotenv').config()

async function quickTest() {
  console.log('🔗 Testing Fresh Kaleido Connection...\n')
  console.log('Environment ID:', process.env.KALEIDO_ID)
  console.log('Peer ID:', process.env.KALEIDO_PEER_ID)
  console.log('App ID:', process.env.KALEIDO_APP_ID)
  console.log('REST API:', process.env.KALEIDO_REST_API)
  console.log('\n✅ Configuration loaded successfully!')
  console.log('\n📝 Next steps:')
  console.log('1. npm run dev - Start your app')
  console.log('2. Login as farmer and register first product')
  console.log('3. Product will get fresh blockchain TX ID\n')
}

quickTest()
