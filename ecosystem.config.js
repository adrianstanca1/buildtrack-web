module.exports = {
  apps: [{
    name: 'buildtrack-web',
    cwd: '/root/buildtrack-web',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3004,
      NEXT_PUBLIC_API_URL: 'https://api.buildtrack.cortexbuildpro.com'
    },
    error_file: '/var/log/buildtrack-web-err.log',
    out_file: '/var/log/buildtrack-web-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
};
