/**
 * PM2 Ecosystem Configuration (CommonJS)
 * For running backend on Hostinger
 * 
 * Usage: pm2 start ecosystem.config.cjs
 */

module.exports = {
  apps: [{
    name: 'ats-backend',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
