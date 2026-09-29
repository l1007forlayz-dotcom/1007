# 2. 创建 Telegram Bot

1. 在 Telegram 搜索 `@BotFather`。
2. 发送 `/newbot`，依次设置显示名称与以 `bot` 结尾的用户名。
3. 保存 BotFather 返回的 Token。它相当于机器人密码。
4. 给新机器人发送一条消息。
5. 调用 `getUpdates` 查看自己的 `chat.id`：

```bash
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates"
```

将 Token 和允许使用机器人的 Chat ID 写入环境变量。主程序收到更新后必须校验 Chat ID，避免机器人意外对外开放。

## 长轮询与 Webhook

| 方式 | 适用环境 | 特点 |
|---|---|---|
| 长轮询 `getUpdates` | 本机、普通 VPS、内网机器 | 无需公网域名，搭建简单 |
| Webhook | Serverless、有 HTTPS 域名的平台 | 延迟低，需处理公网入口和证书 |

个人机器人通常从长轮询开始即可。轮询时保存最新 `update_id`，下一次请求使用 `offset = update_id + 1`，防止重复处理。

## 菜单命令

启动时调用 `setMyCommands` 注册命令：

```js
await telegram("setMyCommands", {
  commands: [
    { command: "menu", description: "打开菜单" },
    { command: "route", description: "切换 API / Codex" },
    { command: "model", description: "切换模型" },
    { command: "effort", description: "切换思考档位" },
    { command: "proactive", description: "开关主动消息" }
  ]
});
```

按钮可使用 `reply_markup.inline_keyboard`。`callback_data` 应短小稳定，例如 `route:codex`、`effort:high`。收到 `callback_query` 后及时调用 `answerCallbackQuery`，否则客户端会一直显示加载动画。

