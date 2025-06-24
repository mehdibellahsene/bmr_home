// Test login API
async function testLogin() {
  try {
    console.log('Testing login with credentials: admin / password');
    
    const response = await fetch('http://localhost:3001/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'password'
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();
