# 3. 接入 API 与 Codex 双线路

## 统一配置

```js
const providers = {
  api: {
    baseUrl: process.env.API_BASE_URL,
    apiKey: process.env.API_KEY,
    model: process.env.API_MODEL
  },
  codex: {
    baseUrl: process.env.CODEX_BASE_URL,
    apiKey: process.env.CODEX_API_KEY,
    model: process.env.CODEX_MODEL
  }
};
```

Codex 一侧需要一个你有权使用的兼容网关。网关对 Bot 暴露 `/v1/chat/completions` 一类接口，内部负责合法的账号授权、会话续期和请求转发。不要把浏览器 Cookie 或账号凭证直接写进 Bot 源码。

## 按会话选择线路

```js
function activeProvider(chat) {
  const route = chat.route === "codex" ? "codex" : "api";
  return { route, ...providers[route] };
}
```

切换线路只修改会话状态，下一轮请求自动生效。不要在一条请求失败后静默切到另一条付费线路；显式失败更容易发现计费和授权问题。

## 请求模型

```js
async function requestModel(messages, provider) {
  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      ...(provider.route === "codex" && provider.reasoningEffort
        ? { reasoning_effort: provider.reasoningEffort }
        : {})
    })
  });
  if (!response.ok) throw new Error(`Model HTTP ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
```

不同网关支持的模型列表和思考档位可能不同。菜单应从网关能力接口读取，或在配置文件中明确列出；未知档位恢复为模型默认值。

