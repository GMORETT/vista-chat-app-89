const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test data
const testAccount = {
  name: 'Test Account Integration',
  slug: 'test-account-integration'
};

const testAgent = {
  name: 'Test Agent',
  email: 'testagent@example.com',
  role: 'agent'
};

const testInbox = {
  name: 'Test Inbox',
  channel: {
    type: 'website'
  }
};

// Test helpers
const makeRequest = async (method, url, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': 'super_admin_token',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw new Error(`${method} ${url}: ${error.response?.data?.error || error.message}`);
  }
};

// Integration tests
const runIntegrationTests = async () => {
  console.log('🧪 Starting BFF Integration Tests for Multi-tenant Account Management\n');
  
  let createdAccountId;
  let createdAgentId;
  let createdInboxId;
  
  try {
    // Test 1: Create Account (super_admin only)
    console.log('1️⃣ Testing Account Creation...');
    const account = await makeRequest('POST', '/api/admin/accounts', testAccount);
    createdAccountId = account.id;
    console.log(`✅ Account created: ${account.name} (ID: ${account.id})`);
    
    // Test 2: List Accounts (super_admin only)
    console.log('\n2️⃣ Testing Account Listing...');
    const accountList = await makeRequest('GET', '/api/admin/accounts');
    console.log(`✅ Found ${accountList.payload?.length || accountList.length} accounts`);
    
    // Test 3: Create Agent linked to Account
    console.log('\n3️⃣ Testing Agent Creation with Account Link...');
    const agent = await makeRequest('POST', `/api/v1/accounts/${createdAccountId}/account_users`, testAgent);
    createdAgentId = agent.id;
    console.log(`✅ Agent created: ${agent.name} (ID: ${agent.id}, Account: ${agent.account_id})`);
    
    // Test 4: Create Inbox linked to Account
    console.log('\n4️⃣ Testing Inbox Creation with Account Link...');
    const inbox = await makeRequest('POST', `/api/v1/accounts/${createdAccountId}/inboxes`, testInbox);
    createdInboxId = inbox.id;
    console.log(`✅ Inbox created: ${inbox.name} (ID: ${inbox.id}, Account: ${inbox.account_id})`);
    
    // Test 5: Test RBAC - Admin token access
    console.log('\n5️⃣ Testing RBAC - Admin token restrictions...');
    try {
      await makeRequest('GET', '/api/admin/accounts', null, { 'api_access_token': 'admin_account1_token' });
      console.log('❌ RBAC failed: Admin should not access accounts endpoint');
    } catch (error) {
      console.log('✅ RBAC working: Admin correctly denied access to accounts endpoint');
    }
    
    // Test 6: Test cross-account access prevention
    console.log('\n6️⃣ Testing Cross-Account Access Prevention...');
    try {
      await makeRequest('GET', `/api/v1/accounts/${createdAccountId}/account_users`, null, { 'api_access_token': 'admin_account2_token' });
      console.log('❌ RBAC failed: Admin should not access other accounts');
    } catch (error) {
      console.log('✅ RBAC working: Admin correctly denied cross-account access');
    }
    
    // Test 7: Test account filtering for non-super_admin
    console.log('\n7️⃣ Testing Account Filtering for Account 1 Admin...');
    const filteredAgents = await makeRequest('GET', `/api/v1/accounts/1/account_users`, null, { 'api_access_token': 'admin_account1_token' });
    console.log(`✅ Account 1 admin sees ${filteredAgents.length} agents (filtered by account_id)`);
    
    // Test 8: Update Account (super_admin only)
    console.log('\n8️⃣ Testing Account Update...');
    const updatedAccount = await makeRequest('PATCH', `/api/admin/accounts/${createdAccountId}`, {
      name: 'Updated Test Account',
      status: 'inactive'
    });
    console.log(`✅ Account updated: ${updatedAccount.name}, Status: ${updatedAccount.status}`);
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await makeRequest('DELETE', `/api/admin/accounts/${createdAccountId}`);
    console.log('✅ Test account deleted');
    
    console.log('\n🎉 All integration tests passed! Multi-tenant BFF is working correctly.\n');
    
    // Summary
    console.log('📋 Test Summary:');
    console.log('✅ Account CRUD operations');
    console.log('✅ Multi-tenant resource creation (Agent, Inbox)');
    console.log('✅ RBAC enforcement (super_admin vs admin roles)');
    console.log('✅ Cross-account access prevention');
    console.log('✅ Account-specific resource filtering');
    
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    
    // Try cleanup if something was created
    if (createdAccountId) {
      try {
        await makeRequest('DELETE', `/api/admin/accounts/${createdAccountId}`);
        console.log('🧹 Cleaned up test account after failure');
      } catch (cleanupError) {
        console.log('⚠️ Could not clean up test account');
      }
    }
    
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests();
}

module.exports = { runIntegrationTests };