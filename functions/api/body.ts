// 流式读取请求体并按字节硬顶截断 —— 封堵 Content-Length 伪造 / chunked 绕过 body 上限。
// Cloudflare Pages Functions 的 req.body 是 ReadableStream；逐块累计，超限即 cancel 并抛错。
// 调用方捕获 'PAYLOAD_TOO_LARGE' 返回 413。

export class PayloadTooLargeError extends Error {
  constructor() {
    super('PAYLOAD_TOO_LARGE');
    this.name = 'PayloadTooLimited';
  }
}

export async function readJsonWithCap(req: Request, maxBytes: number): Promise<unknown> {
  // 快路径：无 body 流（GET / 空 body）直接返回空对象
  if (!req.body) return {};

  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new PayloadTooLargeError();
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode(); // flush

  return text.trim() ? JSON.parse(text) : {};
}
