const http = require('http');

async function checkPort(port, path = '/') {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          port,
          status: res.statusCode,
          headers: res.headers,
          body: data.substring(0, 500)
        });
      });
    });
    req.on('error', (e) => {
      resolve({ port, error: e.message });
    });
    req.setTimeout(3000, () => {
      req.destroy();
      resolve({ port, error: 'Timeout' });
    });
  });
}

(async () => {
  console.log('=== Checking services ===');
  
  // Check port 3100 (frontend Next.js)
  const frontend = await checkPort(3100);
  console.log('Frontend (3100):', JSON.stringify(frontend, null, 2));

  // Check port 4100 (backend NestJS)
  const backendRoot = await checkPort(4100);
  console.log('Backend root (4100):', JSON.stringify(backendRoot, null, 2));

  const backendApi = await checkPort(4100, '/api');
  console.log('Backend /api (4100):', JSON.stringify(backendApi, null, 2));

  const backendHealth = await checkPort(4100, '/api/health');
  console.log('Backend /api/health (4100):', JSON.stringify(backendHealth, null, 2));

  const backendAuth = await checkPort(4100, '/api/auth');
  console.log('Backend /api/auth (4100):', JSON.stringify(backendAuth, null, 2));
})();
