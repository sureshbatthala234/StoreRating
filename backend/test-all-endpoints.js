const http = require('http');
const app = require('./src/app');

// We use http.request to test endpoints against a local ephemeral test server
async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  console.log(`\n======================================================`);
  console.log(`Starting API Tests on ${baseUrl}`);
  console.log(`======================================================\n`);

  const results = [];

  async function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const req = http.request(
        url,
        {
          method,
          headers,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            let json = null;
            try {
              json = JSON.parse(data);
            } catch (e) {
              json = data;
            }
            resolve({ status: res.statusCode, body: json });
          });
        }
      );

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(` [PASS] ${name}`);
      results.push({ name, pass: true, details });
    } else {
      console.error(` [FAIL] ${name} - ${details}`);
      results.push({ name, pass: false, details });
    }
  }

  let adminToken = '';
  let userToken = '';
  let ownerToken = '';
  let createdOwnerId = null;
  let createdStoreId = null;

  try {
    // 1. Health check
    const rHealth = await request('GET', '/api/health');
    assert('1. GET /api/health', rHealth.status === 200 && rHealth.body.success, JSON.stringify(rHealth.body));

    // 2. Admin Login
    const rAdminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@admin.com',
      password: 'Admin@1234',
    });
    assert('2. POST /api/auth/login (Admin)', rAdminLogin.status === 200 && rAdminLogin.body.data.user.role === 'admin', JSON.stringify(rAdminLogin.body));
    adminToken = rAdminLogin.body.data.token;

    // 3. User Signup
    const testUserEmail = `testuser_${Date.now()}@example.com`;
    const rSignup = await request('POST', '/api/auth/signup', {
      name: 'Test Regular User Account',
      email: testUserEmail,
      password: 'User@1234',
      address: '123 Testing Way, Test City',
    });
    assert('3. POST /api/auth/signup', rSignup.status === 201 && rSignup.body.success, JSON.stringify(rSignup.body));
    userToken = rSignup.body.data.token;

    // 4. Admin Dashboard
    const rAdminDash = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert('4. GET /api/admin/dashboard', rAdminDash.status === 200 && 'totalUsers' in rAdminDash.body.data, JSON.stringify(rAdminDash.body));

    // 5. Admin Create User (Store Owner)
    const testOwnerEmail = `testowner_${Date.now()}@example.com`;
    const rCreateOwner = await request(
      'POST',
      '/api/admin/users',
      {
        name: 'Super Market Owner Person',
        email: testOwnerEmail,
        password: 'Owner@1234',
        address: '456 Retail Boulevard',
        role: 'owner',
      },
      adminToken
    );
    assert('5. POST /api/admin/users (Create Owner)', rCreateOwner.status === 201 && rCreateOwner.body.data.role === 'owner', JSON.stringify(rCreateOwner.body));
    createdOwnerId = rCreateOwner.body.data.id;

    // 6. Admin List Users
    const rListUsers = await request('GET', '/api/admin/users?role=owner', null, adminToken);
    assert('6. GET /api/admin/users?role=owner', rListUsers.status === 200 && Array.isArray(rListUsers.body.data), `Found ${rListUsers.body.data?.length} owners`);

    // 7. Admin Get User Detail
    const rUserDetail = await request('GET', `/api/admin/users/${createdOwnerId}`, null, adminToken);
    assert('7. GET /api/admin/users/:id', rUserDetail.status === 200 && rUserDetail.body.data.id === createdOwnerId, JSON.stringify(rUserDetail.body.data?.name));

    // 8. Admin Create Store
    const testStoreEmail = `store_${Date.now()}@example.com`;
    const rCreateStore = await request(
      'POST',
      '/api/admin/stores',
      {
        name: 'Fresh Groceries Mart',
        email: testStoreEmail,
        address: '789 Market Street',
        owner_id: createdOwnerId,
      },
      adminToken
    );
    assert('8. POST /api/admin/stores', rCreateStore.status === 201 && rCreateStore.body.success, JSON.stringify(rCreateStore.body));
    createdStoreId = rCreateStore.body.data.id;

    // 9. Admin List Stores
    const rListStores = await request('GET', '/api/admin/stores', null, adminToken);
    assert('9. GET /api/admin/stores', rListStores.status === 200 && rListStores.body.data.length > 0, `Count: ${rListStores.body.data?.length}`);

    // 10. Owner Login
    const rOwnerLogin = await request('POST', '/api/auth/login', {
      email: testOwnerEmail,
      password: 'Owner@1234',
    });
    assert('10. POST /api/auth/login (Owner)', rOwnerLogin.status === 200 && rOwnerLogin.body.data?.user?.role === 'owner', JSON.stringify(rOwnerLogin.body.data?.user?.role));
    ownerToken = rOwnerLogin.body.data.token;

    // 11. Owner Dashboard
    const rOwnerDash = await request('GET', '/api/owner/dashboard', null, ownerToken);
    assert('11. GET /api/owner/dashboard', rOwnerDash.status === 200 && rOwnerDash.body.data.store !== null, `Store: ${rOwnerDash.body.data?.store?.name}`);

    // 12. User List Stores
    const rUserStores = await request('GET', '/api/stores', null, userToken);
    assert('12. GET /api/stores (User)', rUserStores.status === 200 && Array.isArray(rUserStores.body.data), `Stores listed: ${rUserStores.body.data?.length}`);

    // 13. User Submit Rating
    const rSubmitRating = await request('POST', `/api/stores/${createdStoreId}/ratings`, { rating: 5 }, userToken);
    assert('13. POST /api/stores/:id/ratings (Submit 5-star)', rSubmitRating.status === 200 && rSubmitRating.body.success, JSON.stringify(rSubmitRating.body));

    // 14. User Update Rating
    const rUpdateRating = await request('POST', `/api/stores/${createdStoreId}/ratings`, { rating: 4 }, userToken);
    assert('14. POST /api/stores/:id/ratings (Update to 4-star)', rUpdateRating.status === 200 && rUpdateRating.body.success, JSON.stringify(rUpdateRating.body));

    // 15. Verify Owner Dashboard updated with the new rater
    const rOwnerDashAfter = await request('GET', '/api/owner/dashboard', null, ownerToken);
    const hasRater = rOwnerDashAfter.body.data.raters.some((r) => r.rating === 4);
    assert('15. Owner Dashboard reflects user rating', hasRater, `Average Rating: ${rOwnerDashAfter.body.data?.store?.avg_rating}`);

    // 16. Change Password
    const rChangePass = await request(
      'PUT',
      '/api/auth/password',
      {
        oldPassword: 'User@1234',
        newPassword: 'NewUser@999',
      },
      userToken
    );
    assert('16. PUT /api/auth/password', rChangePass.status === 200 && rChangePass.body.success, JSON.stringify(rChangePass.body));

    // 17. Role Guards: User cannot access Admin Dashboard
    const rUserForbidden = await request('GET', '/api/admin/dashboard', null, userToken);
    assert('17. RBAC: User blocked from Admin (403)', rUserForbidden.status === 403, `Status: ${rUserForbidden.status}`);

    // 18. Role Guards: User cannot access Owner Dashboard
    const rOwnerForbidden = await request('GET', '/api/owner/dashboard', null, userToken);
    assert('18. RBAC: User blocked from Owner (403)', rOwnerForbidden.status === 403, `Status: ${rOwnerForbidden.status}`);

    // 19. Auth Guard: Unauthenticated request to /api/stores
    const rNoAuth = await request('GET', '/api/stores');
    assert('19. Auth Guard: Unauthenticated request rejected (401)', rNoAuth.status === 401, `Status: ${rNoAuth.status}`);
  } catch (err) {
    console.error('Test execution failed with error:', err);
  } finally {
    server.close();
    const passed = results.filter((r) => r.pass).length;
    const total = results.length;
    console.log(`\n======================================================`);
    console.log(`Test Summary: ${passed}/${total} passed (${((passed / total) * 100).toFixed(0)}%)`);
    console.log(`======================================================\n`);
    process.exit(passed === total ? 0 : 1);
  }
}

runTests();
