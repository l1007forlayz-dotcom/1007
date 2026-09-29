# 1. 整体结构

主程序负责五件事：

1. 通过 Telegram Bot API 长轮询或 Webhook 收消息。
2. 将短时间内连续到达的消息合并成一轮输入。
3. 根据当前会话设置选择普通 API 或 Codex 网关。
4. 将模型输出拆成适合 Telegram 展示的气泡并发送。
5. 保存最低限度的运行状态，例如线路、模型、思考档位和主动消息开关。

推荐把组件之间的边界固定为 OpenAI 兼容的 Chat Completions 请求。这样主程序只需切换 `base_url`、`api_key` 和 `model`，无需理解网关内部如何取得授权。

## 建议目录

```text
telegram-bot/
├── bot.mjs
├── voice.mjs
├── voice-transcribe.py
├── persona.md
├── .env
├── package.json
└── data/
    └── state.json
```

`persona.md` 保存通用角色提示，`state.json` 保存运行状态。两者应分开，方便备份人格而排除聊天历史。

## 会话状态示例

```json
{
  "chats": {
    "123456789": {
      "route": "codex",
      "model": "codex-chatgpt",
      "reasoningEffort": "high",
      "proactiveEnabled": true,
      "lastUserMessageAt": 0
    }
  }
}
```

生产环境应采用原子写入：先写临时文件，再重命名覆盖正式状态文件，防止进程中断导致 JSON 损坏。

