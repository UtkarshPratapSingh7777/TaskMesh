const axios = require('axios');

function createApiClient(baseURL) {
  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' }
  });

  return {
    async get(pathname) {
      const response = await client.get(pathname);
      return response.data;
    },
    async post(pathname, body = {}) {
      const response = await client.post(pathname, body);
      return response.data;
    }
  };
}

module.exports = { createApiClient };
