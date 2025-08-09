module.exports = {
  apps: [{
    name: 'whatsapp-bot',
    script: 'server/index.ts',
    interpreter: 'tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Restart strategies
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    // Chrome/Puppeteer optimizations
    node_args: '--max-old-space-size=2048'
  }]
};