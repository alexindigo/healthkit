var config = [
  {
    'status': 404,
    'file': '/etc/trulia/footprint-proxy.restarting'
  },
  {
    'status': 200,
    'http': [
      'http://localhost:7774/health',
      'http://localhost:7777/health'
    ],
    'timeout': 1000
  },
  {
    'status': 500
  }
];
