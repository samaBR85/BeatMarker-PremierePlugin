/**
 * Stub para @eshaz/web-worker que roda tudo na main thread (sem worker real).
 * Usado no UXP onde worker_threads e Web Workers não existem.
 */

class FakeEventTarget {
  constructor() { this._events = new Map(); }
  dispatchEvent(e) {
    e.target = this;
    if (this['on' + e.type]) { try { this['on' + e.type](e); } catch(err) { console.error(err); } }
    const list = this._events.get(e.type);
    if (list) list.forEach(h => { try { h(e); } catch(err) { console.error(err); } });
  }
  addEventListener(type, fn) {
    if (!this._events.has(type)) this._events.set(type, []);
    this._events.get(type).push(fn);
  }
  removeEventListener(type, fn) {
    const list = this._events.get(type);
    if (list) { const i = list.indexOf(fn); if (i >= 0) list.splice(i, 1); }
  }
}

function FakeEvent(type) {
  this.type = type;
  this.data = null;
  this.target = null;
}

class Worker extends FakeEventTarget {
  constructor(url) {
    super();
    const mainWorker = this;

    // Objeto que representa o "self" dentro do worker
    const workerSelf = new FakeEventTarget();
    workerSelf.name = '';
    workerSelf.close = () => {};
    // Quando o worker chama postMessage → dispara onmessage no main
    workerSelf.postMessage = (data, transfer) => {
      Promise.resolve().then(() => {
        const e = new FakeEvent('message');
        e.data = data;
        mainWorker.dispatchEvent(e);
      });
    };

    // Quando o main chama worker.postMessage → dispara onmessage no worker
    this.postMessage = (data, transfer) => {
      Promise.resolve().then(() => {
        const e = new FakeEvent('message');
        e.data = data;
        workerSelf.dispatchEvent(e);
      });
    };

    this.terminate = () => {};

    // Extrair e executar o código do data URL no contexto da main thread
    if (typeof url === 'string' && /^data:/.test(url)) {
      Promise.resolve().then(() => {
        try {
          let code;
          if (url.includes(';base64,')) {
            const b64 = url.split(';base64,')[1];
            code = atob(b64);
          } else {
            const comma = url.indexOf(',');
            code = decodeURIComponent(url.slice(comma + 1));
          }

          // Salvar e substituir globals que o worker usa
          const prevSelf = globalThis.self;
          globalThis.self = workerSelf;

          // Executar o código do worker
          // eslint-disable-next-line no-eval
          eval(code);

          globalThis.self = prevSelf;
        } catch (err) {
          console.error('[web-worker stub] eval error:', err);
          // Notificar erro ao main
          const e = new FakeEvent('error');
          e.message = err.message;
          mainWorker.dispatchEvent(e);
        }
      });
    }
  }
}

module.exports = Worker;
