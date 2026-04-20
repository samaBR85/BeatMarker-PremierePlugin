var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/stubs/globals.js
var init_globals = __esm({
  "src/stubs/globals.js"() {
    if (typeof TextDecoder === "undefined") {
      globalThis.TextDecoder = class TextDecoder {
        constructor(encoding = "utf-8") {
          this.encoding = encoding;
        }
        decode(buffer) {
          const bytes = new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer ?? buffer);
          let str = "";
          for (let i = 0; i < bytes.length; i++)
            str += String.fromCharCode(bytes[i]);
          return decodeURIComponent(escape(str));
        }
      };
    }
    if (typeof TextEncoder === "undefined") {
      globalThis.TextEncoder = class TextEncoder {
        encode(str) {
          const bytes = [];
          for (let i = 0; i < str.length; i++)
            bytes.push(str.charCodeAt(i));
          return new Uint8Array(bytes);
        }
      };
    }
  }
});

// src/stubs/web-worker.js
var require_web_worker = __commonJS({
  "src/stubs/web-worker.js"(exports, module) {
    init_globals();
    var FakeEventTarget = class {
      constructor() {
        this._events = /* @__PURE__ */ new Map();
      }
      dispatchEvent(e2) {
        e2.target = this;
        if (this["on" + e2.type]) {
          try {
            this["on" + e2.type](e2);
          } catch (err) {
            console.error(err);
          }
        }
        const list = this._events.get(e2.type);
        if (list)
          list.forEach((h) => {
            try {
              h(e2);
            } catch (err) {
              console.error(err);
            }
          });
      }
      addEventListener(type, fn) {
        if (!this._events.has(type))
          this._events.set(type, []);
        this._events.get(type).push(fn);
      }
      removeEventListener(type, fn) {
        const list = this._events.get(type);
        if (list) {
          const i = list.indexOf(fn);
          if (i >= 0)
            list.splice(i, 1);
        }
      }
    };
    function FakeEvent(type) {
      this.type = type;
      this.data = null;
      this.target = null;
    }
    var Worker = class extends FakeEventTarget {
      constructor(url) {
        super();
        const mainWorker = this;
        const workerSelf = new FakeEventTarget();
        workerSelf.name = "";
        workerSelf.close = () => {
        };
        workerSelf.postMessage = (data, transfer) => {
          Promise.resolve().then(() => {
            const e2 = new FakeEvent("message");
            e2.data = data;
            mainWorker.dispatchEvent(e2);
          });
        };
        this.postMessage = (data, transfer) => {
          Promise.resolve().then(() => {
            const e2 = new FakeEvent("message");
            e2.data = data;
            workerSelf.dispatchEvent(e2);
          });
        };
        this.terminate = () => {
        };
        if (typeof url === "string" && /^data:/.test(url)) {
          Promise.resolve().then(() => {
            try {
              let code;
              if (url.includes(";base64,")) {
                const b64 = url.split(";base64,")[1];
                code = atob(b64);
              } else {
                const comma = url.indexOf(",");
                code = decodeURIComponent(url.slice(comma + 1));
              }
              const prevSelf = globalThis.self;
              globalThis.self = workerSelf;
              eval(code);
              globalThis.self = prevSelf;
            } catch (err) {
              console.error("[web-worker stub] eval error:", err);
              const e2 = new FakeEvent("error");
              e2.message = err.message;
              mainWorker.dispatchEvent(e2);
            }
          });
        }
      }
    };
    module.exports = Worker;
  }
});

// node_modules/music-tempo/dist/node/OnsetDetection.js
var require_OnsetDetection = __commonJS({
  "node_modules/music-tempo/dist/node/OnsetDetection.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports);
        global.OnsetDetection = mod.exports;
      }
    })(exports2, function(module3, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
              descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
          if (staticProps)
            defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();
      var OnsetDetection = function() {
        function OnsetDetection2() {
          _classCallCheck(this, OnsetDetection2);
        }
        _createClass(OnsetDetection2, null, [{
          key: "calculateSF",
          value: function calculateSF(audioData, fft) {
            var params = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
            if (typeof fft == "undefined") {
              throw new ReferenceError("fft is undefined");
            }
            if (typeof fft.getHammingWindow !== "function" || typeof fft.getSpectrum !== "function") {
              throw new ReferenceError("fft doesn't contain getHammingWindow or getSpectrum methods");
            }
            if (!Array.prototype.fill) {
              Array.prototype.fill = function(value2) {
                if (this == null) {
                  throw new TypeError("this is null or not defined");
                }
                var O = Object(this);
                var len = O.length >>> 0;
                var start = arguments[1];
                var relativeStart = start >> 0;
                var k2 = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
                var end = arguments[2];
                var relativeEnd = end === void 0 ? len : end >> 0;
                var final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);
                while (k2 < final) {
                  O[k2] = value2;
                  k2++;
                }
                return O;
              };
            }
            params.bufferSize = params.bufferSize || 2048;
            params.hopSize = params.hopSize || 441;
            var bufferSize = params.bufferSize, hopSize = params.hopSize;
            var k = Math.floor(Math.log(bufferSize) / Math.LN2);
            if (Math.pow(2, k) !== bufferSize) {
              throw "Invalid buffer size (" + bufferSize + "), must be power of 2";
            }
            var hammWindow = fft.getHammingWindow(bufferSize);
            var spectralFlux = [];
            var spectrumLength = bufferSize / 2 + 1;
            var previousSpectrum = new Array(spectrumLength);
            previousSpectrum.fill(0);
            var im = new Array(bufferSize);
            var length = audioData.length;
            var zerosStart = new Array(bufferSize - hopSize);
            zerosStart.fill(0);
            audioData = zerosStart.concat(audioData);
            var zerosEnd = new Array(bufferSize - audioData.length % hopSize);
            zerosEnd.fill(0);
            audioData = audioData.concat(zerosEnd);
            for (var wndStart = 0; wndStart < length; wndStart += hopSize) {
              var wndEnd = wndStart + bufferSize;
              var re = [];
              var _k = 0;
              for (var i = wndStart; i < wndEnd; i++) {
                re[_k] = hammWindow[_k] * audioData[i];
                _k++;
              }
              im.fill(0);
              fft.getSpectrum(re, im);
              var flux = 0;
              for (var j = 0; j < spectrumLength; j++) {
                var value = re[j] - previousSpectrum[j];
                flux += value < 0 ? 0 : value;
              }
              spectralFlux.push(flux);
              previousSpectrum = re;
            }
            return spectralFlux;
          }
        }, {
          key: "normalize",
          value: function normalize(data) {
            if (!Array.isArray(data)) {
              throw "Array expected";
            }
            if (data.length == 0) {
              throw "Array is empty";
            }
            var sum = 0;
            var squareSum = 0;
            for (var i = 0; i < data.length; i++) {
              sum += data[i];
              squareSum += data[i] * data[i];
            }
            var mean = sum / data.length;
            var standardDeviation = Math.sqrt((squareSum - sum * mean) / data.length);
            if (standardDeviation == 0)
              standardDeviation = 1;
            for (var _i = 0; _i < data.length; _i++) {
              data[_i] = (data[_i] - mean) / standardDeviation;
            }
          }
        }, {
          key: "findPeaks",
          value: function findPeaks(spectralFlux) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var length = spectralFlux.length;
            var sf = spectralFlux;
            var decayRate = params.decayRate || 0.84;
            var peakFindingWindow = params.peakFindingWindow || 6;
            var meanWndMultiplier = params.meanWndMultiplier || 3;
            var peakThreshold = params.peakThreshold || 0.35;
            var max = 0;
            var av = sf[0];
            var peaks = [];
            for (var i = 0; i < length; i++) {
              av = decayRate * av + (1 - decayRate) * sf[i];
              if (sf[i] < av)
                continue;
              var wndStart = i - peakFindingWindow;
              var wndEnd = i + peakFindingWindow + 1;
              if (wndStart < 0)
                wndStart = 0;
              if (wndEnd > length)
                wndEnd = length;
              if (av < sf[i])
                av = sf[i];
              var isMax = true;
              for (var j = wndStart; j < wndEnd; j++) {
                if (sf[j] > sf[i])
                  isMax = false;
              }
              if (isMax) {
                var meanWndStart = i - peakFindingWindow * meanWndMultiplier;
                var meanWndEnd = i + peakFindingWindow;
                if (meanWndStart < 0)
                  meanWndStart = 0;
                if (meanWndEnd > length)
                  meanWndEnd = length;
                var sum = 0;
                var count = meanWndEnd - meanWndStart;
                for (var _j = meanWndStart; _j < meanWndEnd; _j++) {
                  sum += sf[_j];
                }
                if (sf[i] > sum / count + peakThreshold) {
                  peaks.push(i);
                }
              }
            }
            if (peaks.length < 2) {
              throw "Fail to find peaks";
            }
            return peaks;
          }
        }]);
        return OnsetDetection2;
      }();
      exports3.default = OnsetDetection;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/TempoInduction.js
var require_TempoInduction = __commonJS({
  "node_modules/music-tempo/dist/node/TempoInduction.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports);
        global.TempoInduction = mod.exports;
      }
    })(exports2, function(module3, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
              descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
          if (staticProps)
            defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();
      var TempoInduction = function() {
        function TempoInduction2() {
          _classCallCheck(this, TempoInduction2);
        }
        _createClass(TempoInduction2, null, [{
          key: "processRhythmicEvents",
          value: function processRhythmicEvents(events) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var widthTreshold = params.widthTreshold || 0.025, maxIOI = params.maxIOI || 2.5, minIOI = params.minIOI || 0.07, length = events.length;
            var clIntervals = [], clSizes = [], clCount = 0;
            for (var i = 0; i < length - 1; i++) {
              for (var j = i + 1; j < length; j++) {
                var ioi = events[j] - events[i];
                if (ioi < minIOI) {
                  continue;
                }
                if (ioi > maxIOI) {
                  break;
                }
                var k = 0;
                for (; k < clCount; k++) {
                  if (Math.abs(clIntervals[k] - ioi) < widthTreshold) {
                    if (Math.abs(clIntervals[k + 1] - ioi) < Math.abs(clIntervals[k] - ioi) && k < clCount - 1) {
                      k++;
                    }
                    clIntervals[k] = (clIntervals[k] * clSizes[k] + ioi) / (clSizes[k] + 1);
                    clSizes[k]++;
                    break;
                  }
                }
                if (k != clCount)
                  continue;
                clCount++;
                for (; k > 0 && clIntervals[k - 1] > ioi; k--) {
                  clIntervals[k] = clIntervals[k - 1];
                  clSizes[k] = clSizes[k - 1];
                }
                clIntervals[k] = ioi;
                clSizes[k] = 1;
              }
            }
            if (clCount == 0) {
              throw "Fail to find IOIs";
            }
            clIntervals.length = clCount;
            clSizes.length = clCount;
            return { clIntervals, clSizes };
          }
        }, {
          key: "mergeClusters",
          value: function mergeClusters(clusters) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var widthTreshold = params.widthTreshold || 0.025;
            var clIntervals = clusters.clIntervals, clSizes = clusters.clSizes;
            var clCount = clIntervals.length;
            for (var i = 0; i < clCount; i++) {
              for (var j = i + 1; j < clCount; j++) {
                if (Math.abs(clIntervals[i] - clIntervals[j]) < widthTreshold) {
                  clIntervals[i] = (clIntervals[i] * clSizes[i] + clIntervals[j] * clSizes[j]) / (clSizes[i] + clSizes[j]);
                  clSizes[i] = clSizes[i] + clSizes[j];
                  --clCount;
                  for (var k = j + 1; k <= clCount; k++) {
                    clIntervals[k - 1] = clIntervals[k];
                    clSizes[k - 1] = clSizes[k];
                  }
                }
              }
            }
            clIntervals.length = clCount;
            clSizes.length = clCount;
            return { clIntervals, clSizes };
          }
        }, {
          key: "calculateScore",
          value: function calculateScore(clusters) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var widthTreshold = params.widthTreshold || 0.025;
            var maxTempos = params.maxTempos || 10;
            var clIntervals = clusters.clIntervals, clSizes = clusters.clSizes, clScores = [], clScoresIdxs = [];
            var clCount = clIntervals.length;
            for (var i = 0; i < clCount; i++) {
              clScores[i] = 10 * clSizes[i];
              clScoresIdxs[i] = { score: clScores[i], idx: i };
            }
            clScoresIdxs.sort(function(a, b) {
              return b.score - a.score;
            });
            if (clScoresIdxs.length > maxTempos) {
              for (var _i = maxTempos - 1; _i < clScoresIdxs.length - 1; _i++) {
                if (clScoresIdxs[_i].score == clScoresIdxs[_i + 1].score) {
                  maxTempos++;
                } else {
                  break;
                }
              }
              clScoresIdxs.length = maxTempos;
            }
            clScoresIdxs = clScoresIdxs.map(function(a) {
              return a.idx;
            });
            for (var _i2 = 0; _i2 < clCount; _i2++) {
              for (var j = _i2 + 1; j < clCount; j++) {
                var ratio = clIntervals[_i2] / clIntervals[j];
                var isFraction = ratio < 1;
                var d = void 0, err = void 0;
                d = isFraction ? Math.round(1 / ratio) : Math.round(ratio);
                if (d < 2 || d > 8)
                  continue;
                if (isFraction)
                  err = Math.abs(clIntervals[_i2] * d - clIntervals[j]);
                else
                  err = Math.abs(clIntervals[_i2] - clIntervals[j] * d);
                var errTreshold = isFraction ? widthTreshold : widthTreshold * d;
                if (err >= errTreshold)
                  continue;
                d = d >= 5 ? 1 : 6 - d;
                clScores[_i2] += d * clSizes[j];
                clScores[j] += d * clSizes[_i2];
              }
            }
            return { clScores, clScoresIdxs };
          }
        }, {
          key: "createTempoList",
          value: function createTempoList(clusters) {
            var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var widthTreshold = params.widthTreshold || 0.025, minBeatInterval = params.minBeatInterval || 0.3, maxBeatInterval = params.maxBeatInterval || 1;
            var clIntervals = clusters.clIntervals, clSizes = clusters.clSizes, clScores = clusters.clScores, clScoresIdxs = clusters.clScoresIdxs, tempoList = [];
            var clCount = clIntervals.length;
            for (var i = 0; i < clScoresIdxs.length; i++) {
              var idx = clScoresIdxs[i];
              var newSum = clIntervals[idx] * clScores[idx];
              var newWeight = clScores[idx];
              var err = void 0, errTreshold = void 0;
              for (var j = 0; j < clCount; j++) {
                if (j == idx)
                  continue;
                var ratio = clIntervals[idx] / clIntervals[j];
                var isFraction = ratio < 1;
                var sumInc = 0;
                var d = isFraction ? Math.round(1 / ratio) : Math.round(ratio);
                if (d < 2 || d > 8)
                  continue;
                if (isFraction) {
                  err = Math.abs(clIntervals[idx] * d - clIntervals[j]);
                  errTreshold = widthTreshold;
                } else {
                  err = Math.abs(clIntervals[idx] - d * clIntervals[j]);
                  errTreshold = widthTreshold * d;
                }
                if (err >= errTreshold)
                  continue;
                if (isFraction) {
                  newSum += clIntervals[j] / d * clScores[j];
                } else {
                  newSum += clIntervals[j] * d * clScores[j];
                }
                newWeight += clScores[j];
              }
              var beat = newSum / newWeight;
              while (beat < minBeatInterval) {
                beat *= 2;
              }
              while (beat > maxBeatInterval) {
                beat /= 2;
              }
              tempoList.push(beat);
            }
            return tempoList;
          }
        }]);
        return TempoInduction2;
      }();
      exports3.default = TempoInduction;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/Agent.js
var require_Agent = __commonJS({
  "node_modules/music-tempo/dist/node/Agent.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports);
        global.Agent = mod.exports;
      }
    })(exports2, function(module3, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
              descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
          if (staticProps)
            defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();
      var Agent = function() {
        function Agent2(tempo, firstBeatTime, firsteventScore, agentList) {
          var params = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {};
          _classCallCheck(this, Agent2);
          this.expiryTime = params.expiryTime || 10;
          this.toleranceWndInner = params.toleranceWndInner || 0.04;
          this.toleranceWndPre = params.toleranceWndPre || 0.15;
          this.toleranceWndPost = params.toleranceWndPost || 0.3;
          this.toleranceWndPre *= tempo;
          this.toleranceWndPost *= tempo;
          this.correctionFactor = params.correctionFactor || 50;
          this.maxChange = params.maxChange || 0.2;
          this.penaltyFactor = params.penaltyFactor || 0.5;
          this.beatInterval = tempo;
          this.initialBeatInterval = tempo;
          this.beatTime = firstBeatTime;
          this.totalBeatCount = 1;
          this.events = [firstBeatTime];
          this.score = firsteventScore;
          this.agentListRef = agentList;
        }
        _createClass(Agent2, [{
          key: "considerEvent",
          value: function considerEvent(eventTime, eventScore) {
            if (eventTime - this.events[this.events.length - 1] > this.expiryTime) {
              this.score = -1;
              return false;
            }
            var beatCount = Math.round((eventTime - this.beatTime) / this.beatInterval);
            var err = eventTime - this.beatTime - beatCount * this.beatInterval;
            if (beatCount > 0 && err >= -this.toleranceWndPre && err <= this.toleranceWndPost) {
              if (Math.abs(err) > this.toleranceWndInner) {
                this.agentListRef.push(this.clone());
              }
              this.acceptEvent(eventTime, eventScore, err, beatCount);
              return true;
            }
            return false;
          }
        }, {
          key: "acceptEvent",
          value: function acceptEvent(eventTime, eventScore, err, beatCount) {
            this.beatTime = eventTime;
            this.events.push(eventTime);
            var corrErr = err / this.correctionFactor;
            if (Math.abs(this.initialBeatInterval - this.beatInterval - corrErr) < this.maxChange * this.initialBeatInterval) {
              this.beatInterval += corrErr;
            }
            this.totalBeatCount += beatCount;
            var errFactor = err > 0 ? err / this.toleranceWndPost : err / -this.toleranceWndPre;
            var scoreFactor = 1 - this.penaltyFactor * errFactor;
            this.score += eventScore * scoreFactor;
          }
        }, {
          key: "fillBeats",
          value: function fillBeats() {
            var prevBeat = void 0, nextBeat = void 0, currentInterval = void 0, beats = void 0;
            prevBeat = 0;
            if (this.events.length > 2) {
              prevBeat = this.events[0];
            }
            for (var i = 0; i < this.events.length; i++) {
              nextBeat = this.events[i];
              beats = Math.round((nextBeat - prevBeat) / this.beatInterval - 0.01);
              currentInterval = (nextBeat - prevBeat) / beats;
              var k = 0;
              for (; beats > 1; beats--) {
                prevBeat += currentInterval;
                this.events.splice(i + k, 0, prevBeat);
                k++;
              }
              prevBeat = nextBeat;
            }
          }
        }, {
          key: "clone",
          value: function clone() {
            var newAgent = new Agent2();
            newAgent.beatInterval = this.beatInterval;
            newAgent.initialBeatInterval = this.initialBeatInterval;
            newAgent.beatTime = this.beatTime;
            newAgent.totalBeatCount = this.totalBeatCount;
            newAgent.events = this.events.slice();
            newAgent.expiryTime = this.expiryTime;
            newAgent.toleranceWndInner = this.toleranceWndInner;
            newAgent.toleranceWndPre = this.toleranceWndPre;
            newAgent.toleranceWndPost = this.toleranceWndPost;
            newAgent.correctionFactor = this.correctionFactor;
            newAgent.maxChange = this.maxChange;
            newAgent.penaltyFactor = this.penaltyFactor;
            newAgent.score = this.score;
            newAgent.agentListRef = this.agentListRef;
            return newAgent;
          }
        }]);
        return Agent2;
      }();
      exports3.default = Agent;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/BeatTracking.js
var require_BeatTracking = __commonJS({
  "node_modules/music-tempo/dist/node/BeatTracking.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports", "./Agent"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2, require_Agent());
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports, global.Agent);
        global.BeatTracking = mod.exports;
      }
    })(exports2, function(module3, exports3, _Agent) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      var _Agent2 = _interopRequireDefault(_Agent);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
              descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
          if (staticProps)
            defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();
      var BeatTracking = function() {
        function BeatTracking2() {
          _classCallCheck(this, BeatTracking2);
        }
        _createClass(BeatTracking2, null, [{
          key: "trackBeat",
          value: function trackBeat(events, eventsScores, tempoList) {
            var params = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
            var initPeriod = params.initPeriod || 5, thresholdBI = params.thresholdBI || 0.02, thresholdBT = params.thresholdBT || 0.04;
            function removeSimilarAgents() {
              agents.sort(function(a1, a2) {
                return a1.beatInterval - a2.beatInterval;
              });
              var length = agents.length;
              for (var i2 = 0; i2 < length; i2++) {
                if (agents[i2].score < 0)
                  continue;
                for (var _j = i2 + 1; _j < length; _j++) {
                  if (agents[_j].beatInterval - agents[i2].beatInterval > thresholdBI) {
                    break;
                  }
                  if (Math.abs(agents[_j].beatTime - agents[i2].beatTime) > thresholdBT) {
                    continue;
                  }
                  if (agents[i2].score < agents[_j].score) {
                    agents[i2].score = -1;
                  } else {
                    agents[_j].score = -1;
                  }
                }
              }
              for (var _i = length - 1; _i >= 0; _i--) {
                if (agents[_i].score < 0) {
                  agents.splice(_i, 1);
                }
              }
            }
            var agents = [];
            for (var i = 0; i < tempoList.length; i++) {
              agents.push(new _Agent2.default(tempoList[i], events[0], eventsScores[0], agents, params));
            }
            var j = 1;
            removeSimilarAgents();
            while (events[j] < initPeriod) {
              var agentsLength = agents.length;
              var prevBeatInterval = -1;
              var isEventAccepted = true;
              for (var k = 0; k < agentsLength; k++) {
                if (agents[k].beatInterval != prevBeatInterval) {
                  if (!isEventAccepted) {
                    agents.push(new _Agent2.default(prevBeatInterval, events[j], eventsScores[j], agents, params));
                  }
                  prevBeatInterval = agents[k].beatInterval;
                  isEventAccepted = false;
                }
                isEventAccepted = agents[k].considerEvent(events[j], eventsScores[j]) || isEventAccepted;
              }
              removeSimilarAgents();
              j++;
            }
            var eventsLength = events.length;
            for (var _i2 = j; _i2 < eventsLength; _i2++) {
              var _agentsLength = agents.length;
              for (var _j2 = 0; _j2 < _agentsLength; _j2++) {
                agents[_j2].considerEvent(events[_i2], eventsScores[_i2]);
              }
              removeSimilarAgents();
            }
            return agents;
          }
        }]);
        return BeatTracking2;
      }();
      exports3.default = BeatTracking;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/FFT.js
var require_FFT = __commonJS({
  "node_modules/music-tempo/dist/node/FFT.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2);
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports);
        global.FFT = mod.exports;
      }
    })(exports2, function(module3, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var _createClass = /* @__PURE__ */ function() {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor)
              descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }
        return function(Constructor, protoProps, staticProps) {
          if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
          if (staticProps)
            defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();
      var FFT = function() {
        function FFT2() {
          _classCallCheck(this, FFT2);
        }
        _createClass(FFT2, null, [{
          key: "getHammingWindow",
          value: function getHammingWindow(bufferSize) {
            var a = 25 / 46;
            var b = 21 / 46;
            var scale = 1 / bufferSize / 0.54;
            var sqrtBufferSize = Math.sqrt(bufferSize);
            var factor = Math.PI * 2 / bufferSize;
            var wnd = [];
            for (var i = 0; i < bufferSize; i++) {
              wnd[i] = sqrtBufferSize * (scale * (a - b * Math.cos(factor * i)));
            }
            return wnd;
          }
        }, {
          key: "getSpectrum",
          value: function getSpectrum(re, im) {
            var direction = -1;
            var n = re.length;
            var bits = Math.round(Math.log(n) / Math.log(2));
            var twoPI = Math.PI * 2;
            if (n != 1 << bits)
              throw new Error("FFT data must be power of 2");
            var localN = void 0;
            var j = 0;
            for (var i = 0; i < n - 1; i++) {
              if (i < j) {
                var temp = re[j];
                re[j] = re[i];
                re[i] = temp;
                temp = im[j];
                im[j] = im[i];
                im[i] = temp;
              }
              var k = n / 2;
              while (k >= 1 && k - 1 < j) {
                j = j - k;
                k = k / 2;
              }
              j = j + k;
            }
            for (var m = 1; m <= bits; m++) {
              localN = 1 << m;
              var Wjk_r = 1;
              var Wjk_i = 0;
              var theta = twoPI / localN;
              var Wj_r = Math.cos(theta);
              var Wj_i = direction * Math.sin(theta);
              var nby2 = localN / 2;
              for (j = 0; j < nby2; j++) {
                for (var _k = j; _k < n; _k += localN) {
                  var id = _k + nby2;
                  var tempr = Wjk_r * re[id] - Wjk_i * im[id];
                  var tempi = Wjk_r * im[id] + Wjk_i * re[id];
                  re[id] = re[_k] - tempr;
                  im[id] = im[_k] - tempi;
                  re[_k] += tempr;
                  im[_k] += tempi;
                }
                var wtemp = Wjk_r;
                Wjk_r = Wj_r * Wjk_r - Wj_i * Wjk_i;
                Wjk_i = Wj_r * Wjk_i + Wj_i * wtemp;
              }
            }
            for (var _i = 0; _i < re.length; _i++) {
              var pow = re[_i] * re[_i] + im[_i] * im[_i];
              re[_i] = pow;
            }
            for (var _i2 = 0; _i2 < re.length; _i2++) {
              re[_i2] = Math.sqrt(re[_i2]);
            }
          }
        }]);
        return FFT2;
      }();
      exports3.default = FFT;
      module3.exports = exports3["default"];
    });
  }
});

// node_modules/music-tempo/dist/node/MusicTempo.js
var require_MusicTempo = __commonJS({
  "node_modules/music-tempo/dist/node/MusicTempo.js"(exports2, module2) {
    init_globals();
    (function(global, factory) {
      if (typeof define === "function" && define.amd) {
        define(["module", "exports", "./OnsetDetection", "./TempoInduction", "./BeatTracking", "./FFT"], factory);
      } else if (typeof exports2 !== "undefined") {
        factory(module2, exports2, require_OnsetDetection(), require_TempoInduction(), require_BeatTracking(), require_FFT());
      } else {
        var mod = {
          exports: {}
        };
        factory(mod, mod.exports, global.OnsetDetection, global.TempoInduction, global.BeatTracking, global.FFT);
        global.MusicTempo = mod.exports;
      }
    })(exports2, function(module3, exports3, _OnsetDetection, _TempoInduction, _BeatTracking, _FFT) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", {
        value: true
      });
      var _OnsetDetection2 = _interopRequireDefault(_OnsetDetection);
      var _TempoInduction2 = _interopRequireDefault(_TempoInduction);
      var _BeatTracking2 = _interopRequireDefault(_BeatTracking);
      var _FFT2 = _interopRequireDefault(_FFT);
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
          default: obj
        };
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      var MusicTempo2 = (
        /**
         * Constructor
         * @param {Float32Array} audioData - non-interleaved IEEE 32-bit linear PCM with a nominal range of -1 -> +1 (Web Audio API - Audio Buffer)
         * @param {Object} [params={}] - parameters
         * @param {Number} [params.bufferSize=2048] - FFT windows size
         * @param {Number} [params.hopSize=441] - spacing of audio frames in samples
         * @param {Number} [params.decayRate=0.84] - how quickly previous peaks are forgotten
         * @param {Number} [params.peakFindingWindow=6] - minimum distance between peaks
         * @param {Number} [params.meanWndMultiplier=3] - multiplier for peak finding window
         * @param {Number} [params.peakThreshold=0.35] - minimum value of peaks
         * @param {Number} [params.widthTreshold=0.025] - the maximum difference in IOIs which are in the same cluster
         * @param {Number} [params.maxIOI=2.5] - the maximum IOI for inclusion in a cluster
         * @param {Number} [params.minIOI=0.07] - the minimum IOI for inclusion in a cluster
         * @param {Number} [params.maxTempos=10] - initial amount of tempo hypotheses
         * @param {Number} [params.minBeatInterval=0.3] - the minimum inter-beat interval (IBI) (0.30 seconds == 200 BPM)
         * @param {Number} [params.maxBeatInterval=1] - the maximum inter-beat interval (IBI) (1.00 seconds ==  60 BPM)
         * @param {Number} [params.initPeriod=5] - duration of the initial section
         * @param {Number} [params.thresholdBI=0.02] - for the purpose of removing duplicate agents, the default JND of IBI
         * @param {Number} [params.thresholdBT=0.04] - for the purpose of removing duplicate agents, the default JND of phase
         * @param {Number} [params.expiryTime=10] - the time after which an Agent that has not accepted any beat will be destroyed
         * @param {Number} [params.toleranceWndInner=0.04] - the maximum time that a beat can deviate from the predicted beat time without a fork occurring
         * @param {Number} [params.toleranceWndPre=0.15] - the maximum amount by which a beat can be earlier than the predicted beat time, expressed as a fraction of the beat period
         * @param {Number} [params.toleranceWndPost=0.3] - the maximum amount by which a beat can be later than the predicted beat time, expressed as a fraction of the beat period
         * @param {Number} [params.correctionFactor=50] - correction factor for updating beat period
         * @param {Number} [params.maxChange=0.2] - the maximum allowed deviation from the initial tempo, expressed as a fraction of the initial beat period
         * @param {Number} [params.penaltyFactor=0.5] - factor for correcting score, if onset do not coincide precisely with predicted beat time
         */
        function MusicTempo3(audioData) {
          var _this = this;
          var params = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
          _classCallCheck(this, MusicTempo3);
          if (audioData instanceof Float32Array) {
            if (!Array.from) {
              Array.from = function() {
                var toStr = Object.prototype.toString;
                var isCallable = function isCallable2(fn) {
                  return typeof fn === "function" || toStr.call(fn) === "[object Function]";
                };
                var toInteger = function toInteger2(value) {
                  var number = Number(value);
                  if (isNaN(number)) {
                    return 0;
                  }
                  if (number === 0 || !isFinite(number)) {
                    return number;
                  }
                  return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
                };
                var maxSafeInteger = Math.pow(2, 53) - 1;
                var toLength = function toLength2(value) {
                  var len = toInteger(value);
                  return Math.min(Math.max(len, 0), maxSafeInteger);
                };
                return function from(arrayLike) {
                  var C = this;
                  var items = Object(arrayLike);
                  if (arrayLike == null) {
                    throw new TypeError("Array.from requires an array-like object - not null or undefined");
                  }
                  var mapFn = arguments.length > 1 ? arguments[1] : void 0;
                  var T;
                  if (typeof mapFn !== "undefined") {
                    if (!isCallable(mapFn)) {
                      throw new TypeError("Array.from: when provided, the second argument must be a function");
                    }
                    if (arguments.length > 2) {
                      T = arguments[2];
                    }
                  }
                  var len = toLength(items.length);
                  var A = isCallable(C) ? Object(new C(len)) : new Array(len);
                  var k = 0;
                  var kValue;
                  while (k < len) {
                    kValue = items[k];
                    if (mapFn) {
                      A[k] = typeof T === "undefined" ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                    } else {
                      A[k] = kValue;
                    }
                    k += 1;
                  }
                  A.length = len;
                  return A;
                };
              }();
            }
            audioData = Array.from(audioData);
          } else if (!Array.isArray(audioData)) {
            throw "audioData is not an array";
          }
          var timeStep = params.timeStep || 0.01;
          var res = _OnsetDetection2.default.calculateSF(audioData, _FFT2.default, params);
          this.spectralFlux = res;
          _OnsetDetection2.default.normalize(this.spectralFlux);
          this.peaks = _OnsetDetection2.default.findPeaks(this.spectralFlux, params);
          this.events = this.peaks.map(function(a) {
            return a * timeStep;
          });
          var clusters = _TempoInduction2.default.processRhythmicEvents(this.events, params);
          clusters = _TempoInduction2.default.mergeClusters(clusters, params);
          var scores = _TempoInduction2.default.calculateScore(clusters, params);
          clusters = {
            clIntervals: clusters.clIntervals,
            clSizes: clusters.clSizes,
            clScores: scores.clScores,
            clScoresIdxs: scores.clScoresIdxs
          };
          this.tempoList = _TempoInduction2.default.createTempoList(clusters, params);
          var minSFValue = this.spectralFlux.reduce(function(a, b) {
            return Math.min(a, b);
          });
          var eventsScores = this.peaks.map(function(a) {
            return _this.spectralFlux[a] - minSFValue;
          });
          this.agents = _BeatTracking2.default.trackBeat(this.events, eventsScores, this.tempoList, params);
          var bestScore = -1;
          var idxBestAgent = -1;
          this.tempo = -1;
          this.beats = [];
          this.beatInterval = -1;
          for (var i = 0; i < this.agents.length; i++) {
            if (this.agents[i].score > bestScore) {
              bestScore = this.agents[i].score;
              idxBestAgent = i;
            }
          }
          if (this.agents[idxBestAgent]) {
            this.bestAgent = this.agents[idxBestAgent];
            this.bestAgent.fillBeats();
            this.tempo = (60 / this.bestAgent.beatInterval).toFixed(3);
            this.beatInterval = this.bestAgent.beatInterval;
            this.beats = this.bestAgent.events;
          }
          if (this.tempo == -1) {
            throw "Tempo extraction failed";
          }
        }
      );
      exports3.default = MusicTempo2;
      module3.exports = exports3["default"];
    });
  }
});

// src/analysis-mp3.js
var analysis_mp3_exports = {};
__export(analysis_mp3_exports, {
  analyzeAudio: () => analyzeAudio
});
module.exports = __toCommonJS(analysis_mp3_exports);
init_globals();

// node_modules/mpg123-decoder/index.js
init_globals();

// node_modules/mpg123-decoder/src/MPEGDecoder.js
init_globals();

// node_modules/@wasm-audio-decoders/common/index.js
init_globals();

// node_modules/@wasm-audio-decoders/common/src/WASMAudioDecoderCommon.js
init_globals();

// node_modules/simple-yenc/dist/esm.js
init_globals();
var t = (t2, n = 4294967295, e2 = 79764919) => {
  const r = new Int32Array(256);
  let o, s, i, c = n;
  for (o = 0; o < 256; o++) {
    for (i = o << 24, s = 8; s > 0; --s)
      i = 2147483648 & i ? i << 1 ^ e2 : i << 1;
    r[o] = i;
  }
  for (o = 0; o < t2.length; o++)
    c = c << 8 ^ r[255 & (c >> 24 ^ t2[o])];
  return c;
};
var e = (n, e2 = t) => {
  const r = (t2) => new Uint8Array(t2.length / 2).map((n2, e3) => parseInt(t2.substring(2 * e3, 2 * (e3 + 1)), 16)), o = (t2) => r(t2)[0], s = /* @__PURE__ */ new Map();
  [, 8364, , 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, , 381, , , 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, , 382, 376].forEach((t2, n2) => s.set(t2, n2));
  const i = new Uint8Array(n.length);
  let c, a, l, f = false, g = 0, h = 42, p = n.length > 13 && "dynEncode" === n.substring(0, 9), u = 0;
  p && (u = 11, a = o(n.substring(9, u)), a <= 1 && (u += 2, h = o(n.substring(11, u))), 1 === a && (u += 8, l = ((t2) => new DataView(r(t2).buffer).getInt32(0, true))(n.substring(13, u))));
  const d = 256 - h;
  for (let t2 = u; t2 < n.length; t2++)
    if (c = n.charCodeAt(t2), 61 !== c || f) {
      if (92 === c && t2 < n.length - 5 && p) {
        const e3 = n.charCodeAt(t2 + 1);
        117 !== e3 && 85 !== e3 || (c = parseInt(n.substring(t2 + 2, t2 + 6), 16), t2 += 5);
      }
      if (c > 255) {
        const t3 = s.get(c);
        t3 && (c = t3 + 127);
      }
      f && (f = false, c -= 64), i[g++] = c < h && c > 0 ? c + d : c - h;
    } else
      f = true;
  const m = i.subarray(0, g);
  if (p && 1 === a) {
    const t2 = e2(m);
    if (t2 !== l) {
      const n2 = "Decode failed crc32 validation";
      throw console.error("`simple-yenc`\n", n2 + "\n", "Expected: " + l + "; Got: " + t2 + "\n", "Visit https://github.com/eshaz/simple-yenc for more information"), Error(n2);
    }
  }
  return m;
};

// node_modules/@wasm-audio-decoders/common/src/WASMAudioDecoderCommon.js
function WASMAudioDecoderCommon() {
  const uint8Array = Uint8Array;
  const float32Array = Float32Array;
  if (!WASMAudioDecoderCommon.modules) {
    Object.defineProperties(WASMAudioDecoderCommon, {
      modules: {
        value: /* @__PURE__ */ new WeakMap()
      },
      setModule: {
        value(Ref, module2) {
          WASMAudioDecoderCommon.modules.set(Ref, Promise.resolve(module2));
        }
      },
      getModule: {
        value(Ref, wasmString) {
          let module2 = WASMAudioDecoderCommon.modules.get(Ref);
          if (!module2) {
            if (!wasmString) {
              wasmString = Ref.wasm;
              module2 = WASMAudioDecoderCommon.inflateDynEncodeString(
                wasmString
              ).then((data) => WebAssembly.compile(data));
            } else {
              module2 = WebAssembly.compile(e(wasmString));
            }
            WASMAudioDecoderCommon.modules.set(Ref, module2);
          }
          return module2;
        }
      },
      concatFloat32: {
        value(buffers, length) {
          let ret = new float32Array(length), i = 0, offset = 0;
          while (i < buffers.length) {
            ret.set(buffers[i], offset);
            offset += buffers[i++].length;
          }
          return ret;
        }
      },
      getDecodedAudio: {
        value: (errors, channelData, samplesDecoded, sampleRate, bitDepth) => ({
          errors,
          channelData,
          samplesDecoded,
          sampleRate,
          bitDepth
        })
      },
      getDecodedAudioMultiChannel: {
        value(errors, input, channelsDecoded, samplesDecoded, sampleRate, bitDepth) {
          let channelData = [], i, j;
          for (i = 0; i < channelsDecoded; i++) {
            const channel = [];
            for (j = 0; j < input.length; )
              channel.push(input[j++][i] || []);
            channelData.push(
              WASMAudioDecoderCommon.concatFloat32(channel, samplesDecoded)
            );
          }
          return WASMAudioDecoderCommon.getDecodedAudio(
            errors,
            channelData,
            samplesDecoded,
            sampleRate,
            bitDepth
          );
        }
      },
      /*
       ******************
       * Compression Code
       ******************
       */
      inflateDynEncodeString: {
        value(source) {
          source = e(source);
          return new Promise((resolve) => {
            const puffString = String.raw`dynEncode012804c7886d()((()>+*§§)§,§§§§)§+§§§)§+.-()(*)-+)(.7*§)i¸¸,3§(i¸¸,3/G+.¡*(,(,3+)2å:-),§H(P*DI*H(P*@I++hH)H*r,hH(H(P*<J,i)^*<H,H(P*4U((I-H(H*i0J,^*DH+H-H*I+H,I*4)33H(H*H)^*DH(H+H)^*@H+i§H)i§3æ*).§K(iHI/+§H,iHn,§H+i(H+i(rCJ0I,H*I-+hH,,hH(H-V)(i)J.H.W)(i)c)(H,i)I,H-i*I-4)33i(I.*hH(V)(H+n5(H(i*I-i(I,i)I.+hH,i*J+iHn,hi(I-i*I,+hH,H/H-c)(H,iFn,hi(I,+hH,H0n5-H*V)(J(,hH/H(i)J(H(V)(J(i)c)(H)H(i)H,c)(3H*i*I*H,i)I,4(3(-H(H,W)(H-I-H,i*I,4)3(3(3H,H-I1H+I,H.i)H1V)(J.i(v5(33H.-H(H,i(c)(H,i*I,4)333)-§i*I*+§H*iHn,hi73H,H(i)8(H+J+H)P*(H*V)(J-r,§H)P*,H.i)H+H,i)V)(-H*i*I*H+i)I+H-H.I.H,H-i)I,4)333Ã+)-§iø7i(^*(iü7I,*h+hH+iDn,h*hilI+i)I,+hH+,hH+iô7H,c)(i)H+i´8W)(H,I,H+i*I+4)-+hH(H)8*J-i(p5.*h*h*hH-i')u,hH(P*(J+,hH(P*0J,H(P*,n50H+H,H-b((3H(P*0i)I.4)3H-i¨*n5*H-iÅ*s,hi73H-i)J+V)&+I,H(H+V)æ,8(I.H(H*8*J-i(p51H-i)J+i¸7V)(H(H+iø7V)(8(J/H(P*0J+s,hi73H+H,H.J,I.H(P*(m5(H.H(P*,s5.+hH,m5*H(P*(J.H+H.H+H/U((b((H(H(P*0i)J+^*0H,i)I,4(3(3H(H.^*03H-i¨*o5)33i(73(3(3-H,H+i)c)(H,i*I,H+i)I+4)33i)I-3H-3!2)0§K(i2J,L(H,H(^*(H,H*^*4H,i(^*0H,i(^*DH,j(_*<H,H)P*(^*,H,H+P*(^*8*h*h+hH,i)8(I3i§I**h*h*h*h*h*h*hH,i*8(6+(),03H,j(_*@i*I-H,P*<J.i,J(H,P*8J/s50H,H.i+J0^*<i¦I*H.H,P*4J1J.U(*H.U((J2i')o5/H.U()I.H,H(^*<H0H1U((H.i0J.i§i0i')o5/H/H.H2J*H(J.q50H,P*0J/H*I-H,P*(J0,hH,P*,H-q,hi)I-423+hH*m5+H/H0H(H1U((b((H/i)I/H(i)I(H*i)I*4(3(3H,H.^*<H,H-^*04*3iØ1U((5+i(I(i¨7i1^*(i$6iè1^*(i°7iè6^*(i¬7iÈ6^*(+hH(iÈ*n,hiÈ*I(+hH(i¨,n,hi¨,I(+hH(iØ,n,hiØ,I(+hH(iè,o,hH,i-H(i0c)(H(i*I(4)33iè1i1H,i-iÈ*8)Bi(I(+hH(ido,hH,i-H(i-c)(H(i*I(4)33iÈ6iè6H,i-iF8)BiØ1i)b((41-H,i-H(i/c)(H(i*I(4)3(3(-H,i-H(i1c)(H(i*I(4)3(3(-H,i-H(i0c)(H(i*I(4)3(3(3H,H/^*0H,H(^*<3i(I*4*3H,H,i¸)^*TH,H,iø-^*PH,H,iX^*LH,H,i(^*HH,i-8(I(H,i-8(I-i¥I*H,i,8(I.H(iErH-iEr5)H(i©*I1H-i)I0i(i;H.i,J(i(H(i(rCJ(J*H*i;sCI*i¨1I-H(I/+hH/,hH,i-H-V)(i)H,i+8(c)(H/i)I/H-i*I-H*i)I*4)-H(i)i¨1I/+hH(H*o,hH,i-H/V)(i)i(c)(H/i*I/H(i)I(4)33i¤I*H,iø-H,i¸)H,i-i;8)5+H0H1I2i(I-+hH-H2p,hH,H,iP8*J*i(p5-H*i7u,hH,i-H-i)H*c)(H-i)I-4*3i(I/i+I.i+I(*h*h*hH*i86*(*)3H-m,hi£I*403H-i)H,W)-I/i*I(4)3i3I.i/I(3H2H,H(8(H.J(H-J.p,hi¢I*4.3H,i-H-i)I*+hH(,hH*H/c)(H*i*I*H(i)I(4)-H.I-4+3(3(33H,W)1m,hiI*4,3H,iø-H,i¸)H,i-H18)J(,hi¡I*H(i(p5,H1H,V)ú-H,V)ø-o5,3H,i(H,iXH,i-H1i)H08)J(,hi I*H(i(p5,H0H,V)H,V)o5,3H,H,iPH,iH8+I*4+3(3(3H,i$6i¬78+I*3H*H3m5(3i)I-H*i(r5)3H)H,P*0^*(H+H,P*<^*(H*I-3H,i2L(H-33Á)+(i¨03b+(,(-(.(/(0(1(2(3(5(7(9(;(?(C(G(K(S([(c(k({(((«(Ë(ë((*)(iø03O)()()()(*(*(*(*(+(+(+(+(,(,(,(,(-(-(-(-(i¨13M8(9(:(((0(/(1(.(2(-(3(,(4(+(5(*(6()(7(T7*S7US0U `;
            WASMAudioDecoderCommon.getModule(WASMAudioDecoderCommon, puffString).then((wasm) => WebAssembly.instantiate(wasm, {})).then(({ exports: exports2 }) => {
              const instanceExports = new Map(Object.entries(exports2));
              const puff = instanceExports.get("puff");
              const memory = instanceExports.get("memory")["buffer"];
              const dataArray = new uint8Array(memory);
              const heapView = new DataView(memory);
              let heapPos = instanceExports.get("__heap_base");
              const sourceLength = source.length;
              const sourceLengthPtr = heapPos;
              heapPos += 4;
              heapView.setInt32(sourceLengthPtr, sourceLength, true);
              const sourcePtr = heapPos;
              heapPos += sourceLength;
              dataArray.set(source, sourcePtr);
              const destLengthPtr = heapPos;
              heapPos += 4;
              heapView.setInt32(
                destLengthPtr,
                dataArray.byteLength - heapPos,
                true
              );
              puff(heapPos, destLengthPtr, sourcePtr, sourceLengthPtr);
              resolve(
                dataArray.slice(
                  heapPos,
                  heapPos + heapView.getInt32(destLengthPtr, true)
                )
              );
            });
          });
        }
      }
    });
  }
  Object.defineProperty(this, "wasm", {
    enumerable: true,
    get: () => this._wasm
  });
  this.getOutputChannels = (outputData, channelsDecoded, samplesDecoded) => {
    let output = [], i = 0;
    while (i < channelsDecoded)
      output.push(
        outputData.slice(
          i * samplesDecoded,
          i++ * samplesDecoded + samplesDecoded
        )
      );
    return output;
  };
  this.allocateTypedArray = (len, TypedArray, setPointer = true) => {
    const ptr = this._wasm.malloc(TypedArray.BYTES_PER_ELEMENT * len);
    if (setPointer)
      this._pointers.add(ptr);
    return {
      ptr,
      len,
      buf: new TypedArray(this._wasm.HEAP, ptr, len)
    };
  };
  this.free = () => {
    this._pointers.forEach((ptr) => {
      this._wasm.free(ptr);
    });
    this._pointers.clear();
  };
  this.codeToString = (ptr) => {
    const characters = [], heap = new Uint8Array(this._wasm.HEAP);
    for (let character = heap[ptr]; character !== 0; character = heap[++ptr])
      characters.push(character);
    return String.fromCharCode.apply(null, characters);
  };
  this.addError = (errors, message, frameLength, frameNumber, inputBytes, outputSamples) => {
    errors.push({
      message,
      frameLength,
      frameNumber,
      inputBytes,
      outputSamples
    });
  };
  this.instantiate = (_EmscriptenWASM, _module) => {
    if (_module)
      WASMAudioDecoderCommon.setModule(_EmscriptenWASM, _module);
    this._wasm = new _EmscriptenWASM(WASMAudioDecoderCommon).instantiate();
    this._pointers = /* @__PURE__ */ new Set();
    return this._wasm.ready.then(() => this);
  };
}

// node_modules/@wasm-audio-decoders/common/src/WASMAudioDecoderWorker.js
init_globals();
var import_web_worker = __toESM(require_web_worker(), 1);
var getWorker = () => globalThis.Worker || import_web_worker.default;
var WASMAudioDecoderWorker = class extends getWorker() {
  constructor(options, name, Decoder, EmscriptenWASM2) {
    if (!WASMAudioDecoderCommon.modules)
      new WASMAudioDecoderCommon();
    let source = WASMAudioDecoderCommon.modules.get(Decoder);
    if (!source) {
      let type = "text/javascript", isNode, webworkerSourceCode = `'use strict';(${((_Decoder, _WASMAudioDecoderCommon, _EmscriptenWASM) => {
        let decoder, moduleResolve, modulePromise = new Promise((resolve) => {
          moduleResolve = resolve;
        });
        self.onmessage = ({ data: { id, command, data } }) => {
          let messagePromise = modulePromise, messagePayload = { id }, transferList;
          if (command === "init") {
            Object.defineProperties(_Decoder, {
              WASMAudioDecoderCommon: { value: _WASMAudioDecoderCommon },
              EmscriptenWASM: { value: _EmscriptenWASM },
              module: { value: data.module },
              isWebWorker: { value: true }
            });
            decoder = new _Decoder(data.options);
            moduleResolve();
          } else if (command === "free") {
            decoder.free();
          } else if (command === "ready") {
            messagePromise = messagePromise.then(() => decoder.ready);
          } else if (command === "reset") {
            messagePromise = messagePromise.then(() => decoder.reset());
          } else {
            Object.assign(
              messagePayload,
              decoder[command](
                // detach buffers
                Array.isArray(data) ? data.map((data2) => new Uint8Array(data2)) : new Uint8Array(data)
              )
            );
            transferList = messagePayload.channelData ? messagePayload.channelData.map((channel) => channel.buffer) : [];
          }
          messagePromise.then(
            () => self.postMessage(messagePayload, transferList)
          );
        };
      }).toString()})(${Decoder}, ${WASMAudioDecoderCommon}, ${EmscriptenWASM2})`;
      try {
        isNode = typeof process.versions.node !== "undefined";
      } catch {
      }
      source = isNode ? `data:${type};base64,${Buffer.from(webworkerSourceCode).toString(
        "base64"
      )}` : URL.createObjectURL(new Blob([webworkerSourceCode], { type }));
      WASMAudioDecoderCommon.modules.set(Decoder, source);
    }
    super(source, { name });
    this._id = Number.MIN_SAFE_INTEGER;
    this._enqueuedOperations = /* @__PURE__ */ new Map();
    this.onmessage = ({ data }) => {
      const { id, ...rest } = data;
      this._enqueuedOperations.get(id)(rest);
      this._enqueuedOperations.delete(id);
    };
    new EmscriptenWASM2(WASMAudioDecoderCommon).getModule().then((module2) => {
      this.postToDecoder("init", { module: module2, options });
    });
  }
  async postToDecoder(command, data) {
    return new Promise((resolve) => {
      this.postMessage({
        command,
        id: this._id,
        data
      });
      this._enqueuedOperations.set(this._id++, resolve);
    });
  }
  get ready() {
    return this.postToDecoder("ready");
  }
  async free() {
    await this.postToDecoder("free").finally(() => {
      this.terminate();
    });
  }
  async reset() {
    await this.postToDecoder("reset");
  }
};

// node_modules/@wasm-audio-decoders/common/src/utilities.js
init_globals();
var assignNames = (Class, name) => {
  Object.defineProperty(Class, "name", { value: name });
};

// node_modules/mpg123-decoder/src/EmscriptenWasm.js
init_globals();
function EmscriptenWASM(WASMAudioDecoderCommon2) {
  var Module = Module;
  var out = (text) => console.log(text);
  var err = (text) => console.error(text);
  function ready() {
  }
  Module = {};
  function abort(what) {
    throw what;
  }
  var HEAP8, HEAP16, HEAP32, HEAPU8, HEAPU16, HEAPU32, HEAPF32, HEAPF64, HEAP64, HEAPU64, wasmMemory;
  function updateMemoryViews() {
    var b = wasmMemory.buffer;
    HEAP8 = new Int8Array(b);
    HEAP16 = new Int16Array(b);
    HEAPU8 = new Uint8Array(b);
    HEAPU16 = new Uint16Array(b);
    HEAP32 = new Int32Array(b);
    HEAPU32 = new Uint32Array(b);
    HEAPF32 = new Float32Array(b);
    HEAPF64 = new Float64Array(b);
    HEAP64 = new BigInt64Array(b);
    HEAPU64 = new BigUint64Array(b);
  }
  var base64Decode = (b64) => {
    var b1, b2, i2 = 0, j = 0, bLength = b64.length;
    var output = new Uint8Array((bLength * 3 >> 2) - (b64[bLength - 2] == "=") - (b64[bLength - 1] == "="));
    for (; i2 < bLength; i2 += 4, j += 3) {
      b1 = base64ReverseLookup[b64.charCodeAt(i2 + 1)];
      b2 = base64ReverseLookup[b64.charCodeAt(i2 + 2)];
      output[j] = base64ReverseLookup[b64.charCodeAt(i2)] << 2 | b1 >> 4;
      output[j + 1] = b1 << 4 | b2 >> 2;
      output[j + 2] = b2 << 6 | base64ReverseLookup[b64.charCodeAt(i2 + 3)];
    }
    return output;
  };
  function _INT123_compat_close() {
    abort("missing function: INT123_compat_close");
  }
  _INT123_compat_close.stub = true;
  var __abort_js = () => abort("");
  var __emscripten_runtime_keepalive_clear = () => {
  };
  var timers = {};
  var callUserCallback = (func) => func();
  var _emscripten_get_now = () => performance.now();
  var __setitimer_js = (which, timeout_ms) => {
    if (timers[which]) {
      clearTimeout(timers[which].id);
      delete timers[which];
    }
    if (!timeout_ms)
      return 0;
    var id = setTimeout(() => {
      delete timers[which];
      callUserCallback(() => __emscripten_timeout(which, _emscripten_get_now()));
    }, timeout_ms);
    timers[which] = {
      id,
      timeout_ms
    };
    return 0;
  };
  var _emscripten_resize_heap = (requestedSize) => {
    var oldSize = HEAPU8.length;
    requestedSize >>>= 0;
    return false;
  };
  var _fd_close = (fd) => 52;
  var _fd_read = (fd, iov, iovcnt, pnum) => 52;
  var INT53_MAX = 9007199254740992;
  var INT53_MIN = -9007199254740992;
  var bigintToI53Checked = (num) => num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);
  function _fd_seek(fd, offset, whence, newOffset) {
    offset = bigintToI53Checked(offset);
    return 70;
  }
  var printCharBuffers = [null, [], []];
  var UTF8Decoder = new TextDecoder();
  var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (heapOrArray[endPtr] && !(endPtr >= endIdx))
      ++endPtr;
    return UTF8Decoder.decode(heapOrArray.buffer ? heapOrArray.subarray(idx, endPtr) : new Uint8Array(heapOrArray.slice(idx, endPtr)));
  };
  var printChar = (stream, curr) => {
    var buffer = printCharBuffers[stream];
    if (curr === 0 || curr === 10) {
      (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
      buffer.length = 0;
    } else {
      buffer.push(curr);
    }
  };
  var _fd_write = (fd, iov, iovcnt, pnum) => {
    var num = 0;
    for (var i2 = 0; i2 < iovcnt; i2++) {
      var ptr = HEAPU32[iov >> 2];
      var len = HEAPU32[iov + 4 >> 2];
      iov += 8;
      for (var j = 0; j < len; j++) {
        printChar(fd, HEAPU8[ptr + j]);
      }
      num += len;
    }
    HEAPU32[pnum >> 2] = num;
    return 0;
  };
  var _proc_exit = (code2) => {
    throw `exit(${code2})`;
  };
  for (var base64ReverseLookup = new Uint8Array(123), i = 25; i >= 0; --i) {
    base64ReverseLookup[48 + i] = 52 + i;
    base64ReverseLookup[65 + i] = i;
    base64ReverseLookup[97 + i] = 26 + i;
  }
  base64ReverseLookup[43] = 62;
  base64ReverseLookup[47] = 63;
  var wasmImports = {
    /** @export */
    "j": _INT123_compat_close,
    /** @export */
    "c": __abort_js,
    /** @export */
    "b": __emscripten_runtime_keepalive_clear,
    /** @export */
    "d": __setitimer_js,
    /** @export */
    "e": _emscripten_resize_heap,
    /** @export */
    "g": _fd_close,
    /** @export */
    "h": _fd_read,
    /** @export */
    "i": _fd_seek,
    /** @export */
    "f": _fd_write,
    /** @export */
    "a": _proc_exit
  };
  function assignWasmExports(wasmExports) {
    _malloc = wasmExports["m"];
    _free = wasmExports["n"];
    _mpeg_frame_decoder_create = wasmExports["p"];
    _mpeg_decoder_feed = wasmExports["q"];
    _mpeg_decoder_read = wasmExports["r"];
    _mpeg_frame_decoder_destroy = wasmExports["s"];
    __emscripten_timeout = wasmExports["t"];
  }
  var _malloc, _free, _mpeg_frame_decoder_create, _mpeg_decoder_feed, _mpeg_decoder_read, _mpeg_frame_decoder_destroy, __emscripten_timeout;
  function initRuntime(wasmExports) {
    wasmExports["l"]();
  }
  if (!EmscriptenWASM.wasm)
    Object.defineProperty(EmscriptenWASM, "wasm", { get: () => String.raw`dynEncode01dd21c54d17j¢>¡-é!Dt 9&W U§®}»/6|ºì,ÜÐ*ÝÙÂ:C#ÈEÅõkµÄqÁ¹BCdq$GPPxÚý¾ý­B{jð=M¸ìOÑ-Ia,¢áÅ	Ó®µôEù= *f®Ø"þèÒ ËøÓÉÄàó«¤¡ù|þ«ôñ«´ÁÜú¤«ìe«p±§W6(¶¢ÏÑIZ»¥'T28òÞ6<±*h²ëHñ'q­©ññ+9LÏ8n'!ò©åP.Þot__¹§ü 0J]ío Zï óÚºM´õjÈ¿n)å½ðN\]óÐÖ]±<¿_>»5Ûÿ-'2[HÕo×m}&­xÎÿú&ôì¯ /ý§iÂÐÈRB÷¸M°G÷;;T8kB7Ã¯QûzL´¨ÛÍD9$EnA¶¸ûÃv4òCûã¨¾YcÐ>t2çZéÂ{¬½«K­ØB6cvpR=}vªã4ÀP¿Ø»ä4ûwÑ½®üªä~Ô±CÇJÓª±.NÉ\*±8jècª= |_VÃK×ã2)§}¼gb/!ôÀV~:0-ÈÀu²Ì/@LO*ÃL1?çRM ljÀw
K<î	¼G$ýÂ¿¸É´g¢ô°rTªS¨Ð²éfªm½y
|~¦À?Ä;Ä¡gmjê'IhÅüO0b¢¹1ÜÎhj÷ÓÚ:rþ^KÓYÙºÊ¹«IÚ
Ú©»WõªÁÞ\vvw+Ô^¤hÄ|´Dl*6¹2ÌðPF¼)\HQcQu%Ê,Jd¾7«Ô=Mº®nø½ÞÈö6×­Á?ì EôQÞ¡éRÝ¡W*muú®¨ ñsÊWÂÌ5Î= v[x¨}\¦Æã£Q>wÀBÁ×(~;Þcí¹«
µËMµ;×ý¢¬²ùä#ÎöúëÆê<|Z,ªq1ldõtpNnÑL³k?Ü=M ¡Eõ¢ñVYÏ þH_Bî)/¦'aP= Ôæ|vWh ÎKQºP¬l¾ß®mñ9ÊA¥»-BN*´.bÎ)SÚ!AY?b=}Ù/ii·J9+cRòô
Î¤íÐäsÊsùH43í~¢±_r¦Îrýâ~d8c¨ÇMéBaJ-geÔz
 õPðð¿ç§d'´1; {ÑÄÐßëvïuøOªf2ð¿áâ9ú¢)=M2Î=Mí}YíUbia½øy9Ø'{Rud Éß$Ïi=Ma±n·ìæ(®¤ûÑz9k+íB©ÀòÑ¿ÕÇ*®ò[.¤íûF~¾~PËX¤7ãÚTE­N=}¡?½E«Â(c#§	åq4gQzx÷±[
hë¡eYÌ9] ÀGû¯¦õ0DÖmC=MF³XpÈ¾XéÔÏRØïwµð¨ÉrH~ô8ÂêxéÆ«g+oQXÌËïvòpØ=M)/"T'48!QòÑ¾ré½òR=MPx®5Ë»ó= à?k$?Vª= ¸Iæ§gY;ÈQ®q¹¼"t¹§;	ÛKÖ= VtéjÃ(ÖaM9Ú3°ËTÃ3ë=M¼ÉâÐ8V¥«Ðë¬|òX3¯ÐâIËzb}h&~ÏÙÄ§dÃMBL¢W= vÁÇ&ÏNÉ	1²_èÆðÔ£.%3¹ùÞ^9]i^5ß{¢3{2¡Î;pmþænû?Uï:Zs0£	o7âëü2µhý9f×I]>bd ÃY6Ù$ªâ8L=M/´ôÔ~XMºM:@ÚçW?× ÁóË]Ð\ÜæÑF¥7. EXU? ÝxØ²ËïËªÐÈó¸3y!Q¸*H¼ð¨·cèâÉ´ 8bÛW<Ó6§ÈgòñÌ& ä;;ÌÄ9 ×³þ(\,zþj}zS6}µlkñ4þpêñ?0¹´zõíoÜL¹n¿ÜäÕL×[MZ>ÁKæµIØ¥pÀù¦Ï ¼ºòÏ«ð¯öþÞ$-
nm;hÄzEL´9¼Ìû ÅµºÎ¥½Â©»~>µzt[¼É	NèUÈ­fØÔn£Ç]e?¬ogM¸»ïM.}:ßñÄðã¥½á<$KÝ¾×^ý¹¤ÐMètÌZ þÏcX= m­Éqâ%ãa°d×
ZÌA*¼L|àýw,ØnÑ&+"]ìÂÏ(/Ñÿ	
ü£#bÊî´[?Ñ'¼ É>L¶yÏwÔBTNÚÔ]÷V»v7	Ã_^çwhshÊ= N´¯ØõxJ Ø½ÊØi
Æ?èÇ"X¥¾ð§Z<0îA¶õXXËÒûÞÆ[=}õ
Ç5ÙUùLìÿÙ¦*LáôöÚ·éXö@,ØF¨JY¹(õßOû~÷LÒkjU @]%«Ì= .ý ½8¶ÉØúlqü5ðWÿë@ÌOöS¥¦q
D¸DX$Ðý-D¥®Ç0ëjÌ4F)%¥µ/kçj­E1Î¾È·Òr÷ë½CÔ-h&ðÅ:?¿;A?elB¢ë' õãwZwüI÷Ã&çêh<xYñÒÿÐ©=}>Á¸L°8u¥÷S'º(ND½ú2YYü÷4AYÓ»Y¥©ß°½xuæJS½c´pbiucb©Ç^­¤cÙ#¥û~X9éÓnI/óøæ!OcÇLëSqg¬7®úkê¬ù~ã+¶MEö£i>Ýh	4h6ª(¢¿+ûÒùYÉù³B<\ùèÜBO¢wUo³up	£x/¢ñaÊ¶nÿv>^èÃ2Oüª®o[ù?PN%Ã¿¥úýü0¦M§HÍ)¡ÈÊ>ueÞêJ<ø­RÐLº]ÆÝàãcï¢
ô_äéË*v;ªñ±Ú"é[= [^.]OÀ%·° 5lÁr6;À3<IÄLÄôÔÓö yùÐzßH·U´= ]| @CãÌ¬¤IåÀPÔZ²w²§dã*.42ÔQTR4ªÁ×WÔÓNâ&«À®(jâø(´r0Iíc_µ,ªñsÈ["Æ. ?­Bj7#êTÚKÎ8ÜT7HUØ,Û o= ªs®=}Y¿<<uXJHÕrü×£Öô9ÍAáªÃD¿Pq÷ÒwÕ03]ò5 Ø´Ôê²ü^pkÈÚÆjðôâñêzwÜè»sÿ|xX¿Ëµ÷ëÁ¬L´Î¤wàÇä­4x½(3:0ÂËU¤ûê÷{öáÀH®<QÙx¾ÇôèBÌÔ4´#mÞÕ­Û¤ òch¨d¬\¹æ)õªC>Ó*ed]§níö¸?lJóC^fwÅí¡§~ä<T@¸§ZTû[grÖptòÅîñO¼|WØ©æ=M,,ïx?^À7ÔúYPó@ì 75«JFhÜèMáTWeÆò=}3e¤xÇeú1Y«ùÑ½'$ÑuüDû±tJfþvHV	´ëê=}À¡~Ñ´kíå|W#¬ÊÙ¾=}ùß<Pà
V±aæA¡¯}ä#w×A¶´SxûëívÉàSXãë)êq9S9¼~ê'lÖPÂ2Ê±oàý¡±où ÂMç.ôÞ1os¯N°ò¼1£¢8Õu:+doOÈ°iÖê9LTüh®=}Êà22>¢ÿøIáê (xU_>÷À¾½ÏéÙ¹Â²é´ÄòJ4Nºo20ÎUkgNì%Ô&GSyf*ÃµàÓäÍ´rò#6Të½Ê= k½Oñt5ê;mÓÝ[¯g'N'v]dC²R­+*f¸ôw1´¶sµÿÉGnËGnâ·9DMÓË¶X@{¿'iÛ]T®ÐÕP+f= ë´¨nu»Àôï½ü(¦&ý[|çAbiD¬ÏÓSP¼5ù]×1Ì-Î©94ÓKÞÔ¡E0Uy2O,Ó/!sÛË4J#ï®Äd;´Ä·ÿsg=}]ØÊ¨èl'³x>×¾~^øë¿¬H¯¥gÁ'	ù±"hRSR5Í-ý°{.<l~Lí¢ý7ôgÊCâNùü
±ñy 
y¥_¿SXtRðNK{2î8RwãÕ9h¹=}ç5û½½o´kºÑECì¹jÜ Ã¼S eNô-¯³^dgR b²ÈÁuE×<®mù)xK6ó¬ ¼ÊÕÖô;hSÃü\ÖÕd|ÐÏiM ¼Â\5Ím|Ñcâ<Ü= Hx}d½IZ¤x,©Ù,M»Î¿öôù7È |ê»¦qðð¬.e»ËM%Pè:ÓÔ@Ïùûð ÎWååß¢îôIýQ<|ê ³SJþÝÛLõf¤ # ÓûúlT¥ÕöÎ0,£,, ÄüÌ+É!1üAÝû×¥nî>â å÷%{iæýÊ¬	ö²YP¤3ïÞ»hå·xµ'¿Å*)Ru´Î¼æ>ïQYõb/c2þßgY²?2pÎ1T¤0GEºTìAñº=}©Ò¢qý*æ!ÈÇýà^#XT¢ÊY<,SØ3]¶z_nPÈ³Õ= ÏG!V³µvx
~3IìüàS7ªC¿ÉQs¶Cò§0ô¶;kw*4Ñÿ,$Ê¶öòJEDÐ¸¶À%A¤èSüChò:Í±:¥$AÄ´I<"DfáÂ6=}Ãªy÷Ï¨h\ÖgûãJv2)½&=}Wj:ÅÅÝ÷x;þ©ÅÞïuM6ç2õ¨n6ËHãläþè©9þ©Å[þ©èHóG¿g{êvæPËÌlÅ·Ô(ìªÚ±à¤dM_¬àMoÇ^"K¬äáW}¼Ú­óøJC>H+Å°MN^v>gÔ,x¸(G}ÇË,v´(HSv«jX>l c»4Pê,=MêùaIºúÍaO ²É§w
Ì¯¤ ö<¢I^Âô±Yº¦m[cùÄvFõ7àzÐÞÒ±êqö¨cXgætÅ¨øù0JáVí@ÿ0K(uc.Õ2ÑUsé¯kô·ÎÒ¥©À|¢Eý¬v?>D±Oã®C×]tÇ³w¢Qk\SAÐuäã:¤ñ«NC±)ÍFÕ|¶ùJ:²½Á²#môàÆdô³AÇ '¯,4=}åJn­óncoý§oÿWz¸6>kx[Õ³ä'KØG-¥©u¥ÖjjÇd<ýÑ±Çó,ßILMOG ¥Ð^ñ¢[Ê5.y¯fQ¿µ~
 
ó¤s³*çè¹	 6	GOïù¦xpÈ5Ci¬à±¢Í=}H2?Õ¶CTö{
#C°%'E%¨óbGµÞ©fuGF	ò,´É	§kÀÝaáõ%!m¤'p/í2âgí·]­ã%¨BçôzÁÂ÷Éq%j]µÖUÅÍÁ!(k7%å·Q	wçü¬ú@gÃÈV*ÖIý¶ª6®oózE; ÒBæøéa|x0$ÐÈV:ÖQý.tÃ%!±ïªÈak{5svrñ;E{K§0Yfwdðªø^á:wà®ï±ï% ÷¿öÊ5ßÿá_íÖ®þùcfªCÅ¾iI½ÎßNßHgè·ú#³ZXrè´XJÜPe"aÅÓ¨çg®y(¾¤EÍÕÜdñüü¸?ÑÀ°_ýKqè¾£Mn£oH%8hôÎ¶x*Åñl::§2Î/OÎ<ßYÌ) ;Õ?ù÷ð¥¿r9T/Û!Òm4Jý^I è½ïÏ]2Ì=}òhD0&'9oñ'gâ«r~eb= ô]Gök\ÅPVîòç+¤5í?°í?êT9îÿý¾qYM¾ÿmrh*(5òBå¬!z1pF]èUßjYw=Mw)ð+w-þ*%&ðm*ö²3ÂéÏ¢¢¸©^vâÅµ?2§ôµ ×¼â2Ü2CL¥mTþÈ Àj©
çÄo¿>E-müíÎmF¼]RäÃ K·çÉ0à¿b÷çÎwªÏ'Æ©°¦äÊ¸%½á:¸E(Í7Ù¹ yåû§Ï
æqÀæ1½åæX-¬Ó-nÔ^×NZÐmö±£ ¤ìÇÀE-Ï­#õãÒìêéÇÞì2ãR¢ HãØñÿµ®ö¯X#;RV=Mµq àOÞØfàôJwM¡ ´ÜÎ5ç+êqdÑ^Ó-UGíS8&- £Y =}(£ÛÒQz¤²g<ñÔs Õs,õ±ªñÌ×[~+É= î	âfÛNÚEyÐ´ERrHÄV$q²seYFÊÒkqÍÙ·ÚÓå©dJ
oanÉkªoÑ=M÷$IIñDOl(ÐW?°+ÊÁ1ª?È½*øTEtÆoÞãû5@¸¹	¤î//b[»Â$9Ì+¦j ¬Y*Eo"·^Elor~ßµÉv+TN?Å&æÊp¬FRiaRëhçY²y©ä¦9öëRdò+Tú!³Õ>£hPÞ¼ÿëý×?pèý%êoEá^i \á²Ê^lël= 
ûygöjUÂÔ(1¯I°Ì1Èð*.ÉLPJ¼
7/M§,ú)â+è£ªá¾CLû^#Êù±¼rNÂ?ÑÚú@ÙºñEçº&¼àîKZ¾þ2aìjSzL	®¬)ó~ñdlB¯æÕÎÍ ¤]¤å>= ôS@¯j$½£QÉCYàÑuÝxÓKü¼¡ÔÉâÓ?^f[]m´@JÕ¡ÀÅg?:hÉìÊ#}"ßÃX.8<¹s]FÈ()×[ZI2-}LA0òÏÔöMæY3/q-ãþþúGareOR/&{X\?[òzÎÍÕéÌH°ã}Â:ûä«8æ= S°wîEjj»fLa,¤ý»R0õÈj÷a0ÖæXÍØ^epÿÏ?Gºåï#Zòl41bïA÷me§z	d¤+ 8|ük½¤ÀÝïÕ5ùe<kX´ìMÑë©
<$àrÑú­ ËP<âmNÊ¹ÒIí²ë7«_¹ýpvß÷c9JÐö?ÎÕ¯à%J¶Ç'ò)²ª¯+ÀÛêTUÄQÄ/^ùKQx(c½(ó¤X r¨NoïyW:Rj1©= ¶©Isg0ï¢þm	òÎ= gA¨0#Xµzù¾¶r6ÆC½KtÀûrAøÖw&4®¿	ôùüZú±|Àoy&â.V\KÃWÃ±Õ }×VÜ° Çé¶/¯zzªèÚÏmo´weRý»rÉX½íM2vDI#xÑ.ÓwÒjü?x@´oÅQ©bòMÄb¼Rä·Ä¿ìAQA,%p"Yô= þÓ¶+ý©cÁí·óN3NµK¯ibmg^ Çï,Wüy1ôís[ÌÂ4µZ;>@gÜdÓ=}8·¦TÍIøz½Ù)vñòiú;¹°#)kü.ÕËâWï¬òF·<ÊNHg7Y|µÜK¬/Jüð3QIÔ«¨f$rjÁ#ü·ªR%@ÆÓù¥P%ZrÂ+jã²¾TfW«.]º$oõÓ:ÝþãÕ]l ýÀ0£	ü°öÏ²Ñå ¨ìyìíée0Q^¶Åÿ^Fùg5¿íB¤	»ö
U²ÏBà­Y%´¦Î>¸Å4d|(7©kµm³Í@Yô÷u*" &jr ®xá¹¡>2Å~£ªwu¯sç¾v2@3@Ñ?þÇ7M±²ÿlsÊ9»^¾Õm2À'#R¥UJU÷Ù;/È]cÔPÚC\>*¦/¾Ã= 6rÇj´è8hÌeadMYyè¿]øÜhWÙ~Ó=M÷+ÞwGñÙ¡ £ê,¥ÝË|îâïuñvæ=MY{æ<øþLÍkÌ%"®uû24@Ï6#Ý³.¶j¼*zg·(«Ú;Ô»Âoôw±Ì¨6ÀMÉ¯cÇÍ®õ}ñÒGðu}ß¥öÛWD1ê@dEáÞe#ÁuMJf5\ýE­=MAL6ðóRç¤sI	gK4P¡ pº¨ñr#+'ñö8ýXJRh|É=}_õ
/Å\Á/³Iã=M¹N8÷æp«~ýÉB-jVáaíÔßÔ8/Ãª¡Å¥B<Öÿ¼ÕÜÇ¯=ME*ówófsYrûk¹Ñl7²HÛL$ÐòÐlùIwi¦7½ºÚbÔ;ÊÜÌÞÌ\Û§£êP[ûö(ÁøÃÙBJèÇ<Ä²­ÌÕIð\i×?¨Â¡HdSèÎ®fÝü²¥~Ì~¬8Ô¿E:IQj4¾§piz½êi=}·Îft=}3+Fdb@wñ­¡ÚÑ,Þº4ºZß·Q°¿·O¸JºOò/pÉ3¨¹sz×2f¦Y¶Ó´
ùó¦ºÔd}gÁá/ðDQEÂêä8|¾x¬£|{Djb»yª)DþDKtÉ¹¾H×3Ì~f§xæÑ¼*q*ñïP%xR3ð¥h;µÔ_,ò«Ö'FÄÚäYuÐ{$~Ä3Û¶ôT¯	VÜ-âòaÙ7føB$¦·/Ô-S:²v½ÄÛØ»ZÇsrÑAØ¹håßtA>i½#ß¸ªlÞ°æ*,¯F³p¯= aÍ3(ÿå-¹f¡&bÊkz¡ËæÿÀÿm¡z!>êÆf¯ÖP,p!6þfpõuÌ¸Ø¹ØK2¶ïAöF²ÄT|ZÓ¶Ä\ÌZôzHq¬ê"tBMA#UØ0eßjÁ½öOØ>%l Ná)ÖÏ=Mâ+$k }ÍÜÚr[í¹	ä²ë/ß
ÔPOþ³äàÑkñÆãËgòOî7Dú)LOÖ3FeÐDÖ!#Q¹5a,öÖ ßt>ä9)^ Ãì¥×Q¦Re!îb¹Ñ¶ãEnÈ;ñÄ¥Ì7DcàåpëÃâÚÞn>æøtK-©"W^fÇG©3Ö~ÉÄsÚ"«¬^?«Rgm¨ÿìÝ½.®NþâE!Á.EMù&B$* Ð2Ô@Þ3Ð»,ðDùaB±QxeLÅ3gIQF	­3Ó¹ÔîÌQ½<ìW|ÕE®ì¸hlf%ö>bñs:ÚK¯¸ÎsD×å§óMÔ#ÿóØKO$=MRÃíor:+!óòâHH!«ÊÖÞvo|sè®§ é¿íñ~~«*wâxÞt¨¥{và}åÝÑR4­_Hpà¶Pq§>µL,Ä¨=}ãökRVS´DòëwvÈ2cÒÉ3á±Qî1pG"= }²²%Q¡A	äÐ¼ÁàN?ëïR"k~qèë¨¼îj©p)tç0Ø¡þðdvìRC.²ulê;P(ÒZI&ªPþ8rÓðHr(gq*'ë¶õ)r	Ö+ØQØ&¬sºkÉÔÖ»hÆjéý!¯ µ.øgÖ+¯><Fë^ñÂLÏ>6{­SÄRÆ*[ÝM³?¶i9_AìÐù©"¡?_3(æ(A:Ò á(-ý°,ý©õ þbÝWª.¦C°íbuUgQ-Nèûè<l!A¸mþC=MGì]Áü[¸¬eÕê;Ýà@vñpáéÝ¯ uÚRÉûjôt^Æ ¬rT|NtiÈPqûxÓ!ºQ= Ð²»1eFÎÀ9TÎSÆtÎ­ÞÔïöë?öê=}c¨¡ü|+¯bç/ÞGÝ¡ä«çwZØñTlËøi¶X\>òÆÞCØ«ÛOêV¤ä¨ûër6Ò\¿/B×ÃN«Ö°­Ð×{èþKlÓk![øûK|ÊXt:;YÄTþFî(ß­½ª +¼RSD«¹Vúîú!÷¡Ôû¡3w]Ø{%q,§Ì Nv7¹Do¿HX·§¥vã°Ø§«Of0ìwÆ¯Ô2DâOvôOÎ3VgtÔ4SÞ7{©ÙCSc¨ÌlOf#>B	+©ªí??åM.íhâ=M-Y+9Ë= 3%«Õ°RµOö= Òã_rÖÅªS¹Ø¤Ò¨,¡Àle?¬à-ªö½ßíyPåHÑý¿T}· È~²?éùu»)£"_FSVËó³"· \úEúÂ8÷Fln3_AÍí¨Õ¯nÐiÄÐ<òÍ«×¤ÈÅt¨Ùç|tkMÌ¼áõà
GöÞ9"ÄØSWJ·ÒUæTñ;ë0ÔrpXk£êg7H¥wipy¼à8*a5=}ÙÀê6DoUVýQö0cÔFaüP¾Åã5hDå£Ýà}âì­Óýõoñø¬º ÂøôræË*ziÉ¨óÑ^<FÌä=}íRÆ¨wN©¯Õ»>NÄIÛÂ¡öqD=MU³5ÓAàÌWc wóÒ¦FÅ¢¬N±H­hLôÚèrÁäpÎÆï|¯V¨{*2KÍÊ¡ìGrÕI
rÕSµ5´½® }rëý|"kß,Ãê1ÖZµ§V³à|rÀRk\ÚÄ1k\¹óZ[4É÷wÎBÌ¦<LJz#2Ë~z¾ü¼°årmÜÕt[½_?M©~°÷Ê3!9ÙµîglâÖñÙÉåV¥ûøäÐë= ^Ô/dxk0±:ÿ·6|ÁöÃ¦¹ïY«%«j¬V»9mÐIÄ0«|P{=MÄÆS«¤D°RË°oX|3·%" ßÊáo.xp'øG§öÅ¢p	cWÎ êIæså³]ÆÑ](h©Î«Og(iþhD(_ì)êÉØpXrß'È×£·©I82= VDÅªÅÊ.Û.²ÙLô» u0aÄCÎèºY³PgFùTÐ$h6¡W
¿¤_¨~È °f\¹ªû¢S·ä­iÎo?éµéµß#Ücc¬½cpð= Æ^¨yx½ºåa¨±#*=MZ¹åg>øgé%jßÿâ¹öÞý~¸ëB¡ö¦MqCãWKBÅ}4øuîEî]}ÅAÊYëé¹óêºó$&øìÝÉî3ûm[g6¬<Lö^]5¹*÷~Èi:W= «²CLÓËÐyñY¾ú¤¡"FUiçM³i+z1¼Õ'es[(áíY¨ºßÆúßÆÊBcqîo¡=Mß}B÷%5D=M/àæE¶ Ñ¢­_­/®p42©ü6YJÿë²¢)h&¸çq2º$L6^ehêk¯ÏÉÂ0Qoé7!Q<¤|újd@+Ttöñ7©L¦u§â¹-o@N8Fà~!7D»k SH÷nÁLù_,­¹E=}=M¯Ögbþp<#±f»ÿ3îA{©ò¯Amk§°ïåõêñL¶é±ó 6¨X¢¸	ó¾·Ç®ÂvÅßRxÒQPÝKDÂyê×zM(ª£wê:L¿¬xoGð±Õ=MÁ
Ù>fE2@ÙLÆÏ³0fÏö¶ö¯j8ßcåsHýÇ£÷.DÊMôEU¹£ýWW¥@Bü<£Mt:ôP=}CG?RÿTÕm¹me*ìa¡,7gFÉçÃq¦0ç	3	 ¶óv0Øë³h©¶#Aë«¨yÚ´BÿP& D¤ÿPóÿPii|±2n8¸Tý= ¥yÒÓútæá·Q '¿?R
	7¸mM2|S2+ñ%û¨áD÷¶ Òî¦ä§N_-ð)oÅ6ço¥2Er!Ó
2õ*'ò_<{r!no}+âujèxgéÞóoëL­sóF´Ð2)¾+LûÃýØ´Þ¶´ ð= ¤ÙOîPUìR-Òøb,rÚ!kÈ²µ½}¿êç« ;ÐzW÷· ¡= ÑaÂ1W=Màh	0¸.¦[-Âi-úNd1¨(¯þ+?'Þ&DV%[øèycÇ?3* se=}ä^oùFÛ¨èæpp_&+ÿ°âä÷+2úîç´'7êÉðÄØ6kâ!­Ãò=M[+çrÒÕgÎsÎ¬¢4<V¿ÃQª4v@¨A|&IõO\AA\Â¬:&Ã8L½½G°"ÌUÌqÍ= óÿt]Ö8b2ë{Õ¨Ý!Ô8B·«â«®F¬¨ÄÍ§QÆKÐÅ&èæè_&ð©xL2®æÀõæºGï!taCE1ÍÌ1Í.¸±$ªÒ5ôac)[ÏÖ±g¬Úk{ëÙÛÀÊy®F 4(!=}jITqº8$ó,yTê¤¨<·©5¤Jl9µÀ1#­-#4D¥b=Mw¾yõ=}vÒë @ñ©'¡çF­HYögfQpÍ9ÎäÔzÿ¾é.	â5XOÊ®qÓ4_wÜ
\»Õúmq:õó&ßg^_Gÿ¹ä±¥w²RÒóEÆíâlë¨L¹õ|¶É41Ó.>ï5ÐN3sÊë4,7H"c´#u= ¸XÊ%«±|üü &5 ¾Êñ~éRåÙ¾Qøô]¡~ù»Øà¯= ëß !R1ïõÃ@9RV=}Àu[ÿ%Þ9ZRþ¾s¾[ÃÑpÈ¬6¦´Ãø´Ìï©>äÈMkM= $1[ÏUî¦½?W¼[OÚ×þd!ë¶æÀg8"×¢^wWû±äár<¨óÏ+k£ñÿzsm\´wm´E1óúîß}L\ö§ïcÅÚÑäò¨º¾WÏÿX©#wD~é2Yú|ê·Êî%!Þ b¨ßJÄ}_OFHãId''>ý+ªÿIõÝ5ö4#C{§úoaàËßBo÷ïÐ
¨Éh0;ê1Sð²ö= ÆºjûîF= ÿ1 Ù¬)EMÐì×@OÆ<ªº¤z¢1¡a|L[tîWW·Ho/õ"ðÙ¬jê+nR}ñ= Fè=M²¬Ùè1r	L¨¶'8h!7Ô¯ìê¿ïì×5¿ûU7ú<ýÎ½úÉÎvÃCh"6!4!ÊRM7RÓ¾é²v öPë«µOåñ¬¸¯ º+©u§Ew-ðØW.ÔH{7-ZÅº:
÷jBSì²2Xòæ¸³3=M+¸ñãîî3ÜpÛ4Z*½ô0Ofú´§wºX]ÈfSÿ1ê·MºXRw×_ØT4¬S±ÞSè
ú÷ÖSúhæz÷j~à08ÁIX8æ
OH¶âäI%Ë²¸£wï³<&K÷¡æúËä·	V*±¾Ó/L2:¾agf-Åd·¥±å1e¸ùAi^¸·ýý¶¯}Kæ©=M2¿?mK_a§r±Ýâ®ºéøÞáø%¸Q%2vÐf+Û!­Ñ;«þw UþøA)<?±´øðu^·ðñC©q»u¡éy³³»ê$&½¡¬R×¶ºZ+æýAB²ûmÓ¿[êG¿^y±ä²
2ô3F,ìd¾xþñ2B¡e¾'VãnÍ'Ô²LrÒ0­ZwQ$Ê½-ò¹yÕU0ìÆi{O¥ Ñ©ÉÆË2Gg8à¿À÷v%K2<R+§Åº:Óª
rúI[ÓØúðÑÞ= g×©z2ez,O
âB¬.îLm×±¤¾êØÕX)¯×í\.ú3É7ßç¨ôÅ½QT3ùãýzÙ>R°àÃ1%ÓØÝhÿí\tÔcÇÆî¾ ö£XðW¨ë±AY¦|ÎRâ<½Í¿-Ò~cO{K,¦§mçB°Äj HÀ8órãè=}6nß\ßàÈ+Ùqð­21QènÁñoÑì.p¨±ÛîðÊ¬a9-gUpüjâQ8zõÏs»Ä_=}pþ3=}ÚT2\ØLæX	¬ ð ôW1ÿ·ìîû6
~~IÌ.þ{?À7³³¨­¶¡	F#3­ªxedat\'EññzúIµåäxü4ëä¾Að±×â¹±{Øè¤üb¯ôVJ^º:â¸EúÅçZÆl¯}PXz&ñY5= <f-_d5·~Ç3Ú#ê¯éöGêzoç2Möè#ÏWíÓìÃS#jÅ=}^k=}ÁÉâáÆl$áÈ¯ïJº»ß¬Ñ4ÌúËÄo
Â({¹C
·@¬Â¾·Gþì¯%ù¯ÍcGì-vç´Dàwq¦Ø.ÝýÌ7O9A#¾àèË?ÕE.= 'óÙ09$ ?iÅNQ ÝoÓòùºà%eñÍÑ± 5I2ÏÎª ü«¿³ê ©ç7CÅM¦©{6 ´ù0lìkú9L51¨iÑðe+Ú3OFRì%¥À{T
~Õ®­{a/¨CY|TèÐ?5®_"5ÑÍBôõ½¢7øÅ¹õj*ñû*9\¡KG¹Ë=Mî®Ú9&[¾´_î¾TÓuVò3hB;}à9ñÏ>îýcbH°dó9k¬!Aêo%dFaoDf4êÇÉÞ¯È%â÷õ£Îë.= ¿fÝ©"Ùuh²ÆU¡2c0"më¤¤e¹Õ]º:Xõøh±Jóâ ªyÂ¬Ùî÷Õ=Mrµûº9ó"'4/AÙ]U(qù¢Yµ]é¼ÛÃ©
= {ë®A¹Rk¥['(y÷%16bJTJª÷+fprP+mÙã_ÞÍq·ÝÈ >C]8!*VýAÍQât¯çñ|$tbá3Ïµ2¸éâÒ444gQ~x÷¬ó¸¢¨"UT
¿:-Lü{$ÚÂ­"1Öohu\íÈÀÿÝ\évg¢l!8ª"±@¯û !Nª6ô±|VQÿ§ëoéWÓ½Ój¹ö1P >²öí@ÃüÚ_áHÓiÆ¦{®x{Z.@Ëö°ô°ðQqþM+@â/«2°.Sr
¨zTxûx<´¤¹AÃÇ´±@Ë6È¾Ê«ªÏýÔ%Ònä	F;;Sté	XqM,©?vÀïªìÉÐ)Ó_y PÔ]yØ1¤Ô10Døª(årMã=Mú£Ç,\ÕT2D*7R³}2~rª3ðfb%ïû	CÕv¾Âköv¨ÿÂ[-iQÔ7UÔµz*cvmÃÉú«>CB{ËÚ
»"vÍ¸|¦ã§÷H÷+v²zØdw5lQ9ÿli·p¸]ÅÏ ~å¹!ÏJýJ ÝÁ½ÃvnÊó{QÄ¬ô&ÿ= !ÄqÂ*)#¼m9dÙCýªË$N½³ËÛÊoBsàÒç,IV?À"ÎaKúÊW äÈÝÞTwì Ý£u°x!^[TNÀÐÃ¤yªHixR©ö¥#úæFÈ¢kw4\%ºó¯_q}é¥6hûÛ¾x*l»wÑÅl»W5ân:þ³÷[°:HÕÂg/H¯7´þ1DÓ¹¸4|#¹*I-²dw^Ì3 
êX|pÞz?åß¢Ás­ËVÅ)­,Ù®Pó- ôæ;ý!ù3[õ(Ìî·²@p¦% ó+6X¤zBs]¨á ÆÞ4=MÅÍpû¢âÌQd!VzwUQ¸= ®= = y Òc ë~å²;Eó·}õj2@ç)3÷W?%óf8=M@!Ü¹RQlÒr¯Ä+dÂFó7ÈïöºÌÉ/[§5Þ÷ä$=Mô4:}ôR5ìM¹G22¸¯çR¦ÛF²TÅÑ³!Ô¹ÅÑ{ðúS,u*èZHW7$û×à¸æ±Kõ^p½kÕvÐãõgkì|/ÿý!Ñ=}r]ÛÎ[¨¸?¬nMæ^÷»´DgF¡Tn"l½T0õK¶ïÆfPXµL!/4FÆjÖ(BêôUOI±6ð´Õ9HÀ'19teÈy¤R­£ûL¸H9 RNê¤Óñ4;<c@9X¬jHLê9²Õ+ÚÜâ´ü¡ÿzÚ0÷Ù0ù/DÁïæÛ	Ø­AÛ<#mÆ+Z÷fÇ±VþéÂýC÷tßW{Iô» hÃÃìetø¸=}!Í¹Dß®¼
?ï}[ÛaäKè.0¯à= ëj««¯½Àáùÿtêw²WÈ+¦_&Æ¥uÀ4¯RËFï¯Wýyuj§¯ö²q{7kþJQÅ°Eï¸;1¤ÎØ·&9¡g= ¼õhLëh¿OíOæ/+9 æuEG9
C¶Ðjþí«c.Py)©1^CØ¬£U7Íú.Æ¬ÀÜ ­e;ó3±¥(²n°ÌðiÎQ±NcdØMGúù=M´¢ ê2¸ïNsmÎt=}²Û½dÔÎ¤àW(ÒQ|Yí<[Û»yÚF54Ç*DS·/a@(Xî½4 Ë0P^.yQ¯KèØ= ÆYCëjeÚöÌg×9á/ú\w[×¡ý¼þã*B25¸-ºeÇ¨òsR=M-mÚ[ýÈùÿÅ_Úf­cÿJò=}Ôu.ë÷2¨]Âù'Ú+3JIB%Z"Ëµp4¬Î'±Ý¦ý¯µBb¢±­ä?ÄÑþ;³Ð>xVpë²èA!Jõp/©vàrÃ/uÖÞZ¦­Zi &ö²þÒ¯TÌ>Hxä(?ØÃWß×¾ÞDîý¬[æýîÌ+¡Oóï¿É â[1¹evnA@)t¡¦Þ5Ò(èî=}ÿ¬Æºþ$=}ãOÎ<i©Ñ¢H®®ë¥e=Mã1<é0£+ç²=MEi:Ýí¯Þq3y]Óì¨eÕ.p>¬8¨ÀïèM:a"9@.¥ôÙ¢¤¶\æJÿOÉDE£,¼Ý$#ÙÆ*G5>ò{ |ÆBÌz1xJªì ¨ë0B¬}iÕcÄÍ¾ Y¡I
ÕWÀ£ d¾üY5C²Íå+
û*®ÅJ{÷NYÕg¦ä[9Ögø%½nX
À^ËazoBY= °~BªQ¼{ìÌÜukL££Î*@ù¼eNÙH¶@}TJí®R2=MÒ§ýBÎýjh3n=Mû®_]B$@«é²ï ÁV> ëJ A>d1W³ry= b!ï²,È1~ Iô$#uð¾«ÙV.¶0Gb­vAÚGdmD¼ÿv8»Ü5'Úl9tñÿ±Yr¦<*©òïUr³õ¢U/?i¬TêüIm)r&×ìP5Ý;@ÒÒÂÓvíÕ#³HüóJl¼ã°n¬ï1fè.æç]ë%^VLË6ZslU¡À'¨Îvà9'j.gì?AqE|P5_MÃô'RZÝÃÍm5ùð£ëò£PXF<$ç8×ÊøG¨\JýVØ§èÕípÈëÞ¾êî³,:0G_*[Bp×]CÉ÷@ñf¯'Kû+(WÃ¨x«åòvyzóÁ¼ sO"q'K­ëº<ßÇg3ý	æ®-8+"®ü/²Î1"öíÐps¾ÈÓMeñ~°ohFfó~Í-d!b¿c´Ö×G\rrÝU3¢8®)&óLXb_[×@ïo]15ÍÊ ®ÇøS7èÿVq&tøæìQ-Âîx[ öoü~÷¾NXx:Q£Þr¸¾Äû ¨D8AFâ|ø Î5¶o
"G¹É$ÿ%0GH#AjN#/û
ðíQÙAÁ¨!øN56~Ûá"
7Ê^ÀÅû)HCV®×Â"ðÂ¶è¨ÊÏGVzI,R=M$j <&öôÍFº¬xîâ*´7öpZ®.X¹û"=M/³lº4ç¯µ9å±Ã_unH6ßðVèÁ2·:EÑMÔ/HÄj^¡]ÒãðöRê369åJG-[ÛÎm|¥p,Á.0ëexì±åÙÔ»qT?­',¾ã( ês+{çÌàö,Új·?< !kÏ^,3øÐ¿ñ0êz£1= *­-= R±­~~ãK>²- B~~.çêi# e®ù)EIö&ÙbÓö_ãk7¹ìÊixBy8
=Ma}O1êiêoízãk3ðÓõoãÔÉ®É®xc¤r7VâfBB;#+0Póifâ%¨ÆúcHõ4q1J%	»ÊÑT½ÁZZ9üo|¶).
¡£kc¯8t³n¯I0wáÅ8B7QÛþ§°Çî	Ûå Âð=}ê|}0°ÄáJ^GÍ3$®ËòIbuVùçêZ~Êïóm±_{úó­ÝAhÈIw@9Øu %L1Àõð!ãkæ¦*¿Lün¦Ita%tî:Â±)«cVÃaå"Q3g$,= ÿáïÅ°¤ñ
dáÿ¶©ekÅíÉm¹¢x\kÛñÛÒ¬°ü½ÃQø = ã³w;±noÐR«³2(¦ÁBéÛý05Ó/BÃHµT60F/*°t6Ã·òG÷
´¯P\¨O= tgÍ=}ÈKòÁ"ôñ3G¬ß¤/®,væÞ1åv%ÌÇ¬Çå©;åIT½¤þ= °múçÛì¢äk*.MB!94XîÌÓ·ý»H±Þèÿ9#!ôÌ±)}¡ÔÏÄÊoTëQCÑ¹.f#Âe'ÇTG1.îò´.Ø¯ñ..úÒëjçGäÇëj÷l8$$i#:d0$rÓ#õcÙ?yÜÑöÕo6"¦HÌÊû#ª¡Çe$#þ{R±HZò¬·².äZ¢G^»Ã¦.¸%¦çóa¥Q<<A¡xªEâ¤GßýÜ¿¦^Ö¶¤Ro\¸¦ÌÁCMÀi{Ü
MÊ«1¶Æ)ûÑahu3Þófi(T§²ÿ4VtÖªÀü3xÄÒÆÞà}mñãOi¦= ûêkÂ¼´Opné
DÉ¤Óö"°È÷ÓsxÜi\õaFûÛdP£daDÚ®Çæ­Îî#®Î!¾É'** ZóK£­ÚíË6÷º¤K[ËÚìÙqTµXÇ¿sî_³°é1°¶RÊu;(Úõ«´ísá¦á·Èí)= §F×¢;J5>
xD´ÆJ}WàÇµ= ÞYµ^¤\DbüÜûßøCLë_eúz¶@3üEø±,cAò«®5¦³4ëÇ¥òJ8[ùù9©zú^7Â3³ÇÈ¼q4+ÖÂØ¼Á%Ðç´PíCóÖÃfK\·=};ÂÌ´ÑXÙãsqÜÌ=}+bàÝ[£ÇÔû@ÆÙ¿î°|ÕcöFÆ´ºâPGªe·é¸×r miÒÈJ»J¸á¦Ø÷ÊÛgK¾ß9Óv­£'1îÖs{ÜÇTêiIVGÿX½tr/1üßÖºV@îX£ÕbÏÎgà²LÒ#Xäúµ@Î,ÙÕ¬ÜNeûîÃhËÈÕ%[mÎñ9pÒ»}L_ºå©éþÑo7]!«º¤vÙlÏÛÚ×ÙlØªxåìØ?Þß9²°Tß¡´V©¤í.#;¤UûñVts®ÿ®×Y,êÊ@DC~>­³È»Srá£·iÁÙWG¬¯Î¬iT§Wä
õA$ê¡Ó/£Ô¯¤|J/¢§üF.= S·à*Ë¼ø|W=}s®8+É0sq¯Ð¿É#éÞSnF
w4XÒÝïéfIKp®ÑP½%&éìñ2BNdc6ü=}wM²ø=MZà
= En£9ýUÎáäõUç©[Ò\h9)lx@ÏÙi)·EÒ²ÒWÂTÕUäc6ZeÄ&zùf½b6 0ù"z@Àþo¼«é»?Ü*= Î8VE#Ü{zP#ë¡¨W2ø²çÏxNzlñm»ç:<=}nÒøë\Ð¡Öù¤qèÛÝ5¼÷5µd·Þ>ÅîèÛfdS>8| 	-ñy\ékôÕFµàÈì Î;ÕÚX'+ö<cÀ"ý¶Ó.Î>'SÔû"ÒàR9¤â5üË7>©eCÄØ/M§¶Êôêl1Ðã>yÈÎqÐ¬Ü(Ó;×À0î®ÏæðËp>ÆüS´\Õ®5ãký=MuWé·â$7ÉJ²ÌÒÛØðÊÄwS]»«	hgãÁüw&Ú¨{êCPN0b_ñN­'©Ð*ÝCÖB K%ÌÈc¹6»rØW´¢{p÷U¬bæ(ÿËªÌéO.ÛÏ/jmøÜK8&ñ²,á$p©öZ´!$ôÈJýÐ*ñÇ%ö¸5cTC=}Ç1kcxé=}:ÝÙÍØÌ@Èd,Mú3ZÞHÀ_$dØô¡ÚÇv=}Ò#tåv¸{#zi(ÕGÝrò
ßÍÊ¤Àô[Å°J¡Q7JòA:ÕL ¢Ç°Ù~<fÖ¶ùøñÀARS×;Ê#í@ý¦gÞÃæ= S¼M/6.u ?\ebÈÄ¢Gõp:£ôÑ§	áâhßIGâ»¢>qM_.=M'®rcä^_´£vWéö!53Ó¦Y©uVÏb¬
6c_ b>«N?Î/@²:µ= ÁNý([Âö¦W^æ ÖD©Ô·À,Ð~÷wþÖ¦>üæ·7¡0pÞ´MÝ<Z
ýÃ3"éWTîEÀÇ¡"zÉÕ¾U­º+	Í­UWA=Mé|ü2þÚ®F\ñn{T2(Ôd÷¡?tÏíÛKQ£KW4£Q78ÊBG{ÒÏ  þF·Í¾RLÍ¡(ÆlÇ¡òä:¦$ R_8ZJª39ºWN2"oHÆÞ. uÇ¢Q³ R¤Fø:(<Ð±T'Õ²÷,c&ºI÷äæ6jWSGñ±[tn¬­rCÖWGëÖgo§¡õÇ>YÁYöËUE-ÆÒ3ÿöÖ´Ou=} ¡åb=M,ão×9Mð×ß*ÒD°3\9 Ç¬Æ!L­Üú%°=MVFÛa+QAL¦Ëò¨PrL0@ÍÀÌ¯]2;q:z³&´2ñÈ±= áeBXMúÛìÛ¿ÑUÐ%}øªV´¦
¥£¬ûädg¦£:ØQÖl#
ù¼Ô$$h:Õªç»6ËWö<x¯Yl°þø@ç/Úá.HýE ,NÎ;wK¸XÓ)ó#=}"Ä?gÞn¥²ü_ëàéÌ¯#ò±ùõííï¥ØDéNå.@4þ_}ÿBäýDöóÔµ= ã4ÂÏ÷¾gªý gV&.Ô= o3Ô(e1táê½îmÿµ´è= ]qT]bFÉb?Ü£
5ÎàÍyMCü?½Ïµ]«¤Æi¡ÖQºkÒÅS´í'-©~®;_ÌÙª Ûñ<dméÊ±õ[ËVÏIR$&ÎºËW¢³Ç^åÖ	h2PÙïóBlÑ÷ÕähÀT¾³bzÊ×bÀ]°-¢üÓ,ÿQ2%k){ç*¸Ksêr²êrÒøXc§ÇëJßÝÞJ4³8Ûî®mÎèäûS>gÔù7á}{,§dgµh´d}xã³Bm1t]?tS8m¬ë}ÅWíb'®)±vúLùBúÅÖ¼2¥ô³²bÝ÷Ob^ LEp9ý%>{mÀ¬Óx÷  Ku?Ä¿gÍ-1îm(Pbôï{¸»e"ü>:.¸iµ¦õöä³×;èÔÚþ Ô´1c	R:p¹Lz ÎÙF}ÈÒN0¶DÿÀH#/)¢¢¢08ñ­= ÕQM=}Çò.ôÜh\>4ÛfÏ<£Ï<í¢:æ nóâýÿêPÝ\}áñã ëë6ðY+ÝE_mKK¶ÈtÛùã^ð±ç3uÀ-íTd:e¹ÂQÒr½#îÃ|ÃaîÎØäu
éÏOÖ=};	?]Sø¹­= «\Ù»b	[¹¦»K~²6lY:.,3Ú&BnAvªÕìYúö@5Y~a$6s}ç°IS±é#.XÐnÇÒÒ%Ùñ ÄßæÎªÍç¼«= ÕÃÕx£¼	ÙÎÔ?Ù:j{_Û.
(þbà[UÎ©Lõ.¹c{ÔË
t­ÝþøýI÷]Éïàl,ºù p¬£¤eï³ 'uÇéÜ_ ÒL ¦b;;ëó¢ÿ!cØ[wLÀèý)ç³á¤âv<å6}qbNãû]dûU÷îÕÙ§EÞ½ë«é8|jÃ÷ú£/ÒÜ÷=}8dë[po8"éÃe/F&ÿðL¨ägâF<¸CRåGRÓBáÜ÷Ò×ú:z¿Ý}Õ[ÝVÆäæ)ìÍdjKC[YÝ|ä¾gü^ÂËð_º¾/8nd·èÙ?´¦1AêISê0ÊÝ²Ø &Dµ ÇÙfÙØHfïÍ£Ðå¤F)ùô8ýuWo	¤r#åþbÊôz2ã_¢-(ÑDá+KÂ³ð I\Í|%ò©t_ÏNý!¾èä>¢h¢t¶¦©,Í@¿Xgz»Í.¥ G[u©E 3Ý+kðF^Õ³ 9áÄóg:Õ½]x·t¼ÁAdJHÄ= El ô§mç>¸EK ´îÖã¹¥µÊùøÊÙjSSU:¯êá\Àl<©¬kOÆ©ÖÌOPNb£U¦_Á¹O÷\úûg½²hóÔÝ°¼£|ñéÇ*Ì[âgõ OXe®SpÊ³GGôäÀYiKºÒo«b ¸@ÕðrL?¾L¿Äúi/ïq»öh©Êá;Â«ZÆxÿÎ@crÐÿCYÜ^¾âËÀ¥¶BÞ¨B!0z<ðT7Ìþ7ºdÎB¬[Ý,õùNJäû>õjÛ¹SÁng5·×qn3:ÙZå?ÛWÅé _*M'ï¹X>ß~åyõ×LÃ KÃ¼@f¾eêCLuÄéGKé¯±_6åtöçWþ_©í¶i¨ÕeñC-ýº_=}ôpyçèAÞ	FdÀr æ¹ß·Ãï]Ê
lzLwòpÝ.´-¦§aEë3Áag°ÄÉnà¾=MSÄ Þ
Í´Ö«·¿¢I1DÖØqÙF®.Û:,¸¿G[¬¸µb¡%iÃ;º°}Âx]Ö­þ1ù¦+8Æ©ÿíü¯°ïS£_à«Po¹×+á¡d¡°·Å3GbC3EÄVJÐq-e¬ôi*(G=}§z»=}Rxa%CaÑLª¼ÿÍ¹Îñ@yq1HuM"¨Ha+C©§_W¢%6P<¡öpNWQ4ÎP ìü/ÃëÚ¹v/C;{À´²g5©M@ZÏÆzQNUZÐÖ[{&ÈVÑVCÚgP{@-eq¨WO>Áì2r!ßÿþ·­¤¸(BáÓðy<Þøím'RÔFkB©zs¬ê¹¦Åed[o2¬)Ð=}U³ÊYmâ=}²hß, ,É!P0¥::ïùLo|%UË»¥º÷ c¢ñâÙÒ.ZøFÖz|¼Úî0©Ctñó¸¼]<dýÌ;6 qàÔãPÀZÒ^É¤'ÝÀ²×¡TaÀ.n©yN.·ú
.÷ï÷ìÅ}$A±zÙ=Mhâ¶ÔRVÅâùF²X(RÖÈa8ËùoýyDÏê;íÿ9¢÷ý/àÙNÙ¶~æÐç4Iïh,©êîÄb¥6wf¼«|T)ëÙqX=}¡JÙÀ_5«µ/±;
'b,qR§±BNwfªÍÔ»fûNÃ@¡o!|yi£Ábpbn²qéÃ´O½ÿ.kx1o1R+Y¢³û¿?§_~îQöqxºËøâÓ'j$J1F]B¨gýØÙ{s¼cµO{2Qt¸äÑgJ>¸Í«X·5~jò5þaëòÀÐ|Òc/¸,Ðzt|s¼PÏØñÙÐØ¤À	ÎÝkúa2qG¥Ô-dêÍw,:ÅVÊyJ5 ³¹£¦h]Ýß«çM"k³ñXb¶2ç6~mòç6~mÒñ{ó
÷êT×B³WÄqøL¨ÓËÛj_{§ÄQÖëÝIc¢Bù¦YÛA7Ä\ÙË¶§¨<ÓÏÔØ)ªN;èPt[â°BËÏ\0?O¤RG
<ñ}©«êÕ&K1£­CäE¼nÀ6ã=}tü½ìó6kùuåÜùSOD5_(æ-ñ­¡hT¤AåB)zãÅÊUð·ÌòO,ÆxÃXÓÜJa^·;)ff	ýä«ÃóÏey±w¡ÉEVêÓ:Ó^ÈWæQ;ñ
]m?W¬Ú$l@ý E|¦Àýèíñî= ûúÙ
¹îKù¯dÃÿQ±ïøír©õr{]fÿ"éd:vìÇé¤Âæ|ßÖL)èRò$+	|ïþs-*®fÄY'nß%Z÷À¨ðg;ãÖÐKBÝBÓ(4årq¸°¡°·¥ºk¤Pí¨0ÃýC²gÄ-JV=}Zp zWOI\Â\ÞvñE-bf¼reI'9:kòÎ¥
×f,Ùü¬¢õ¡õ¥Ì/ÿ= %oÄ¯T@ÊOÄ¿?~bD©DÀÀYÆÃßÁ¦¬5ÞÆ¦û¡'iâ¶óhbwlÉsÿ¾S]\Ó+cBk.úL®OzR4­t/ÝÒÚ°:NDNVÅ_è  ?®¿ ºðE295ÿô ·$4zÅpæ×Ý= î8Z>|¡§·Bd=MþÁw³Èj)1µRyG¼1»·;Ã 9ihB¡KÊî[¼9Óåùä@ú¡@ö¡@¤ÝäõØâë\Nx·§ëÇj Ø2'Ô5w
«<ÓkwÍÂ9mTÂ¬Dp KðÍÄ FÓ¥RÁxS7Ög£Ùim²y¢°¬Ú|öw¿ýö?¦]HHv| =M%CÄÖ9%;¶Âd/[Å¨ìèæôóè5Úã= «ÁâÇìGGzjaÊY2ûlñ±'}mUF= y[ñËt³gRû¿¯õ¿%·¡ Æþ!ú,ý«[ocÑ¶üÏ¶tnz£Ûy×­sïÞ» ã!Z,Ø&#7JÅHèæC~ð^Éf.õbIZOß«[¢³õªØYbo39RëNbðzÊÔYýéí¹%zç&
C¿cq@%8d|=}éj4êº++Z§µ¦°Pò®²·OÁTp¦v{¬øESpeùLùêeJ=Më¿¸$>Ò{¢ûpYBaÐq¬1ç½Ø{«È[ms«LåÄR u@ õ\¢-½òK¼)ùS³h\øpâI(,În¯36ÂvØËµøä0Kà!9|åuü{{êÆQ¢Æ¾ÇÂ	,6¢Ù÷MúÉ¹L÷ÇÑh|Hªh? ÑWw3ÜôxN³¹!>±À[¨ÅrÊÈ G·ìÙ´]T|aMð¤'/»V"ÍWïÂ{Y>Wå_¿e= ¾Òí¸6õ¢KcH}öfåá·'À]ý¿CU%0õJ²äÊOõrF|'þqIU@ÃK»%9ÿà;ÒÍ.¨Ê¯9M¡[ÂÄæOK«^¾áAÖË¨ÙOØ]|4¬RÖH­æµ@ÏxÁÂ(L*P¿«(¥Ó|ûÁlVíØNÄø¹bsH=}}{úuÍnÁÄîÉs2¾bE*«1íï\¹+¹+Éð0= O~åMx$µNîÔ\óýú;É¡?µ"+áçV}B¥ 6\ßEî
hu'_/¦ß§:Øó¼\ä´b{
BéyuS)[Q­1ÔÛRåË¹9Ë¯xl9rk6Fq;¤¬ ¢²ß¤òj,[°,­ØÄàór9ÕãÁ¬º²õØóÁ²ù¹J;HÖ=}ò¼æ@è²\×ê³C32³g¤NOÓxý/«Ý²·¤RÊð<ØÕR<QEkpÂ+dªïbÝyM¿8V©wøxÌmf>UMÎ@&pj8g³qL.£Iº&é"DìtèÌTè¤Q2oêRÂÃÙìþ¾$TÚ5bãóýíf)_{mÝ«hørï»9ØèY^Í­« 3í8+ô.L°9°%¡ÖºÆ4<EDÂR°­ÔºÛ2 $oe©ÒÝ%UH¦Æ¨~Ô3(Ì:¡Ýo01hnÒ.ÿá¡ìô¥KþÏ[@fÃfÇÝ»ÏïRID( ¾BT,èÛ8°ºAÄÕvdÑè­Oqø±lPIVÕL ßWà¶:­rÐD{RÑ¥fO¾0ÇÉÑ±¶RñªWÞRH!ÌG®û~/è/_séë·é ×)Ä*XÙ_Zw**øZÝ4ô´ÀºÄ:ñ· © IDª<ÑXHJÛÌgÁñ= * HáHh.Ì 9,û!Ä|0¿BãÅÈJj"ê.]q°f¥»ô±!pr=} @+#³ÒÀ*ù¼¡!^JhÇo÷ÉîCj3¯êF+)¯#ì³´}ê®ýJSCAÝã<%[ÈÃ#gôk¼ä´eQ}¿¾Ä¢5o=M4¥!¯ Â©-±cçOøEwö<{NU^ï¶ZÇÇAÈME§¹µiò-8cÛë]n²Àr2ÚÖhp@d?'Ù¿ºÄÃÍíSåå  ¥q@= À28¼9R¥~ozÌÿOiò´¦kÍâç¯ª·ù%|#¸
ôqþÌN/ÀG®¨xfê68»ç¸££Ü6"p×é²½<1YNö yMy^eÔ0Ì2?]8£ÒðoÿÞ)üZ¡36¶íÁúÌi§ÂwkÎ¹¡i¡ðÕåøAGË<Ù¹%áíjy DÇ?"ò»JòmóK>Ê×á'áB]iéuLîD#¯áú:#«^Ó°¼.i= uÐÑøº©>=MFª~/zÉéIÒ*RL÷V8·PWÌØÙ"ðúyÃ´óXÊ½'5OÃÃ"!/OmNPÖJ§äÉ~héÉÐU:¡U,ö[¨¡KÔÿ|º?²	2b¹f¹>­[É¯Í×Tã¶r¢vô./Èt,ðì³±Q®^¾YeF/¨Wz	r%T= çDª= mxZâ¥®ê¾bQùÞð/ÿÍ¥ú'*;Ý+1Zq·£,4æ:¬YÁhµÀ3o¨qU¯4©ªO= Doñ:âÂmá®5=}÷*¥°HBÁé|XÒLÎ¡ÐÄ|Ô~þXi^ð<ÏÐÔ-ªz_ºóRp@ånOf´Jç2Ó³;"~ÌmJ{q3aLÍ
ÖC¸>g&+nÁÏ³Ì-²Wù[e*åTÂ.³7aÐ[HQY<íXY	»~HÿoÖ5ÏxfC¨
yy\
ü1,n,BÑøjjO«cR´³à6E8òJQÙÈñ°Qð7Z6([äòa±¼cHÆß+RÿºTÅxAþÏ:6aU%ó\ÐV5Ò>¾p÷áÖØGªì§|F+62÷A¶ÊÙÁÚDó§çj²÷5nÓ­G&kóLrê:8¯=MÕ
à^Ç@©zç}IªR20Ø´É1òud%~âï¯#ÎÞ~:;ø1)¸Ì²~gñòÛ÷ÑgUÒOéD÷.}÷f´f·-]9.¸3Ç;ö*p-§?g8XfúÆòtmIßwo<²X)
)ªß=M7M6©Ahr.-^ý#½ìvö^hL îJ¦-C×»JÁtðXA¶løV$o6JÑ
%~8tE"í_+<Q­·6j?Þ>þ8/
»lmh$´DÎ¸Wm®¨R
=MÑC[#ªfQèìÛ"÷À}êºµöL@§G¥ÔÝÃ	r,¡µ*å¤DA÷"-âÛ?»>Â= ôÞñ½ ØyZé³ô= ?±ñ4;þÝ»xc¸B/ãNÜ@ï¢rCKµû->¿N%¢eÃáÆR¹è	®"=}ì±í	 ûòÈv]Ã<LöÙ?l3å?ÅHÄævdk}æpÍø£¡¬1îtiÆ¶G?ðp.¸mQw§nEñ®Sö¾(= ÏÒÀ¢=}Côs*üñÏ-:F½iïhêá ¿Ød¶Üñ*yágÈ×Ó$åâkNß[Eõ.a*2îç7 à÷;ÒèäÂ4tjò×Q*vq4®0¯®=}~SCÇ¤2JvÃ7³ó,¼ë MKkÇ2Ø÷)=}1:º¥I61pÙòoµ o_7c"3ïè8Î&Ò+g¸?"Å©Ú9ÏzXÌP¦sÆÚ¬µÑásOî/ûk*Ø:W¼æí½-<OúÃBôNþ.DWÄ{ØY®|!32¿­Vù¸Ø;î´äFz>vàé<¶,è=Mp£HA&ysf4¶VÐóo-¼NÎaSÅs	¼gÄæá³AÏ©ºõìÎi«¼[Ä­¯ Òàz4èôhþÜt3MôÒ±¹Ôg´Ø>ÓßÊÞÃÉþ¿ÒÅñA¼J©?h*õgÂGBO. t6N&ÙG}bÎ@î}>r:è÷= É:HËlEúµ®Gµ_[ö­7N=M3ù³gà7;©l®«Éü÷LDÔÁt)»º·ÇTùªõ·QúM?Èr%µ§}2íéç#£àÚ©È²F	LrbÚ>¿«5Aù¨Ûò-Ãé>2Dí+¥gMz#7$7ÊÂûõÙ­Ýð­WD¯Hy6,Þ¸ÙØîgÒRYi7÷æFF»eÊkîíËÿ*Jj¶øÞ~î"2Òä:»}9·±|2 rÁc­V7GwÚ¼~¢ùYyZ
HÌ
&= Szö;¨a÷	^æÙ	zó}sRN³~FôZÅ-!ðnãÃÓÞ8NFné-1¯wÂbÜ^
¹±öbÇ°¿þÍ.áÛWMÀm´Ehå?®^ñ=MÁCQ»²Öz|pIªÙïÆÙo¦*(¡¦Où6®	ðè3jrJ~$¼³	òÊ¨|J®.ÈJRÓ¶¦¶;ÊV= ÎáNyØ&= >[;9T/ñS'ê¶È£(B2¸W÷LZü³é}ì¶ÖdÂ´= r5§údi59=Msf§ùfÿpÉ	= «ÉÄTwì[ êÝ¨µ@Å^6aw!Ééae)ë ú(eX1*¦6$è= ýW_Ùjá ,v%ñðÍcO)n=}Ë Aá(oÓÝªë'®äÉz¬QËPT­ yk+«VÄ¢v°vhòDDý«e«Å{\q{ZÌvD«X®ªX°ºXóÅ6Í{HÅ£XÄ×XËÃR»kDN7,JÉ¿ö35ÓâÜÌ2Ò$Ò¼õrçvi]æfº7ßèU:,ä-ÿ ãºjìk<æ¦Z¥*¥yì¶ºa©ØmbAxì¶®aüæ~hþæ¶¾ þèAæ¶Ê ÃwmHY%»a9Ä ×*¥Ò -HêîÊ¦Æ^ÁøL»%ø0RGÀØ	ÊÃ.¥¤k»\ÃhCsd­}«	¢9,é²ñ´øOÚ+HòMüÂªÜå»øÐljÓÍXQµÐ|2­­Çh yHÉø¸Êh±9Î'ØGå!ìøR³Î>:ñÐëüó7©B[®Ãësõ$ð­ËT7ÒV°£0Dl qKë_O½ î4YU3:8)ïôýUMQmÝ½óÆ"¬Ê;I¾äÍÂ3M?ïÌtøA§» RøÑ*«bÃÍru¬ÙÎÙôû3.Çêù6>+¦¶áÂ½Ög4áIKIÄN!wH?Õ#ÒHþ8µ)HW ß)cq= þø¨ü'j%ÝfúOÅ÷sÆº1(axÃZ	;÷ÂcÑÃïàÜ%$¥ÒFê¦àû·Çi~ï#¶ó¢cáØ^Ì÷ócÖ7.13ãpñ}ÄcÇ^¥hª+µÅiÈ=}RÓr;~¦K ìO´'¬ÜÅK'Y(â|.¶¾]à.N9Ñt½Ìì)½V -eÆ:ü³×µ0±W5³à²n*
þp,ÌVó¹¨0,.%ú$²%Odð= Vü²ê^&ü~bèÀN½ JrÒMbíø¢=M×÷.þÛ3îìãLô:ë¹épõ	9@µF0Þõ×	9úÍù:|ÑÈ¯9ÞG ¹Ñ%QJ·³Ù¤é8¡ð6ÍR*Õ.xOWó·­KWÏ¦¾*ºfç8°ðk¹oa¥ÝÇ S¹%¾õèëÈ_@ôú4á\%5¥º¾2+Àb×:æÂaöd=}ï?:-Î4²Mc]?¼Rdñy(gY°*qñ*ôsEÀsBwåG:¦×/p?Fx<ÕEv= º¦À¾V\0èl~q¥³u= ÒF¾îÿËm}ãTßÆÞ§ ´¾Ø¥gli£)ÁäSÒ×HàJi=}ÑÃ
;Ü]xÆ ÷¹pÈÉØ.; L\v+A¾¦ûì!¤×­¤O´ú»å®>1ó&
ðê¾§ÿD]·þûÔm¦XrE¹ ÿm=}2:ÊûOuËjÉD%'gqzóD3Æè&'=}ð¶dA k2N~ÈÏÄç+#9TU1sðÝ¦AUÁTDW0vS°¨-XgÇoq®ñ Zæ!:~óÄe"ç×ç0 ³Cé.ÐF§*ÊëÆÞGfËÔc[,$Í¶ã9äªÖ khc ÙrÄÀ#Éî2§Î4ÎúÍ/LÝgÄ¾èz§Ò<<I¤Ô µëÂÕë¬ôô¢TÝ÷s[ýh0º@ÞPõËç¨!:ä¹ÆUÈìQÎ%±#ûd@ô¤ÐRÝÕñû=}pYW­ý\BÃì¬î³ ºóDÏ4=MiÍûÈUý?ºÐR´_{µªX¥Ñ- ¢H©-Ê=}dÈÎK©ò«Þ	ÿ·K,Å6¡À¡@òGÜn¹ÆS.]
QÌ-9ÆÿTâû²ÍtèGü>èT°²7EÍwÎ@a>Zä»p«>äPõ[ÙÒ¶Ú'Êºö0Çxqò®J94=MMiÃ\£mïÀ&§nIø§nIüsMT\r9+È×S$Åê%Ñìô'sªG4aú°rÉk´%×Vy¯¸)x$Ú_¨y°,ÃæÀGgÏ"'~ôzË'Zàº_ÔMÁ<¼.ç;¥A¼=}ÈLTQ®uÒL0y·ï³@?:uÍ^Ó= bÝþékttå"VaJ÷	=MepÕkº^<Az_­îÒ$a<ÁCqY³(1Ávy½¯CBÇoI&
H}§1hFãCoÍþþ
 7¥äJa&aï÷>÷¾#/_.è>0 I¦0":xÁÒBÿî
aÊ;ÅÀj4F>Y¾ºÉi¤>Ê{7ÀíëÑÓ±Ó=}F³Y= ±HÙãærN\1EI=}²]òÐMÍÀô:$%HyR­4uR°Ñ_"¤ÿâ¤77_«å2Òeáí¤îA ¤"d×¾ã®/Su0¾µ"©ãhWÒÔÓaèH ^y²g	.á¥ê¯3©¸E"ÞÒ¥lM¬}Øü'Aõ«§J=M:1;£òòJãÿEë¬-N~p§ô!øEy±Ù@þ²§à.^êï[d¨oÎ×»iQ¿­µOµ@B)³0 úlº_#þf{j|>0õÎðÖDYSi3ûYL}ýn®ÞTW´BO]ÝÑ.¬ýÚýÝä|JYîYø$= ~gC:¤ß¬í>ó»«¥L¡¼GÖÀeÞe±= ö2ä	õ²±Ãy[ÝÀ}ÑwÙóPzèCÂ.<©RÙ÷sbw¹!^°fybÙ&Àöy¨ì»ñ¢¿zr+*óË< hO^¼K¥v)|ÈQ&CFh._Sìè®ÑïJ¹Ó@GWÉêVAÃ!3´Ôý'V°É= sì÷¢³é $JtB°1æ.Ê@$Öù-±Q£bÿüFÈ±ùxë£(MÿR®^ íâÜ^ðÌü»äEu{­2.%üÚe=Mb§i¡k¯yO	©YÐy#Óï°Êj´ e¤õ°ªÒÛÿÇæHfOÛgN¸§¥<ªò;+J°¨V½Pâ¡ÁIZetE
Wå£Ñ$V9#ÛïGÑ]Q $3Im@ØþxUnã
xô²añ¦ýû-leýð¨Î,$lÕ°8(I­i$å  V¤stÝ	<"kæ£¸ä1 .N:{ÇÇ¡(Þ7K½üååAú+¸G3ç6-AJÐAj(ÉDÄÊBhnµc±wð­ÿrð$§ä¿¥ãôq#«ú¨}Â}ÅòïÏÜþ2b0WâLâÒÁ6Vâ ÀVÙ #_tà¶¾ìQn{Ç±^a%EÞ ² Íés"M÷E=MïË$>ZR·bö/\Cwkó/Qùn'OwÍÚå×KgçÀ!ã8B}òÎ>ÆPÄ¼B=M3ÄÚ5®ZÊ»&PîÇbç©S!ëV$Ò¤ç	ßÅãólÌWßhÑÍÞq(Ýq_ÚkÂÂÍªÿøiK0c«=M6g?I4%êÁñóEv¡r ÷ôþñ'ñ#,x1¯47RÕrÞ¸ßï= ã-È§îi{ÓÑÕílõnÒOû}¦^ 4§ÿ¾ÐÕ£ì©O÷Å¦6ÿÄC3>¢«oc[	«9d¼k|T&Ø3ê=MñwZêùÚBÑÉÀ÷ØÅ¶l7µ¤lw= ì?Ì«Ü»,ñ®W1ä{Å½÷µ «&¼¿!"µátÛbê¶v®Øc¢c²AXs¢¯dæø/¶ó%BH/R÷ýU?3_ Úw5Æ?Þ-l¡ý3­Û~ÐM(¦$J.p8ÊÐ+£õL6Îj@ÛÚàHÎ9Çïó!IjåùÈó´;h&m&qn-ýÑWHVÆâ8<M7t,PaC¹{Õv$>Ì¶Ìb«¦ xÕ¢=}1çÕ¢ÏBè¥Ä)R´Ìâ¯·¸FY$¹ÝïMÙ³\À1¶5)L×zÇ×VqÔYEeéÓ«?8ºáèÎqHi,f[C4±º#Ûþ<	^ZÃ[²Kó¦º¶ë¨PsÝá¹B±ìù3{ÄeEeÂC8T!ZqªPà$,¶4DÐclN6ÀÍqHÿIl § Ä#«û!t¼þÐé&õObì¶¡mùqAïM«s½-:ó
Sÿ9aRëi: 5>È÷Q$gôM+öj]5+ÈÊWjáêv NÙSè¯)!'Sªeªdze=}rÊbî²ÅFþlÄRÅFtSªªjH(À÷h){WüòÕNÆîÂe_AÁ³C h[_Æß®¨3yâ?¥<Ô~ø§Njgq³t¥¬oÎ<×MªEJ·réæ,+îÊ÷èb·ãÊÚÜÿ'§ËjJ«ÞíTöiéæÕÑP8:$Ñ»ª±ËüÁrv²:HM/X)iÒLì©¬éÀbvz¾òlnnA2å¯ë=}Ih6°fï
À	j	(Ü/¨C¨ñl¢ª=}ö
lDúèyEJ®ÓÉ,ÿH°NT øbvôjÄ²Øu~QÈ§òl¸²¨|o Ñ¬JÏl&gm×""E-íz¯ØöJ§ÆÚ%³[¡Üò¦n6Chõ zD?! ]®ä0^ØíseÍ¤°Lx<Æ¢Ô ó Þ5âBämQ36£éDa³ÔuôfÀöVã×ràû©^;>Õ0
\sJ7nX
ªAdb;%keüCeTÑ@ýü¡ÄÏ ¶sà1o{G¿üÕÁ«T%4ÎäEÝò=}ó)í3o¾Âëú¬YnÐä#ìÞ9Y(PQ
\¦	ä:ä$©= î·Óïëß~¸eH§8M¥1ø£¥ %(1è¾Ìj/ÃÀ¬&¼1Ó" kÁ+¨ëÌ7»VÝûÓùKó;ZA²æé¥ dÏ¿n>íÀ@®R¨ëv ^4÷
´"Jp¿ç®Ãsë6³ÁòÞðdpf òÿµV_JÁ]6_Õ½/=}ÃlÐ8ÃÏÎÉÈ½CÔþ¤ØÓÊÕæt{ÆL¼ ÖãÅÑØÓ-ÝcÆà½{dxÆõÀATÝRÏá2b6?7tÅ×zyèCÒ$?d{xþ¾%I&ûë-V:ìgAÞàé¼Í°@Ê¤'E'Ü'z(VÚ" ¹ö-:|&1ÈG3<x<a©VÇû!«R«ü6Ka¤Z5AýAÀø¦ü´mö_ìY<Ø[uâë8¶Ø× XýÖ@­­ûy>»À¤¨¶wnÊ m<tö[ÓïÉI¸MuñØS'´nP{mê9gqs÷>uû%Kñ§ùÆxcêR¸ª æÇûÝòå/(W×ìÿ¡)piAUYK O ÊÏxB#&Û¯nB²$âoÃÉZµ[3àdTÏëùqþôP07¯a¨Hsï;}66çRÈnâ= d-êÙßÝcÎ:òHAûþ×ÙzÜA'
G
ýyÀ|@Eã+±r³(ì({aÃ·@zÜÍî¬ÐïXWÞ7+R¿Px#+{uÖ2õwî=}Ríèx^löà§ÇmwO3¶!×ß$>cxÔ7¦-¡.¼-3yRî)N(ö$1áSõ gzÒöAªÆwÐ»'I¿VW,[5,ïÆáCéZÃ RE±ç&xûCuß¢x25äÓOõôdNµ}= *ÖäeÊÇÛåþÉ½g+Íf¥²pÉ\®!Xª¾¼Ç¸+R¤:¯3WºM-3ø!yZl0&(Yv\ê¨[ÅÖ¾ÝDlÓE.Ð2Ä¬J_§ÛN¾:ÐOÇÉ|µmHÿ7|t= Û!7%Lo-#4ÏU-Ê>¯¥RÕ[¢»ü§<ÃÌFÎúM	ê·4W©¼£´p@²èô§H{ù®¸ïäGº= ")Qúl3ª2{¼¦1EOè"U$ «««+_MR¢Bµ%s± i®ì×4ZáÅßÛ³ÏzâVèfíÆ$3ÑÒït~´Á¸ÝLz9ßo>´¤=MQdQ/V¸ÚQYÍûU¢v´©ÌYªÊ\<QÔ»ÄbXTÉÜ®YÀdµ7vãðð®û¨¼eÂÈUÑ\ÚT¿æ¬¤[Ï4Û;TÐ¢lÛ×<Ù8W+ÐÒ$,ÚzUË^ÄT¬y´AÔÐv<ÙoulÐ\Ü\(l³iäå7äC;4°²~Ñ!ÒøºSEv¡¸kjH,ÿV?B·/;¬CZ}¥|üÃfÎå÷:ja$½%m}øx«¾ÿæßtûb,®§B|êOaó&Ú²ÁËJ©Ã7àn¿DË=}RgY²½ï_òAð¢bgp¡@9ïôíÐG¦jlOÄ³U)¾= Å<<èî¿ÍBæËOSBYòB¡ý#667iè$êçå;pÈ3ä+=Má®lpÆ[ÎRÚG(CZ¿Øgk(»[2G±eä¸±®b{è±ÇÀ7Ò8®É T·û«z^$RO¡y°/-ÿ){ K¼UèÈQ{ï¾êN$c4÷È¦T.0Y;àx=}ÒÂçÚ,ÅTcÚÿ]¾8Ôjià9¶Öo{à¿­*ó¼è5¯uN¹ÄÛÅ­²î¯ÃéEP{>OFÐö§LUê°®i4~vwMúr"H(fL+ïÙ{é]¼ü[ðÂK±O Jgkÿ¤?xÿñ³wñKûò-òJoÐwÓ ôÏ»»hD°óßò
²|G<@´T¹Ç0d#äVh¸FÀRP§í±µu ù¬iª±7©å¯ç¹-Ô÷rY/ó|· F2lÇÑDüÌ®ÙB"KlNÝñ®úÁ6M-­ÛòyÖßùoOÓñ§]Í²Ï W7:ÛlMÄ»Zw¾|WªLOÎØÛlÂã/Ù@)öûjö8º\= "[ã6IRÛH-7 +À°a
ÜHdz°°ÕEµÕÎK;)"^£C²ö)h(µ²§aVÃDÇ\Íè<ô¬°eæ¡^-×%[ßKÌ=M¿wÔö¾ºûKï5:Â¢ÐÓG}yÛÏóT.ÎÜÁà\ôon
¾î?@âo3[vi[ÄZ<añåCGÛ@<6¼ Ü¸Àô.¼¼ª4#¸}SF·"YÎì+[:¡ÌZÂÔ(î|;UÑIEùÈóBLÊ5åïøY·*¼^°ÿoÌõ´r>§^ÈíMI½çúµqPjZsB=}³CsXÜ@#F¯¢P@IB)ðË= Î±0ô§­%Ô3sTÜÇ:X°4®Ø±ÏDQ>P<h,æÕfýÑ¬[¹´ü´LöÝ1YÍ\O¨Ù8\jEJ9	å×ÇÖÊ\è	MSêy¼±ÌÐzWÅ¯ÏªüûtRà¤ì#ÈoÌ}âÈ³ÒæÛ0ÂºÉÆ
A"°Ñ¸*M
I2&&Ü0ôóÎÉÍ¨FJ«ákKJM9"\Ïbaô0eÒb)30¿ÕÛ'òu£»n­Z\Ø¦$Bû5#Cvó9Ë8T"ÊÏ)ZË[èßÚÙ\ÓD[C,=MÎÎót½ò}¼65÷½XuÒZ?'u[+ó¡!±VÕÐõø¹¹Ïõºö¹	ÈÎðZHþ *TB!jÀ /z fÚ)FF7­Øþ²cvÿû¡fí{k&ñ¬Ôöÿ¤Ú³<à=M_ã ¿)Çª¶lY%  Ü4èåºo#÷æ6oé¾ÏtvËÞ²tSYõËwÐ¬ :#osdX;¬ãüYOVâ;¶ÚÀ1Oß6$ÞÐÿâÛTã.ÂëV~d¹]\3JHÁj·c"8Z¨3¹¡ 2r{;Ò¾Ê®ÙMmïcñ|üjín¹ÇY8:Aêñ.üÎ>¿Ö[%ÑØ]2¿ÂF£W1ì¼pÐÀ:|8çÖB»c¿ÓûÅµüaCªLôpÉ±|EÇ{ìþÜvÛèLe°¿BBkäµ1h+#ò>¶Ò»ãÓÂÆoº¤}ÞÅxnå² D,·Y,´é¥bÑOó2<i *ú+ÖôÁ¿p^-z3áÇA(ª57èg;3mHàþ|¼A	7n= = 'L	ä´9®"½O3ýñcGgò±ÌO:nø¼k=Mr´åWA}³øúÍlïÝ$âLxDrP:!ÏÏR:SVÜ­£5FUS1½ÿ0þæ¡-S,g§ç9jënÿL ¼1(hE½ÝãÇ>vdçè­1»cì¦mXïÂ«sé	;H½)Û¬U~ ¶¥Ò' ²gáX{tÕ1÷i§º-RÄSº3º¿nÇ:S¿¡s*2·F3ºK¦ï¢Rº½½KÉïhøô³|ëk¥8¨Ù¾@¨Ç[A±+³E¿Á¶w¤p*É¸ ï®ÜÔ%m%®Á_>lR.ç4[OþXi2þðÇÁH\#°?mAÊoï¼¦Ë9¢öÆr,wO ¯çÿË¦:\ÁB¦¬ÕÒ&w¡õ%kÆò* J:L¹Ê~èþu´N'Ño'®ð.8w±ÇkÖ¸óX(ô3ÉÏß©þÎ³ÓH5öi5S:aÞ M­Àã$ºêxlý}ÆíJJÓc%yqhàèHnG®F!¿/> Ë÷¿b_6Ô®62ª¾x°_çk$JP¶áBæB4q¨&!¤Û%ÈÝ«æ[S»±BÙwBªJZ7ò´ØOvü.ý´Ôn,}FïWþãÄª0'gáy/*½×ë±HC.ã0øñ~sùA'.Ã)5gß±§í1tWññü_RÕ#­V B)ºÝM(Â"¹e±ê%êåÐB±x¶.z­f{"âÞQà¦y?«0î]j¹y	×4¤äíç§¬»é(W<"ÅCæP_ê¬mnsRê×Ájíhñ£üçëÇOØ7K¨íÊÏ^véU%èrÎÑ§G"¢ûñ¶óWrP^§fnª¥ìj{G7H$³¸¤¥*RMüHÀ"ë¦ØÊ8®õ¼91û±Ó6H]QChçª7Û¤ÇÞËR1(öò~¿jqÚ¡BèB´qß>ª6Bª-uK2jø;1ÆUm>*À$Pb¯5H.%Ñ?§vOíIÅ¶µ[ @;q­31hK#Õ)GÍ*ËGÒ#^yiæ´±zIlæôÒát²Ï°n³ÆÞy²cZ¥R )ún]?ß²ËÙÇ6ÓÄ|ìöy ¶ëÑºhÀLæ\¨Õ8¾+|ay³íLíLíLíLíl|ÒVTÐ¥¦ ª VÄåDfÂSÌk(ª¬O¬:Ë|ÔQ¨ÊB*¾©Îlh>2ÜìDÓÝ86ó]NÙ±K°#J¸J²5¸5¸øiJ¸J|Ö´ÕÈÀYèi*Û¯WíIÆ\NL¬è¾7&÷+ñ¯lÛâ/»&ål¤àûÔõñI9lÀÎq|Ô"P#,(Ht$Â¹¯²ÂÉúÅKVI=M­u)*³iôk@:±cíM­_é~è0uù"l?°/³uwy°×&|[¾T))© ?¤CÉ¡þy9¢*Eøå>á áæEVÙ»Cw·lòàðóú¾ e®ºµ__Gîs;µØÁ¥À¤!'´@w'"x¨í,"$ã!chq¯ß.u.1øù
²ÑaÄórfÎ£Ì/¢ÕV,LrÏþðt±©Ó½éÖÝ²¹!÷¥IÝÝÞVàm´ÞVê4ÞVâtNæôNûÄMãNï¤NádüXð¸öÈ÷¨åPàpÎÛ¡¬Õó<¾@h4Îùû$qEògn= 1¡ ïÍ= 9¾áäµà¯Þ«M= ì_îjñ~ÞUö<½L	£[m)¾kIÑ¿H	¡âUo²YiÂ=M½Âék¢=M®¾hí<?¦P$,eYYcJMÿqÕÞ> õèÎÿÛ7y^î<ôSÍ]ôy>^h8= Ì}] s0,ôÒÞ^+·;#<I®ü~¼0V¡7¦a@5$ïe¬å!>Íédå´áþÚ_q$æxDQ 7{oÜÂå ½jk'ÖÀ>ÃÓíÌú}ép5,'8NWqøT&omI¸ãëÕmE¾p±ìø5þá,Àõ»¿VöÌó-Ë§L}{Ó/W0Êq¯»15*_Å0ÚXxw­Ô"iBwAéitª»sZ>ÙÌ*KLW°Ô/PÂ|÷¬§Î´µÓ6inkJ¸vSI¸Ê¦y»T»wÑ¶©6ºÚëÓTPÊìÙM(¹vâ¼Â «bÍPöQÒdxdè²m¼ádÚìcäaðS]º$ÈáÅyëÄTÀØÉýçCzåt|Þyì\:ãv´Ë=}ºà»ì¤ãD¾¥t¾¾ªÔþ×)×÷»ÕÞ¯\= Áõ!*>]
IÊôãâaEÍ$sÍFM-^ÍM-I-ù7	)	î.ó	Ê¶A,¦243RHº½¡£ ëøÊ= øçJ@Q³T#ì$ÇÉíR#ý/Uÿõ±ýnÇå1Ö¡£:Ç¨ì.Bj¼1PÉuw@¼lÉ#rL1µáýõÝmw#WãABppHÁ>ß;äM=Mi1Ó«þRH¤Ñ·XîJÊÀ7¤ªåj{®ZÉ³ÊJp£køG×µ­±&°ÔI¥Nê=};H´&ò}9yÈU¤Ê+~ÝènjhÐQD§¬¦^V)j\Û ¦T·ÀÓYÄ}ÝhÝì½¢¡Á¬ud<@;j6ø(¿»u*D©d¡onùÁìÏ(çÏ*üÁz%TÝfÙÔÜ|§´¤¿ÓÃÐðYPþÙ!ØgL¿·ty5ÜÕfÒ,Zr\s>Z§Å	®@6ÖÃÿÕXX¿Ô8¸t>ZÆ+= z,<= »ÊfÏ¨Ì¥åA ÃçÐ-O/Ð^ý=}à[»|ÀÆÂ?¨|kÌ=}ÝõV=M
´£d}KîQK¬ ÈÛüJBt${¶íºÖØËÔÈÏX_t*ØZ7ÌÞq¾´åûI2çmë'Å¬M÷¶múv«~9¥àY"%rè¶Í¦I¶ü¥¥÷÷»Õ9Ípu= Ö?Ê¦¶¡ü§Æw>ÌF6ÇÖ2qW³DXð.©ünþø'+dü%¨õõëT¤J*¯ªÑtÄ6'
mnÔÌÖ£ó3
ö¬ÛyªZg4þ08§iµ¹­_BàÜÒÕ»Ê¬Y#yâ£yµqT;.rVÍp³(FP#¯«®9« Y"^I$¨osxITâ~^ ÈÜ8ø#b6|nÉ¬Âÿ·BÅÒ&¨è2
-r mØÕa	¶5k1Gâ²¯Ïq7ÎÜøtÙ0{ÖcG:¤8+ÜÏk
;Ê!¢e4è3ÂGW[¯PÚ1ëÃYÖaùOþ>·Çj#¢Ò¦2õ9ºÎk#,_ùãÓ1«Ãò¯Ì¥$ÏbYªcJ¸\fÏ¨àéäUÞðÍÝßµÇSsüD¨ÈÒ7»°&c1}JXÎ¦L^÷ë[|¬ÇÈÔ>7(²Ô*à2^ÂÔ63wÇÊÃäM)î.=M*°ÀéðBÜ1ûõÝk²U£DÇSÑWgCjîj^/ª°)@£çjrØøÝáb ­EGÑE·÷p¡ØjÝ#(@o#8," Þ]vQi°tÞÙË;ß("åÝ]·¹ÛVªýêRf= íçrô
¬+ÛÒÚßß·Ïå«Æ= »lZùØÓJÉ4Êi?ca{YOú)n8'-ri~öÄ¨oeÜ£{ÖóÀÎ·J¸J¸ÃµJ¤£hÌºVÇÑ8ÜN6rRÿßrG3ÈçVXFÓþLÌN¿Ð¨ùdqj=}XdãEoÃE3G$hm«ÁéCùF¨úztQ÷/wÿzgQá*ÿ"Mx ú£~¡%õ»1ýVÀUÒ%\ò,ìÒ/j®	¤ÂµgXXÌ+/ö|wOa¼{'ðSå|lë {M/s¸²ÓªÛý2ýÌ,Õ¾ùfØdÑ¯í*­ùrGBÏÂwþz¾ù2OÌ© |þzÃÉù¾éÂò7§k±¡;AV	Øö/U|t(	<,Åö|%°1Âî¨9= QÄÜ:9ªpnâºÌëkÏ¦ò%Pîtçÿ:kql­VÉlhr¼c±yz"fÉ´À(#+¨7>Ùòn?+QE7úü·´ÇÌ´ØW"¼|£F{óô#¬:ûhh9d°¦O½Õ°Ùü¢v;¼D¯Êà!q¬û4û¬ÿ°·¹ZSÒIVö{Z¼äMÉ	j)W§¤c$j²ÊjÅè´À(×%ú£®øÒîÜºk=Mà4¾µF^Ä{µOX$»×;¬ªµÏÀ§1ÿhÏÏñ@ê	{^´Þô(ã$Aáà#ÿCëh49û'ËS^EPãßÁÂS©ºmHp8zHHÑo[¯mÇ?kêIñþ
Cceî%°Æî55¬M%-aÑ°eiGú Åk1:(/ÐçHmcÿÚ©¤«¨¨%lÍ=MÚöÆ·Wåbn~b9_Ñîp¹oâ%¯bò[uÖ	$áÆ/ï¼ºxBKvìðû¡¢Ù½ì^pðä{= nþZÔ%8qÿ
stýRC{ÊÃÏÿ¯*©ÌnÓ¯3©'[¬ÁÿNEhÞyaÑßúN£Ï¯T¹e±|= uo¤ÍÝXÿjC(l¼ÞÆ×VyÔ|F¾ú+=}q8GïÆV*²Á!×ÿºXà¶ WP^ÊUk
õÿÐ±èÆ:GÿÒ!G¨Ònlàm·ý¨ÖS$×gÈm!tDÉÄxAµx³J@[ ³½4?¼|m«À
ºÕy.g¶G¡D«Y÷ûªN¾ôÆf¼r´Ú N(XÍá¯üÙkÍþÖZ;"sz"v¦kÃ'SWyã)­17Ònî\ó2Ü8FkQâ$V¶æÆÏÝlþ2Â®¹;v(&g Díl'õÚC09ÜµÞ´>w\çÅZÜ#Êñ§*O$Á§ªút±£2ýG}¡?ù¥JA!Õ^Æ%Ñý y¼B÷m~¶0æ ©å|Uªô¿	ÃëÈÿû7ª,Kz)48©åRùH=}¼íÆïç±i]ü@Ãä°¢ÌÎïÕKâöÏtnöç«®YÓ#7#cÛËr¾6×m¾.£à^Ç=}àÆAÃU;Aý¯¹ÁÓÎ©QçÈ©î¶§èn?ù@ýB×ãýz¡èAtÏ[imÍlc®f,Ôó8ÿälçÆÀü¬·Î
ÿÒÂãÔ¦-Û{îYýZÿ,ÔÐê¯´#RêÑ(XMÞ= $î·â¯PÈõXNÞÛì½·Âú{"·NHP@¼m[Â¤AyxôË²AEìl¨=}íÊ|O
Hð·FÂu»=M1 tõccVúÆQg8iÉ1¸²o½aEºb¤n÷Í5¼&2$¸pÇþ¿PÂìúUx6ÒLkXuä©ßKyWCL£érGß=MÓ×$ÂÔ°Z*@ Ó´Ã1AR/.ØðÛÉ3/\\³.ÜxÁÂ»°ñª(Puù/«ÌåýÒ=}PKac4$5JFz;'+þ ¼Oc!jaFÿê¤'i/a1©½x/'ÙjËéÐR0Õ³³-^¦[Ü=M2ËduK	ÀhÍ=}LÇ¯/#E1ÇlnélY¡_eèþ*ÁCÖY%ÚDVÝÍ5ðMZcÛì%÷R¿XC\Ä©]±^n©fL}mâ·F)öû[NÛ¦RsÊ:¨jÆðº¯{Ø=MFrè×ú²×:Ë 1å8Ë÷ð÷?qZÝ u
N6 Ç@[µ ©­kÁ0Ð¥æX{FðM<ö×øÀIÈ9¾ºÐ»#{NL= MªÄSÀðê­é	Ç
êëUwXUkÀù¾PØºåÐ ±Ü_æçÈÜº1~XcÑ¤×Êp¹bÎ,&×»²ÁÎÌ³@pãX	R2ÂLÇëdÛfÚûvß|Ñ½J5æÍ´ùý"ÊlîÚL]\ÉÞÈ/föO³Ü3àqÜfâ¯^çÙ8ÚÔ_£F\ÛHØ,=MËð£<þþ|³ºQgì>3·ûBRÐïóEUîg?=M %º= Þc²}³ò!äÈã[WþdÍ¯­ãpoíRRx·E)¡ø'þSáÈðH{K°ß¯¢QkVw$£âìþ*=}~ÞYvVUðÀnÃÍÞã~á¹6\ÚDoÛTl-ÝÉöÓfÇÌ³.9Õ§Üû³ÔÖSY<$/pà@a¹lÑ*ö²Ì'¬Ý*0$Nª¤òüD ÷¾ÝÔÜrÇÏI¢ÕÔ¸ØU¤´,¦HÅ=}ø{Ò)ô£À2Mz2Ützk@áÌÝ­à>Öö´?xõÒÑ/§yÎÌ×üµ\úHØ\Ûív×è±ÜU¡[}[ÉËÌýSÝ¹+Y¸ØaßØÔüW¤L²üÖãe)0Ù¼¯6èëh\¾ü~ÑÄDÐ5n\ÎÔ {Ù¤aÛ_Ü<P§ÙÒú7±ëê0fG~2uBH×/òý";d·vJÑRG1j¥-¶1é3ÌÜìÝ¸±
¤ÖÀ°Ù\I0\±¬üêÏ$ ÙØWÖ ÜÙ\÷ýÇh_ºS´(³aìãºÞ§7QóÒ=M»''J­ºF´Í8¸ýöÀ[Ð¼vkX¬éØc >Ã|øÓûÐ'¯©ÑË[l_-7)¾Ã"ÑÍ	ba$ó;7ñqjùÉ9q<®úyä0#-Uðñ¸+=}ßH\)^R»cãpÏæÙ= ]È~½ÉáÛ³·:n]ä$Ê/ñ^|\Ëþ=}Ü²þq]tÑÄPP æ©¦¼ÌÌú*})CH0ï^DVF'ìåå·ÿ:b,æÅÛ[XIö^ÁopÛ~áSÆêSkïåÉ.ôe_]³1½ò5ÍâÚÐÏ-ó!"#.µ +¸m_±l±2#¬æ|ëEÁDÁ Ö¾F8´Ü4»¿§ºL´Ã|Ò×¬WÈ\²ë¨ªÒã#T©-.êÞ°¯°\9ßâ¢Ös{^m}] fcâb.ÃD<Û«¨Ñ\¼¸ L,:$°ªÀ;´g&³&mÎøùéY4Þ
/0D^:£r¢d1ànÙ=}7ìâº·§}ãDþ´&½èbÿ6WßÉÎ:ÈãçPW©òìôØþÃ¡äUÚHÖËLÈçcxêìÓ÷}t^ëèT}½<ÿºõKz¬<Ü$ÓxK)ê¡5§íúó
¤ «"&ñg_YX{kÿg'Á!/uGÍ3õHbtqiwâ/unÃÍ®Hu=M«= [q^PBJ°Z©ÌXÃrí8ô|ï½'þrÐ~ahV®L-µ
kÛLæôs4¬F8¤|×Ô8.¥äÙZn x0|jÙÎV@-²R9«Úzâ= êÇ<ßí@®§{L98ÕU6²­GjàñÃ¡I¼O§ärØö:.º&¾¿£Î9QÓMì-m¡¢éÐ £ðËÌ5ÄbýÃÓ~Y6çú
KTN.ºbìµñÑz^ÐìÀ¨£ºÌ¼Û#NÊØ;4¡U­£¢^±}Í¼bñË+vS³2¦ô*ú¸õÀ\pÌ
wHdkK-l,z#¾[?·ÞdàKeÎÚÓ&üWÿ¶§Ú ÉÊ®Ú<úüj«FeJ{¯ðdgÑ|Òí­µtØRåû¨8LùLxÏbÎfWH®ö¹ø·-°=}»oÙhóÖÀÈ÷åµËtfºúÇ^õ,ÔÙ¨¢]£(&ÀS1ð­Ó;xüXù¨Ì:yo]Ã^H½øN÷2º"áCBøY»cõc}ð1x:$¤sZºÏw@ ¼Ä·~qR¿^jvøò×ogvùßF,Ïâke>óT7|°tf®Ñ>Ü¸uÝÏiq_al@´ã»[!=},»èLe,<VC×ÐWD©=M/l«Ö6{U%ÔR±
ßg¾bÀò¢×¬XxSïõüÅ¾ªÐEÕ¢j/3^¦7(óýc¦<¾ÎÞµVÄlUßgvÉCæ·V»5ß~kÛcXøÚÍÁ7¤$Ìæ¡ú}¬ÁÚ=M ]ü¶»«$¹Î§y9bznáküÇ9t£Ã$í=M6Qfx=MÈõôqð+½²WöÑkõ©Æ×%vBb>ïLØmwøÀêh*®Ê-ßw4»F²O!Ü¿9}[Ïo¦çD©=MK·"¼©¡ð¸<k»úÍêØPs¨
Ï¡©ûÚÙêtq+³Xð}8\¥iÅàlGÂ«@cªc%m9³#Æ¼=M¤ÎÚD0AQ=}0Dá^âTè_6h²Ûiÿ}}·[¼/iöc<%¢:lhp<¶s]ºr÷ïÙ2k]q¬éJÐAÞÏÐWn½Ëêìÿ#ö#8{âö¹¢[¸Ìªt(:Ða8¬V¦F{\§
ßKG¨@4)óÀÄ·¼òEjÌ U:©§f$_èÚHIÍ© ¼I\)ý~HÒJÿN±z{6bªHìÙU¿È°ÊváÛ©ôd/¬ý#f{yxÏ;µó6°¥ÕÞÀ²#¤Ð*ÄªOæq¦[EÍ9ÇhÁ´ÊÚï5%=}»ð9/Ñ!eöâsßQÙ«£þ2áËyDÄKÆkcÜ¾5´ðø©nÔ³òQsA5íÍo\ O7ÉdõÂø·¨CÔÛníUy/Xd= äÄúWõ®&=}P,i·iÞ3®QÒIÞâNO4âCñ0®ÄÒäÿ¡XaL)ø,þ+\'¢«·5j¯*®=}í,;;~zªMD7Ç£ñPe.7¦Mk9àìñkÇÙ3Ü¡ÁÿÛTÅµ×ÓuywDiË)mµK}=}%A³·ùç:Y´J~ìôìÁÅOßb0à}x©¤ôË:h{UäÂqÆß¹¾Zo´þçð²?ÿÊîÉ4L;öÿQ¢º;ªL=M}m§°¦ ûO@x
És+~¿kéË'T$>b×ºf§9ðîw(ÒniÛXË+,ç41é£º$½¸;¾©¶=}ª¬¹m¸Ûô= wÞñ·aY3ün¡"ØüK9¢ÊÃR0)7vâÄÍ­|ê¦o¤ñÁ¤Ä%µËÅ£@HÓç¡%»¡äî¥´ã²£¤'Ô}Á¾÷çVà»+/íOb_TsÎ$-Øöp_±ÜÆèÍ]À ¥þð Ãc8X,ôTv¸
¾Ë/yVh¬¹Fd °j"wç5¹¶°Hº ¥L¦ÄjÓ[þÕª·îÑ«$=}[E	ç]|O¹µÕLý÷½+ÛWÍ±¾ÕOfÐ=MýÏHlÉtá;ðd¿(øK@N=}üDÏfg¸5ç£''lV|Å3ä¸fgò}= ús
²ÀÀ«Èì)ËI1þâ×¶XÈ¦W|þ¬UÿdlQt¸ÒDë°ÌeK¸-&±_Q@5ò¨lx ´j÷ÃX]ýÚÞ}$IÎH ÚxIUÚËÔdY-çQ5Q 7	·[(~_ýàB¢X0ûê²¿Ê¿H®þ:jãr£§XWÖ6rã¼Òm¹>rh."èÊN¨­õê#Ï8Ä8rÛh/Ã1%}¨LZøÅ(Ì,QÈïG§ º3Ô#ÄÊ
M Ü§y°úFmÅnÀ¤ D-µMA lkúFdÅ0<¿÷.UWEüâ$9q!2}éA®Ø²V= ÔH¼©GG1ö{2Ò¶z:bG«ØZ£¢»cùp©uQbnPùº8Ö¦¤_wN°ý:-® pcx¨Æ
Fô9FmKßãlsÊÁ³´^xãÆ_£«Oë^¸#r;n;SÃQ¯ârñZ'kXK§i÷Ò§u0×úQð>÷»hÁt¾èNºÁ@yiß2]¡@'»r¿ÆoøE§u¨Y-ç1Û@+Ä/9pÁ¾±Õ'pÃ1)&kX|ó~á´Â$Võ2!}G»¶?IÚÒxòÆ_¯Ò@kô¾½îðô'ûÙ2öP§ :æÉ¶Ï\èÎÑD¶ØDÂ¯ârù{ÌÔÈ÷Ë«Ðlië\.§y¯­ârDTcp	NlV#2^'g¨CXkÙÂÂRíu1>+B}ñàÌØ_ÈÅ
¨öËf!}ck|É§¤3âèùÙïMpºÊgYÒûôÏÍËÚSkä¡\.bòo!WÊúò[ü3JTjiÂnËë3Æäº=MÊ¹\&4Ko}¶·XôXÃ8õWWå)= à2µ	¦ä«ÚFXK§}¯z-ú®\«Ó¨Õ552[:â2u0öâÈSXÍ²h­TØÇs\.£yg&Tô©3@lÌÇ.¯DlèB¯âÂ#sJ¬¾}¥&>Òç)'v0þÆ_¯JT¼öUãFÖÂ×Ú%QöÂnUÜx»°ñµW\¯¯¥²p.r|ªF	*É ¡Ø§u0·Ýº}+èûÚ[ùlw\YÂcS\.b2^/}Ëü= ôü£LGXëÖË@+BôÑÄöØÎ|ü±Üyg·L{þð;·"É>öñnG$L¶Ó¯û¹Ì­´úÛæK#ò_CGÜ:[!ra°ëFËÍ¤a÷¥ .¸6ûÑÙUöWÃ¾ÓqÜ#èóÈ <§¶-bzÌ¤	FJ#2{Æ¦gIÂÞ'0>â_àVïÖÑNµ Ìï­I3Ê(¹ë¼hWêÊ[6ÃÝµ15öð-c»>2SÒpÖãlË±Ñà¥ÊdO¦ÿXç*= Ðn¶Çµ« Ej(W´ççý×Å£ð¥¯ÊË­·¹Ïj2ºG+~2à'£ÛC´¹ÑH3ö-®íGûâ'ªEóõ®Ëªà*Drë\-{T£õ6©ºòÿ-âI¬Å­ÇP Øå[ÀEËub}ñ£#HNÞR\z[~ .è¯âòc!!ÓaËì2ÓìÈ©êÀòQ½+ñ¬_§Vg
ß2]çPÇâL¨·ð~b±m-çqD<.ä4yk/VP$â§]¯ì×&=M×>pÓS¬ÆC_K%Q¥ s»tÂëÅt­âQ;ÈV	ìÒ)ËÎ=Mêöâ»¯Qïrl«xz»?-ã1¯7ÛZ·2ñMAÄ bY-i2VljßFÞ7[ÛdÜgj¹Ðq$!;q; "H¨WMÈH}èGø|í
Ô¾X¢ºØËÝBÄfH>!,z°§ðÉÇ«h²N= ¡ñ~#\%Ä¸+ØãäªC²¼¨°¢eÏÃÁãæÞÙÑ=MáªØèSÁ{VçØ@ÖTqEÄN\	ÁËP÷Ø52dâºÊ3ck~40ò}Ñ]8²BÅYèÜm_n»#r^/}cLÐ jÄËHè<!"}é!ôK};Ï³|[VMd)Ø>¸§<ª»![Ìäg98ÁÐfÏ6\Ñ¿Ádx¥Î§³«á
%ór|vºÖóÏX¯Ñ268K¥2mâêû
Çj@;¸%Ø©)ä5ò*w¾:}#²YØ$4ËÝ2]3$~Sc= 0wPnåqßÚY	Yób³¸üÙQ ËàjQ@ç:-ëúÜ×-º(hQìWÖyÃÏm¨l·õraÁ¾G ãLK¡´ìK"}ñ%ØqF"ôÖ«·r¬ðàBJPt«u"¢¨õÖjS¹gd5ÒÈIóbø|Ôü½E1îÆ_3Æ|R¯~Q7ÏÔèK"è7ý>^ë
 ×Ô :-dé!dë¹Fø ÐâÆûC2³´Ï1çw[[ì»çÅ_h[7$LbîL;|É¥ôq?Áf/$ìúÏE?Ù NÝ^-éb>Ñàÿß]mÝíÞ1ýøéãl]Ýâmýýÿåþí!½Þ]Þm[ùDÃþÅ*]t±éãWÌ~4ãDìBº³º­+,Ñ9¤ÝTì = súñÒþ°= ¦$+ã¨Ýä*ÓM®èPMq	Ïm2Äë/Ïí°ª% !¼Ü¶ýpÉåí];P¨´å¢û3¹ÜñvuAÖTÔC$SA¥ø;$3pðsOËkÒ´F)*zV6×^áþ*= qáÅÝv3DsóßsÇè©´i =}î6s¥gØÇÆ8Ùø>NJý ¡×W|BÕr2±sZ=}J26ñ^¿^mï<ì]ÁÀ#±ÖHbÝNu_Ò§È-@×ë©%Ë{gUy«KWªæ~ôâQMg#5­3íF¿úU Ñ¹	P»V$;®u~Ð5¶nA¥x9½d6ÑjPëéßÜàÅèBìªCTè¸¯7(08;²ñCÁC¡BQêöÐsª6ÊDYJÕóV+\D­Ë ÜÙºÙTÉÜÞiÜÜxòÝÜ²4×4óáÿl>mRâû¯zBÒvssa²øs¬Û¢rßUr>÷^$³æýÏ.xîÎìÖÏôÇ$Í»dÓ¸ª^ì{ó-,{Ê>Kaæä·)eÎ¹^7Ô#x®m_1Ý¼í:õ ÅÝËd÷ÿ/gÚèù7B^³$,KÁª)ì×fíÎPÆÒÜ¥Å°{åX¡~¡j}XôÕÃÇZé¸¯Vro;ØîûÛszFÿÌ&yì¾àÛ¾_}}ûòKç¹ªÚ= }t(Îlf'à²»eL=}aãx'¦ûniÊ¦#1¹üoB]]­Ýã~ó¹³\,ÇaÅFWæÙNHæ0$xïÓ_ü#ïL	[ð_V÷µ= ³Cñ©I<+f§g'LÆ?bû!cµÐGzóöÂÆõ	= ¿$ñÄ=}Á×qÄÃúùt3£B0üëGÓVÞ¨= µS§úbT¹QO É6
iv=MoD®x6Li¡ì®¾¹HÃ»Ý#ÖnÃË">à~>i8VÞÚÔ.qL²ñ ¿æg*¬vL³!0#l£~óÖ{tÐ:­$Õrÿ
þrºÙz³n	8Kçî¨eMù!Ø{"ñzç@±d|¸ýÊÚuÙ£÷+U7ÀÄRì.)ûò uÚp¢x [ßFfÛ@è@ôÃÖt°SoÆsòS1±÷sØe¸;N¥»º©­&Ï¥·D-}q§INüq7V?0a°ø×|' Ò#3Ó»4Á©¸ÖÙ yÌ'°#_ÿ³v
Oó3S¨û}=})í·ÄëÀí\xýZú¡:à5|ìÜT®)C38<¯³ù¢Ø¡ñ;ºw;çÕÀÆF¥r[&ù°hÎ«9ªÒ³¡VÅP5¾ÿ4¼eín«êÅçiYíaZ­ÙüdÙZIUuH¬­öo*}ÀWë[@,?¢ØUTÔ"\²]Óö~y6Ë sû µöòcÈùRi3¹}#÷Z$ZóÚnvÈ{=}ín8EØÿÇäÎõ×¢CÒY¹1£KyÙ õWvA<R§ço|¤t[ÉjPÚÌéª«C~!7R´|ü´ÂÇð7p¯õNhñIïØnei"¬fUp= j"Æaxª-=Mw©¿Í 	é,7ûÔë&ÚéiÔ&Vð¨ñÍz(%8;À®¬~J1Â°ÖëÇ¤:1|&eµaevÞof uJw¬¥ÀÖÂáh¦ïM¸âJäÆsíhå!T=M¶sÝ)gbíü*¦ÿ·À(w©g	OiVxD%Yÿj³	L?0ÉY?Ã­4L¡fâÅÎÔã¿RM6¢ô^è±¢ºÊãëàÕR<?ÀÒ3±ïwå´B2Iä òÅö%ÊÈn)xfØÍõ3h=M°×àO´õ\kÌÖ ut$ím?®sG£TLÿC.'È¬{¨wtYØáö«ÐÛ¨I\|d= $O×dóF·)@úzû$ìLÍëj|°5Yrä*ÞÉ÷j×Ðù|Eç°wxVÔ~Hò q~ùÂ(ï½g÷9­Ä*.Òe»¬È*î©È Y
àòÅ¼]wí;»ãE$¿OÊ D¼zALý&»Åº5¡kÄkÅO$¨cf;0Óûrô|)kþ×èøl=MSjà¨AüNFÎë³W¾Ì³·yÙËG¡ô=MÕ.g9}û¶z¤¥ù²!Õü,P	XZ<öÎþ¾¡6G×å@¯XÉûñT8 04&¥ÒäA±¼Æ÷ò¤Û!µL·'¿'uÙT;å"ÿ_AS:L<àÜfÄægw_Èºal¼	yOv2í<u'¸z9¿õ@w*Ïóæ+G©ý³#OÆsÀ/cÛ¡{Á©ªä©SRA1&È(E£*¨åá®?4¢)Òû{2Ù¢Ø3_4nc·ÈWAqVÛðY<rÎ+k¨°4¤Rlðõ<+~äo<õ>Kj4Æ±ØÍË6À_5\
Bél ­Ì×¨&í"¤ãÙh«-úUíÐÒq¨Õ®VìÒwTÔôuª¨ïI^þ(¶-ðja_\hðnÇgù»fÛÛÈ¶Z±m¬O¡9!F'üWÙå	þ©mw9gP¬N'ï¶
³,°
gXUÃïÛ(Ï´]iDòÚ?«EÈBl6Ý ÖÍAäZ¢VYØ×íÊT®ÎU
 HÜ¿¬.WzÚ­ö. ¹¿ú©)hB»9ø6ÛérAceL¯ç
9g¢ya¦%®S+c§S9²×XÛ§Xl÷t	¢X,ãÎã¼QîÖöM§ÉeOG©F9Äe³e#+üBè7|0
r ÐKä»I± ih£¾z­]ÈØY,¿:ã&*»P&Yâù6VÃ>PµÚ8çºìêöø\s}Ê«»ühÂ¾ã÷ù9VñÌ,³Ùµ©o{áVDOMøú¤uX3t:6í©5j%)ùÿeWÒsd{½±H¦]¸ä#%2-ýw¡{¦2c1¶ZÇô{~	oz¨õøFcÃ³!S~Î8í¾w þ¨Ë&Øµ
g¹¯´ì±Ñp·¯Æúj!Ùê3û|©Ña°9èó PSàj¨ÎZ®%WçÇ&Õ¹0 Á(d¤=M_¸tð÷û(×ÁÌ»Êú@\åPË}ãH:¥/vªËß ®è" \Ð=Mî¤kÛ(ÝN¸µ[ì\Ú¢µ_<U¡C×·9öbsR¾5rqêïðÙd@Ý
¸êÃUZ´=}ÆÉ
CU¡ÍÌ]Âuf¸i^ÍN¸<ößiIÒzWHÈDkòPë­Kã.í»+{J¸V0¸J¸J¸Ã³J#Ä8+KÉA¥NAú¬Í)ôÂ¼¡%°|ù(JPsS±E¯j=M-2Þ[6+Ïû¿²h$É³0= êL,§D1ÌJÈBrÚ YÏxSòRFx¤ÚK+ÐÃ:&öôêGº´;ÌúÏà7Ðr´Í6I)ó÷~~àrOy­E\ÔfËøª¬ÓFÜ§ìpQ¯{¨EO:.ÆÔEÊm¢Ä¹#{±
r÷|ú
*ÔàñT' 8KpLjúwù@Q(HÎj{¥¦SÙ01TÀ7F<â<$êÐÉSLVa·ËEk´&[[Ê×zôEtF@Ë9KV©ÇEÙK¬)G4WÛWv3ýn§ÁçÂxârjz= phxdtl|\=}-M¥ìÉÜ\¾Ù%Á?vq³¾Ãð6æøÇ]\C"3ú¹ï 5ÞÞçpXç)z²^Rû÷üoõ{µ(âw]WT½Ïm§Cö4&t]Ât[bìÓ®\%óêëÌÔfìW´@¨ÁÚ_ª÷n xV½é9]MàËàUßÍ/»äµÝ<½äÙÝåáýõaY¿DÅìZÀìØüÛ£üÞÿÍ$Z-×8Ò\ Üb½RLhuñ®äâøþsBV_»ë»Um3
½ÇaztÅò¬¼Åâ` });
  var imports = {
    "a": wasmImports
  };
  this.setModule = (data) => {
    WASMAudioDecoderCommon2.setModule(EmscriptenWASM, data);
  };
  this.getModule = () => WASMAudioDecoderCommon2.getModule(EmscriptenWASM);
  this.instantiate = () => {
    this.getModule().then((wasm) => WebAssembly.instantiate(wasm, imports)).then((instance) => {
      const wasmExports = instance.exports;
      assignWasmExports(wasmExports);
      wasmMemory = wasmExports["k"];
      updateMemoryViews();
      initRuntime(wasmExports);
      ready();
    });
    this.ready = new Promise((resolve) => {
      ready = resolve;
    }).then(() => {
      this.HEAP = wasmMemory.buffer;
      this.malloc = _malloc;
      this.free = _free;
      this.mpeg_decoder_feed = _mpeg_decoder_feed;
      this.mpeg_decoder_read = _mpeg_decoder_read;
      this.mpeg_frame_decoder_create = _mpeg_frame_decoder_create;
      this.mpeg_frame_decoder_destroy = _mpeg_frame_decoder_destroy;
    });
    return this;
  };
}

// node_modules/mpg123-decoder/src/MPEGDecoder.js
function MPEGDecoder(options = {}) {
  this._init = () => {
    return new this._WASMAudioDecoderCommon().instantiate(this._EmscriptenWASM, this._module).then((common) => {
      this._common = common;
      this._sampleRate = 0;
      this._inputBytes = 0;
      this._outputSamples = 0;
      this._frameNumber = 0;
      this._input = this._common.allocateTypedArray(
        this._inputSize,
        Uint8Array
      );
      this._output = this._common.allocateTypedArray(
        this._outputSize,
        Float32Array
      );
      const decoderPtr = this._common.allocateTypedArray(1, Uint32Array);
      this._samplesDecodedPtr = this._common.allocateTypedArray(
        1,
        Uint32Array
      );
      this._sampleRatePtr = this._common.allocateTypedArray(1, Uint32Array);
      this._errorStringPtr = this._common.allocateTypedArray(1, Uint32Array);
      const error = this._common.wasm.mpeg_frame_decoder_create(
        decoderPtr.ptr,
        options.enableGapless === false ? 0 : 1
        // default to enabled
      );
      if (error) {
        throw Error(this._getErrorMessage(error));
      }
      this._decoder = decoderPtr.buf[0];
    });
  };
  Object.defineProperty(this, "ready", {
    enumerable: true,
    get: () => this._ready
  });
  this._getErrorMessage = (error) => error + " " + this._common.codeToString(this._errorStringPtr.buf[0]);
  this.reset = () => {
    this.free();
    return this._init();
  };
  this.free = () => {
    this._common.wasm.mpeg_frame_decoder_destroy(this._decoder);
    this._common.wasm.free(this._decoder);
    this._common.free();
  };
  this.decode = (data) => {
    let output = [], errors = [], samples = 0;
    if (!(data instanceof Uint8Array))
      throw Error(
        "Data to decode must be Uint8Array. Instead got " + typeof data
      );
    feed:
      for (let dataOffset = 0, dataChunkLength = 0; dataOffset < data.length; dataOffset += dataChunkLength) {
        const dataChunk = data.subarray(dataOffset, this._input.len + dataOffset);
        dataChunkLength = dataChunk.length;
        this._inputBytes += dataChunkLength;
        this._input.buf.set(dataChunk);
        let error = this._common.wasm.mpeg_decoder_feed(
          this._decoder,
          this._input.ptr,
          dataChunkLength
        );
        if (error === -10) {
          continue feed;
        }
        read:
          while (true) {
            this._samplesDecodedPtr.buf[0] = 0;
            error = this._common.wasm.mpeg_decoder_read(
              this._decoder,
              this._output.ptr,
              this._output.len,
              this._samplesDecodedPtr.ptr,
              this._sampleRatePtr.ptr,
              this._errorStringPtr.ptr
            );
            const samplesDecoded = this._samplesDecodedPtr.buf[0];
            this._outputSamples += samplesDecoded;
            if (samplesDecoded) {
              samples += samplesDecoded;
              output.push([
                this._output.buf.slice(0, samplesDecoded),
                this._output.buf.slice(samplesDecoded, samplesDecoded * 2)
              ]);
            }
            if (error == -11) {
              continue read;
            } else if (error === -10) {
              continue feed;
            } else if (error) {
              const message = this._getErrorMessage(error);
              console.error("mpg123-decoder: " + message);
              this._common.addError(
                errors,
                message,
                0,
                this._frameNumber,
                this._inputBytes,
                this._outputSamples
              );
            }
          }
      }
    return this._WASMAudioDecoderCommon.getDecodedAudioMultiChannel(
      errors,
      output,
      2,
      samples,
      this._sampleRatePtr.buf[0]
    );
  };
  this.decodeFrame = (mpegFrame) => {
    const decoded = this.decode(mpegFrame);
    this._frameNumber++;
    return decoded;
  };
  this.decodeFrames = (mpegFrames) => {
    let output = [], errors = [], samples = 0, i = 0;
    while (i < mpegFrames.length) {
      const decoded = this.decodeFrame(mpegFrames[i++]);
      output.push(decoded.channelData);
      errors = errors.concat(decoded.errors);
      samples += decoded.samplesDecoded;
    }
    return this._WASMAudioDecoderCommon.getDecodedAudioMultiChannel(
      errors,
      output,
      2,
      samples,
      this._sampleRatePtr.buf[0]
    );
  };
  this._isWebWorker = MPEGDecoder.isWebWorker;
  this._WASMAudioDecoderCommon = MPEGDecoder.WASMAudioDecoderCommon || WASMAudioDecoderCommon;
  this._EmscriptenWASM = MPEGDecoder.EmscriptenWASM || EmscriptenWASM;
  this._module = MPEGDecoder.module;
  this._inputSize = 2 ** 16;
  this._outputSize = 2889 * 16 * 2;
  this._ready = this._init();
  return this;
}

// node_modules/mpg123-decoder/src/MPEGDecoderWebWorker.js
init_globals();
var MPEGDecoderWebWorker = class extends WASMAudioDecoderWorker {
  constructor(options) {
    super(options, "mpg123-decoder", MPEGDecoder, EmscriptenWASM);
  }
  async decode(data) {
    return this.postToDecoder("decode", data);
  }
  async decodeFrame(data) {
    return this.postToDecoder("decodeFrame", data);
  }
  async decodeFrames(data) {
    return this.postToDecoder("decodeFrames", data);
  }
};

// node_modules/mpg123-decoder/index.js
assignNames(MPEGDecoder, "MPEGDecoder");
assignNames(MPEGDecoderWebWorker, "MPEGDecoderWebWorker");

// src/analysis-mp3.js
var import_music_tempo = __toESM(require_MusicTempo());
var TARGET_SR = 44100;
function decodeWav(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (riff !== "RIFF" || wave !== "WAVE")
    throw new Error("Arquivo n\xE3o \xE9 um WAV v\xE1lido");
  let offset = 12;
  let audioFormat, numChannels, sampleRate, bitsPerSample, dataOffset, dataSize;
  while (offset < arrayBuffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === "fmt ") {
      audioFormat = view.getUint16(offset + 8, true);
      numChannels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
      bitsPerSample = view.getUint16(offset + 22, true);
    } else if (chunkId === "data") {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0)
      offset++;
  }
  if (!sampleRate || !dataOffset)
    throw new Error("WAV sem chunks fmt/data v\xE1lidos");
  const numSamples = Math.floor(dataSize / (numChannels * bitsPerSample / 8));
  const mono = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    let sum = 0;
    for (let c = 0; c < numChannels; c++) {
      const byteOffset = dataOffset + (i * numChannels + c) * (bitsPerSample / 8);
      let sample = 0;
      if (audioFormat === 3 && bitsPerSample === 32) {
        sample = view.getFloat32(byteOffset, true);
      } else if (bitsPerSample === 16) {
        sample = view.getInt16(byteOffset, true) / 32768;
      } else if (bitsPerSample === 24) {
        const b0 = view.getUint8(byteOffset);
        const b1 = view.getUint8(byteOffset + 1);
        const b2 = view.getUint8(byteOffset + 2);
        let val = b2 << 16 | b1 << 8 | b0;
        if (val & 8388608)
          val |= ~16777215;
        sample = val / 8388608;
      } else if (bitsPerSample === 8) {
        sample = (view.getUint8(byteOffset) - 128) / 128;
      }
      sum += sample;
    }
    mono[i] = sum / numChannels;
  }
  return { mono, sampleRate };
}
async function decodeMp3(arrayBuffer) {
  const decoder = new MPEGDecoder();
  await decoder.ready;
  const { channelData, samplesDecoded, sampleRate } = decoder.decode(new Uint8Array(arrayBuffer));
  decoder.free();
  let mono;
  if (channelData.length === 1) {
    mono = channelData[0];
  } else {
    mono = new Float32Array(samplesDecoded);
    for (let i = 0; i < samplesDecoded; i++) {
      let sum = 0;
      for (let c = 0; c < channelData.length; c++)
        sum += channelData[c][i];
      mono[i] = sum / channelData.length;
    }
  }
  return { mono, sampleRate };
}
function resample(mono, srcRate) {
  if (srcRate === TARGET_SR)
    return mono;
  const ratio = srcRate / TARGET_SR;
  const outLen = Math.floor(mono.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = mono[idx] ?? 0;
    const b = mono[idx + 1] ?? 0;
    out[i] = a + frac * (b - a);
  }
  return out;
}
function detectFormat(buffer) {
  const view = new Uint8Array(buffer, 0, 4);
  if (view[0] === 82 && view[1] === 73 && view[2] === 70 && view[3] === 70)
    return "wav";
  if (view[0] === 73 && view[1] === 68 && view[2] === 51)
    return "mp3";
  if (view[0] === 255 && (view[1] & 224) === 224)
    return "mp3";
  return "unknown";
}
async function analyzeAudio(input) {
  const byteLength = input.byteLength ?? input.length;
  const nativeBuffer = new ArrayBuffer(byteLength);
  new Uint8Array(nativeBuffer).set(new Uint8Array(input));
  const fmt = detectFormat(nativeBuffer);
  let mono, sampleRate;
  if (fmt === "wav") {
    ({ mono, sampleRate } = decodeWav(nativeBuffer));
  } else if (fmt === "mp3") {
    ({ mono, sampleRate } = await decodeMp3(nativeBuffer));
  } else {
    throw new Error("Formato n\xE3o suportado. Use WAV ou MP3.");
  }
  const resampled = resample(mono, sampleRate);
  const mt = new import_music_tempo.default(resampled, { sampleRate: TARGET_SR });
  return {
    bpm: mt.tempo,
    // string in music-tempo v1.x
    beats: mt.beats
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  analyzeAudio
});
