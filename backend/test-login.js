const axios = require('axios');

async function testLogin() {
  try {
    console.log('🧪 Testing login functionality...');
    
    // Test with the test user we know exists
    const testEmail = 'testuser1763459249310@example.com';
    const testPassword = 'TestPassword123!';
    
    console.log(`📧 Testing login with email: ${testEmail}`);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: testEmail,
      password: testPassword
    });
    
    console.log('✅ Login response:', response.data);
    
    if (response.data.success) {
      console.log('🎉 Login successful!');
      console.log('🔑 Access token:', response.data.data.accessToken);
      console.log('👤 User:', response.data.data.user);
      
      // Test token verification
      if (response.data.data.accessToken) {
        console.log('🔍 Testing token verification...');
        const verifyResponse = await axios.get('http://localhost:5000/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${response.data.data.accessToken}`
          }
        });
        console.log('✅ Token verification:', verifyResponse.data);
      }
    } else {
      console.log('❌ Login failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data || error.message);
  }
}

// Test with different credentials
async function testLoginWithUsername() {
  try {
    console.log('\n🧪 Testing login with username...');
    
    // Test with admin credentials
    const username = 'admin';
    const password = 'admin123'; // Default admin password
    
    console.log(`👤 Testing login with username: ${username}`);
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: username,
      password: password
    });
    
    console.log('✅ Login response:', response.data);
    
  } catch (error) {
    console.error('❌ Login test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting login tests...\n');
  
  await testLogin();
  await testLoginWithUsername();
  
  console.log('\n✅ Login tests completed!');
}

runTests();