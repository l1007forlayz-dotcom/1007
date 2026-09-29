# 6. 语音转写与上下文辅助

推荐在本地使用 `faster-whisper`，避免把私人语音转发给额外服务。

## 安装

```bash
python -m venv voice-venv
source voice-venv/bin/activate
pip install faster-whisper
```

系统还需安装 FFmpeg。Windows 可使用 PowerShell 激活虚拟环境；Docker 中直接把依赖写入镜像。

## 模型

中文短语音建议从 `small` 开始。CPU 环境可采用 `compute_type="int8"`。首次下载完成后，运行时开启本地文件模式，避免每次启动访问网络。

```python
from faster_whisper import WhisperModel

model = WhisperModel(
    "voice-model-small",
    device="cpu",
    compute_type="int8",
    local_files_only=True,
)
```

## 上下文辅助纠音

取最近聊天中最多几百个字符，加上常用人名、产品名和中英混合词，放进 `initial_prompt`：

```python
initial_prompt = f"{recent_context[-500:]}\n常用词：Telegram，Codex，Plus，语音转写"
segments, _ = model.transcribe(
    audio_path,
    language="zh",
    beam_size=5,
    temperature=0.0,
    vad_filter=True,
    initial_prompt=initial_prompt,
)
```

上下文只能作为提示，不能替换识别结果。限制语音大小和时长，设置子进程超时，并在失败时提示用户改发短语音或文字。

## 合并顺序

为每条 Telegram 消息保留 `message_id`。语音转写完成后按 `message_id` 排序，再和文字合并，防止慢速转写改变用户原本的表达顺序。

