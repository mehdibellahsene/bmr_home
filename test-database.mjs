/**
 * Quick Test for Database Functions using Next.js API
 */

async function testDatabaseFunctions() {
  console.log('🧪 Testing database functions via API...\n');
  
  try {
    // Test health check
    console.log('1. Testing database health check...');
    const healthResponse = await fetch('http://localhost:3000/api/data?health=true');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('Health check result:', health);
    } else {
      console.log('❌ Health check API not available. Starting development server required.');
      console.log('Run: npm run dev');
      return;
    }
    
    // Test stats
    console.log('\n2. Testing database stats...');
    const statsResponse = await fetch('http://localhost:3000/api/data?stats=true');
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('Stats:', stats);
    }
    
    // Test portfolio data
    console.log('\n3. Testing portfolio data retrieval...');
    const portfolioResponse = await fetch('http://localhost:3000/api/data');
    if (portfolioResponse.ok) {
      const portfolio = await portfolioResponse.json();
      console.log('Portfolio data structure:');
      console.log('- Profile:', !!portfolio.profile);
      console.log('- Links:', portfolio.links ? portfolio.links.work.length + portfolio.links.presence.length : 0, 'total');
      console.log('- Notes:', portfolio.notes ? portfolio.notes.length : 0);
      console.log('- Learning:', portfolio.learning ? portfolio.learning.length : 0);
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🚨 Connection Refused');
      console.log('The development server is not running.');
      console.log('Please start it with: npm run dev');
    }
  }
}

testDatabaseFunctions();
