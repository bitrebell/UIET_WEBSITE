module.exports = {
  apps: [{
    name: 'uiet-backend',
    script: './server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024',
    restart_delay: 4000,
    watch: false,
    ignore_watch: [
      'node_modules',
      'logs',
      'uploads'
    ],
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
