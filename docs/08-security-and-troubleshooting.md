# 8. 安全、测试与排错

## 上传前必须排除

- Telegram Bot Token
- API Key、Codex 网关 Key
- Cookie、登录会话与刷新凭证
- Chat ID、真实服务器地址
- `state.json`、聊天记录与长期记忆
- 私人角色设定和表情包私有地址

提交前检查：

```bash
git diff --cached
rg -n "(BOT_TOKEN|API_KEY|Bearer|cookie|secret)" .
```

若密钥曾进入 Git 历史，仅删除文件还不够。应先撤销并重新生成密钥，再清理仓库历史。

## 验证顺序

1. 调用 Telegram `getMe` 验证 Token。
2. 发送 `/menu` 验证收发链路。
3. 分别切换 API 与 Codex，确认实际使用的线路与界面一致。
4. 测试两条快速连续文字是否合并。
5. 测试动作与话语是否分成预期气泡。
6. 发送短语音，确认 small 模型和上下文提示生效。
7. 将空闲时间在测试环境临时缩短，验证主动消息；完成后恢复 30 分钟。
8. 重启进程，确认菜单设置和状态仍然存在。

## 常见问题

### Telegram 能收不能发

检查服务器到 `api.telegram.org` 的网络、代理配置、Chat ID 与发送接口返回值。对超时和临时网络错误做有限次数的指数退避重试。

### Codex 线路返回 401

检查网关自身授权和 `CODEX_API_KEY`。Bot 只看到网关接口，账号登录问题应在网关侧处理。

### 消息重复

检查 `getUpdates` 的 offset 是否在处理后前移；Webhook 模式需对 `update_id` 做幂等处理。

### 主动消息打断正常聊天

每次执行调度前重新读取 `lastUserMessageAt`，同时检查待合并队列和正在生成的回复。

### 语音同音字错误

确认实际加载的是 small 模型，把最近对话和常用词传入 `initial_prompt`，并避免给过长或与当前话题无关的提示。

