const artillery = require('artillery');

// Performance Test Configuration
module.exports = {
  config: {
    target: 'http://localhost:8001',
    phases: [
      { duration: 60, arrivalRate: 5, name: 'Warm up' },
      { duration: 120, arrivalRate: 10, name: 'Ramp up load' },
      { duration: 180, arrivalRate: 15, name: 'Sustained load' },
      { duration: 120, arrivalRate: 25, name: 'Peak load' },
      { duration: 60, arrivalRate: 5, name: 'Cool down' }
    ],
    processor: './test-functions.js'
  },
  scenarios: [
    {
      name: 'Health Check Load Test',
      weight: 20,
      flow: [
        {
          get: {
            url: '/health'
          }
        }
      ]
    },
    {
      name: 'Inventory API Load Test',
      weight: 40,
      flow: [
        {
          post: {
            url: '/api/v1/auth/login',
            json: {
              username: 'admin',
              password: 'admin'
            },
            capture: {
              header: 'authorization',
              as: 'authToken'
            }
          }
        },
        {
          get: {
            url: '/api/v1/inventory/items',
            headers: {
              authorization: 'Bearer {{ authToken }}'
            }
          }
        },
        {
          post: {
            url: '/api/v1/inventory/items',
            headers: {
              authorization: 'Bearer {{ authToken }}'
            },
            json: {
              name: 'Load Test Item {{ $randomString() }}',
              category: 'Electronics',
              costPrice: 25.99,
              sellingPrice: 45.99,
              stockLevel: 100,
              status: 'active'
            }
          }
        }
      ]
    },
    {
      name: 'Analytics API Load Test',
      weight: 20,
      flow: [
        {
          post: {
            url: '/api/v1/auth/login',
            json: {
              username: 'admin',
              password: 'admin'
            },
            capture: {
              header: 'authorization',
              as: 'authToken'
            }
          }
        },
        {
          get: {
            url: '/api/v1/analytics/profit-margins',
            headers: {
              authorization: 'Bearer {{ authToken }}'
            }
          }
        },
        {
          get: {
            url: '/api/v1/analytics/shipment-performance',
            headers: {
              authorization: 'Bearer {{ authToken }}'
            }
          }
        }
      ]
    },
    {
      name: 'Barcode Service Load Test',
      weight: 20,
      flow: [
        {
          post: {
            url: 'http://localhost:8002/api/v1/barcode/generate',
            json: {
              itemId: 'ITM-2024-{{ $randomInt(1, 1000) }}',
              type: 'item',
              format: 'CODE128',
              width: 200,
              height: 100
            }
          }
        }
      ]
    }
  ]
};