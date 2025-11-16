/**
 * PM2 生产环境配置
 * 
 * 使用方法:
 * pm2 start ecosystem.config.js
 * pm2 save
 * pm2 startup
 */

module.exports = {
  apps: [
    {
      name: 'assistant-market',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1, // 或 'max' 使用所有CPU核心
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 3000,
      kill_timeout: 5000,
    },
    {
      name: 'assistant-backup',
      script: 'npm',
      args: 'run backup:export',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 2 * * *', // 每天凌晨2点运行
      autorestart: false,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/backup-error.log',
      out_file: './logs/backup-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
