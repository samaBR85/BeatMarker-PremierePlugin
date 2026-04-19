// Polyfills para APIs web ausentes no UXP
if (typeof TextDecoder === 'undefined') {
  globalThis.TextDecoder = class TextDecoder {
    constructor(encoding = 'utf-8') { this.encoding = encoding; }
    decode(buffer) {
      const bytes = new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer ?? buffer);
      let str = '';
      for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
      return decodeURIComponent(escape(str));
    }
  };
}

if (typeof TextEncoder === 'undefined') {
  globalThis.TextEncoder = class TextEncoder {
    encode(str) {
      const bytes = [];
      for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i));
      return new Uint8Array(bytes);
    }
  };
}
