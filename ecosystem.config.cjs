module.exports = {
  apps: [
    {
      name: 'freelance-assistant',
      script: 'src/server.mjs',
      cwd: '/var/www/freelance-assistant',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 4177,
      },
    },
  ],
};
