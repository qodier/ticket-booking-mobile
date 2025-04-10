const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:8081/api';
const TEST_USER = {
  email: `test-user-${Date.now()}@example.com`,
  password: 'password123'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers,
      data
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

// Test functions
async function testRegister() {
  log('\n🔍 Testing user registration...', colors.blue);
  const result = await makeRequest('POST', '/auth/register', TEST_USER);
  
  if (result.success) {
    log('✅ Registration successful!', colors.green);
    log(`User: ${TEST_USER.email}`, colors.green);
    return result.data;
  } else {
    log('❌ Registration failed:', colors.red);
    log(JSON.stringify(result.error, null, 2), colors.red);
    return null;
  }
}

async function testLogin() {
  log('\n🔍 Testing user login...', colors.blue);
  const result = await makeRequest('POST', '/auth/login', TEST_USER);
  
  if (result.success) {
    log('✅ Login successful!', colors.green);
    return result.data;
  } else {
    log('❌ Login failed:', colors.red);
    log(JSON.stringify(result.error, null, 2), colors.red);
    return null;
  }
}

async function testGetEvents(token) {
  log('\n🔍 Testing get events (authenticated)...', colors.blue);
  const result = await makeRequest('GET', '/event', null, token);
  
  if (result.success) {
    log('✅ Get events successful!', colors.green);
    log(`Number of events: ${result.data.data.length}`, colors.green);
    return result.data;
  } else {
    log('❌ Get events failed:', colors.red);
    log(JSON.stringify(result.error, null, 2), colors.red);
    return null;
  }
}

// Main test function
async function runTests() {
  log('🚀 Starting backend connection tests...', colors.yellow);
  log(`API URL: ${API_URL}`, colors.yellow);
  
  try {
    // Test registration
    const registerResult = await testRegister();
    let token = registerResult?.data?.token;
    
    // If registration fails, try login (user might already exist)
    if (!token) {
      const loginResult = await testLogin();
      token = loginResult?.data?.token;
    }
    
    // Test getting events (requires authentication)
    if (token) {
      await testGetEvents(token);
    } else {
      log('\n❌ Cannot test authenticated endpoints without a token', colors.red);
    }
    
    log('\n🏁 Tests completed!', colors.yellow);
  } catch (error) {
    log('\n💥 An unexpected error occurred:', colors.red);
    log(error.message, colors.red);
  }
}

// Run the tests
runTests();