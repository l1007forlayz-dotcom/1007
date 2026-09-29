# 4. 消息合并、分气泡与菜单

## 合并连续消息

用户经常在几秒内连续发送多条短消息。为每个 Chat ID 维护一个队列，并设置 1 至 3 秒的防抖窗口：

```js
const batches = new Map();

function enqueue(chatId, message, flush) {
  const batch = batches.get(chatId) ?? { messages: [], timer: null };
  batch.messages.push(message);
  clearTimeout(batch.timer);
  batch.timer = setTimeout(() => {
    batches.delete(chatId);
    flush(batch.messages);
  }, 1800);
  batches.set(chatId, batch);
}
```

语音需要先完成转写，再与同一批文字按原始消息顺序合并。处理期间若又有新消息到达，可以取消旧回复或把新消息排进下一轮，避免覆盖用户的新输入。

## 动作与话语分气泡

先让模型遵守明确格式，例如动作用 Markdown 斜体单独成段。发送前再做确定性解析：

```js
function splitBubbles(text) {
  return text
    .split(/\n\s*\n/)
    .map(x => x.trim())
    .filter(Boolean);
}
```

逐个调用 `sendMessage`，并控制每个气泡长度。解析规则要有兜底：模型格式异常时把整段作为普通文本发送，不能丢失回复。

## 菜单状态

菜单按钮只负责改变状态，不直接拼接复杂提示词。推荐保存：

- 当前线路 `api | codex`
- 当前模型
- 每个模型对应的思考档位
- 主动消息开关
- 自动表情开关

修改后立即持久化，并回一条简短确认消息。

