# 7. 运行方式

核心要求只有两个：进程持续运行，环境变量安全注入。具体工具按环境选择。

## 临时运行

```bash
node bot.mjs
```

适合本机调试。终端关闭后进程会停止。

## systemd

适合常规 Linux VPS。创建服务文件，设置工作目录、环境文件和自动重启：

```ini
[Unit]
Description=Telegram AI Bot
After=network-online.target

[Service]
WorkingDirectory=/opt/telegram-bot
EnvironmentFile=/opt/telegram-bot/.env
ExecStart=/usr/bin/node /opt/telegram-bot/bot.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## PM2

适合已经使用 Node.js 工具链的服务器：

```bash
pm2 start bot.mjs --name telegram-ai-bot
pm2 save
pm2 startup
```

## Docker

适合希望把 Node、Python、FFmpeg 和语音模型依赖统一封装的环境。状态目录应挂载为持久卷，`.env` 通过运行参数注入，不能复制进镜像。

## Windows

可先用终端直接运行。需要常驻时可使用任务计划程序、NSSM 或 Docker Desktop。确保系统休眠后网络和进程是否仍符合预期。

## Serverless

使用 Webhook 代替长轮询。语音模型体积较大、冷启动较慢，通常需要独立语音服务或带持久磁盘的运行平台。

