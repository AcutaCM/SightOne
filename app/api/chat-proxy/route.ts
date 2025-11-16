import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type Role = "user" | "assistant";

interface ChatProxyPayload {
  provider: string;
  model: string;
  messages: Array<{ role: Role; content: string }>;
  temperature?: number;
  maxTokens?: number;
  format?: "text" | "markdown" | "json";
  stream?: boolean;
  apiKey?: string;
  baseUrl?: string;
}

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
}

function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

function serverError(message: string) {
  return json({ error: message }, { status: 500 });
}

// Convert messages to different vendor formats
function toOpenAIChat(messages: ChatProxyPayload["messages"]) {
  return messages.map(m => ({ role: m.role, content: m.content }));
}

// 新增：从 Markdown 中提取 dataURL 图片，构造成 OpenAI 兼容的多模态 parts
function extractImageDataUrls(text: string): string[] {
  if (!text) return [];
  const urls: string[] = [];
  // 匹配 ![upload](data:...) 或任意 ![alt](data:...)
  const reMd = /!\[[^\]]*]\((data:image\/[a-zA-Z0-9+.\-]+;base64,[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = reMd.exec(text)) !== null) {
    urls.push(m[1]);
  }
  // 兜底：直接扫描裸露的 data:image... 片段
  const reRaw = /(data:image\/[a-zA-Z0-9+.\-]+;base64,[A-Za-z0-9+/=]+)/g;
  while ((m = reRaw.exec(text)) !== null) {
    const u = m[1];
    if (!urls.includes(u)) urls.push(u);
  }
  return urls;
}
function stripImageMarkdown(text: string): string {
  if (!text) return "";
  // 去掉图片 Markdown，保留其余文本
  return text
    .replace(/!\[[^\]]*]\((data:image\/[a-zA-Z0-9+.\-]+;base64,[^)]+)\)/g, "")
    .trim();
}
function toOpenAIChatWithVision(messages: ChatProxyPayload["messages"]) {
  return messages.map(m => {
    const imgs = extractImageDataUrls(m.content || "");
    if (!imgs.length) return { role: m.role, content: m.content };
    const text = stripImageMarkdown(m.content || "");
    const parts: any[] = [];
    if (text) parts.push({ type: "text", text });
    for (const u of imgs) {
      parts.push({ type: "image_url", image_url: { url: u } });
    }
    return { role: m.role, content: parts };
  });
}

// Anthropic/Gemini 多模态转换
function toAnthropicMessagesWithVision(messages: ChatProxyPayload["messages"]) {
  return messages.map(m => {
    const imgs = extractImageDataUrls(m.content || "");
    if (!imgs.length) return { role: m.role, content: [{ type: "text", text: m.content }] as any[] };
    const text = stripImageMarkdown(m.content || "");
    const parts: any[] = [];
    if (text) parts.push({ type: "text", text });
    for (const u of imgs) {
      // 解析 dataURL -> mime/base64
      const match = /^data:([^;]+);base64,(.+)$/i.exec(u);
      const mime = (match?.[1] || "image/png").toLowerCase();
      const base64 = match?.[2] || "";
      parts.push({
        type: "image",
        source: { type: "base64", media_type: mime, data: base64 },
      });
    }
    return { role: m.role, content: parts };
  });
}

function toGeminiContentsWithVision(messages: ChatProxyPayload["messages"]) {
  return messages.map(m => {
    const imgs = extractImageDataUrls(m.content || "");
    if (!imgs.length) return { role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] };
    const text = stripImageMarkdown(m.content || "");
    const parts: any[] = [];
    if (text) parts.push({ text });
    for (const u of imgs) {
      const match = /^data:([^;]+);base64,(.+)$/i.exec(u);
      const mime = (match?.[1] || "image/png").toLowerCase();
      const base64 = match?.[2] || "";
      parts.push({ inline_data: { mime_type: mime, data: base64 } });
    }
    return { role: m.role === "user" ? "user" : "model", parts };
  });
}

function toAnthropicMessages(messages: ChatProxyPayload["messages"]) {
  // Anthropic requires content as array parts
  return messages.map(m => ({
    role: m.role,
    content: [{ type: "text", text: m.content }],
  }));
}

function toGeminiContents(messages: ChatProxyPayload["messages"]) {
  // Gemini: contents: [{ role, parts: [{text}]}]
  return messages.map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
}

export async function POST(req: NextRequest) {
  let body: ChatProxyPayload;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const {
    provider,
    model,
    messages,
    temperature = 0.7,
    maxTokens = 2048,
    stream = false,
    apiKey,
    baseUrl,
  } = body || {};

  if (!provider) return badRequest("Missing 'provider'.");
  if (!model) return badRequest("Missing 'model'.");
  if (!messages || !Array.isArray(messages) || messages.length === 0)
    return badRequest("Missing 'messages'.");
  // Some providers allow no apiKey (e.g., local Ollama); we tolerate empty apiKey if baseUrl is local
  const lower = provider.toLowerCase();

  // Prepare defaults for OpenAI-compatible providers
  const openAICompatProviders = new Set([
    "openai",
    "groq",
    "deepseek",
    "openrouter",
    "ollama",
    "mistral",
    "moonshot",
    "zhipu",
    "baichuan",
    "azure-openai",
  ]);

  try {
    if (openAICompatProviders.has(lower)) {
      // Endpoint resolution
      let endpoint = "";
      let keyHeaderName = "Authorization";
      let keyHeaderValue = apiKey ? `Bearer ${apiKey}` : "";

      if (lower === "openai") {
        endpoint = (baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "") + "/chat/completions";
      } else if (lower === "groq") {
        endpoint = (baseUrl || "https://api.groq.com/openai/v1").replace(/\/+$/, "") + "/chat/completions";
      } else if (lower === "deepseek") {
        endpoint = (baseUrl || "https://api.deepseek.com").replace(/\/+$/, "") + "/chat/completions";
      } else if (lower === "openrouter") {
        endpoint = (baseUrl || "https://openrouter.ai/api/v1").replace(/\/+$/, "") + "/chat/completions";
        // OpenRouter uses Authorization Bearer too
      } else if (lower === "ollama") {
        endpoint = (baseUrl || "http://localhost:11434/v1").replace(/\/+$/, "") + "/chat/completions";
      } else if (lower === "mistral") {
        endpoint = (baseUrl || "https://api.mistral.ai/v1").replace(/\/+$/, "") + "/chat/completions";
      } else if (lower === "moonshot") {
        endpoint = (baseUrl || "https://api.moonshot.cn/v1").replace(/\/+$/, "") + "/chat/completions";
      } else if (lower === "zhipu") {
        endpoint = (baseUrl || "https://open.bigmodel.cn/api/paas/v4").replace(/\/+$/, "") + "/chat/completions";
      } else if (lower === "baichuan") {
        endpoint = (baseUrl || "https://api.baichuan-ai.com/v1").replace(/\/+$/, "") + "/chat/completions";
      } else if (lower === "azure-openai") {
        // For Azure, front-end should pass the full path with api-version already included
        endpoint = (baseUrl || "").replace(/\/+$/, "");
        if (!endpoint) return badRequest("Azure OpenAI requires full baseUrl including api-version.");
      }

      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(keyHeaderValue ? { [keyHeaderName]: keyHeaderValue } : {}),
        },
        body: JSON.stringify({
          model,
          messages: toOpenAIChatWithVision(messages),
          temperature,
          max_tokens: maxTokens,
          stream,
        }),
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        return json({ error: txt || `Upstream error: ${resp.status}` }, { status: resp.status });
      }

      // Stream passthrough for SSE
      if (stream) {
        const ct = resp.headers.get("content-type") || "";
        if (ct.includes("text/event-stream") && resp.body) {
          const headers = new Headers({
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          });
          return new Response(resp.body, { status: 200, headers });
        }
      }

      // Non-stream response parsing
      const data = await resp.json().catch(() => null);
      const content =
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.delta?.content ??
        null;

      return json({ content: content ?? "" });
    }

    if (lower === "anthropic") {
      const endpoint = (baseUrl || "https://api.anthropic.com/v1").replace(/\/+$/, "") + "/messages";
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: toAnthropicMessagesWithVision(messages),
        }),
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        return json({ error: txt || `Upstream error: ${resp.status}` }, { status: resp.status });
      }
      const data = await resp.json().catch(() => null);
      const content =
        data?.content?.[0]?.text ??
        data?.output?.[0]?.content ??
        "";
      return json({ content });
    }

    if (lower === "gemini") {
      const base = (baseUrl || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, "");
      const endpoint = `${base}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey || "")}`;
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: toGeminiContentsWithVision(messages),
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        return json({ error: txt || `Upstream error: ${resp.status}` }, { status: resp.status });
      }
      const data = await resp.json().catch(() => null);
      const content =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.output_text ??
        "";
      return json({ content });
    }

    if (lower === "qwen") {
      const base = (baseUrl || "https://dashscope.aliyuncs.com/api/v1").replace(/\/+$/, "");
      const isCompat = /compatible-mode/i.test(base);
      const endpoint = `${base}/chat/completions`;
      const headers: Record<string,string> = {
        "Content-Type": "application/json",
        Authorization: apiKey ? `Bearer ${apiKey}` : "",
      };
      const body = isCompat
        ? {
            model,
            messages: toOpenAIChatWithVision(messages),
            temperature,
            max_tokens: maxTokens,
            stream,
          }
        : {
            model,
            input: { messages: toOpenAIChat(messages) },
            parameters: { temperature, max_tokens: maxTokens, stream },
          };

      const resp = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        return json({ error: txt || `Upstream error: ${resp.status}` }, { status: resp.status });
      }

      // Stream passthrough for SSE (Qwen)
      if (stream) {
        const ct = resp.headers.get("content-type") || "";
        if (ct.includes("text/event-stream") && resp.body) {
          const headers = new Headers({
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          });
          return new Response(resp.body, { status: 200, headers });
        }
      }

      const data = await resp.json().catch(() => null);
      const content =
        data?.output?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.message?.content ??
        "";
      return json({ content });
    }

    return badRequest(`Unsupported provider: ${provider}`);
  } catch (e: any) {
    return serverError(e?.message || String(e));
  }
}